import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, TEMPLATES_DIR, SKILLS_DIR, RULES_DIR } from './catalog.js';

/**
 * Where agents look for things:
 *   global  -> ~/.claude/{skills/<name>/, rules/<name>.md}
 *   project -> ./.claude/{skills/<name>/, rules/<name>.md}   (Claude Code)
 *              ./.agents/{skills/<name>/, rules/<name>.md}   (AGENTS.md-based workflows)
 * The first base is the primary one, used for status and listings.
 */
export function targetBases(scope, cwd = process.cwd()) {
  if (scope !== 'project') return [path.join(os.homedir(), '.claude')];
  return [path.join(cwd, '.claude'), path.join(cwd, '.agents')];
}

export function targetBase(scope, cwd) {
  return targetBases(scope, cwd)[0];
}

function pathIn(base, item) {
  return item.kind === 'skill' ? path.join(base, 'skills', item.id) : path.join(base, 'rules', `${item.id}.md`);
}

export function targetPaths(item, scope, cwd) {
  return targetBases(scope, cwd).map((base) => pathIn(base, item));
}

export function targetPath(item, scope, cwd) {
  return targetPaths(item, scope, cwd)[0];
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

export function status(item, scope, cwd) {
  return statusAt(item, targetPath(item, scope, cwd));
}

function place(item, dest, mode) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (mode === 'link') return fs.symlinkSync(item.source, dest, item.kind === 'skill' ? 'dir' : 'file');
  if (item.kind === 'skill') return fs.cpSync(item.source, dest, { recursive: true });
  return fs.copyFileSync(item.source, dest);
}

export function install(item, { scope = 'global', mode = 'copy', force = false, cwd } = {}) {
  const dests = targetPaths(item, scope, cwd);
  const current = dests.map((dest) => statusAt(item, dest)).find((s) => s !== 'missing');
  if (current && !force) {
    return { item, dest: dests[0], dests, result: 'skipped', reason: `already ${current} (use --force to overwrite)` };
  }
  for (const dest of dests) place(item, dest, mode);
  return { item, dest: dests[0], dests, result: mode === 'link' ? 'linked' : 'copied' };
}

export function uninstall(item, { scope = 'global', cwd } = {}) {
  const dests = targetPaths(item, scope, cwd);
  const present = dests.filter((dest) => statusAt(item, dest) !== 'missing');
  if (!present.length) return { item, dest: dests[0], dests, result: 'not installed' };
  for (const dest of present) {
    fs.rmSync(dest, { recursive: true, force: true });
    removeIfEmpty(path.dirname(dest));
    removeIfEmpty(path.dirname(path.dirname(dest)));
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
