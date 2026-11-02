---
name: run-app
description: Launches the app on the iOS simulator or Android emulator, runs a Maestro flow and saves screenshots to artifacts/screenshots/. Use after any UI change, to reproduce a UI bug, or when the user says "run the app", "show me", "screenshot", "does it look right", "test on simulator".
---

# Run app

```bash
scripts/run-app.sh                              # iOS, .maestro/smoke.yaml
scripts/run-app.sh android                      # Android emulator
scripts/run-app.sh ios .maestro/place-order.yaml # a specific flow
scripts/run-app.sh ios --rebuild                # force a new debug build (after a native change)
METRO_PORT=8082 scripts/run-app.sh ios --rebuild # another project already uses port 8081 (iOS bakes the port into the build)
```

The script starts Metro, boots a simulator if none is running, builds and installs the debug app if it is missing, runs the flow, and saves screenshots to `artifacts/screenshots/<platform>/` (`final.png` is always there, pass or fail).

## After it runs

1. Open every screenshot it lists and check them against the task. Do not describe UI you have not looked at.
2. A flow failed: the screenshot shows the state at failure. Fix the app, not the flow, unless the flow is wrong.

## Writing flows

- One file per user journey in `.maestro/`. Start from `smoke.yaml`: `launchApp` → wait for a `testID` → steps → `takeScreenshot`.
- Select elements by `id` (the component's `testID`), not by text: text changes with the language.
- `takeScreenshot: <name>` after each meaningful state.

## Requirements

Maestro (`curl -fsSL https://get.maestro.mobile.dev | bash`), Xcode + CocoaPods for iOS, Android Studio with one AVD for Android. The first run builds the app and takes several minutes.
