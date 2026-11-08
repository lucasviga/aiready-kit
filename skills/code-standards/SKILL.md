---
name: code-standards
description: Apply and review code standards — file and function size limits, guard clauses, parameter objects, constants for magic values, variable placement, comments and secrets. Use when writing, refactoring or reviewing TypeScript/JavaScript code, or when the user asks for clean code, a code review or a refactor.
---

# Code standards

## Hard limits

| Rule | Limit |
|------|-------|
| Lines per file (`.ts`/`.tsx`) | ≤ 120 |
| Lines per function/method | ≤ 30 |
| Nested `if/else` depth | ≤ 2 (prefer guard clauses) |
| Parameters per function | ≤ 3 (else a parameter object) |
| Blank lines inside a function | 0 |
| Comments | only when code can't explain itself (e.g. complex regex) |
| Magic numbers/strings | 0 (use named constants) |
| Secrets in code | 0 (use `.env`) |

## Workflow

1. **Plan the split first.** Before writing, decide which files and functions the feature needs so none passes the limits.
2. **Write guard clauses first**, then the happy path, flat at the function's top level.
3. **Name things so comments become unnecessary.** Extract constants for every literal with meaning.
4. **Self-review** with the checklist below before you finish.

## Checklist

- [ ] Every file ≤ 120 lines and every function ≤ 30 lines
- [ ] No `if/else` nested deeper than 2; guard clauses used
- [ ] No function with more than 3 parameters
- [ ] No blank lines inside function bodies
- [ ] No magic numbers/strings; constants are named by meaning
- [ ] Variables declared next to their first use
- [ ] No comments that restate the code
- [ ] No secrets or environment-specific values in code
- [ ] The extra practices in `references/best-practices.md` were considered

## Resources (load only when needed)

| When you need… | Read |
|----------------|------|
| A bad → good example of any rule above | `references/examples.md` |
| The 10 extended practices (naming, SRP, immutability, errors…) | `references/best-practices.md` |
| To enforce the limits with a linter | `assets/eslint.config.js` |
