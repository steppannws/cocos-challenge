#!/usr/bin/env bash
# Lets the agent see the app: simulator/emulator + debug build + Metro + Maestro flow + screenshots.
#   scripts/run-app.sh [ios|android] [flow.yaml] [--rebuild]
# Screenshots land in artifacts/screenshots/<platform>/ (gitignored). Look at them after every UI change.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

REBUILD=false
PLATFORM=ios
FLOW=
for arg in "$@"; do
  case $arg in
    --rebuild) REBUILD=true ;;
    ios | android) PLATFORM=$arg ;;
    *) FLOW=$arg ;;
  esac
done
FLOW=${FLOW:-.maestro/smoke.yaml}
case $FLOW in /*) ;; *) FLOW=$ROOT/$FLOW ;; esac
OUT=$ROOT/artifacts/screenshots/$PLATFORM
# Override when another project already serves 8081: METRO_PORT=8082 scripts/run-app.sh
# iOS bakes the port into the build (RCT_METRO_PORT): add --rebuild the first time you change it.
METRO_PORT=${METRO_PORT:-8081}

# The Maestro installer puts it here; non-login shells (agents, CI) may not have it on PATH.
# Same for the Android SDK tools (emulator is not on PATH by default).
ANDROID_SDK=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}
export PATH="$PATH:$HOME/.maestro/bin:$ANDROID_SDK/emulator:$ANDROID_SDK/platform-tools"
# Gradle reads the SDK location from here when android/local.properties is absent.
export ANDROID_HOME=$ANDROID_SDK
# Banners and analytics notices are noise in agent output.
export MAESTRO_CLI_NO_ANALYTICS=1 MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true
# The XCUITest driver can take over a minute to come up on a cold simulator (Maestro default: 15 s).
export MAESTRO_DRIVER_STARTUP_TIMEOUT=${MAESTRO_DRIVER_STARTUP_TIMEOUT:-120000}
command -v maestro >/dev/null || {
  echo "Maestro is not installed: curl -fsSL https://get.maestro.mobile.dev | bash"
  exit 1
}
[ -f "$FLOW" ] || { echo "Flow not found: $FLOW"; exit 1; }

# App ids come from the native projects: the single source of truth in a bare app.
if [ "$PLATFORM" = ios ]; then
  APP_ID=$(grep -m1 -oE 'PRODUCT_BUNDLE_IDENTIFIER = [^;]+' ios/*.xcodeproj/project.pbxproj | sed 's/.*= //; s/"//g')
else
  APP_ID=$(grep -m1 -oE 'applicationId "[^"]+"' android/app/build.gradle | cut -d'"' -f2)
fi
[ -n "$APP_ID" ] || { echo "No bundle id / package found in the native project"; exit 1; }

# Metro first: the debug build loads its bundle from it as soon as it launches.
metro_up() { curl -fsS -o /dev/null "http://localhost:$METRO_PORT/status" 2>/dev/null; }
if metro_up; then
  # A Metro from another project on the same port would serve its bundle to this app.
  PID=$(lsof -ti "tcp:$METRO_PORT" -sTCP:LISTEN 2>/dev/null | head -1 || true)
  SERVING=$( [ -n "$PID" ] && lsof -a -p "$PID" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' || true)
  if [ -n "$SERVING" ] && [ "$SERVING" != "$ROOT" ]; then
    echo "Port $METRO_PORT already serves another project ($SERVING). Stop it or run with METRO_PORT=8082 (iOS: add --rebuild once)."
    exit 1
  fi
else
  (npx react-native start --port "$METRO_PORT") >"${TMPDIR:-/tmp}/run-app-metro.log" 2>&1 &
  trap 'pkill -f "start --port $METRO_PORT" 2>/dev/null || true' EXIT
  for _ in $(seq 1 90); do
    metro_up && break
    sleep 1
  done
  metro_up || { echo "Metro did not start. Log: ${TMPDIR:-/tmp}/run-app-metro.log"; exit 1; }
fi

if [ "$PLATFORM" = ios ]; then
  if ! xcrun simctl list devices booted | grep -q Booted; then
    # Runtimes are listed oldest first: take the newest iPhone.
    UDID=$(xcrun simctl list devices available | grep 'iPhone' | tail -1 | grep -oE '[0-9A-F-]{36}')
    xcrun simctl boot "$UDID"
    # The window is optional (Maestro drives a headless simulator); Xcode 27 has no Simulator.app.
    open -a Simulator 2>/dev/null || true
  fi
  UDID=$(xcrun simctl list devices booted | grep -oE '[0-9A-F-]{36}' | head -1)
  DEVICE=$UDID
  installed() { xcrun simctl get_app_container "$UDID" "$APP_ID" >/dev/null 2>&1; }
  build() {
    # The CLI runs pod install itself when the Pods are missing or stale.
    npx react-native run-ios --udid "$UDID" --no-packager --port "$METRO_PORT"
  }
else
  if ! adb devices | grep -qw device; then
    # Override with AVD=<name> when the first one is not bootable.
    AVD=${AVD:-$(emulator -list-avds | head -1)}
    [ -n "$AVD" ] || { echo "No Android emulator (AVD) found"; exit 1; }
    EMULATOR_LOG=${TMPDIR:-/tmp}/run-app-emulator.log
    emulator -avd "$AVD" -no-snapshot-save >"$EMULATOR_LOG" 2>&1 &
    EMULATOR_PID=$!
    # A broken AVD exits at once; `adb wait-for-device` would then wait forever.
    until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = 1 ]; do
      kill -0 "$EMULATOR_PID" 2>/dev/null || {
        echo "Emulator '$AVD' exited. Pick another with AVD=<name> (see: emulator -list-avds)"
        tail -n 5 "$EMULATOR_LOG"
        exit 1
      }
      sleep 2
    done
  fi
  # A fresh emulator's Gboard opens a "Try out your stylus" sheet over the keyboard and eats the first typed text.
  adb shell settings put secure stylus_handwriting_enabled 0 >/dev/null 2>&1 || true
  # The app always talks to 8081 on the device; map that to the host port Metro listens on.
  adb reverse tcp:8081 "tcp:$METRO_PORT" >/dev/null
  installed() { adb shell pm path "$APP_ID" 2>/dev/null | grep -q package:; }
  DEVICE=$(adb devices | awk 'NR == 2 { print $1 }')
  build() { npx react-native run-android --no-packager; }
fi

if $REBUILD || ! installed; then
  echo "Building and installing the debug app ($PLATFORM)..."
  build
fi

rm -rf "$OUT"
mkdir -p "$OUT"
# Maestro 2.x writes takeScreenshot files under <test-output-dir>/takeScreenshot/, not the cwd.
status=0
# --device: with a simulator and an emulator both running, Maestro would otherwise pick one at random.
maestro --device "$DEVICE" test --test-output-dir "$OUT/maestro" -e APP_ID="$APP_ID" "$FLOW" || status=$?
find "$OUT/maestro" -path '*takeScreenshot*' -name '*.png' -exec cp {} "$OUT/" \; 2>/dev/null || true

# Always leave a final-state screenshot, pass or fail.
if [ "$PLATFORM" = ios ]; then
  xcrun simctl io "$UDID" screenshot "$OUT/final.png" >/dev/null 2>&1 || true
else
  adb exec-out screencap -p >"$OUT/final.png" 2>/dev/null || true
fi

echo "Screenshots:"
ls -1 "$OUT"/*.png 2>/dev/null || echo "(none)"
exit $status
