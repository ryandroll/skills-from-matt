---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a researcher.
---

Launch a **researcher** in the background, so you keep working while it reads. If you are already the researcher, do the investigation directly and return the findings to the primary.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Return the findings as Markdown, citing each claim's source. The researcher reports and never writes in a checkout.

The primary files the findings under `docs/research/`, the tracker's research directory as named by the project's agent instructions, and returns a context pointer to the file.
