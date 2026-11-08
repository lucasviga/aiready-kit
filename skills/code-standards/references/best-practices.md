# Code standards — 10 extended practices

1. **Intention-revealing names.** Functions are verbs (`calculateTotal`), booleans read as questions (`isActive`, `hasAccess`, `canRetry`), collections are plural. If you need a comment to explain a name, rename it.

2. **Single responsibility.** If describing a function or file needs the word "and", split it. One reason to change per unit.

3. **Prefer pure functions.** Keep calculations free of side effects (I/O, mutation, globals). Push side effects to the edges (controllers, services) so the core is easy to test.

4. **Immutability by default.** Use `const`, `readonly` and return new objects/arrays (`[...items, item]`, `{ ...user, name }`) instead of mutating arguments.

5. **No boolean flag parameters.** `render(true)` hides intent. Split it into `renderCompact()` and `renderFull()`, or pass a named option in a parameter object.

6. **Fail fast, never swallow errors.** Validate inputs at the boundary and throw specific errors (`OrderNotFoundError`). Never write an empty `catch {}`. Either handle the error or rethrow it with context.

7. **DRY with the rule of three.** Duplicate once if you must; extract on the third occurrence. Premature abstraction is worse than small duplication.

8. **Composition over inheritance.** Combine small functions and objects instead of building deep class hierarchies. Inherit at most one level.

9. **Command–query separation.** A function either changes state (command) or returns data (query), not both. `getUser()` must never write to the database.

10. **Let tools enforce the rules.** Encode the limits in ESLint and Prettier (see `assets/eslint.config.js`) and run them in CI, so reviews focus on design instead of style. Delete dead code and unused exports instead of commenting them out. Git keeps the history.
