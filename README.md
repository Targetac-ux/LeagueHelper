# LeagueHelper

Controla la selección de campeones de League of Legends desde tu teléfono.

Escanea un código QR que genera la app en tu PC y maneja el champ select, runas y sugerencias de campeón desde el navegador de tu móvil.

---

## Requisitos del sistema

- **Windows** 10/11 (64-bit)
- **League of Legends** instalado y actualizado
- **Red WiFi** local (PC y teléfono en la misma red)
- No requiere Node.js ni ninguna otra dependencia

## Descarga

Ve a la [página de releases](https://github.com/Targetac-ux/LeagueHelper/releases) y descarga `LeagueHelper-v1.0.0.zip`.

Extrae el contenido en cualquier carpeta (ej. `C:\LeagueHelper`).

## Instalación y uso

### 1. Ejecuta el programa

Haz doble clic en `LeagueHelper.exe`. Se abrirá una ventana de consola y automáticamente se abrirá tu navegador predeterminado mostrando un código QR.

**Firewall**: Windows puede mostrar una advertencia de seguridad. Haz clic en "Permitir acceso" — la app necesita aceptar conexiones entrantes para que tu teléfono pueda conectarse.

### 2. Escanea el QR

- Abre la cámara de tu teléfono o cualquier app lectora de QR
- Escanea el código QR que aparece en el navegador
- Se abrirá la página de LeagueHelper en tu teléfono

### 3. Conéctate

La página mostrará los datos de tu invocador y el estado de la conexión con el cliente de League.

### 4. Modos de uso

**Manual** (predeterminado):
- Cuando aparezca un *Ready Check*, verás un botón "Accept" en tu teléfono
- Durante *Champ Select*, puedes elegir campeón, editar runas, y ver sugerencias
- Tú controlas cuándo aceptar y lockear

**Automático** (recomendado para farming):
- Actívalo desde el panel de perfiles (toggle mode)
- La app acepta partidas automáticamente
- Selecciona y lockea tu campeón preferido configurado en el perfil
- Perfecto para cuando quieres AFK en cola

### 5. Perfiles

Crea perfiles para diferentes cuentas o roles:
- Cada perfil guarda el modo (manual/auto) y el campeón preferido
- Activa el perfil que quieras usar desde el panel de ajustes

---

## Solución de problemas

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| "Cannot connect" / QR no carga | Firewall bloqueando | Agrega `LeagueHelper.exe` como excepción en Windows Defender Firewall |
| "League Client not found" | League no está abierto | Abre el cliente de League y espera unos segundos |
| Teléfono no puede abrir la página | No están en la misma WiFi | Verifica que ambos estén conectados a la misma red |
| QR expira rápido | 5 minutos por diseño | Cierra y abre la app otra vez para generar un nuevo QR |
| .exe no se ejecuta | Antivirus bloquea | Agrega la carpeta a exclusiones de Windows Security |
| "Port already in use" | Otro proceso en puerto 3000 | Cierra el otro programa o cambia el puerto (solo si compilas desde código) |
| Error de SQLite al abrir DB | La carpeta `data/` no existe | Crea manualmente la carpeta `data/` junto al .exe (se crea automáticamente al iniciar) |

---

## Puertos usados

- **3000** — Servidor web (Express + WebSocket)
- El cliente de League usa puertos dinámicos (detectados automáticamente)

Si necesitas cambiar el puerto, puedes hacerlo editando `src/server/index.ts` (requiere compilar desde código).

---

## Compilar desde código

1. Clona el repo: `git clone https://github.com/Targetac-ux/LeagueHelper.git`
2. Instala dependencias: `npm install`
3. Compila: `npm run bundle`
4. El .exe estará en `dist/LeagueHelper.exe`

**Nota**: Para compilar necesitas Node.js v22 y npm.

---

## Seguridad

- No se envían datos a internet — todo corre en tu red local
- Los tokens de sesión son UUID v4, caducan en 5 minutos, y son de un solo uso
- No se almacenan contraseñas ni credenciales
- El servidor solo acepta conexiones autenticadas (via session token)

---

## Licencia

MIT
