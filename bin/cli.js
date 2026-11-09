#!/usr/bin/env node
import path from 'node:path';
import pc from 'picocolors';
import { loadAll, findItem } from '../src/catalog.js';
import { install, uninstall, status, scaffold, canSymlink } from '../src/install.js';
import { syncAgentsMd, CLAUDE_HINTS } from '../src/agents.js';

const HELP = `
${pc.bold('aiready-kit')} — install my AI coding skills & rules

${pc.bold('Usage')}
  aiready-kit                                   open the interactive wizard
  aiready-kit list                              list everything + install status
  aiready-kit install <skill|rule> <name...>    install items
  aiready-kit install all                       install every skill and rule
  aiready-kit uninstall <skill|rule> <name...>  remove items
  aiready-kit new <skill|rule> <name>           scaffold a new item in this repo
  aiready-kit agents                             regenerate ./AGENTS.md from ./.claude

${pc.bold('Options')}
  --project    target ./.claude and ./.agents instead of ~/.claude
  --link       symlink instead of copy (only from a git clone)
  --force      overwrite existing files
  --no-agents  don't update ./AGENTS.md after a --project install/uninstall
  -h, --help   show this help
`;

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('-')));
const [cmd, kind, ...names] = args.filter((a) => !a.startsWith('-'));
const scope = flags.has('--project') ? 'project' : 'global';

function fail(msg) {
  console.error(pc.red(`✖ ${msg}`));
  process.exit(1);
}

function resolveItems(kind, names) {
  if (kind === 'all') {
    const { skills, rules } = loadAll();
    return [...skills, ...rules];
  }
  if (kind !== 'skill' && kind !== 'rule') fail('Kind must be "skill", "rule" or "all".');
  if (!names.length) fail(`Give at least one ${kind} name. Run "aiready-kit list" to see them.`);
  return names.map((n) => findItem(kind, n) || fail(`Unknown ${kind}: ${n}`));
}

function syncAgents() {
  if (scope !== 'project' || flags.has('--no-agents')) return;
  printAgents(syncAgentsMd(), false);
}

function printAgents({ file, result, claude }, always = true) {
  if (always || result !== 'unchanged') console.log(`${pc.green('✔')} AGENTS.md ${result} → ${pc.dim(file)}`);
  if (CLAUDE_HINTS[claude]) console.log(`${claude === 'missing-import' ? pc.yellow('•') : pc.green('✔')} ${CLAUDE_HINTS[claude]}`);
}

function print(r) {
  const ok = !['skipped', 'not installed'].includes(r.result);
  const icon = ok ? pc.green('✔') : pc.yellow('•');
  const extra = r.dests?.length > 1 ? pc.dim(` + ${r.dests.slice(1).map((d) => path.relative(process.cwd(), d)).join(', ')}`) : '';
  console.log(`${icon} ${r.item.kind} ${pc.bold(r.item.id)} → ${pc.dim(r.dest)}${extra} (${r.reason || r.result})`);
}

async function main() {
  if (flags.has('-h') || flags.has('--help') || cmd === 'help') return console.log(HELP);

  switch (cmd) {
    case undefined: {
      if (!process.stdin.isTTY) return console.log(HELP);
      const { runWizard } = await import('../src/wizard.js');
      return runWizard();
    }
    case 'list':
    case 'ls': {
      const { skills, rules } = loadAll();
      for (const [title, list] of [['Skills', skills], ['Rules', rules]]) {
        console.log(pc.bold(`\n${title}`));
        if (!list.length) console.log(pc.dim('  (none)'));
        for (const i of list) {
          console.log(
            `  ${pc.cyan(i.id.padEnd(26))} [global: ${status(i, 'global')}, project: ${status(i, 'project')}]\n    ${pc.dim(i.description)}`,
          );
        }
      }
      return console.log();
    }
    case 'install':
    case 'i': {
      let mode = 'copy';
      if (flags.has('--link')) {
        if (!canSymlink()) fail('--link only works from a git clone of this repo.');
        mode = 'link';
      }
      const force = flags.has('--force');
      resolveItems(kind, names).forEach((item) => print(install(item, { scope, mode, force })));
      return syncAgents();
    }
    case 'uninstall':
    case 'rm':
      resolveItems(kind, names).forEach((item) => print(uninstall(item, { scope })));
      return syncAgents();
    case 'agents': {
      return printAgents(syncAgentsMd());
    }
    case 'new': {
      if (kind !== 'skill' && kind !== 'rule') fail('Usage: aiready-kit new <skill|rule> <name>');
      if (!names[0]) fail('Give the new item a name.');
      try {
        console.log(`${pc.green('✔')} Created ${scaffold(kind, names[0])}`);
      } catch (e) {
        fail(e.message);
      }
      return;
    }
    default:
      fail(`Unknown command "${cmd}".\n${HELP}`);
  }
}

main();
