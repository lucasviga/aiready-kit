# Tests — 10 extended practices

1. **Name tests after requirements.** Write `it('locks the account after 5 failed attempts')`, not `it('test login 2')`. A failing test name should read like a bug report.

2. **Test behavior, not implementation.** Assert on public outputs and observable effects. Don't assert private methods or internal call order unless the order is the requirement. Refactors should not break tests.

3. **Mock only at the boundaries.** Replace network, database, clock and randomness. Don't mock your own pure functions. Over-mocking hides real bugs.

4. **Mock HTTP with MSW for integration tests.** Intercept requests at the network level (`msw`) instead of mocking `fetch`, so the real client code runs.

5. **Use test data builders and factories.** `buildOrder({ status: 'paid' })` with sensible defaults keeps Arrange short and shows only what matters for each test.

6. **Cover edge cases and error paths.** For each requirement, test the happy path, boundaries (0, empty, max), invalid input and failure of each dependency.

7. **Enforce coverage in CI.** Set `coverage.thresholds` to 80 (see `assets/vitest.config.ts`) so the build fails below the target. Never commit `.only` or unexplained `.skip`.

8. **Run tests in random order.** Use `sequence.shuffle: true` to expose hidden dependencies between tests early.

9. **Use a real database in integration tests.** Use Testcontainers or a disposable database, with a clean schema per test file and data reset in `beforeEach`. In-memory fakes miss SQL and constraint bugs.

10. **Use snapshots sparingly and fix flaky tests fast.** Use snapshots only for small, stable output and never as the only assertion. Fix or quarantine a flaky test the same day. A suite people don't trust gets ignored.
