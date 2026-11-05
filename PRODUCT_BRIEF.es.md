# Cocos Challenge

Traducción de [`PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md). Si hay diferencias, vale la versión en inglés.

Una app de broker minorista para el desafío React Native de Cocos Capital: ver instrumentos, buscar por ticker, ver el portfolio y enviar órdenes BUY/SELL contra la API dummy del desafío.

## Usuarios y tareas principales

- Inversor minorista (el evaluador juega este rol): ver precios y rendimiento diario, ver tenencias y resultado, enviar una orden, seguir su estado.

## Pantallas principales

1. Mercado: lista de instrumentos (ticker, nombre, último precio, rendimiento diario %) con búsqueda por ticker (`/search`, con debounce). Tocar → Formulario de orden.
2. Portfolio: efectivo + tenencias (ticker, cantidad, valor de mercado, resultado en ARS, rendimiento total %) y totales del portfolio. Todos los valores se derivan de `/portfolio`, nunca se guardan. Tocar → Formulario de orden (BUY o SELL).
3. Órdenes: historial de órdenes de `/orders` con chips de estado (FILLED / PENDING / REJECTED), pull to refresh. Las órdenes LIMIT se resuelven más tarde, así que acá es donde el usuario las ve cambiar.
4. Formulario de orden (modal sobre cualquier instrumento): operación BUY/SELL, tipo MARKET/LIMIT, cantidad **o** monto en ARS (convertido al máximo de acciones enteras a `last_price`), precio solo para LIMIT. Muestra el `id` y el `status` devueltos. Enviar deshabilitado mientras está pendiente u offline.
5. Cuenta: candidate id (`X-Candidate-Id`, la API aísla el estado por este valor). Solo en `__DEV__`: nivel de bugs de la API (`X-Enable-Bugs`) y "reiniciar cuenta" (`POST /reset`).

## Entidades de datos

| Entidad | Campos clave | ¿Se crea/edita offline? |
|---|---|---|
| Instrument | id, ticker, name, type (ACCIONES/MONEDA), last_price, close_price | no (solo lectura, compartida) |
| Portfolio | cash, holdings[] | no |
| Holding | instrument_id, ticker, quantity, last_price, close_price, avg_cost_price | no |
| Order | id, instrument_id, side, type, quantity, price, status, created_at | **no**: nunca se encola (ver Backend) |

Derivados, nunca guardados: rendimiento diario %, valor de mercado, resultado (ARS y %), totales del portfolio, máximo de acciones para un monto en ARS, efectivo / acciones disponibles para validación.

## Plataforma

- Forma: una sola app, **React Native bare** (`@react-native-community/cli`), sin Expo.
- Bundle id / package: `com.stepan.cocoschallenge`
- Idiomas: es (por defecto), en
- Dispositivos: solo teléfonos
- Flags de audiencia: menores de 13 años: no · maneja dinero: sí (muestra y opera en ARS; sin pagos)

## Backend

- API: REST, `https://dummy-api-topaz.vercel.app`, un solo entorno. Cada request manda `X-Enable-Bugs` (por defecto `off`; `easy|medium|hard` inyectan defectos, solo para QA) y `X-Candidate-Id` (requerido por `/portfolio`, `/orders`, `/reset`).
- Auth: ninguna. El candidate id es toda la identidad.
- Contrato offline (`docs/offline.es.md`): Idempotency-Key no · `updatedAt` last-write-wins no · 409 con el registro actual no · ids generados en el cliente no.
  **Consecuencia:** las lecturas se cachean (caché persistida de TanStack Query, así que Mercado/Portfolio/Órdenes abren offline con datos viejos y un banner); las escrituras **no** se encolan. Una orden MARKET reenviada minutos después se ejecuta a otro precio, y sin claves de idempotencia un reintento puede duplicar una orden. Offline → enviar deshabilitado con un mensaje.

## Elecciones

- Estado de cliente: zustand, porque el único estado de cliente es el candidate id, el nivel de bugs y las preferencias de UI. Los datos del servidor viven en TanStack Query; los valores derivados, en funciones puras + `useMemo`.
- Navegación: React Navigation (bottom tabs + native stack; el formulario de orden es una ruta modal).
- Almacenamiento: react-native-mmkv (persistencia de queries + zustand persist).
- i18n: i18next + react-native-localize.
- Env: react-native-config (`API_URL`, `SENTRY_DSN`), `.env.example` commiteado.
- Dinero: los precios de la API son floats; se convierten a centavos enteros en el borde, toda la matemática en centavos, un solo `formatMoney` (Intl, es-AR/ARS) y un solo `formatPercent`.
- Reporte de crashes: Sentry (no hace nada sin DSN)
- Analytics: ninguno
- Push: no · Pagos: ninguno · Mapas: ninguno
- Tests: Vitest en Node para la matemática de dominio, esquemas, parseo de la API, store; flujos de Maestro para las pantallas.

## Fuera de alcance por ahora

- Modo oscuro
- Pantalla de detalle de instrumento (la consigna dice tocar → formulario de orden)
- Precios en tiempo real, gráficos
- Cola de órdenes offline (ver Backend)
- Tablets
