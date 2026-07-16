export interface LangText {
  en: string
  es: string
}

export interface TechItem {
  name: string
  note: LangText
}

export type Highlight =
  | { kind: 'shot'; img: string; title: LangText; desc: LangText }
  | { kind: 'code'; snippet: string; lang: string; file: string; title: LangText; desc: LangText }

export type BuiltSize = 'sm' | 'wide' | 'tall' | 'feature'

export interface BuiltProject {
  slug: string
  name: string
  logo: string
  /** Monochrome (white) logo — tinted to the theme text color (black on light). */
  mono?: boolean
  hero?: string
  url?: string
  urlNote?: LangText
  size: BuiltSize
  tags: string[]
  role: LangText
  year: string
  what: LangText
  participation: LangText
  stack: TechItem[]
  highlights: Highlight[]
}

export const built: BuiltProject[] = [
  {
    slug: 'icfes',
    name: 'Icfes para disciplinados',
    logo: '/img/built/icfes.svg',
    hero: '/img/built/shots/icfes.png',
    url: 'https://icfesparadisciplinados.github.io/pages/login.html',
    urlNote: {
      en: 'Demo access — document: 0123456789 · password: ABCD',
      es: 'Acceso demo — documento: 0123456789 · contraseña: ABCD',
    },
    size: 'wide',
    tags: ['Vanilla JS', 'GSAP', 'Firebase'],
    role: { en: 'Sole author', es: 'Autor único' },
    year: '2023',
    what: {
      en: 'A platform to collect and share study material for the Colombian Saber 11 (Icfes) exam. Students log in and browse a searchable library of topics with live suggestions.',
      es: 'Una plataforma para reunir y compartir material de estudio para el examen Saber 11 (Icfes). Los estudiantes inician sesión y navegan una biblioteca de temas con búsqueda y sugerencias en vivo.',
    },
    participation: {
      en: 'I built the whole thing on my own: interface, animations, the search engine and the Firebase backend. It runs as a static site on GitHub Pages with Firestore as the data layer.',
      es: 'Lo construí por completo yo solo: interfaz, animaciones, el buscador y el backend en Firebase. Funciona como sitio estático en GitHub Pages con Firestore como capa de datos.',
    },
    stack: [
      { name: 'Vanilla JS (ES Modules)', note: { en: 'No framework — plain modular JavaScript.', es: 'Sin framework — JavaScript modular puro.' } },
      { name: 'GSAP + ScrollTrigger', note: { en: 'Scroll-driven animations.', es: 'Animaciones ligadas al scroll.' } },
      { name: 'Firebase Firestore', note: { en: 'Users and study material storage.', es: 'Almacenamiento de usuarios y material.' } },
      { name: 'GitHub Pages', note: { en: 'Static hosting.', es: 'Hosting estático.' } },
    ],
    highlights: [
      {
        kind: 'shot',
        img: '/img/built/shots/icfes.png',
        title: { en: 'Tiled login', es: 'Login teselado' },
        desc: {
          en: 'The entrance screen: a dark, repeating "icfes" watermark with two minimal underlined fields. Access is gated so only registered students reach the library.',
          es: 'La pantalla de entrada: una marca de agua "icfes" repetida sobre fondo oscuro con dos campos minimalistas subrayados. El acceso está protegido para que solo los estudiantes registrados lleguen a la biblioteca.',
        },
      },
      {
        kind: 'code',
        snippet: 'icfes-buscar.js',
        lang: 'javascript',
        file: 'js/admin/db.js · js/buscador.js',
        title: { en: 'Live search suggestions', es: 'Sugerencias de búsqueda en vivo' },
        desc: {
          en: 'On every keystroke the search filters the list of titles and paints suggestion chips into the DOM by hand — clicking one runs the full listing. No libraries, just the platform.',
          es: 'En cada tecla el buscador filtra la lista de títulos y pinta a mano los chips de sugerencia en el DOM — al hacer clic en uno se genera el listado completo. Sin librerías, solo la plataforma.',
        },
      },
    ],
  },
  {
    slug: 'unismp',
    name: 'UNISMP',
    logo: '/img/built/unismp.svg',
    hero: '/img/built/shots/unismp.png',
    url: 'https://unismp.web.app/',
    size: 'sm',
    tags: ['React', 'Supabase', 'TS'],
    role: { en: 'Team developer', es: 'Desarrollador en equipo' },
    year: '2024',
    what: {
      en: 'A web app for a Minecraft SMP community: player profiles, guides, content and social features (comments, reactions, notifications) around the server.',
      es: 'Una app web para la comunidad de un servidor SMP de Minecraft: perfiles de jugadores, guías, contenido y funciones sociales (comentarios, reacciones, notificaciones) alrededor del servidor.',
    },
    participation: {
      en: 'A team project. I worked on the React front-end and the Supabase data layer — typed hooks, React Query caching and the social features that tie the community together.',
      es: 'Un proyecto en equipo. Trabajé en el front-end de React y la capa de datos en Supabase — hooks tipados, caché con React Query y las funciones sociales que unen a la comunidad.',
    },
    stack: [
      { name: 'React 19 + Vite', note: { en: 'SPA with fast HMR builds.', es: 'SPA con builds y HMR rápidos.' } },
      { name: 'TypeScript + Zod', note: { en: 'Typed end to end, runtime validation.', es: 'Tipado de punta a punta, validación en runtime.' } },
      { name: 'Supabase', note: { en: 'Postgres, auth and edge functions.', es: 'Postgres, auth y edge functions.' } },
      { name: 'TanStack Query', note: { en: 'Server-state cache and mutations.', es: 'Caché de estado de servidor y mutaciones.' } },
      { name: 'Firebase + Tailwind 4', note: { en: 'Extra services and styling.', es: 'Servicios extra y estilos.' } },
    ],
    highlights: [
      {
        kind: 'code',
        snippet: 'unismp-reactions.ts',
        lang: 'typescript',
        file: 'src/hooks/useReactions.ts',
        title: { en: 'Typed reactions hook', es: 'Hook de reacciones tipado' },
        desc: {
          en: 'A reusable hook that reads reactions for any entity from Supabase and folds them into a per-type summary (count + whether the current user reacted), cached by TanStack Query.',
          es: 'Un hook reutilizable que lee las reacciones de cualquier entidad desde Supabase y las reduce a un resumen por tipo (conteo + si el usuario actual reaccionó), cacheado por TanStack Query.',
        },
      },
    ],
  },
  {
    slug: 'numero-pi',
    name: 'Número Pi',
    logo: '/img/built/pi.svg',
    hero: '/img/built/shots/numero-pi.png',
    url: 'https://numero-pi.web.app/',
    size: 'sm',
    tags: ['Vanilla JS', 'Firebase'],
    role: { en: 'Sole author', es: 'Autor único' },
    year: '2023',
    what: {
      en: 'A small mathematical experiment that renders millions of decimal digits of π to explore its endless expansion.',
      es: 'Un pequeño experimento matemático que muestra millones de dígitos decimales de π para explorar su expansión infinita.',
    },
    participation: {
      en: 'Made entirely by me. The trick is serving precomputed digit files — from 100k up to one billion places — and streaming the chosen one into the page.',
      es: 'Hecho por completo por mí. El truco está en servir archivos de dígitos precalculados — desde 100 mil hasta mil millones de cifras — y volcar el elegido en la página.',
    },
    stack: [
      { name: 'Vanilla JS', note: { en: 'Fetch + render, nothing else.', es: 'Fetch + render, nada más.' } },
      { name: 'Static digit files', note: { en: '100k · 1M · 10M · 100M · 1B places.', es: '100k · 1M · 10M · 100M · 1B cifras.' } },
      { name: 'Firebase Hosting', note: { en: 'Serves the heavy text assets.', es: 'Sirve los pesados assets de texto.' } },
    ],
    highlights: [
      {
        kind: 'shot',
        img: '/img/built/shots/numero-pi.png',
        title: { en: 'A wall of π', es: 'Un muro de π' },
        desc: {
          en: 'The whole page is π itself: a monospace grid of digits starting 3.14159… and running for as many places as you dare to load.',
          es: 'Toda la página es π en sí: una grilla monoespaciada de dígitos que empieza en 3.14159… y sigue por tantas cifras como te atrevas a cargar.',
        },
      },
      {
        kind: 'code',
        snippet: 'pi-load.js',
        lang: 'javascript',
        file: 'public/js/index.js',
        title: { en: 'Streaming the digits', es: 'Volcando los dígitos' },
        desc: {
          en: 'A single fetch pulls the selected digit file as text and drops it straight into the page — the browser does the rest.',
          es: 'Un único fetch trae el archivo de dígitos como texto y lo inyecta directo en la página — el navegador hace el resto.',
        },
      },
    ],
  },
  {
    slug: 'el-condor',
    name: 'El Cóndor',
    logo: '/img/built/condor.png',
    hero: '/img/built/shots/el-condor.png',
    url: 'https://somoselcondor.com/',
    size: 'feature',
    tags: ['Node.js', 'Express', 'Supabase', 'Cloudinary'],
    role: { en: 'Lead developer · tech-stack lead', es: 'Desarrollador principal · líder del stack' },
    year: '2024',
    what: {
      en: 'A real-estate management system (ERP) for a Colombian company that sells land lots in Tolima: public site plus an internal portal covering sales, lots, installments, commissions, invoices, legal, reports, backups and more.',
      es: 'Un sistema de gestión inmobiliaria (ERP) para una empresa colombiana que vende lotes en el Tolima: sitio público más un portal interno que cubre ventas, lotes, cuotas, comisiones, facturas, jurídico, reportes, respaldos y más.',
    },
    participation: {
      en: 'I took part as principal developer, consultant and lead of the technology stack behind the app. The backend is a clean Express MVC with 20+ domain modules (controllers, routes, services) and heavy business logic — overdue interest, commissions, statements, two-factor auth and session revocation.',
      es: 'Participé como desarrollador principal, consultor y líder del stack tecnológico detrás de la aplicación. El backend es un MVC de Express con más de 20 módulos de dominio (controladores, rutas, servicios) y bastante lógica de negocio — intereses de mora, comisiones, estados de cuenta, doble factor y revocación de sesiones.',
    },
    stack: [
      { name: 'Node.js + Express', note: { en: 'MVC API: controllers · routes · services.', es: 'API MVC: controladores · rutas · servicios.' } },
      { name: 'Supabase (PostgreSQL)', note: { en: 'Schema-scoped data with stored procedures (RPC).', es: 'Datos por esquema con procedimientos almacenados (RPC).' } },
      { name: 'JWT + 2FA', note: { en: 'Auth, roles, session revocation.', es: 'Auth, roles, revocación de sesiones.' } },
      { name: 'Cloudinary + Multer', note: { en: 'Document and image uploads.', es: 'Subida de documentos e imágenes.' } },
      { name: 'Nodemailer', note: { en: 'Transactional email and login alerts.', es: 'Correo transaccional y alertas de acceso.' } },
      { name: 'esbuild + Jest', note: { en: 'Front bundling and tests.', es: 'Bundling del front y pruebas.' } },
    ],
    highlights: [
      {
        kind: 'shot',
        img: '/img/built/shots/el-condor.png',
        title: { en: 'Landing that sells', es: 'Landing que vende' },
        desc: {
          en: 'The public hero over a Tolima sunset, with live counters — lots sold, lots available, active projects — feeding straight from the same database the internal ERP uses.',
          es: 'El hero público sobre un atardecer del Tolima, con contadores en vivo — lotes vendidos, disponibles, proyectos activos — alimentados directo de la misma base de datos que usa el ERP interno.',
        },
      },
      {
        kind: 'code',
        snippet: 'condor-routes.js',
        lang: 'javascript',
        file: 'src/routes/ventas.routes.js',
        title: { en: 'REST by domain', es: 'REST por dominio' },
        desc: {
          en: 'Each business area gets its own router that maps clean REST verbs onto a controller. This is one of 20+ modules — sales, with financial statements, requests, cancellations and more.',
          es: 'Cada área de negocio tiene su propio router que mapea verbos REST limpios a un controlador. Este es uno de más de 20 módulos — ventas, con estados financieros, solicitudes, cancelaciones y más.',
        },
      },
      {
        kind: 'code',
        snippet: 'condor-mora.js',
        lang: 'javascript',
        file: 'src/services/mora.service.js',
        title: { en: 'Overdue interest in the database', es: 'Intereses de mora en la base de datos' },
        desc: {
          en: 'Heavy money math lives where the data is: a nightly job calls a PostgreSQL stored procedure that recomputes overdue interest for every active installment in a single transaction.',
          es: 'Las cuentas pesadas viven donde están los datos: un trabajo nocturno llama a un procedimiento almacenado de PostgreSQL que recalcula los intereses de mora de cada cuota activa en una sola transacción.',
        },
      },
    ],
  },
  {
    slug: 'fcen',
    name: 'FCEN — UNAL',
    logo: '/img/built/fcen.svg',
    mono: true,
    hero: '/img/built/shots/fcen.png',
    url: 'https://fcen.unal.edu.co/',
    size: 'wide',
    tags: ['Next.js', 'TypeScript', 'Firebase', 'PDFKit'],
    role: { en: 'Full-stack developer', es: 'Desarrollador full-stack' },
    year: '2025',
    what: {
      en: 'The website of the Faculty of Exact and Natural Sciences (UNAL, Manizales). Two fronts: continuous redesign and maintenance of many public sections, and a full internal app I built to edit the cards and data and to generate official certificates.',
      es: 'El sitio de la Facultad de Ciencias Exactas y Naturales (UNAL, Manizales). Dos frentes: rediseño y mantenimiento continuo de muchas secciones públicas, y una aplicación interna que construí por completo para editar las tarjetas y los datos y generar certificados oficiales.',
    },
    participation: {
      en: 'As full-stack developer I restructured, automated and designed sections of the public site, and built "fcenedit" — a Next.js admin that pulls from Google Sheets, stores media in Cloudinary and generates institutional PDF certificates on the server.',
      es: 'Como desarrollador full-stack reestructuré, automaticé y diseñé secciones del sitio público, y construí "fcenedit" — un panel en Next.js que lee de Google Sheets, guarda medios en Cloudinary y genera certificados institucionales en PDF desde el servidor.',
    },
    stack: [
      { name: 'Next.js 16 + React 19', note: { en: 'The fcenedit admin app.', es: 'La app de administración fcenedit.' } },
      { name: 'TypeScript + Tailwind 4', note: { en: 'Typed, utility-first UI.', es: 'UI tipada y utility-first.' } },
      { name: 'Firebase + Cloudinary', note: { en: 'Auth and media storage.', es: 'Auth y almacenamiento de medios.' } },
      { name: 'Google Sheets API', note: { en: 'Spreadsheets as a data source.', es: 'Hojas de cálculo como fuente de datos.' } },
      { name: 'PDFKit + svg-to-pdfkit', note: { en: 'Server-side certificate generation.', es: 'Generación de certificados en el servidor.' } },
      { name: 'HTML / CSS / JS', note: { en: 'The public fcen.unal.edu.co sections.', es: 'Las secciones públicas de fcen.unal.edu.co.' } },
    ],
    highlights: [
      {
        kind: 'shot',
        img: '/img/built/shots/fcen.png',
        title: { en: 'Institutional home', es: 'Inicio institucional' },
        desc: {
          en: 'The faculty home with its rotating hero and the grid of section cards — several of which I rebuilt and now keep updated.',
          es: 'El inicio de la facultad con su hero rotativo y la grilla de tarjetas de sección — varias de las cuales reconstruí y ahora mantengo actualizadas.',
        },
      },
      {
        kind: 'code',
        snippet: 'fcen-cert.ts',
        lang: 'typescript',
        file: 'src/lib/certificados/generate.ts',
        title: { en: 'Certificates as vector PDF', es: 'Certificados como PDF vectorial' },
        desc: {
          en: 'The internal app builds official certificates from scratch with PDFKit — A4, the UNAL seal drawn as vector, custom institutional fonts and a digital signature — streamed back as a buffer.',
          es: 'La app interna arma certificados oficiales desde cero con PDFKit — A4, el sello de la UNAL dibujado como vector, fuentes institucionales propias y una firma digital — devueltos como buffer.',
        },
      },
    ],
  },
  {
    slug: 'prevensur',
    name: 'Droguerías Prevensur',
    logo: '/img/built/prevensur.svg',
    hero: '/img/built/shots/prevensur.png',
    url: 'https://drogueriasprevensur.com/',
    size: 'sm',
    tags: ['Full-stack', 'UI Design', 'E-commerce'],
    role: { en: 'Full-stack developer', es: 'Desarrollador full-stack' },
    year: '2021',
    what: {
      en: 'An online pharmacy from Pasto, Colombia: medicines, personal care and health products with categories, promotions and home delivery.',
      es: 'Una droguería en línea de Pasto, Colombia: medicamentos, cuidado personal y productos de salud con categorías, promociones y entrega a domicilio.',
    },
    participation: {
      en: 'I worked as a full-stack developer on the store, taking on several design and restructuring tasks. It was about four years ago, so I no longer keep the repository — but the site is still live and running.',
      es: 'Trabajé como desarrollador full-stack en la tienda, asumiendo varias tareas de diseño y reestructuración. Fue hace unos cuatro años, así que ya no conservo el repositorio — pero el sitio sigue en línea y funcionando.',
    },
    stack: [
      { name: 'Full-stack web', note: { en: 'Storefront and back office.', es: 'Tienda y back office.' } },
      { name: 'UI design & restructuring', note: { en: 'Layout, sections and visual work.', es: 'Maquetación, secciones y trabajo visual.' } },
      { name: 'E-commerce', note: { en: 'Catalog, cart and categories.', es: 'Catálogo, carrito y categorías.' } },
    ],
    highlights: [
      {
        kind: 'shot',
        img: '/img/built/shots/prevensur.png',
        title: { en: 'Storefront still live', es: 'Tienda aún en línea' },
        desc: {
          en: 'The pharmacy home four years on: search, a full category bar, a rotating promo banner and trust badges — 24h points, delivery, call center — over the brand green.',
          es: 'El inicio de la droguería cuatro años después: buscador, barra completa de categorías, un banner promocional rotativo e insignias de confianza — puntos 24h, domicilios, call center — sobre el verde de la marca.',
        },
      },
    ],
  },
  {
    slug: 'arcur',
    name: 'Catálogo boutique Arcur',
    logo: '/img/built/arcur.svg',
    hero: '/img/built/shots/arcur.png',
    url: 'https://boutiquearcurcolombia.web.app/',
    size: 'sm',
    tags: ['Vanilla JS', 'Firebase', 'CRUD engine'],
    role: { en: 'Sole author', es: 'Autor único' },
    year: '2022',
    what: {
      en: 'A product catalog for the Colombian clothing brand Arcur. Two apps: a customer-facing storefront and a hidden admin with a full CRUD to manage products, prices and offers.',
      es: 'Un catálogo de productos para la marca de ropa colombiana Arcur. Dos aplicaciones: una vista de tienda para el cliente y un panel de administración oculto con un CRUD completo para gestionar productos, precios y ofertas.',
    },
    participation: {
      en: 'Built entirely by me, with no AI help. The interesting part is a home-made "component engine": plain functions that render forms and CRUD tables wired to Firestore. It honestly asks for a big redesign — but it works and it is all handcrafted.',
      es: 'Hecho por completo por mí, sin ayuda de IA. Lo interesante es un "motor de componentes" casero: funciones planas que renderizan formularios y tablas CRUD conectadas a Firestore. Sinceramente pide una gran reestructuración de diseño — pero funciona y está todo hecho a mano.',
    },
    stack: [
      { name: 'Vanilla JS (ES Modules)', note: { en: 'Two apps, no framework.', es: 'Dos apps, sin framework.' } },
      { name: 'Firebase Firestore + Storage', note: { en: 'Products, offers and images.', es: 'Productos, ofertas e imágenes.' } },
      { name: 'Home-made CRUD engine', note: { en: 'DOM builders for forms and tables.', es: 'Constructores de DOM para formularios y tablas.' } },
    ],
    highlights: [
      {
        kind: 'shot',
        img: '/img/built/shots/arcur.png',
        title: { en: 'Storefront + offers', es: 'Tienda + ofertas' },
        desc: {
          en: 'The customer catalog with category navigation and discount badges (here a 25%-off "Pantalón Drill"). It is the part that most needs a visual overhaul — and a good before to any after.',
          es: 'El catálogo del cliente con navegación por categorías y etiquetas de descuento (aquí un "Pantalón Drill" con 25% OFF). Es la parte que más necesita una renovación visual — y un buen antes para cualquier después.',
        },
      },
      {
        kind: 'code',
        snippet: 'arcur-crud.js',
        lang: 'javascript',
        file: 'public/js/interface.js',
        title: { en: 'One call, a whole CRUD table', es: 'Una llamada, una tabla CRUD entera' },
        desc: {
          en: 'The admin is built on functions like addTablaCRUD: pass a Firestore collection and it renders the header, the "add" button and an editable, deletable row per document — a mini framework of my own.',
          es: 'El administrador se construye con funciones como addTablaCRUD: le pasas una colección de Firestore y renderiza el encabezado, el botón "añadir" y una fila editable y borrable por documento — un mini framework propio.',
        },
      },
    ],
  },
  {
    slug: 'ludix',
    name: 'Ludix',
    logo: '/img/built/ludix.svg',
    url: 'https://app.ludix.co/',
    urlNote: {
      en: 'The public domain has since expired.',
      es: 'El dominio público ya expiró.',
    },
    size: 'sm',
    tags: ['Next.js', 'FastAPI', 'WebGL', 'AI'],
    role: { en: 'Consultant · debugger · occasional dev', es: 'Consultor · depurador · desarrollador ocasional' },
    year: '2025',
    what: {
      en: 'A learning platform with courses, quizzes and a built-in "Mentor AI" chat. A Next.js front-end talks to a FastAPI back-end, with rich math rendering and a WebGL aurora background.',
      es: 'Una plataforma de aprendizaje con cursos, quizzes y un chat "Mentor AI" integrado. Un front-end en Next.js habla con un back-end en FastAPI, con renderizado matemático y un fondo aurora en WebGL.',
    },
    participation: {
      en: 'I took part as consultant, debugger and occasional developer — advising on architecture, hunting bugs and building specific pieces across the front-end and back-end.',
      es: 'Participé como consultor, depurador y desarrollador ocasional — asesorando en arquitectura, cazando bugs y construyendo piezas específicas tanto en el front-end como en el back-end.',
    },
    stack: [
      { name: 'Next.js 16 + React 19', note: { en: 'App-router front-end.', es: 'Front-end con app router.' } },
      { name: 'FastAPI + SQLAlchemy', note: { en: 'Python API with Alembic migrations.', es: 'API en Python con migraciones Alembic.' } },
      { name: 'PostgreSQL + Argon2 + JWT', note: { en: 'Data and secure auth.', es: 'Datos y auth segura.' } },
      { name: 'AI SDK (OpenAI)', note: { en: 'The Mentor AI tutor with RAG.', es: 'El tutor Mentor AI con RAG.' } },
      { name: 'Three.js / OGL (WebGL)', note: { en: 'Animated shader backgrounds.', es: 'Fondos animados con shaders.' } },
      { name: 'MUI · Tailwind · KaTeX', note: { en: 'UI, styling and math typesetting.', es: 'UI, estilos y composición matemática.' } },
    ],
    highlights: [
      {
        kind: 'code',
        snippet: 'ludix-aurora.jsx',
        lang: 'jsx',
        file: 'src/components/ui/Aurora.jsx',
        title: { en: 'A shader for a background', es: 'Un shader como fondo' },
        desc: {
          en: 'The aurora backdrop is not an image: it is a fullscreen triangle drawn on raw WebGL2 with OGL, animated every frame by a GLSL fragment shader that mixes simplex noise with a colour ramp.',
          es: 'El fondo aurora no es una imagen: es un triángulo a pantalla completa dibujado sobre WebGL2 con OGL, animado en cada frame por un fragment shader de GLSL que mezcla ruido simplex con una rampa de color.',
        },
      },
    ],
  },
]
