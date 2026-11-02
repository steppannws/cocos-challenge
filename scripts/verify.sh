#!/usr/bin/env bash
# One command to check the work. Agents, the pre-commit hook and CI all run it.
#   scripts/verify.sh          typecheck + lint + test
#   scripts/verify.sh --full   + release bundles + dev bundle check (CI, releases, dependency or Metro changes)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f package.json ]; then
  echo "No app yet: run the init-project skill first."
  exit 0
fi

LOG_DIR="${TMPDIR:-/tmp}/verify-$$"
mkdir -p "$LOG_DIR"
METRO_PORT=8099
trap 'pkill -f "start --port $METRO_PORT" 2>/dev/null || true' EXIT

# Quiet on success, the end of the log on failure: the agent reads only what matters.
step() {
  local name=$1
  shift
  printf '\033[1m== %s\033[0m ' "$name"
  if "$@" >"$LOG_DIR/$name.log" 2>&1; then
    echo ok
  else
    echo FAILED
    tail -n 40 "$LOG_DIR/$name.log"
    echo "Full log: $LOG_DIR/$name.log"
    exit 1
  fi
}

# Release bundles for both platforms: what a store build ships, without the native toolchain.
export_bundles() {
  local platform
  for platform in ios android; do
    mkdir -p "$LOG_DIR/dist/$platform"
    npx react-native bundle --platform "$platform" --dev false --entry-file index.js \
      --bundle-output "$LOG_DIR/dist/$platform.jsbundle" --assets-dest "$LOG_DIR/dist/$platform"
  done
}

# A release bundle skips LogBox and its dependencies. Only a dev bundle (what a debug build
# loads) shows module resolution failures there.
check_dev_bundle() {
  local url code platform
  (npx react-native start --port "$METRO_PORT") >"$LOG_DIR/metro.log" 2>&1 &
  for _ in $(seq 1 90); do
    curl -fsS -o /dev/null "http://localhost:$METRO_PORT/status" 2>/dev/null && break
    sleep 1
  done
  for platform in ios android; do
    url="http://localhost:$METRO_PORT/index.bundle?platform=$platform&dev=true&minify=false"
    code=$(curl -s -o "$LOG_DIR/dev-$platform.js" -w '%{http_code}' --max-time 300 "$url" || true)
    if [ "$code" != 200 ]; then
      echo "$platform dev bundle: HTTP $code ($url)"
      head -c 800 "$LOG_DIR/dev-$platform.js"
      return 1
    fi
    # Without LogBox in the bundle this check proves nothing.
    grep -q parseLogBoxLog "$LOG_DIR/dev-$platform.js" || {
      echo "$platform dev bundle has no LogBox"
      return 1
    }
    echo "$platform dev bundle ok"
  done
}

step typecheck pnpm -s typecheck
step lint pnpm -s lint
step test pnpm -s test

if [ "${1:-}" = "--full" ]; then
  step bundle export_bundles
  step dev-bundle check_dev_bundle
fi

printf '\033[32mAll checks passed.\033[0m\n'
# Logs (and two bundles) only matter on failure.
rm -rf "$LOG_DIR"
