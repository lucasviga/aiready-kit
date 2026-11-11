import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, TEMPLATES_DIR, SKILLS_DIR, RULES_DIR } from './catalog.js';
import { HARNESS_IDS, findHarness } from './harness.js';

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/**
 * Folders to write to, from the selected harnesses (see harness.js):
 *   project -> ./.claude, ./.cursor … for each harness that has one, plus ./.agents (linked from AGENTS.md)
 *   global  -> ~/.claude, ~/.cursor, ~/.agents … (rules only where the harness reads them)
 * Each target is { base, rules, ruleExt }.
 */
export function targetsFor(scope, harnessIds = HARNESS_IDS, cwd = process.cwd()) {
  const harnesses = harnessIds.map(findHarness).filter(Boolean);
  const list = scope === 'project' ? projectTargets(harnesses, cwd) : globalTargets(harnesses);
  return dedupe(list);
}

function projectTargets(harnesses, cwd) {
  const own = harnesses
    .filter((h) => h.project)
    .map((h) => ({ base: path.join(cwd, h.project.base), rules: true, ruleExt: h.project.ruleExt }));
  return [...own, { base: agentsBase(cwd), rules: true, ruleExt: '.md' }];
}

function globalTargets(harnesses) {
  return harnesses.map((h) => ({
    base: path.join(os.homedir(), h.global.base),
    rules: h.global.rules,
    ruleExt: '.md',
    keepBase: true,
  }));
}

function dedupe(targets) {
  const byBase = new Map();
  for (const t of targets) {
    const seen = byBase.get(t.base);
    byBase.set(t.base, seen ? { ...seen, rules: seen.rules || t.rules } : t);
  }
  return [...byBase.values()];
}

/** The project folder AGENTS.md links to. */
export function agentsBase(cwd = process.cwd()) {
  return path.join(cwd, '.agents');
}

export function pathIn(target, item) {
  if (item.kind === 'skill') return path.join(target.base, 'skills', item.id);
  return path.join(target.base, 'rules', `${item.id}${target.ruleExt || '.md'}`);
}

function supporting(item, targets) {
  return targets.filter((t) => item.kind === 'skill' || t.rules);
}

function destsFor(item, targets) {
  return supporting(item, targets).map((t) => pathIn(t, item));
}

/** Symlinks only make sense when running from a real clone (not an npx cache). */
export function canSymlink() {
  return fs.existsSync(path.join(ROOT, '.git'));
}

function statusAt(item, dest) {
  let stat;
  try {
    stat = fs.lstatSync(dest);
  } catch {
    return 'missing';
  }
  if (stat.isSymbolicLink()) {
    return fs.realpathSync(dest) === fs.realpathSync(item.source) ? 'linked' : 'conflict';
  }
  return 'installed';
}

/** First non-missing status across the targets of the given harnesses (default: all). */
export function status(item, scope, { harnesses, cwd } = {}) {
  const dests = destsFor(item, targetsFor(scope, harnesses, cwd));
  return dests.map((dest) => statusAt(item, dest)).find((s) => s !== 'missing') || 'missing';
}

/** Cursor rules are .mdc files with their own frontmatter. */
function toMdc(item) {
  const body = fs.readFileSync(item.source, 'utf8').replace(FRONTMATTER_RE, '').trimStart();
  const header = [
    '---',
    `description: ${JSON.stringify(item.description)}`,
    `globs: ${item.paths.join(',')}`,
    `alwaysApply: ${item.paths.length === 0}`,
    '---',
  ];
  return `${header.join('\n')}\n\n${body}`;
}

function place(item, dest, mode) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (dest.endsWith('.mdc')) return fs.writeFileSync(dest, toMdc(item));
  if (mode === 'link') return fs.symlinkSync(item.source, dest, item.kind === 'skill' ? 'dir' : 'file');
  if (item.kind === 'skill') return fs.cpSync(item.source, dest, { recursive: true });
  return fs.copyFileSync(item.source, dest);
}

export function install(item, { targets, mode = 'copy', force = false }) {
  const dests = destsFor(item, targets);
  if (!dests.length) {
    return { item, dest: null, dests, result: 'skipped', reason: 'none of the selected tools reads global rules' };
  }
  const current = dests.map((dest) => statusAt(item, dest)).find((s) => s !== 'missing');
  if (current && !force) {
    return { item, dest: dests[0], dests, result: 'skipped', reason: `already ${current} (use --force to overwrite)` };
  }
  for (const dest of dests) place(item, dest, mode);
  return { item, dest: dests[0], dests, result: mode === 'link' ? 'linked' : 'copied' };
}

function sameFile(a, b) {
  return fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b));
}

function sameTree(src, dest) {
  const list = (dir) => fs.readdirSync(dir, { recursive: true }).filter((f) => fs.statSync(path.join(dir, f)).isFile()).sort();
  const files = list(src);
  const destFiles = list(dest);
  if (files.join('\n') !== destFiles.join('\n')) return false;
  return files.every((f) => sameFile(path.join(src, f), path.join(dest, f)));
}

function isCurrent(item, dest) {
  if (dest.endsWith('.mdc')) return fs.readFileSync(dest, 'utf8') === toMdc(item);
  return item.kind === 'skill' ? sameTree(item.source, dest) : sameFile(item.source, dest);
}

/**
 * Re-copies an item where it is already installed (never into new folders).
 * Symlinks already point at the kit, so they are left alone.
 */
export function refresh(item, { targets }) {
  const dests = destsFor(item, targets).filter((dest) => statusAt(item, dest) !== 'missing');
  if (!dests.length) return { item, dest: null, dests, result: 'not installed' };
  const copies = dests.filter((dest) => statusAt(item, dest) === 'installed');
  if (!copies.length) return { item, dest: dests[0], dests, result: 'linked' };
  const stale = copies.filter((dest) => !isCurrent(item, dest));
  for (const dest of stale) place(item, dest, 'copy');
  return { item, dest: dests[0], dests, result: stale.length ? 'updated' : 'up to date' };
}

/** Removes the item from every target; empty rules/ and skills/ go too, and so does an empty project base. */
export function uninstall(item, { targets }) {
  const present = supporting(item, targets).filter((t) => statusAt(item, pathIn(t, item)) !== 'missing');
  const dests = present.map((t) => pathIn(t, item));
  if (!present.length) return { item, dest: destsFor(item, targets)[0] || null, dests, result: 'not installed' };
  for (const target of present) {
    const dest = pathIn(target, item);
    fs.rmSync(dest, { recursive: true, force: true });
    removeIfEmpty(path.dirname(dest));
    if (!target.keepBase) removeIfEmpty(target.base);
  }
  return { item, dest: dests[0], dests, result: 'removed' };
}

function removeIfEmpty(dir) {
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

export const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Scaffold a new skill or rule inside this repo from templates/. */
export function scaffold(kind, id, description = 'Describe what this does and when to use it.') {
  if (!NAME_RE.test(id)) throw new Error('Name must be kebab-case (e.g. my-skill).');
  const fill = (text) =>
    text.replaceAll('{{name}}', id).replaceAll('{{description}}', JSON.stringify(description.replace(/\n/g, ' ').trim()));

  if (kind === 'skill') {
    const dest = path.join(SKILLS_DIR, id);
    if (fs.existsSync(dest)) throw new Error(`Skill "${id}" already exists.`);
    fs.cpSync(path.join(TEMPLATES_DIR, 'skill'), dest, { recursive: true });
    for (const file of fs.readdirSync(dest, { recursive: true })) {
      const full = path.join(dest, file);
      if (file.endsWith('.md')) fs.writeFileSync(full, fill(fs.readFileSync(full, 'utf8')));
    }
    return path.join(dest, 'SKILL.md');
  }
  const dest = path.join(RULES_DIR, `${id}.md`);
  if (fs.existsSync(dest)) throw new Error(`Rule "${id}" already exists.`);
  fs.mkdirSync(RULES_DIR, { recursive: true });
  fs.writeFileSync(dest, fill(fs.readFileSync(path.join(TEMPLATES_DIR, 'rule.md'), 'utf8')));
  return dest;
}
