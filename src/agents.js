import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadAll } from './catalog.js';
import { agentsBase, pathIn } from './install.js';
import { HARNESSES, HARNESS_IDS, findHarness } from './harness.js';

const START = '<!-- aiready-kit:start -->';
const END = '<!-- aiready-kit:end -->';
const BLOCK_RE = new RegExp(`\\n?${START}[\\s\\S]*?${END}\\n?`);
const DEFAULT_HEADER = '# AGENTS.md\n';
const AGENTS_IMPORT = '@AGENTS.md';

export function agentsFile(cwd = process.cwd()) {
  return path.join(cwd, 'AGENTS.md');
}

/** An import file (CLAUDE.md, GEMINI.md) should just import AGENTS.md. Create it if missing; never rewrite one the user wrote. */
function ensureImport(cwd, name) {
  const file = path.join(cwd, name);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `${AGENTS_IMPORT}\n`);
    return { name, result: 'created' };
  }
  const ok = fs.readFileSync(file, 'utf8').includes(AGENTS_IMPORT);
  return { name, result: ok ? 'ok' : 'missing-import' };
}

function removeImport(cwd, name) {
  const file = path.join(cwd, name);
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8').trim() !== AGENTS_IMPORT) return { name, result: 'ok' };
  fs.rmSync(file);
  return { name, result: 'removed' };
}

function importFiles(harnessIds) {
  return harnessIds.map(findHarness).map((h) => h?.importFile).filter(Boolean);
}

function installedIn(base) {
  const { skills, rules } = loadAll();
  const present = (item) => fs.existsSync(pathIn({ base }, item));
  return { skills: skills.filter(present), rules: rules.filter(present) };
}

function link(file, target) {
  return path.relative(path.dirname(file), target).split(path.sep).join('/');
}

function buildBlock(file, base, { skills, rules }) {
  const ruleLines = rules.map((r) => {
    const scope = r.paths.length ? ` _(applies to ${r.paths.map((p) => `\`${p}\``).join(', ')})_` : '';
    return `- [${r.id}](${link(file, pathIn({ base }, r))}) — ${r.description}${scope}`;
  });
  const skillLines = skills.map((s) => `- [${s.id}](${link(file, path.join(pathIn({ base }, s), 'SKILL.md'))}) — ${s.description}`);
  return [
    START,
    '## AI coding rules',
    '',
    'Read and follow every rule below before changing code in this repository.',
    'Skills hold detailed guidance, examples and templates: open a skill only when the task matches it, and open its `references/` and `assets/` files only when SKILL.md points you there.',
    '',
    '### Rules',
    '',
    ...(ruleLines.length ? ruleLines : ['_None installed._']),
    '',
    '### Skills',
    '',
    ...(skillLines.length ? skillLines : ['_None installed._']),
    '',
    '_Managed by [aiready-kit](https://github.com/lucasviga/aiready-kit). Edit outside this block; it is regenerated on install/uninstall._',
    END,
  ].join('\n');
}

/** Removes the managed block; deletes the file when nothing else is left. Returns the result. */
function stripBlock(file, current) {
  const stripped = current.replace(BLOCK_RE, '\n').trimEnd();
  if (!stripped || stripped === DEFAULT_HEADER.trim()) {
    fs.rmSync(file);
    return 'removed';
  }
  fs.writeFileSync(file, `${stripped}\n`);
  return 'updated';
}

/** Rewrites the managed block in `file` so it links every rule and skill installed in `base`. */
function syncBlock(file, base) {
  const installed = installedIn(base);
  const exists = fs.existsSync(file);
  const current = exists ? fs.readFileSync(file, 'utf8') : '';
  if (!installed.skills.length && !installed.rules.length) {
    return { file, result: exists && BLOCK_RE.test(current) ? stripBlock(file, current) : 'unchanged', empty: true };
  }
  const block = buildBlock(file, base, installed);
  const next = BLOCK_RE.test(current)
    ? current.replace(BLOCK_RE, `\n${block}\n`)
    : `${current.trimEnd() || DEFAULT_HEADER.trim()}\n\n${block}\n`;
  if (next === current) return { file, result: 'unchanged' };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, next);
  return { file, result: exists ? 'updated' : 'created' };
}

/**
 * Project: syncs ./AGENTS.md with ./.agents and makes CLAUDE.md / GEMINI.md import it
 * (only for the selected harnesses; once AGENTS.md is gone, import-only files are removed).
 */
export function syncAgentsMd({ cwd = process.cwd(), harnesses = HARNESS_IDS } = {}) {
  const res = syncBlock(agentsFile(cwd), agentsBase(cwd));
  if (res.result === 'removed') {
    const all = importFiles(HARNESSES.map((h) => h.id));
    return { ...res, imports: all.map((name) => removeImport(cwd, name)) };
  }
  if (res.empty) return { ...res, imports: [] };
  return { ...res, imports: importFiles(harnesses).map((name) => ensureImport(cwd, name)) };
}

/** Global: harnesses with a user-level AGENTS.md (Codex) get a block linking what is in their global base. */
export function syncGlobalAgentsMd(harnessIds = HARNESS_IDS) {
  return harnessIds
    .map(findHarness)
    .filter((h) => h?.agentsMd)
    .map((h) => syncBlock(path.join(os.homedir(), h.agentsMd), path.join(os.homedir(), h.global.base)));
}

/** One-line hint for an import file result, or null when there is nothing to say. */
export function importHint({ name, result }) {
  const hints = {
    created: `${name} created with \`${AGENTS_IMPORT}\` so it reads AGENTS.md too.`,
    removed: `${name} removed (it only imported AGENTS.md).`,
    'missing-import': `Tip: add a line \`${AGENTS_IMPORT}\` to your ${name} so it reads AGENTS.md.`,
  };
  return hints[result] || null;
}
