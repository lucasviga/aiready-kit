---
description: Core code standards — size limits, guard clauses, parameter objects, no magic values, no secrets. Always on.
skill: code-standards
---

# Code standards

- No comments unless the code cannot explain itself (e.g. a complex regular expression). Rename instead of commenting.
- A file (`.ts`/`.tsx`) has at most **120 lines**. Split it by responsibility when it grows.
- A function or method has at most **30 lines**. Extract smaller functions when the behavior is bigger.
- At most **2 levels** of nested `if/else`. Prefer guard clauses (early return).
- At most **3 parameters**. Beyond that, use a typed parameter object.
- No blank lines inside functions or methods. Blank lines between class members or functions are fine.
- Extract magic numbers and strings into named constants.
- Declare variables right before the code that uses them.
- Never hardcode sensitive data (keys, tokens, passwords, URLs with credentials). Read it from environment variables loaded from a `.env` file that is not committed.

For examples and extended practices, load the `code-standards` skill.
