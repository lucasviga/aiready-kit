import path from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { loadAll, pairOf } from './catalog.js';
import { syncAgentsMd, CLAUDE_HINTS } from './agents.js';
import { install, uninstall, status, targetBase, canSymlink, scaffold, NAME_RE } from './install.js';

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

async function chooseScope() {
  return bail(
    await p.select({
      message: 'Where should it go?',
      options: [
        { value: 'global', label: 'Global', hint: `${targetBase('global')} — every project` },
        { value: 'project', label: 'This project', hint: './.claude + ./.agents + AGENTS.md — commit them with the repo' },
      ],
    }),
  );
}

async function installFlow() {
  const { skills, rules } = loadAll();
  const scope = await chooseScope();
  const all = [...skills, ...rules];
  if (!all.length) return p.log.warn('The catalog is empty. Create one with "Create new" first.');

  const picked = bail(
    await p.multiselect({
      message: `Pick what to install ${pc.dim('(space = toggle, a = all, enter = confirm)')}`,
      required: true,
      options: all.map((i) => ({
        value: i,
        label: `${i.kind === 'skill' ? pc.magenta('skill') : pc.blue('rule ')}  ${i.id}`,
        hint: `${badge(status(i, scope))} · ${truncate(i.description)}`,
      })),
    }),
  );

  const catalog = { skills, rules };
  const missingPairs = picked
    .map((i) => pairOf(i, catalog))
    .filter((pair) => pair && !picked.includes(pair) && status(pair, scope) === 'missing');
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

  const existing = picked.filter((i) => status(i, scope) !== 'missing');
  let force = false;
  if (existing.length) {
    force = bail(
      await p.confirm({
        message: `${existing.map((i) => i.id).join(', ')} already exist. Overwrite?`,
        initialValue: false,
      }),
    );
  }

  const results = picked.map((item) => install(item, { scope, mode, force }));
  report(results);
  if (scope === 'project') reportAgents(syncAgentsMd());
}

async function uninstallFlow() {
  const { skills, rules } = loadAll();
  const scope = await chooseScope();
  const installed = [...skills, ...rules].filter((i) => status(i, scope) !== 'missing');
  if (!installed.length) return p.log.info(`Nothing from this kit is installed in ${targetBase(scope)}.`);

  const picked = bail(
    await p.multiselect({
      message: 'Pick what to remove',
      required: true,
      options: installed.map((i) => ({ value: i, label: `${i.kind}  ${i.id}`, hint: badge(status(i, scope)) })),
    }),
  );
  const ok = bail(await p.confirm({ message: `Remove ${picked.length} item(s)?`, initialValue: false }));
  if (!ok) return p.log.info('Nothing removed.');
  report(picked.map((item) => uninstall(item, { scope })));
  if (scope === 'project') reportAgents(syncAgentsMd());
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

function reportAgents({ file, result, claude }) {
  if (result !== 'unchanged') p.log.info(`AGENTS.md ${result} ${pc.dim(file)} — rules and skills are linked for any AI agent.`);
  if (CLAUDE_HINTS[claude]) p.log.info(CLAUDE_HINTS[claude]);
}

function report(results) {
  for (const r of results) {
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
          { value: 'uninstall', label: 'Uninstall' },
          { value: 'create', label: 'Create new skill / rule', hint: 'scaffold inside this repo' },
          { value: 'exit', label: 'Exit' },
        ],
      }),
    );
    if (action === 'exit') break;
    if (action === 'install') await installFlow();
    if (action === 'status') statusFlow();
    if (action === 'uninstall') await uninstallFlow();
    if (action === 'create') await createFlow();
  }

  p.outro(`Restart Claude Code (or open a new session) to pick up changes. ${pc.dim('Bye!')}`);
}
