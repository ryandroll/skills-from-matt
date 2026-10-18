## What it does

`to-spec` turns the conversation you have just had into a **[spec](https://www.aihero.dev/ai-coding-dictionary/spec)** and tracer-bullet tickets, and publishes both to your issue tracker in one invocation.

It does not interview you. When you reach for it, the deciding is already done. So it synthesises what is known (from the thread, the codebase, your `GLOSSARY.md` and ADRs) and does not start a new round of questions. The spec records decisions you already made. It is not a place to make new ones.

## When to reach for it

Type `/to-spec`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a settled conversation or plan needs a spec and tickets. [grill-with-docs](https://aihero.dev/skills-grill-with-docs) calls it after you confirm the shared understanding.

Reach for it when settled work needs a durable plan, especially when the build spans several agent [sessions](https://www.aihero.dev/ai-coding-dictionary/session). It also runs at the end of `grill-with-docs`:

| Where you are | What to run |
| --- | --- |
| You haven't decided anything yet | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) first |
| Decided, and the work fits one [context window](https://www.aihero.dev/ai-coding-dictionary/context-window) | [implement](https://aihero.dev/skills-implement): skip the spec |
| Decided, and the work spans several sessions | `/to-spec` writes both the spec and tickets |
| A [wayfinder](https://aihero.dev/skills-wayfinder) map has cleared | `/to-spec #<map_issue>` |

## Prerequisites

`to-spec` publishes the spec and one file or issue per ticket, so [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) must first configure a tracker and the triage-label vocabulary for this repo. Either kind of tracker works: a real tracker like GitHub, or local markdown files under `.scratch/`, which work with no extra setup.

## The spec is a decision record

The spec exists because context windows end. You settled many things while [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling): the shape of the solution, the choices you argued through, and what you deliberately refused. All of that is in one conversation that you are about to clear. The spec keeps it.

So the spec does not validate or decide anything. It records what you decided, in your project's own vocabulary, so a fresh session can pick up the work without you explaining it again. If the spec states something you never said, that is a defect.

## Seams before prose

Before it writes anything, `to-spec` sketches the **seams** where the feature will be tested, and checks them with you. It prefers existing seams to new ones, and picks the highest seam it can. The ideal number of seams for a change is one.

Other skills use those agreed seams later. Each ticket gets a **Seams** section naming its tests' public interfaces, taken from the spec's Testing Decisions section. [tdd](https://aihero.dev/skills-tdd) treats that section as the authority, and stops if it is missing. [code-review](https://aihero.dev/skills-code-review) reviews the diff against the spec. That is why you should take the seam conversation seriously here, and not leave it for implementation.

## Tracer bullets and blocking edges

After writing the spec, the same invocation looks for prefactoring and breaks the build into vertical slices. Each ticket delivers a narrow, complete path through the layers and fits one fresh context window. It keeps its acceptance criteria and declares which other tickets block it. Wide mechanical refactors use expand–contract instead: add the new form, migrate callers in batches, then remove the old form. Where batches cannot stay green alone, they share an integration branch and block a final integrate-and-verify ticket.

The seam check is the one planning check with you. There is no separate ticket-breakdown quiz: the grill already settled the scope. The final message presents the published tickets, their blocking edges, and what each delivers.

| Tracker | Published tickets |
| --- | --- |
| Local markdown | One file per ticket under `.scratch/<feature>/issues/<NN>-<slug>.md`, numbered blockers-first |
| A real tracker | One issue per ticket, using native blocking links where available and body references otherwise |

## Common questions

**Where did `/to-prd` go?**
It is this skill, renamed in v1.1. "Spec" is now the one term used throughout, and the old `to-prd` slug no longer works, so reinstall under the new name. The old vocabulary is replaced by the pair *spec* and *tickets*. The spec is the destination and the decisions that fix it. The [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) are the steps that get there. If you change direction, delete the unfinished tickets and keep the spec.

**Why does the spec get the `ready-for-agent` label? I don't want an agent implementing off it.**
The label means "no further triage needed": the document is complete enough for an agent to work from. It marks an input, not a work order. But [AFK](https://www.aihero.dev/ai-coding-dictionary/afk) agents that poll for `ready-for-agent` cannot see that difference. They will try to build the whole spec in one run instead of picking up the ticket slices. This is the most-reported problem with the skill. Until it changes, exclude the parent spec explicitly in your AFK agent's prompt, or remove the label after the spec and tickets have been published.

**Can I still create tickets without a spec?**
This edition writes both in one invocation. The spec preserves the decisions and agreed test seams; each ticket carries the slice of work and seams its implementer needs. For a small change already settled in conversation, [implement](https://aihero.dev/skills-implement) can still work directly from that conversation.

**I just finished a wayfinder map. What do I feed it?**
Give it the main map issue, `/to-spec #<map_issue>`, not the individual decision tickets. [wayfinder](https://aihero.dev/skills-wayfinder) produces decisions spread across a map, not deliverables. `to-spec` collapses them into one document you can build from. If you loop the map straight into `/implement`, you lose that step.

**Is the spec for me to review, or is it just for the agent?**
Mostly for the agent, and it reads that way: complete, dense, and full of references. Read the seams and the out-of-scope section. In those two places, a wrong decision is cheapest to catch now and most expensive to find later. People do complain about reading the whole thing, and there is no summary mode. But if the spec surprises you, the grilling was too shallow; the spec is not too long.

**Do I keep the spec frozen once tickets start, or let the agent rewrite it?**
Nothing keeps it in sync. In practice it is a snapshot of what you knew at that moment, and it goes out of date the first time implementation teaches you something. Treat it as disposable after the work ships. Your `GLOSSARY.md` and ADRs are the files meant to last. If you learn something during implementation that should last, put it there, not in an edited spec.

**My work is a refactor or a module boundary, not a feature. Does the template fit?**
Less well, and this is a known limitation. The template relies heavily on user stories, which do not fit architectural work. You end up writing stories nobody asked for around decisions that are really about interfaces and invariants. Use the implementation-decisions and testing-decisions sections instead. Record the lasting architectural decisions as ADRs through [grill-with-docs](https://aihero.dev/skills-grill-with-docs), not in the spec.

**Will it check the tracker for related work, or cite the ADRs it's respecting?**
No to both. It reads and follows the ADRs for the area it touches, but it does not link them. It also does not search the tracker for overlapping issues before it writes, so a spec can duplicate work that someone already filed, and nothing warns you. If the area is busy, search the tracker yourself first.

**Does ticket creation have to fetch the spec again?**
Ticket creation continues in the same invocation that wrote the spec, so there is no second command or context reset between them. If you pass an existing spec reference, the agent still needs its full body and comments before it can synthesize the work.

## It's working if

- It synthesises settled decisions rather than restarting the interview.
- It shows you the seams before it writes, and proposes as few as it can.
- The spec and tickets appear in the same run, and every ticket has acceptance criteria, blocking edges, and a Seams section.
- It uses your project's nouns, not generic product-management boilerplate.
- You remember making every decision in it. It invented nothing to fill a section.
- The out-of-scope section lists real things. The things you refused are usually the most useful lines on the page.

## Where it fits

`to-spec` is the spec-and-tickets step in the main build chain:

```txt
grill-with-docs → to-spec → implement → code-review → retro
```

Upstream, [grill-with-docs](https://aihero.dev/skills-grill-with-docs) makes the decisions that this skill only records, and a finished [wayfinder](https://aihero.dev/skills-wayfinder) map joins the chain here. It then cuts the spec into tracer-bullet tickets for [implement](https://aihero.dev/skills-implement) or [implement-spec](https://aihero.dev/skills-implement-spec) to build. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
