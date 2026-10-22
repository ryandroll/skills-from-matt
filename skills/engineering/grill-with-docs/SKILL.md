---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, creating ADRs and a glossary as we go, and ending in a spec and tickets.
disable-model-invocation: true
---

## Keep the feature together

Before the first durable repository write for this feature, call the Skill tool with "git-workflow" and use `git-workflow start` or return to the existing feature checkout, then keep all feature work there.

Glossary, ADRs, map, spec and tickets stay in this feature checkout through implementation, review and retro. Commit durable planning files with native `git add <paths>` and `git commit`, listing paths one by one, never `-A` or `.`, before ticket tasks are cut from the feature branch.

Call the Skill tool twice, for "grilling" and "domain-modeling".

When the frontier is empty and the user confirms the shared understanding, call the Skill tool with "to-spec" to write the spec and tickets.
