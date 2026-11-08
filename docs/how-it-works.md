# How it works

[← Back to README](../README.md)

## Rules vs. skills

| | Rules | Skills |
|---|---|---|
| **What** | One short Markdown file with must-follow rules | A folder: `SKILL.md` + `references/` + `assets/` |
| **When it loads** | Every session (or only for matching files, with `paths:`) | Only when the task matches the skill's `description` |
| **Use it for** | Things that must always hold (project map, folder layout) | Detailed how-to: examples, configs, best practices |
| **Installed to** | `.claude/rules/<name>.md` | `.claude/skills/<name>/` |

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

## Global vs. project

| | Global | This project |
|---|---|---|
| Goes to | `~/.claude/` | `./.claude/` |
| Applies to | Every project on your machine (Claude Code) | This repository, for everyone who clones it |
| Touches `AGENTS.md` / `CLAUDE.md` | No | Yes (see below) |

## AGENTS.md and CLAUDE.md

On a project install, the kit keeps a generated block in `./AGENTS.md` that links every installed rule and skill:

```markdown
<!-- aiready-kit:start -->
## AI coding rules
### Rules
- [agents-md](.claude/rules/agents-md.md) — Keep AGENTS.md … as the project's map …
- [folder-structure](.claude/rules/folder-structure.md) — Folder structure for frontend …
### Skills
- [react](.claude/skills/react/SKILL.md) — Build and review React …
<!-- aiready-kit:end -->
```

- Anything you write outside the markers is kept. The `agents-md` rule asks the agent to maintain the project map, stack, ports and the install/run/test/build commands there.
- If there is no `CLAUDE.md`, the kit creates one containing `@AGENTS.md`, so Claude Code reads the same file. It never edits a `CLAUDE.md` you wrote; it only shows a tip.
- Uninstalling everything removes the block, and removes the files too if the kit created them.
