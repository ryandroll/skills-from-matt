---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

## 1. Check the Git stage

Call the Skill tool with "git-workflow".
Before touching a file run the read-only `workspace-report --repo <checkout>` then `run-report --repo <checkout> --task-id <task> --task-id-source <issuer> --session-id <session>`.
Verify a skill-owned checkout, an open task and a run bound to this checkout.
On failure stop and print the next command the report names, filled with the inspected values: outside a task `task-start --repo <primary> --task-id <task-slug> --task-id-source <issuer> --session-id <session> --confirm-authorized`; unbound `run-start --repo <checkout> --task-id <task> --task-id-source <issuer> --session-id <session> --expected-head <inspected-head> --confirm-authorized`.

`tdd` repeats this check when called below.

## 2. Implement the work

Implement the work described by the user in the spec, ticket or settled conversation. A small change or a bug fix after `diagnosing-bugs` uses one task targeting `main`; under `implement-spec`, keep the supplied ticket task and its feature target.

If the user passes a ticket reference, fetch it from the configured issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" at the seams the ticket or spec names. Use the project's verification commands for regular typechecking and focused test files, then the umbrella check at the end; commit verified work through the route below so the review can see it.

## 3. Commit and review

Commit each verified change through git-workflow's `commit-input` then `commit` with literal `--path`s and a freshly inspected `--expected-head`; report verification and commit separately.

Call the Skill tool with "code-review" against the task's base commit. Address findings within this task, verify the affected behaviour and use the same commit route for fixes.

Run `task-refresh --repo <checkout>` with the three `--run-*` flags, verify the refreshed result, then `task-complete --repo <checkout> --declared-by workflow --reason <completion-summary> --confirm-authorized` with those same flags. Stop on a refresh or verification failure. A ticket returns to the `implement-spec` session for settlement into the feature. For an independent task, print `task-settle-plan --repo <primary> --task-id <task> --outcome integrate` for the operator's primary session, followed by `task-settle-apply --repo <primary> --task-id <task> --outcome integrate --plan-digest <returned-digest> --confirm-authorized`. Publish only on the operator's request through git-workflow's `publish-push-plan`/`publish-push-apply` route.
