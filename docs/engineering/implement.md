## What it does

`implement` builds work that has already been decided. You point it at a [ticket](https://www.aihero.dev/ai-coding-dictionary/ticket), a [spec](https://www.aihero.dev/ai-coding-dictionary/spec), or the plan you just agreed in the conversation, and it writes the code, drives [tdd](https://aihero.dev/skills-tdd) at the seams, typechecks as it goes, runs [code-review](https://aihero.dev/skills-code-review) at the end, and commits through git-workflow in the task checkout.

It never reopens the plan. There is no interview, no clarifying round, no proposal of a different approach. Whatever was settled upstream is the input, and the skill's whole job is to turn that into a commit. That is what separates it from typing "build this" at a fresh [agent](https://www.aihero.dev/ai-coding-dictionary/agent), which often redesigns the work while it builds it.

## When to reach for it

You invoke this by typing `/implement`, and the agent will not reach for it on its own. Use it for one small change or a bug fix after diagnosis. A feature with tickets belongs in [implement-spec](https://aihero.dev/skills-implement-spec).

Where the work currently lives decides whether this is the right skill:

| The work is… | Reach for |
| --- | --- |
| One small change or diagnosed bug on the tracker | `/implement #42` in its own task targeting `main` |
| A spec, not yet split up, and the build spans sessions | [to-spec](https://aihero.dev/skills-to-spec) first, then [implement-spec](https://aihero.dev/skills-implement-spec) |
| A spec, and the build is small | `/implement` directly against the spec |
| Only in the conversation you just had, and it's still small | `/implement` right there, in the same window |
| Not written down anywhere yet | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) |
| One concrete behaviour you want test-first, with no spec | [tdd](https://aihero.dev/skills-tdd) directly |
| Already built, and you want it checked | [code-review](https://aihero.dev/skills-code-review) directly |

The same-session case is worth naming because the skill's own first line doesn't cover it. `SKILL.md` says "the spec or tickets", which pushes the [model](https://www.aihero.dev/ai-coding-dictionary/model) to look for a file that doesn't exist. If the plan lives only in the thread, say so when you invoke it.

## Prerequisites

Git-workflow must have an open task in a skill-owned checkout with a bound run. The first step checks that state without writing. Outside a task, it stops and prints the exact task-start command. A small standalone change targets `main`; an existing ticket task keeps its feature target.

If the tickets came from [to-spec](https://aihero.dev/skills-to-spec), [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) configured the tracker they live on. `code-review` reads the same configuration to find the originating spec at close-out.

## What one run does

The run keeps implementation and its evidence in one task:

1. Check the Git stage, then read the ticket or spec and work out the seams.
2. Always drive [tdd](https://aihero.dev/skills-tdd) at the seams the ticket or spec names, one red-green slice at a time.
3. Typecheck often, run single test files as it goes.
4. Run the umbrella check at the end, using the command found through the project's agent instructions.
5. Commit verified work through git-workflow, run [code-review](https://aihero.dev/skills-code-review), and verify and commit any fixes.
6. Refresh from the integration target and complete the task. A ticket returns to its feature session for settlement; a standalone change prints the settlement route for the primary session.

One run covers one task. [implement-spec](https://aihero.dev/skills-implement-spec) owns the graph when several tickets belong to one feature. Each ticket has a separate checkout and run, while the feature branch holds their combined result.

## Pre-agreed seams

The skill's central idea is the **seam**, the public boundary you observe behaviour at without reaching inside. Tests live at seams. When the seam is agreed before any code exists, the tests last, and you can rewrite the implementation underneath without changing them.

For ticket work, the ticket's **Seams** section supplies that agreement, copied from the spec by `to-spec`. If it is missing, `tdd` stops and sends the ticket back for seams from the spec; it never silently skips tests. For work with no ticket, `tdd` names the seams and confirms them with you before writing a test.

## Common questions

**It finished, but my ticket is still open and the acceptance criteria are still unchecked.**

Task completion and tracker status are separate. `implement` now refreshes and completes its Git task after review fixes, but it does not close the tracker item or tick its acceptance criteria. `implement-spec` resolves its tracker tickets after settlement into the feature branch.

**Can I point it at all my tickets at once, or run several in parallel?**

Use [implement-spec](https://aihero.dev/skills-implement-spec) for a whole graph. It opens one task per ticket and settles each into the feature branch. Separate checkouts and run bindings keep each implementer's commits attached to its own work.

**Can it open a pull request instead of committing?**

It commits locally through git-workflow, then reviews the committed work. Publication requires an explicit request; finishing a task does not push it or open a pull request.

**`code-review` says it cannot see my changes.**

`code-review` reads committed changes. This edition commits verified work before invoking review and defaults the comparison to the task's base commit. Review fixes get their own verified commits through the same route.

Separately, some people do not want the review inside the run at all, because an agent reviewing the code it just wrote is biased toward its own solution. Running [code-review](https://aihero.dev/skills-code-review) in a fresh session against a fixed point is a valid alternative. The same bias is why that skill runs its two axes in separate sub-agents.

**One ticket burned 150k tokens. Am I using it wrong?**

Probably not. The ticket is more likely too big. A run does codebase exploration, a red-green loop per seam, the umbrella check, and a review, so a non-trivial ticket exceeding 100k [tokens](https://www.aihero.dev/ai-coding-dictionary/token) is normal rather than a sign something broke. The fix is upstream. Right-size the tickets in [to-spec](https://aihero.dev/skills-to-spec) so each fits one fresh window. If a single ticket keeps going over, split it rather than raising the [effort](https://www.aihero.dev/ai-coding-dictionary/effort) level.

**`/implement #2` in a fresh session worked on something completely unrelated.**

The agent resolved `#2` against another numbered list in context, such as a todo file or checklist, rather than the configured tracker. `implement` now fetches a passed reference from the issue tracker and states its title before starting, and asks when the reference is ambiguous. Check that title matches the ticket you meant; passing the issue URL or `owner/repo#2` removes the ambiguity entirely.

## It's working if

- A wrong checkout stops before any file changes and prints the next command.
- The session opens by reading the ticket or spec and restating what it will build, rather than asking you what to build.
- You can see `tdd` invoked in the trace, with a failing test before implementation.
- Typechecks and single test files run repeatedly during the run, and the umbrella check runs at the end.
- The trace shows `commit-input` followed by `commit` with literal task paths, before review.
- The diff is one ticket's worth of change: a vertical slice through every layer, not several tickets swept together.

## Where it fits

`implement` is the build step of the main chain:

```txt
grill-with-docs → to-spec → implement → code-review → retro
```

Its neighbours are [to-spec](https://aihero.dev/skills-to-spec), which produces the tickets it consumes and declares the blocking edges that decide their order; [tdd](https://aihero.dev/skills-tdd), which it drives internally at each seam; and [code-review](https://aihero.dev/skills-code-review), which it runs after committing the verified changes. It sits downstream of the planning skills and trusts them. It does not re-validate the shape of what it was handed, so a badly-structured map or a horizontally-layered ticket gets built as written.

That trust is why [wayfinder](https://aihero.dev/skills-wayfinder) merges onto the chain at [to-spec](https://aihero.dev/skills-to-spec) rather than looping its map straight into `implement`. Go straight to `implement` from a map only when the effort turned out small.

[ask-matt](https://aihero.dev/skills-ask-matt) is the router over the whole set when you are not sure which flow you are in.
