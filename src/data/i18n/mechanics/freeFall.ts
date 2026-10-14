// Free fall (pd.mechanics.freeFall).

const en = {
  lead: String.raw`Drop a body from rest and, if the air does not get in the way, it falls with the same constant acceleration \(g\) whatever its size, shape or mass. Free fall is therefore a variant of the invariant: start from rest and take \(a = g\). The course writes it with the height fallen \(H\) and the speed \(V\), both measured downwards, and that is the notation used here; type any of them, or the height of a building, and the laboratory finds the rest.`,
  invariantTitle: 'The invariant of free fall',
  invariantLead: String.raw`With \(V_o = 0\) and \(a = g\) the invariant keeps four quantities, \(H\), \(V\), \(t\) and \(g\), related by four equations, each of which leaves one of them out. With \(g\) known, a single datum fixes the whole fall.`,
  invariantNote: String.raw`The relation \((y)\) places the body above the ground when it is released from a height \(h_0\), and \((\text{MU})\) follows a companion that moves uniformly during the fall, like the horse of the cowboy problem.`,
  graphsLead: String.raw`\(H(t)\) grows as \(t^2\), \(V(t)\) as \(t\) and the acceleration is the same at every instant. Drag over a graph to travel through the fall.`,
  eventsLead: 'Moments of the fall that statements often ask about.',
  unknownG: 'g is unknown (another planet)',
  whyY: 'The height above the ground is the starting height minus what it has fallen: {eq}.',
  whyMU: 'While the body falls, the companion moves uniformly for the same time t: {eq}. The time is the link between both motions.',
  variantTitle: 'Variant: free fall',
  variantNote: 'Applying to the invariant the conditions of free fall: it starts from rest (Vo = 0) and the acceleration is g, positive because the speed increases. H is measured downwards from the release point.',
  plotH: String.raw`Height fallen \(H(t)\)`,
  plotHNote: 'A half parabola: equal intervals of time cover distances in the ratio 1 : 3 : 5 : 7…, Galileo’s law of odd numbers.',
  plotV: String.raw`Speed \(V(t)\)`,
  plotVNote: 'A straight line of slope g; the shaded area is the height fallen, {H}.',
  plotA: String.raw`Acceleration \(g\)`,
  plotANote: 'The same at every instant, whatever the mass of the body.',
  evEnd: 'End of the fall',
  evHalf: 'Halfway down',
  evHalfCond: 'Half the height is covered at 1/√2 of the total time, not at half of it: the body is slow at first.',
  evOdd: 'Distances in equal intervals',
  evOddCond: 'Dividing the fall into four equal intervals of time:',
  legendV: 'velocity',
  legendG: 'acceleration of gravity',
  legendGhost: 'positions at equal time intervals',
  conditions: {
    free: 'No extra condition',
    ground: String.raw`Reaches the ground \((y = 0)\)`,
  },
  query: { t: 'At the instant t =', H: 'After falling H =', V: 'When the speed is V =' },
  theory: [
    {
      title: 'Every body falls alike',
      body: String.raw`<p>If a body falls in a vacuum, so that the air does not affect it, a remarkable fact appears: all bodies, whatever their size, shape or composition, fall with the same acceleration in the same region near the surface of the Earth. This <b>free-fall acceleration</b> \(g\) is about \(9.8\ \text{m/s}^2\): the velocity of a falling body grows by 9.8 m/s every second.</p><p>It also acts on bodies moving up: whether the velocity points up or down, the acceleration due to gravity always points down.</p>`,
    },
    {
      title: 'The variant of free fall',
      body: String.raw`<p>Starting from the invariant \(V = V_o + at\), \(V^2 = V_o^2 + 2aS\), \(S = V_o t + \tfrac{at^2}{2}\) and applying the conditions of the case, release from rest (\(V_o = 0\)) and \(a = g\), with the distance \(S = H\) measured downwards:</p>\[V(t) = g\,t,\qquad V(t)^2 = 2g\,H,\qquad H(t) = \frac{g\,t^2}{2}.\]<p>The acceleration is taken as positive because the speed increases, as the course notes indicate.</p>`,
    },
    {
      title: 'Four equations, four quantities',
      body: String.raw`<p>The fall involves \(H\), \(V\), \(t\) and \(g\), and each equation leaves one of them out: \(V = gt\) has no \(H\), \(V^2 = 2gH\) has no \(t\), \(H = \tfrac12 g t^2\) has no \(V\), and \(H = \tfrac12 V t\) has no \(g\). On Earth \(g\) is known, so one datum is enough; on another planet two data are needed and the fall measures \(g\).</p>`,
    },
    {
      title: 'Galileo and the odd numbers',
      body: String.raw`<p>Galileo could not time a free fall directly, so he slowed it down with inclined planes and found that the distances covered in successive equal intervals of time grow as the odd numbers \(1 : 3 : 5 : 7\ldots\), which is the same as saying that the total distance grows as \(t^2\). It follows from \(H = \tfrac12 g t^2\): after 1, 2, 3, 4 intervals the distances are in the ratio \(1 : 4 : 9 : 16\), and their differences are the odd numbers.</p>`,
    },
    {
      title: 'Up or down: the sign of g',
      body: String.raw`<p>Resnick takes the \(y\) axis upwards; then the acceleration is \(-g\) (with \(g\) always positive) and a falling body has negative displacement and velocity: \(y = y_0 - \tfrac12 g t^2\), \(v = -gt\). The course measures \(H\) and \(V\) downwards and writes them positive. Both pictures are equivalent; what matters is to choose one and keep it during the whole problem.</p>`,
    },
    {
      title: 'Motions that happen at the same time',
      body: String.raw`<p>While a body falls, everything else keeps moving according to its own law, and the time is what links them. A cowboy that drops from a branch onto a galloping horse falls 3.00 m in \(t = \sqrt{2H/g} = 0.782\ \text{s}\); in that time a horse at 10.0 m/s advances \(d = u\,t = 7.82\ \text{m}\). This independence of simultaneous motions is the key to projectile motion.</p>`,
    },
    {
      title: 'Measuring g',
      body: String.raw`<p>The value of \(g\) changes with latitude and altitude (from about \(9.78\) at the equator to \(9.83\ \text{m/s}^2\) at the poles) and with the density of the crust below. The standard value is \(g_n = 9.80665\ \text{m/s}^2\). It can be measured timing a free fall with photogates, with a pendulum, or by throwing a body up and timing its passage through two levels.</p>`,
    },
    {
      title: 'The air, ignored',
      body: String.raw`<p>All of this assumes that air resistance is negligible, which is reasonable for a stone falling a few metres but not for a feather or for a parachutist. With air the acceleration decreases as the speed grows, until a terminal speed is reached; that case needs forces that depend on velocity and is studied with Newton’s laws.</p>`,
    },
  ],
  presets: {
    resnick: {
      title: 'Positions second by second',
      source: 'Resnick, sample problem 2-5',
      text: String.raw`A body is released from rest. Find its position and velocity after \(1.0\ \text{s}\). Then use "query an instant" for 2.0, 3.0 and 4.0 s.`,
    },
    cowboy: {
      title: 'A daring cowboy',
      source: 'Serway 2.43 · class notes',
      text: String.raw`A daring cowboy sitting on a tree branch wants to drop vertically onto a horse galloping under the tree. The constant speed of the horse is \(10.0\ \text{m/s}\) and the distance from the branch to the saddle is \(3.00\ \text{m}\). (a) What must the horizontal distance between saddle and branch be when he makes his move? (b) For how long is he in the air?`,
    },
    building: {
      title: 'From the top of a building',
      source: 'Own example',
      text: String.raw`A stone is dropped from the top of a building \(45.0\ \text{m}\) high. How long does it take to reach the ground and with what speed does it hit it?`,
    },
    bill: {
      title: 'Catching a bill',
      source: 'Serway 2.40',
      text: String.raw`Emily holds a dollar bill vertically with its centre between David’s index finger and thumb; David must catch it after she lets it go, without moving his hand down. If his reaction time is \(0.2\ \text{s}\), will he succeed? (The bill is about \(15.5\ \text{cm}\) long, so its upper edge is \(7.8\ \text{cm}\) above his fingers.)`,
    },
    cat: {
      title: 'A cat rolls off a TV',
      source: 'Serway 2.36',
      text: String.raw`A sleeping cat rolls gently off the top of a warm TV set. Ignoring air resistance, find its position and velocity after \(0.100\ \text{s}\); then query 0.200 s and 0.300 s.`,
    },
    speed: {
      title: 'How high for 20 m/s?',
      source: 'Own example',
      text: String.raw`From what height must a body be dropped to reach the ground at \(20.0\ \text{m/s}\)? How long does the fall last?`,
    },
    planet: {
      title: 'Free fall on another planet',
      source: 'Own example',
      text: String.raw`An astronaut drops a hammer from a height of \(10.0\ \text{m}\) and it takes \(3.51\ \text{s}\) to reach the ground. What is the acceleration of gravity there, and with what speed does it arrive? (Mark "g is unknown".)`,
    },
  },
  source: String.raw`Theory after R. Resnick, D. Halliday and K. Krane, <em>Física</em>, vol. 1, chapter 2 (sections 2-7 to 2-9); problems from R. Serway and J. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1, chapter 2, and from the course notes.`,
}

const es: typeof en = {
  lead: String.raw`Si se suelta un cuerpo desde el reposo y el aire no estorba, cae con la misma aceleración constante \(g\) sea cual sea su tamaño, forma o masa. La caída libre es por eso una variante de la invariante: parte del reposo y tiene \(a = g\). El curso la escribe con la altura de caída \(H\) y la rapidez \(V\), ambas medidas hacia abajo, y esa es la notación que se usa aquí; escribe cualquiera de ellas, o la altura de un edificio, y el laboratorio encuentra el resto.`,
  invariantTitle: 'La invariante de la caída libre',
  invariantLead: String.raw`Con \(V_o = 0\) y \(a = g\) la invariante conserva cuatro magnitudes, \(H\), \(V\), \(t\) y \(g\), relacionadas por cuatro ecuaciones, cada una de las cuales deja por fuera a una de ellas. Con \(g\) conocida, un solo dato fija toda la caída.`,
  invariantNote: String.raw`La relación \((y)\) ubica al cuerpo sobre el suelo cuando se suelta desde una altura \(h_0\), y \((\text{MU})\) sigue a un acompañante que se mueve uniformemente durante la caída, como el caballo del problema del vaquero.`,
  graphsLead: String.raw`\(H(t)\) crece como \(t^2\), \(V(t)\) como \(t\) y la aceleración es la misma en cada instante. Arrastra sobre una gráfica para recorrer la caída.`,
  eventsLead: 'Momentos de la caída por los que suelen preguntar los enunciados.',
  unknownG: 'g es desconocida (otro planeta)',
  whyY: 'La altura sobre el suelo es la altura inicial menos lo que ha caído: {eq}.',
  whyMU: 'Mientras el cuerpo cae, el acompañante se mueve uniformemente durante el mismo tiempo t: {eq}. El tiempo es el vínculo entre ambos movimientos.',
  variantTitle: 'Variante: caída libre',
  variantNote: 'Aplicando a la invariante las condiciones de la caída libre: parte del reposo (Vo = 0) y la aceleración es g, positiva porque la rapidez aumenta. H se mide hacia abajo desde el punto donde se suelta.',
  plotH: String.raw`Altura de caída \(H(t)\)`,
  plotHNote: 'Media parábola: en intervalos iguales de tiempo recorre distancias en la razón 1 : 3 : 5 : 7…, la ley de los números impares de Galileo.',
  plotV: String.raw`Rapidez \(V(t)\)`,
  plotVNote: 'Una recta de pendiente g; el área sombreada es la altura de caída, {H}.',
  plotA: String.raw`Aceleración \(g\)`,
  plotANote: 'La misma en cada instante, sea cual sea la masa del cuerpo.',
  evEnd: 'Final de la caída',
  evHalf: 'A mitad de la altura',
  evHalfCond: 'La mitad de la altura se recorre en 1/√2 del tiempo total, no en la mitad: al principio el cuerpo va despacio.',
  evOdd: 'Distancias en intervalos iguales',
  evOddCond: 'Dividiendo la caída en cuatro intervalos iguales de tiempo:',
  legendV: 'velocidad',
  legendG: 'aceleración de la gravedad',
  legendGhost: 'posiciones a intervalos iguales de tiempo',
  conditions: {
    free: 'Sin condición extra',
    ground: String.raw`Llega al suelo \((y = 0)\)`,
  },
  query: { t: 'En el instante t =', H: 'Después de caer H =', V: 'Cuando la rapidez es V =' },
  theory: [
    {
      title: 'Todos los cuerpos caen igual',
      body: String.raw`<p>Si un cuerpo cae en el vacío, de modo que el aire no lo afecte, aparece un hecho notable: todos los cuerpos, independientemente de su tamaño, forma o composición, caen con la misma aceleración en la misma región cercana a la superficie de la Tierra. Esta <b>aceleración de caída libre</b> \(g\) vale cerca de \(9.8\ \text{m/s}^2\): la velocidad de un cuerpo que cae aumenta 9.8 m/s cada segundo.</p><p>También actúa sobre los cuerpos que suben: sea que la velocidad apunte hacia arriba o hacia abajo, la aceleración debida a la gravedad siempre apunta hacia abajo.</p>`,
    },
    {
      title: 'La variante de la caída libre',
      body: String.raw`<p>Partiendo de la invariante \(V = V_o + at\), \(V^2 = V_o^2 + 2aS\), \(S = V_o t + \tfrac{at^2}{2}\) y aplicando las condiciones del caso, se suelta desde el reposo (\(V_o = 0\)) y \(a = g\), con la distancia \(S = H\) medida hacia abajo:</p>\[V(t) = g\,t,\qquad V(t)^2 = 2g\,H,\qquad H(t) = \frac{g\,t^2}{2}.\]<p>La aceleración se toma positiva porque la rapidez aumenta, como indica el material de clase.</p>`,
    },
    {
      title: 'Cuatro ecuaciones, cuatro magnitudes',
      body: String.raw`<p>La caída involucra \(H\), \(V\), \(t\) y \(g\), y cada ecuación deja por fuera a una de ellas: \(V = gt\) no tiene \(H\), \(V^2 = 2gH\) no tiene \(t\), \(H = \tfrac12 g t^2\) no tiene \(V\), y \(H = \tfrac12 V t\) no tiene \(g\). En la Tierra \(g\) es conocida, así que basta un dato; en otro planeta hacen falta dos y la caída mide \(g\).</p>`,
    },
    {
      title: 'Galileo y los números impares',
      body: String.raw`<p>Galileo no podía cronometrar directamente una caída libre, así que la hizo más lenta con planos inclinados y encontró que las distancias recorridas en intervalos sucesivos iguales de tiempo crecen como los números impares \(1 : 3 : 5 : 7\ldots\), lo que equivale a decir que la distancia total crece como \(t^2\). Se sigue de \(H = \tfrac12 g t^2\): tras 1, 2, 3, 4 intervalos las distancias están en la razón \(1 : 4 : 9 : 16\), y sus diferencias son los impares.</p>`,
    },
    {
      title: 'Hacia arriba o hacia abajo: el signo de g',
      body: String.raw`<p>Resnick toma el eje \(y\) hacia arriba; entonces la aceleración es \(-g\) (con \(g\) siempre positiva) y un cuerpo que cae tiene desplazamiento y velocidad negativos: \(y = y_0 - \tfrac12 g t^2\), \(v = -gt\). El curso mide \(H\) y \(V\) hacia abajo y las escribe positivas. Ambas descripciones son equivalentes; lo que importa es elegir una y mantenerla durante todo el problema.</p>`,
    },
    {
      title: 'Movimientos que ocurren al mismo tiempo',
      body: String.raw`<p>Mientras un cuerpo cae, todo lo demás sigue moviéndose según su propia ley, y el tiempo es lo que los vincula. Un vaquero que se deja caer desde una rama sobre un caballo al galope cae 3.00 m en \(t = \sqrt{2H/g} = 0.782\ \text{s}\); en ese tiempo un caballo a 10.0 m/s avanza \(d = u\,t = 7.82\ \text{m}\). Esta independencia de los movimientos simultáneos es la clave del movimiento parabólico.</p>`,
    },
    {
      title: 'Medición de g',
      body: String.raw`<p>El valor de \(g\) cambia con la latitud y la altitud (de unos \(9.78\) en el ecuador a \(9.83\ \text{m/s}^2\) en los polos) y con la densidad de la corteza bajo el lugar. El valor estándar es \(g_n = 9.80665\ \text{m/s}^2\). Se puede medir cronometrando una caída libre con fotopuertas, con un péndulo, o lanzando un cuerpo hacia arriba y midiendo cuándo pasa por dos niveles.</p>`,
    },
    {
      title: 'El aire, ignorado',
      body: String.raw`<p>Todo esto supone despreciable la resistencia del aire, lo cual es razonable para una piedra que cae unos metros pero no para una pluma o un paracaidista. Con aire la aceleración disminuye al crecer la rapidez, hasta alcanzar una rapidez terminal; ese caso requiere fuerzas que dependen de la velocidad y se estudia con las leyes de Newton.</p>`,
    },
  ],
  presets: {
    resnick: {
      title: 'Posiciones segundo a segundo',
      source: 'Resnick, problema muestra 2-5',
      text: String.raw`Un cuerpo se deja caer libremente desde el reposo. Determine su posición y su velocidad después de \(1.0\ \text{s}\). Luego usa "consultar un instante" para 2.0, 3.0 y 4.0 s.`,
    },
    cowboy: {
      title: 'Un osado vaquero',
      source: 'Serway 2.43 · material de clase',
      text: String.raw`Un osado vaquero sentado en la rama de un árbol desea caer verticalmente sobre un caballo que galopa bajo el árbol. La rapidez constante del caballo es \(10.0\ \text{m/s}\) y la distancia desde la rama hasta el nivel de la silla de montar es \(3.00\ \text{m}\). (a) ¿Cuál debe ser la distancia horizontal entre la silla y la rama cuando el vaquero haga su movimiento? (b) ¿Durante cuánto tiempo está en el aire?`,
    },
    building: {
      title: 'Desde lo alto de un edificio',
      source: 'Ejemplo propio',
      text: String.raw`Se suelta una piedra desde lo alto de un edificio de \(45.0\ \text{m}\) de altura. ¿Cuánto tarda en llegar al suelo y con qué rapidez lo golpea?`,
    },
    bill: {
      title: 'Atrapar un billete',
      source: 'Serway 2.40',
      text: String.raw`Emily sostiene un billete verticalmente con su centro entre los dedos índice y pulgar de David, quien debe atraparlo después de que ella lo suelte, sin mover su mano hacia abajo. Si su tiempo de reacción es \(0.2\ \text{s}\), ¿tendrá éxito? (El billete mide unos \(15.5\ \text{cm}\), así que su borde superior está \(7.8\ \text{cm}\) por encima de sus dedos.)`,
    },
    cat: {
      title: 'Un gato rueda de un televisor',
      source: 'Serway 2.36',
      text: String.raw`Un gato dormido rueda suavemente de lo alto de una cálida televisión. Si ignora la resistencia del aire, calcule su posición y su velocidad después de \(0.100\ \text{s}\); luego consulta 0.200 s y 0.300 s.`,
    },
    speed: {
      title: '¿Desde qué altura para 20 m/s?',
      source: 'Ejemplo propio',
      text: String.raw`¿Desde qué altura debe soltarse un cuerpo para que llegue al suelo a \(20.0\ \text{m/s}\)? ¿Cuánto dura la caída?`,
    },
    planet: {
      title: 'Caída libre en otro planeta',
      source: 'Ejemplo propio',
      text: String.raw`Un astronauta suelta un martillo desde \(10.0\ \text{m}\) de altura y tarda \(3.51\ \text{s}\) en llegar al suelo. ¿Cuál es la aceleración de la gravedad allí, y con qué rapidez llega? (Marca "g es desconocida".)`,
    },
  },
  source: String.raw`Teoría según R. Resnick, D. Halliday y K. Krane, <em>Física</em>, vol. 1, capítulo 2 (secciones 2-7 a 2-9); problemas de R. Serway y J. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1, capítulo 2, y del material de clase.`,
}

export const freeFall = { en, es }
