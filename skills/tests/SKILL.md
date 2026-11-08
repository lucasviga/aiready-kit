---
name: tests
description: Write and review automated tests with Vitest (unit/integration) and Playwright (E2E) following FIRST, AAA/Given-When-Then, the test pyramid and an 80% coverage target prioritized by business criticality. Use when writing code that needs tests, adding or fixing tests, setting up a test suite, raising coverage, or reviewing test quality.
---

# Tests

## Workflow

1. **Rank by criticality.** List the flows the change touches and test the riskiest first (payments, checkout, auth, data loss), then the rest, until coverage is ≥ 80%.
2. **Pick the pyramid level.** Use a unit test for logic, an integration test for module and database/HTTP boundaries, and E2E only for critical user journeys.
3. **Isolate.** Stub slow or external dependencies. Mock time, randomness and changing API data.
4. **Write AAA.** One behavior per test, with a name that states the requirement.
5. **Assert behavior strongly.** Check values, state changes and calls, not just "defined".
6. **Run** `vitest run --coverage` and make sure the thresholds pass.

## Project layout

```
frontend/   src/**/*.test.ts(x)    Vitest + Testing Library
backend/    src/**/*.test.ts       Vitest (unit) + *.int.test.ts (integration)
e2e/        tests/*.spec.ts        Playwright, outside both projects
```

## Checklist

- [ ] Critical flows covered first; total coverage ≥ 80%
- [ ] No real network, clock or randomness in unit tests
- [ ] Tests pass in any order and in isolation (`--sequence.shuffle`)
- [ ] Each test has Arrange / Act / Assert and checks one behavior
- [ ] Assertions would fail if the behavior broke
- [ ] E2E tests only for critical journeys and stored in `/e2e`

## Resources (load only when needed)

| When you need… | Read |
|----------------|------|
| Examples of FIRST, AAA, stubs, mocks and fake timers | `references/examples.md` |
| Playwright E2E structure and patterns | `references/e2e.md` |
| The 10 extended practices | `references/best-practices.md` |
| A Vitest config with 80% thresholds | `assets/vitest.config.ts` |
| A Playwright config for `/e2e` | `assets/playwright.config.ts` |
