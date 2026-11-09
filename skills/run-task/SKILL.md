---
name: run-task
description: Task — identify and implement the next task of a feature based on the PRD, the TechSpec and the tasks.md, marking it as done at the end. Use when the user asks to run, implement or start a task/subtask, or to continue implementing a feature. Do not use to review (run-review) or validate in QA (run-qa) what has already been implemented.
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder in `./tasks/prd-*/`. The required files in `tasks/prd-[slug]/` are `prd.md`, `techspec.md` and `tasks.md`; if any is missing, stop and point to the corresponding skill (`/create-prd`, `/create-techspec` or `/create-tasks`).

A task is an **incremental delivery**, with explicit dependencies and its own tests. Implement all subtasks and move from plan to implementation as soon as the approach is clear. Reference the `techspec.md` instead of repeating implementation details.

## Workflow

1. **Select the task** — identify the next unfinished task in the `tasks.md`; open the corresponding `task_[num].md` file and read its definition, subtasks (`[num].1`, `[num].2`…), related acceptance criteria and tests.
   **Done when:** the next task and all its subtasks are identified.

2. **Prepare** — read the `AGENTS.md` and all rules in `.agents/rules/`; review the PRD context and the TechSpec requirements for the task; understand the dependencies on previous tasks; load only the applicable project skills in `.agents/skills/` and look up on the web the documentation of the libraries involved when necessary.
   When the task requires running the application, prepare an isolated environment for the worktree: use an available port in the `30**` range (for example, `3000–3099`) for the backend, an available port in the `51**` range (for example, `5100–5199`) for the frontend and a dedicated range for each additional database or service. Check each port before starting the process; if it is taken, choose another one within the range. Configure the URLs between the services, record the ports and the processes started and bring up only the necessary services.
   **Done when:** the approach is clear, the `AGENTS.md` and all rules have been consulted, the applicable skills are loaded and the necessary services are available.

3. **Implement** — implement each subtask in order; at the end, run the task's validations and tests using the commands defined in the `AGENTS.md` and in the applicable rules.
   **Done when:** every subtask is implemented and the task's applicable validations and tests pass.

4. **Finish and clean up** — mark as done (`[x]`) all subtasks and applicable tests in the `task_[num].md` file. Then mark the task as done (`[x]`) in the `tasks.md`, report in one line what was implemented and shut down all services started by this run. Terminate the processes gracefully, confirm that the ports were released and do not terminate processes belonging to another worktree or to the user. Do this cleanup also if the run is interrupted or blocked.
   **Done when:** all subtasks and applicable tests are marked in the task file, and the task is marked as done in the `tasks.md`.
