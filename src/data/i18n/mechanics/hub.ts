// Hub of Física Mecánica (pd.mechanics.hub).

const en = {
  lead: String.raw`An interactive laboratory for the first part of a university mechanics course: from the position of a particle on a line to Newton’s laws with friction. Each topic combines the theory (after Resnick), simulations you can play and scrub, and a solver that takes the data of <b>any</b> statement, in the style of Serway’s problems, picks the right equation of the invariant, isolates the unknown and shows every step, with the notation of the course notes.`,
  kinematics: 'Kinematics: describing motion',
  kinematicsLead: 'How things move: position, velocity and acceleration in a line, in the plane and on a circle.',
  dynamics: 'Dynamics: the causes of motion',
  dynamicsLead: 'Why things move: forces, free-body diagrams, Newton’s laws and friction.',
  tags: {
    oneDim: ['x(t)', 'dx/dt', 'limit'],
    uniform: ['a = 0', 'encounters', 'average'],
    accelerated: ['MUA', 'MUR', 'chases'],
    freeFall: ['V = gt', 'H = gt²/2'],
    vertical: ['v = 0 at the top', 'two roots'],
    projectile: ['parabola', 'range', 'target'],
    circular: ['MCU', 'MCUA', 'a_c'],
    newton: ['ΣF = ma', 'D.C.L.', 'pulleys'],
    friction: ['μs, μk', 'does it move?', 'curves'],
  },
  howTitle: 'How the laboratory works',
  how: [
    { title: 'Data and unknowns', text: 'Type the values the statement gives, with their units, and leave empty what it asks for. Each empty field is an unknown; mark with ★ the ones the problem asks for.' },
    { title: 'The invariant and the variant', text: 'The general equations of the topic (the invariant) are always visible; the conditions of the statement (starts from rest, reaches the ground, about to slide…) turn them into the variant of the course.' },
    { title: 'Step by step', text: 'The solver explains why it chooses each equation, isolates the unknown symbolically, substitutes the numbers with units and boxes the result. Quadratics keep both roots and discard those that make no physical sense.' },
    { title: 'Simulation and graphs', text: 'The motion determined by the data is animated, and its graphs follow it: drag over a graph to move through time. Notable events (top, ground, stop) are computed with their own derivation.' },
    { title: 'Free-body diagrams', text: 'In dynamics every body is drawn with its forces, components and acceleration, and the results are checked body by body with ΣF = m a.' },
  ],
  sourcesTitle: 'Sources',
  sources: String.raw`Theory after R. Resnick, D. Halliday and K. S. Krane, <em>Física</em>, vol. 1 (chapters 2, 4, 5 and 6). Problems and questions after R. A. Serway and J. W. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1 (chapters 2 to 6), and the course notes and workshops on motion in one dimension, motion in the plane and Newton’s laws, whose notation (the invariant, the variants, the D.C.L.) the whole project follows.`,
  start: 'Start with motion in one dimension',
}

const es: typeof en = {
  lead: String.raw`Un laboratorio interactivo para la primera parte de un curso universitario de mecánica: desde la posición de una partícula en una recta hasta las leyes de Newton con fricción. Cada tema combina la teoría (según Resnick), simulaciones que puedes reproducir y recorrer, y un solver que toma los datos de <b>cualquier</b> enunciado, al estilo de los problemas de Serway, elige la ecuación adecuada de la invariante, despeja la incógnita y muestra cada paso, con la notación del material de clase.`,
  kinematics: 'Cinemática: describir el movimiento',
  kinematicsLead: 'Cómo se mueven las cosas: posición, velocidad y aceleración en una recta, en el plano y en una circunferencia.',
  dynamics: 'Dinámica: las causas del movimiento',
  dynamicsLead: 'Por qué se mueven las cosas: fuerzas, diagramas de cuerpo libre, leyes de Newton y fricción.',
  tags: {
    oneDim: ['x(t)', 'dx/dt', 'límite'],
    uniform: ['a = 0', 'encuentros', 'promedios'],
    accelerated: ['MUA', 'MUR', 'persecuciones'],
    freeFall: ['V = gt', 'H = gt²/2'],
    vertical: ['v = 0 en la cima', 'dos raíces'],
    projectile: ['parábola', 'alcance', 'blanco'],
    circular: ['MCU', 'MCUA', 'a_c'],
    newton: ['ΣF = ma', 'D.C.L.', 'poleas'],
    friction: ['μs, μk', '¿se mueve?', 'curvas'],
  },
  howTitle: 'Cómo funciona el laboratorio',
  how: [
    { title: 'Datos e incógnitas', text: 'Escribe los valores que da el enunciado, con sus unidades, y deja vacío lo que pide. Cada casilla vacía es una incógnita; marca con ★ las que pide el problema.' },
    { title: 'La invariante y la variante', text: 'Las ecuaciones generales del tema (la invariante) están siempre a la vista; las condiciones del enunciado (parte del reposo, llega al suelo, a punto de deslizar…) las convierten en la variante del curso.' },
    { title: 'Paso a paso', text: 'El solver explica por qué elige cada ecuación, despeja la incógnita simbólicamente, sustituye los números con unidades y enmarca el resultado. Las cuadráticas conservan ambas raíces y descartan las que no tienen sentido físico.' },
    { title: 'Simulación y gráficas', text: 'El movimiento que determinan los datos se anima, y sus gráficas lo acompañan: arrastra sobre una gráfica para recorrer el tiempo. Los eventos notables (cima, suelo, frenado) se calculan con su propia deducción.' },
    { title: 'Diagramas de cuerpo libre', text: 'En dinámica cada cuerpo se dibuja con sus fuerzas, componentes y aceleración, y los resultados se verifican cuerpo por cuerpo con ΣF = m a.' },
  ],
  sourcesTitle: 'Fuentes',
  sources: String.raw`Teoría según R. Resnick, D. Halliday y K. S. Krane, <em>Física</em>, vol. 1 (capítulos 2, 4, 5 y 6). Problemas y preguntas según R. A. Serway y J. W. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1 (capítulos 2 a 6), y el material y los talleres de clase de movimiento en una dimensión, movimiento en el plano y leyes de Newton, cuya notación (la invariante, las variantes, el D.C.L.) sigue todo el proyecto.`,
  start: 'Empieza por el movimiento en una dimensión',
}

export const hub = { en, es }
