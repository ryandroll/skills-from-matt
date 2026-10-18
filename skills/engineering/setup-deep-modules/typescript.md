# TypeScript

Copying only `dependency-cruiser.config.cjs` omits the fifth rule, `core-is-sans-io`; append the rule from step 3.

## 1. Detect

Detect the package manager from `pnpm-lock.yaml`, `yarn.lock`, `bun.lock` or `bun.lockb`, otherwise use npm. Use it for installation and scripts. Prefer `src/packages` when `src/` exists, otherwise `packages`; follow an established packages root when present. Packages are one flat tier under that root. Root files are public entry points; anything in any subfolder is private, conventionally `lib/` and `tests/`.

Find any `.dependency-cruiser.*` config and merge the rules and options instead of overwriting it. Preserve existing typecheck and test commands. Keep existing `tsconfig` and path aliases unchanged.

## 2. Install

Install `dependency-cruiser` as a development dependency with the detected package manager (npm: `npm install --save-dev dependency-cruiser`). Use a TypeScript version inside dependency-cruiser's supported range (currently `<7`); if the project's compiler is absent or outside that range, install `typescript@^6` as a development dependency so dependency-cruiser can parse TypeScript (npm: `npm install --save-dev 'typescript@^6'`).

## 3. Configure

Write `.dependency-cruiser.cjs` at the repository root. This is the upstream template, also available as [dependency-cruiser.config.cjs](./dependency-cruiser.config.cjs). Change only `PACKAGES_ROOT` in this base template. The `$1` group matching is what allows each package to reach its own implementation. Keep `.cjs` so `module.exports` works in projects using `"type": "module"`.

```javascript
// @ts-check
// Deep-module enforcement for dependency-cruiser.
//
// Each package under the packages root is a DEEP MODULE: a lot of behaviour
// behind a small interface. A package's PUBLIC SURFACE is its ENTRY POINTS:
// the files at the package root. Implementation lives in SUBFOLDERS and is
// private (by convention `lib/` for implementation and `tests/` for tests,
// though any subfolder is private). A package may expose several small entry
// points (index.ts, client.ts, server.ts, …); prefer that over one giant
// barrel index.
//
// The only thing you should ever need to edit here is PACKAGES_ROOT.

/** Where packages live. One immediate child dir per package (flat, no nesting). */
const PACKAGES_ROOT = "src/packages";

// --- derived patterns (no need to edit) -------------------------------------
const R = PACKAGES_ROOT;
/**
 * A package's private internals: anything nested inside a package subfolder.
 * The package's root files are its entry points and are NOT matched here:
 * they stay importable from outside.
 */
const PACKAGE_INTERNALS = `^${R}/[^/]+/[^/]+/`;

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "entrypoint-boundary-from-app",
      comment:
        "App/root code may import a package's entry points (its root files), but nothing inside its subfolders.",
      severity: "error",
      from: { pathNot: `^${R}/` }, // importer is NOT inside any package
      to: { path: PACKAGE_INTERNALS },
    },
    {
      name: "entrypoint-boundary-across-packages",
      comment:
        "A package's own files import each other freely, but may reach OTHER packages only through their entry points, never their internals.",
      severity: "error",
      // importer is inside a package ($1), but is not a test file
      from: { path: `^${R}/([^/]+)/`, pathNot: `^${R}/[^/]+/tests/` },
      to: {
        path: PACKAGE_INTERNALS,
        pathNot: `^${R}/$1/`, // same package → intra-package freedom
      },
    },
    {
      name: "tests-through-entrypoints",
      comment:
        "A package's tests exercise it through its entry points like everyone else: they may import any package's entry points and their own tests/ fixtures, but never any package's internals, not even their own.",
      severity: "error",
      from: { path: `^${R}/([^/]+)/tests/` }, // a test file, in package $1
      to: {
        path: PACKAGE_INTERNALS,
        pathNot: `^${R}/$1/tests/`, // own tests/ fixtures → allowed
      },
    },
    {
      name: "tests-folder-is-private",
      comment:
        "A package's tests/ folder is reachable only from tests: nothing else may import fixtures.",
      severity: "error",
      from: { pathNot: `^${R}/[^/]+/tests/` }, // importer is not itself a test
      to: { path: `^${R}/[^/]+/tests/` },
    },
    {
      name: "no-circular",
      comment: "No dependency cycles. Scope to `^${R}/` if you want to allow cycles outside packages.",
      severity: "error",
      from: {},
      to: { circular: true },
    },

    // --- Layering (optional, off by default) ----------------------------------
    // Interface-hiding controls HOW you import (through the entry points).
    // Layering controls WHICH packages may depend on which. Add your own rules
    // here, e.g.:
    //
    // {
    //   name: "ui-may-not-depend-on-billing",
    //   severity: "error",
    //   from: { path: `^${R}/ui/` },
    //   to:   { path: `^${R}/billing/` },
    // },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    },
  },
};
```

For the fifth rule, append this separate addition after the template's `module.exports` assignment. It leaves the upstream shape rules intact. Use a `core/` subfolder for value-only code; the example entry point delegates into it. The package's other folders may perform I/O.

```javascript
module.exports.forbidden.push({
  name: "core-is-sans-io",
  comment: "Pass values into core; perform I/O in the shell.",
  severity: "error",
  from: { path: `^${R}/[^/]+/core/` },
  to: {
    path: "^(node:)?(fs|child_process|cluster|net|http|https|http2|dns|dgram|tls|readline|repl|worker_threads|process|os)(/|$)",
  },
});
```

dependency-cruiser does not see `node:`-prefixed subpath imports such as `node:fs/promises`, so core code writes `fs/promises` or the reviewer checks them.

This addition checks direct imports of the listed runtime modules. Global `fetch`, `Date.now`, `Math.random`, dynamic access and I/O hidden in other modules still require review. Dependency checks do not enforce immutability. Keep core imports value-only; extend the rule for project-specific effectful dependencies as they appear.

## 4. Wire the check

Add `lint:boundaries`: `depcruise src` when source lives under `src/`; otherwise include the packages root **and all application/consumer source roots** in the command. Scanning packages alone misses deep imports from unscanned app code.

Add it to the `check` script alongside existing typecheck/tests. If an umbrella script has another name, preserve it and make `check` delegate to it with the architecture lint included once. If none exists, create `check` to run `lint:boundaries` and any existing typecheck/tests. With npm, the architecture part is `npm run lint:boundaries`.

## 5. Scaffold

Create `<packages-root>/example/` as a copy-me template. The extra `core/` is private under the same depth rule as `lib/`:

- `index.ts`: `export { select } from "./core/selection";`
- `core/selection.ts`: `export function select(values: readonly number[]) { return values.filter(value => value >= 0); }`
- `tests/example.test.ts`: import `select` from `../index` and assert that `select([-1, 2])` returns `[2]`, using the repository's test convention. Fixtures stay inside this tests folder.

Use the project's existing import-extension convention. The root entry point exposes one behaviour, not a barrel over all internals. Tell the user this starter may be copied or deleted.

## 6. Prove

A clean run that reports `0 modules ... cruised` or `missing-typescript-transpiler` is failed wiring, not a pass.

Run `npm run check` (or its package-manager equivalent) for each state:

1. Clean scaffold: exit 0.
2. Change the test's import of `select` to `../core/selection`: nonzero with `tests-through-entrypoints`.
3. Restore the test, then add `import "node:fs";` to `core/selection.ts`: nonzero with `core-is-sans-io`.
4. Restore core: exit 0.

## 7. Document

Put the README at `<packages-root>/README.md`, showing root entry points, private `core/`, `lib/`, and `tests/`, and the `check` command. Explain that adding any new subfolder needs no shape-rule change, and that several small root entry points are preferable to a barrel. Follow the shared pointer-line step.
