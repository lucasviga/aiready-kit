---
description: JavaScript/TypeScript language rules — no var, strict equality, always typed, arrow functions only for callbacks, no nested ternaries, typed parameter and return objects.
skill: javascript
---

# JavaScript / TypeScript

- Never use `var`. Use `const` by default and `let` only when the value is reassigned.
- Always use strict equality: `===` and `!==`, never `==` and `!=`.
- Always use types. Write TypeScript in `strict` mode, with no implicit or explicit `any` (use `unknown` and narrow it).
- Use `function` declarations for main and top-level functions. Use arrow functions only for callbacks (`map`, `filter`, `reduce`, `then`, event handlers).
- Ternaries are allowed only without nesting. Use guard clauses or a lookup object for more branches.
- Always type parameters and return values. When a function takes or returns several values, use a typed object (`{ items, total }`) instead of positional arguments or tuples.

For examples and extended practices, load the `javascript` skill.
