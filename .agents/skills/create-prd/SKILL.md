---
name: create-prd
description: PRD — Product Requirements Document. Use when the user asks for a PRD or wants to define the requirements and scope of a new feature or product (first step of the PRD → TechSpec → tasks flow). Do not use for technical specifications (create-techspec) or to break requirements down into tasks (create-tasks).
argument-hint: --prompt "feature description"
---

The PRD defines the problem, the goals, the expected outcomes, the constraints and the scope. Goals and outcomes must have measurable criteria. Implementation details — such as architecture and code — belong in the TechSpec and stay out of the PRD.

## Workflow

1. **Clarify** — ask the user questions using `AskUserQuestion` before drafting:
   - Problem to be solved and measurable goals
   - Main users, user stories and main flows
   - Core features: inputs, outputs and actions
   - Out-of-scope items and dependencies
   - UI/UX and accessibility guidelines

   For domain-specific business rules, search the web instead of asking the user.
   **Done when:** every section of the template has an answer or a recorded assumption.

2. **Draft** — read this skill's `./references/TEMPLATE.md` in full and follow its structure exactly.
   **Done when:** every section of the template is filled in with information specific to the feature or product.

3. **Save and report** — write the document to `./tasks/prd-[slug]/prd.md`, using a kebab-case slug of the feature. Report the path with a one-line summary.
