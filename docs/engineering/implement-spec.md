## What it does

`implement-spec` takes a [spec](https://www.aihero.dev/ai-coding-dictionary/spec) and its [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) and lands the whole thing in one run. The orchestrating [agent](https://www.aihero.dev/ai-coding-dictionary/agent) hands each ticket to an implementer [subagent](https://www.aihero.dev/ai-coding-dictionary/subagent) working in its own ticket task, settles each into the **feature branch** itself, runs [code-review](https://aihero.dev/skills-code-review) and [retro](https://aihero.dev/skills-retro), and leaves the feature ready for the primary session to settle into `main`.

It reads the tickets as a **task graph**, not a list. Blocking edges decide what can start, so at any moment there is a **frontier** of tickets whose blockers have all landed, and frontier tickets run concurrently within available managed capacity. That is the difference from working the tickets one by one. The graph's shape sets the pace, not the tickets' order on the tracker.

## When to reach for it

You invoke this by typing `/implement-spec`, and the agent won't reach for it on its own.

| Your situation | Reach for |
| --- | --- |
| A spec, split into tickets with blocking edges, that you want landed in one run | `/implement-spec` |
| One independent change or diagnosed bug, without a feature graph | [implement](https://aihero.dev/skills-implement) |
| A spec that isn't split into tickets yet | [to-spec](https://aihero.dev/skills-to-spec) first |
| A small piece of work with no real graph to it | [implement](https://aihero.dev/skills-implement) directly |

## Prerequisites

- **An issue tracker.** The skill reads the tickets from, and resolves them on, the tracker [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) configured. If none has been configured, it stops and tells you to run that first rather than guessing.
- **Tickets with blocking edges and Seams sections**, as [to-spec](https://aihero.dev/skills-to-spec) writes them. Without edges the graph is flat and every ticket starts at once.
- **An open feature task with a bound run and spare managed capacity.** Git-workflow owns each checkout. Step 1 checks these facts before launching implementers, and stops with the exact next command if they do not hold.

## The feature branch

Everything lands on one branch. Each implementer:

1. starts in a ticket task cut from the feature branch, with its base and integration target checked before launch,
2. always calls [tdd](https://aihero.dev/skills-tdd) at the seams in its ticket's Seams section, red-green one slice at a time,
3. commits through git-workflow, refreshes from the feature tip and verifies it, then declares the ticket complete.

The orchestrating session settles tickets from the feature checkout under the feature run. Settlement integrates each ticket and retires its checkout. The feature refreshes after each settlement and before review. After the last ticket, review fixes land through the same route, then retro adds and commits its own deterministic check on the feature branch. This session makes and commits any further changes you accept in the feature checkout, then refreshes, verifies and completes the feature. The final output gives the primary session its settlement commands. Publishing is a separate operator request.

Implementers talk to the orchestrator through [context pointers](https://www.aihero.dev/ai-coding-dictionary/context-pointer) (the spec, the ticket, shared exploration notes, earlier commits) rather than pasted summaries. This keeps each subagent's prompt small and leaves room in the orchestrator's window for the graph.

## Common questions

**How is this different from running `/implement` on each ticket myself?**

One session dispatches the ready frontier, opens ticket tasks from the feature branch, and settles them itself. Use `implement` for one small change directly targeting `main`; use `implement-spec` when the whole feature should land together. Start in the feature checkout with a pointer to the spec.

**Does it need GitHub? I want it to stop at the branch.**

No. It works offline with a local markdown tracker and ends with the completed feature branch and the commands for the primary session to settle it. `main` stays unchanged until that settlement. It publishes only when you ask.

**Its review and fix loop ran for hours, or kept "fixing" tickets that hadn't been built yet.**

Both happen when `code-review` runs anywhere other than the one point the skill gives it. It compares the code against the whole spec, so it only makes sense once every ticket has landed. If it runs mid-run, every unbuilt ticket reads as a failure. The agent then builds that ticket, and that triggers another review. At the end, the skill runs `code-review` once and sends every finding to one fix subagent, but it doesn't yet say when to stop after that fix. One user reported a five-ticket feature where "the review and fix loop took roughly four hours". If you see a second broad review start, tell it to run focused checks for the fixed findings and stop. Expect that first review to find real problems. The run's output is a draft that the review completes, not something to ship on its own.

**Does it drive tdd like implement does?**

It does now, though it didn't at first. Users running the in-progress version noticed that "the implementer subagents don't inherit the /tdd directive", so red-green stopped as soon as they scaled up from one ticket to a whole spec. Every ticket's implementer calls `tdd` unconditionally. The ticket's Seams section carries the agreement from the spec. A ticket without it stops for repair through `to-spec`; the implementer never skips tests.

**Two implementers running in parallel collided on the same file, or picked different names for the same thing.**

Worktrees don't remove collisions; they postpone them to merge time. A blocking edge written from ticket text is a guess about which files each ticket will touch, and two tickets on "different parts of the codebase" still share a message catalogue, a config registry, or a type. Each implementer sees only its own ticket and the shared notes, never the other's work in progress, so one user's web and mobile tickets added the same string as `blockedSince` and `blockedOn`. When two frontier tickets touch one shared file, either add a blocking edge between them so they run one after the other, or have the exploration notes fix the exact names each ticket adds.

**Blocked tickets never start, even after their blocker has merged.**

The starting graph comes from the tracker, but the live frontier comes from tickets successfully settled into the feature branch. Closing a tracker item alone is not evidence that its code landed. The orchestrator resolves each ticket after settlement and uses that result to unblock the next work.

**Does this replace Sandcastle or an AFK script?**

No. People ask because the skills now reach into implementation: "is Sandcastle still relevant? Your skills now seem to be able to handle implementation as well." `implement-spec` puts an agent in charge of orchestration inside one harness session, which needs no infrastructure and lets you watch and steer. For work that is truly [AFK](https://www.aihero.dev/ai-coding-dictionary/afk), a deterministic loop ([Sandcastle](https://github.com/mattpocock/sandcastle), a shell script, a CI job) is faster, cheaper, and more reliable, because no agent makes the orchestration decisions.

**A ticket's key test was skipped inside its worktree, and it reported green.**

A task checkout holds tracked files, so verification that depends on ignored fixtures or local services needs the project's authorized setup in that checkout. A skipped test is not a pass. Keep the ticket incomplete until its required verification can run; moving its writes to the primary checkout defeats task ownership.

## It's working if

- Several implementers are running at once whenever the graph allows, not one after another.
- A ticket starts as soon as its last blocker lands on the feature branch, not when the whole run ends.
- Every ticket's trace shows `tdd` running, with a failing test before the code.
- Each ticket refreshes and completes before the feature session settles it and retires its checkout.
- Review and retro finish on the feature branch; `main` stays unchanged until the primary session settles it.

## Where it fits

`implement-spec` is the build step of the main chain, for a feature with tickets; [implement](https://aihero.dev/skills-implement) handles one independent change:

```txt
grill-with-docs → to-spec → implement-spec → retro
```

Its neighbours are [to-spec](https://aihero.dev/skills-to-spec), which declares the blocking edges it reads as a task graph, and [code-review](https://aihero.dev/skills-code-review), which it runs over the feature branch before closing out. [ask-matt](https://aihero.dev/skills-ask-matt) is the router over the whole set when you are not sure which flow you are in.
