# Offline behavior

Versión en español: [`offline.es.md`](offline.es.md).

This document says what works without a connection, what does not work, and why. Read it before you change `src/api`, `src/offline` or the order sheet.

## Reads: cached and stored on the device

- Each query (instruments, search, portfolio, orders) goes through TanStack Query. The app stores the cache in MMKV (`src/api/queryClient.ts`, `src/offline/storage.ts`). Thus the app opens with the last data it received and fetches new data in the background. Search results are the exception: they are not stored, because search needs the network anyway and every typed term would grow the cache.
- `gcTime` and `maxAge` are both 7 days. When a schema changes in an incompatible way, change the `buster` value (now `'v1'`). The app then deletes the stored cache.
- NetInfo sends the connection state to the TanStack `onlineManager`. `useIsOnline()` reads the same source. While the device is offline, queries pause and do not fail, and `Screen` shows the offline banner.
- Retries for reads: a network error, a timeout or a 5xx status retries two times. A 4xx status or a bad response shape does not retry (`isRetryable` in `src/api/client.ts`).

## Orders: never queued

The only write is `POST /orders` (`usePlaceOrder`). The app does **not** queue an order while it is offline, and it **never** retries an order. This is intentional:

1. The API has no idempotency keys. A retried or replayed POST makes a second order.
2. A MARKET order sent some minutes later executes at a different price from the price that the user saw.

Thus the order sheet disables its submit button while the device is offline (and shows a message) and while a request is in progress. If a request fails, the sheet shows the API error. The user can then send the order again.

## If a queue becomes necessary

The backend must first supply these items:

- an `Idempotency-Key` header that it honors for each order,
- an order id that the client makes and the API returns,
- a way to say "execute at this price or better".

Only then is a stored FIFO queue useful. The design of that queue:

- Send the queue at app start, when the device comes online and when the app comes to the foreground.
- Use one processor at a time.
- A 2xx response removes the order from the queue.
- A 4xx response marks the order as failed and asks the user what to do.

This app does not include the queue. That is intentional.
