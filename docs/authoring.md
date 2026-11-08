# Adding your own

[← Back to README](../README.md)

## 1. Scaffold

From a clone:

```bash
npm start                  # → "Create new skill / rule"
node bin/cli.js new skill my-skill
node bin/cli.js new rule my-rule
```

## 2. Write it

**Rule** (`rules/my-rule.md`): a short list of must-follow bullets.

```markdown
---
description: One line saying what the rule enforces.
skill: my-skill          # optional: the skill with its examples
paths:                   # optional: load only for these files
  - "src/**/*.ts"
---
```

**Skill** (`skills/my-skill/`): keep `SKILL.md` short and move the details out.

- `description`: say **what** it does and **when** to use it. This is what triggers it.
- `SKILL.md`: rules, workflow, checklist, and a *"When you need… → Read"* table.
- `references/`: examples and longer explanations.
- `assets/`: files to copy (configs, modules, templates).

## 3. Publish

```bash
npm run docs      # regenerates the README table and docs/catalog.md
git add -A && git commit -m "feat: add my-skill" && git push
```

CI fails if you forget `npm run docs`.
