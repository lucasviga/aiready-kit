#!/usr/bin/env node
import path from 'node:path';
import pc from 'picocolors';
import { loadAll, findItem } from '../src/catalog.js';
import { install, uninstall, status, scaffold, canSymlink, targetsFor } from '../src/install.js';
import { syncAgentsMd, syncGlobalAgentsMd, importHint } from '../src/agents.js';
import { HARNESS_IDS, detectHarnesses, parseHarnessFlag, labels } from '../src/harness.js';
import { successMessage } from '../src/summary.js';
import { runUpdate, SKIP_FETCH } from '../src/update.js';

const HELP = `
${pc.bold('aiready-kit')} — install my AI coding skills & rules

${pc.bold('Usage')}
  aiready-kit                                   open the interactive wizard
  aiready-kit list                              list everything + install status
  aiready-kit install <skill|rule> <name...>    install items
  aiready-kit install all                       install every skill and rule
  aiready-kit uninstall <skill|rule> <name...>  remove items
  aiready-kit new <skill|rule> <name>           scaffold a new item in this repo
  aiready-kit agents                            regenerate ./AGENTS.md from ./.agents
  aiready-kit detect                            show the AI coding tools found on this machine
  aiready-kit update                            get the latest aiready-kit and refresh everything installed

${pc.bold('Options')}
  --project    install into this project (./.agents + AGENTS.md, plus ./.claude, ./.cursor…)
               instead of your home folder (~/.claude, ~/.cursor, ~/.agents…)
  --harness=<ids>  comma-separated tools to install for: ${HARNESS_IDS.join(', ')}
               (default: the ones detected on this machine; uninstall defaults to all)
  --link       symlink instead of copy (only from a git clone)
  --force      overwrite existing files
  --no-agents  don't update ./AGENTS.md after a --project install/uninstall
  --skip-fetch with update: refresh from the local copy without fetching the latest
  -h, --help   show this help
`;

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('-')));
const [cmd, kind, ...names] = args.filter((a) => !a.startsWith('-'));
const scope = flags.has('--project') ? 'project' : 'global';

function harnessesFor(command) {
  let picked;
  try {
    picked = parseHarnessFlag(args);
  } catch (e) {
    fail(e.message);
  }
  if (picked) return picked;
  if (command === 'uninstall') return HARNESS_IDS;
  const found = detectHarnesses().map((h) => h.id);
  return found.length ? found : ['claude'];
}

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

function syncAgents(harnesses) {
  if (flags.has('--no-agents')) return;
  if (scope === 'global') return syncGlobalAgentsMd(harnesses).forEach((r) => printAgents(r, false));
  printAgents(syncAgentsMd({ harnesses }), false);
}

function printAgents({ file, result, imports = [] }, always = true) {
  if (always || result !== 'unchanged') console.log(`${pc.green('✔')} AGENTS.md ${result} → ${pc.dim(file)}`);
  for (const imp of imports) {
    const hint = importHint(imp);
    if (hint) console.log(`${imp.result === 'missing-import' ? pc.yellow('•') : pc.green('✔')} ${hint}`);
  }
}

function print(r) {
  const ok = !['skipped', 'not installed'].includes(r.result);
  const icon = ok ? pc.green('✔') : pc.yellow('•');
  if (!r.dest) return console.log(`${pc.yellow('•')} ${r.item.kind} ${pc.bold(r.item.id)} (${r.reason})`);
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
      const harnesses = harnessesFor('install');
      const targets = targetsFor(scope, harnesses);
      const results = resolveItems(kind, names).map((item) => install(item, { targets, mode, force }));
      results.forEach(print);
      syncAgents(harnesses);
      const message = successMessage(results, harnesses);
      return console.log(message ? `\n${pc.green('✔')} ${pc.bold(message)}` : `\n${pc.yellow('•')} Nothing new was installed.`);
    }
    case 'uninstall':
    case 'rm': {
      const harnesses = harnessesFor('uninstall');
      const targets = targetsFor(scope, harnesses);
      resolveItems(kind, names).forEach((item) => print(uninstall(item, { targets })));
      return syncAgents(harnesses);
    }
    case 'agents':
      return printAgents(syncAgentsMd({ harnesses: harnessesFor('install') }));
    case 'detect': {
      const found = detectHarnesses();
      if (!found.length) return console.log(pc.yellow('• No AI coding tool detected. Use --harness=<ids> to pick one.'));
      for (const h of found) console.log(`${pc.green('✔')} ${h.label.padEnd(20)} ${pc.dim(h.foundAt)}`);
      return console.log(pc.dim(`\nInstalls will target: ${labels(found.map((h) => h.id))}`));
    }
    case 'update':
    case 'upgrade':
      process.exitCode = runUpdate({ skipFetch: flags.has(SKIP_FETCH) });
      return;
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
