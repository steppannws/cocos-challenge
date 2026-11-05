# AGENTS.md

Traducción de [`AGENTS.md`](AGENTS.md). Si hay diferencias, vale la versión en inglés.

Guía para agentes de IA y humanos que trabajan en este repo. Única fuente de verdad: las otras configuraciones de agentes apuntan acá. Contexto de producto: `PRODUCT_BRIEF.es.md`. Por qué cada librería: `docs/decisions.es.md`.

## Regla central

Revisar el propio trabajo antes de decir "listo":

1. `pnpm verify` tiene que pasar (typecheck + lint + test). El hook de pre-commit y el Stop hook de Claude también lo corren.
2. ¿Cambio de UI? Ejecutar `scripts/run-app.sh` y mirar las capturas en `artifacts/screenshots/`. No describir UI que no se vio.
3. Después de cambios en dependencias, Metro, Babel o configuración nativa: `pnpm verify:full` (agrega los bundles de release y el chequeo del bundle de dev). CI lo corre.

## Stack

React Native bare (community CLI, New Architecture, Hermes) · React Navigation · TypeScript strict · TanStack Query · zustand · zod · i18next · react-native-mmkv · react-native-config · Vitest · Maestro · ESLint flat + Prettier · pnpm (hoisted).

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm start` | Metro |
| `pnpm ios` / `pnpm android` | build de debug en el simulador / emulador |
| `pnpm pods` | CocoaPods install (después de agregar una dependencia nativa) |
| `pnpm verify` | typecheck + lint + test, salida silenciosa, logs solo si falla |
| `pnpm verify:full` | `verify` + bundles de release para ambas plataformas + chequeo del bundle de dev |
| `scripts/run-app.sh [ios\|android] [flow]` | arranca un simulador, compila e instala la app si falta, corre un flujo de Maestro, guarda capturas |
| `pnpm test -- <patrón>` | un solo archivo de test |
| `pnpm add <pkg>`, luego `pnpm pods` y un rebuild | agregar una dependencia. Las nativas necesitan el rebuild; Metro solo no puede cargarlas |

## Estructura

```
App.tsx                 raíz: i18n primero, reporte de crashes, providers, error boundary, navegador
index.js                entrada de AppRegistry (template)
ios/ android/           proyectos nativos, commiteados (React Native bare)
src/
  navigation/           RootNavigator.tsx (tabs + stack modal) · types.ts (param lists)
  screens/MarketScreen/ MarketScreen.tsx · styles.ts · index.ts (+ hooks/ y components/ locales a la pantalla)
  components/Button/    Button.tsx · styles.ts · index.ts
  api/                  client.ts (el único cliente HTTP) · queryClient.ts · queryKeys.ts · un archivo por recurso: ordersApi.ts
  schemas/              esquemas zod: entra la forma cruda de la API, sale la forma de la app (camelCase, centavos enteros)
  hooks/                useX.ts: hooks de TanStack Query y hooks chicos de UI
  offline/storage.ts    la instancia de MMKV detrás de la caché de queries y del store de sesión
  store/session.ts      solo estado de cliente (candidate id, nivel de bugs). Los datos del servidor nunca van acá
  i18n/                 index.ts · i18next.d.ts (claves tipadas) · locales/es.json · locales/en.json
  theme/index.ts        el único lugar donde se definen colores, espaciados, fuentes y radios
  utils/                funciones puras, test al lado: format.ts + format.test.ts
  config/env.ts         lee react-native-config una vez, validado con zod
tests/                  platform.test.ts y tests transversales
.maestro/               flujos e2e
```

Nombres: PascalCase para componentes y pantallas, camelCase para todo lo demás (`useOrders.ts`, `ordersApi.ts`). Importar con `@/`; `../` solo dentro de una carpeta de pantalla, nunca `../../`.

## Reglas

**Nativo**
- `ios/` y `android/` están commiteados. Un cambio nativo es un diff en esas carpetas: mantenerlo mínimo y explicar por qué en el commit.
- Dependencia nativa nueva → `pnpm add`, `pnpm pods`, rebuild (`pnpm ios` / `pnpm android`). Antes, verificar el soporte de New Architecture en https://reactnative.directory.

**Datos**
- Datos del servidor: solo TanStack Query. Las query keys salen de un único objeto `queryKeys` en `src/api/queryKeys.ts`; los datos por candidato llevan el candidate id en su key.
- Derivar, no guardar: rendimiento diario, valor de mercado, resultado, totales y máximo de acciones para un monto son funciones puras en `src/utils` llamadas desde `useMemo`. Nunca copiar un valor calculado a un estado o a un store.
- La única escritura es `POST /orders`, a través de `usePlaceOrder`. Las escrituras nunca se encolan ni se reintentan (`docs/offline.es.md`). `fetch` fuera de `src/api` es un error de lint.
- Estado de cliente (candidate id, preferencias de UI): `src/store/session.ts`. No copiar datos del servidor ahí.
- Validar cada respuesta de la API con zod en el borde (`src/schemas`). Los tipos salen del esquema: `z.infer`.
- Dinero: la API manda pesos en float; los esquemas los convierten a centavos enteros (`toCents`) y toda la matemática queda en centavos. Un solo `formatMoney`, un solo `formatPercent` (`src/utils/format.ts`).
- Fechas: strings ISO 8601 de la API, formateadas con `Intl` en `src/utils/format.ts`. Nunca parsear un string de fecha ya formateado.
- Sin ids generados en el cliente. Si alguna vez hace falta uno, nunca el paquete `uuid`: necesita `crypto.getRandomValues`, que existe en Node (los tests pasan) pero no en un dispositivo (la app se rompe).

**UI**
- Colores, espaciados, tamaños de fuente: solo tokens de `@/theme`. Un literal hex fuera de `src/theme` es un error de lint.
- Cada string visible para el usuario pasa por `t('key')`. Un string crudo en JSX es un error de lint. Agregar la clave a `es.json` y `en.json`; una clave que falta en `es.json` rompe el typecheck.
- `StyleSheet.create` en `styles.ts`. Sin objetos de estilo inline, salvo para valores calculados en runtime (error de lint).
- Cada touchable tiene `accessibilityRole` y `accessibilityLabel` (error de lint). Cada lista tiene un estado vacío, un estado de carga y un estado de error con reintento (`QueryStateView`).
- Un botón de enviar está deshabilitado mientras su mutación está pendiente y mientras no hay conexión (un doble toque manda órdenes duplicadas).
- Respetar las safe areas (componente `Screen`) y la barra de navegación de Android.

**Código**
- Sin `any`, sin `@ts-ignore`, sin `!` de non-null para silenciar un error. Arreglar el tipo.
- Sin `console.*` en el código de la app. Usar el logger de `src/utils/logger.ts`.
- Un error boundary raíz atrapa los errores de render (sin pantalla blanca). Nunca `LogBox.ignoreAllLogs()`: oculta los warnings que preceden a los crashes.
- No tragarse errores: un `catch {}` vacío ocultó un crash que solo pasaba en dispositivo durante todo un release en un proyecto anterior. Loguear o relanzar.
- Los comentarios explican el por qué (regla de negocio, contrato con el backend, bug de plataforma). Nunca el qué.
- Un bug fix lleva un test que falla sin el fix, cuando la lógica es testeable.

**Dependencias**
- Preguntar antes de agregar una dependencia que unas pocas líneas de código podrían reemplazar.
- Una librería por tarea. Revisar `docs/decisions.es.md` antes de agregar una; si una librería ya hace el trabajo, usarla.
- Sin dependencias por URL de git ni fijadas a una rama.
- Parchear una librería solo con `pnpm patch`, y agregar el motivo en `docs/decisions.md` (Patches).

**Secretos**
- `.env` está commiteado y solo tiene valores públicos de build (URL de la API, candidate id por defecto, un DSN vacío). Nada secreto en el repo. `.env*.local` está en gitignore.

## Tests

- Vitest, entorno Node, solo lógica: `src/utils`, `src/schemas`, la derivación del formulario de orden, `tests/platform.test.ts`.
- Mockear los módulos nativos con `vi.mock`. Si un test pasa solo porque Node tiene una API que el dispositivo no tiene, agregar un chequeo a `tests/platform.test.ts`.
- Las pantallas se cubren con flujos de Maestro en `.maestro/`, no con tests unitarios.

## "Listo" significa

- `pnpm verify` en verde, con la salida leída, no asumida.
- Cambios de UI: capturas tomadas y revisadas.
- Strings nuevos en ambos archivos de locale. Variables de entorno nuevas en `.env` y `src/config/env.ts`.
- Trabajo relacionado con un release: recorrer `docs/production-checklist.es.md`.

## Docs

- `docs/decisions.md`: cada librería y por qué. Actualizarlo al agregar o reemplazar una.
- `docs/offline.md`: qué funciona offline y por qué las órdenes no se encolan.
- `docs/production-checklist.md`: antes de cualquier envío a las tiendas.
- Cada doc tiene su traducción al lado, con sufijo `.es.md`. Editar primero el archivo en inglés y después actualizar la traducción.
