# Cocos Challenge

Versión en español: [`PRODUCT_BRIEF.es.md`](PRODUCT_BRIEF.es.md).

A retail broker app for the Cocos Capital React Native challenge: browse instruments, search by ticker, see the portfolio and send BUY/SELL orders against the challenge's dummy API.

## Users and main jobs

- Retail investor (the reviewer plays this role): check prices and daily return, check holdings and P&L, place an order, follow its status.

## Main screens

1. Market: instruments list (ticker, name, last price, daily return %) with ticker search (`/search`, debounced). Tap → Order sheet.
2. Portfolio: cash + holdings (ticker, quantity, market value, P&L in ARS, total return %) and portfolio totals. All values derived from `/portfolio`, never stored. Tap → Order sheet (BUY or SELL).
3. Orders: order history from `/orders` with status chips (FILLED / PENDING / REJECTED), pull to refresh. LIMIT orders resolve later, so this is where the user sees them change.
4. Order sheet (modal over any instrument): side BUY/SELL, type MARKET/LIMIT, quantity **or** ARS amount (converted to the max whole shares at `last_price`), price only for LIMIT. Shows the returned `id` and `status`. Submit disabled while pending or offline.
5. Account: candidate id (`X-Candidate-Id`, the API isolates state by it). In `__DEV__` only: API bug level (`X-Enable-Bugs`) and "reset account" (`POST /reset`).

## Data entities

| Entity | Key fields | Created/edited offline? |
|---|---|---|
| Instrument | id, ticker, name, type (ACCIONES/MONEDA), last_price, close_price | no (read-only, shared) |
| Portfolio | cash, holdings[] | no |
| Holding | instrument_id, ticker, quantity, last_price, close_price, avg_cost_price | no |
| Order | id, instrument_id, side, type, quantity, price, status, created_at | **no**: never queued (see Backend) |

Derived, never stored: daily return %, market value, P&L (ARS and %), portfolio totals, max shares for an ARS amount, available cash / shares for validation.

## Platform

- Shape: single app, **bare React Native** (`@react-native-community/cli`), no Expo.
- Bundle id / package: `com.stepan.cocoschallenge`
- Languages: es (default), en
- Devices: phones only
- Audience flags: children under 13: no · handles money: yes (display and orders in ARS; no payments)

## Backend

- API: REST, `https://dummy-api-topaz.vercel.app`, one environment. Every request sends `X-Enable-Bugs` (default `off`; `easy|medium|hard` inject defects, QA use only) and `X-Candidate-Id` (required by `/portfolio`, `/orders`, `/reset`).
- Auth: none. The candidate id is the whole identity.
- Offline contract (`docs/offline.md`): Idempotency-Key no · `updatedAt` last-write-wins no · 409 with current record no · client-generated ids no.
  **Consequence:** reads are cached (persisted TanStack Query cache, so Market/Portfolio/Orders open offline with stale data and a banner); writes are **not** queued. A MARKET order replayed minutes later executes at another price, and without idempotency keys a retry can double an order. Offline → submit disabled with a message.

## Choices

- Client state: zustand, because the only client state is the candidate id, the bug level and UI prefs. Server data lives in TanStack Query; derived values in pure functions + `useMemo`.
- Navigation: React Navigation (bottom tabs + native stack; the order sheet is a modal route).
- Storage: react-native-mmkv (query persistence + zustand persist).
- i18n: i18next + react-native-localize.
- Env: react-native-config (`API_URL`, `SENTRY_DSN`), `.env.example` committed.
- Money: API prices are floats; converted to integer cents at the boundary, all math in cents, one `formatMoney` (Intl, es-AR/ARS) and one `formatPercent`.
- Crash reporting: Sentry (no-op without DSN)
- Analytics: none
- Push: no · Payments: none · Maps: none
- Tests: Vitest in Node for domain math, schemas, API parsing, store; Maestro flows for screens.

## Out of scope for now

- Dark mode
- Instrument detail screen (the spec says tap → order form)
- Real-time prices, charts
- Offline order queue (see Backend)
- Tablets
