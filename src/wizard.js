import os from 'node:os';
import path from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { loadAll, pairOf } from './catalog.js';
import { syncAgentsMd, syncGlobalAgentsMd, importHint } from './agents.js';
import { install, uninstall, status, targetsFor, canSymlink, scaffold, NAME_RE } from './install.js';
import { HARNESSES, HARNESS_IDS, detectHarnesses } from './harness.js';
import { successMessage } from './summary.js';
import { runUpdate } from './update.js';

function bail(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

const truncate = (s, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const badge = (s) =>
  ({ linked: pc.cyan('linked'), installed: pc.green('installed'), conflict: pc.red('conflict') })[s] ||
  pc.dim('not installed');

const home = (dir) => dir.replace(os.homedir(), '~');
const here = (dir) => `./${path.relative(process.cwd(), dir)}`;

function scopeHint(scope, harnesses) {
  const bases = targetsFor(scope, harnesses).map((t) => t.base);
  if (scope === 'global') return `${bases.map(home).join(', ')} — every project`;
  return `${[...bases.map(here), 'AGENTS.md'].join(', ')} — commit them with the repo`;
}

async function chooseScope(harnesses = HARNESS_IDS) {
  return bail(
    await p.select({
      message: 'Where should it go?',
      options: [
        { value: 'project', label: 'This project', hint: scopeHint('project', harnesses) },
        { value: 'global', label: 'Global', hint: scopeHint('global', harnesses) },
      ],
    }),
  );
}

/** Lists the AI coding tools found on this machine; the user picks which ones to install for. */
async function chooseHarnesses() {
  const found = detectHarnesses();
  if (!found.length) p.log.warn('No AI coding tool detected on this machine. Pick the ones you use.');
  const choices = found.length ? found : HARNESSES;
  return bail(
    await p.multiselect({
      message: `${found.length ? `Found ${found.length} AI coding tool(s). ` : ''}Install for which ones? ${pc.dim('(space = toggle, a = all, enter = confirm)')}`,
      required: true,
      options: choices.map((h) => ({ value: h.id, label: h.label, hint: pc.dim(h.foundAt || 'not detected') })),
    }),
  );
}

async function installFlow() {
  const { skills, rules } = loadAll();
  const all = [...skills, ...rules];
  if (!all.length) return p.log.warn('The catalog is empty. Create one with "Create new" first.');
  const harnesses = await chooseHarnesses();
  const scope = await chooseScope(harnesses);
  const targets = targetsFor(scope, harnesses);
  const statusOf = (i) => status(i, scope, { harnesses });

  const picked = bail(
    await p.multiselect({
      message: `Pick what to install ${pc.dim('(space = toggle, a = all, enter = confirm)')}`,
      required: true,
      options: all.map((i) => ({
        value: i,
        label: `${i.kind === 'skill' ? pc.magenta('skill') : pc.blue('rule ')}  ${i.id}`,
        hint: `${badge(statusOf(i))} · ${truncate(i.description)}`,
      })),
    }),
  );

  const catalog = { skills, rules };
  const missingPairs = picked
    .map((i) => pairOf(i, catalog))
    .filter((pair) => pair && !picked.includes(pair) && statusOf(pair) === 'missing');
  if (missingPairs.length) {
    const addPairs = bail(
      await p.confirm({
        message: `Rules and skills work in pairs. Also install ${missingPairs.map((i) => `${i.kind} ${i.id}`).join(', ')}?`,
        initialValue: true,
      }),
    );
    if (addPairs) picked.push(...missingPairs);
  }

  let mode = 'copy';
  if (canSymlink()) {
    mode = bail(
      await p.select({
        message: 'Install mode',
        options: [
          { value: 'link', label: 'Symlink', hint: 'edits in this repo apply instantly (recommended for you)' },
          { value: 'copy', label: 'Copy', hint: 'standalone snapshot' },
        ],
      }),
    );
  }

  const existing = picked.filter((i) => statusOf(i) !== 'missing');
  let force = false;
  if (existing.length) {
    force = bail(
      await p.confirm({
        message: `${existing.map((i) => i.id).join(', ')} already exist. Overwrite?`,
        initialValue: false,
      }),
    );
  }

  const results = picked.map((item) => install(item, { targets, mode, force }));
  report(results);
  syncAgentFiles(scope, harnesses);
  const message = successMessage(results, harnesses);
  if (message) p.log.success(pc.green(pc.bold(message)));
  else p.log.warn('Nothing new was installed.');
}

function syncAgentFiles(scope, harnesses) {
  if (scope === 'project') return reportAgents(syncAgentsMd({ harnesses }));
  syncGlobalAgentsMd(harnesses).forEach(reportAgents);
}

async function menuOrExit() {
  const next = bail(
    await p.select({
      message: 'What next?',
      options: [
        { value: 'menu', label: 'Back to menu' },
        { value: 'exit', label: 'Exit' },
      ],
    }),
  );
  return next === 'exit';
}

async function uninstallFlow() {
  const { skills, rules } = loadAll();
  const scope = await chooseScope();
  const targets = targetsFor(scope);
  const installed = [...skills, ...rules].filter((i) => status(i, scope) !== 'missing');
  if (!installed.length) return p.log.info(`Nothing from this kit is installed ${scope === 'global' ? 'globally' : 'in this project'}.`);

  const picked = bail(
    await p.multiselect({
      message: 'Pick what to remove',
      required: true,
      options: installed.map((i) => ({ value: i, label: `${i.kind}  ${i.id}`, hint: badge(status(i, scope)) })),
    }),
  );
  const ok = bail(await p.confirm({ message: `Remove ${picked.length} item(s)?`, initialValue: false }));
  if (!ok) return p.log.info('Nothing removed.');
  report(picked.map((item) => uninstall(item, { targets })));
  syncAgentFiles(scope, HARNESS_IDS);
}

function statusFlow() {
  const { skills, rules } = loadAll();
  const lines = [];
  for (const [title, list] of [['Skills', skills], ['Rules', rules]]) {
    lines.push(pc.bold(title));
    if (!list.length) lines.push(pc.dim('  (none)'));
    for (const i of list) {
      lines.push(`  ${i.id.padEnd(28)} global: ${badge(status(i, 'global'))}   project: ${badge(status(i, 'project'))}`);
    }
    lines.push('');
  }
  p.note(lines.join('\n').trimEnd(), 'Catalog');
}

async function createFlow() {
  const kind = bail(
    await p.select({
      message: 'What do you want to create?',
      options: [
        { value: 'skill', label: 'Skill', hint: 'skills/<name>/SKILL.md — loaded on demand by Claude' },
        { value: 'rule', label: 'Rule', hint: 'rules/<name>.md — always-on instructions' },
      ],
    }),
  );
  const id = bail(
    await p.text({
      message: 'Name (kebab-case)',
      placeholder: kind === 'skill' ? 'review-pr' : 'typescript-style',
      validate: (v) => (NAME_RE.test(v || '') ? undefined : 'Use lowercase letters, numbers and dashes.'),
    }),
  );
  const description = bail(
    await p.text({
      message: kind === 'skill' ? 'When should Claude use it?' : 'One-line summary',
      placeholder: kind === 'skill' ? 'Use when the user asks to …' : 'Coding conventions for …',
      validate: (v) => (v?.trim() ? undefined : 'Required.'),
    }),
  );
  try {
    const file = scaffold(kind, id, description);
    p.log.success(`Created ${pc.cyan(file)}`);
    p.log.info(`Edit it, then run ${pc.cyan('npm run docs')} to update the README.`);
  } catch (e) {
    p.log.error(e.message);
  }
}

function reportAgents({ file, result, imports = [] }) {
  if (result !== 'unchanged') p.log.info(`AGENTS.md ${result} ${pc.dim(file)} — rules and skills are linked for any AI agent.`);
  imports.map(importHint).filter(Boolean).forEach((hint) => p.log.info(hint));
}

function report(results) {
  for (const r of results) {
    if (!r.dest) {
      p.log.warn(`${r.item.kind} ${pc.bold(r.item.id)} (${r.reason})`);
      continue;
    }
    const extra = r.dests?.length > 1 ? pc.dim(` (+ ${r.dests.slice(1).map((d) => path.relative(process.cwd(), d)).join(', ')})`) : '';
    const line = `${r.item.kind} ${pc.bold(r.item.id)} → ${pc.dim(r.dest)}${extra}`;
    if (r.result === 'skipped' || r.result === 'not installed') p.log.warn(`${line} (${r.reason || r.result})`);
    else p.log.success(`${line} (${r.result})`);
  }
}

export async function runWizard() {
  console.clear();
  p.intro(pc.bgMagenta(pc.black(' aiready-kit ')) + pc.dim('  skills & rules for AI coding agents'));

  while (true) {
    const action = bail(
      await p.select({
        message: 'What would you like to do?',
        options: [
          { value: 'install', label: 'Install skills / rules' },
          { value: 'status', label: 'Show status' },
          { value: 'update', label: 'Update to the latest version', hint: 'fetch the newest kit and refresh what is installed' },
          { value: 'uninstall', label: 'Uninstall' },
          { value: 'create', label: 'Create new skill / rule', hint: 'scaffold inside this repo' },
          { value: 'exit', label: 'Exit' },
        ],
      }),
    );
    if (action === 'exit') break;
    if (action === 'install') {
      await installFlow();
      if (await menuOrExit()) break;
    }
    if (action === 'update') {
      runUpdate();
      if (await menuOrExit()) break;
    }
    if (action === 'status') statusFlow();
    if (action === 'uninstall') await uninstallFlow();
    if (action === 'create') await createFlow();
  }

  p.outro(`Restart your AI coding tools (or open a new session) to pick up changes. ${pc.dim('Bye!')}`);
}
