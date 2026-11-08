# Node.js — 10 extended practices

1. **Validate env at startup.** Parse `process.env` with a schema (Zod) once and crash on boot if something is missing. Never discover a missing key at runtime.

2. **Validate every input at the boundary.** Validate body, query, params and headers with a schema before they reach services. Never trust client data.

3. **Centralized error handling.** Use custom error classes (`NotFoundError`, `ValidationError`) mapped to HTTP status in one error middleware. Log details server-side and return generic messages to clients.

4. **Handle process-level failures.** Listen to `unhandledRejection` and `uncaughtException`: log with the logger, then shut down gracefully and let the orchestrator restart the process.

5. **Structured logs with correlation.** Log JSON in production with a request id (from `AsyncLocalStorage`) on every line, at the right level, and never log secrets or personal data.

6. **Layered architecture.** `routes/` (HTTP) → `services/` (business rules) → `data/` (queries, external APIs). Business logic never touches `req`/`res`, and routes never run queries.

7. **Timeouts everywhere.** Give every outbound call a timeout (`fetch(url, { signal: AbortSignal.timeout(5000) })`) and every DB pool limits. A slow dependency must not hang the server.

8. **Security baseline.** Use `helmet` headers, rate limiting, CORS allow-lists, parameterized queries, `npm audit` in CI, and run as a non-root user in containers.

9. **Health checks.** Expose `/health/live` (the process is up) and `/health/ready` (dependencies reachable), and return 503 from readiness during shutdown.

10. **Run a supported LTS and pin it.** Pin it in `.nvmrc` and `engines`, use `"type": "module"` with the `node:` prefix for built-ins, and keep dependencies few and updated (Renovate/Dependabot).
