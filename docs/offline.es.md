# Comportamiento offline

Traducción de [`offline.md`](offline.md). Si hay diferencias, vale la versión en inglés.

Este documento dice qué funciona sin conexión, qué no, y por qué. Conviene leerlo antes de cambiar `src/api`, `src/offline` o el formulario de orden.

## Lecturas: cacheadas y guardadas en el dispositivo

- Cada query (instrumentos, búsqueda, portfolio, órdenes) pasa por TanStack Query. La app guarda la caché en MMKV (`src/api/queryClient.ts`, `src/offline/storage.ts`). Así, la app abre con los últimos datos que recibió y trae datos nuevos en segundo plano. Los resultados de búsqueda son la excepción: no se guardan, porque la búsqueda necesita red de todos modos y cada término escrito haría crecer la caché.
- `gcTime` y `maxAge` son ambos de 7 días. Cuando un esquema cambia de forma incompatible, se cambia el valor de `buster` (ahora `'v1'`). La app entonces borra la caché guardada.
- NetInfo manda el estado de la conexión al `onlineManager` de TanStack. `useIsOnline()` lee la misma fuente. Mientras el dispositivo está offline, las queries se pausan y no fallan, y `Screen` muestra el banner de sin conexión.
- Reintentos de lecturas: un error de red, un timeout o un status 5xx reintenta dos veces. Un status 4xx o una respuesta con forma incorrecta no reintenta (`isRetryable` en `src/api/client.ts`).

## Órdenes: nunca se encolan

La única escritura es `POST /orders` (`usePlaceOrder`). La app **no** encola una orden mientras está offline, y **nunca** reintenta una orden. Es intencional:

1. La API no tiene claves de idempotencia. Un POST reintentado o reenviado crea una segunda orden.
2. Una orden MARKET enviada unos minutos después se ejecuta a un precio distinto del que vio el usuario.

Por eso, el formulario de orden deshabilita su botón de enviar mientras el dispositivo está offline (y muestra un mensaje) y mientras hay un request en curso. Si un request falla, el formulario muestra el error de la API. El usuario puede entonces volver a enviar la orden.

## Si una cola se vuelve necesaria

El backend tiene que proveer primero estos elementos:

- un header `Idempotency-Key` que respete para cada orden,
- un id de orden que genere el cliente y que la API devuelva,
- una forma de decir "ejecutar a este precio o mejor".

Solo entonces una cola FIFO persistida es útil. El diseño de esa cola:

- Enviar la cola al iniciar la app, cuando el dispositivo recupera la conexión y cuando la app vuelve al primer plano.
- Usar un solo procesador a la vez.
- Una respuesta 2xx saca la orden de la cola.
- Una respuesta 4xx marca la orden como fallida y le pregunta al usuario qué hacer.

Esta app no incluye la cola. Es intencional.
