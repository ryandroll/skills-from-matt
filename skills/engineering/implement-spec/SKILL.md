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

Run **implementers** in the background where possible: at most four at once by default, or six when the rendered role launches implementers outside the primary's harness, always bounded by available managed capacity. Use the strongest tier when a ticket is marked `complex` or a fix round reaches three.

## Steps

1. **Check the Git stage.** Call the Skill tool with "git-workflow" and run the read-only `workspace-report --repo <feature-checkout>`, then `run-report --repo <feature-checkout> --task-id <feature> --task-id-source <issuer> --session-id <feature-session>`. Verify this is the skill-owned feature checkout, its task is open, its `integration_target` is the default branch, its run is bound, and `managed_available` is at least one. Use git-workflow's executor prefix for the commands below. On failure stop before writing or launching anyone and print the exact next command with inspected values: `task-start --repo <primary> --task-id <feature-slug> --task-id-source <issuer> --session-id <feature-session> --confirm-authorized` if there is no feature, or `run-start --repo <feature-checkout> --task-id <feature> --task-id-source <issuer> --session-id <feature-session> --expected-head <inspected-head> --confirm-authorized` for an unbound open feature. For a ticket checkout or unproven feature identity, print `workspace-report --repo <primary>` to locate the owning feature. For an already completed feature, print `task-settle-plan --repo <primary> --task-id <feature> --outcome integrate`. If capacity is full, name the counted checkout from `workspace-report` and print its `worktree-cleanup-plan --repo <primary> --task-id <counted-task>`.

2. Read the spec and tickets to understand the task graph. Commit any pending feature planning files through git-workflow's `commit-input` then `commit` route with literal task paths, so the ticket checkouts contain them.

3. (optional) Launch an **explorer** to conduct any exploration required by the tickets, such as relevant codebase files or external documentation. The explorer reports and does not edit. This session writes its notes to the task's temporary directory and passes context pointers to implementers and reviewers.

4. Open one **ticket task** and launch one **implementer** per ready frontier ticket, within the concurrency and capacity limits above. From the feature checkout run `task-start --repo <feature-checkout> --task-id <ticket> --task-id-source <issuer> --session-id <ticket-session> --base-ref <feature-branch> --run-task-id <feature> --run-task-id-source <issuer> --run-session-id <feature-session> --confirm-authorized`. Before launching each **implementer**, run `workspace-report` for the returned ticket checkout, then `run-report` with its ticket tokens. Check `workspace-report` records the feature branch as `integration_target`. The start must name the feature branch as `--base-ref`, not just a commit at the same tip. On failure stop before launching the implementer and rerun the recovery command the report names; leave the mismatched checkout intact until recovery verifies it. Each implementer:
   - works only in the returned ticket checkout, with its bound run tokens and `environment.TMPDIR`;
   - calls the Skill tool with "tdd" at the seams in the ticket's Seams section, including its stage check, but leaves its commit route to this session;
   - reports its changes and verification results, and never commits. Keep one writer per checkout; this session takes over only after the implementer reports.

5. Once an **implementer** reports, this session commits verified ticket changes through git-workflow's `commit-input` then `commit` route with literal task paths and the ticket's bound run. Call the Skill tool with "code-review" against the ticket's base commit and its ticket spec. Apply accepted findings yourself or return them to the implementer, one writer at a time; verify and commit fixes through the same route. Escalate the implementer to the strongest tier when a fix round reaches three.

   This session runs `task-refresh --repo <ticket-checkout> --run-task-id <ticket> --run-task-id-source <issuer> --run-session-id <ticket-session>` to take in the feature tip, verifies the result, then runs `task-complete --repo <ticket-checkout> --declared-by workflow --reason <completion-summary> --run-task-id <ticket> --run-task-id-source <issuer> --run-session-id <ticket-session> --confirm-authorized`. A conflict or failed verification stops completion; use git-workflow's receipted resolution route. Then settle the ticket from the feature checkout:

   ```text
   task-settle-plan --repo <feature-checkout> --task-id <ticket> --outcome integrate
   task-settle-apply --repo <feature-checkout> --task-id <ticket> --outcome integrate --plan-digest <returned-digest> --confirm-authorized --run-task-id <feature> --run-task-id-source <issuer> --run-session-id <feature-session>
   ```

   Serialize settlements. Use the feature run, not the ticket run. Follow git-workflow's conflict and interrupted-settlement route before proceeding. Successful settlement integrates the ticket, retires its checkout and deletes its branch. Resolve the tracker ticket only after settlement, and commit local tracker edits through the feature's commit route.

6. Recompute the **frontier** from tickets successfully settled into the feature, and start more **implementers** as capacity permits. After each settlement and before step 7, run `task-refresh --repo <feature-checkout>` with the feature's three `--run-*` flags to take in `main`; verify before continuing.

7. Once all tickets are settled, call the Skill tool with "code-review" on the whole feature branch with reviewers at the strongest tier, defaulting to its task base commit. Fix the findings in a single **implementer**, in a new ticket task cut from the feature through steps 4 and 5. Verify the fixes and settle that ticket before closing out.

8. Call the Skill tool with "retro" in this session; it presents candidates and writes nothing itself. Make every change the operator accepts in the feature checkout and commit it through the commit route; then `task-refresh --repo <feature-checkout>` with the feature run flags, verify, and `task-complete --repo <feature-checkout> --declared-by workflow --reason <completion-summary> --confirm-authorized` with the same flags.

9. Report the feature task, branch and checkout, and print the filled `task-settle-plan --repo <primary> --task-id <feature> --outcome integrate` command for the operator's primary session; the apply takes the fresh digest.
