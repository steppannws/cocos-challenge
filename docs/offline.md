# Offline behavior

What works without a connection, what does not, and why. Read this before touching `src/api`, `src/offline` or the order sheet.

## Reads: cached and persisted

- Every query (instruments, search, portfolio, orders) goes through TanStack Query. The cache is persisted to MMKV (`src/api/queryClient.ts`, `src/offline/storage.ts`), so the app opens with the last data it saw and refetches in the background.
- `gcTime` and `maxAge` are both 7 days; `buster: 'v1'` invalidates the persisted cache when the schemas change in an incompatible way (bump it).
- Connectivity comes from NetInfo wired into TanStack's `onlineManager`; `useIsOnline()` reads the same source. Offline, queries pause instead of failing, and `Screen` shows the offline banner.
- Retry policy for reads: network errors, timeouts and 5xx retry twice; 4xx and malformed responses do not (`isRetryable` in `src/api/client.ts`).

## Writes: never queued

The only write is `POST /orders` (`usePlaceOrder`). It is **not** queued when offline and **never retried**, by design:

1. The API has no idempotency keys. A retried or replayed POST is a second order.
2. A MARKET order sent minutes later executes at a different price than the one the user confirmed.

So the order sheet disables its submit button while offline (with a message) and while a request is pending. A failed request shows the API's error and lets the user try again explicitly.

## If a queue is ever needed

The backend would first need: an `Idempotency-Key` header honored per order, a client-generated order id echoed back, and a way to express "execute at most at this price". Only then does a persisted FIFO outbox (send on start / online / foreground, one processor at a time, 2xx removes, 4xx marks failed and asks the user) make sense. The kit this app came from has that design; it was left out here on purpose.
