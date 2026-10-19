## What it does

`research` answers a question by reading the sources that own the answer, then leaves a cited Markdown file in the repo. It works only from **[primary sources](https://www.aihero.dev/ai-coding-dictionary/primary-source)**: official docs, source code, specs, first-party APIs. It follows every claim back to the source that owns it, so it will not repeat a blog post's account of an API when the API's own docs are reachable.

The researcher reports and does not edit. This session files one Markdown report in the tracker's research directory, as the project's agent instructions name it, with a link on each claim. You get a document you can react to, hand to another agent, or throw away, rather than an answer that is gone when the [session](https://www.aihero.dev/ai-coding-dictionary/session) ends.

## When to reach for it

Type `/research`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task turns into reading legwork.

Reach for it when the next step is *finding something out* from outside the working directory (how a third-party API behaves, what a spec says, whether a version claim holds), and you'd rather not stall your own thread doing the reading. What you need decides which skill:

| What you need | Reach for |
| --- | --- |
| An external fact a decision is waiting on | `research` |
| A decision made *with* you, by interview | [grilling](https://aihero.dev/skills-grilling) |
| A durable architecture decision, written into `GLOSSARY.md` and ADRs | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) |
| To find out whether an approach works in your codebase | [prototype](https://aihero.dev/skills-prototype) |
| A plan too big to hold in one session | [wayfinder](https://aihero.dev/skills-wayfinder) |

The line between `research` and `grill-with-docs` is the **shelf life of what comes back**. Research produces short-lived facts, such as what this library's auth mechanism does as of this week. An ADR records a decision you keep. If what you are producing is a decision rather than a fact, you are [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling), not researching.

## Delegated legwork

The reading runs as a **researcher** in the background. You keep working while it follows each claim to its primary source and reports back for this session to file. Research is legwork you delegate, not thinking you outsource. You get a document to grill, plan, or design against, and you still make the decision.

A researcher already running this skill investigates directly and returns its findings, so the instruction to delegate belongs to this session. This session owns the durable file and tells you its path.

## Common questions

**It spawned a second research agent. Is that meant to happen?**

No. Earlier instructions could cause nested delegation, reported in [issue #530](https://github.com/mattpocock/skills/issues/530). This fork tells an existing researcher to investigate directly and report to this session. This session launches the researcher and files its findings. Check the task list: one question should produce one researcher, not a chain of duplicate tasks.

**Where should the file live, and should I commit it?**

The community view is mostly settled: keep ADRs, not research files. One Discord thread on this question put it most clearly: "ADRs yes. Everything else archive or delete after done. It otherwise becomes cruft of work and can poison future repo reads if you've drifted away from the spec/research." A research file records what was true on the day it was written, so a stale one is worse than none. On balance, these files don't belong in git, and there is no standard home for them. People use Obsidian, a separate knowledge repo, or the issue tracker instead. This session files the report in the tracker's research directory named by your project's agent instructions.

**What counts as a "high-trust" primary source, and who decides?**

The [model](https://www.aihero.dev/ai-coding-dictionary/model) does. The skill names the *kinds* of source that qualify (official docs, source code, specs, first-party APIs), and there is no allowlist, no domain gate, and no verification pass. This was the loudest objection when the skill was first proposed, and nobody has answered it publicly: "Five research subagents pointed at junk just gives you five confident wrong answers faster. How are you gating what counts as high-trust sources?" Your only protection is the citation on each claim. Follow two or three of them. If they land on a summary of the thing rather than the thing, the run failed.

**Does a later session reuse what an earlier run found?**

No. Nothing loads a past research file automatically. The file stays in the repo until a human or a skill points at it. This was the strongest early challenge to the design: "the value's the markdown becoming context the agent re-reads later, not the fetch itself. A write-once dead file is just a fancy search." The shipped skill does not solve it. In practice, the file is useful only when you feed it into the next step yourself: attach it to a spec, quote it into a grilling session, point a [ticket](https://www.aihero.dev/ai-coding-dictionary/ticket) at it.

**Why not just ask the agent to go read the docs?**

You can, and a two-line prompt saying exactly that was the practice this skill replaced. The skill gives you two things the prompt does not. It runs in the background, so your session's [context](https://www.aihero.dev/ai-coding-dictionary/context) stays clean. And the primary-source constraint and the cited-file output are the same every time, rather than depending on how you phrased the prompt. Compared with a [harness](https://www.aihero.dev/ai-coding-dictionary/harness)'s own deep-research mode, the difference is the file and the primary-source rule, not the search. If a two-line prompt gets you what you need on a small question, use the two-line prompt.

**When does it stop reading?**

The skill has no stopping criterion. This shows up as two complaints that look opposite but have the same cause: agents that go far too deep, and agents that cover a topic broadly but miss the one detail that mattered. One practitioner put it as "deep-research skills are a bit too deep sometimes. And telling an agent to research usually results in missing crucial details." You have to set the scope. A narrow, answerable question (one API, one behaviour, one version claim) comes back far better than "research X".

**`/wayfinder` created research tickets. Do I resolve those myself?**

No. A charting session launches one researcher per research ticket through this skill and runs them in parallel. Each reports back without editing; this session files the findings in the feature checkout's research directory and links them from the ticket. Research tickets are the exception to wayfinder's one-ticket-per-session rule because they are [AFK](https://www.aihero.dev/ai-coding-dictionary/afk).

## It's working if

- Your own session keeps going. If you are sitting watching it read, the delegation didn't happen.
- Exactly one new background task appears. A second one with a near-identical name is the nesting bug.
- The researcher reports without changing the checkout; this session files one report under the tracker's research directory and tells you its path.
- Every claim in it carries a link, and following two at random lands you on an official doc, a spec, or the source file itself, not on someone's write-up of it.
- You can make the decision you were stuck on from the file alone, without going back to the sources yourself.

## Where it fits

`research` is a reach-for-it-anytime standalone. It feeds the thinking skills and is not a step in the build chain. You take its file *into* the flow. [grilling](https://aihero.dev/skills-grilling) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs) ask sharper questions when they already have the facts, and [to-spec](https://aihero.dev/skills-to-spec) can synthesise against it. [wayfinder](https://aihero.dev/skills-wayfinder) is the one skill that invokes it directly. It launches one researcher per research ticket through `/research`, then files and links each report itself. For the whole map, see [ask-matt](https://aihero.dev/skills-ask-matt).
