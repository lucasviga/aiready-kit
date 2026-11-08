---
description: Node.js backend rules — async/await, never block the event loop, dotenv config, graceful shutdown, centralized logger, committed lockfile, no circular dependencies.
skill: node
---

# Node.js (backend)

- Prefer `async/await` over callbacks. Promisify callback APIs (`node:util` `promisify` or the `/promises` modules).
- Never block the event loop. Move heavy calculations (hashing, image processing, large JSON/CSV parsing, crypto) to `worker_threads`, a queue or streams. Never use `*Sync` APIs in request handlers.
- Put environment variables in a `.env` file loaded with the **dotenv** library. Commit only `.env.example`.
- Implement **graceful shutdown**: on `SIGTERM`/`SIGINT`, stop accepting connections, finish in-flight requests, close the database and queues, then exit, with a forced timeout.
- Log through a **centralized logger adapter** (e.g. `src/shared/logger.ts`). Never call `console.log` directly in application code.
- Commit the lockfile (`package-lock.json`, `pnpm-lock.yaml` or `yarn.lock`) and install with `npm ci` in CI.
- Avoid circular dependencies between modules. Check with `npx madge --circular src`.

For examples, ready-to-use modules and extended practices, load the `node` skill.
