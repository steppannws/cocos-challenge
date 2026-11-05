# Decisiones

Traducción de [`decisions.md`](decisions.md). Si hay diferencias, vale la versión en inglés.

Una línea por cada elección: qué y por qué. Actualizar `decisions.md` (y esta traducción) al agregar o reemplazar una librería. Este archivo no tiene números de versión. `package.json` los tiene.

## Plataforma

| Elección | Por qué |
|---|---|
| React Native bare (community CLI), sin Expo | Una decisión de producto para este desafío: el repo muestra los proyectos nativos y la configuración de CocoaPods y Gradle directamente. El desafío prefiere Expo pero no lo exige. `scripts/run-app.sh` y `verify.sh --full` usan la toolchain bare (Xcode, Gradle, Metro). |
| New Architecture y Hermes (valores por defecto del template) | Son los valores por defecto actuales, y todas las dependencias de esta app los soportan. |
| pnpm con `nodeLinker: hoisted` | El autolinking, Gradle y CocoaPods esperan que cada `node_modules/<lib>` sea un directorio real, no un symlink. Para una sola app, un `node_modules` con symlinks agrega riesgo y no aporta nada. La opción está en `pnpm-workspace.yaml`, porque pnpm 11 ignora `.npmrc` para sus propias opciones. |
| `react-native-config` para valores de build | Un archivo `.env` por entorno (`ENVFILE=...`). Ambas plataformas lo leen de forma nativa. `src/config/env.ts` lo valida una vez con zod. `.env` está en git porque solo tiene valores públicos. |
| Sentry (`@sentry/react-native`), apagado sin DSN | Sentry arranca antes del primer render, así que también registra los crashes de inicio. Con un `SENTRY_DSN` vacío, la app no manda nada y no llama a `Sentry.wrap` (sin DSN, `Sentry.wrap` muestra un warning en cada inicio). |

## App

| Elección | Por qué |
|---|---|
| React Navigation: bottom tabs y un native stack. El formulario de orden y el detalle de orden son rutas modales. | Las cuatro tareas principales del desafío se corresponden con cuatro tabs. "Tocar un instrumento y completar el formulario de orden" es un modal sobre cualquier tab. Los parámetros de ruta contienen solo ids. Los modales leen precios, tenencias y órdenes de la caché de queries. |
| TanStack Query para el estado del servidor, guardado en MMKV | Da caché, reintentos, lecturas offline y cancelación de requests. La respuesta del servidor es la única copia de los datos del servidor. Cada pantalla calcula sus valores en `useMemo`. |
| zustand para el estado de cliente | El store tiene solo tres campos: el candidate id, el nivel de bugs de debug y la preferencia de tema (`null` sigue al sistema). Redux es demasiado boilerplate para tres campos. |
| Sin cola offline para órdenes | La API no tiene claves de idempotencia. Una orden MARKET enviada más tarde se ejecuta a otro precio. La app cachea lecturas, pero una orden necesita conexión (`docs/offline.es.md`). |
| Los esquemas zod transforman la forma cruda de la API | Los nombres en snake_case y los precios en float existen solo en `src/schemas`. El resto de la app ve nombres en camelCase y centavos enteros. Una respuesta incorrecta falla en el borde con un `ApiError('shape')` tipado, no dentro de una pantalla. |
| Dinero en centavos enteros, formateadores `Intl` | La matemática en float sobre precios da errores de redondeo. Los centavos enteros no. `formatMoney` y `formatPercent` son los únicos formateadores, y usan el locale de la UI. El código agrega el signo `+` por su cuenta, porque Hermes no soporta la opción `signDisplay` en todos los dispositivos. |
| Sin librería de formularios | El formulario de orden tiene tres entradas y una función pura (`deriveOrder`). La función devuelve la cantidad, el total y los errores. react-hook-form agrega una capa de resolver alrededor de una función de 60 líneas que ya tiene tests. |
| Sin motivo de rechazo en el detalle de orden | La API no manda un motivo cuando rechaza una orden. El detalle de orden lista las causas habituales y no elige una. Adivinar puede mostrarle al usuario un motivo equivocado. |
| i18next, react-i18next y react-native-localize. El español es el idioma por defecto. | Los precios están en ARS. El inglés tiene las mismas claves. El tipo de las claves sale de `es.json`, así que una clave faltante es un error de tipos. |
| `react-native-svg` con íconos outline inline | La tab bar y los íconos de estado no necesitan una librería de fuentes de íconos ni configuración nativa de fuentes. |
| `StyleSheet` y tokens tipados en `src/theme` | Sin librería de estilos que aprender ni actualizar. Un color hex fuera del theme es un error de lint. Modo claro y oscuro: dos paletas con las mismas claves, y `makeStyles` arma las dos hojas una sola vez al importar, así que los componentes siguen con `StyleSheet` común y cambiar de tema no hace trabajo de estilos. No hace falta una librería de theming para dos paletas. |
| Sin modo oscuro | Fuera de alcance (`PRODUCT_BRIEF.es.md`). |

## Calidad

| Elección | Por qué |
|---|---|
| TypeScript `strict` y `noUncheckedIndexedAccess` | Los errores fallan en tiempo de compilación. |
| ESLint flat config (typescript-eslint, react, react-hooks, react-native, react-native-a11y, i18next) y Prettier | El lint hace cumplir las reglas del proyecto, no un documento. Ejemplos: sin colores hex fuera del theme, sin strings crudos en JSX, sin estilos inline, y props de accesibilidad en cada touchable. Además: sin `fetch` fuera de `src/api`, sin `console`, y `max-lines` en las pantallas. El proyecto no usa `@react-native/eslint-config`, porque fija ESLint 8 y Jest. |
| Vitest en Node, solo para lógica | Los tests son rápidos. El riesgo está en la matemática de dinero, los esquemas, el formulario de orden y los chequeos de plataforma. Maestro cubre las pantallas. |
| `tests/platform.test.ts` | Chequeos a nivel de fuente para problemas que solo aparecen en dispositivo y que Node no puede ver: el orden del import de i18n, cleartext traffic y las claves de env. |
| Maestro y `scripts/run-app.sh` | Un desarrollador o un agente tiene que ver la app después de un cambio de UI. Cada flujo guarda sus capturas en una ruta fija. |
| `scripts/verify.sh`, un hook de pre-commit (`core.hooksPath`) y CI | Un solo comando, exigido en tres lugares. |
| Chequeo del bundle de dev en `verify:full` | Un bundle de release no usa LogBox. Solo el bundle de dev muestra los errores de módulos que recibe un build de debug. |
| gitleaks en el hook de pre-commit (cuando está instalado) y en CI | Los secretos no llegan al remoto. |

## Patches

Una fila por cada `pnpm patch`: librería, versión, motivo, issue upstream. Borrar la fila al borrar el patch.

| Librería | Versión | Motivo | Upstream |
|---|---|---|---|
