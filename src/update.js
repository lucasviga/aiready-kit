import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import pc from 'picocolors';
import { ROOT, loadAll } from './catalog.js';
import { canSymlink, refresh, status, targetsFor } from './install.js';
import { syncAgentsMd, syncGlobalAgentsMd } from './agents.js';
import { HARNESS_IDS } from './harness.js';

export const REPO = 'github:lucasviga/aiready-kit';
export const SKIP_FETCH = '--skip-fetch';
const CLI = path.join(ROOT, 'bin', 'cli.js');
const SCOPES = ['global', 'project'];

export function version() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
}

function run(command, args) {
  return spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
}

/**
 * Gets the newest kit and re-runs `update --skip-fetch` with it, so the refresh uses the new files and code.
 *   git clone -> git pull, then re-run this CLI
 *   npx/npm   -> run the latest version from GitHub through npx
 * Returns { status } from the relaunched process, or { error } when the latest version could not be fetched.
 */
export function relaunchLatest(extraArgs = []) {
  const args = ['update', SKIP_FETCH, ...extraArgs];
  if (canSymlink()) {
    const pull = run('git', ['-C', ROOT, 'pull', '--ff-only']);
    if (pull.status !== 0) return { error: 'git pull failed — refreshing from the local copy instead.' };
    return { status: run(process.execPath, [CLI, ...args]).status ?? 1 };
  }
  const npx = run('npx', ['--yes', '--prefer-online', REPO, ...args]);
  if (npx.error) return { error: `Could not run npx (${npx.error.message}) — refreshing from the local copy instead.` };
  return { status: npx.status ?? 1 };
}

/** Refreshes every installed item, in every tool folder, globally and in this project. */
export function refreshAll(cwd = process.cwd()) {
  const { skills, rules } = loadAll();
  const items = [...skills, ...rules];
  const results = SCOPES.flatMap((scope) =>
    items.map((item) => ({ scope, ...refresh(item, { targets: targetsFor(scope, HARNESS_IDS, cwd) }) })),
  );
  const agents = [syncAgentsMd({ cwd, harnesses: [] }), ...syncGlobalAgentsMd(HARNESS_IDS)];
  const notInstalled = items.filter((item) => SCOPES.every((scope) => status(item, scope, { cwd }) === 'missing'));
  return { results: results.filter((r) => r.result !== 'not installed'), agents, notInstalled };
}

function where(r) {
  const rel = path.relative(process.cwd(), r.dest);
  return rel.startsWith('..') || path.isAbsolute(rel) ? r.dest.replace(os.homedir(), '~') : `./${rel}`;
}

function printRefresh({ results, agents, notInstalled }) {
  const updated = results.filter((r) => r.result === 'updated');
  for (const r of updated) console.log(`${pc.green('✔')} ${r.item.kind} ${pc.bold(r.item.id)} updated → ${pc.dim(where(r))}`);
  for (const a of agents.filter((x) => x.result !== 'unchanged')) console.log(`${pc.green('✔')} AGENTS.md ${a.result} → ${pc.dim(a.file)}`);
  if (!results.length) console.log(`${pc.yellow('•')} Nothing from aiready-kit is installed here or globally yet. Run the install first.`);
  else if (!updated.length) console.log(`${pc.green('✔')} ${pc.bold(`Everything is up to date (aiready-kit v${version()}).`)}`);
  else console.log(`\n${pc.green('✔')} ${pc.bold(`Updated ${updated.length} item(s) to aiready-kit v${version()}.`)}`);
  if (notInstalled.length && results.length) {
    console.log(pc.dim(`  Not installed yet: ${notInstalled.map((i) => `${i.kind} ${i.id}`).join(', ')} — run install to add them.`));
  }
}

/** `update` command: fetch the newest kit (unless skipFetch), then refresh what is installed. Returns the exit code. */
export function runUpdate({ skipFetch = false, extraArgs = [] } = {}) {
  if (!skipFetch) {
    console.log(pc.dim(`aiready-kit v${version()} — fetching the latest version from GitHub…`));
    const relaunched = relaunchLatest(extraArgs);
    if (!relaunched.error) return relaunched.status;
    console.log(`${pc.yellow('•')} ${relaunched.error}`);
  }
  printRefresh(refreshAll());
  return 0;
}
