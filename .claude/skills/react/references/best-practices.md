# React — 10 extended practices

1. **Derive state, don't duplicate it.** Store the minimum state and compute the rest during render (`const total = items.reduce(...)`). Duplicated state goes out of sync.

2. **Colocate state.** Keep state in the lowest component that needs it, and lift it only when siblings must share it. Global state is for truly global data (auth, theme).

3. **Use a server-state library.** Use TanStack Query (or SWR) inside your hooks for caching, retries, loading/error states and invalidation, instead of hand-written `useEffect` fetching.

4. **Stable, unique keys.** Use an entity id as `key`, never the array index, when the list can reorder, filter or grow.

5. **Composition over prop drilling.** Pass `children` or slot props. Reach for Context only when props would pass through more than 2 levels.

6. **Lazy-load routes and heavy components.** Use `React.lazy` + `Suspense` so each screen ships only its own code.

7. **Error boundaries per area.** Wrap views (or risky widgets) in an error boundary with a friendly fallback, so one crash doesn't blank the whole app.

8. **Typed forms with schema validation.** Use React Hook Form + Zod (or similar). Share the schema with the type (`z.infer`) and show accessible error messages linked with `aria-describedby`.

9. **Follow the Rules of Hooks with lint.** Enable `eslint-plugin-react-hooks` (rules-of-hooks + exhaustive-deps). Never call hooks conditionally, and never silence dependency warnings without a reason.

10. **Stable callbacks for memoized children.** When passing handlers to `React.memo` children, wrap them in `useCallback` (or rely on the React Compiler). Avoid creating new objects/arrays inline in props on hot paths.
