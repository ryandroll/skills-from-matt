---
name: implement-spec
description: "Implement the spec and tickets produced by /to-spec in code."
disable-model-invocation: true
---

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

The goal is the entire spec implemented on a single **feature branch**, with every ticket resolved the way the issue tracker closes work.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from implementers, reviewers and explorers should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

Run **implementers** in the background where possible: at most four at once by default, or six when they run outside the primary's harness, always bounded by available managed capacity. Use the strongest tier when a ticket is marked `complex` or a fix round reaches three.

The coordinating session owns ticket tasks and performs every commit, `git-workflow refresh`, `git-workflow complete` and `git-workflow settle`, including fix rounds; implementers edit and test without taking ownership.

## Steps

1. **Check the Git stage.** Call the Skill tool with "git-workflow", run `git-workflow status`, and stop with its `git-workflow start` command unless this is the session's own feature checkout targeting main.

2. Read the spec and tickets to understand the task graph. Commit any pending feature planning files with native `git add <paths>` and `git commit`, listing paths one by one, never `-A` or `.`, so the ticket checkouts contain them.

3. (optional) Launch an **explorer** to conduct any exploration required by the tickets, such as relevant codebase files or external documentation. The explorer reports and does not edit. This session writes its notes to a directory outside the repo, accessible to the implementers and reviewers, and passes context pointers to them.

4. Open one **ticket task** and launch one **implementer** per ready frontier ticket, within the concurrency and capacity limits above. Use `git-workflow start --base <feature-branch>` for each ticket and pass its returned checkout to the implementer. Each implementer:
   - works only in the returned ticket checkout;
   - calls the Skill tool with "tdd" at the seams in the ticket's Seams section, including its stage check, but leaves its commit route to this session;
   - writes nowhere else, and never commits;
   - reports its changes and verification results.

5. Once an **implementer** reports, this session commits verified ticket changes with native `git add <paths>` and `git commit`, listing paths one by one, never `-A` or `.`. Call the Skill tool with "code-review" against the ticket's base commit and its ticket spec. Apply accepted findings yourself or return them to the implementer, one writer at a time; verify and commit fixes through the same route.

   This session runs `git-workflow refresh` in the ticket, verifies the result, then uses `git-workflow complete` and `git-workflow settle` to land it into the feature only after verification passes.

   Resolve the tracker ticket only after settlement, and commit local tracker edits on the feature branch.

6. Recompute the **frontier** from tickets successfully settled into the feature, and start more **implementers** as capacity permits. After each settlement and before step 7, run `git-workflow refresh` in the feature checkout to take in `main`; verify before continuing.

7. Once all tickets are settled, call the Skill tool with "code-review" on the feature branch, defaulting to its task base commit. Fix the findings in a single **implementer**, in a new ticket task cut from the feature through steps 4 and 5. Verify the fixes and settle that ticket before closing out.

8. Call the Skill tool with "retro" in this session; it adds and commits its own deterministic check on the feature branch. Make any further changes the operator accepts in the feature checkout and commit them with the same native Git commands; then run `git-workflow refresh`, verify, and use `git-workflow complete` only after verification passes.

9. Report the feature task, branch and checkout, and ask the operator before `git-workflow settle` into main.
