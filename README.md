# Arketipoen festa · juego online (MKT Digital 02.3)

Juego tipo Kahoot: la clase juega desde el móvil y tu ordenador proyecta la pantalla.

## Publicar con GitHub Pages
1. Crea un repositorio público en GitHub y sube TODOS estos archivos a la raíz (index.html, host.html, style.css, data.js, content.js, music.js, host.js, player.js y los 4 archivos meme-*).
2. Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)` → Save.
3. Espera 1-2 minutos. Tu pantalla (proyector): `https://TU-USUARIO.github.io/TU-REPO/host.html`
4. Los compañeros entran escaneando el QR de la pantalla (o en `.../index.html` + código de 4 letras).

## Cómo se juega (7-9 min)
- 4 rondas (rebelde, mago, cuidador, bufón, en orden aleatorio). En cada una aparece un meme en pantalla (la pista visual) y salen 5 pistas de texto (16 s cada una, se cambia en `CLUE_SECS` de data.js; si todos responden antes, la ronda acaba antes): miedo → deseo → frase → tono de voz → comportamiento.
- Cada jugador elige 1 de los 12 arquetipos y bloquea. Cuanto antes acierte, más puntos (1000/800/600/400/200).
- Al final: podio y, con el botón "Teoria ▸", 4 diapositivas (bufoia, magoa, zaintzailea, errebeldea): teoría de la profesora + el meme usado + "Zergatik meme hau?" + % de aciertos de la clase. Navegación: botón, → / Espacio / Enter (siguiente) y ← (atrás). Los textos están en `SLIDES` de content.js.
- Espacio / Enter / → en el ordenador = siguiente paso.

## Probar sin compañeros
Abre `host.html?test` y pulsa "+5 bots" para ver todo el flujo. Probad también con 2-3 móviles antes del día.

## Importante
- Conexión peer-to-peer (PeerJS): sin servidor ni cuentas, pero necesita internet y que el wifi no bloquee WebRTC. Prueba en la red de la escuela; si falla, comparte datos del móvil.
- No cierres ni recargues la pestaña del host durante la partida.
- Textos de pistas: `content.js`. Todo el juego está en euskera: revisad los textos.

## Música y memes
- La música house se genera en el navegador (sin archivos). Suena al primer clic/tecla en la pantalla del host; botón 🔊 o tecla M para silenciar. Baja de volumen durante las pistas y sube en las revelaciones.
- El meme sale en pantalla durante toda la ronda y sigue ahí al revelar la respuesta: bufón = meme-jester.mp4, mago = meme-magician.mp4, cuidador = meme-caregiver.jpg, rebelde = meme-rebel.jpg. Para cambiarlos, sustituye el archivo con el mismo nombre.
