# JavaScript / TypeScript — 10 extended practices

1. **Nullish coalescing and optional chaining.** `user?.address?.city ?? 'Unknown'`. Use `??` instead of `||` when `0`, `''` or `false` are valid values.

2. **`unknown` over `any`, then narrow.** Use type guards (`typeof`, `in`, `instanceof`, or a custom `isX(value): value is X`) or schema validation (Zod) at the boundaries.

3. **Discriminated unions for state.** `type Result = { ok: true; data: User } | { ok: false; error: string }` makes impossible states impossible and lets `switch` be exhaustive (`never` check).

4. **`as const` and literal types instead of loose strings.** Use `const ROLES = ['admin', 'user'] as const; type Role = typeof ROLES[number];`, or enums for shared constants.

5. **Don't mutate arguments.** Return new objects and arrays (`{ ...user, name }`, `[...list, item]`, `toSorted()`, `toSpliced()`). Mark inputs `readonly` when possible.

6. **Destructure at the signature.** `function send({ to, subject }: Email)` documents what is used and pairs well with typed parameter objects.

7. **Async done right.** Use `async/await` with `try/catch` at the boundary and `Promise.all` for independent work (not sequential `await` in a loop). Never leave a floating promise (`no-floating-promises`).

8. **Template literals over concatenation.** Write `` `Hello, ${name}` `` instead of `'Hello, ' + name`.

9. **ES modules and named exports.** Use `import`/`export` with named exports for better refactoring and auto-imports. Avoid default exports and barrel files that create import cycles.

10. **Explicit return types on exported functions.** They are the module's contract. They catch accidental `any` and keep the type errors at the definition instead of at the call sites.
