# Rust

## 1. Detect

Inspect the workspace members, default members, crate visibility, integration tests and existing check runner. Find the core crate and shell crate. If absent, scaffold a `<name>-core` / `<name>-cli` split in step 5, extracting one pure calculation and leaving existing effects in the shell.

Private modules (or `pub(crate)` items) hide implementation; export selected public items from `lib.rs`. Integration tests in the crate's `tests/` directory act as outside callers. Unit tests inside the library can access internals, so use integration tests for the public behaviour proof. Cargo rejects crate dependency cycles; it does not reject all intra-crate module reference cycles. Public submodules remain public: keep implementation modules private.

## 2. Install

Verify `cargo clippy --version`. If the component is missing, install the Clippy component for the repository's selected Rust toolchain. Preserve the toolchain version; report unavailable tooling as blocked.

## 3. Configure

Write this prototype-derived `clippy.toml` **inside the core crate**, beside its `Cargo.toml`. Keep shell crates free to perform I/O. Run from the workspace root with `CLIPPY_CONF_DIR` unset so each crate's configuration is discovered normally; check for an existing override before changing it.

```toml
disallowed-methods = [
    { path = "std::fs::read", reason = "core-is-sans-io" },
    { path = "std::fs::read_to_string", reason = "core-is-sans-io" },
    { path = "std::fs::write", reason = "core-is-sans-io" },
    { path = "std::fs::create_dir_all", reason = "core-is-sans-io" },
    { path = "std::fs::remove_file", reason = "core-is-sans-io" },
    { path = "std::process::Command::new", reason = "core-is-sans-io" },
    { path = "std::process::exit", reason = "core-is-sans-io" },
    { path = "std::env::var", reason = "core-is-sans-io" },
    { path = "std::env::args", reason = "core-is-sans-io" },
    { path = "std::env::current_dir", reason = "core-is-sans-io" },
    { path = "std::time::SystemTime::now", reason = "core-is-sans-io" },
    { path = "std::time::Instant::now", reason = "core-is-sans-io" },
    { path = "std::net::TcpStream::connect", reason = "core-is-sans-io" },
    { path = "std::net::TcpListener::bind", reason = "core-is-sans-io" },
    { path = "std::io::stdin", reason = "core-is-sans-io" },
    { path = "std::io::stdout", reason = "core-is-sans-io" },
    { path = "std::io::stderr", reason = "core-is-sans-io" },
]

disallowed-types = [
    { path = "std::fs::File", reason = "immutable-by-default" },
    { path = "std::process::Command", reason = "immutable-by-default" },
    { path = "std::cell::RefCell", reason = "immutable-by-default" },
    { path = "std::cell::Cell", reason = "immutable-by-default" },
    { path = "std::sync::Mutex", reason = "immutable-by-default" },
    { path = "std::sync::RwLock", reason = "immutable-by-default" },
    { path = "std::sync::atomic::AtomicUsize", reason = "immutable-by-default" },
]

disallowed-macros = [
    { path = "std::println", reason = "core-is-sans-io" },
    { path = "std::eprintln", reason = "core-is-sans-io" },
    { path = "std::print", reason = "core-is-sans-io" },
    { path = "std::eprint", reason = "core-is-sans-io" },
    { path = "std::dbg", reason = "core-is-sans-io" },
]
```

Merge these tables into the **core crate's** `Cargo.toml`, preserving existing lint settings. If it inherits workspace lints, resolve that inheritance into the package's lint tables before adding these entries; Cargo does not allow mixing `[lints] workspace = true` with local overrides.

```toml
[lints.rust]
unsafe_code = "forbid"

[lints.clippy]
disallowed_methods = "deny"
disallowed_types = "deny"
disallowed_macros = "deny"
```

Manifest lints cover integration-test targets too; attributes only in `lib.rs` would not. Every denylist entry carries `core-is-sans-io` or `immutable-by-default` as its reason. Preserve those names when extending the list for project-specific APIs. This finite list does not catch all I/O, interior mutation or effects inside dependencies. Unsafe-code prohibition applies to this crate's code. `no_std` is not required and would not by itself prove purity.

## 4. Wire the umbrella check

The umbrella command, from the workspace root, is:

```sh
cargo clippy --all-targets -- -D warnings && cargo test
```

Ensure the selected workspace members include both core and CLI. If default members omit either, add `--workspace` to both commands so the umbrella covers them. Wire this ordered pair into an existing Makefile, justfile or xtask. If no runner exists, this pair is the new umbrella command. A standalone `cargo test` does not run Clippy.

## 5. Scaffold

For a new `example` workspace, use:

```toml
# Cargo.toml at the workspace root
[workspace]
members = ["example-core", "example-cli"]
resolver = "2"
```

```toml
# example-core/Cargo.toml; append the lint tables from step 3
[package]
name = "example-core"
version = "0.1.0"
edition = "2021"
```

```toml
# example-cli/Cargo.toml
[package]
name = "example-cli"
version = "0.1.0"
edition = "2021"

[dependencies]
example-core = { path = "../example-core" }
```

```rust
// example-core/src/lib.rs
mod selection;
pub use selection::select;
```

```rust
// example-core/src/selection.rs
pub fn select(values: &[i32]) -> Vec<i32> {
    values.iter().copied().filter(|value| *value >= 0).collect()
}
```

```rust
// example-cli/src/main.rs
fn main() {
    println!("{:?}", example_core::select(&[-1, 2]));
}
```

```rust
// example-core/tests/example.rs
use example_core::select;

#[test]
fn selects_nonnegative_values() {
    assert_eq!(select(&[-1, 2]), vec![2]);
}
```

The CLI is the I/O shell, and the hidden selection module owns the decision. Preserve existing workspace metadata and members when adapting this scaffold.

## 6. Prove

Run the umbrella pair for each state:

1. Clean scaffold: both commands exit 0.
2. Change the integration test import to `use example_core::selection::select;`: the compiler rejects it with `error[E0603]`, `module selection is private`. `E0603` is the native entry-point diagnostic; Rust does not print the Python contract name `entry-point-boundary`.
3. Restore the test. Add `let _ = std::fs::read_to_string("probe");` inside the core's `select`: Clippy exits nonzero with `disallowed_methods` and the reason `core-is-sans-io`.
4. Restore core: both commands exit 0.

The planted I/O call is compiled, never executed: Clippy fails before the test command. Keep the `&&` ordering.

## 7. Document

Put the README beside the core and CLI crates. Explain the private modules/public exports, integration tests, crate-cycle coverage, finite I/O denylist and the umbrella pair. Follow [SKILL.md step 7](./SKILL.md#7-document-with-one-pointer-line) for the agent-instructions pointer, including the umbrella command in that line itself.
