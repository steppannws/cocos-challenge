# Decisions

One line for each choice: what and why. Update this file when you add or replace a library. This file has no version numbers. `package.json` has them.

## Platform

| Choice | Why |
|---|---|
| Bare React Native (community CLI), no Expo | A product decision for this challenge: the repo shows the native projects and the CocoaPods and Gradle setup directly. The challenge prefers Expo but does not require it. `scripts/run-app.sh` and `verify.sh --full` use the bare toolchain (Xcode, Gradle, Metro). |
| New Architecture and Hermes (template defaults) | These are the current defaults, and all dependencies of this app support them. |
| pnpm with `nodeLinker: hoisted` | Autolinking, Gradle and CocoaPods expect each `node_modules/<lib>` to be a real directory, not a symlink. For one app, symlinked `node_modules` adds risk and gives nothing. The setting is in `pnpm-workspace.yaml`, because pnpm 11 ignores `.npmrc` for its own options. |
| `react-native-config` for build-time values | One `.env` file for each environment (`ENVFILE=...`). Both platforms read it natively. `src/config/env.ts` validates it once with zod. `.env` is in git because it holds public values only. |
| Sentry (`@sentry/react-native`), off without a DSN | Sentry starts before the first render, so it also records startup crashes. With an empty `SENTRY_DSN`, the app sends nothing and does not call `Sentry.wrap` (without a DSN, `Sentry.wrap` shows a warning at each start). |

## App

| Choice | Why |
|---|---|
| React Navigation: bottom tabs and a native stack. The order sheet and the order detail are modal routes. | The four main jobs of the challenge map to four tabs. "Tap an instrument, then fill the order form" is a modal over any tab. Route params contain ids only. The modals read prices, holdings and orders from the query cache. |
| TanStack Query for server state, stored in MMKV | It gives caching, retries, offline reads and request cancellation. The server response is the only copy of server data. Each screen calculates its values in `useMemo`. |
| zustand for client state | The store holds three fields only: the candidate id, the debug bug level and the theme preference (`null` follows the system). Redux is too much boilerplate for three fields. |
| No offline queue for orders | The API has no idempotency keys. A MARKET order sent later executes at a different price. The app caches reads, but an order needs a connection (`docs/offline.md`). |
| zod schemas change the raw API shape | snake_case names and float prices exist only in `src/schemas`. The rest of the app sees camelCase names and integer cents. A bad response fails at the boundary with a typed `ApiError('shape')`, not inside a screen. |
| Money in integer cents, `Intl` formatters | Float math on prices gives rounding errors. Integer cents do not. `formatMoney` and `formatPercent` are the only formatters, and they use the UI locale. The code adds the `+` sign itself, because Hermes does not support the `signDisplay` option on all devices. |
| No form library | The order form has three inputs and one pure function (`deriveOrder`). The function returns the quantity, the total and the errors. react-hook-form adds a resolver layer around a 60-line function that already has tests. |
| No rejection reason in the order detail | The API does not send a reason when it rejects an order. The order detail lists the usual causes and does not select one. A guess can show the user a wrong reason. |
| i18next, react-i18next and react-native-localize. Spanish is the default. | The prices are in ARS. English has the same keys. The key type comes from `es.json`, so a missing key is a type error. |
| `react-native-svg` with inline outline icons | The tab bar and status icons need no icon font library and no native font setup. |
| `react-native-bootsplash` for the splash screen, `AnimatedSplash` draws the mark | The native launch screen (`BootSplash.storyboard`, Android `BootTheme`) is plain navy and stays until React renders the same navy, so there is no blank frame in between. `AnimatedSplash` then draws the C with `react-native-svg`, pops the mint point and scales the mark up while the navy fades out. A one-line `EXIT` constant switches to an iris (the navy closes into the mark). JS alone cannot cover the gap between the launch screen and the first render. `pnpm assets:splash` regenerates the storyboard, the drawables and `src/assets/bootsplash` from a transparent logo; the CLI also rewrites `AndroidManifest.xml` and `Info.plist`, so review that diff. |
| Brand mark: a bold C and a mint point (`src/assets/brand/mark.svg`) | Picked after a pass over Dribbble and Pinterest fintech icons: one heavy glyph on a navy tile with a single accent reads at 60 px, where outlines and rings do not. The mint is `colors.brandAccent`, close to the gain color the app already uses. |
| App icon from one SVG (`pnpm assets:icons`) | `src/assets/brand/icon.svg` is the source. The script renders the single 1024 px PNG that Xcode scales, and the legacy Android PNGs for API 24 and 25. Android 8+ uses the adaptive icon in `res/mipmap-anydpi-v26` (vector foreground, gradient background), so launchers can mask and animate it. sharp comes with `react-native-bootsplash`. |
| `StyleSheet` and typed tokens in `src/theme` | No styling library to learn or upgrade. A hex color outside the theme is a lint error. Light and dark mode: two palettes with the same keys, and `makeStyles` builds both sheets once at import, so components stay on plain `StyleSheet` and a theme switch does no style work. No theming library needed for two palettes. |
| No dark mode | Out of scope (`PRODUCT_BRIEF.md`). |

## Quality

| Choice | Why |
|---|---|
| TypeScript `strict` and `noUncheckedIndexedAccess` | Mistakes fail at compile time. |
| ESLint flat config (typescript-eslint, react, react-hooks, react-native, react-native-a11y, i18next) and Prettier | Lint enforces the rules of the project, not a document. Examples: no hex colors outside the theme, no raw strings in JSX, no inline styles, and accessibility props on each touchable. Also: no `fetch` outside `src/api`, no `console`, and `max-lines` on screens. The project does not use `@react-native/eslint-config`, because it pins ESLint 8 and Jest. |
| Vitest in Node, for logic only | The tests are fast. The risk is in the money math, the schemas, the order form and the platform checks. Maestro covers the screens. |
| `tests/platform.test.ts` | Source-level checks for device-only problems that Node cannot see: the i18n import order, cleartext traffic, and env keys. |
| Maestro and `scripts/run-app.sh` | A developer or an agent must see the app after a UI change. Each flow saves its screenshots at a fixed path. |
| `scripts/verify.sh`, a pre-commit hook (`core.hooksPath`) and CI | One command, enforced in three places. |
| Dev-bundle check in `verify:full` | A release bundle does not use LogBox. Only the dev bundle shows the module errors that a debug build gets. |
| gitleaks in the pre-commit hook (when it is installed) and in CI | Secrets do not get to the remote. |

## Patches

One row for each `pnpm patch`: library, version, reason, upstream issue. Delete the row when you delete the patch.

| Library | Version | Reason | Upstream |
|---|---|---|---|
