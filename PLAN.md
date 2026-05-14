# LeagueHelper — Plan del Proyecto

## Objetivo
Herramienta que permite al usuario de **League of Legends** gestionar toda la selección de partida desde el teléfono móvil:
- Aceptar/rechazar partidas
- Elegir campeón (con sugerencias inteligentes)
- Configurar runas (manual o sugeridas)
- Elegir skin y summoner spells
- Sin necesidad de estar frente al PC

## Funcionalidades principales
- [ ] **Sugerencia de campeón inteligente:** basada en el perfil del jugador, picks del equipo enemigo y aliado, sinergia, counter matchups y composición de equipo
- [ ] **Aceptar partida** desde el teléfono
- [ ] **Selección de campeón, skin, runas y summoner spells** desde el móvil
- [ ] **Editor de runas manual** con opción de runas sugeridas/predeterminadas (como en el cliente)
- [ ] **Modos de operación:** automático (acepta todo sin preguntar) y manual (notifica y espera confirmación)
- [ ] **Sistema de emparejamiento PC-teléfono** vía código QR
- [ ] Integración con LCU API y Riot API

## Stack técnico (definido)

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Backend (servidor local) | Node.js + TypeScript | Librería `league-connect` para LCU auth, Express + ws, rápido de prototipar |
| Frontend (web móvil) | React + Vite | Liviano en móvil, ecosistema, fácil prototipado |
| Desktop .exe | Node.js compilado con `pkg` | Binario único, sin dependencias externas, distribución simple |
| Comunicación PC-teléfono | WebSocket | Tiempo real para eventos del juego |
| Base de datos | SQLite (`better-sqlite3`) | Datos locales de perfiles/runas, embebido, sin servidor |
| QR | `qrcode` (npm) | Generación de QR desde Node |

## Arquitectura

```
PC (Windows)
┌─────────────────────────────────────────────────┐
│  LeagueHelper.exe (Node.js + pkg)               │
│                                                   │
│  ┌──────────────┐    ┌───────────────────────┐   │
│  │ Servidor HTTP │◄──►│ LCU Bridge           │◄──┤ LCU API
│  │ (Express)     │    │ - auth automática    │   │ (localhost)
│  │ - API REST    │    │ - WebSocket listener │   │
│  │ - WebSocket   │    │ - proxy de eventos   │   │
│  │ - Frontend    │    └───────────────────────┘   │
│  │   estático    │                                 │
│  └──────┬───────┘                                 │
│         │                                          │
│    Muestra QR (IP + token)                         │
└─────────┼─────────────────────────────────────────┘
          │ Escanea QR
          ▼
┌──────────────────────┐
│  Teléfono (Browser)  │
│  React App (PWA)     │
│  - Aceptar partida   │
│  - Elegir campeón    │
│  - Runas/spells/skin │
│  - Sugerencias       │
└──────────────────────┘
```

## Investigación realizada

### LCU API
- **Autenticación:** Basic Auth (`riot:{password}`), puerto y password cambian cada sesión — se obtienen del proceso `LeagueClientUx.exe` (lockfile en `C:\Users\...\Riot Games\League Client\lockfile`)
- **HTTPS autofirmado:** Necesario ignorar errores SSL o usar el certificado de Riot
- **WebSocket:** Protocolo WAMP 1.0. Opcode 5 = suscribirse, 8 = evento recibido
- **Eventos clave:** `OnJsonApiEvent_lol-gameflow_v1_gameflow-phase` para cambios de estado; `OnJsonApiEvent_lol-champ-select_v1_session` para champ select
- **Endpoints clave:**
  - `POST /lol-matchmaking/v1/ready-check/accept` — aceptar partida
  - `GET /lol-champ-select/v1/session` — obtener sesión de champ select
  - `PATCH /lol-champ-select/v1/session/my-selection` — cambiar campeón, hechizos, skin
  - `GET/POST/DELETE /lol-perks/v1/pages` — CRUD de páginas de runas
  - `PUT /lol-perks/v1/currentpage` — activar página de runas
  - `GET /lol-summoner/v1/current-summoner` — datos del invocador
- **Librería existente:** `league-connect` (npm) facilita autenticación, WS y peticiones

### Riot API
- API oficial pública con rate limits
- Datos de campeones, runas, partidas, perfiles
- Requiere API key (registrarse en developer.riotgames.com)
- **Data Dragon:** Datos estáticos de campeones, runas, skins (sin API key)

### Sugerencias de campeón
- Fuente de datos: Riot API (perfil, mastery) + Community Dragon (runas) + lógica de counter matchup
- Se puede implementar como reglas basadas en datos estáticos + perfil del jugador
- Sin necesidad de ML en v1; usar datos de winrates públicos o lógica de counters

## Notas adicionales
- El plan detallado con sprints y validaciones está en `PLAN_DESARROLLO.md`
- Ver `CONFIG.md` para la configuración del modelo/entrenamiento
