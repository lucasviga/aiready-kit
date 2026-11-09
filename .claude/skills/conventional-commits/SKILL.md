---
name: conventional-commits
description: Write git commit messages following the Conventional Commits spec. Use when the user asks to commit, write a commit message, or squash/reword commits.
---

# Conventional Commits

## Format

```
<type>(<optional scope>): <short summary in imperative mood>

<optional body: what changed and why, wrapped at 72 chars>

<optional footer: BREAKING CHANGE: ..., Closes #123>
```

## Types

| type       | use for                                      |
|------------|----------------------------------------------|
| `feat`     | a new feature                                |
| `fix`      | a bug fix                                    |
| `docs`     | documentation only                           |
| `style`    | formatting, no code change                   |
| `refactor` | code change that neither fixes nor adds      |
| `perf`     | performance improvement                      |
| `test`     | adding or fixing tests                       |
| `build`    | build system or dependencies                 |
| `ci`       | CI configuration                             |
| `chore`    | maintenance that fits nowhere else           |

## Rules

1. Look at the staged diff (`git diff --staged`) before writing the message.
2. Summary line: max ~72 chars, imperative ("add", not "added"), no trailing period.
3. Pick the scope from the main folder/module touched (e.g. `feat(auth): ...`).
4. One logical change per commit. If the diff mixes concerns, suggest splitting it.
5. Use `!` after the type/scope and a `BREAKING CHANGE:` footer for breaking changes.

## Examples

```
feat(checkout): add Pix payment option
fix(api): return 404 when customer is not found
refactor!: drop support for Node 16

BREAKING CHANGE: Node 18 is now the minimum version.
```
