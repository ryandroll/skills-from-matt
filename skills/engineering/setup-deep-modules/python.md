# Python

## 1. Detect

Find the importable package roots, all local consumer roots, implementation subpackages, test runner and test discovery pattern. The template uses a flat `example/` package and `tests/`; adapt the paths and dotted names for the repository. With a `src/` layout, make both `src/` and the repository root importable to the checker.

Public entry points are the package root and its root-level modules. Explicitly list every implementation subpackage in the protected and tests contracts. Include all local consumers in `root_packages`; unlisted source trees are not checked. Unlike the TypeScript depth rule, a new private Python subpackage requires a config update.

## 2. Install

Use import-linter 2.15 or a compatible version supporting `acyclic_siblings`, and ruff. Either use isolated `uvx` commands or add both to the project's existing development environment and run its `lint-imports` and `ruff` executables. Verify availability:

```sh
uvx --from import-linter==2.15 lint-imports --version
uvx ruff --version
```

Preserve project pins. Offline invocations need these tools cached in advance; unavailable tools must fail the architecture test rather than skip it.

## 3. Configure

Write the contracts into `.importlinter` at the import root or the existing import-linter section of `setup.cfg` or `pyproject.toml`, adapting the syntax and checker config path to that file. `include_external_packages = True` is a global option: it applies to both forbidden contracts, including the standard-library imports in core.

```ini
[importlinter]
root_packages =
    example
    tests
include_external_packages = True

[importlinter:contract:entry-point-boundary]
name = entry-point-boundary
type = protected
protected_modules =
    example.core
allowed_importers =
    example

# intra-package-freedom is implicit: no independence contract is imposed.

[importlinter:contract:tests-through-entrypoints]
name = tests-through-entrypoints
type = forbidden
source_modules =
    tests
forbidden_modules =
    example.core
allow_indirect_imports = True

[importlinter:contract:no-cycles]
name = no-cycles
type = acyclic_siblings
ancestors =
    example

[importlinter:contract:core-is-sans-io]
name = core-is-sans-io
type = forbidden
source_modules =
    example.core
forbidden_modules =
    subprocess
    os
    socket
    shutil
    time
    random
    secrets
    datetime
    pathlib
    tempfile
    http
    urllib
```

The protected contract allows the package's own imports, while the tests contract disallows direct imports into implementation. `allow_indirect_imports = True` lets tests call public entry points that delegate to core. Keep indirect checking enabled for `core-is-sans-io`.

For each additional package, add its root and a protected contract with that package's own allowed importers; use distinct section identifiers and preserve the diagnostic name `entry-point-boundary`. Add its private packages to the tests contract and its core to the I/O contract. `acyclic_siblings` allows acyclic dependencies rather than imposing independence on modules that need to call each other. Start new packages with the whole package in `ancestors`. If legacy cycles prevent adoption, scope this contract to the new core, record that reduced coverage, and leave legacy cleanup as separate work. Adopt `core-is-sans-io` against `core/` only, never the entire legacy package.

Merge this into `pyproject.toml` or the existing ruff config file (`ruff.toml`, `.ruff.toml`), preserving other selected ruff rules (use `[lint]` in a standalone ruff config):

```toml
[tool.ruff.lint]
extend-select = ["PLW0603", "B006"]
```

`PLW0603` rejects global assignments and `B006` rejects mutable argument defaults. They do not enforce all immutability: prefer frozen dataclasses, tuples and value inputs. The import rule forbids `pathlib` and `datetime` whole because it cannot distinguish value operations from I/O or clock calls. Built-in `open`, dynamic imports, unlisted effects and effects inside external dependencies still require review.

## 4. Wire the test suite

Adapt this prototype-derived subprocess test to the runner's discovered test directory. The example is `tests/test_architecture.py`; ensure `tests/__init__.py` exists so import-linter sees the tests. Adjust `ROOT`, the source roots in `PYTHONPATH`, and ruff's paths for the actual layout.

```python
"""Architecture checks discovered by the normal test suite."""
import os
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ArchitectureTests(unittest.TestCase):
    def run_check(self, command):
        env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1",
               "PYTHONPATH": os.pathsep.join((str(ROOT), str(ROOT / "src")))}
        result = subprocess.run(
            command, cwd=ROOT, env=env, capture_output=True, text=True, check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_import_contracts(self):
        self.run_check([
            "uvx", "--from", "import-linter==2.15", "lint-imports",
            "--config", ".importlinter", "--no-cache",
        ])

    def test_immutable_defaults(self):
        self.run_check(["uvx", "ruff", "check", "example", "tests"])


if __name__ == "__main__":
    unittest.main()
```

For the project's own environment, replace the command prefixes with its `lint-imports` and `ruff` executables. Keep the config arguments, working directory, captured diagnostics, and nonzero-exit assertion. Pin the selected versions according to the project's existing convention.

Run the existing test suite and verify that both architecture test methods are discovered. If there is no runner, use `python -m unittest discover -s tests -v` as the umbrella command. Do not leave architecture as a manually invoked test outside discovery.

## 5. Scaffold

If there is no core, create `example/core/__init__.py` and one pure calculation in `example/core/selection.py`, taking a snapshot as values and returning a decision as values. A minimal copy-me calculation:

```python
def select(values: tuple[int, ...]) -> tuple[int, ...]:
    return tuple(value for value in values if value >= 0)
```

Create `example/__init__.py` and expose that single behaviour from `example/api.py`:

```python
from .core.selection import select

__all__ = ["select"]
```

Create `tests/__init__.py` and `tests/test_example.py`:

```python
import unittest

from example.api import select


class ExampleTests(unittest.TestCase):
    def test_select(self):
        self.assertEqual(select((-1, 2)), (2,))
```

Use the real package name. As with the prototype's selection calculation, start with one value-only module; keep existing I/O in the shell. Add further implementation subpackages to the contracts as they appear.

## 6. Prove

Use the discovered test-suite command for every state (new runner: `python -m unittest discover -s tests -v`):

1. Clean scaffold: exit 0, including both `ArchitectureTests` methods.
2. Change `from example.api import select` in the behaviour test to `from example.core.selection import select`: nonzero with `entry-point-boundary` and `tests-through-entrypoints` in the captured checker output.
3. Restore the test, then add `import subprocess` to `example/core/selection.py`: nonzero with `core-is-sans-io`.
4. Restore core: exit 0.

If existing ruff rules also reject the planted unused import, the import-contract test must still run and emit `core-is-sans-io`; that is the architecture proof.

## 7. Document

Put the short README beside the packages (repository root for this flat example, `src/README.md` for a `src/` layout). Show the public root modules, private `core/`, tests, the discovered suite command and any reduced cycle coverage. Explain the need to register new private subpackages and consumer roots. Follow the shared pointer-line step, including the umbrella command in the agent-instructions line itself.
