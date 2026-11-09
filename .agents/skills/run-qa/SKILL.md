---
name: run-qa
description: "QA — validate and stabilize an implemented feature against the PRD, the TechSpec and the tasks: unit, integration and E2E tests with the available browser tool, accessibility, responsiveness, fixing the bugs found and a final report with evidence. Use when the user asks to run QA. Do not use to implement new tasks or to review the code (run-review)."
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder in `./tasks/prd-*/`. Read the project's `AGENTS.md`. In `tasks/prd-[slug]/`, read `prd.md`, `techspec.md` and `tasks.md`; generate and maintain the `qa.md` with the defects, the fixes, the regression tests and the evidence. Save all evidence from the browser tool in `tasks/prd-[slug]/evidences/`.

QA will only be **APPROVED** when all acceptance criteria of the PRD have been verified and are met. If you find bugs, fix them at the root cause, create regression tests and repeat the validation. For interface flows, use the browser tool available in the environment, such as Playwright MCP, Vercel Agent Browser or another equivalent tool.

## Workflow

1. **Analyze** — read the `AGENTS.md`, all rules in `.agents/rules/`, the PRD, the TechSpec and each task file; build a checklist with one verification item per acceptance criterion (`AC-*`) and link the corresponding test cases (`UT-*`, `IT-*` and `E2E-*`).
   **Done when:** there is one verification item and at least one test case linked to each acceptance criterion of the PRD.

2. **Prepare the environment** — bring up the services needed for validation in an isolated environment for the worktree. Use an available port in the `30**` range (for example, `3000–3099`) for the backend, an available port in the `51**` range (for example, `5100–5199`) for the frontend and a dedicated range for each additional database or service. Check each port before starting the process; if it is taken, choose another one within the range. Configure the URLs between the services, record the ports and the processes started and open the application through the available browser tool.
   **Done when:** the necessary services respond, the home page is loaded and the URLs and ports used are recorded.

3. **Test each flow (E2E)** — for each acceptance criterion with an interface flow, run the corresponding E2E case using the available browser tool and verify the expected result in the application state. When there is unexpected behavior, investigate the interface state, the browser console messages, the API requests and responses and the backend logs before recording or fixing the bug. Capture visual evidence, save it in `tasks/prd-[slug]/evidences/`, mark the result as PASSED or FAILED and record each failure in the `qa.md`.

   **Done when:** every acceptance criterion with an interface flow is marked as PASSED or FAILED, with evidence.

4. **Run the TechSpec test cases** — run the unit (`UT-*`) and integration (`IT-*`) test cases linked to the acceptance criteria, when applicable, using the commands defined in the `AGENTS.md` and in the applicable rules. When there is a coverage target defined by the project, verify it using the mechanisms available in the stack and record the result in the `qa.md`. Also record the result of each case in the checklist and each failure in the `qa.md`.
   **Done when:** all unit and integration test cases linked to the criteria have been run or are explicitly blocked.

5. **Check accessibility** — on each screen, use the available browser tool to test keyboard navigation and check labels and semantics:
   - [ ] Keyboard navigation (Tab, Enter, Esc)
   - [ ] Interactive elements with descriptive labels
   - [ ] Images with appropriate alternative text (`alt`)
   - [ ] Adequate color contrast
   - [ ] Forms with labels associated with the fields
   - [ ] Clear and accessible error messages
   - [ ] Fonts with appropriate size

   **Done when:** each item has been checked on each screen.

6. **Check visuals and responsiveness** — capture the main screens, save them in `tasks/prd-[slug]/evidences/`, cover the states (empty, with data and error) and the main breakpoints, and document the inconsistencies.
   **Done when:** the main states and breakpoints are captured and the inconsistencies are documented.

7. **Fix the bugs found** — for each bug recorded in the `qa.md`:
   - locate and fix the root cause, without masking the symptom;
   - create a regression test that fails without the fix;
   - record in the `qa.md` the status, the fix applied and the test created;
   - if the fix requires changing the PRD, the TechSpec or the scope, stop and ask the user for a decision.

   **Done when:** each bug recorded in the `qa.md` has a fix and a regression test, or is explicitly blocked by a user decision.

8. **Revalidate** — repeat the flows that failed, run the regression tests and verify the affected acceptance criteria again. If any validation fails, go back to step 7.
   **Done when:** all acceptance criteria are marked as PASSED, with no unresolved bugs.

9. **Report** — generate the `qa.md` following this skill's `./references/TEMPLATE.md`, including the fixed bugs, the regression tests and the final evidence.
   **Done when:** the `qa.md` is generated according to the template and updated with the final results.

10. **Shut down the environment** — shut down all services started by this run, terminate the processes gracefully and confirm that the ports, temporary databases, containers and other resources were released. Do not terminate processes belonging to another worktree or to the user. Do this cleanup also if QA is interrupted, blocked or rejected.
