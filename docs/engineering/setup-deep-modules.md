## What it does

`setup-deep-modules` makes package entry points enforceable in TypeScript, Python, and Rust, and adds checks for a sans-I/O core. It wires those checks into the command you already use to validate the repository, then plants violations to prove they fail.

Setup is complete only after a clean pass, a rejected deep import, a rejected I/O operation in core, and another clean pass after restoration. A config file alone does not count.

## When to reach for it

You invoke this by typing `/setup-deep-modules`, and the agent won't reach for it on its own. Reach for it when callers can reach into implementation details or a pure calculation keeps acquiring filesystem, clock, or process dependencies.

For deciding where an interface should go, use [codebase-design](https://aihero.dev/skills-codebase-design). This skill makes the chosen structure checkable.

## Prerequisites

Run it in the repository you want to configure, with its language toolchain available. It writes lint configuration, check wiring, a small example where needed, and a README beside the packages. Existing configuration is merged.

The navigation pointer goes in `AGENTS.md`, or the harness's instructions file when that is the only one; setup creates `AGENTS.md` only when neither exists.

## Deep modules and a sans-I/O core

A deep module hides substantial behaviour behind a small public interface. The core takes values and returns values; the shell gathers input and performs effects. A passing lint catches specific dependency mistakes, while review still needs to catch hidden effects and mutable state.

| Language | What runs with the normal check |
| --- | --- |
| TypeScript | dependency-cruiser in the `check` script |
| Python | import-linter and ruff in a subprocess test discovered by the test suite |
| Rust | Clippy before the test suite, with restrictions scoped to the core crate |

## Common questions

**How do I keep imports from reaching past an interface I have already designed?**

Run this setup to put that convention in the normal check command. Outside callers use public entry points, and a planted deep import must fail before setup is considered complete. The linter enforces access; it does not decide whether the interface is well designed.

**Where did `setup-ts-deep-modules` go?**

It is now `setup-deep-modules`, promoted from the experimental bucket and extended to Python and Rust. The TypeScript depth rules remain, with a separate check for I/O imports in core.

**Does this require moving the whole application into a pure core?**

No. Python starts with a `core/` package and Rust with a core crate, as small as one calculation. Existing I/O stays in the shell. Any narrower coverage needed for legacy cycles is documented rather than treated as a whole-repository pass.

## It's working if

- A test that imports private implementation fails with an architecture diagnostic.
- An I/O import or call planted in core fails with `core-is-sans-io` in the output.
- Removing the planted violations makes the normal check pass again.
- New contributors find the layout and check command through one pointer in the repository's agent instructions.

## Where it fits

This is a run-once setup. [codebase-design](https://aihero.dev/skills-codebase-design) helps choose the interface it enforces; [retro](https://aihero.dev/skills-retro) adds further checks as recurring mistakes emerge. [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest of the system.
