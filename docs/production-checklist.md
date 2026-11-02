# Production checklist

Walk this before the first store submission and before each major release. Items marked (CI) are automated.

## Build and release

- [ ] `pnpm verify:full` green (CI)
- [ ] `eas.json` profiles: `development`, `preview`, `production`. Each has its own `channel`
- [ ] Build numbers (`CURRENT_PROJECT_VERSION`, `versionCode`) bumped by the release script, never by hand, and in sync with `package.json`
- [ ] Bundle id / package name final. They cannot change after the first submission
- [ ] No OTA/CodePush layer in this app: every JS change ships as a new build. If one is added later, pin its runtime version to the native build
- [ ] Native change (new native dependency, permission, Info.plist/AndroidManifest edit) → new build, and `pnpm pods` + a clean rebuild locally before the release build
- [ ] Production env vars come from the CI secret store into an `ENVFILE` for `react-native-config`; `.env` in the repo holds public defaults only
- [ ] Minimum supported version gate: the app asks the server for the minimum version at launch and shows a blocking update screen below it. OTA cannot fix an old binary

## Check the built binary, not the source

From a past app's release script. Run on the production build artifact:

- [ ] API URL in the bundle is the production one (no `localhost`, LAN IP or staging host)
- [ ] Android: `usesCleartextTraffic=false` in the release manifest (`plugins/noCleartext.js`)
- [ ] Android: no `AD_ID` permission unless you use advertising ID (and declared it in Play Console)
- [ ] Android: signed with the release key, not the debug key
- [ ] Debug screens, dev menus and test accounts only behind `__DEV__`

## Store review

- [ ] Apple 3.1.1: no links or copy pointing to external purchases for digital goods. Rejected in a past app
- [ ] Sign in with Apple, if any other social login exists (iOS)
- [ ] Account deletion inside the app, if accounts can be created
- [ ] Privacy policy URL and support URL live
- [ ] iOS privacy manifest: every "required reason" API declared (check third-party libraries; the template ships `PrivacyInfo.xcprivacy`)
- [ ] App Store privacy labels and Play data safety form match what the app and its SDKs collect
- [ ] Permission prompts: every `NS*UsageDescription` / Android permission has a real, specific reason string, and is requested only when needed
- [ ] Screenshots, description, keywords, age rating, review notes with a demo account

## Monitoring

- [ ] Crash reporting on (Sentry, `SENTRY_DSN` set for the release `ENVFILE`), with source maps uploaded for every build
- [ ] Crash reporting starts at app launch, before login. Consent gates only the user identity attached to events; never attach identity for minors
- [ ] Global JS error handler + React error boundary at the root. No `LogBox.ignoreAllLogs()`
- [ ] Release/version tag on every event, so a crash maps to a build and an update

## Upgrades

- [ ] Upgrade React Native one minor at a time with the Upgrade Helper, soon after each release. A past app spent 10 weeks on a two-version jump that broke analytics, crash reporting and payments SDKs
- [ ] Run `scripts/run-app.sh` on both platforms before and after, and compare the screenshots
- [ ] Re-check every patch in `patches/` against the new library versions

## Devices

- [ ] Phones only: `ios.supportsTablet: false` in `app.config.ts`. Tablets supported: smoke screenshots on an iPad simulator and a tablet emulator

## Offline and data

- [ ] Kill the app with pending outbox entries → reopen → entries are sent (`docs/offline.md`)
- [ ] Airplane mode: every main screen shows cached data or a designed empty state, never a spinner forever
- [ ] Logout with pending entries asks before discarding

## Accessibility

- [ ] VoiceOver and TalkBack pass on the main flows: every control has a role and a label
- [ ] Text scales with system font size without clipping (test at the largest size)
- [ ] Touch targets at least 44×44 pt
- [ ] Contrast at least 4.5:1 for body text

## Performance

- [ ] Long lists use `FlashList` or a correctly keyed `FlatList`
- [ ] Remote images sized and cached (`Image` with explicit dimensions; a cache library only if the app grows image-heavy)
- [ ] Cold start measured on a low-end Android device

## Security

- [ ] Tokens, if the app ever gets auth, only in Keychain/Keystore (`react-native-keychain`), never in MMKV or AsyncStorage
- [ ] No secrets in `.env` (it is bundled into the app) or in the repo (gitleaks in CI)
- [ ] Certificates/keys for push and signing stored in EAS, not in the repo
- [ ] Deep links validated before navigation

## Apps for children or handling money (skip otherwise)

- [ ] COPPA / Google Play Families: no `AD_ID`, no IDFA-collecting SDKs. Audit every analytics and attribution SDK. A past kids app shipped a hotfix to remove `AD_ID`
- [ ] Device integrity: Play Integrity API, not SafetyNet (shut down)
- [ ] Certificate pinning, if used: a backup pin and a rotation plan before the certificate expires
- [ ] Biometric or password re-auth before sensitive actions (transfers, changing payout details)
- [ ] Money amounts tested with rounding edge cases (`0.1 + 0.2`, sell-all, currency with no minor unit)
