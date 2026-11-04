# Production checklist

Do these checks before the first store submission and before each major release. CI does the items marked (CI). This app has not had a store release, so no item is checked yet.

## Build and release

- [ ] `pnpm verify:full` is green (CI).
- [ ] A release script sets the build numbers (iOS `CURRENT_PROJECT_VERSION`, Android `versionCode`) from `package.json`. Nobody changes them by hand.
- [ ] The bundle id and the package name are final. You cannot change them after the first submission.
- [ ] This app has no over-the-air update layer, so each JS change needs a new build. If you add such a layer later, pin its runtime version to the native build.
- [ ] A native change needs `pnpm pods` and a clean local build before the release build. Native changes are: a new native dependency, a permission, or an `Info.plist` or `AndroidManifest.xml` change.
- [ ] Production values come from the CI secret store into an `ENVFILE` for `react-native-config`. The `.env` file in the repo holds public defaults only.
- [ ] The app gets the minimum supported version from the server at launch. Below that version, it shows a screen that blocks use until the user updates. Only a new binary can fix an old binary.

## Check the release binary, not the source

Do these checks on the production build file:

- [ ] The API URL in the bundle is the production URL (no `localhost`, LAN IP or staging host).
- [ ] Android: the release manifest has `usesCleartextTraffic=false`. `tests/platform.test.ts` checks that the placeholder stays in `AndroidManifest.xml`.
- [ ] Android: no `AD_ID` permission, unless the app uses the advertising ID and the Play Console declares it.
- [ ] Android: the build has the release signature, not the debug signature.
- [ ] Debug screens, dev menus and test accounts exist only behind `__DEV__`. In this app, the bug level and the account reset on the Account tab are debug-only.

## Store review

- [ ] Apple guideline 3.1.1: no links or text that point to external purchases of digital goods.
- [ ] Sign in with Apple, if the app has any other social login (iOS).
- [ ] Account deletion in the app, if a user can make an account.
- [ ] The privacy policy URL and the support URL work.
- [ ] iOS privacy manifest (`ios/CocosChallenge/PrivacyInfo.xcprivacy`): it declares each "required reason" API. Check the third-party libraries too.
- [ ] The App Store privacy labels and the Play data safety form agree with the data that the app and its SDKs collect.
- [ ] Each `NS*UsageDescription` and each Android permission has a specific reason text. The app asks for a permission only when it needs it.
- [ ] Screenshots, description, keywords, age rating, and review notes with a demo account are ready.

## Monitoring

- [ ] Crash reporting is on (Sentry, with `SENTRY_DSN` set in the release `ENVFILE`). Each build uploads its source maps.
- [ ] Crash reporting starts at app launch, before login. User consent controls only the user identity attached to events. Never attach an identity for a minor.
- [ ] A global JS error handler and a React error boundary exist at the root. No `LogBox.ignoreAllLogs()`.
- [ ] Each event has a release and version tag, so you can find the build that crashed.

## Upgrades

- [ ] Upgrade React Native one minor version at a time with the Upgrade Helper, soon after each release. A jump of two or more versions breaks many SDKs at the same time.
- [ ] Run `scripts/run-app.sh` on both platforms before and after the upgrade, and compare the screenshots.
- [ ] Check each patch in `patches/` against the new library versions.

## Devices

- [ ] Phones only: set `TARGETED_DEVICE_FAMILY = 1` in the iOS project (now it is `1,2`, which allows iPad). If you keep tablet support, take smoke screenshots on an iPad simulator and a tablet emulator.

## Offline and data

- [ ] Airplane mode: each main screen shows cached data or a designed empty state. A spinner never stays forever.
- [ ] No order goes to a queue while the device is offline (`docs/offline.md`). The submit button is disabled.
- [ ] A change of candidate id never shows the cached data of the previous candidate.

## Accessibility

- [ ] VoiceOver and TalkBack work on the main flows. Each control has a role and a label.
- [ ] Text scales with the system font size and does not clip (test at the largest size).
- [ ] Each touch target is at least 44×44 pt.
- [ ] Body text has a contrast of at least 4.5:1.

## Performance

- [ ] Long lists use `FlashList` or a `FlatList` with correct keys.
- [ ] Remote images have explicit dimensions and a cache. Add a cache library only if the app gets many images.
- [ ] Measure the cold start on a low-end Android device.

## Security

- [ ] If the app gets a login, tokens go only into Keychain or Keystore (`react-native-keychain`), never into MMKV or AsyncStorage.
- [ ] No secrets in `.env` (the app bundle contains it) or in the repo (gitleaks in CI).
- [ ] Push and signing certificates and keys stay in the CI secret store, not in the repo.
- [ ] The app validates each deep link before it navigates.

## Money

- [ ] Test money amounts with rounding edge cases (`0.1 + 0.2`, sell all shares, a currency with no minor unit).
- [ ] Device integrity: use the Play Integrity API, not SafetyNet (Google shut it down).
- [ ] Certificate pinning, if used: keep a backup pin and a rotation plan before the certificate expires.
- [ ] Ask for biometric or password authentication again before a sensitive action (a transfer, a change to payout details).
