export interface LangText {
  en: string
  es: string
}

export interface TechItem {
  name: string
  note: LangText
}

export interface Highlight {
  img: string
  title: LangText
  desc: LangText
}

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
  challenge: LangText
  stack: TechItem[]
  highlights: Highlight[]
}

export const built: BuiltProject[] = [
  {
    slug: 'icfes',
    name: 'Icfes para disciplinados',
    logo: '/img/built/icfes.svg',
    hero: '/img/built/shots/icfes-biblioteca.png',
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
      en: 'A private study library for the Colombian Saber 11 (Icfes) exam. Students log in and browse hundreds of practice documents organized by subject — maths, reading, science, social studies and English — with live search, previews, downloads and a curated toolbox of external resources.',
      es: 'Una biblioteca de estudio privada para el examen Saber 11 (Icfes). Los estudiantes inician sesión y navegan cientos de documentos de práctica organizados por materia — matemáticas, lectura, ciencias, sociales e inglés — con búsqueda en vivo, vista previa, descargas y una caja de herramientas curada con recursos externos.',
    },
    participation: {
      en: 'I designed and built the whole product on my own: the interface, the animations, the search engine and the Firebase backend.',
      es: 'Diseñé y construí todo el producto yo solo: la interfaz, las animaciones, el buscador y el backend en Firebase.',
    },
    challenge: {
      en: 'The real problem was not the code but the information: turning a messy pile of exam PDFs into something a stressed student can actually navigate. That meant designing an information architecture by subject and source, a fast client-side search over the catalogue, gated access so only registered students get in, and scroll-driven motion to make a study tool feel alive — all shipped as a static site with Firestore as the only backend.',
      es: 'El problema real no era el código sino la información: convertir un montón desordenado de PDFs de examen en algo que un estudiante estresado pueda navegar de verdad. Eso implicó diseñar una arquitectura de información por materia y fuente, un buscador rápido del lado del cliente sobre el catálogo, acceso protegido para que solo entren estudiantes registrados, y animación ligada al scroll para que una herramienta de estudio se sienta viva — todo servido como sitio estático con Firestore como único backend.',
    },
    stack: [
      { name: 'Vanilla JS (ES Modules)', note: { en: 'No framework — plain modular JavaScript.', es: 'Sin framework — JavaScript modular puro.' } },
      { name: 'GSAP + ScrollTrigger', note: { en: 'Scroll-driven animations.', es: 'Animaciones ligadas al scroll.' } },
      { name: 'Firebase Firestore', note: { en: 'Users and study material storage.', es: 'Almacenamiento de usuarios y material.' } },
      { name: 'GitHub Pages', note: { en: 'Static hosting.', es: 'Hosting estático.' } },
    ],
    highlights: [
      {
        img: '/img/built/shots/icfes-material.png',
        title: { en: 'Real exam material', es: 'Material de examen real' },
        desc: {
          en: 'Behind the login lives the point of the whole thing: real practice questions and readings across every Saber 11 area, ready to preview and download.',
          es: 'Tras el login vive el sentido de todo: preguntas y lecturas de práctica reales de cada área del Saber 11, listas para previsualizar y descargar.',
        },
      },
      {
        img: '/img/built/shots/icfes-herramientas.png',
        title: { en: 'A curated toolbox', es: 'Una caja de herramientas curada' },
        desc: {
          en: 'Beyond the library, a hand-picked hub of results by year, free mock exams and study channels — the shortcuts a student would otherwise spend hours hunting for.',
          es: 'Más allá de la biblioteca, un centro seleccionado de resultados por año, simulacros gratis y canales de estudio — los atajos que un estudiante tardaría horas en encontrar.',
        },
      },
    ],
  },
  {
    slug: 'unismp',
    name: 'UNISMP',
    logo: '/img/built/unismp.svg',
    hero: '/img/built/shots/unismp-inicio.png',
    url: 'https://unismp.web.app/',
    size: 'sm',
    tags: ['React', 'Supabase', 'TS'],
    role: { en: 'Team developer', es: 'Desarrollador en equipo' },
    year: '2024',
    what: {
      en: 'A companion web app for a Minecraft SMP community: a home hub around the server with player profiles and rankings, community farms, lore and memorable moments, clans, battles and businesses — everything the SMP needs in one place.',
      es: 'Una app web complementaria para la comunidad de un servidor SMP de Minecraft: un centro alrededor del servidor con perfiles y rankings de jugadores, granjas de la comunidad, lore y momentos memorables, clanes, batallas y negocios — todo lo que el SMP necesita en un solo lugar.',
    },
    participation: {
      en: 'A team project. I worked on the React front-end and the Supabase data layer — typed hooks, cached queries and the social features (profiles, rankings, reactions, comments) that hold the community together.',
      es: 'Un proyecto en equipo. Trabajé en el front-end de React y la capa de datos en Supabase — hooks tipados, consultas cacheadas y las funciones sociales (perfiles, rankings, reacciones, comentarios) que unen a la comunidad.',
    },
    challenge: {
      en: 'A game community is a moving target: dozens of little features (farms, lore, clans, a multi-axis ranking of players) that all read and write the same shared data. The work was modelling that domain in Postgres, keeping everything type-safe from the database to the component, and caching server state so the app feels instant without hammering the backend — while designing screens playful enough to fit a Minecraft server.',
      es: 'Una comunidad de juego es un blanco móvil: decenas de funciones pequeñas (granjas, lore, clanes, un ranking multieje de jugadores) que leen y escriben los mismos datos compartidos. El trabajo fue modelar ese dominio en Postgres, mantener todo tipado desde la base de datos hasta el componente, y cachear el estado del servidor para que la app se sienta instantánea sin saturar el backend — a la vez que diseñábamos pantallas lo bastante lúdicas para un servidor de Minecraft.',
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
        img: '/img/built/shots/unismp-jugadores.png',
        title: { en: 'Player rankings', es: 'Rankings de jugadores' },
        desc: {
          en: 'The social heart of the app: every player scored across ten axes — PvP, redstone, farming, strategy, reputation… — and re-sortable by any of them. A whole gamified reputation system.',
          es: 'El corazón social de la app: cada jugador puntuado en diez ejes — PvP, redstone, granjas, estrategia, reputación… — y reordenable por cualquiera. Todo un sistema de reputación gamificado.',
        },
      },
      {
        img: '/img/built/shots/unismp-granjas.png',
        title: { en: 'Community farms', es: 'Granjas de la comunidad' },
        desc: {
          en: 'A catalogue of redstone builds shared by players, each tagged by type and size with its production rates — a living library of what the server has engineered.',
          es: 'Un catálogo de construcciones de redstone compartidas por los jugadores, cada una etiquetada por tipo y tamaño con sus tasas de producción — una biblioteca viva de lo que el servidor ha ingeniado.',
        },
      },
      {
        img: '/img/built/shots/unismp-lore.png',
        title: { en: 'Lore & memorable moments', es: 'Lore y momentos memorables' },
        desc: {
          en: 'A timeline where the community writes its own history — screenshots and stories of the builds, raids and disasters that make an SMP feel like a world.',
          es: 'Una línea de tiempo donde la comunidad escribe su propia historia — capturas y relatos de las construcciones, incursiones y desastres que hacen que un SMP se sienta como un mundo.',
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
      en: 'A small mathematical experiment that renders millions of decimal digits of π so you can wander through its endless expansion.',
      es: 'Un pequeño experimento matemático que muestra millones de dígitos decimales de π para pasear por su expansión infinita.',
    },
    participation: {
      en: 'Made entirely by me, front to back.',
      es: 'Hecho por completo por mí, de principio a fin.',
    },
    challenge: {
      en: 'Painting a billion characters on a page will freeze any browser. The interesting decision was to move the hard part offline — precompute the digits into static files, from 100k up to a billion places — and let the front-end simply stream in the chosen one. It is a lesson in doing the expensive work once, ahead of time, instead of on every visit.',
      es: 'Pintar mil millones de caracteres en una página congela cualquier navegador. La decisión interesante fue mover la parte difícil fuera de línea — precalcular los dígitos en archivos estáticos, desde 100 mil hasta mil millones de cifras — y dejar que el front-end simplemente vuelque el elegido. Es una lección de hacer el trabajo costoso una sola vez, por adelantado, en vez de en cada visita.',
    },
    stack: [
      { name: 'Vanilla JS', note: { en: 'Fetch + render, nothing else.', es: 'Fetch + render, nada más.' } },
      { name: 'Static digit files', note: { en: '100k · 1M · 10M · 100M · 1B places.', es: '100k · 1M · 10M · 100M · 1B cifras.' } },
      { name: 'Firebase Hosting', note: { en: 'Serves the heavy text assets.', es: 'Sirve los pesados assets de texto.' } },
    ],
    highlights: [
      {
        img: '/img/built/shots/numero-pi.png',
        title: { en: 'A wall of π', es: 'Un muro de π' },
        desc: {
          en: 'The whole page is π itself: a monospace grid of digits starting 3.14159… and running for as many places as you dare to load.',
          es: 'Toda la página es π en sí: una grilla monoespaciada de dígitos que empieza en 3.14159… y sigue por tantas cifras como te atrevas a cargar.',
        },
      },
    ],
  },
  {
    slug: 'el-condor',
    name: 'El Cóndor',
    logo: '/img/built/condor.png',
    hero: '/img/built/shots/condor-panel.png',
    url: 'https://somoselcondor.com/',
    size: 'feature',
    tags: ['Node.js', 'Express', 'Supabase', 'Cloudinary'],
    role: { en: 'Lead developer · tech-stack lead', es: 'Desarrollador principal · líder del stack' },
    year: '2024',
    what: {
      en: 'A real-estate management system (ERP) for a Colombian company that sells land lots in Tolima. Beyond the public site, an internal operations centre runs the whole business: projects and lots on an interactive map, buyers and sales, installments, commissions, invoices, expenses, approvals, legal follow-up, backups, consolidated reports and role-based permissions.',
      es: 'Un sistema de gestión inmobiliaria (ERP) para una empresa colombiana que vende lotes en el Tolima. Más allá del sitio público, un centro de operación interno maneja todo el negocio: proyectos y lotes en un mapa interactivo, compradores y ventas, cuotas, comisiones, facturas, gastos, aprobaciones, seguimiento jurídico, respaldos, reportes consolidados y permisos por rol.',
    },
    participation: {
      en: 'I took part as principal developer, consultant and lead of the technology stack. I helped shape the architecture and built across the platform — from the domain model to the money logic to the security layer.',
      es: 'Participé como desarrollador principal, consultor y líder del stack tecnológico. Ayudé a definir la arquitectura y construí a lo largo de la plataforma — desde el modelo de dominio hasta la lógica de dinero y la capa de seguridad.',
    },
    challenge: {
      en: 'This was the hardest kind of project: modelling a real, messy business. It meant sitting with how the company actually sells — reservations, financing plans, overdue interest, commissions, deeds — and turning that into a coherent data model and 20-plus modules that stay consistent with each other. On top of the domain came the serious parts: role-based permissions for owners, treasurers and salespeople; two-factor auth and session revocation; audit trails; automatic backups; and money math run inside PostgreSQL so it can never drift. Leading the stack meant choosing tools that a small team could actually operate.',
      es: 'Fue el tipo de proyecto más difícil: modelar un negocio real y desordenado. Implicó entender cómo vende de verdad la empresa — reservas, planes de financiación, intereses de mora, comisiones, escrituras — y convertir eso en un modelo de datos coherente y más de 20 módulos que se mantienen consistentes entre sí. Sobre el dominio vinieron las partes serias: permisos por rol para dueños, tesoreros y vendedores; doble factor y revocación de sesiones; trazas de auditoría; respaldos automáticos; y cuentas de dinero corriendo dentro de PostgreSQL para que nunca se desajusten. Liderar el stack significó elegir herramientas que un equipo pequeño pudiera operar de verdad.',
    },
    stack: [
      { name: 'Node.js + Express', note: { en: 'MVC API: controllers · routes · services.', es: 'API MVC: controladores · rutas · servicios.' } },
      { name: 'Supabase (PostgreSQL)', note: { en: 'Schema-scoped data with stored procedures.', es: 'Datos por esquema con procedimientos almacenados.' } },
      { name: 'JWT + 2FA', note: { en: 'Auth, roles, session revocation.', es: 'Auth, roles, revocación de sesiones.' } },
      { name: 'Cloudinary + Multer', note: { en: 'Document and image uploads.', es: 'Subida de documentos e imágenes.' } },
      { name: 'Leaflet', note: { en: 'Interactive lot map by status.', es: 'Mapa interactivo de lotes por estado.' } },
      { name: 'Nodemailer + esbuild', note: { en: 'Transactional email and bundling.', es: 'Correo transaccional y bundling.' } },
    ],
    highlights: [
      {
        img: '/img/built/shots/condor-mapa.png',
        title: { en: 'Lots on a live map', es: 'Lotes en un mapa vivo' },
        desc: {
          en: 'Every project drawn on an interactive map, each lot colour-coded by status — available, sold, delivered — and filterable by price and area. Sales and geography, in one view.',
          es: 'Cada proyecto dibujado en un mapa interactivo, cada lote coloreado por estado — disponible, vendido, entregado — y filtrable por precio y área. Ventas y geografía, en una sola vista.',
        },
      },
      {
        img: '/img/built/shots/condor-reportes.png',
        title: { en: 'Consolidated reports', es: 'Reportes consolidados' },
        desc: {
          en: 'The finance cockpit: monthly collections, portfolio by status, overdue receivables and a twelve-month income projection — the numbers the owners actually steer by.',
          es: 'La cabina financiera: recaudo mensual, cartera por estado, cuentas vencidas y una proyección de ingresos a doce meses — los números con los que los dueños realmente dirigen.',
        },
      },
      {
        img: '/img/built/shots/condor-permisos.png',
        title: { en: 'Permissions by role', es: 'Permisos por rol' },
        desc: {
          en: 'A full access-control matrix: for each role — owner, treasurer, area chief, surveyor — you toggle which modules appear and which actions they may take, down to "co-sign large purchases".',
          es: 'Una matriz de control de acceso completa: para cada rol — dueño, tesorero, jefe de área, topógrafo — activas qué módulos aparecen y qué acciones puede hacer, hasta "co-firmar compras grandes".',
        },
      },
      {
        img: '/img/built/shots/condor-gastos.png',
        title: { en: 'Operational expenses', es: 'Gastos operativos' },
        desc: {
          en: 'Every outflow tracked by project and category with its receipt, running balances and one-click export to Excel — the unglamorous backbone that keeps the operation honest.',
          es: 'Cada egreso registrado por proyecto y categoría con su comprobante, saldos acumulados y exportación a Excel en un clic — la columna vertebral poco vistosa que mantiene la operación en orden.',
        },
      },
    ],
  },
  {
    slug: 'fcen',
    name: 'FCEN — UNAL',
    logo: '/img/built/fcen.svg',
    mono: true,
    hero: '/img/built/shots/fcen-eventos.png',
    url: 'https://fcen.unal.edu.co/',
    size: 'wide',
    tags: ['Next.js', 'TypeScript', 'Firebase', 'PDFKit'],
    role: { en: 'Full-stack developer', es: 'Desarrollador full-stack' },
    year: '2025',
    what: {
      en: 'The website of the Faculty of Exact and Natural Sciences (UNAL, Manizales). Two fronts: the continuous redesign and maintenance of public sections — events, professors, academic programmes, conference microsites — and an internal admin I built to edit all that content and to generate official certificates.',
      es: 'El sitio de la Facultad de Ciencias Exactas y Naturales (UNAL, Manizales). Dos frentes: el rediseño y mantenimiento continuo de secciones públicas — eventos, profesores, programas académicos, micrositios de congresos — y un panel interno que construí para editar todo ese contenido y generar certificados oficiales.',
    },
    participation: {
      en: 'As full-stack developer I restructured, automated and designed sections of the public site, and built "fcenedit" — a Next.js admin that manages the faculty\'s content and paperwork.',
      es: 'Como desarrollador full-stack reestructuré, automaticé y diseñé secciones del sitio público, y construí "fcenedit" — un panel en Next.js que gestiona el contenido y la papelería de la facultad.',
    },
    challenge: {
      en: 'The hard part was not one page but a system that non-technical staff can keep alive on their own. Sections like events and the professors directory had to become data-driven — fed from Google Sheets the faculty already used — so updating the site means editing a spreadsheet, not the code. On top of that, generating official certificates as pixel-perfect PDFs on the server, and doing all of it inside a public institution\'s brand, accessibility and approval constraints.',
      es: 'Lo difícil no era una página sino un sistema que el personal no técnico pueda mantener vivo por su cuenta. Secciones como eventos y el directorio de profesores tenían que volverse dirigidas por datos — alimentadas desde las Google Sheets que la facultad ya usaba — para que actualizar el sitio sea editar una hoja de cálculo, no el código. Sobre eso, generar certificados oficiales como PDFs perfectos en el servidor, y hacer todo dentro de las restricciones de marca, accesibilidad y aprobación de una institución pública.',
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
        img: '/img/built/shots/fcen-profesores.png',
        title: { en: 'Professors directory', es: 'Directorio de profesores' },
        desc: {
          en: 'Sixty-seven faculty in a searchable, filterable grid — by department, dedication and academic category. A section that used to be static, now driven by data anyone on staff can update.',
          es: 'Sesenta y siete profesores en una grilla con búsqueda y filtros — por departamento, dedicación y categoría. Una sección que antes era estática, ahora dirigida por datos que cualquiera del equipo puede actualizar.',
        },
      },
      {
        img: '/img/built/shots/fcen-congreso.png',
        title: { en: 'Conference microsites', es: 'Micrositios de congresos' },
        desc: {
          en: 'Full event landings — like the International Materials Congress — with their own identity, agenda and registration, built to slot into the faculty site.',
          es: 'Landings de evento completas — como el Congreso Internacional de Materiales — con identidad, agenda e inscripción propias, hechas para encajar en el sitio de la facultad.',
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
    challenge: {
      en: 'Retail e-commerce lives or dies on clarity: a shopper must find a product and trust the store in seconds. The work leaned on the design side — organising the catalogue, the category navigation and the promotions, and restructuring layout so the storefront reads cleanly and converts.',
      es: 'El e-commerce de retail vive o muere por la claridad: un comprador debe encontrar un producto y confiar en la tienda en segundos. El trabajo se apoyó en el diseño — organizar el catálogo, la navegación por categorías y las promociones, y reestructurar la maquetación para que la tienda se lea limpia y convierta.',
    },
    stack: [
      { name: 'Full-stack web', note: { en: 'Storefront and back office.', es: 'Tienda y back office.' } },
      { name: 'UI design & restructuring', note: { en: 'Layout, sections and visual work.', es: 'Maquetación, secciones y trabajo visual.' } },
      { name: 'E-commerce', note: { en: 'Catalog, cart and categories.', es: 'Catálogo, carrito y categorías.' } },
    ],
    highlights: [
      {
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
      en: 'Built entirely by me, with no AI help. It honestly asks for a big redesign — but it works and it is all handcrafted.',
      es: 'Hecho por completo por mí, sin ayuda de IA. Sinceramente pide una gran reestructuración de diseño — pero funciona y está todo hecho a mano.',
    },
    challenge: {
      en: 'The interesting bet was refusing every framework and still needing a real admin. So I wrote my own tiny "component engine": plain functions that render forms and CRUD tables wired straight to Firestore. It is raw and dated by today\'s standards, but it taught me from the ground up what a framework quietly does for you.',
      es: 'La apuesta interesante fue rechazar todo framework y aun así necesitar un administrador de verdad. Así que escribí mi propio "motor de componentes": funciones planas que renderizan formularios y tablas CRUD conectadas directo a Firestore. Es crudo y anticuado para los estándares de hoy, pero me enseñó desde cero lo que un framework hace por ti en silencio.',
    },
    stack: [
      { name: 'Vanilla JS (ES Modules)', note: { en: 'Two apps, no framework.', es: 'Dos apps, sin framework.' } },
      { name: 'Firebase Firestore + Storage', note: { en: 'Products, offers and images.', es: 'Productos, ofertas e imágenes.' } },
      { name: 'Home-made CRUD engine', note: { en: 'DOM builders for forms and tables.', es: 'Constructores de DOM para formularios y tablas.' } },
    ],
    highlights: [
      {
        img: '/img/built/shots/arcur.png',
        title: { en: 'Storefront + offers', es: 'Tienda + ofertas' },
        desc: {
          en: 'The customer catalog with category navigation and discount badges. It is the part that most needs a visual overhaul — and a good "before" to any "after".',
          es: 'El catálogo del cliente con navegación por categorías y etiquetas de descuento. Es la parte que más necesita una renovación visual — y un buen "antes" para cualquier "después".',
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
      en: 'A learning platform with courses, quizzes and a built-in "Mentor AI" chat. A Next.js front-end talks to a FastAPI back-end, with rich math rendering and an animated WebGL background.',
      es: 'Una plataforma de aprendizaje con cursos, quizzes y un chat "Mentor AI" integrado. Un front-end en Next.js habla con un back-end en FastAPI, con renderizado matemático y un fondo animado en WebGL.',
    },
    participation: {
      en: 'I took part as consultant, debugger and occasional developer — advising on architecture, hunting bugs and building specific pieces across the front-end and back-end.',
      es: 'Participé como consultor, depurador y desarrollador ocasional — asesorando en arquitectura, cazando bugs y construyendo piezas específicas tanto en el front-end como en el back-end.',
    },
    challenge: {
      en: 'Coming into a codebase you did not write is its own skill: reading someone else\'s architecture, spotting where it will break and fixing it without unravelling the rest. My value here was breadth — moving between a Next.js front-end and a Python API, advising on structure, and building focused pieces like the AI tutor and the WebGL background.',
      es: 'Entrar a un código que no escribiste es una habilidad propia: leer la arquitectura de otro, detectar dónde se va a romper y arreglarlo sin deshilachar el resto. Mi valor aquí fue la amplitud — moverme entre un front-end en Next.js y una API en Python, asesorar sobre la estructura, y construir piezas puntuales como el tutor de IA y el fondo en WebGL.',
    },
    stack: [
      { name: 'Next.js 16 + React 19', note: { en: 'App-router front-end.', es: 'Front-end con app router.' } },
      { name: 'FastAPI + SQLAlchemy', note: { en: 'Python API with Alembic migrations.', es: 'API en Python con migraciones Alembic.' } },
      { name: 'PostgreSQL + Argon2 + JWT', note: { en: 'Data and secure auth.', es: 'Datos y auth segura.' } },
      { name: 'AI SDK (OpenAI)', note: { en: 'The Mentor AI tutor with RAG.', es: 'El tutor Mentor AI con RAG.' } },
      { name: 'Three.js / OGL (WebGL)', note: { en: 'Animated shader backgrounds.', es: 'Fondos animados con shaders.' } },
      { name: 'MUI · Tailwind · KaTeX', note: { en: 'UI, styling and math typesetting.', es: 'UI, estilos y composición matemática.' } },
    ],
    highlights: [],
  },
]
