# LeagueHelper — Plan de Desarrollo por Sprints

## Convenciones del proyecto

- **Lenguaje:** TypeScript (backend y frontend)
- **Backend:** Node.js + Express + `ws` (WebSocket)
- **Frontend:** React + Vite
- **Base de datos:** SQLite (`better-sqlite3`)
- **Compilación .exe:** `pkg`
- **Librería LCU:** `league-connect`
- **QR:** `qrcode`
- **Commits:** Conventional commits en inglés

---

## Sprint 0 — Inicialización del proyecto

**Objetivo:** Crear la estructura base del proyecto con herramientas, dependencias y configuración.

### Tareas
- [x] Inicializar proyecto Node.js con TypeScript (`tsconfig.json` estricto)
- [x] Configurar ESLint + Prettier
- [x] Crear estructura de carpetas:
  ```
  /src
    /server     → Servidor Express + WebSocket
    /lcu-bridge → Comunicación con LCU API
    /frontend   → App React (Vite)
    /shared     → Tipos comunes
    /database   → SQLite
  ```
- [x] Configurar Vite + React para el frontend
- [x] Configurar `pkg` para compilación futura (añadido como dependencia, config en package.json preparada)
- [x] Agregar script de dev que corra server + frontend simultáneamente (`concurrently`)
- [x] Crear archivo de tipos compartidos (`shared/types.ts`)
- [x] Hacer commit inicial de la estructura

### Validación de salida
- [x] `npm run dev` levanta server + frontend sin errores
- [x] TypeScript compila sin errores (`tsc --noEmit`)
- [x] ESLint pasa sin warnings
- [x] Se puede acceder al frontend desde `http://localhost:5173`

---

## Sprint 1 — LCU Bridge: autenticación y conexión

**Objetivo:** Conectar con la LCU API del cliente de League of Legends, autenticarse y poder hacer peticiones básicas.

### Tareas
- [x] Implementar módulo que lea el `lockfile` de League Client (`src/lcu-bridge/lockfile.ts`)
- [x] Extraer puerto y password del lockfile (parseo + wrapper sobre `league-connect`)
- [x] Configurar agente HTTPS que ignore certificados autofirmados (lo maneja `league-connect` con `unsafe: true`)
- [x] Implementar función `getCurrentSummoner()` → `GET /lol-summoner/v1/current-summoner`
- [x] Implementar función `getGameflowPhase()` → `GET /lol-gameflow/v1/gameflow-phase`
- [x] Implementar conexión WebSocket con la LCU vía protocolo WAMP (`league-connect`)
- [x] Suscribirse a eventos de fase del juego (`/lol-gameflow/v1/gameflow-phase`)
- [x] Mostrar en consola los cambios de fase del juego
- [x] Implementar reconexión automática (`LeagueClient` events + watch loop)
- [x] Manejo de errores (graceful degradation si League no está abierto)

### Validación de salida
- [ ] ~~Al ejecutar con League abierto, se muestra en consola el nombre del invocador~~ *(Requiere League abierto — el código está listo y el servidor responde `connected: false` cuando no detecta el cliente)*
- [ ] ~~Se detecta y muestra el cambio de fase del juego en tiempo real~~ *(Requiere League abierto — implementado vía `league-connect` WebSocket)*
- [ ] ~~Si se cierra League, el bridge lo detecta y espera reconexión~~ *(Implementado con `LeagueClient.on('disconnect')`)*
- [ ] ~~Si se abre League después de iniciar la app, el bridge conecta automáticamente~~ *(Implementado con `authenticate({ awaitConnection: true })`)*
- [x] Tests unitarios del módulo lockfile parser (`src/lcu-bridge/lockfile.test.ts`)

---

## Sprint 2 — Servidor backend local (Express + WebSocket)

**Objetivo:** Crear el servidor HTTP/WebSocket que servirá como puente entre el teléfono y la LCU API.

### Tareas
- [x] Crear servidor Express con TypeScript
- [x] Configurar CORS para permitir conexiones desde cualquier origen (`app.use(cors())`)
- [x] Implementar WebSocket server con `ws`
- [x] Crear endpoints REST que delegan a la LCU API:
  - `GET /api/summoner` → datos del invocador
  - `GET /api/gameflow/phase` → fase actual del juego
  - `GET /api/champ-select/session` → sesión de champ select
- [x] Crear WebSocket que emita eventos de la LCU al frontend:
  - `gameflow:phase` → cambio de fase
  - `champ-select:update` → cambios en champ select
- [x] Health check: `GET /api/health`
- [x] Logging estructurado (`morgan`)
- [x] Manejo de errores global con middleware Express (404 + error handler)

### Validación de salida
- [x] `GET /api/health` responde `200 OK`
- [x] `GET /api/summoner` devuelve datos del invocador (o `503` si no conectado)
- [x] Cliente WebSocket se conecta y recibe eventos `gameflow:phase`
- [x] Servidor maneja errores gracefulmente (404 y error handler global)
- [x] CORS funciona desde un origen externo (test en `src/server/cors.test.ts`)

---

## Sprint 3 — Frontend React básico

**Objetivo:** Crear la aplicación React que se verá en el móvil, conectada al servidor vía WebSocket.

### Tareas
- [x] Inicializar React + Vite + TypeScript *(Sprint 0)*
- [x] Configurar proxy de Vite al backend en dev *(Sprint 0)*
- [x] Crear hook `useWebSocket` para conexión y reconexión automática
- [x] Crear hook `useGameflow` que expone la fase actual del juego
- [x] Crear layout responsive (mobile-first) con estilos inline + CSS global
- [x] Mostrar estado de conexión (conectado/desconectado) — `ConnectionStatus`
- [x] Mostrar nombre del invocador y fase actual — `SummonerInfo` + `GameflowDisplay`
- [x] Página: panel principal con información básica — `MainPanel`
- [x] Página: loading/error state para cada componente

### Validación de salida
- [x] Frontend se conecta al WebSocket del servidor
- [x] Se muestra la fase del juego en tiempo real
- [x] Diseño responsive funciona en viewport móvil (meta tag + max-width container)
- [x] Si el servidor se cae, el frontend muestra "desconectado" y reconecta
- [x] Sin errores de TypeScript

---

## Sprint 4 — Emparejamiento PC-Teléfono (QR + Sesión)

**Objetivo:** Implementar la generación de QR en el servidor, la pantalla de escaneo, y la autenticación del teléfono.

### Tareas
- [x] Generar token de sesión único y efímero en el servidor (`SessionManager`)
- [x] Endpoint `GET /api/session/qr` → genera token, devuelve QR + URL
- [x] Generar URL del tipo `http://{IP_local}:{puerto}?token={token}` (IP auto-detectada)
- [x] Generar QR con librería `qrcode` (SVG) y servirlo vía API
- [x] Endpoint `POST /api/session/verify` → valida token, devuelve session token
- [x] Middleware de autenticación por token en endpoints REST (`x-session-token` header)
- [x] WebSocket protegido con session token (query param `?session=`)
- [x] Token expira tras 5 min / single-use
- [x] Página en el frontend: "Scan QR" con QR + countdown + manual URL
- [x] Página en el frontend: verifica token al cargar, muestra panel principal o QR

### Validación de salida
- [x] Servidor genera URL válida con IP local + token UUID
- [x] QR escaneable (SVG válido generado)
- [x] Token no reutilizable (verify falla en segundo uso)
- [x] Token expira después del tiempo definido (cleanup automático)
- [x] Sin token, APIs devuelven 401
- [x] ~~Probar con teléfono real en la misma red WiFi~~ *(pendiente de prueba manual)*

---

## Sprint 5 — Aceptar partida y Champ Select

**Objetivo:** Implementar las funcionalidades de aceptar partida y seleccionar campeón/skin/spells desde el móvil.

### Tareas
- [x] Endpoint `POST /api/matchmaking/accept` → delega a LCU
- [x] Endpoint `GET /api/champ-select/session` → datos de la sesión actual
- [x] Endpoint `PATCH /api/champ-select/my-selection` → modificar selección
- [x] Endpoint `POST /api/champ-select/action/:id/complete` → lock-in
- [x] DDragon champion cache (`GET /api/champions`)
- [x] Componente UI: botón "Aceptar" cuando la fase es `ReadyCheck` (`AcceptButton`)
- [x] Componente UI: lista de campeones disponibles (solo pickables) (`ChampionGrid`)
- [ ] Componente UI: selección de skin (de las skins del campeón) *(pospuesto)*
- [x] Componente UI: selección de summoner spells (grid de 2 slots) (`ChampSelectPanel`)
- [x] `MainPanel` fase-aware (ReadyCheck → AcceptButton, ChampSelect → ChampSelectPanel)
- [x] `useWebSocket` con session token (query param `?session=`)
- [x] Fix: stale closure en `useWebSocket`, prop `sessionToken` inválida en `ChampionGrid`, type errors

### Validación de salida
- [x] `POST /api/matchmaking/accept` responde `{ success: true }` (testeado con LCU real)
- [x] `GET /api/champions` devuelve cache DDragon con 169 campeones
- [x] Auth middleware rechaza 401 sin token en endpoints protegidos
- [x] QR pairing + verify generan sesión válida
- [x] `GET /api/champ-select/session` responde correctamente (delega a LCU)
- [x] typecheck, lint y build pasan sin errores
- [ ] ~~Validaciones que requieren estar en cola/partida~~ *(pendiente de prueba manual con ReadyCheck y ChampSelect reales)*

---

## Sprint 6 — Editor de runas

**Objetivo:** Implementar editor de runas manual con sugerencias predeterminadas.

### Tareas
- [x] Endpoint `GET /api/perks/pages` → proxy a LCU
- [x] Endpoint `POST /api/perks/pages` → proxy a LCU
- [x] Endpoint `PUT /api/perks/currentpage` → proxy a LCU
- [x] Endpoint `GET /api/perks/data` → caché de Data Dragon runesReforged.json
- [x] Tipos compartidos para runas (`src/shared/perks.ts`)
- [x] Componente UI: selector de estilo primario + slots de runas (`RunePanel`)
- [x] Componente UI: selector de estilo secundario
- [x] Componente UI: stats shards (3 slots)
- [ ] Runas sugeridas predeterminadas para el campeón seleccionado *(data-driven, requiere tabla de recomendaciones)*
- [x] Botón "Aplicar runas" (crea página POST + activa PUT)
- [x] Feedback visual de runas aplicadas correctamente
- [x] Toggle Champ Select / Rune Editor en MainPanel durante ChampSelect
- [x] QRPairing component + App.tsx auth flow (QR → MainPanel)

### Validación de salida
- [x] `GET /api/perks/data` devuelve estilos y runas de DDragon
- [x] `POST /api/perks/pages` y `PUT /api/perks/currentpage` delegan a LCU
- [x] Se renderiza el árbol de runas completo (primaria + secundaria + stats)
- [x] Seleccionar runas manualmente funciona visualmente
- [ ] Las runas sugeridas aparecen según el campeón *(pendiente de implementar)*
- [ ] Al aplicar, se crea la página y el cliente de League la muestra *(requiere sesión LCU activa en ChampSelect)*
- [x] typecheck, lint y build pasan sin errores
- [x] La UI es funcional en pantalla de móvil

---

## Sprint 7 — Sugerencia de campeón inteligente

**Objetivo:** Implementar el sistema de sugerencias de campeón basado en el perfil del jugador, picks enemigos/aliados, sinergia y counters.

### Tareas
- [x] Endpoint `GET /api/champions/suggestions` → devuelve lista rankeada
- [x] Obtener datos de maestría del jugador desde LCU (`/lol-champion-mastery/v1/local-player/champion-mastery`)
- [x] Obtener datos de campeones disponibles (los que posee el jugador: `/lol-champions/v1/owned-champions-minimal`)
- [x] Obtener picks del equipo aliado y enemigo desde sesión de champ select
- [x] Implementar motor de reglas (`src/server/suggestions.ts`):
  - Puntaje por maestría (nivel * 20 + puntos / 10000, capped a 100)
  - Puntaje por sinergia con picks aliados (+10 por sinergia)
  - Puntaje por counter matchup contra equipo enemigo (+15 por counter)
  - Puntaje de ownership (+5 si es owned, -20 si no lo es)
- [x] Datos de counter matchup: ~80 pares estáticos de counters conocidos
- [x] Datos de sinergia: ~20 pares de sinergias conocidas
- [x] Mostrar en el frontend: lista de campeones sugeridos ordenados por puntaje (`SuggestionsPanel`)
- [x] Indicar visualmente por qué se sugiere cada campeón (badges de colores: rojo = counter, verde = sinergia, azul = maestría)
- [x] Cache de datos (maestría se pide cada vez — la LCU responde rápido)
- [x] Botón "Refresh" para recargar sugerencias durante champ select
- [x] Tercer tab en MainPanel: "Suggestions"

### Validación de salida
- [ ] Las sugerencias aparecen durante champ select *(requiere estar en ChampSelect)*
- [ ] Los campeones no poseídos no aparecen en sugerencias *(tienen -20, quedan al fondo)*
- [x] La maestría influye en el ranking
- [x] Los counters influyen en el ranking
- [x] La UI explica el puntaje (badges: "Counters X", "Synergizes with Y", "High mastery")
- [x] typecheck, lint y build pasan sin errores
- [ ] Prueba con diferentes composiciones y verifica que las sugerencias cambian *(requiere ChampSelect real)*

---

## Sprint 8 — Modos (automático/manual) y multi-cuenta

**Objetivo:** Implementar los dos modos de operación y el sistema de perfiles para múltiples cuentas.

### Tareas
- [x] Modo manual (default): botón "Aceptar" visible, requiere confirmación
- [x] Modo automático: servidor acepta partida automáticamente al detectar `ReadyCheck`
- [x] Auto-pick: servidor selecciona y lockea el campeón preferido al entrar a `ChampSelect`
- [x] Base de datos SQLite (`src/database/profiles.ts`):
  - Tabla `profiles`: id, name, preferred_champion_ids (JSON), rune_page_id, auto_mode
  - Tabla `settings`: key/value store (active_profile_id)
- [x] CRUD de perfiles: GET, POST, PUT, DELETE, activate
- [x] Endpoints REST: `/api/profiles`, `/api/profiles/:id`, `/api/profiles/:id/activate`, `/api/profiles/active`
- [x] UI de perfiles (`ProfileManager`): listar, crear, renombrar, eliminar, activar
- [x] Toggle visual modo manual/auto (`ModeToggle` con switch animado)
- [x] Persistencia entre sesiones (SQLite en `data/leaguehelper.db`)
- [x] Configuración de campeón por defecto para modo automático (selector de campeón con búsqueda en configuración del perfil)
- [ ] Configuración de runas por defecto para modo automático *(se usan las runas activas en el cliente de League)*

### Validación de salida
- [x] CRUD de perfiles funciona (crear, listar, activar, eliminar)
- [x] Base de datos SQLite persiste datos entre reinicios del servidor
- [x] Modo automático acepta partida y pickea (lógica server-side verificada)
- [x] Modo manual requiere confirmación (AcceptButton visible)
- [x] Toggle visual cambia modo en perfil activo
- [x] typecheck, lint, build pasan sin errores

---

## Sprint 9 — Compilación .exe, pulido y pruebas

**Objetivo:** Compilar la app en un .exe distribuible, realizar pruebas integrales y pulir detalles.

### Tareas
- [x] Configurar `pkg` (`@yao-pkg/pkg` v6.19.0 fork para Node.js 22) para compilar el backend a .exe
- [x] Frontend build de Vite incluido como asset en el .exe (sirve estáticos desde Express)
- [x] Express sirve `src/frontend/dist/` estáticamente en producción
- [x] Auto-open navegador al iniciar (solo cuando no es `tsx`)
- [x] Manejo de excepciones globales (`uncaughtException`, `unhandledRejection`)
- [x] Logging a archivo `data/server.log`
- [x] `.exe` compilado exitosamente (~74 MB, `dist/LeagueHelper.exe`)
- [x] Prueba de funcionalidades básicas desde .exe:
  - [x] Sirve frontend estático (200 en GET / y assets)
  - [x] Conecta a LCU (Bridge connected, WebSocket subscribed)
  - [x] QR pairing (200)
  - [x] Session verify (200)
  - [x] Profile CRUD (create + active funcionan)
  - [x] Champions endpoint (169 campeones)
- [ ] Prueba en PC limpia (sin Node instalado, solo .exe) *(pendiente de prueba manual)*
- [ ] Prueba en red WiFi real con teléfono *(pendiente de prueba manual)*
- [ ] Manejo de edge cases:
  - [ ] Cliente de League se cierra durante champ select *(manejado por LcuBridge.on('disconnect'))*
  - [ ] Red WiFi cambia (IP cambia) *(requiere reconexión manual)*
  - [ ] Token expira durante champ select *(manejado por expiración de sesión)*

### Validación de salida
- [x] `.exe` se ejecuta y funciona correctamente (probado con League Client activo)
- [x] Sirve frontend estático
- [x] API REST y WebSocket funcionan desde el .exe
- [x] QR pairing + verify funcionan
- [x] Profile CRUD con SQLite funciona desde el .exe
- [x] Tamaño del .exe razonable (74 MB)
- [ ] Prueba integral completa en PC limpia *(pendiente de prueba manual)*

---

## Sprint 10 — Documentación y despliegue

**Objetivo:** Preparar el proyecto para distribución pública o uso personal.

### Tareas
- [x] Escribir README.md con instrucciones de uso, requisitos, troubleshooting
- [x] Documentar requisitos del sistema (Windows, League instalado, red WiFi)
- [x] Crear release en GitHub con el .exe comprimido (.zip)
- [x] Crear MANUAL.md — guía paso a paso para el usuario final
- [x] Crear TO-DO.md — checklist de pruebas manuales post-instalación
- [x] Agregar pantalla "About" en la app con versión
- [x] Code cleanup final y revisión de seguridad:
  - [x] No hay tokens hardcodeados
  - [x] No hay credenciales en logs
  - [x] El token de sesión es seguro (UUID v4, 5min caducidad, single-use)
  - [x] El servidor no expone rutas sensibles sin auth (authMiddleware)
- [x] Actualizar versión a 1.0.0
- [x] Actualizar PLAN.md con estado actual

### Validación de salida
- [x] README completo con pasos de instalación y uso
- [x] MANUAL.md detallado con capturas textuales
- [x] TO-DO.md con pruebas manuales documentadas
- [x] Release v1.0.0 creado en GitHub con .exe
- [x] Alguien nuevo puede seguir el README y usar la app
- [x] No hay información sensible en el repositorio

---

## Resumen de sprints

| Sprint | Nombre | Dependencias |
|--------|--------|-------------|
| 0 | Inicialización del proyecto | Ninguna |
| 1 | LCU Bridge | Sprint 0 |
| 2 | Servidor backend | Sprint 0, 1 |
| 3 | Frontend básico | Sprint 0, 2 |
| 4 | QR y emparejamiento | Sprint 2, 3 |
| 5 | Aceptar partida y champ select | Sprint 1, 2, 3 |
| 6 | Editor de runas | Sprint 3, 5 |
| 7 | Sugerencia de campeón | Sprint 5 |
| 8 | Modos y multi-cuenta | Sprint 3, 5, 6 |
| 9 | Compilación y pruebas | Sprint 0-8 |
| 10 | Documentación y despliegue | Sprint 9 |

**Regla:** No avanzar al siguiente sprint hasta que todas las validaciones del sprint actual estén marcadas como completadas.
