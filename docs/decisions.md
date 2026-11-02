# Decisions

One line per choice: what and why. Update this file when you add or replace a library. No version numbers: `package.json` has them.

## Platform

| Choice | Why |
|---|---|
| Bare React Native (community CLI), no Expo | Product decision for this challenge: show the native projects, CocoaPods and Gradle wiring directly. The spec "values" Expo but does not require it; the kit this app started from is Expo-first, so `scripts/run-app.sh` and `verify.sh --full` were rewritten for the bare toolchain. |
| New Architecture + Hermes (template defaults) | Current defaults; every dependency here supports them. |
| pnpm with `nodeLinker: hoisted` | Autolinking, Gradle and CocoaPods expect `node_modules/<lib>` to be real directories. Isolated (symlinked) `node_modules` is not worth the risk for one app. Setting lives in `pnpm-workspace.yaml`: pnpm 11 ignores `.npmrc` for its own options. |
| `react-native-config` for build-time env | One `.env` per environment (`ENVFILE=...`), read natively on both platforms, validated once with zod in `src/config/env.ts`. `.env` is committed: it holds public values only. |
| Sentry (`@sentry/react-native`), no-op without a DSN | Initialized before the first render so startup crashes are captured. With an empty `SENTRY_DSN` nothing is sent and `Sentry.wrap` is skipped (it warns on every start otherwise). |

## App

| Choice | Why |
|---|---|
| React Navigation: bottom tabs + a native stack with the order sheet as a modal route | The spec's four jobs map to tabs; "tap an instrument → order form" is a modal over any of them. Params carry ids only; the sheet reads prices and holdings from the query cache. |
| TanStack Query for server state, persisted to MMKV | Caching, retries, offline reads and request cancellation for free. The 2024 attempt kept server data in Redux and recomputed derived values into the store; this app keeps the server response as the single source and derives everything in `useMemo`. |
| zustand for client state | Only the candidate id and the dev bug level. Redux would be boilerplate for two fields. |
| No offline outbox for orders | The API has no idempotency keys and a MARKET order replayed later executes at another price. Reads are cached; writes need a connection (`docs/offline.md`). |
| zod schemas that transform the raw API shape | snake_case and float prices exist in `src/schemas` only. The app sees camelCase and integer cents. A malformed response fails at the boundary with a typed `ApiError('shape')`, not deep in a screen. |
| Money as integer cents, `Intl` formatters | Float arithmetic on prices drifts; cents do not. One `formatMoney` / `formatPercent` with the UI locale. Signs are added by hand because Hermes does not support `signDisplay` everywhere. |
| No form library | The order form is three inputs plus one pure function (`deriveOrder`) that yields quantity, total, and errors. react-hook-form would add a resolver layer around what is already a 60-line tested function. |
| i18next + react-i18next + react-native-localize, es default | Spanish-speaking reviewers, prices in ARS; English mirrors every key. Typed keys from `es.json` make a missing key a type error. |
| `react-native-svg` with 9 inline outline icons | Tab bar and status icons without a font-icon library and its native font linking. |
| `StyleSheet` + typed tokens in `src/theme` | No styling library to learn or upgrade. Hex literals are a lint error outside the theme. |
| No dark mode | Out of scope (`PRODUCT_BRIEF.md`). |

## Quality

| Choice | Why |
|---|---|
| TypeScript `strict` + `noUncheckedIndexedAccess` | Mistakes fail at compile time. |
| ESLint flat config (typescript-eslint, react, react-hooks, react-native, react-native-a11y, i18next) + Prettier | Rules that would otherwise live in a README: no hex colors outside the theme, no raw strings in JSX, no inline styles, a11y props on touchables, no `fetch` outside `src/api`, no `console`, `max-lines` on screens. `@react-native/eslint-config` was dropped: it pins ESLint 8 and Jest. |
| Vitest, Node environment, logic only | Fast; the money math, schemas, the order derivation and the platform checks are what carries risk. Screens are covered by Maestro. |
| `tests/platform.test.ts` | Source-level checks for device-only assumptions Node cannot see (i18n import order, cleartext traffic, env keys). |
| Maestro + `scripts/run-app.sh` | The agent must see the app. Screenshots land at a fixed path after every flow. |
| `scripts/verify.sh` + `core.hooksPath` pre-commit + CI | One command, enforced in three places. |
| Dev-bundle check in `verify:full` | A release bundle skips LogBox; only the dev bundle shows module resolution failures a debug build would hit. |
| gitleaks in the pre-commit hook (when installed) and in CI | Secrets never reach the remote. |

## Patches

One row per `pnpm patch`: library, version, reason, upstream issue. Delete the row with the patch.

| Library | Version | Reason | Upstream |
|---|---|---|---|
