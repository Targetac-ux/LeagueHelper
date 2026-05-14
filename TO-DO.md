# TO-DO: Pruebas manuales post-instalación

Checklist de pruebas manuales para verificar que LeagueHelper funciona correctamente después de la instalación.

Marca cada prueba como ✅ (pasa) o ❌ (falla) y anota observaciones.

---

## 1. Instalación y ejecución básica

- [ ] **1.1** Descargar y extraer `LeagueHelper-v1.0.0.zip` en una carpeta nueva
- [ ] **1.2** Ejecutar `LeagueHelper.exe` como administrador
- [ ] **1.3** La ventana de consola se abre sin errores
- [ ] **1.4** Se abre automáticamente el navegador con la página de QR
- [ ] **1.5** El QR se muestra correctamente (no aparece roto)
- [ ] **1.6** El contador regresivo de 5 minutos funciona
- [ ] **1.7** La URL alternativa se muestra debajo del QR

> Observaciones: ___________________________________________

---

## 2. Conexión con League Client

- [ ] **2.1** Abrir el cliente de League of Legends e iniciar sesión
- [ ] **2.2** Esperar 10-15 segundos — la consola debe mostrar "Bridge connected"
- [ ] **2.3** El navegador en el PC debe mostrar "Connected" (indicador verde)
- [ ] **2.4** Aparece el nombre del invocador correcto
- [ ] **2.5** La fase del juego se actualiza (In lobby, etc.)

> Observaciones: ___________________________________________

---

## 3. Emparejamiento por QR (teléfono)

- [ ] **3.1** Abrir la cámara del teléfono y escanear el QR
- [ ] **3.2** El teléfono abre la página de LeagueHelper correctamente
- [ ] **3.3** La página en el teléfono muestra "Connected" (indicador verde)
- [ ] **3.4** Se ve el nombre del invocador en el teléfono
- [ ] **3.5** Escanear el QR otra vez después de usado → debe fallar (token ya usado)
- [ ] **3.6** Escanear el QR después de 5 minutos → debe fallar (token expirado)

> Observaciones: ___________________________________________

---

## 4. Emparejamiento por URL manual

- [ ] **4.1** Copiar la URL alternativa de la página del QR
- [ ] **4.2** Escribirla manualmente en el navegador del teléfono
- [ ] **4.3** La página se conecta correctamente
- [ ] **4.4** Usar la misma URL dos veces → debe fallar (token ya usado)

> Observaciones: ___________________________________________

---

## 5. Ready Check — Aceptar partida

- [ ] **5.1** Entrar en cola desde el cliente de League
- [ ] **5.2** Cuando aparezca el Ready Check, el teléfono debe mostrar el botón ACCEPT
- [ ] **5.3** Tocar ACCEPT desde el teléfono → la partida se acepta
- [ ] **5.4** Si no se toca ACCEPT, la partida se rechaza (sin cambios en el cliente)
- [ ] **5.5** Volver a entrar en cola después de un rechazo → funciona correctamente

> Observaciones: ___________________________________________

---

## 6. Champ Select — Selección manual de campeón

- [ ] **6.1** Entrar en una partida (personalizada vs bots para prueba)
- [ ] **6.2** En Champ Select, la pestaña "Pick" está activa por defecto
- [ ] **6.3** Los campeones disponibles se muestran en la cuadrícula
- [ ] **6.4** La búsqueda de campeón funciona (escribe en el campo de búsqueda)
- [ ] **6.5** Tocar un campeón → se selecciona (cambio visual)
- [ ] **6.6** Los summoner spells se pueden cambiar tocando cada slot
- [ ] **6.7** Tocar Lock In después de seleccionar campeón → campeón lockeado en el cliente
- [ ] **6.8** Intentar lockear sin seleccionar campeón → error o prevención

> Observaciones: ___________________________________________

---

## 7. Champ Select — Edición de runas

- [ ] **7.1** En Champ Select, ir a la pestaña "Runes"
- [ ] **7.2** Seleccionar un estilo primario (ej. Precision)
- [ ] **7.3** Seleccionar runas para cada slot del estilo primario
- [ ] **7.4** Seleccionar un estilo secundario (ej. Domination)
- [ ] **7.5** Seleccionar runas para los 2 slots del estilo secundario
- [ ] **7.6** Configurar los 3 stat shards
- [ ] **7.7** Tocar "Apply Runes"
- [ ] **7.8** Verificar que la página de runas se creó y activó en el cliente de League
- [ ] **7.9** La runa seleccionada coincide con la que se ve en el cliente

> Observaciones: ___________________________________________

---

## 8. Champ Select — Sugerencias de campeón

- [ ] **8.1** En Champ Select, ir a la pestaña "Suggestions"
- [ ] **8.2** Se muestra una lista de campeones sugeridos ordenados por puntaje
- [ ] **8.3** Cada campeón muestra su barra de puntuación
- [ ] **8.4** Los badges son correctos (Counters, Synergizes, High mastery)
- [ ] **8.5** Tocar "Refresh" → las sugerencias se recalculan
- [ ] **8.6** La maestría del jugador se refleja en el puntaje
- [ ] **8.7** Los campeones no poseídos aparecen al final (o no aparecen si tienen -20)

> Observaciones: ___________________________________________

---

## 9. Perfiles

- [ ] **9.1** Tocar el botón "Profiles" en la pantalla principal
- [ ] **9.2** Tocar "+ New Profile" → crear un perfil con nombre "Test"
- [ ] **9.3** El perfil "Test" aparece en la lista
- [ ] **9.4** Activar el perfil "Test" → se marca como activo ✓
- [ ] **9.5** Editar el perfil "Test" → cambiarle el nombre a "Test2"
- [ ] **9.6** Configurar un campeón preferido en "Test2" desde el editor
- [ ] **9.7** Eliminar el perfil "Test2" → desaparece de la lista
- [ ] **9.8** Cerrar sesión/reiniciar la app → el perfil activo se mantiene

> Observaciones: ___________________________________________

---

## 10. Modo automático

- [ ] **10.1** Crear o seleccionar un perfil
- [ ] **10.2** Cambiar el toggle a modo "Auto"
- [ ] **10.3** Configurar un campeón preferido en el perfil
- [ ] **10.4** Entrar en cola
- [ ] **10.5** Al aparecer Ready Check, se acepta automáticamente (sin intervención)
- [ ] **10.6** En Champ Select, el campeón preferido se pickea automáticamente
- [ ] **10.7** El campeón se lockea automáticamente
- [ ] **10.8** Desactivar modo automático → vuelve a modo manual
- [ ] **10.9** Activar modo auto sin campeón preferido → el auto-pick no debería fallar (puede no pickear nada)

> Observaciones: ___________________________________________

---

## 11. Reconexión y estabilidad

- [ ] **11.1** Cerrar el cliente de League → la app muestra "disconnected"
- [ ] **11.2** Volver a abrir el cliente de League → la app reconecta automáticamente
- [ ] **11.3** Refrescar la página del teléfono → se mantiene la sesión (si no expiró)
- [ ] **11.4** Cerrar la ventana de consola y volver a abrir → nueva sesión
- [ ] **11.5** Dejar la app abierta 1 hora sin usar → verificar si el token de sesión expira

> Observaciones: ___________________________________________

---

## 12. Rendimiento

- [ ] **12.1** La app responde rápido (< 1 segundo) en todas las acciones
- [ ] **12.2** El servidor no consume más de 200 MB de RAM
- [ ] **12.3** El CPU se mantiene en 0-2% cuando está inactivo
- [ ] **12.4** La página en el teléfono se carga en menos de 3 segundos
- [ ] **12.5** Las imágenes de campeones cargan correctamente desde DDragon

> Observaciones: ___________________________________________

---

## 13. Firewall y antivirus

- [ ] **13.1** Windows Defender muestra advertencia al ejecutar el .exe
- [ ] **13.2** Agregar excepción en Windows Defender Firewall para el puerto 3000
- [ ] **13.3** Verificar que el teléfono puede conectar después de agregar la excepción
- [ ] **13.4** Desactivar temporalmente el antivirus → la app funciona igual
- [ ] **13.5** Escanear el .exe con Windows Defender → sin amenazas

> Observaciones: ___________________________________________

---

## 14. Edge cases

- [ ] **14.1** Iniciar .exe sin League abierto → mensaje "League Client not found"
- [ ] **14.2** Iniciar .exe sin carpeta `data/` → se crea automáticamente
- [ ] **14.3** Varias pestañas abiertas con la misma URL → comportamiento esperado
- [ ] **14.4** Teléfono en modo avión → no puede conectar (esperado)
- [ ] **14.5** El puerto 3000 está ocupado → error "Port already in use"
- [ ] **14.6** Dos usuarios conectados simultáneamente → el segundo puede o no ser aceptado (depende del diseño)

> Observaciones: ___________________________________________

---

## 15. Actualización

- [ ] **15.1** Descargar nueva versión de GitHub Releases
- [ ] **15.2** Extraer nuevo .exe en la misma carpeta (conservar `data/`)
- [ ] **15.3** Ejecutar nuevo .exe → los perfiles se cargan desde la DB existente
- [ ] **15.4** Funcionalidades principales siguen funcionando

> Observaciones: ___________________________________________

---

## Resumen

| Sección | Pruebas totales | Pasaron | Fallaron | Observaciones |
|---------|----------------|---------|----------|---------------|
| 1. Instalación | 7 | | | |
| 2. Conexión LCU | 5 | | | |
| 3. QR teléfono | 6 | | | |
| 4. URL manual | 4 | | | |
| 5. Ready Check | 5 | | | |
| 6. Champ Select (pick) | 8 | | | |
| 7. Champ Select (runas) | 9 | | | |
| 8. Champ Select (sugerencias) | 7 | | | |
| 9. Perfiles | 8 | | | |
| 10. Modo automático | 9 | | | |
| 11. Reconexión | 5 | | | |
| 12. Rendimiento | 5 | | | |
| 13. Firewall | 5 | | | |
| 14. Edge cases | 6 | | | |
| 15. Actualización | 4 | | | |
| **Total** | **93** | | | |

---

## Notas

- Ejecutar las pruebas en el orden indicado
- Anotar el sistema operativo (Windows 10/11, versión)
- Anotar la versión del .exe probada
- Si una prueba falla, documentar el error y el paso exacto para reproducirlo

```
Probado por: ____________________
Fecha: _________________________
Sistema: _______________________
Versión .exe: __________________
```
