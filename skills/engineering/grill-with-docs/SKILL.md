---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, creating ADRs and a glossary as we go, and ending in a spec and tickets.
disable-model-invocation: true
---

## Keep the feature together

Before the first file write for this feature, call the Skill tool with "git-workflow" and use its task lifecycle. Reuse the feature task when continuing its conversation or map. Otherwise run `task-start --repo <primary> --task-id <feature-slug> --task-id-source <issuer> --session-id <session> --confirm-authorized` from the primary checkout. Move to the returned checkout, use its `environment.TMPDIR`, and continue all feature work there. `task-start` binds the run; when resuming an existing checkout, use `run-start --repo <feature-checkout> --task-id <feature> --task-id-source <issuer> --session-id <session> --expected-head <inspected-head> --confirm-authorized` before writing. Keep the returned task, source and session tokens.

This is task creation before writing, not a stage check. Glossary, ADRs, map, spec and tickets stay in this feature checkout through implementation, review and retro. Commit durable planning files through git-workflow's `commit-input` then `commit` route with literal paths before ticket tasks are cut from the feature branch.

Call the Skill tool twice, for "grilling" and "domain-modeling".

When the frontier is empty and the user confirms the shared understanding, call the Skill tool with "to-spec" to write the spec and tickets.
