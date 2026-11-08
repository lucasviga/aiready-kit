import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, TEMPLATES_DIR, SKILLS_DIR, RULES_DIR } from './catalog.js';

/**
 * Where Claude Code looks for things:
 *   global  -> ~/.claude/skills/<name>/SKILL.md   and ~/.claude/rules/<name>.md
 *   project -> ./.claude/skills/<name>/SKILL.md   and ./.claude/rules/<name>.md
 */
export function targetBase(scope, cwd = process.cwd()) {
  return scope === 'project' ? path.join(cwd, '.claude') : path.join(os.homedir(), '.claude');
}

export function targetPath(item, scope, cwd) {
  const base = targetBase(scope, cwd);
  return item.kind === 'skill'
    ? path.join(base, 'skills', item.id)
    : path.join(base, 'rules', `${item.id}.md`);
}

/** Symlinks only make sense when running from a real clone (not an npx cache). */
export function canSymlink() {
  return fs.existsSync(path.join(ROOT, '.git'));
}

export function status(item, scope, cwd) {
  const dest = targetPath(item, scope, cwd);
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

export function install(item, { scope = 'global', mode = 'copy', force = false, cwd } = {}) {
  const dest = targetPath(item, scope, cwd);
  const current = status(item, scope, cwd);
  if (current !== 'missing' && !force) {
    return { item, dest, result: 'skipped', reason: `already ${current} (use --force to overwrite)` };
  }
  if (current !== 'missing') fs.rmSync(dest, { recursive: true, force: true });

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (mode === 'link') {
    fs.symlinkSync(item.source, dest, item.kind === 'skill' ? 'dir' : 'file');
  } else if (item.kind === 'skill') {
    fs.cpSync(item.source, dest, { recursive: true });
  } else {
    fs.copyFileSync(item.source, dest);
  }
  return { item, dest, result: mode === 'link' ? 'linked' : 'copied' };
}

export function uninstall(item, { scope = 'global', cwd } = {}) {
  const dest = targetPath(item, scope, cwd);
  if (status(item, scope, cwd) === 'missing') return { item, dest, result: 'not installed' };
  fs.rmSync(dest, { recursive: true, force: true });
  removeIfEmpty(path.dirname(dest));
  removeIfEmpty(targetBase(scope, cwd));
  return { item, dest, result: 'removed' };
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
