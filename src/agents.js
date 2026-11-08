import fs from 'node:fs';
import path from 'node:path';
import { loadAll } from './catalog.js';
import { status, targetBase } from './install.js';

const START = '<!-- aiready-kit:start -->';
const END = '<!-- aiready-kit:end -->';
const BLOCK_RE = new RegExp(`\\n?${START}[\\s\\S]*?${END}\\n?`);
const DEFAULT_HEADER = '# AGENTS.md\n';

export function agentsFile(cwd = process.cwd()) {
  return path.join(cwd, 'AGENTS.md');
}

function installedInProject(cwd) {
  const { skills, rules } = loadAll();
  const present = (item) => status(item, 'project', cwd) !== 'missing';
  return { skills: skills.filter(present), rules: rules.filter(present) };
}

function relative(cwd, target) {
  return path.relative(cwd, target).split(path.sep).join('/');
}

function buildBlock(cwd, { skills, rules }) {
  const base = targetBase('project', cwd);
  const ruleLines = rules.map((r) => {
    const scope = r.paths.length ? ` _(applies to ${r.paths.map((p) => `\`${p}\``).join(', ')})_` : '';
    return `- [${r.id}](${relative(cwd, path.join(base, 'rules', `${r.id}.md`))}) — ${r.description}${scope}`;
  });
  const skillLines = skills.map(
    (s) => `- [${s.id}](${relative(cwd, path.join(base, 'skills', s.id, 'SKILL.md'))}) — ${s.description}`,
  );
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

/** Rewrites the managed block in ./AGENTS.md to match what is installed in ./.claude. */
export function syncAgentsMd(cwd = process.cwd()) {
  const file = agentsFile(cwd);
  const installed = installedInProject(cwd);
  const exists = fs.existsSync(file);
  const current = exists ? fs.readFileSync(file, 'utf8') : '';
  const isEmpty = !installed.skills.length && !installed.rules.length;
  if (isEmpty) {
    if (!exists) return { file, result: 'unchanged' };
    const stripped = current.replace(BLOCK_RE, '\n').trimEnd();
    if (!stripped || stripped === DEFAULT_HEADER.trim()) {
      fs.rmSync(file);
      return { file, result: 'removed' };
    }
    fs.writeFileSync(file, `${stripped}\n`);
    return { file, result: 'updated' };
  }
  const block = buildBlock(cwd, installed);
  const next = BLOCK_RE.test(current)
    ? current.replace(BLOCK_RE, `\n${block}\n`)
    : `${current.trimEnd() || DEFAULT_HEADER.trim()}\n\n${block}\n`;
  if (next === current) return { file, result: 'unchanged' };
  fs.writeFileSync(file, next);
  return { file, result: exists ? 'updated' : 'created' };
}
