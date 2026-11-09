---
name: create-tasks
description: Tasks — breakdown of a feature into implementation tasks based on the existing PRD and TechSpec in `tasks/prd-*/`. Use when the user asks to break a feature down into tasks or plan its execution. Do not use to draft the PRD (create-prd) or the TechSpec (create-techspec).
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder in `./tasks/prd-*/`. The required files are `tasks/prd-[slug]/prd.md` and `tasks/prd-[slug]/techspec.md`; if either is missing, stop and point to the corresponding skill (`/create-prd` or `/create-techspec`).

Each task is an **incremental delivery**, with a clear scope, explicit dependencies and its own tests. Reference the PRD's acceptance criteria and use the test cases defined in the TechSpec as the source of truth for the tasks' tests. Reference the `techspec.md` instead of repeating implementation details.

## Workflow

1. **Analyze** — read the `AGENTS.md`, all rules in `.agents/rules/`, the PRD and the TechSpec; inventory the requirements, the acceptance criteria (`AC-*`), the technical decisions, the components and all test cases defined in the TechSpec. Identify the skills in `.agents/skills/` applicable to each task.
   **Done when:** the inventory of criteria and test cases is complete and the skills applicable to each task are identified.

2. **Propose the structure** — build a list of high-level tasks, preferably with at most 10 items. List dependencies before the tasks that depend on them, such as backend before frontend when the frontend depends on it, and both before the E2E tests. Show the list to the user for approval before generating any file.
   **Done when:** the user approves the list.

3. **Generate the files** — in `./tasks/prd-[slug]/`:
   - `tasks.md` following this skill's `./references/TEMPLATE_TASKS.md`
   - one `task_[num].md` file for each task, following this skill's `./references/TEMPLATE_TASK.md`. Use sequential numbers starting at 1 (`task_1.md`, `task_2.md`, …) and include subtasks (`[num].1`, `[num].2`, …), references to the acceptance criteria (`AC-*`) and the tests corresponding to the mapped TechSpec cases
     **Done when:** each acceptance criterion and test case in the inventory is mapped to one or more tasks, and the tests of each task match the cases defined in the TechSpec.

4. **Report** — present the generated files and wait for the user's confirmation before starting any implementation.
