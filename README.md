# aiready-kit

My personal **rules and skills for AI coding agents** ([Claude Code](https://claude.com/claude-code), plus any tool that reads `AGENTS.md`: Codex, Cursor, Copilot…), with a terminal wizard that installs them.

```
┌  aiready-kit   skills & rules for AI coding agents
│
◆  What would you like to do?
│  ● Install skills / rules
│  ○ Show status
│  ○ Uninstall
│  ○ Create new skill / rule (scaffold inside this repo)
│  ○ Exit
└
```

| Topic | Rule (always on, short) | Skill (on demand: examples, configs, +10 practices) |
|-------|-------------------------|-----------------------------------------------------|
| Code standards | [`code-standards`](rules/code-standards.md) | [`code-standards`](skills/code-standards/SKILL.md) |
| Tests | [`tests`](rules/tests.md) | [`tests`](skills/tests/SKILL.md) |
| React (frontend) | [`react`](rules/react.md) | [`react`](skills/react/SKILL.md) |
| Node.js (backend) | [`node`](rules/node.md) | [`node`](skills/node/SKILL.md) |
| JavaScript / TypeScript | [`javascript`](rules/javascript.md) | [`javascript`](skills/javascript/SKILL.md) |

## Quick start

You need **Node.js 18+**. Run this inside the project you want to set up:

```bash
npx github:lucasviga/aiready-kit
```

Pick what you want and where it goes:

- **This project**: installs into `./.claude/` and writes an `AGENTS.md` that links every installed rule and skill. Commit both.
- **Global**: installs into `~/.claude/` for every project on your machine (Claude Code).

Restart your agent or open a new session to load the changes.

### Command-line usage

```bash
npx github:lucasviga/aiready-kit list                          # what's available and what's installed
npx github:lucasviga/aiready-kit install all --project         # everything into this project + AGENTS.md
npx github:lucasviga/aiready-kit install rule react --project
npx github:lucasviga/aiready-kit install skill tests
npx github:lucasviga/aiready-kit uninstall skill tests
npx github:lucasviga/aiready-kit agents                        # regenerate ./AGENTS.md
```

| Flag          | Effect                                                        |
|---------------|---------------------------------------------------------------|
| `--project`   | Install into `./.claude` (and update `./AGENTS.md`) instead of `~/.claude` |
| `--link`      | Symlink instead of copy (only when running from a git clone)  |
| `--force`     | Overwrite items that are already installed                    |
| `--no-agents` | Don't touch `./AGENTS.md`                                      |

### Working from a clone (recommended for editing)

```bash
git clone git@github.com:lucasviga/aiready-kit.git
cd aiready-kit
npm install
npm start            # wizard; choose "Symlink" so edits apply instantly
npm link             # optional: makes `aiready-kit` available everywhere
```

## How it is structured

### Rules vs. skills

| | Rules | Skills |
|---|---|---|
| **What** | A short Markdown file with the non-negotiable rules | A folder: `SKILL.md` + `references/` + `assets/` |
| **When it loads** | Every session, or only for matching files when `paths:` is set (e.g. `react` → `*.tsx`) | On demand, when the task matches the skill's `description` |
| **Context cost** | Small. It's just the rule list. | Only the frontmatter until triggered, then `SKILL.md`, then single files as needed |
| **Installed to** | `.claude/rules/<name>.md` | `.claude/skills/<name>/` |

Each rule declares its skill in the frontmatter (`skill: react`) and ends with *"load the `react` skill"*. The agent follows the rule all the time and opens the skill only when it needs examples or details.

### Lazy loading (progressive disclosure)

```
skills/react/
  SKILL.md                     level 2: workflow, checklist, resource index (loaded when triggered)
  references/
    examples.md                level 3: read only when SKILL.md points to it
    best-practices.md          level 3: the 10 extended practices
    folder-structure.md        level 3
  assets/                      level 3: ready-to-copy files (configs, modules)
```

1. **Level 1, frontmatter:** `name` + `description` (~100 tokens). This is the only part the agent always sees, and it decides when the skill triggers.
2. **Level 2, `SKILL.md`:** a short workflow, a checklist and a *"When you need… → Read"* table.
3. **Level 3, resources:** examples, extended practices and templates, read one file at a time and only when needed.

### AGENTS.md

When you install with `--project` (or choose *This project* in the wizard), the kit keeps this block up to date in `./AGENTS.md`:

```markdown
<!-- aiready-kit:start -->
## AI coding rules
Read and follow every rule below before changing code in this repository. …
### Rules
- [code-standards](.claude/rules/code-standards.md) — Core code standards …
- [react](.claude/rules/react.md) — React frontend rules … _(applies to `**/*.tsx`, `**/*.jsx`)_
### Skills
- [react](.claude/skills/react/SKILL.md) — Build and review React + TypeScript frontends …
<!-- aiready-kit:end -->
```

Anything you write outside the markers is kept. If `AGENTS.md` doesn't exist, the kit creates it.

## Catalog

<!-- CATALOG:START -->
<!-- Generated by `npm run docs` — edit the skills/rules, not this section. -->

### Rules (5)

| Name | Description |
|------|-------------|
| [`code-standards`](#code-standards-rule) | Core code standards — size limits, guard clauses, parameter objects, no magic values, no secrets. Always on. |
| [`javascript`](#javascript-rule) | JavaScript/TypeScript language rules — no var, strict equality, always typed, arrow functions only for callbacks, no nested ternaries, typed parameter and return objects. |
| [`node`](#node-rule) | Node.js backend rules — async/await, never block the event loop, dotenv config, graceful shutdown, centralized logger, committed lockfile, no circular dependencies. |
| [`react`](#react-rule) | React frontend rules — small components, hooks for logic, services for API calls, no prop spreading, minimal useEffect, accessibility, Tailwind and a standard folder structure. |
| [`tests`](#tests-rule) | Testing rules — 80% coverage prioritized by criticality, FIRST principles, AAA/Given-When-Then, test pyramid, Vitest + Playwright, root-level e2e folder. Always on. |

### Skills (6)

| Name | Description |
|------|-------------|
| [`code-standards`](#code-standards-skill) | Apply and review code standards — file and function size limits, guard clauses, parameter objects, constants for magic values, variable placement, comments and secrets. Use when writing, refactoring or reviewing TypeScript/JavaScript code, or when the user asks for clean code, a code review or a refactor. |
| [`conventional-commits`](#conventional-commits-skill) | Write git commit messages following the Conventional Commits spec. Use when the user asks to commit, write a commit message, or squash/reword commits. |
| [`javascript`](#javascript-skill) | Write and review modern JavaScript/TypeScript at the language level — no var, strict equality, strict typing without any, function declarations for main functions and arrows for callbacks, flat ternaries, and typed parameter/return objects. Use whenever writing or reviewing .js/.ts/.jsx/.tsx code, or setting up tsconfig/lint rules. |
| [`node`](#node-skill) | Build and review Node.js + TypeScript backends — async/await, non-blocking event loop (worker threads for heavy work), dotenv configuration, graceful shutdown, a centralized logger adapter, lockfiles and no circular dependencies. Use when creating or changing a Node.js API, server, worker or CLI, or when setting up backend infrastructure code. |
| [`react`](#react-skill) | Build and review React + TypeScript frontends — small functional components (≤30 lines), custom use* hooks for logic, services for API calls, explicit props (no spreading), minimal useEffect, useMemo for heavy work, accessibility (aria-*) and Tailwind. Use when creating or refactoring React components, hooks, screens or frontend folder structure. |
| [`tests`](#tests-skill) | Write and review automated tests with Vitest (unit/integration) and Playwright (E2E) following FIRST, AAA/Given-When-Then, the test pyramid and an 80% coverage target prioritized by business criticality. Use when writing code that needs tests, adding or fixing tests, setting up a test suite, raising coverage, or reviewing test quality. |

## Install guides

### `code-standards` rule

Core code standards — size limits, guard clauses, parameter objects, no magic values, no secrets. Always on.

**Loads for:** every session (always on)

**Pairs with:** skill [`code-standards`](#code-standards-skill) — install both for best results.

**Source:** [`rules/code-standards.md`](rules/code-standards.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **rule code-standards**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install rule code-standards             # global (~/.claude/rules)
npx github:lucasviga/aiready-kit install rule code-standards --project   # this project (./.claude/rules + AGENTS.md)
```

**Manual:**

```bash
mkdir -p ~/.claude/rules
curl -fsSL https://raw.githubusercontent.com/lucasviga/aiready-kit/main/rules/code-standards.md -o ~/.claude/rules/code-standards.md
```

**Use it:** Claude Code loads rules from `.claude/rules` automatically (check with `/memory`). Other agents (Codex, Cursor, Copilot…) find it through the project's `AGENTS.md`.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall rule code-standards` or `rm ~/.claude/rules/code-standards.md`

</details>

### `javascript` rule

JavaScript/TypeScript language rules — no var, strict equality, always typed, arrow functions only for callbacks, no nested ternaries, typed parameter and return objects.

**Loads for:** every session (always on)

**Pairs with:** skill [`javascript`](#javascript-skill) — install both for best results.

**Source:** [`rules/javascript.md`](rules/javascript.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **rule javascript**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install rule javascript             # global (~/.claude/rules)
npx github:lucasviga/aiready-kit install rule javascript --project   # this project (./.claude/rules + AGENTS.md)
```

**Manual:**

```bash
mkdir -p ~/.claude/rules
curl -fsSL https://raw.githubusercontent.com/lucasviga/aiready-kit/main/rules/javascript.md -o ~/.claude/rules/javascript.md
```

**Use it:** Claude Code loads rules from `.claude/rules` automatically (check with `/memory`). Other agents (Codex, Cursor, Copilot…) find it through the project's `AGENTS.md`.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall rule javascript` or `rm ~/.claude/rules/javascript.md`

</details>

### `node` rule

Node.js backend rules — async/await, never block the event loop, dotenv config, graceful shutdown, centralized logger, committed lockfile, no circular dependencies.

**Loads for:** every session (always on)

**Pairs with:** skill [`node`](#node-skill) — install both for best results.

**Source:** [`rules/node.md`](rules/node.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **rule node**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install rule node             # global (~/.claude/rules)
npx github:lucasviga/aiready-kit install rule node --project   # this project (./.claude/rules + AGENTS.md)
```

**Manual:**

```bash
mkdir -p ~/.claude/rules
curl -fsSL https://raw.githubusercontent.com/lucasviga/aiready-kit/main/rules/node.md -o ~/.claude/rules/node.md
```

**Use it:** Claude Code loads rules from `.claude/rules` automatically (check with `/memory`). Other agents (Codex, Cursor, Copilot…) find it through the project's `AGENTS.md`.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall rule node` or `rm ~/.claude/rules/node.md`

</details>

### `react` rule

React frontend rules — small components, hooks for logic, services for API calls, no prop spreading, minimal useEffect, accessibility, Tailwind and a standard folder structure.

**Loads for:** `**/*.tsx`, `**/*.jsx`

**Pairs with:** skill [`react`](#react-skill) — install both for best results.

**Source:** [`rules/react.md`](rules/react.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **rule react**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install rule react             # global (~/.claude/rules)
npx github:lucasviga/aiready-kit install rule react --project   # this project (./.claude/rules + AGENTS.md)
```

**Manual:**

```bash
mkdir -p ~/.claude/rules
curl -fsSL https://raw.githubusercontent.com/lucasviga/aiready-kit/main/rules/react.md -o ~/.claude/rules/react.md
```

**Use it:** Claude Code loads rules from `.claude/rules` automatically (check with `/memory`). Other agents (Codex, Cursor, Copilot…) find it through the project's `AGENTS.md`.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall rule react` or `rm ~/.claude/rules/react.md`

</details>

### `tests` rule

Testing rules — 80% coverage prioritized by criticality, FIRST principles, AAA/Given-When-Then, test pyramid, Vitest + Playwright, root-level e2e folder. Always on.

**Loads for:** every session (always on)

**Pairs with:** skill [`tests`](#tests-skill) — install both for best results.

**Source:** [`rules/tests.md`](rules/tests.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **rule tests**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install rule tests             # global (~/.claude/rules)
npx github:lucasviga/aiready-kit install rule tests --project   # this project (./.claude/rules + AGENTS.md)
```

**Manual:**

```bash
mkdir -p ~/.claude/rules
curl -fsSL https://raw.githubusercontent.com/lucasviga/aiready-kit/main/rules/tests.md -o ~/.claude/rules/tests.md
```

**Use it:** Claude Code loads rules from `.claude/rules` automatically (check with `/memory`). Other agents (Codex, Cursor, Copilot…) find it through the project's `AGENTS.md`.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall rule tests` or `rm ~/.claude/rules/tests.md`

</details>

### `code-standards` skill

Apply and review code standards — file and function size limits, guard clauses, parameter objects, constants for magic values, variable placement, comments and secrets. Use when writing, refactoring or reviewing TypeScript/JavaScript code, or when the user asks for clean code, a code review or a refactor.

**Pairs with:** rule [`code-standards`](#code-standards-rule) — install both for best results.

**Files** (only `SKILL.md` is loaded when the skill triggers; the rest are read on demand):

- [`SKILL.md`](skills/code-standards/SKILL.md)
- [`assets/eslint.config.js`](skills/code-standards/assets/eslint.config.js)
- [`references/best-practices.md`](skills/code-standards/references/best-practices.md)
- [`references/examples.md`](skills/code-standards/references/examples.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **skill code-standards**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install skill code-standards             # global (~/.claude/skills)
npx github:lucasviga/aiready-kit install skill code-standards --project   # this project (./.claude/skills + AGENTS.md)
```

**Manual** (copies the whole folder, including `references/` and `assets/`):

```bash
git clone --depth 1 https://github.com/lucasviga/aiready-kit.git /tmp/aiready-kit
mkdir -p ~/.claude/skills && cp -R /tmp/aiready-kit/skills/code-standards ~/.claude/skills/
```

**Use it:** the agent loads it when the task matches the description, or call it with `/code-standards` in Claude Code.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall skill code-standards` or `rm -rf ~/.claude/skills/code-standards`

</details>

### `conventional-commits` skill

Write git commit messages following the Conventional Commits spec. Use when the user asks to commit, write a commit message, or squash/reword commits.

**Files** (only `SKILL.md` is loaded when the skill triggers; the rest are read on demand):

- [`SKILL.md`](skills/conventional-commits/SKILL.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **skill conventional-commits**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install skill conventional-commits             # global (~/.claude/skills)
npx github:lucasviga/aiready-kit install skill conventional-commits --project   # this project (./.claude/skills + AGENTS.md)
```

**Manual** (copies the whole folder, including `references/` and `assets/`):

```bash
git clone --depth 1 https://github.com/lucasviga/aiready-kit.git /tmp/aiready-kit
mkdir -p ~/.claude/skills && cp -R /tmp/aiready-kit/skills/conventional-commits ~/.claude/skills/
```

**Use it:** the agent loads it when the task matches the description, or call it with `/conventional-commits` in Claude Code.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall skill conventional-commits` or `rm -rf ~/.claude/skills/conventional-commits`

</details>

### `javascript` skill

Write and review modern JavaScript/TypeScript at the language level — no var, strict equality, strict typing without any, function declarations for main functions and arrows for callbacks, flat ternaries, and typed parameter/return objects. Use whenever writing or reviewing .js/.ts/.jsx/.tsx code, or setting up tsconfig/lint rules.

**Pairs with:** rule [`javascript`](#javascript-rule) — install both for best results.

**Files** (only `SKILL.md` is loaded when the skill triggers; the rest are read on demand):

- [`SKILL.md`](skills/javascript/SKILL.md)
- [`assets/tsconfig.json`](skills/javascript/assets/tsconfig.json)
- [`references/best-practices.md`](skills/javascript/references/best-practices.md)
- [`references/examples.md`](skills/javascript/references/examples.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **skill javascript**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install skill javascript             # global (~/.claude/skills)
npx github:lucasviga/aiready-kit install skill javascript --project   # this project (./.claude/skills + AGENTS.md)
```

**Manual** (copies the whole folder, including `references/` and `assets/`):

```bash
git clone --depth 1 https://github.com/lucasviga/aiready-kit.git /tmp/aiready-kit
mkdir -p ~/.claude/skills && cp -R /tmp/aiready-kit/skills/javascript ~/.claude/skills/
```

**Use it:** the agent loads it when the task matches the description, or call it with `/javascript` in Claude Code.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall skill javascript` or `rm -rf ~/.claude/skills/javascript`

</details>

### `node` skill

Build and review Node.js + TypeScript backends — async/await, non-blocking event loop (worker threads for heavy work), dotenv configuration, graceful shutdown, a centralized logger adapter, lockfiles and no circular dependencies. Use when creating or changing a Node.js API, server, worker or CLI, or when setting up backend infrastructure code.

**Pairs with:** rule [`node`](#node-rule) — install both for best results.

**Files** (only `SKILL.md` is loaded when the skill triggers; the rest are read on demand):

- [`SKILL.md`](skills/node/SKILL.md)
- [`assets/env.ts`](skills/node/assets/env.ts)
- [`assets/graceful-shutdown.ts`](skills/node/assets/graceful-shutdown.ts)
- [`assets/logger.ts`](skills/node/assets/logger.ts)
- [`references/best-practices.md`](skills/node/references/best-practices.md)
- [`references/examples.md`](skills/node/references/examples.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **skill node**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install skill node             # global (~/.claude/skills)
npx github:lucasviga/aiready-kit install skill node --project   # this project (./.claude/skills + AGENTS.md)
```

**Manual** (copies the whole folder, including `references/` and `assets/`):

```bash
git clone --depth 1 https://github.com/lucasviga/aiready-kit.git /tmp/aiready-kit
mkdir -p ~/.claude/skills && cp -R /tmp/aiready-kit/skills/node ~/.claude/skills/
```

**Use it:** the agent loads it when the task matches the description, or call it with `/node` in Claude Code.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall skill node` or `rm -rf ~/.claude/skills/node`

</details>

### `react` skill

Build and review React + TypeScript frontends — small functional components (≤30 lines), custom use* hooks for logic, services for API calls, explicit props (no spreading), minimal useEffect, useMemo for heavy work, accessibility (aria-*) and Tailwind. Use when creating or refactoring React components, hooks, screens or frontend folder structure.

**Pairs with:** rule [`react`](#react-rule) — install both for best results.

**Files** (only `SKILL.md` is loaded when the skill triggers; the rest are read on demand):

- [`SKILL.md`](skills/react/SKILL.md)
- [`references/best-practices.md`](skills/react/references/best-practices.md)
- [`references/examples.md`](skills/react/references/examples.md)
- [`references/folder-structure.md`](skills/react/references/folder-structure.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **skill react**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install skill react             # global (~/.claude/skills)
npx github:lucasviga/aiready-kit install skill react --project   # this project (./.claude/skills + AGENTS.md)
```

**Manual** (copies the whole folder, including `references/` and `assets/`):

```bash
git clone --depth 1 https://github.com/lucasviga/aiready-kit.git /tmp/aiready-kit
mkdir -p ~/.claude/skills && cp -R /tmp/aiready-kit/skills/react ~/.claude/skills/
```

**Use it:** the agent loads it when the task matches the description, or call it with `/react` in Claude Code.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall skill react` or `rm -rf ~/.claude/skills/react`

</details>

### `tests` skill

Write and review automated tests with Vitest (unit/integration) and Playwright (E2E) following FIRST, AAA/Given-When-Then, the test pyramid and an 80% coverage target prioritized by business criticality. Use when writing code that needs tests, adding or fixing tests, setting up a test suite, raising coverage, or reviewing test quality.

**Pairs with:** rule [`tests`](#tests-rule) — install both for best results.

**Files** (only `SKILL.md` is loaded when the skill triggers; the rest are read on demand):

- [`SKILL.md`](skills/tests/SKILL.md)
- [`assets/playwright.config.ts`](skills/tests/assets/playwright.config.ts)
- [`assets/vitest.config.ts`](skills/tests/assets/vitest.config.ts)
- [`references/best-practices.md`](skills/tests/references/best-practices.md)
- [`references/e2e.md`](skills/tests/references/e2e.md)
- [`references/examples.md`](skills/tests/references/examples.md)

<details>
<summary>Install guide</summary>

**Wizard:** run `npx github:lucasviga/aiready-kit` → *Install skills / rules* → select **skill tests**.

**One command:**

```bash
npx github:lucasviga/aiready-kit install skill tests             # global (~/.claude/skills)
npx github:lucasviga/aiready-kit install skill tests --project   # this project (./.claude/skills + AGENTS.md)
```

**Manual** (copies the whole folder, including `references/` and `assets/`):

```bash
git clone --depth 1 https://github.com/lucasviga/aiready-kit.git /tmp/aiready-kit
mkdir -p ~/.claude/skills && cp -R /tmp/aiready-kit/skills/tests ~/.claude/skills/
```

**Use it:** the agent loads it when the task matches the description, or call it with `/tests` in Claude Code.

**Uninstall:** `npx github:lucasviga/aiready-kit uninstall skill tests` or `rm -rf ~/.claude/skills/tests`

</details>

<!-- CATALOG:END -->

## Adding your own

```bash
npm start                       # → "Create new skill / rule"
# or
node bin/cli.js new skill my-skill
node bin/cli.js new rule my-rule
```

1. Edit the generated files.
   - **Skill:** write a `description` that says *what* it does and *when* to use it (this is what triggers it). Keep `SKILL.md` short and move examples and details to `references/`, with templates in `assets/`.
   - **Rule:** keep it to the essential bullet list. Add `skill: <name>` to link its skill and `paths:` to load it only for matching files.
2. Run `npm run docs` to regenerate the catalog and install guides.
3. Commit and push.

## Repository layout

```
bin/cli.js            CLI entry point (wizard + commands)
src/                  catalog loading, install logic, AGENTS.md sync, wizard UI
rules/<name>.md       one file per rule
skills/<name>/        one folder per skill (SKILL.md + references/ + assets/)
templates/            templates used by "Create new"
scripts/gen-readme.js regenerates the Catalog section of this README
```

## License

[MIT](LICENSE)
