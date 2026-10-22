---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

## 1. Check the Git stage

Before touching a file, call the Skill tool with "git-workflow", run `git-workflow status`, and stop with its `git-workflow start` command if this is not a task checkout, or not the one you were given.

`tdd` repeats this check when called below.

## 2. Implement the work

Implement the work described by the user in the spec, ticket or settled conversation. A small change or a bug fix after `diagnosing-bugs` uses one task targeting `main`; under `implement-spec`, keep the supplied ticket task and its feature target.

If the user passes a ticket reference, fetch it from the configured issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" at the seams the ticket or spec names. Use the project's verification commands for regular typechecking and focused test files, then the umbrella check at the end; commit verified work through the route below so the review can see it.

## 3. Commit and review

Under `implement-spec`, return verified changes to the coordinating session for this step and the task lifecycle below.

If this session will commit in a task it did not start, run `git-workflow takeover` first.

Commit each verified change with native `git add <paths>` and `git commit`, listing paths one by one, never `-A` or `.`; report verification and commit separately.

Call the Skill tool with "code-review" against the task's base commit. Address findings within this task, verify the affected behaviour and use the same commit route for fixes.

Run `git-workflow refresh`, verify the refreshed result, then use `git-workflow complete` only after verification passes. A ticket returns to the `implement-spec` session for settlement into the feature. For an independent task, ask the operator before `git-workflow settle` into main. Ask the operator before `git push`.
