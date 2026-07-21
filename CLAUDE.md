# Proyecto — MYPAGE (juanma.cc)

Sitio personal / portafolio de Juan Manuel Díaz. Astro (`output: 'hybrid'`) con adaptador Node standalone.

## Despliegue

- **Firebase App Hosting** ya está conectado y escucha los `push` al repositorio: cada push a la rama principal se despliega automáticamente a `juanma.cc`. No hay que ejecutar comandos de deploy manuales.

## Páginas y destinos (landing / restringir a una página)

- La lista de páginas que alimenta los selectores **"Página de inicio predeterminada"** y **"Restringir a una página"** (modo kiosco) vive en `src/data/destinations.ts`.
- Los **proyectos interactivos** (`src/data/projects.json`) y los **proyectos de desarrollo** (`src/data/built.ts`) se derivan automáticamente; al añadir uno nuevo ahí, aparece solo en los selectores.
- Al crear una **nueva sección de nivel superior** (una página nueva en `src/pages/…`) o un nuevo **juego/herramienta**, hay que añadir su ruta a `destinations.ts` (arrays `SECTIONS`, `GAMES` o `TOOLS`) para que quede disponible como destino.

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
