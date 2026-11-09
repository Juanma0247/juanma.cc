# Proyecto — MYPAGE (juanma.cc)

Sitio personal / portafolio de Juan Manuel Díaz. Astro (`output: 'hybrid'`) con adaptador Node standalone.

## Despliegue

- **Firebase App Hosting** ya está conectado y escucha los `push` al repositorio: cada push a la rama principal se despliega automáticamente a `juanma.cc`. No hay que ejecutar comandos de deploy manuales.

## Páginas y destinos (landing / restringir a una página)

- La lista de páginas que alimenta los selectores **"Página de inicio predeterminada"** y **"Restringir a una página"** (modo kiosco) vive en `src/data/destinations.ts`.
- Los **proyectos interactivos** (`src/data/projects.json`) y los **proyectos de desarrollo** (`src/data/built.ts`) se derivan automáticamente; al añadir uno nuevo ahí, aparece solo en los selectores.
- Al crear una **nueva sección de nivel superior** (una página nueva en `src/pages/…`) o un nuevo **juego/herramienta**, hay que añadir su ruta a `destinations.ts` (arrays `SECTIONS`, `GAMES` o `TOOLS`) para que quede disponible como destino.

## Internacionalización (i18n) — soporte obligatorio de traducción

El sitio es **bilingüe (español e inglés)**. El idioma se resuelve con prioridad **web > usuario > sistema** y se aplica en el cliente.

**Cada vez que se añada o modifique un texto visible para el usuario, hay que darle soporte de traducción en ambos idiomas.** No dejar cadenas "quemadas" en un solo idioma.

Cómo funciona:

- **Diccionarios:** `src/data/i18n/en.ts` (define la interfaz `I18n`) y `src/data/i18n/es.ts`. Toda clave nueva debe existir en **los dos** archivos. El contenido dinámico de los proyectos/juegos/herramientas vive bajo el espacio `pd` (project dynamic).
- **HTML estático (`.astro`):** marcar el elemento con `data-i18n="ruta.a.la.clave"` (o `data-i18n-placeholder`, `data-i18n-title`, `data-i18n-aria-label`). El texto por defecto en el HTML debe ser el **inglés** (idioma base del render). `applyLang` en `src/layouts/MainLayout.astro` lo intercambia; si el valor contiene `<`, usa `innerHTML`.
- **Contenido generado por JS** (`public/js/lib/*.js`): usar el puente global `window.i18nGet('clave', 'fallback en inglés')`. Definir un helper local `const t = (k, f) => window.i18nGet ? window.i18nGet('pd.<proyecto>.' + k, f) : f`. Para re-traducir al vuelo, escuchar `window.addEventListener('langchanged', …)` y volver a renderizar la parte afectada.
- **Tarjetas del mosaico y navbar:** los títulos usan `cardTitles.<slug>` y las etiquetas/tags usan `tags.<clave>` (la clave se genera con `tagKey()` de `src/data/i18n/keys.ts`). Al añadir un proyecto/juego/herramienta nuevo, agregar su título en `cardTitles` y sus tags en `tags` (en ambos idiomas).
- **LaTeX:** no traducir la notación matemática. Para prosa/etiquetas que contienen `\(…\)`, `applyLang` dispara un re-render global de KaTeX en `langchanged`, así que sí se pueden traducir (guardar el LaTeX completo en el diccionario, con `\\` escapado en el `.ts`).
- **Diccionarios por página (`i18nExtra`):** `en.ts`/`es.ts` se inyectan en todas las páginas, así que el contenido bilingüe muy extenso de un solo proyecto no va ahí. `MainLayout` acepta la prop `i18nExtra={{ ns, en, es }}` y lo fusiona bajo `pd.<ns>` solo en esa página; `data-i18n` e `i18nGet` funcionan igual. Lo usa Física Mecánica (`src/data/i18n/mechanics/*.ts`, cada archivo exporta `{ en, es }` con `es: typeof en`, y `MechanicsLayout` envía `common` + el tema actual).
- **Excepciones que se dejan sin traducir a propósito:** nombres propios y términos técnicos (React, Firebase, Turing Machine…), identificadores de código, y el prompt para IA de `TMPrompt.js` (se mantiene en inglés por convención).

## Layout de páginas de Proyectos/Tools/Games — margen lateral y `is:global`

`ProjectLayout.astro`, `ToolLayout.astro` y `GameLayout.astro` envuelven el `<slot />` de cada página en un `<div class="page-shell">` (regla definida una sola vez en `MainLayout.astro`: `max-width: 64rem; margin: 0 auto; padding: 0 1.5rem;`). Esto le da margen lateral automático a **toda** página de proyecto/tool/game — `.contenedor` en sí no tiene padding horizontal.

- **No** añadir `max-width`/`padding` lateral propios en una página nueva; ya lo resuelve el layout compartido.
- Si una página necesita ir a **ancho completo** (p. ej. un lienzo con `position: fixed`/`100vw` como Cross Matrix, o una herramienta muy densa como Turing Machine), usar el modificador `page-shell--wide` (`max-width: none`) en vez de pelear contra el wrapper. Turing Machine ya está exceptuada en `ProjectLayout.astro` (`slug === 'turing-machine'`); seguir el mismo patrón por slug para casos nuevos.
- Los imports de CSS por página (`@import '.../projects-X.css'`, `tools.css`, `games.css`) van en un `<style is:global>` — **nunca** en un `<style>` sin `is:global`. Cada proyecto/juego que crea elementos dinámicamente vía JS (`innerHTML`, `createElement`, `ExtText.createElement`, etc.) los inserta sin el atributo `data-astro-cid-*` que Astro exige para que un `<style>` con scope los alcance; una hoja no-global simplemente no le pega estilo a nada de eso (bug ya encontrado y corregido en sigma-star-enum, regular-expressions, sets, cross-matrix y voice). El CSS compartido (`projects.css`, `tools.css`, `games.css`) ya se importa una sola vez, como global, desde cada layout — las páginas individuales no necesitan volver a importarlo.
- Si un applet/canvas dentro de una página (GeoGebra, SVG, etc.) calcula su tamaño en JS, que lea el `clientWidth` del contenedor (que a su vez tiene su tamaño fijado por CSS, p. ej. `.ggbContainer { width: min(32rem, 100%); aspect-ratio: 1/1; }`) — **nunca** `window.innerWidth`/`innerHeight` en crudo, porque eso ignora el `page-shell` y hace que el widget se salga del contenedor.

## Física Mecánica (`/projects/fisica-mecanica`)

- Hub + una página por tema (`src/pages/projects/fisica-mecanica/*.astro`); la lista de temas vive en `src/data/mechanics.ts` (alimenta navegación, hub y `destinations.ts`).
- Cada tema usa `TopicPage.astro` (secciones estándar) y un módulo `public/js/lib/mechanics/topics/<key>.js`. El motor común está en `public/js/lib/mechanics/`: `algebra.js` (ecuaciones en mini-lenguaje `eq('id', 'v = v0 + a*t')`, elige la ecuación, despeja, cuadráticas con ramas, sistemas lineales), `steps.js` (solución paso a paso), `topicPage.js` (controlador), `dynamics.js` + `dynScenes.js` + `fbd.js` (Newton/fricción con D.C.L.).
- Para añadir un problema basta agregar el preset en el módulo del tema y su `title/text/source` en el diccionario del tema (ambos idiomas).

## WiFi UNAL (`/tools/autowifiunal`)

- Página de la app Android WiFi UNAL (el código de la app vive en `D:\Sistema\Carpetas\Programacion\Movil\WIFI UNAL`). Reemplazó el 7 nov 2026 a la guía anterior de Termux + script Python (se borraron sus traducciones, componentes, `AutoWifiUnal.js` y las descargas de `public/scripts/autowifiunal/`).
- Páginas: `src/pages/tools/autowifiunal/index.astro` y las subpáginas legales `terms`, `privacy` y `legal` (las tres usan `components/autowifiunal/LegalDoc.astro`). **La app enlaza directamente a esas tres URL**: no cambiarlas sin actualizar `Ui.kt` de la app.
- Textos en `src/data/i18n/autowifiunal.ts` (`{ en, es }`, enviados con `i18nExtra` bajo `pd.autowifiunal`; `components/autowifiunal/T.astro` los pinta). Ícono en `public/img/autowifiunal/icon.svg` (generado desde la vista previa del ícono de la app). Estilos en `src/styles/sections/tools-autowifiunal.css` (prefijo `awu`).
- `ToolLayout.astro` acepta ahora `title`, `description`, `titleHref` e `i18nExtra` opcionales.
- Los documentos legales nombran como responsable a Juan Manuel Díaz Gómez (juanma@juanma.cc) y citan la Ley 1581 de 2012. Si la app cambia lo que hace con los datos o sus permisos, actualizar también estas páginas y su fecha.

## Space y Notas (`/space`, `src/lib/notes/`)

- `/space` (`src/pages/space/index.astro`) es la app de **Notas**; los ajustes que antes estaban en `/space` (Page Settings, variables web en vivo, modo kiosco) se movieron a **`/space/settings`** (`src/pages/space/settings.astro`), enlazados desde Notas ("Ajustes web").
- El módulo `src/lib/notes/` es **compartido con la app Android** (`../app`, que lo importa con el alias `@notes`). No usar nada exclusivo de Astro dentro de él: los cambios aquí afectan a ambas plataformas.
  - `config.js`: correos autorizados, config de Firebase (incluye `databaseURL`) y rutas de datos.
  - `sync.js` (`NoteSync`): cada nota es un documento **Yjs** (CRDT) con caché local en IndexedDB (`y-indexeddb`) y RTDB como transporte: `notes/ydoc/<id>/log/<pushId>` (actualizaciones incrementales en base64, agrupadas cada ~24 ms) + `notes/ydoc/<id>/snap` (compactación cuando el log pasa de 250 entradas, con una transacción que no pisa un snapshot más nuevo). Al conectar, `reconcile()` sube lo que el dispositivo tenga y el servidor no (ediciones offline de sesiones anteriores).
  - `store.js`: árbol de carpetas y notas en `notes/tree/<id>` (`kind`, `parent` = id de la carpeta o `root`, `title`, `excerpt`, `words`, `updated`, `pinned`) y espejo en texto plano en `notes/text/<id>` (búsqueda, enlaces «Mencionada en» y reutilización desde otras apps). Uso compartido entre dispositivos en `notes/usage/<id>` (`n` visitas, `last`, y `s`/`at` para la frecuencia con decaimiento: cada visita suma 1 y el total se reduce a la mitad cada 4 días) y uso de la barra en `notes/prefs/toolbar/<botón>` (vida media de 21 días). Todo se cachea en localStorage y los listeners esperan a que se confirme el inicio de sesión (`gate`).
  - `editor.js`: CodeMirror 6 con vista previa en vivo estilo Obsidian (oculta la sintaxis fuera de la línea activa; KaTeX para `$…$` y `$$…$$`; las tareas se ven como texto `- [ ]` en Código y como casillas clicables solo en Lectura; imágenes; enlaces `[[Nota]]` con autocompletado). Dos modos: **Código** (el editor con vista previa) y **Lectura** (`render.js`, markdown-it); se alternan con un toque de dos dedos o `Ctrl + .`.
  - `upload.js`: al pegar, soltar o elegir una imagen se inserta `![…](uploading://<tag>)` (marcador gris animado en todos los dispositivos), se redimensiona a 2400 px como máximo, se convierte a WebP, se sube a Storage `notes/<noteId>/…` y se reemplaza por la URL con `#w=…&h=…` para reservar el espacio exacto mientras carga.
  - `ui.js` (`mountNotes`): en celular, pantalla principal con tarjetas (Continuar, Frecuentes, Fijadas, Carpetas, Notas) y navegación por carpetas; en escritorio, árbol lateral con arrastrar y soltar y las mismas tarjetas cuando no hay nota abierta. Menú contextual (también con pulsación larga), búsqueda en el contenido, «Mencionada en», ayuda, cámara (`<input capture>`), visor de imágenes a pantalla completa (tocar una imagen en Código o Lectura; pellizcar, doble toque o rueda para zoom, arrastrar para moverse, deslizar hacia abajo o atrás para cerrar), barra ordenada por uso y estado de conexión en el **color del título** (cian del color primario en línea, blanco conectando, ámbar guardando, gris sin conexión, rojo error). Opción `onHome` para el botón de aplicaciones de la app.
  - **Arranque instantáneo:** con la sesión en caché (`jm-notes-user`) la interfaz se pinta sin esperar a Firebase Auth y reabre la última nota, su modo y su posición (`jm-notes-view`, `jm-notes-last`, `jm-notes-mode`, `jm-notes-scroll`). Al pasar a segundo plano se guarda una instantánea del HTML (`jm-notes-peek`) que la app pinta antes de cargar el código. Si la autenticación falla, se borran la sesión en caché y la instantánea.
  - `links.js` (renombrado con enlaces): al confirmar un título nuevo (salir del campo, Enter o «Renombrar»), `renameLinks` reescribe `[[Título viejo]]` → `[[Título nuevo]]` (sin distinguir mayúsculas) en todas las notas que lo enlazan, abriendo el Y.Doc de cada una con un `NoteSync` temporal para que el cambio se sincronice como una edición normal. No se hace en cada tecla, para no saltar por títulos intermedios. Avisa si el nuevo título ya lo usa otra nota.
  - `icons.js`: set único de íconos de trazo (24 px, 1,8 px, puntas redondeadas). Todo ícono nuevo de Notas va ahí con el mismo estilo.
  - Textos en `i18n.js` (`{ en, es }`, enviados con `i18nExtra` bajo `pd.notes`; la app los usa directamente).
  - `notes.css`: estilos con prefijo `nt-`, heredan los tokens de color del sitio.
- El auto-render global de KaTeX de `MainLayout` ignora la clase `no-katex` (la raíz de Notas la lleva) para no reescribir el DOM del editor.
- **Reglas**: `database.rules.json` (RTDB, nodo `notes` solo para los dos correos con email verificado) y `storage.rules` (`notes/**`, solo imágenes de menos de 15 MB, mismos correos). Se despliegan con `firebase deploy --only database,storage` (no van por App Hosting).
- **Prueba de sincronización**: `npm run test:notes` (emulador de RTDB; requiere el JDK 21 de `C:\Users\Juan Manuel\.jdks\jdk-21.0.13+9` en `JAVA_HOME` y `PATH`). Simula varios dispositivos: concurrencia, offline, app cerrada sin red, compactación y latencia.

## Política de commit y push

Hacer `git commit` y `git push` (a la rama principal) en estos momentos:

- Cada vez que se completa un **cambio importante**.
- Cada vez que se **finaliza un conjunto de cambios** sobre una misma temática, función o feature (aunque sean varios archivos).

Reglas:

- **No** hacer commit por cada micro-edición intermedia; agrupar los cambios relacionados en un solo commit coherente.
- El mensaje de commit debe **describir claramente el cambio** realizado (qué y por qué), en español.
- Como cada push dispara un despliegue automático a producción, antes de hacer push verificar que el proyecto **compila** (`npx astro build`) y que el cambio quedó funcionando.
- Terminar los mensajes de commit con:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```
