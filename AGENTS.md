# AGENTS.md

Guidance for AI agents and humans working in this repo. Single source of truth: other agent configs point here. Product context: `PRODUCT_BRIEF.md`. Why each library: `docs/decisions.md`.

## Core rule

Check your own work before you say "done":

1. `pnpm verify` must pass (typecheck + lint + test). The pre-commit hook and the Claude Stop hook run it too.
2. UI change? Run `scripts/run-app.sh` and look at the screenshots in `artifacts/screenshots/`. Do not describe UI you have not seen.
3. After dependency, Metro, Babel or native config changes: `pnpm verify:full` (adds the release bundles and the dev-bundle check). CI runs it.

## Stack

Bare React Native (community CLI, New Architecture, Hermes) · React Navigation · TypeScript strict · TanStack Query · zustand · zod · i18next · react-native-mmkv · react-native-config · Vitest · Maestro · ESLint flat + Prettier · pnpm (hoisted).

## Commands

| Command | What it does |
|---|---|
| `pnpm start` | Metro |
| `pnpm ios` / `pnpm android` | debug build on the simulator / emulator |
| `pnpm pods` | CocoaPods install (after adding a native dependency) |
| `pnpm verify` | typecheck + lint + test, quiet output, logs only on failure |
| `pnpm verify:full` | `verify` + release bundles for both platforms + dev-bundle check |
| `scripts/run-app.sh [ios\|android] [flow]` | boots a simulator, builds and installs the app if missing, runs a Maestro flow, saves screenshots |
| `pnpm test -- <pattern>` | one test file |
| `pnpm add <pkg>` then `pnpm pods` and a rebuild | add a dependency. Native ones need the rebuild; Metro alone cannot load them |

## Layout

```
App.tsx                 root: i18n first, crash reporting, providers, error boundary, navigator
index.js                AppRegistry entry (template)
ios/ android/           native projects, committed (bare React Native)
src/
  navigation/           RootNavigator.tsx (tabs + modal stack) · types.ts (param lists)
  screens/MarketScreen/ MarketScreen.tsx · styles.ts · index.ts (+ hooks/ and components/ local to the screen)
  components/Button/    Button.tsx · styles.ts · index.ts
  api/                  client.ts (the only HTTP client) · queryClient.ts · queryKeys.ts · one file per resource: ordersApi.ts
  schemas/              zod schemas: raw API shape in, app shape out (camelCase, integer cents)
  hooks/                useX.ts: TanStack Query hooks and small UI hooks
  offline/storage.ts    the MMKV instance behind the query cache and the session store
  store/session.ts      client state only (candidate id, bug level). Server data never goes here
  i18n/                 index.ts · i18next.d.ts (typed keys) · locales/es.json · locales/en.json
  theme/index.ts        the only place colors, spacing, fonts, radii are defined
  utils/                pure functions, test next to them: format.ts + format.test.ts
  config/env.ts         reads react-native-config once, validated with zod
tests/                  platform.test.ts and cross-cutting tests
.maestro/               e2e flows
```

Naming: PascalCase for components and screens, camelCase for everything else (`useOrders.ts`, `ordersApi.ts`). Import with `@/`; `../` only inside a screen folder, never `../../`.

## Rules

**Native**
- `ios/` and `android/` are committed. A native change is a diff in those folders: keep it minimal and say why in the commit.
- New native dependency → `pnpm add`, `pnpm pods`, rebuild (`pnpm ios` / `pnpm android`). Check https://reactnative.directory for New Architecture support first.

**Data**
- Server data: TanStack Query only. Query keys come from one `queryKeys` object in `src/api/queryKeys.ts`; per-candidate data carries the candidate id in its key.
- Derive, don't store: daily return, market value, P&L, totals, max shares for an amount are pure functions in `src/utils` called from `useMemo`. Never copy a computed value into state or a store.
- The only write is `POST /orders`, through `usePlaceOrder`. Writes are never queued or retried (`docs/offline.md`). `fetch` outside `src/api` is a lint error.
- Client state (candidate id, UI prefs): `src/store/session.ts`. Do not copy server data into it.
- Validate every API response with zod at the boundary (`src/schemas`). Types come from the schema: `z.infer`.
- Money: the API sends float pesos; schemas convert them to integer cents (`toCents`) and all math stays in cents. One `formatMoney`, one `formatPercent` (`src/utils/format.ts`).
- Dates: ISO 8601 strings from the API, formatted with `Intl` in `src/utils/format.ts`. Never parse a formatted date string.
- No client-generated ids. If one is ever needed, never the `uuid` package: it needs `crypto.getRandomValues`, which exists in Node (tests pass) but not on a device (app breaks).

**UI**
- Colors, spacing, font sizes: tokens from `@/theme` only. A hex literal outside `src/theme` is a lint error.
- Every user-facing string goes through `t('key')`. A raw string in JSX is a lint error. Add the key to `es.json` and `en.json`; a key missing from `es.json` fails typecheck.
- `StyleSheet.create` in `styles.ts`. No inline style objects except for values computed at runtime (lint error).
- Every touchable has `accessibilityRole` and `accessibilityLabel` (lint error). Every list has an empty state, a loading state and an error state with retry (`QueryStateView`).
- A submit button is disabled while its mutation is pending and while offline (double taps send duplicate orders).
- Respect safe areas (`Screen` component) and the Android navigation bar.

**Code**
- No `any`, no `@ts-ignore`, no non-null `!` to silence an error. Fix the type.
- No `console.*` in app code. Use the logger in `src/utils/logger.ts`.
- A root error boundary catches render errors (no white screen). Never `LogBox.ignoreAllLogs()`: it hides the warnings that precede crashes.
- Do not swallow errors: a bare `catch {}` hid a device-only crash for a whole release in a past project. Log or rethrow.
- Comments explain why (business rule, backend contract, platform bug). Never what.
- A bug fix gets a test that fails without the fix, when the logic is testable.

**Dependencies**
- Ask before adding a dependency that a few lines of code could replace.
- One library per job. Check `docs/decisions.md` before adding one; if a library already does the job, use it.
- No git-URL or branch-pinned dependencies.
- Patch a library only with `pnpm patch`, and add the reason to `docs/decisions.md` (Patches).

**Secrets**
- `.env` is committed and holds public build-time values only (API URL, default candidate id, an empty DSN). Nothing secret in the repo. `.env*.local` is gitignored.

## Tests

- Vitest, Node environment, logic only: `src/utils`, `src/schemas`, the order form derivation, `tests/platform.test.ts`.
- Mock native modules with `vi.mock`. If a test passes only because Node has an API the device lacks, add a check to `tests/platform.test.ts`.
- Screens are covered by Maestro flows in `.maestro/`, not by unit tests.

## Done means

- `pnpm verify` green, output read, not assumed.
- UI changes: screenshots taken and checked.
- New strings in both locale files. New env vars in `.env` and `src/config/env.ts`.
- Release-related work: walk `docs/production-checklist.md`.

## Docs

- `docs/decisions.md`: every library and why. Update it when you add or replace one.
- `docs/offline.md`: what works offline and why orders do not queue.
- `docs/production-checklist.md`: before any store submission.
