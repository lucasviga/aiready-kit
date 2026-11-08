---
name: javascript
description: Write and review modern JavaScript/TypeScript at the language level — no var, strict equality, strict typing without any, function declarations for main functions and arrows for callbacks, flat ternaries, and typed parameter/return objects. Use whenever writing or reviewing .js/.ts/.jsx/.tsx code, or setting up tsconfig/lint rules.
---

# JavaScript / TypeScript

## Rules at a glance

| Avoid | Prefer |
|-------|--------|
| `var x` | `const x` (or `let` if reassigned) |
| `a == b`, `a != b` | `a === b`, `a !== b` |
| untyped params, `any` | explicit types, `unknown` + narrowing |
| `const main = () => {}` | `function main() {}` |
| `items.map(function (i) {...})` | `items.map((item) => ...)` |
| `a ? b : c ? d : e` | guard clauses or a lookup map |
| `return [user, error]` | `return { user, error }` |

## Workflow

1. Turn on `strict` in `tsconfig.json` (see `assets/tsconfig.json`).
2. Declare the input and output types before you write the body.
3. Write top-level logic as named `function` declarations. Use arrows inside them for callbacks.
4. Run the linter (`no-var`, `eqeqeq`, `no-nested-ternary`, `@typescript-eslint/no-explicit-any`, `explicit-function-return-type`).

## Resources (load only when needed)

| When you need… | Read |
|----------------|------|
| Bad → good examples for each rule | `references/examples.md` |
| The 10 extended practices | `references/best-practices.md` |
| A strict `tsconfig.json` | `assets/tsconfig.json` |
