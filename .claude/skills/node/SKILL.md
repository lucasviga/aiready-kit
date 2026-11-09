---
name: node
description: Build and review Node.js + TypeScript backends — async/await, non-blocking event loop (worker threads for heavy work), dotenv configuration, graceful shutdown, a centralized logger adapter, lockfiles and no circular dependencies. Use when creating or changing a Node.js API, server, worker or CLI, or when setting up backend infrastructure code.
---

# Node.js (backend)

## Rules

- Prefer `async/await` over callbacks. Promisify callback APIs (`node:util` `promisify` or the `/promises` modules).
- Never block the event loop. Move heavy calculations (hashing, image processing, large JSON/CSV parsing, crypto) to `worker_threads`, a queue or streams. Never use `*Sync` APIs in request handlers.
- Put environment variables in a `.env` file loaded with the **dotenv** library. Commit only `.env.example`.
- Implement **graceful shutdown**: on `SIGTERM`/`SIGINT`, stop accepting connections, finish in-flight requests, close the database and queues, then exit, with a forced timeout.
- Log through a **centralized logger adapter** (e.g. `src/shared/logger.ts`). Never call `console.log` directly in application code.
- Commit the lockfile (`package-lock.json`, `pnpm-lock.yaml` or `yarn.lock`) and install with `npm ci` in CI.
- Avoid circular dependencies between modules. Check with `npx madge --circular src`.

## Workflow

1. **Config.** Load and validate env vars once at startup (`assets/env.ts`) and fail fast when one is missing.
2. **Logger.** Use the logger adapter (`assets/logger.ts`) everywhere. Swapping the library later touches one file.
3. **Server lifecycle.** Wire graceful shutdown (`assets/graceful-shutdown.ts`) before the first deploy.
4. **Handlers.** Use `async/await` end to end. Offload CPU-heavy work to a worker.
5. **Dependencies.** Commit the lockfile, install with `npm ci`, and run `npx madge --circular src` in CI.

## Layout

Follow the `folder-structure` rule:

```
src/
  routes/                    HTTP only: paths, validation, status codes → calls services
  services/                  business rules and application behavior
  data/                      database queries, repositories, external API clients
  types/                     one file per type
  config/env.ts              validated environment
  shared/logger.ts           logger adapter
  shared/graceful-shutdown.ts
  workers/                   worker_threads for CPU-heavy tasks
  server.ts                  creates the app, registers shutdown
.env.example
```

## Checklist

- [ ] No callbacks where a promise API exists
- [ ] No `*Sync` calls or heavy loops in request paths
- [ ] All configuration comes from `env.ts` (dotenv), with no `process.env` scattered around
- [ ] SIGTERM/SIGINT handled with a forced-exit timeout
- [ ] No direct `console.log` in application code
- [ ] Lockfile committed; `madge --circular` is clean

## Resources (load only when needed)

| When you need… | Read |
|----------------|------|
| Bad → good examples for each rule | `references/examples.md` |
| The 10 extended practices | `references/best-practices.md` |
| Validated dotenv config module | `assets/env.ts` |
| Logger adapter (pino behind an interface) | `assets/logger.ts` |
| Graceful shutdown helper | `assets/graceful-shutdown.ts` |
