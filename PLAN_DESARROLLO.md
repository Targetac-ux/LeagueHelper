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
- [ ] Crear servidor Express con TypeScript
- [ ] Configurar CORS para permitir conexiones desde cualquier origen (la IP del teléfono)
- [ ] Implementar WebSocket server con `ws`
- [ ] Crear endpoints REST que delegan a la LCU API:
  - `GET /api/summoner` → datos del invocador
  - `GET /api/gameflow/phase` → fase actual del juego
  - `GET /api/champ-select/session` → sesión de champ select
- [ ] Crear WebSocket que emita eventos de la LCU al frontend:
  - `gameflow:phase` → cambio de fase
  - `champ-select:update` → cambios en champ select
- [ ] Health check: `GET /api/health`
- [ ] Logging estructurado (morgan o pino)
- [ ] Manejo de errores global con middleware Express

### Validación de salida
- [ ] `GET /api/health` responde `200 OK`
- [ ] `GET /api/summoner` devuelve datos del invocador
- [ ] Cliente WebSocket se conecta y recibe eventos `gameflow:phase`
- [ ] Servidor maneja errores gracefulmente (no crashea)
- [ ] CORS funciona desde un origen externo (simulado)

---

## Sprint 3 — Frontend React básico

**Objetivo:** Crear la aplicación React que se verá en el móvil, conectada al servidor vía WebSocket.

### Tareas
- [ ] Inicializar React + Vite + TypeScript
- [ ] Configurar proxy de Vite al backend en dev
- [ ] Crear hook `useWebSocket` para conexión y reconexión automática
- [ ] Crear hook `useGameflow` que expone la fase actual del juego
- [ ] Crear layout responsive (mobile-first) con CSS modules o Tailwind
- [ ] Mostrar estado de conexión (conectado/desconectado)
- [ ] Mostrar nombre del invocador y fase actual
- [ ] Página: panel principal con información básica
- [ ] Página: loading/error state para cada componente

### Validación de salida
- [ ] Frontend se conecta al WebSocket del servidor
- [ ] Se muestra la fase del juego en tiempo real
- [ ] Diseño responsive funciona en viewport móvil (375px - 414px)
- [ ] Si el servidor se cae, el frontend muestra "desconectado" y reconecta
- [ ] Sin errores de TypeScript

---

## Sprint 4 — Emparejamiento PC-Teléfono (QR + Sesión)

**Objetivo:** Implementar la generación de QR en el servidor, la pantalla de escaneo, y la autenticación del teléfono.

### Tareas
- [ ] Generar token de sesión único y efímero en el servidor
- [ ] Endpoint `GET /api/session/token` → genera y devuelve token
- [ ] Generar URL del tipo `http://{IP_local}:{puerto}?token={token}`
- [ ] Generar QR con la librería `qrcode` y servirlo como imagen/HTML
- [ ] Endpoint `POST /api/session/verify` → verifica que el token es válido
- [ ] Middleware de autenticación por token en endpoints sensibles (WebSocket y REST)
- [ ] El token expira después de primer uso o tras N minutos
- [ ] Página en el frontend: "Escanea el QR con tu teléfono"
- [ ] Página en el frontend: después de escanear, redirige al panel principal
- [ ] Manejo de renovación de token si expira

### Validación de salida
- [ ] Servidor genera URL válida con token cifrado
- [ ] QR escaneable lleva a la app web del frontend
- [ ] Token no reutilizable (un solo teléfono puede conectarse)
- [ ] Token expira después del tiempo definido
- [ ] Sin token, las APIs devuelven 401
- [ ] Probar con teléfono real en la misma red WiFi

---

## Sprint 5 — Aceptar partida y Champ Select

**Objetivo:** Implementar las funcionalidades de aceptar partida y seleccionar campeón/skin/spells desde el móvil.

### Tareas
- [ ] Endpoint `POST /api/matchmaking/accept` → delega a LCU
- [ ] Endpoint `GET /api/champ-select/session` → datos de la sesión actual
- [ ] Endpoint `PATCH /api/champ-select/my-selection` → modificar selección
- [ ] Componente UI: botón "Aceptar" cuando la fase es `ReadyCheck`
- [ ] Modal/timer visible cuando hay ready check
- [ ] Componente UI: lista de campeones disponibles (solo pickables)
- [ ] Componente UI: selección de skin (de las skins del campeón)
- [ ] Componente UI: selección de summoner spells (grid de 2 slots)
- [ ] WebSocket emite evento de ready check y el frontend reacciona
- [ ] Confirmación visual de que la acción se realizó (aceptar, pick, etc.)

### Validación de salida
- [ ] Al llegar un ready check, aparece botón "Aceptar" en el móvil
- [ ] Al presionar aceptar, la partida se acepta (confirmar en el cliente de League)
- [ ] Al entrar a champ select, se ven los campeones disponibles
- [ ] Seleccionar un campeón lo selecciona en el cliente de League
- [ ] Cambiar skin se refleja en el cliente
- [ ] Cambiar summoner spells se refleja en el cliente
- [ ] El timer de champ select se sincroniza con el cliente

---

## Sprint 6 — Editor de runas

**Objetivo:** Implementar editor de runas manual con sugerencias predeterminadas.

### Tareas
- [ ] Endpoint `GET /api/perks/pages` → obtener páginas de runas
- [ ] Endpoint `POST /api/perks/pages` → crear nueva página
- [ ] Endpoint `PUT /api/perks/currentpage` → activar página de runas
- [ ] Obtener datos estáticos de runas (Data Dragon / Community Dragon)
- [ ] Componente UI: árbol de runas interactivo (primaria + secundaria + stats)
- [ ] Componente UI: selección de estilo primario con sus runas
- [ ] Componente UI: selección de estilo secundario
- [ ] Componente UI: stats shards
- [ ] Runas sugeridas predeterminadas para el campeón seleccionado
- [ ] Botón "Aplicar runas" que crea la página y la activa
- [ ] Feedback visual de runas aplicadas correctamente

### Validación de salida
- [ ] Se renderiza el árbol de runas completo (estilos, runas menores, stats)
- [ ] Seleccionar runas manualmente funciona visualmente
- [ ] Las runas sugeridas aparecen según el campeón
- [ ] Al aplicar, se crea la página y el cliente de League la muestra
- [ ] Si hay máximo de páginas, se reemplaza la actual
- [ ] La UI es funcional en pantalla de móvil

---

## Sprint 7 — Sugerencia de campeón inteligente

**Objetivo:** Implementar el sistema de sugerencias de campeón basado en el perfil del jugador, picks enemigos/aliados, sinergia y counters.

### Tareas
- [ ] Endpoint `GET /api/champions/suggestions` → devuelve lista rankeada
- [ ] Obtener datos de maestría del jugador desde LCU (`/lol-champion-mastery/v1/local-player/champion-mastery`)
- [ ] Obtener datos de campeones disponibles (los que posee el jugador)
- [ ] Obtener picks del equipo aliado y enemigo desde sesión de champ select
- [ ] Implementar motor de reglas:
  - Puntaje por maestría (más maestría = mejor)
  - Puntaje por sinergia con picks aliados (combo de habilidades)
  - Puntaje por counter matchup contra equipo enemigo
  - Puntaje por composición de equipo (balance AD/AP, tanques, etc.)
- [ ] Mostrar en el frontend: lista de campeones sugeridos ordenados por puntaje
- [ ] Indicar visualmente por qué se sugiere cada campeón (color, badge, texto)
- [ ] Cache de datos de maestría (no pedir en cada champ select)
- [ ] Opción de recargar/refrescar sugerencias durante champ select
- [ ] Datos de counter matchup: archivo JSON estático con matchups (fuente: Community Dragon o datos manuales curados)

### Validación de salida
- [ ] Las sugerencias aparecen durante champ select
- [ ] Los campeones no poseídos no aparecen en sugerencias
- [ ] La maestría influye en el ranking
- [ ] Los counters influyen en el ranking
- [ ] La UI explica el puntaje (ej: "Alta sinergia con support", "Counter pick")
- [ ] El rendimiento no se degrada durante champ select (cálculo rápido)
- [ ] Prueba con diferentes composiciones y verifica que las sugerencias cambian

---

## Sprint 8 — Modos (automático/manual) y multi-cuenta

**Objetivo:** Implementar los dos modos de operación y el sistema de perfiles para múltiples cuentas.

### Tareas
- [ ] Modo manual (default): el usuario recibe notificación y debe confirmar cada acción
- [ ] Modo automático: acepta partida automáticamente y aplica configuración predefinida
- [ ] Configuración de campeón por defecto para modo automático
- [ ] Configuración de runas por defecto para modo automático
- [ ] Alternar modo desde el frontend (toggle visual)
- [ ] Base de datos SQLite: tabla `profiles`
  - `id`, `name`, `preferredChampions[]`, `runePages[]`, `defaultMode`
- [ ] CRUD de perfiles (crear, editar, eliminar, seleccionar)
- [ ] Endpoints REST para perfiles
- [ ] UI de perfiles en el frontend
- [ ] Persistencia de configuración entre sesiones de la app

### Validación de salida
- [ ] En modo manual, el usuario debe confirmar para aceptar/pick
- [ ] En modo automático, se acepta y pickea automáticamente
- [ ] Se pueden crear múltiples perfiles
- [ ] Cambiar de perfil cambia la configuración activa
- [ ] Los perfiles persisten al cerrar y abrir la app
- [ ] SQLite funciona correctamente desde el .exe compilado

---

## Sprint 9 — Compilación .exe, pulido y pruebas

**Objetivo:** Compilar la app en un .exe distribuible, realizar pruebas integrales y pulir detalles.

### Tareas
- [ ] Configurar `pkg` para compilar el backend a .exe
- [ ] Configurar build de Vite para producción (frontend estático)
- [ ] Embeber frontend build en el binario de Node (o servirlo desde carpeta adjunta)
- [ ] Hacer que el .exe abra el navegador automáticamente al iniciar
- [ ] Manejo de excepciones globales (evitar crash inesperado)
- [ ] Logging a archivo para debug
- [ ] Prueba integral en PC limpia (sin Node instalado, solo .exe)
- [ ] Prueba con League abierto y cerrado
- [ ] Prueba en red WiFi real con teléfono
- [ ] Prueba de todas las funcionalidades:
  - [ ] Escanear QR y conectar
  - [ ] Aceptar partida
  - [ ] Seleccionar campeón
  - [ ] Cambiar runas
  - [ ] Cambiar summoner spells
  - [ ] Sugerencias de campeón
  - [ ] Modo automático y manual
  - [ ] Multi-cuenta / perfiles
- [ ] Manejo de edge cases:
  - [ ] Cliente de League se cierra durante champ select
  - [ ] Red WiFi cambia (IP cambia)
  - [ ] Token expira durante champ select
  - [ ] Múltiples ready checks seguidos

### Validación de salida
- [ ] .exe se ejecuta en Windows sin Node.js instalado
- [ ] Al ejecutar, se abre el navegador con el QR
- [ ] Escanear QR con teléfono real funciona
- [ ] Todas las funcionalidades pasan prueba integral
- [ ] El .exe no crashea en casos borde
- [ ] Tamaño del .exe razonable

---

## Sprint 10 — Documentación y despliegue

**Objetivo:** Preparar el proyecto para distribución pública o uso personal.

### Tareas
- [ ] Escribir README.md con instrucciones de uso
- [ ] Documentar cómo obtener API key de Riot (opcional)
- [ ] Documentar requisitos del sistema (Windows, League instalado, red WiFi)
- [ ] Crear release en GitHub con el .exe comprimido
- [ ] Escribir guía de troubleshooting (puertos, firewall, antivirus)
- [ ] Considerar firma de código (Authenticode) para reducir falsos positivos
- [ ] Agregar pantalla "Acerca de" en la app con versión
- [ ] Check de actualizaciones (opcional: GitHub Releases API)
- [ ] Code cleanup final y revisión de seguridad:
  - [ ] No hay tokens hardcodeados
  - [ ] No hay credenciales en logs
  - [ ] El token de sesión es seguro
  - [ ] El servidor no expone rutas sensibles sin auth

### Validación de salida
- [ ] README completo con pasos de instalación y uso
- [ ] Release creado en GitHub con .exe
- [ ] Alguien nuevo puede seguir el README y usar la app
- [ ] No hay información sensible en el repositorio

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
