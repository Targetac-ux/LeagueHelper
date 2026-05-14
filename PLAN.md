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
- [ ] Integración con API de League of Legends (LCU API / Riot API)

## Stack técnico (propuesta preliminar)

### Concepto de arquitectura
1. **PC:** Ejecutable (.exe) que corre un servidor web local con interfaz
2. **Emparejamiento:** El .exe genera un código QR con la IP local + token
3. **Móvil:** El usuario escanea el QR con su teléfono, abriendo una página web
4. **Comunicación:** El teléfono se conecta al servidor local del PC vía WebSocket/REST

### Opciones de stack (por decidir)

| Capa | Opciones | 
|------|----------|
| Backend (servidor local) | Node.js, Python, Go, C# |
| Frontend (web móvil) | React, Vue, Svelte, HTML+JS vanilla |
| Cliente .exe | Electron, Tauri, PyInstaller, .NET |
| Base de datos | SQLite, JSON local, IndexedDB |
| Comunicación | WebSocket, REST, SSE |

## Investigación necesaria

### LCU API
- ¿Cómo autenticarse con el cliente de League?
- ¿Qué endpoints permiten aceptar partida, seleccionar campeón, runas, etc.?
- ¿Manejo de certificados autofirmados?
- ¿Cómo detectar eventos (llegó partida, turno de selección, etc.)?

### Riot API
- ¿Se puede obtener datos de campeones, runas, perfiles de invocador?
- Rate limits y autenticación
- ¿Endpoint para sugerencias de campeón?

### Sugerencias de campeón
- Fuente de datos: ¿Riot API, datos estáticos, ML, reglas?
- ¿Cómo obtener counter matchups y sinergias?
- ¿Base de datos externa (op.gg, u.gg, etc.) o cálculo propio?

## Preguntas abiertas

### Stack
- ¿Qué lenguaje/framework es más rápido de prototipar para el backend local?
- ¿Electron o Tauri para el .exe? (Tauri es más ligero, Electron más conocido)
- ¿Framework frontend o vanilla? (necesitamos buena UI en móvil)

### Seguridad
- ¿Cómo proteger el token del QR para que solo ese teléfono acceda?
- ¿El servidor local debe tener HTTPS? (la LCU API ya requiere HTTPS local)
- ¿Manejo seguro del puerto y firewall?

### Multi-cuenta
- No se refiere a múltiples clientes de League abiertos
- Se refiere a tener perfiles guardados (runas, páginas, picks favoritos) para distintas cuentas de Riot

## Roadmap
- [ ] Investigar LCU API a fondo
- [ ] Decidir stack técnico
- [ ] Prototipo: servidor local que expone endpoints de la LCU API
- [ ] Prototipo: frontend web básico
- [ ] Generación de QR y emparejamiento
- [ ] Editor de runas manual y sugerido
- [ ] Sugerencia de campeón
- [ ] Modos automático y manual
- [ ] Pruebas y despliegue

## Notas
*Sesión de planning inicial completada. Pendiente de definir stack y hacer investigación técnica.*
