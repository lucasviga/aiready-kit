---
description: React frontend rules — small components, hooks for logic, services for API calls, no prop spreading, minimal useEffect, accessibility, Tailwind and a standard folder structure.
skill: react
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React

- Write small, reusable, **functional** components of at most **30 lines**.
- Don't pass props with the spread operator (`<Button {...props} />`). Pass each prop explicitly.
- Avoid unnecessary `useEffect`. Derive values during render and handle user actions in event handlers.
- Use `useMemo` for heavy calculations and to avoid needless re-renders.
- Keep backend access out of components. API calls live in `services/`, and components consume them through hooks.
- Put component logic in custom hooks whose names start with `use` (`useCart`, `useCheckout`).
- Make components accessible: semantic HTML first, then `aria-*`, labels and keyboard support.
- Style with **Tailwind CSS**.

## Folder structure

```
src/
  components/   small reusable UI components
  views/        screens/pages composed from components
  hooks/        custom hooks (use*)
  services/     backend/API calls
  types/        shared TypeScript types
  assets/       images, fonts, icons
  tests/        shared test utilities (component tests sit next to the component)
```

More folders are allowed when needed (e.g. `contexts/`, `utils/`, `routes/`).

For examples and extended practices, load the `react` skill.
