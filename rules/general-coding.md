---
description: General coding conventions I want Claude to follow in every project.
---

# General coding

- Match the existing style of the file and project before introducing new patterns.
- Keep changes focused on the task; don't refactor unrelated code without asking.
- Prefer clear names over comments; comment the *why*, not the *what*.
- Never commit secrets, `.env` files or credentials.
- Run the project's tests/linter after changes when they exist, and report failures honestly.
- Ask before adding a new dependency.
