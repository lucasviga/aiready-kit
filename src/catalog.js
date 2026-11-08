import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SKILLS_DIR = path.join(ROOT, 'skills');
export const RULES_DIR = path.join(ROOT, 'rules');
export const TEMPLATES_DIR = path.join(ROOT, 'templates');

/** Minimal YAML frontmatter parser: flat `key: value` pairs plus simple `- item` lists. */
export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data = {};
  let listKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(unquote(item[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    if (value === '') {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = unquote(value);
      listKey = null;
    }
  }
  return data;
}

function unquote(v) {
  return v.trim().replace(/^(['"])(.*)\1$/, '$2');
}

export function loadSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map((d) => {
      const source = path.join(SKILLS_DIR, d.name);
      const meta = parseFrontmatter(fs.readFileSync(path.join(source, 'SKILL.md'), 'utf8'));
      return {
        kind: 'skill',
        id: d.name,
        name: meta.name || d.name,
        description: meta.description || '',
        source,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function loadRules() {
  if (!fs.existsSync(RULES_DIR)) return [];
  return fs
    .readdirSync(RULES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const source = path.join(RULES_DIR, f);
      const meta = parseFrontmatter(fs.readFileSync(source, 'utf8'));
      const id = f.replace(/\.md$/, '');
      return {
        kind: 'rule',
        id,
        name: meta.name || id,
        description: meta.description || '',
        paths: Array.isArray(meta.paths) ? meta.paths : meta.paths ? [meta.paths] : [],
        source,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function loadAll() {
  return { skills: loadSkills(), rules: loadRules() };
}

export function findItem(kind, id) {
  const list = kind === 'skill' ? loadSkills() : loadRules();
  return list.find((i) => i.id === id);
}
