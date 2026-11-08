---
name: node
description: Build and review Node.js + TypeScript backends — async/await, non-blocking event loop (worker threads for heavy work), dotenv configuration, graceful shutdown, a centralized logger adapter, lockfiles and no circular dependencies. Use when creating or changing a Node.js API, server, worker or CLI, or when setting up backend infrastructure code.
---

# Node.js (backend)

## Workflow

1. **Config.** Load and validate env vars once at startup (`assets/env.ts`) and fail fast when one is missing.
2. **Logger.** Use the logger adapter (`assets/logger.ts`) everywhere. Swapping the library later touches one file.
3. **Server lifecycle.** Wire graceful shutdown (`assets/graceful-shutdown.ts`) before the first deploy.
4. **Handlers.** Use `async/await` end to end. Offload CPU-heavy work to a worker.
5. **Dependencies.** Commit the lockfile, install with `npm ci`, and run `npx madge --circular src` in CI.

## Suggested layout

```
src/
  config/env.ts              validated environment
  shared/logger.ts           logger adapter
  shared/graceful-shutdown.ts
  modules/<feature>/         routes → controller → service → repository
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
