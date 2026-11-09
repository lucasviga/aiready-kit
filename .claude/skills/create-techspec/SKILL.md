---
name: create-techspec
description: TechSpec — technical specification derived from an existing PRD. Use when the user asks for a TechSpec or the architecture of a feature that already has a PRD in `tasks/prd-*/prd.md`. Do not use without a PRD (create-prd) or to break it down into tasks (create-tasks).
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder in `./tasks/prd-*/`. The required PRD is `tasks/prd-[slug]/prd.md`; if it does not exist, stop and point to `/create-prd`.

The TechSpec defines the architecture, the components, the contracts and the tests of the solution. The problem, the goals and the scope are already in the PRD; reference it instead of repeating that information. Specify without implementing: include code only in the template's interface examples. Prefer a simple, evolvable architecture with clear interfaces.

## Workflow

1. **Analyze the PRD** — read it in full; extract requirements, acceptance criteria, constraints and success metrics.
   **Done when:** the requirements, the acceptance criteria, the constraints and the success metrics are identified.

2. **Explore the project** — read the `AGENTS.md` and all rules in `.agents/rules/`; use the Explore agent before asking the user anything. Examine the affected files and modules, the interfaces and integration points, callers and callees, the existing configuration, persistence, error handling, tests and infrastructure. Evaluate whether it is better to reuse existing libraries or build a new solution. Search the web for the documentation of the libraries involved and for open business rules.
   **Done when:** it is possible to name each new or modified component and indicate where it fits in the current code.

3. **Clarify** — ask the user questions using `AskUserQuestion` before drafting. Focus on what the exploration did not clarify: domain boundaries, data flow and contracts, external dependencies (failure modes, timeouts and idempotency), main interfaces and critical test scenarios.
   **Done when:** every question has an answer or an explicit assumption.

4. **Draft** — read this skill's `./references/TEMPLATE.md` in full and follow its structure exactly. In “Compliance with AGENTS.md and the rules”, confirm you have read the `AGENTS.md` and all rules in `.agents/rules/`. In “Skills compliance”, check only the applicable project skills in `.agents/skills/` and record deviations with justification. In “Testing approach”, define the applicable cases, named and identified by layer (`UT-*` for unit tests, `IT-*` for integration tests and `E2E-*` for E2E tests), linking each case to the acceptance criteria it verifies. When there is a coverage target, use the one defined in the `AGENTS.md` or in the project rules.
   **Done when:** every section of the template is filled in and each component from step 2 is specified.

5. **Save and report** — write the document to `tasks/prd-[slug]/techspec.md` and report the path with a one-line summary.
