---
name: verify
description: Checks the app with one command (typecheck, lint, tests; with --full also the release bundles and the dev bundle check). Use before saying a task is done, before committing, after changing dependencies, Metro, Babel or native config, or when the user says "verify", "check", "run the checks", "is it green".
---

# Verify

Run from the repo root:

```bash
pnpm verify          # typecheck + lint + test. Every task, before "done"
pnpm verify:full     # + release bundles (ios, android) + dev bundle check
```

Use `verify:full` after changing dependencies, `metro.config.js`, `babel.config.js`, or anything native, and before a release. CI runs it on every push.

## Reading the output

- Each step prints `ok` or `FAILED`. On failure you get the last 40 lines and the path to the full log.
- Fix the first failure, then run the same command again. Do not report done until the last line is `All checks passed.`
- `dev-bundle` failed but `bundle` passed: a module resolves in the release bundle but not in the dev bundle (usually a resolution problem only LogBox's dependencies hit).

## Rules

- Never weaken a check to make it pass (no `eslint-disable`, `@ts-ignore`, skipped tests) unless the user agrees. Fix the cause.
- The same script runs in the pre-commit hook (`.githooks/pre-commit`) and in CI, so a local pass means the commit will pass.
