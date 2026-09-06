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
- **Excepciones que se dejan sin traducir a propósito:** nombres propios y términos técnicos (React, Firebase, Turing Machine…), identificadores de código, y el prompt para IA de `TMPrompt.js` (se mantiene en inglés por convención).

## Layout de páginas de Proyectos/Tools/Games — margen lateral y `is:global`

`ProjectLayout.astro`, `ToolLayout.astro` y `GameLayout.astro` envuelven el `<slot />` de cada página en un `<div class="page-shell">` (regla definida una sola vez en `MainLayout.astro`: `max-width: 64rem; margin: 0 auto; padding: 0 1.5rem;`). Esto le da margen lateral automático a **toda** página de proyecto/tool/game — `.contenedor` en sí no tiene padding horizontal.

- **No** añadir `max-width`/`padding` lateral propios en una página nueva; ya lo resuelve el layout compartido.
- Si una página necesita ir a **ancho completo** (p. ej. un lienzo con `position: fixed`/`100vw` como Cross Matrix, o una herramienta muy densa como Turing Machine), usar el modificador `page-shell--wide` (`max-width: none`) en vez de pelear contra el wrapper. Turing Machine ya está exceptuada en `ProjectLayout.astro` (`slug === 'turing-machine'`); seguir el mismo patrón por slug para casos nuevos.
- Los imports de CSS por página (`@import '.../projects-X.css'`, `tools.css`, `games.css`) van en un `<style is:global>` — **nunca** en un `<style>` sin `is:global`. Cada proyecto/juego que crea elementos dinámicamente vía JS (`innerHTML`, `createElement`, `ExtText.createElement`, etc.) los inserta sin el atributo `data-astro-cid-*` que Astro exige para que un `<style>` con scope los alcance; una hoja no-global simplemente no le pega estilo a nada de eso (bug ya encontrado y corregido en sigma-star-enum, regular-expressions, sets, cross-matrix y voice). El CSS compartido (`projects.css`, `tools.css`, `games.css`) ya se importa una sola vez, como global, desde cada layout — las páginas individuales no necesitan volver a importarlo.
- Si un applet/canvas dentro de una página (GeoGebra, SVG, etc.) calcula su tamaño en JS, que lea el `clientWidth` del contenedor (que a su vez tiene su tamaño fijado por CSS, p. ej. `.ggbContainer { width: min(32rem, 100%); aspect-ratio: 1/1; }`) — **nunca** `window.innerWidth`/`innerHeight` en crudo, porque eso ignora el `page-shell` y hace que el widget se salga del contenedor.

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
