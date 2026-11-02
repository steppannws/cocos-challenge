#!/usr/bin/env bash
# Claude Code Stop hook: Claude cannot finish while verify fails.
# Exit 2 sends stderr back to Claude and it keeps working.
input=$(cat)
# Already blocked once this turn: let it stop, or a failure the agent cannot fix loops forever.
case $input in *'"stop_hook_active":true'* | *'"stop_hook_active": true'*) exit 0 ;; esac
cd "$(dirname "$0")/../.." || exit 0
# Clean tree: nothing changed since the last commit, which the pre-commit hook already verified.
# No git repo yet (no `git init`): no shortcut, always verify.
if out=$(git status --porcelain 2>/dev/null) && [ -z "$out" ]; then exit 0; fi
scripts/verify.sh >&2 || exit 2
