# LeagueHelper — Plan del Proyecto

## Objetivo
Herramienta que permite al usuario de **League of Legends** interactuar con el cliente del juego desde el teléfono móvil para:
- Aceptar partidas automática/remotamente
- Elegir campeón, skin, runas y summoner spells
- Gestionar la selección sin estar frente al PC

## Funcionalidades principales
- [ ] Cliente móvil (app/web) para interactuar con el juego
- [ ] Servidor intermedio que se comunique con el cliente de League
- [ ] Integración con la API de League of Legends (Riot API / LCU API)
- [ ] Sistema de autenticación y vinculación PC-teléfono
- [ ] Interfaz para selección de campeón, skin, runas y hechizos
- [ ] Notificaciones push cuando llegue una partida

## Preguntas abiertas / Decisiones pendientes

### Stack técnico
- **App móvil:** ¿App nativa (Kotlin/Swift), multiplataforma (Flutter/React Native) o web (PWA)?
- **Backend:** ¿Node.js, Python (FastAPI), Go, C#?
- **Comunicación con el cliente de League:** ¿WebSocket, REST, gRPC?
- **Base de datos:** ¿SQLite, PostgreSQL, Firebase?
- **Autenticación:** ¿Cuentas propias, OAuth con Riot, o ambas?

### Arquitectura
- ¿Servidor propio en la red local (LAN) o servidor en la nube?
- Si es en LAN, ¿cómo se descubre el PC desde el teléfono?
- Si es en la nube, ¿cómo manejamos la seguridad de las credenciales de Riot?

### API de League
- ¿Usar LCU API (League Client Update API) o Riot API oficial?
- LCU API requiere el cliente abierto y autenticado — ¿cómo mantener la sesión?
- ¿Qué endpoints son necesarios exactamente?

### Experiencia de usuario
- ¿Pantalla con lista de runas predefinidas o editor completo?
- ¿Soporte para múltiples cuentas/perfiles?
- ¿Modo automático (aceptar siempre) vs. modo manual (notificar y esperar confirmación)?

## Roadmap
- [ ] Definir stack técnico
- [ ] Investigar la LCU API y sus capacidades
- [ ] Prototipo: servidor local que exponga endpoints
- [ ] Prototipo: cliente móvil básico
- [ ] Integración completa PC-teléfono
- [ ] Pruebas y despliegue

## Notas
*Decisión de stack técnico pendiente — se requiere investigación y discusión.*
