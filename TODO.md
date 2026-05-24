## Lo que tú debes hacer (paso a paso)

### Paso 1 — Copiar assets estáticos

Copia estas carpetas dentro de `app/public/`:

```
MYPAGE/public/img/   →   MYPAGE/app/public/img/
MYPAGE/public/font/  →   MYPAGE/app/public/font/
MYPAGE/public/jm.py  →   MYPAGE/app/public/jm.py
```

En PowerShell:

```powershell
Copy-Item -Recurse "D:\Sistema\Carpetas\Programacion\WEB\MYPAGE\public\img"  "D:\Sistema\Carpetas\Programacion\WEB\MYPAGE\app\public\img"
Copy-Item -Recurse "D:\Sistema\Carpetas\Programacion\WEB\MYPAGE\public\font" "D:\Sistema\Carpetas\Programacion\WEB\MYPAGE\app\public\font"
Copy-Item "D:\Sistema\Carpetas\Programacion\WEB\MYPAGE\public\jm.py" "D:\Sistema\Carpetas\Programacion\WEB\MYPAGE\app\public\jm.py"
```

### Paso 2 — Instalar dependencias

```powershell
cd D:\Sistema\Carpetas\Programacion\WEB\MYPAGE\app
npm install
```

### Paso 3 — Probar en local

```powershell
npm run dev
# Abre http://localhost:4321
```

### Paso 4 — Crear repositorio GitHub

1. Ve a [github.com](https://github.com/) → **New repository** → nombre: `juanma-portfolio` → Public → **Create**
2. En la terminal dentro de `app/`:

```powershell
git init
git add .
git commit -m "feat: initial Astro SSR portfolio structure"
git branch -M main
git remote add origin https://github.com/Juanma0247/juanma-portfolio.git
git push -u origin main
```

### Paso 5 — Activar Firebase App Hosting

1. Ve a [Firebase Console](https://console.firebase.google.com/) → Proyecto `juamdg`
2. En el menú izquierdo → **App Hosting** → **Get started**
3. Conecta tu repositorio de GitHub: `juanma-portfolio`
4. Selecciona rama: `main`
5. Firebase detecta Astro automáticamente y configura el build
6. Click **Deploy** — el primer deploy toma ~5 minutos

### Paso 6 — Migrar proyectos P2–P16 (cuando quieras)

Para cada proyecto, ejemplo P2 (Sets):

1. Abre [src/lib/projects/Sets.js](vscode-webview://11h0oodg6ha32hrgj1lhku2rc3vq6kgcu0sdg6fihhv2nffqvug1/app/src/lib/projects/Sets.js)
2. Copia el contenido de `public/objects/P2.js`
3. Cambia la clase de `P2` a `Sets`
4. Cambia `import ExtT from "../objects/ExtT.js"` → `import ExtText from '../core/ExtText.js'`
5. Abre [src/pages/projects/sets.astro](vscode-webview://11h0oodg6ha32hrgj1lhku2rc3vq6kgcu0sdg6fihhv2nffqvug1/app/src/pages/projects/sets.astro) y pega el HTML del bloque `.p2Cont` del `index.html` original
6. También actualiza el nombre y la imagen del juego en [src/data/games.json](vscode-webview://11h0oodg6ha32hrgj1lhku2rc3vq6kgcu0sdg6fihhv2nffqvug1/app/src/data/games.json)

---

**Resumen de lo que quedó listo:** 64 archivos creados — config completa, todo el CSS migrado a `rem`, layout con menú Astro nativo, routing real por URL (`/projects/hill-cipher`), datos en JSON (agregar proyecto = solo editar `projects.json`), P1 completamente migrado como ejemplo, `Database.js` usando variables de entorno, `.env` con tus credenciales Firebase (excluido del git vía `.gitignore`).
