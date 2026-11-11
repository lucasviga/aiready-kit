import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * AI coding tools ("harnesses") the kit can install into.
 *   home      folder in ~ that shows the tool is installed
 *   bins/apps binaries on PATH / macOS apps that also count as installed
 *   global    where it reads user-level skills (and rules, when `rules` is true)
 *   project   extra project folder it reads (every project install also writes ./.agents + AGENTS.md)
 *   agentsMd  user-level AGENTS.md it reads (gets a managed block linking global rules/skills)
 *   importFile project file that should import AGENTS.md
 */
export const HARNESSES = [
  {
    id: 'claude',
    label: 'Claude Code',
    home: '.claude',
    bins: ['claude'],
    apps: [],
    global: { base: '.claude', rules: true },
    project: { base: '.claude', ruleExt: '.md' },
    importFile: 'CLAUDE.md',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    home: '.cursor',
    bins: ['cursor', 'cursor-agent'],
    apps: ['Cursor.app'],
    global: { base: '.cursor', rules: false },
    project: { base: '.cursor', ruleExt: '.mdc' },
  },
  {
    id: 'codex',
    label: 'Codex',
    home: '.codex',
    bins: ['codex'],
    apps: ['Codex.app'],
    global: { base: '.agents', rules: true },
    agentsMd: '.codex/AGENTS.md',
  },
  {
    id: 'copilot',
    label: 'GitHub Copilot CLI',
    home: '.copilot',
    bins: ['copilot'],
    apps: [],
    global: { base: '.copilot', rules: false },
  },
  {
    id: 'gemini',
    label: 'Gemini CLI',
    home: '.gemini',
    bins: ['gemini'],
    apps: [],
    global: { base: '.gemini', rules: false },
    importFile: 'GEMINI.md',
  },
];

export const HARNESS_IDS = HARNESSES.map((h) => h.id);

export function findHarness(id) {
  return HARNESSES.find((h) => h.id === id);
}

function onPath(bin) {
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', ''] : [''];
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  return dirs.some((dir) => exts.some((ext) => fs.existsSync(path.join(dir, bin + ext))));
}

function appPath(app) {
  if (process.platform !== 'darwin') return null;
  return ['/Applications', path.join(os.homedir(), 'Applications')]
    .map((dir) => path.join(dir, app))
    .find((full) => fs.existsSync(full));
}

function whereFound(harness) {
  const homeDir = path.join(os.homedir(), harness.home);
  if (fs.existsSync(homeDir)) return `~/${harness.home}`;
  const bin = harness.bins.find(onPath);
  if (bin) return `${bin} on PATH`;
  return harness.apps.map(appPath).find(Boolean) || null;
}

/** Harnesses installed on this machine, each with `foundAt` describing the evidence. */
export function detectHarnesses() {
  return HARNESSES.map((h) => ({ ...h, foundAt: whereFound(h) })).filter((h) => h.foundAt);
}

/** Parses `--harness=claude,cursor`; returns null when the flag is absent. */
export function parseHarnessFlag(args) {
  const flag = args.find((a) => a.startsWith('--harness='));
  if (!flag) return null;
  const ids = flag.slice('--harness='.length).split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = ids.filter((id) => !findHarness(id));
  if (unknown.length) throw new Error(`Unknown harness: ${unknown.join(', ')}. Use: ${HARNESS_IDS.join(', ')}.`);
  return ids;
}

export function labels(ids) {
  return ids.map((id) => findHarness(id)?.label || id).join(', ');
}
