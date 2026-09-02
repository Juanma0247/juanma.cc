# Análisis de resultados — rediseño "Fractal" → "Fanctal"

Fecha: 2026-09-01. Este documento resume el trabajo hecho sobre `MYPAGE/app` para que puedas
llevarlo al espacio de trabajo "Fanctal" (el del artículo) y revisar ahí la consistencia entre
el aplicativo y el manuscrito.

## Qué se hizo

1. **Renombrado completo "Fractal" → "Fanctal"**: ruta (`/projects/fractal` → `/projects/fanctal`),
   archivo de página, clase y archivo JS, hoja de estilos, entrada en `projects.json`, claves i18n
   (`cardTitles`, namespace `pd.fractal.*` → `pd.fanctal.*`), e icono del mosaico. Añadido redirect
   301 `/projects/fractal → /projects/fanctal` en `astro.config.mjs` para no romper enlaces
   externos ya existentes (incluido el que ya cita el propio material suplementario del artículo).
2. **Rediseño visual**: la figura SVG pasó de ocupar 80–95vh (dominaba la pantalla) a un tamaño
   contenido (~26rem, ≈47% de la altura de un viewport de 900px en escritorio, verificado con
   Playwright). Layout más editorial: intro breve centrada, panel de parámetros con hints
   descriptivos por campo, tipografía y espaciados más discretos en el cálculo del área.
3. **Resumen del artículo en la página** ("Sobre el fanctal"): construcción, resultado principal
   (πR²/4, dos métodos), generalización f(r,n,a) con la fórmula cerrada, y dimensión de Hausdorff
   del atractor — usando únicamente los datos que diste en el encargo, con las fórmulas
   renderizadas en KaTeX.
4. **Script descargable en Python** (`public/scripts/fanctal.py`): reimplementa fielmente el
   algoritmo descrito en `material_suplementario_fanctales_r3.tex` (selección alternada de
   sectores, razón de escala k(n), corte por épsilon o profundidad explícita, sector-menos-disco
   vía regla de paridad de winding). Se muestra en la página con resaltado de sintaxis
   (highlight.js, ya usado en `/scripts`) detrás de un botón "Mostrar código", más botones de
   copiar y descargar. El bloque de código se carga con `fetch('/scripts/fanctal.py')`, así que la
   vista previa nunca se desincroniza del archivo real.
5. **Sección de créditos**: cita sugerida en formato APA (marcada "manuscrito en preparación"),
   nota de licencia (CC BY 4.0, pendiente de publicación) y enlace a "Conjuntos de Cantor" (el
   otro proyecto de fractales del portafolio).
6. Todo el contenido nuevo tiene soporte bilingüe (ES/EN) en `src/data/i18n/{es,en}.ts`, siguiendo
   la convención `pd.fanctal.*` del proyecto.

## Decisiones que tomé (y por qué)

- **No enlazar ningún PDF todavía** — confirmado contigo: se deja la cita + nota "manuscrito en
  preparación" y se actualiza cuando el artículo esté publicado, priorizando tener el sitio listo
  ya. La sección `.p11Paper` quedó preparada para agregar el enlace real más adelante (basta con
  convertir el `<p class="p11PaperStatus">` en un enlace o añadir un botón junto a él).
- **Solo Python, sin R ni MATLAB** — confirmado contigo, script único en `public/scripts/fanctal.py`.
- **No incluí afiliación institucional, ORCID ni correos de los autores** en la página pública.
  Los nombres de los tres autores sí están (los diste tú directamente en el encargo); afiliación/
  ORCID/correo los encontré en `pagina_titulo_r3.tex` como material de referencia, pero ese mismo
  documento marca varios puntos como pendientes de confirmación final entre los tres autores
  (persona de correspondencia, ORCID de Elizabeth Solórzano, financiación, conflictos, CRediT). Me
  pareció más prudente no publicar esos datos personales en un sitio público hasta que ese estado
  cambie. Si prefieres que sí aparezcan, dime y los agrego.
- **Quité el botón "Documentation"** que abría un Google Drive antiguo sin relación clara con el
  artículo real. Lo reemplacé por un botón "Sobre el fanctal" que hace scroll a la nueva sección
  de resumen — mantiene el panel con dos botones sin dejar un enlace huérfano.
- **Quité el `width="80vh"/"95vw"` que fijaba el SVG por JS** en `main()`: ya era irrelevante (el
  CSS con selector de ID ya lo sobreescribía) y el verdadero causante del tamaño excesivo era que
  `.p11FigureCard` no tenía `max-width` en el grid. Corregido ahí, no en el JS.
- **El script Python usa `print()`, no un `pt()` personalizado.** Sé que tu preferencia general es
  usar `pt(...)` en el código Python que te doy, pero este script en particular no es para tu
  consumo directo: se descarga desde una página pública pensada para lectoras y lectores de la
  revista, que no tienen por qué tener definida esa función. Usar `pt()` ahí rompería el script
  para cualquier persona externa que lo baje. Si tienes una razón para preferirlo igual, dímelo y
  lo cambio.
- **Renombré "Área total"/heading a "A(r, n, a)"** en vez de "A(N)" (quedaba inconsistente con la
  fórmula real mostrada debajo). Cambio menor de copy, no de lógica.
- Mantuve el prefijo de ids `p11*` sin cambios (numeración por posición en el sitio, no por
  nombre del proyecto — igual que en el resto de páginas).

## Archivos tocados

**Nuevos:**
- `src/pages/projects/fanctal.astro`
- `public/js/lib/Fanctal.js`
- `src/styles/sections/projects-fanctal.css`
- `src/icons/mosaic/fanctal.svg`
- `public/scripts/fanctal.py`

**Eliminados** (contenido movido a los nuevos de arriba):
- `src/pages/projects/fractal.astro`
- `public/js/lib/Fractal.js`
- `src/styles/sections/projects-fractal.css`
- `src/icons/mosaic/fractal.svg`

**Modificados:**
- `src/data/projects.json` (slug/title/navTitle/pageTitle)
- `src/data/i18n/es.ts`, `src/data/i18n/en.ts` (`cardTitles.fanctal`, namespace `pd.fanctal.*`
  completo)
- `astro.config.mjs` (redirect `/projects/fractal → /projects/fanctal`)

## Verificación hecha

- `npx astro build` completo sin errores, genera `/projects/fanctal/index.html` y el redirect en
  el manifest del servidor Node.
- `public/scripts/fanctal.py` probado en un entorno virtual aislado: `n=6,a=3` da exactamente
  `πR²/4` (0.785398), `a=0` da área 0, `a=n` da área πR² completa; salida visual (PNG) revisada y
  coincide con la construcción esperada (3 brazos para n=6,a=3; 4 aspas para n=8,a=4).
- Página probada con Playwright headless en `localhost:4321/projects/fanctal`:
  - Tarjeta de la figura al ~47% de la altura del viewport (antes 80–95vh).
  - KaTeX renderiza las fórmulas nuevas sin dejar LaTeX crudo visible.
  - Cambiar `n`/`a` recalcula el SVG y el panel de área en vivo; para `n=8,a=4` el resultado
    (`37682/135003 πr² ≈ 0.279 πr²`) coincide exactamente con el que calcula por separado
    `fanctal.py` — cruce de validación entre las dos implementaciones (JS y Python).
  - Botón "Mostrar código" trae el `.py` real vía `fetch` y lo resalta con highlight.js.
  - Cambio de idioma (`window.applyLang('es')`) traduce todo el contenido nuevo, incluida la cita
    con `<em>` para el título.
  - Sin errores de consola.
  - Layout responsive revisado también en 390×844 (móvil): todo se apila en una columna, sin
    desbordes.

## Dudas y pendientes para revisar en el espacio de trabajo "Fanctal"

1. **Enlace al artículo**: cuando el manuscrito esté publicado, hay que volver a
   `src/pages/projects/fanctal.astro` (sección `.p11Paper`) y a las claves `pd.fanctal.paperStatus`
   en `es.ts`/`en.ts` para agregar el enlace real (y quitar la nota de "en preparación").
2. El material suplementario del artículo (`material_suplementario_fanctales_r3.tex`) ya cita
   `juanma.cc/projects/fanctal` de antemano — con este cambio desplegado, ese enlace ya
   resuelve. Conviene confirmarlo en vivo antes de enviar el manuscrito (tal como el propio
   `README.md` de esa carpeta lo señala como pendiente).
3. Verificar que el resumen que puse en la página ("Sobre el fanctal") sea consistente palabra por
   palabra con la versión final del manuscrito una vez cierren la revisión — lo escribí solo con
   los datos que me diste en el encargo, sin mirar el cuerpo completo del manuscrito más allá del
   material suplementario del algoritmo.
4. Decidir si quieres exponer afiliación institucional / ORCID de las tres personas autoras en la
   página pública (ver la decisión que tomé arriba).
5. El commit de este cambio ya se hizo y se subió a `origin/main` (Firebase App Hosting desplegará
   automáticamente).
