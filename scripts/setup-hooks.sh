#!/usr/bin/env bash
# Enables .githooks/pre-commit. The `prepare` script runs it on every pnpm install.
# core.hooksPath resolves from the git root: with the app nested inside another repo the hook
# would never run and nothing would say so.
root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "setup-hooks: not a git repository yet (run git init); pre-commit hook not enabled"
  exit 0
}
if [ "$root" != "$(pwd -P)" ]; then
  echo "setup-hooks: $(pwd -P) is not the git root ($root). Make the app the git root so the pre-commit hook runs." >&2
  exit 1
fi
git config core.hooksPath .githooks
