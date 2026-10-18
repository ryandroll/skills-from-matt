---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows) - not the current workspace.

Include a "suggested skills" section in the document, naming model-invoked skills the next agent should invoke and user-invoked skills the human must start.

Include a "Git task" section with the feature task id, absolute feature checkout path, branch, and run tokens (`task-id`, `task-id-source`, `session-id`). For a ticket or prototype, record its own checkout and tokens separately from the parent feature. Use the known receipts; mark unknown or absent values explicitly rather than guessing. Include the next session's `run-start --repo <checkout> --task-id <task> --task-id-source <issuer> --session-id <session> --expected-head <freshly-inspected-head> --confirm-authorized` rebind route through git-workflow, keeping the existing identity and respecting session ownership. Do not run a stage check or mutate the task while writing the handoff.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
