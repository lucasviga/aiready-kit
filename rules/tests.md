---
description: Testing rules — 80% coverage prioritized by criticality, FIRST principles, AAA/Given-When-Then, test pyramid, Vitest + Playwright, root-level e2e folder. Always on.
skill: tests
---

# Tests

- All code is covered by automated tests, with **at least 80% coverage**. Prioritize the most critical flows first (e.g. the checkout journey matters more than registering a product category).
- Follow **FIRST**:
  - **Fast** — use test doubles (stubs) to replace slow or external dependencies (network, database, file system).
  - **Independent** — no test depends on another test's state or execution order.
  - **Repeatable** — same result on every run. Mock dates, random values and API responses that change per request.
  - **Self-validating** — strong assertions on behavior and outcomes, not only on "it returned something". A test must fail when the behavior breaks.
  - *Timely* is optional: write tests in whatever order makes the work most efficient.
- Structure every test as **Arrange / Act / Assert** (or Given / When / Then).
- Follow the **test pyramid**: many unit tests, fewer integration tests, few E2E tests.
- Use **Vitest** for unit and integration tests and **Playwright** for E2E.
- One behavior per test, driven by requirements. Don't mix different behaviors in one test.
- Frontend and backend each have comprehensive tests. E2E tests live **outside** both projects in a root-level `e2e/` folder.

For examples, configs and extended practices, load the `tests` skill.
