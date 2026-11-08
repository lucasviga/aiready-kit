---
description: Keep AGENTS.md and CLAUDE.md as the project's map — folders, tech stack, ports, install, run, test and build commands. Always on.
---

# AGENTS.md / CLAUDE.md

`AGENTS.md` at the repository root is the single source of truth for every AI agent. `CLAUDE.md` contains only `@AGENTS.md`, so Claude Code reads the same file.

## Required sections

`AGENTS.md` must always have these sections:

1. **Project map**: every top-level folder and its important subfolders, one line each, saying what lives there.
2. **Tech stack**: every language, framework, database and major library, with its version.
3. **Services and ports**: each app or service, the port it runs on and its local URL.
4. **Install**: prerequisites (Node version, Docker…) and the commands to install dependencies and set up `.env`.
5. **Run**: how to start each service in development.
6. **Test**: how to run unit, integration and E2E tests, and coverage.
7. **Build**: how to build each service for production.

## Rules

- If a section is missing or outdated, fix it before (or as part of) your change.
- Update `AGENTS.md` in the same change that adds or moves a folder, a dependency, a port or a script.
- Take facts from the repository (`package.json` scripts, `docker-compose.yml`, `.env.example`, config files). Never invent commands or ports. Write `TODO` when something is unknown.
- Keep it short and scannable: tables and code blocks, no long prose.
- Never edit inside `<!-- aiready-kit:start -->` … `<!-- aiready-kit:end -->`. That block is generated.

## Template

````markdown
# <Project name>

<One sentence: what this project does.>

## Project map

| Path | Purpose |
|------|---------|
| `frontend/` | React app |
| `frontend/src/views/` | Screens |
| `backend/` | Node.js API |
| `backend/src/routes/` | HTTP routes |
| `e2e/` | Playwright end-to-end tests |

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 5, Tailwind 4, Vite 7 |
| Backend | Node.js 22, Fastify 5, Prisma 6 |
| Database | PostgreSQL 17 |
| Tests | Vitest, Playwright |

## Services and ports

| Service | Port | URL |
|---------|------|-----|
| frontend | 5173 | http://localhost:5173 |
| backend | 3000 | http://localhost:3000 |
| postgres | 5432 | — |

## Install

```bash
cp backend/.env.example backend/.env
npm ci --prefix frontend && npm ci --prefix backend
```

## Run

```bash
docker compose up -d postgres
npm run dev --prefix backend
npm run dev --prefix frontend
```

## Test

```bash
npm test --prefix backend
npm test --prefix frontend
npx --prefix e2e playwright test
```

## Build

```bash
npm run build --prefix backend
npm run build --prefix frontend
```
````
