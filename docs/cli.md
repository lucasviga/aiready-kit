# Command line

[← Back to README](../README.md)

Running `npx github:lucasviga/aiready-kit` with no arguments opens the wizard. You can also call commands directly:

| Command | What it does |
|---------|--------------|
| `list` | Show every rule and skill and where it's installed |
| `install all` | Install everything |
| `install rule <name...>` | Install one or more rules |
| `install skill <name...>` | Install one or more skills |
| `uninstall rule\|skill <name...>` | Remove items (`uninstall all` removes everything) |
| `agents` | Regenerate `./AGENTS.md` from what's installed in the project |
| `detect` | Show the AI coding tools found on this machine |
| `update` | Fetch the latest aiready-kit (`git pull` in a clone, otherwise `npx` from GitHub) and refresh every installed item, globally and in the current project |
| `new rule\|skill <name>` | Scaffold a new item in this repo (from a clone) |

| Flag | Effect |
|------|--------|
| `--project` | Install into this project (`./.agents` + `AGENTS.md`, plus `./.claude`, `./.cursor`…) instead of your home folder |
| `--harness=<ids>` | Tools to install for, comma-separated: `claude`, `cursor`, `codex`, `copilot`, `gemini`. Default: the ones detected on this machine (uninstall defaults to all) |
| `--link` | Symlink instead of copy (only from a git clone) |
| `--force` | Overwrite items that are already installed |
| `--skip-fetch` | With `update`: refresh from the local copy without fetching |
| `--no-agents` | Don't touch `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` or `~/.codex/AGENTS.md` |

## Examples

```bash
npx github:lucasviga/aiready-kit install all --project
npx github:lucasviga/aiready-kit install rule folder-structure --project
npx github:lucasviga/aiready-kit install skill react node tests
npx github:lucasviga/aiready-kit install all --project --harness=claude,cursor
npx github:lucasviga/aiready-kit uninstall skill tests
npx github:lucasviga/aiready-kit update
```

## Working from a clone

Use this when you edit the rules and skills yourself:

```bash
git clone git@github.com:lucasviga/aiready-kit.git
cd aiready-kit
npm install
npm start            # wizard; choose "Symlink" so edits apply instantly
npm link             # optional: run `aiready-kit` from anywhere
```
