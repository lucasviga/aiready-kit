---
description: Standard folder structure for frontend and backend projects — components, views, hooks, services, types on the frontend; routes, services, data, types on the backend; one type per file. Always on.
---

# Folder structure

Follow this structure and keep the **Project map** in `AGENTS.md` in sync with it (see the `agents-md` rule). You can add other folders when needed (`contexts/`, `utils/`, `workers/`…), but document them in `AGENTS.md`.

## Repository

```
repo/
  frontend/
  backend/
  e2e/          end-to-end tests, outside both projects
  AGENTS.md
  CLAUDE.md     contains only: @AGENTS.md
```

## Frontend

```
src/
  components/   small reusable UI components (one folder per component, its test beside it)
  views/        screens/pages composed of components
  hooks/        custom use* hooks holding state and logic
  services/     backend/API calls (the only place that talks to the backend)
  types/        shared types, one type per file
  assets/       images, fonts, icons
  tests/        shared test utilities (render helpers, factories)
```

Imports flow `views → components, hooks` and `hooks → services → types`. Components never import from `services/`.

## Backend

```
src/
  routes/       HTTP only: paths, request validation, status codes, calls a service
  services/     business rules and application behavior (no req/res, no queries)
  data/         data access: database queries, repositories, external API clients
  types/        one file per type
  config/       environment configuration
  shared/       cross-cutting code (logger, errors, graceful shutdown)
```

Dependencies flow `routes → services → data`, and every layer may import `types/`. Never import in the other direction.

## Rules

- **One type per file** in `types/`, with the file named after the type: `types/order.ts` exports `Order`, `types/order-status.ts` exports `OrderStatus`.
- Name files by feature and layer: `routes/orders.route.ts`, `services/orders.service.ts`, `data/orders.repository.ts`, `data/payment-gateway.client.ts`.
- Unit tests sit next to the file they test (`orders.service.test.ts`). E2E tests live in the root `e2e/` folder.
- A route never holds business rules or queries. A service never knows about HTTP. The data layer never holds business rules.
