# Checklist de producción

Traducción de [`production-checklist.md`](production-checklist.md). Si hay diferencias, vale la versión en inglés.

Hacer estos chequeos antes del primer envío a las tiendas y antes de cada release mayor. CI hace los ítems marcados con (CI). Esta app todavía no tuvo un release en tiendas, así que ningún ítem está marcado.

## Build y release

- [ ] `pnpm verify:full` en verde (CI).
- [ ] Un script de release fija los números de build (iOS `CURRENT_PROJECT_VERSION`, Android `versionCode`) a partir de `package.json`. Nadie los cambia a mano.
- [ ] El bundle id y el nombre del paquete son definitivos. No se pueden cambiar después del primer envío.
- [ ] Esta app no tiene una capa de actualizaciones over-the-air, así que cada cambio de JS necesita un build nuevo. Si más adelante se agrega una capa así, fijar su runtime version al build nativo.
- [ ] Un cambio nativo necesita `pnpm pods` y un build local limpio antes del build de release. Son cambios nativos: una dependencia nativa nueva, un permiso, o un cambio en `Info.plist` o `AndroidManifest.xml`.
- [ ] Los valores de producción salen del almacén de secretos de CI hacia un `ENVFILE` para `react-native-config`. El archivo `.env` del repo solo tiene valores públicos por defecto.
- [ ] La app obtiene del servidor la versión mínima soportada al iniciar. Por debajo de esa versión, muestra una pantalla que bloquea el uso hasta que el usuario actualice. Solo un binario nuevo puede arreglar un binario viejo.

## Revisar el binario de release, no el código fuente

Hacer estos chequeos sobre el archivo del build de producción:

- [ ] La URL de la API en el bundle es la de producción (sin `localhost`, IP de LAN ni host de staging).
- [ ] Android: el manifest de release tiene `usesCleartextTraffic=false`. `tests/platform.test.ts` verifica que el placeholder siga en `AndroidManifest.xml`.
- [ ] Android: sin permiso `AD_ID`, salvo que la app use el advertising ID y la Play Console lo declare.
- [ ] Android: el build tiene la firma de release, no la de debug.
- [ ] Las pantallas de debug, los menús de dev y las cuentas de prueba existen solo detrás de `__DEV__`. En esta app, el nivel de bugs y el reinicio de cuenta del tab Cuenta son solo de debug.

## Revisión de las tiendas

- [ ] Guideline 3.1.1 de Apple: sin links ni textos que apunten a compras externas de bienes digitales.
- [ ] Sign in with Apple, si la app tiene algún otro login social (iOS).
- [ ] Eliminación de cuenta dentro de la app, si un usuario puede crear una cuenta.
- [ ] La URL de la política de privacidad y la URL de soporte funcionan.
- [ ] Manifiesto de privacidad de iOS (`ios/CocosChallenge/PrivacyInfo.xcprivacy`): declara cada API de "required reason". Revisar también las librerías de terceros.
- [ ] Las etiquetas de privacidad del App Store y el formulario de seguridad de datos de Play coinciden con los datos que recolectan la app y sus SDKs.
- [ ] Cada `NS*UsageDescription` y cada permiso de Android tiene un texto de motivo específico. La app pide un permiso solo cuando lo necesita.
- [ ] Capturas, descripción, palabras clave, clasificación por edad y notas para la revisión con una cuenta demo están listas.

## Monitoreo

- [ ] El reporte de crashes está activo (Sentry, con `SENTRY_DSN` definido en el `ENVFILE` de release). Cada build sube sus source maps.
- [ ] El reporte de crashes arranca al iniciar la app, antes del login. El consentimiento del usuario controla solo la identidad de usuario que se adjunta a los eventos. Nunca adjuntar una identidad para un menor.
- [ ] Existen un manejador global de errores de JS y un error boundary de React en la raíz. Sin `LogBox.ignoreAllLogs()`.
- [ ] Cada evento tiene un tag de release y de versión, para poder encontrar el build que crasheó.

## Actualizaciones

- [ ] Actualizar React Native de a una versión menor por vez con el Upgrade Helper, poco después de cada release. Un salto de dos o más versiones rompe muchos SDKs al mismo tiempo.
- [ ] Ejecutar `scripts/run-app.sh` en ambas plataformas antes y después de la actualización, y comparar las capturas.
- [ ] Revisar cada patch de `patches/` contra las versiones nuevas de las librerías.

## Dispositivos

- [ ] Solo teléfonos: poner `TARGETED_DEVICE_FAMILY = 1` en el proyecto de iOS (ahora es `1,2`, que permite iPad). Si se mantiene el soporte para tablets, tomar capturas de smoke en un simulador de iPad y en un emulador de tablet.

## Offline y datos

- [ ] Modo avión: cada pantalla principal muestra datos cacheados o un estado vacío diseñado. Un spinner nunca queda para siempre.
- [ ] Ninguna orden va a una cola mientras el dispositivo está offline (`docs/offline.es.md`). El botón de enviar está deshabilitado.
- [ ] Un cambio de candidate id nunca muestra los datos cacheados del candidato anterior.

## Accesibilidad

- [ ] VoiceOver y TalkBack funcionan en los flujos principales. Cada control tiene un rol y una etiqueta.
- [ ] El texto escala con el tamaño de fuente del sistema y no se corta (probar con el tamaño más grande).
- [ ] Cada área táctil mide al menos 44×44 pt.
- [ ] El texto del cuerpo tiene un contraste de al menos 4.5:1.

## Rendimiento

- [ ] Las listas largas usan `FlashList` o un `FlatList` con keys correctas.
- [ ] Las imágenes remotas tienen dimensiones explícitas y caché. Agregar una librería de caché solo si la app llega a tener muchas imágenes.
- [ ] Medir el arranque en frío en un Android de gama baja.

## Seguridad

- [ ] Si la app llega a tener login, los tokens van solo a Keychain o Keystore (`react-native-keychain`), nunca a MMKV ni a AsyncStorage.
- [ ] Sin secretos en `.env` (el bundle de la app lo contiene) ni en el repo (gitleaks en CI).
- [ ] Los certificados y claves de push y de firma quedan en el almacén de secretos de CI, no en el repo.
- [ ] La app valida cada deep link antes de navegar.

## Dinero

- [ ] Probar los montos con casos límite de redondeo (`0.1 + 0.2`, vender todas las acciones, una moneda sin unidad menor).
- [ ] Integridad del dispositivo: usar la Play Integrity API, no SafetyNet (Google la dio de baja).
- [ ] Certificate pinning, si se usa: mantener un pin de respaldo y un plan de rotación antes de que venza el certificado.
- [ ] Volver a pedir autenticación biométrica o por contraseña antes de una acción sensible (una transferencia, un cambio en los datos de cobro).
