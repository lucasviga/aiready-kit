---
name: run-review
description: Code review — review and stabilize the code of a feature for compliance with the project rules, adherence to the TechSpec and to the tasks, and tests, with a final report and verdict. Use when the user asks to review code, run a code review, validate compliance with the rules or fix problems found during the review. Do not use to validate behavior in QA (run-qa) or to implement new tasks.
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder in `./tasks/prd-*/`. Read the project's `AGENTS.md`. In `tasks/prd-[slug]/`, read `techspec.md` and `tasks.md`; consult `prd.md` only when necessary to clarify a requirement. Generate the `codereview.md` in the same folder.

Check the project rules and the TechSpec before pointing out any problem. Run the tests and validations required in the `AGENTS.md` before recording the verdict; the review can only be **APPROVED** when all applicable tests pass.

## Workflow

1. **Analyze** — read the `AGENTS.md`, all rules in `.agents/rules/`, the TechSpec (expected architecture) and the tasks (implemented scope). Load only the applicable project skills in `.agents/skills/`.
   **Done when:** the expected architecture, the scope, the rules and the applicable skills are clear.

2. **Rules compliance** — check each change against the applicable project rules in `.agents/rules/`. Record each violation and the corresponding rule.
   **Done when:** each change has been checked against the applicable rules.

3. **TechSpec adherence** — compare the implementation with what was specified:
   - [ ] Architecture as specified
   - [ ] Components, interfaces and contracts as defined
   - [ ] Data models as documented
   - [ ] Endpoints/APIs and integrations, when applicable, as specified

   **Done when:** each TechSpec decision has been confirmed as implemented or recorded as a justified deviation.

4. **Task completeness** — for each task marked as complete, verify that the code was implemented, the related acceptance criteria are tracked, the subtasks were completed and the task's tests are present. Functional validation of the criteria remains QA's responsibility.
   **Done when:** each task marked as complete meets the four points.

5. **Tests** — read the test, validation, build and coverage commands defined in the `AGENTS.md` and run the applicable commands inside each affected application. If any command requires the application to be running, prepare an isolated environment for the worktree: use an available port in the `30**` range (for example, `3000–3099`) for the backend, an available port in the `51**` range (for example, `5100–5199`) for the frontend and a dedicated range for each additional database or service. Check each port before starting the process; if it is taken, choose another one within the range. Configure the URLs between the services, record the ports and the processes started and do not assume commands or tools that are not defined in the project.
   **Done when:** all applicable commands defined in the `AGENTS.md` have been run, with tests passing and the minimum coverage met when applicable.

6. **Fix and revalidate** — for each problem found:
   - fix the root cause and adjust or create the necessary tests;
   - if the fix requires changing the PRD, the TechSpec or the scope, record the problem as a blocker and ask the user for a decision;
   - run the tests again and repeat the relevant checks.

   **Done when:** there are no blocking problems and the relevant tests and checks have been run again.

7. **Report** — generate the `codereview.md` following this skill's `./references/TEMPLATE.md`, with the verdict:
   - **APPROVED** — criteria met, tests passing, code compliant with the rules and the TechSpec.
   - **APPROVED WITH CAVEATS** — main criteria met; improvements recommended, but not blocking.
   - **REJECTED** — failing tests, serious pattern violation, lack of adherence to the TechSpec or security problem.

   **Done when:** the `codereview.md` is saved according to the template, with the verdict recorded.

8. **Shut down the environment** — shut down all services started by this run, terminate the processes gracefully and confirm that the ports, temporary databases, containers and other resources were released. Do not terminate processes belonging to another worktree or to the user. Do this cleanup also if the review is interrupted, blocked or rejected.
