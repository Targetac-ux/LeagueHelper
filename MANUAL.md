# Manual de usuario — LeagueHelper

Guía paso a paso para usar LeagueHelper desde la descarga hasta el champ select.

---

## Índice

1. [Primeros pasos](#1-primeros-pasos)
2. [Pantalla principal](#2-pantalla-principal)
3. [Emparejamiento por QR](#3-emparejamiento-por-qr)
4. [Aceptar partida](#4-aceptar-partida)
5. [Seleccionar campeón](#5-seleccionar-campeón)
6. [Editar runas](#6-editar-runas)
7. [Sugerencias de campeón](#7-sugerencias-de-campeón)
8. [Perfiles](#8-perfiles)
9. [Modo automático](#9-modo-automático)
10. [Preguntas frecuentes](#10-preguntas-frecuentes)

---

## 1. Primeros pasos

### Descargar e instalar

1. Ve a [https://github.com/Targetac-ux/LeagueHelper/releases](https://github.com/Targetac-ux/LeagueHelper/releases)
2. Descarga el archivo `LeagueHelper-v1.0.0.zip`
3. Extrae el contenido en una carpeta, por ejemplo `C:\LeagueHelper`
4. Haz doble clic en `LeagueHelper.exe`

### Inicio

Al ejecutar el .exe:

1. Se abre una **ventana de consola** (CMD) — no la cierres, es el servidor
2. Se abre automáticamente tu **navegador predeterminado**
3. Verás una pantalla con un **código QR** y un temporizador de 5 minutos

```
┌──────────────────────────────────┐
│   LeagueHelper                   │
│                                  │
│   ┌──────────────────────────┐   │
│   │      ██ ██████ ██        │   │
│   │      ██ ██  ██ ██        │   │
│   │      ██████  ██████      │   │
│   │      ██  ██ ██  ██      │   │
│   │      ██████ ██████      │   │
│   └──────────────────────────┘   │
│                                  │
│   Escanea con tu teléfono        │
│   Expira en: 4:32                │
│                                  │
│   O abre esta URL:               │
│   http://192.168.1.10:3000?      │
│   token=abc123...                │
└──────────────────────────────────┘
```

> **Importante**: Asegúrate de que el firewall de Windows no bloquee el programa. Si aparece una advertencia, haz clic en "Permitir acceso".

---

## 2. Pantalla principal

Una vez que tu teléfono se conecta (vía QR o URL manual), verás la pantalla principal:

```
┌──────────────────────────────────┐
│  Invocador: TuNombre             │ ● Conectado
│                                  │
│  Fase: In lobby                  │
│                                  │
│  ┌──── Modo: Manual ────┐ [Perf]│
│  │ ○ Manual  ● Auto     │       │
│  └──────────────────────┘       │
│                                  │
│  Waiting for game events...      │
└──────────────────────────────────┘
```

### Elementos

- **Nombre del invocador** — arriba a la izquierda
- **Indicador de conexión** — arriba a la derecha (verde = conectado, rojo = desconectado)
- **Fase actual** — "In lobby", "Matchmaking", "Ready Check", "Champ Select", etc.
- **Toggle modo** — cambia entre manual y automático
- **Botón Perfiles** — abre el panel de gestión de perfiles

---

## 3. Emparejamiento por QR

### Escanear QR

1. En el PC, el navegador muestra un código QR
2. Abre la **cámara** de tu teléfono (iOS/Android la reconocen automáticamente)
3. Apunta al QR — aparecerá una notificación para abrir un enlace
4. Toca la notificación para abrir la página de LeagueHelper

### Alternativa: URL manual

Si el QR no funciona:
1. En la pantalla del QR hay una URL debajo (ej. `http://192.168.1.10:3000?token=...`)
2. Escríbela manualmente en el navegador de tu teléfono

### Token expirado

El QR dura 5 minutos. Si expira:
- En el PC, haz clic en "Regenerate QR" o cierra y vuelve a abrir la app
- En el teléfono, escanea el nuevo QR

---

## 4. Aceptar partida

Cuando entras en cola y aparece un *Ready Check*, la app lo detecta automáticamente.

### Modo manual

```
┌──────────────────────────────────┐
│  Fase: Ready Check               │
│                                  │
│  ┌──────────────────────────┐    │
│  │       ╔══════════╗       │    │
│  │       ║  ACCEPT  ║       │    │
│  │       ╚══════════╝       │    │
│  └──────────────────────────┘    │
│                                  │
│  Toca el botón para aceptar      │
└──────────────────────────────────┘
```

Toca **ACCEPT** en tu teléfono para aceptar la partida.

### Modo automático

En modo automático, la app acepta automáticamente. Verás:

```
┌──────────────────────────────────┐
│  Fase: Ready Check               │
│                                  │
│  ✓ Auto-accepting match...       │
└──────────────────────────────────┘
```

---

## 5. Seleccionar campeón

Durante *Champ Select*, verás tres pestañas: **Pick**, **Runes** y **Suggestions**.

### Pick

```
┌──────────────────────────────────┐
│  [Pick]  [Runes]  [Suggestions]  │
│                                  │
│  Selected: Ashe                  │
│  ┌──────────────────────────┐    │
│  │ [Spell 1]  [Spell 2]     │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──── Champions ────────────┐   │
│  │ Aatrox  Ahri  Akali  Aksha│   │
│  │ Alistar Amumu  Anivia Annie│  │
│  │ Aphelios Ashe  Aurelion... │   │
│  │ ...                        │   │
│  └────────────────────────────┘   │
│                                  │
│  [  Lock In  ]                   │
└──────────────────────────────────┘
```

1. Busca el campeón en la cuadrícula (orden alfabético)
2. Toca el campeón para seleccionarlo
3. Selecciona los **summoner spells** si es necesario
4. Toca **Lock In** para confirmar la selección

### Spells

Toca cada slot de hechizo para cambiar entre las opciones disponibles (Flash, Ignite, TP, etc.).

---

## 6. Editar runas

En la pestaña **Runes** puedes crear y aplicar una página de runas personalizada.

```
┌──────────────────────────────────┐
│  [Pick]  [Runes]  [Suggestions]  │
│                                  │
│  Primary: Precision              │
│  ┌──────────────────────────┐    │
│  │ Slot 1: Press the Attack │    │
│  │ Slot 2: Triumph          │    │
│  │ Slot 3: Legend: Alacrity │    │
│  │ Slot 4: Coup de Grace    │    │
│  └──────────────────────────┘    │
│                                  │
│  Secondary: Domination           │
│  ┌──────────────────────────┐    │
│  │ Slot 1: Taste of Blood   │    │
│  │ Slot 2: Ultimate Hunter  │    │
│  └──────────────────────────┘    │
│                                  │
│  Stat Shards                     │
│  ┌──────────────────────────┐    │
│  │ [+ATK] [+ARM] [+HP]     │    │
│  └──────────────────────────┘    │
│                                  │
│  [  Apply Runes  ]              │
└──────────────────────────────────┘
```

1. Selecciona el **estilo primario** tocando el nombre
2. Elige las runas para cada slot
3. Selecciona el **estilo secundario**
4. Elige 2 runas secundarias
5. Configura los **stat shards** (ataque, armadura, vida, etc.)
6. Toca **Apply Runes** para crear y activar la página en el cliente de League

---

## 7. Sugerencias de campeón

En la pestaña **Suggestions**, la app analiza la composición actual y sugiere los mejores campeones.

```
┌──────────────────────────────────┐
│  [Pick]  [Runes]  [Suggestions]  │
│                                  │
│  Suggestions based on:           │
│  Enemy: Yasuo, Lee Sin, Jinx    │
│  Allies: Thresh                  │
│                                  │
│  1. Rammus ⭐ 95                 │
│     ┃███████████████████░        │
│     [Counters Yasuo] [High mast] │
│                                  │
│  2. Malphite ⭐ 82               │
│     ┃████████████████░░░░        │
│     [Counters Yasuo] [Syn:Thresh]│
│                                  │
│  3. Amumu ⭐ 78                  │
│     ┃██████████████░░░░░░        │
│     [Counters Lee Sin] [High mast]│
│                                  │
│  [ Refresh ]                     │
└──────────────────────────────────┘
```

### Sistema de puntuación

- **Maestría**: +20 por nivel, +1 por cada 10k puntos (máx 100)
- **Counter**: +15 por campeón enemigo al que contrarresta
- **Sinergia**: +10 por campeón aliado con el que sinergiza
- **Propiedad**: +5 si tienes el campeón, -20 si no lo tienes

### Badges

- 🔴 **Counters X** — El campeón es bueno contra el rival X
- 🟢 **Synergizes with X** — El campeón combina bien con el aliado X
- 🔵 **High mastery** — Tienes maestría alta con este campeón

Toca **Refresh** para recalcular las sugerencias si cambia la composición.

---

## 8. Perfiles

Los perfiles guardan tu configuración entre partidas.

### Crear perfil

1. Toca el botón **Profiles** en la pantalla principal
2. Se abre el panel de perfiles:

```
┌──────────────────────────────────┐
│  Profiles              [Close]   │
│                                  │
│  Active: MiCuenta                │
│                                  │
│  ┌─ Main ─────────────────────┐  │
│  │ Mode: Manual               │  │
│  │ Preferred: Ashe            │  │
│  │ Active ✓                   │  │
│  │ [Switch] [Edit] [Delete]   │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌─ Alt ──────────────────────┐  │
│  │ Mode: Auto                 │  │
│  │ Preferred: Annie           │  │
│  │ [Activate] [Edit] [Delete] │  │
│  └────────────────────────────┘  │
│                                  │
│  [+ New Profile]                 │
└──────────────────────────────────┘
```

3. Toca **+ New Profile** para crear uno nuevo
4. Escribe un nombre (ej. "Main", "Support Account")
5. El perfil se crea con modo manual por defecto

### Configurar campeón preferido

1. En el perfil, toca **Edit**
2. Se abre el selector de campeones con búsqueda
3. Busca y selecciona tu campeón preferido
4. Guarda los cambios

### Activar perfil

Toca **Activate** en el perfil que quieras usar. El perfil activo tiene un checkmark (✓).

---

## 9. Modo automático

El modo automático permite que la app maneje todo el proceso de cola sin intervención.

### Cómo activarlo

1. Toca **Profiles** → selecciona o crea un perfil
2. En el toggle "Manual / Auto", deslízalo a **Auto**
3. Configura un **campeón preferido** en el perfil (necesario para auto-pick)

### Qué hace

Cuando el modo automático está activo:

1. **Ready Check** → La app acepta automáticamente en cuanto aparece
2. **Champ Select** → La app selecciona y lockea tu campeón preferido inmediatamente

### Precauciones

- Asegúrate de tener configurado un **campeón preferido** antes de activar auto-pick
- No entres en cola si no quieres jugar — la app aceptará automáticamente
- Puedes desactivar el modo automático en cualquier momento desde el toggle

---

## 10. Preguntas frecuentes

### ¿Es seguro? ¿Me pueden banear?

LeagueHelper usa la misma API que usa el cliente de League of Legends (LCU API). No inyecta código, no modifica memoria, no automatiza inputs del mouse/teclado. Usa los mismos endpoints que el cliente oficial. Sin embargo, úsalo bajo tu propia responsabilidad.

### ¿Funciona en Mac o Linux?

No. Solo Windows 10/11. El cliente de League of Legends para macOS no expone la LCU API de la misma forma.

### ¿Necesito tener League abierto todo el tiempo?

Sí. La app necesita que el cliente de League esté abierto para conectarse.

### ¿Puedo usar datos móviles en vez de WiFi?

No. El teléfono y el PC deben estar en la misma red local.

### ¿Se puede usar en tablet?

Sí. Cualquier dispositivo con navegador y cámara funciona.

### ¿Qué hago si la app deja de responder?

Cierra la ventana de consola y vuelve a ejecutar `LeagueHelper.exe`.

### ¿Se guarda mi configuración?

Sí. Los perfiles y ajustes se guardan en `data/leaguehelper.db` (junto al .exe).

### ¿Cómo actualizar?

Descarga la nueva versión desde GitHub Releases, extrae y ejecuta el nuevo .exe. Los perfiles se mantienen si conservas la carpeta `data/`.
