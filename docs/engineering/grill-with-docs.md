## What it does

`grill-with-docs` interviews you about a plan or design until you and the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) share one understanding of it, and writes the vocabulary and the hard decisions into your repo while it does. It runs [grilling](https://aihero.dev/skills-grilling) in rounds, then calls [to-spec](https://aihero.dev/skills-to-spec) to write a spec and tickets once the frontier is empty and you confirm the shared understanding.

It is **[stateful](https://www.aihero.dev/ai-coding-dictionary/stateful)**. The [session](https://www.aihero.dev/ai-coding-dictionary/session) leaves files on disk. When a term resolves, the skill writes it to `GLOSSARY.md` at once, not in a batch at the end. When a decision passes three gates, the skill writes it as an ADR. Those writes happen during the interview; the spec and tickets follow at the end. The artifacts are real files in a real repo, so they can be missing when you expected them, and they can drift when more than one person writes them.

## When to reach for it

You invoke this by typing `/grill-with-docs`, and the agent won't reach for it on its own.

Reach for it at the start of a change, in a repo, when the plan is still fuzzy and the words for the thing are not settled yet. It is the single-session tool. Which grilling skill you want depends on what is in front of you:

| What you have | Reach for |
| --- | --- |
| A repo, and a change you can settle in one session | `grill-with-docs` |
| An effort too big to hold in one session (a greenfield build, a large feature) | [wayfinder](https://aihero.dev/skills-wayfinder) |
| A repo with no domain docs at all, and no particular feature in mind | `grill-with-docs`, aimed at the repo rather than a change |
| A decision blocked on knowledge in someone else's head | [to-questionnaire](https://aihero.dev/skills-to-questionnaire) |

The wayfinder split comes down to session count: `/grill-with-docs` for single-session planning, `/wayfinder` for multi-session planning.

## Prerequisites

The skill writes into your repo, so you need to be somewhere it is safe to write. Resolved terms go to a `GLOSSARY.md` glossary at the root, or to the relevant context's `GLOSSARY.md`, if a `GLOSSARY-MAP.md` at the root marks the repo as multi-context. Decisions go to `docs/adr/`. The skill creates both only when it needs them. Nothing exists until the first term or decision is settled, so you set up nothing in advance.

It needs [grilling](https://aihero.dev/skills-grilling) for the interview, [domain-modeling](https://aihero.dev/skills-domain-modeling) for the glossary and ADRs, and [to-spec](https://aihero.dev/skills-to-spec) for the spec and tickets. Installing `grill-with-docs` alone gets you a skill that does not work. [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) must configure the tracker and triage labels before the publishing step.

## The paper trail

Three things come out of a session, and they are not equal.

| What resolved | Where it lands |
| --- | --- |
| A term: the project's own word for a thing | `GLOSSARY.md`, inline, the moment it resolves |
| A decision that is hard to reverse, surprising without context, and a real trade-off | An ADR under `docs/adr/` |
| The agreed plan and implementation work | A spec and tickets through `to-spec`, after your confirmation |

The glossary holds vocabulary, not implementation details or scratch notes. An ADR needs all three conditions at once, so most decisions do not qualify and most sessions produce none. The [spec](https://www.aihero.dev/ai-coding-dictionary/spec) captures the remaining build decisions from the same [context window](https://www.aihero.dev/ai-coding-dictionary/context-window), before you [clear](https://www.aihero.dev/ai-coding-dictionary/clearing) it.

The glossary is the lasting vocabulary record. This skill builds domain language: the project's own words, agreed once, so you, the agent and your colleagues do not have to work them out again. Not everyone agrees that this improves agent performance. The strongest objection is that a term and its plain-English expansion get the same result from the [model](https://www.aihero.dev/ai-coding-dictionary/model), and that the vocabulary mainly shortens communication between the humans who share it. On that view the glossary is still valuable, but the value goes to the humans.

## Common questions

**Should I use this or `/wayfinder`?**
Scope decides it. Use this for anything you can settle in one session; use [wayfinder](https://aihero.dev/skills-wayfinder) when the effort is too big to hold in one, and it charts the work as a map of decision [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) first. Wayfinder is slower and denser, and reaching for it on a well-scoped feature is the common mistake. It does not replace this skill, and it can start a grilling session for the parts of the map that suit one.

**It ran, but no `GLOSSARY.md` and no ADRs appeared.**
There are two known causes. The first is that nothing qualified. ADRs need all three gates, and a session about a change with no new vocabulary has nothing to write. The second is a real bug. When the skill runs inside another orchestration layer (a spec-driven-development wrapper, a multi-agent framework, a rule that invokes it as a step in someone else's pipeline), users report that the file-writing half silently does not happen, while the interview still runs. The bug is filed and unfixed. If you are in that setup, check the working directory before you trust the session's output.

**It asked everything at once, with no recommendations, and never mentioned `GLOSSARY.md`.**
That is the skill failing to load its two interview dependencies. Because the interview delegates to those skills, an agent that does not pick up [grilling](https://aihero.dev/skills-grilling) and [domain-modeling](https://aihero.dev/skills-domain-modeling) guesses at what grilling means, and you get every question at once with no structure. Partial loading is more confusing. `grilling` loads, `domain-modeling` does not, and you get a good interview with no paper trail. How often it happens depends on the model and the [effort](https://www.aihero.dev/ai-coding-dictionary/effort) level, and it is the most reported problem with this skill. If you suspect it, ask the agent directly which skills it loaded.

**Where did all my other decisions go?**
The finished interview now calls [to-spec](https://aihero.dev/skills-to-spec) in the same conversation to capture those decisions and write tickets. The glossary is still not a spec, and most answers do not earn an ADR. Re-read the spec against your answers: a later synthesis can still weaken a precise requirement.

**Can I point it at an existing repo that has no docs at all?**
Yes. This is the right skill for a codebase with no ADRs, no domain language and no design principles: invoke it and say "help me document my repo". Users often pair it with [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) for building or repairing a `GLOSSARY.md`. Expect to steer it. It reads code and asks you about what it finds, and you decide which of the words already in the codebase are the right ones.

**What should I do when the session ends?**
Confirm the shared understanding once the frontier is empty. The agent then calls [to-spec](https://aihero.dev/skills-to-spec), checks the test seams with you, and writes the spec and tickets. The final message gives you the breakdown; you choose [implement](https://aihero.dev/skills-implement) per ticket or [implement-spec](https://aihero.dev/skills-implement-spec) for the whole graph.

**Why is it called that?**
Nobody is happy with the name. There is an open suggestion to rename it `grill-domain-model`, which describes the behaviour more accurately. Nothing has moved on it. If a rename ever lands, the docs page moves with it and the URL changes.

## It's working if

- `GLOSSARY.md` changes *during* the session, term by term, rather than appearing in one lump at the end.
- The glossary reads as pure vocabulary (your project's words with tight definitions) and contains no implementation detail or spec-like prose.
- Questions the codebase can answer get answered by reading the codebase, not asked of you.
- You get few or no ADRs, and the ones you get are decisions you would be annoyed to have to argue again.
- It challenges a word you used because your existing glossary defines it differently.
- After your confirmation and the seam check, a spec and tickets appear without a second invocation.

## Where it fits

`grill-with-docs` is the head of the main build chain:

```txt
grill-with-docs → to-spec → implement → code-review → retro
```

It comes before anything is written down as a spec. It produces the shared understanding and settled vocabulary that [to-spec](https://aihero.dev/skills-to-spec) then synthesises without interviewing you again. It drives [domain-modeling](https://aihero.dev/skills-domain-modeling) for the glossary and ADRs, and [grilling](https://aihero.dev/skills-grilling) for the interview. Upstream of it, [wayfinder](https://aihero.dev/skills-wayfinder) charts efforts too large for one session and can hand parts of the map back down to it. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
