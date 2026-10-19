---
name: setup-deep-modules
description: Enforce deep modules and a sans-I/O core in TypeScript, Python, and Rust repositories, with checks that prove the rules bite.
disable-model-invocation: true
---

# Setup Deep Modules

Make packages **deep modules**: a lot of behaviour behind a small interface. Install architecture checks, put them in the repository's umbrella check, and prove that violations fail. Run once per repository; in a mixed repository, complete the relevant language branch for each owned source tree.

For the vocabulary (deep module, interface, seam, depth), call the Skill tool with "codebase-design" and use its language throughout.

## The shape this enforces

1. **Entry-point boundary**: outsiders import only a package's public entry points; implementation stays private.
2. **Intra-package freedom**: implementation files can import each other within their package, subject to the other rules.
3. **Tests through entry points**: behaviour tests use public entry points; their own fixtures stay private to tests.
4. **No cycles**: dependencies stay acyclic within the scope the language checker supports.

Prefer several small entry points to a barrel re-exporting a whole subtree. TypeScript uses root files and private subfolders; Python explicitly lists protected implementation packages; Rust uses private modules and public exports, with integration tests outside the library. The references spell out each check's coverage.

The fifth rule, **core-is-sans-io**, keeps a functional core / imperative shell: the shell gathers input, the core takes and returns values, and the shell performs the result. Pass clock and randomness as values, return effects as data, and keep business decisions in the core. Immutability is a separate concern. These lint checks catch named imports, calls, and types; they do not prove purity or forbid all mutation.

## Steps

### 1. Detect the environment

Inspect manifests, source trees, existing lint configuration, test discovery, and the current umbrella command. An owned source tree is code maintained by this repository, excluding vendored dependencies and generated code. Detect TypeScript from `package.json` or `tsconfig.json`, Python from `pyproject.toml`, `setup.cfg` or `setup.py`, and Rust from `Cargo.toml` before installing anything.

Report any other language as unsupported and leave it alone. Read only the relevant references, then follow their numbered sections alongside these steps:

| Source tree | Reference |
| --- | --- |
| TypeScript | [typescript.md](./typescript.md) |
| Python | [python.md](./python.md) |
| Rust | [rust.md](./rust.md) |

Preserve existing conventions and merge configuration. Record the package roots and legacy violations in the step 7 README; scope incremental adoption explicitly instead of presenting an excluded legacy tree as checked.

**Done when:** every supported source tree has a language, package root, config inventory, and check command identified.

### 2. Install the checks

Install per the reference, using the repository's dependency convention. Preserve existing version constraints and record the versions used.

**Done when:** the check executables run; a missing executable is a blocked setup, never a pass.

### 3. Write the config

Follow each relevant reference to adapt its configuration to the detected roots, preserving existing rules and named diagnostics.

**Done when:** configuration covers the intended packages, consumers and tests, with any narrower legacy coverage documented.

### 4. Wire into the umbrella check

| Language | Umbrella check |
| --- | --- |
| TypeScript | The `check` script, including `lint:boundaries` and existing typecheck/tests |
| Python | The test suite, discovering the subprocess architecture test that runs import-linter and ruff |
| Rust | `cargo clippy --all-targets -- -D warnings` followed by `cargo test` |

Create an umbrella check when none exists. For a multi-language repository, wire each language's check into its existing top-level runner, or document all required commands if there is no shared runner. For Rust, follow the reference to wire the pair into an existing Makefile, justfile or xtask.

**Done when:** the normal check command reaches the architecture checks, without a separate manual lint step.

### 5. Scaffold an example

Follow the reference's small example and public behaviour test. Reuse an existing suitable example; otherwise add a copy-me template. Scaffold Python's `core/` or Rust's `<name>-core` / `<name>-cli` split when absent, starting with one pure calculation instead of moving the whole legacy implementation.

**Done when:** a public entry point delegates to private implementation, the test uses that entry point, and the core consumes and returns values.

### 6. Prove the rules bite

For each language, use its documented umbrella command and plants:

1. Observe a clean pass.
2. Plant a deep import in a behaviour test. Observe failure with the named rule or native compiler diagnostic from the reference.
3. Remove that plant; plant the specified I/O import or call in the core. Observe failure with `core-is-sans-io` in the output.
4. Remove the plant and observe a clean pass again.

Save the original bytes before each plant and restore them even if a command fails unexpectedly. Record commands, exit codes, and diagnostic names. A failure for an unrelated reason does not count; repair the wiring and repeat. Report unavailable tools as blocked and leave the source clean.

**Done when:** every language has a clean pass, both expected failures, and a final pass through its umbrella check.

### 7. Document with one pointer line

Write a short README beside the packages: the layout, public entry points, the four shape rules, the sans-I/O core, actual coverage limits, and the umbrella command. Discourage barrels and show the copy-me layout.

Add one pointer line to `AGENTS.md`, or `CLAUDE.md` when that is the only agent instructions file; create `AGENTS.md` if neither exists. Include the umbrella command for every language in that line so lifecycle skills can resolve it from the line alone. For example: "Packages are deep modules: run `<umbrella command>` before completing work; see [src/packages/README.md](./src/packages/README.md) before adding or importing one." For Rust, the command includes the clippy-then-test pair. Merge an existing pointer instead of duplicating it.

**Done when:** the README describes the checks actually proved, and the instructions file names the umbrella command and points to the README in one line.
