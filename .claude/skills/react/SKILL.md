---
name: react
description: Build and review React + TypeScript frontends — small functional components (≤30 lines), custom use* hooks for logic, services for API calls, explicit props (no spreading), minimal useEffect, useMemo for heavy work, accessibility (aria-*) and Tailwind. Use when creating or refactoring React components, hooks, screens or frontend folder structure.
---

# React

## Rules

- Write small, reusable, **functional** components of at most **30 lines**.
- Don't pass props with the spread operator (`<Button {...props} />`). Pass each prop explicitly.
- Avoid unnecessary `useEffect`. Derive values during render and handle user actions in event handlers.
- Use `useMemo` for heavy calculations and to avoid needless re-renders.
- Keep backend access out of components. API calls live in `services/`, and components consume them through hooks.
- Put component logic in custom hooks whose names start with `use` (`useCart`, `useCheckout`).
- Make components accessible: semantic HTML first, then `aria-*`, labels and keyboard support.
- Style with **Tailwind CSS**.
- Folder layout: follow the `folder-structure` rule.

## Workflow

1. **Locate the layer.** Is it a screen (`views/`), a reusable piece of UI (`components/`), logic or state (`hooks/`), backend access (`services/`) or a shared type (`types/`)?
2. **Service first.** Write the typed API function in `services/`.
3. **Hook second.** Wrap state, effects and service calls in a `use*` hook.
4. **Component last.** Keep it presentational: it receives data and callbacks and renders Tailwind-styled, accessible markup in ≤ 30 lines.
5. **Test.** Test hooks with `renderHook` and components with Testing Library queries by role.

## Data flow

```
view → hook (useOrders) → service (ordersService.list) → API
  ↓
components (OrderList, OrderCard) ← props only
```

## Checklist

- [ ] Every component is a function and ≤ 30 lines
- [ ] No `{...props}` spreading
- [ ] No `fetch`/axios inside components
- [ ] Every `useEffect` syncs with an external system (otherwise remove it)
- [ ] `useMemo` only around heavy calculations or referentially sensitive values
- [ ] Interactive elements are focusable and labeled (`aria-label`, `<label>`)
- [ ] Styles use Tailwind classes only

## Resources (load only when needed)

| When you need… | Read |
|----------------|------|
| Bad → good examples for each rule | `references/examples.md` |
| The full folder structure with sample files | `references/folder-structure.md` |
| The 10 extended practices | `references/best-practices.md` |
