# Proyecto — MYPAGE (juanma.cc)

Sitio personal / portafolio de Juan Manuel Díaz. Astro (`output: 'hybrid'`) con adaptador Node standalone.

## Despliegue

- **Firebase App Hosting** ya está conectado y escucha los `push` al repositorio: cada push a la rama principal se despliega automáticamente a `juanma.cc`. No hay que ejecutar comandos de deploy manuales.

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
