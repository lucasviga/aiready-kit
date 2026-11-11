# How it works

[← Back to README](../README.md)

## Rules vs. skills

| | Rules | Skills |
|---|---|---|
| **What** | One short Markdown file with must-follow rules | A folder: `SKILL.md` + `references/` + `assets/` |
| **When it loads** | Every session (or only for matching files, with `paths:`) | Only when the task matches the skill's `description` |
| **Use it for** | Things that must always hold (project map, folder layout) | Detailed how-to: examples, configs, best practices |
| **Installed to** | `rules/<name>.md` in each tool's folder (`.mdc` for Cursor) | `skills/<name>/` in each tool's folder |

## Lazy loading

A skill is read in three steps, so the agent only spends context on what it needs:

```
skills/react/
  SKILL.md               2. rules, workflow, checklist, list of resources
  references/
    examples.md          3. read only when SKILL.md points to it
    best-practices.md    3.
  assets/                3. ready-to-copy files (configs, modules)
```

1. **Frontmatter** (`name` + `description`): always visible. It decides when the skill triggers.
2. **`SKILL.md`**: loaded when the skill triggers. It ends with a *"When you need… → Read"* table.
3. **Resources**: opened one file at a time, only when needed.

## Detected tools

The wizard looks for each tool's home folder, its binary on `PATH` or its macOS app, lists the tools it finds, and you pick which ones to install for (if none is found, it lists every supported tool). `install` on the command line uses `--harness=<ids>`, or every detected tool when the flag is absent. Run `aiready-kit detect` to see them.

| Tool | Detected by |
|------|-------------|
| Claude Code | `~/.claude`, `claude` |
| Cursor | `~/.cursor`, `cursor` / `cursor-agent`, `Cursor.app` |
| Codex | `~/.codex`, `codex`, `Codex.app` |
| GitHub Copilot CLI | `~/.copilot`, `copilot` |
| Gemini CLI | `~/.gemini`, `gemini` |

## Where files go

| Tool | This project | Global |
|------|--------------|--------|
| *(always, project only)* | `./.agents/` + `AGENTS.md` | — |
| Claude Code | `./.claude/` + `CLAUDE.md` (`@AGENTS.md`) | `~/.claude/` (rules + skills) |
| Cursor | `./.cursor/rules/*.mdc` + `./.cursor/skills/` | `~/.cursor/skills/` (Cursor keeps global rules in its settings) |
| Codex | `./.agents/` + `AGENTS.md` | `~/.agents/` + a block in `~/.codex/AGENTS.md` |
| GitHub Copilot CLI | `./.agents/` + `AGENTS.md` | `~/.copilot/skills/` |
| Gemini CLI | `./.agents/` + `AGENTS.md` + `GEMINI.md` (`@AGENTS.md`) | `~/.gemini/skills/` |

A rule is skipped for a global tool that has no rules folder. Uninstall removes items from every tool's folder, detected or not.

## Updating

`aiready-kit update` fetches the newest kit, then re-runs itself with the new code and rewrites every installed copy whose content changed, in the folders where it is already installed. Symlinked items already point at the kit and are left alone. `AGENTS.md` blocks are regenerated.

## Why both `.claude/` and `.agents/`

| Folder | Read by |
|--------|---------|
| `.claude/` | Claude Code, which loads `.claude/rules` and `.claude/skills` automatically |
| `.agents/` | `AGENTS.md`-based workflows, such as the spec-driven skills (`create-techspec`, `run-task`, `run-qa`, `run-review`), which read `.agents/rules/` and `.agents/skills/` |

A project install always writes `.agents/`, plus `.claude/` when Claude Code is selected, so every tool sees the same rules. Uninstall removes both. Commit both folders.

## AGENTS.md and CLAUDE.md

On a project install, the kit keeps a generated block in `./AGENTS.md` that links every installed rule and skill:

```markdown
<!-- aiready-kit:start -->
## AI coding rules
### Rules
- [agents-md](.agents/rules/agents-md.md) — Keep AGENTS.md … as the project's map …
- [folder-structure](.agents/rules/folder-structure.md) — Folder structure for frontend …
### Skills
- [react](.agents/skills/react/SKILL.md) — Build and review React …
<!-- aiready-kit:end -->
```

- Anything you write outside the markers is kept. The `agents-md` rule asks the agent to maintain the project map, stack, ports and the install/run/test/build commands there.
- If Claude Code (or Gemini CLI) is selected and there is no `CLAUDE.md` (or `GEMINI.md`), the kit creates one containing `@AGENTS.md`, so it reads the same file. It never edits one you wrote; it only shows a tip.
- Uninstalling everything removes the block, and removes the files too if the kit created them.
