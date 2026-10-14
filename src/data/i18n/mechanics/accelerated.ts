// Uniformly accelerated motion (pd.mechanics.accelerated).

const en = {
  lead: String.raw`When the velocity of a body changes by the same amount in every second, its acceleration is constant and the whole motion is governed by a single set of equations: <b>the invariant</b>. Everything else, uniform motion, accelerated motion (MUA), retarded motion (MUR), free fall or a vertical throw, is a <b>variant</b>: the same invariant with the conditions of the case applied. Type the data of any statement, leave empty what it asks for and the laboratory chooses the right equation, isolates the unknown and substitutes the numbers, while the car runs the motion and the graphs show where each equation comes from.`,
  invariantTitle: 'The invariant (constant acceleration)',
  invariantLead: String.raw`Five equations relate the five quantities of a stretch, \(v_0\), \(v\), \(a\), \(t\) and \(\Delta x\). Each one leaves out exactly one of them, so with three data the other two can always be found: pick the equation that does not contain the quantity you neither know nor want (Resnick, table 2-2).`,
  invariantNote: String.raw`Only two of the five equations are independent; the others follow by eliminating a variable. That is why three data are needed and why a fourth one may contradict the rest.`,
  graphsLead: String.raw`The three graphs of the same motion, aligned in time: the slope of \(x(t)\) is \(v\), the slope of \(v(t)\) is \(a\), and the areas run the other way, the area under \(v(t)\) is the displacement and the area under \(a(t)\) the change of velocity. Drag over any graph to move through the motion.`,
  eventsLead: 'Instants that the statements usually ask about, computed from the motion that the data determine.',
  whyDelta: 'The displacement is the change of position, {eq}; it links {u} with the quantities already known.',
  variantMU: 'Variant: uniform motion (MU)',
  variantMUNote: 'With a = 0 the invariant collapses: the velocity never changes and the displacement grows linearly with time.',
  variantMUR: 'Variant: uniformly retarded motion (MUR)',
  variantMURNote: 'Here a is written as a magnitude and the sign goes into the equations: the speed decreases, so the acceleration acts against the motion.',
  variantMUA: 'Variant: uniformly accelerated motion (MUA)',
  variantMUANote: 'The acceleration points along the velocity, so the speed grows; the course takes the acceleration as positive whenever the speed increases.',
  tagOpposed: 'a opposes v',
  tagAlong: 'a along v',
  plotX: String.raw`Position \(x(t)\)`,
  plotXNote: 'A parabola whose slope at each instant is the velocity; the dashed secant has slope {v}, the average velocity of the stretch.',
  plotV: String.raw`Velocity \(v(t)\)`,
  plotVNote: 'A straight line of slope a. The shaded area is the displacement: {dx}.',
  plotA: String.raw`Acceleration \(a(t)\)`,
  plotANote: 'Constant. The area under it is the change of velocity: {dv}.',
  evFinal: 'End of the stretch',
  evStop: 'It stops (v = 0)',
  evStopCond: 'Setting v = 0 in the first equation of the invariant:',
  evReturn: 'Back at the starting point',
  evReturnCond: 'If the acceleration keeps acting, Δx = 0 again at twice the stopping time:',
  evAverage: 'Average velocity',
  evAverageCond: 'With constant acceleration the average velocity is the mean of the initial and final velocities:',
  legendV: 'velocity',
  legendA: 'acceleration',
  legendGhost: 'positions at equal time intervals',
  conditions: {
    free: 'No extra condition',
    fromRest: String.raw`Starts from rest \((v_0 = 0)\)`,
    stops: String.raw`Comes to a stop \((v = 0)\)`,
  },
  query: { t: 'At the instant t =', x: 'When the position is x =', v: 'When the velocity is v =' },
  theory: [
    {
      title: 'Acceleration',
      body: String.raw`<p>Acceleration measures how fast the velocity changes. Over an interval it is the <b>average acceleration</b> \(\bar a = \dfrac{\Delta v}{\Delta t}\); making the interval shrink gives the <b>instantaneous acceleration</b> \(a = \dfrac{dv}{dt}\), the slope of the graph \(v(t)\).</p><p>Its sign says nothing by itself about speeding up: an elevator going up (\(v > 0\)) that brakes has \(a < 0\). The speed grows when \(a\) and \(v\) have the same sign and shrinks when they have opposite signs; the latter is a <b>deceleration</b>.</p>`,
    },
    {
      title: 'From the definition to the invariant',
      body: String.raw`<p>If \(a\) is constant, the average and instantaneous accelerations coincide and \(a = \dfrac{v - v_0}{t - 0}\), so</p>\[v = v_0 + a\,t.\]<p>The graph \(v(t)\) is a straight line, so the average velocity is the mean of its ends, \(\bar v = \tfrac12(v_0 + v)\), and \(\Delta x = \bar v\,t\) gives \(\Delta x = \tfrac12(v_0 + v)\,t\). Replacing \(v\):</p>\[\Delta x = v_0\,t + \tfrac12 a\,t^2.\]<p>Isolating \(t = (v - v_0)/a\) from the first equation and substituting it in the second eliminates time:</p>\[v^2 = v_0^2 + 2a\,\Delta x.\]`,
    },
    {
      title: 'The same result by integration',
      body: String.raw`<p>From \(a = dv/dt\) we have \(dv = a\,dt\); integrating between \(0\) and \(t\) with \(a\) constant, \(\int_{v_0}^{v} dv = \int_0^t a\,dt\), so \(v - v_0 = a\,t\). Doing it again with \(v = dx/dt\):</p>\[\int_{x_0}^{x} dx = \int_0^t (v_0 + a t)\,dt \;\Rightarrow\; x - x_0 = v_0 t + \tfrac12 a t^2.\]<p>Differentiating this result gives back \(v\) and \(a\): the three quantities are tied by derivatives one way and by integrals (areas) the other way.</p>`,
    },
    {
      title: 'Five equations, five unknowns',
      body: String.raw`<p>A stretch with constant acceleration involves five quantities, and each equation of the invariant leaves out one of them:</p><ul><li>\(v = v_0 + at\) has no \(\Delta x\)</li><li>\(\Delta x = v_0 t + \tfrac12 a t^2\) has no \(v\)</li><li>\(v^2 = v_0^2 + 2a\Delta x\) has no \(t\)</li><li>\(\Delta x = \tfrac12(v_0 + v)t\) has no \(a\)</li><li>\(\Delta x = vt - \tfrac12 a t^2\) has no \(v_0\)</li></ul><p>To find an unknown, use the equation that contains it and lacks the other unknown. When several parts are independent, go back to the original data rather than to a result you computed before, so that an error does not propagate.</p>`,
    },
    {
      title: 'The variant: MU, MUA and MUR',
      body: String.raw`<p>In the course notes each case is obtained by <b>applying the conditions of the variant to the invariant</b>. If \(a = 0\) we get uniform motion, \(V = V_o\), \(S = V_o t\). If the speed grows we have MUA, \(V = V_o + at\), \(V^2 = V_o^2 + 2aS\), \(S = V_o t + \tfrac{at^2}{2}\). If it decreases we have MUR, with the same equations and the sign of \(a\) changed: \(V = V_o - at\), \(V^2 = V_o^2 - 2aS\), \(S = V_o t - \tfrac{at^2}{2}\), where \(a\) is the magnitude.</p><p>The laboratory works with signed quantities (a single positive direction), which is equivalent and avoids having to decide the sign beforehand.</p>`,
    },
    {
      title: 'Origin, positive direction and signs',
      body: String.raw`<p>Before writing any equation choose an origin and a positive direction, and keep them for the whole problem. Displacements, velocities and accelerations that point the positive way are positive and the others negative. Usually \(x_0 = 0\) is taken where the stretch begins, since only the difference \(x - x_0\) appears in the equations.</p><p>A negative result is not an error: it says the quantity points the other way. If you assume the motion goes to the right and obtain \(a < 0\), the body is braking.</p>`,
    },
    {
      title: 'Reading the graphs',
      body: String.raw`<p>For constant acceleration \(x(t)\) is a parabola, \(v(t)\) a straight line and \(a(t)\) a horizontal line. The slope of each graph is the next quantity (\(v = dx/dt\), \(a = dv/dt\)) and the area under each one is the change of the previous quantity: the area under \(v(t)\) between two instants is the displacement, counted negative below the axis, and the area under \(a(t)\) is \(\Delta v\).</p><p>A motion diagram, the positions at equal intervals of time, shows the same thing: equally spaced dots for uniform motion, growing gaps when it speeds up and shrinking gaps when it slows down.</p>`,
    },
    {
      title: 'When these equations do not apply',
      body: String.raw`<p>The invariant is valid only while the acceleration is constant. A pendulum, a rocket that burns fuel or a raindrop falling against the air have variable accelerations; then one must go back to \(a = dv/dt\) and integrate. A motion made of several stretches with different constant accelerations is handled stretch by stretch, the final state of one being the initial state of the next, as in the module of motion by stretches below.</p>`,
    },
  ],
  presets: {
    tree: {
      title: 'Braking before a tree',
      source: 'Serway 2.25 · class notes',
      text: String.raw`The driver of a car applies the brakes when he sees a tree blocking the road. The car slows down uniformly with an acceleration of \(-5.60\ \text{m/s}^2\) for \(4.20\ \text{s}\), making straight skid marks \(62.4\ \text{m}\) long that end at the tree. With what speed does the car hit the tree?`,
    },
    porsche: {
      title: 'Braking a Porsche',
      source: 'Resnick, sample problem 2-3',
      text: String.raw`You brake your Porsche from \(85\ \text{km/h}\) to \(45\ \text{km/h}\) over a distance of \(105\ \text{m}\). (a) What is the acceleration, assuming it constant? (b) How much time elapsed? Try then the condition "comes to a stop" to answer (c): how long it would take to stop and what extra distance it would cover.`,
    },
    jet: {
      title: 'A jet landing on an island',
      source: 'Serway 2.23',
      text: String.raw`A jet plane approaches for landing with a speed of \(100\ \text{m/s}\) and an acceleration of maximum magnitude \(5.00\ \text{m/s}^2\) as it comes to rest. (a) From the instant it touches the runway, what is the minimum time it needs to stop? (b) Can it land at a small tropical island airport whose runway is \(0.800\ \text{km}\) long?`,
    },
    truck: {
      title: 'A truck slowing down',
      source: 'Serway 2.20',
      text: String.raw`A truck covers \(40.0\ \text{m}\) in \(8.50\ \text{s}\) while smoothly slowing down to a final speed of \(2.80\ \text{m/s}\). (a) Find its original speed. (b) Find its acceleration.`,
    },
    glider: {
      title: 'An object that turns back',
      source: 'Serway 2.21',
      text: String.raw`An object moving with uniform acceleration has a velocity of \(12.0\ \text{cm/s}\) in the positive x direction when its x coordinate is \(3.00\ \text{cm}\). If its x coordinate \(2.00\ \text{s}\) later is \(-5.00\ \text{cm}\), what is its acceleration?`,
    },
    electron: {
      title: 'An electron in a cathode-ray tube',
      source: 'Serway 2.29',
      text: String.raw`An electron in a cathode-ray tube accelerates from a speed of \(2.00\times10^4\ \text{m/s}\) to \(6.00\times10^6\ \text{m/s}\) over \(1.50\ \text{cm}\). (a) In what time interval does it travel these \(1.50\ \text{cm}\)? (b) What is its acceleration?`,
    },
    airAcc: {
      title: 'A portion of air in a tube',
      source: 'Serway 2.19',
      text: String.raw`A portion of air moves in a straight tube with a constant acceleration of \(4.00\ \text{m/s}^2\) and has a velocity of \(13.0\ \text{m/s}\) at 10:05:00 a.m. What is its velocity at 10:05:02.5 a.m.? Change the time to answer the other parts (10:05:01, 10:05:04, and even 10:04:59 with \(t = -1\ \text{s}\)).`,
    },
    sled: {
      title: 'Colonel Stapp’s rocket sled',
      source: 'Serway 2.27',
      text: String.raw`Colonel John P. Stapp rode a rocket sled that moved at \(632\ \text{mi/h}\); he and the sled came to a safe stop in \(1.40\ \text{s}\). Determine the (negative) acceleration he experienced and the distance he travelled during this braking.`,
    },
  },
  encounter: {
    title: 'Chases and encounters',
    lead: String.raw`Two bodies on the same road, each one with its own law of the invariant. They meet when \(x_A(t) = x_B(t)\): by equations it is a quadratic in \(t\) inside every interval where both laws stay fixed, and graphically it is the crossing of the two curves \(x(t)\). A body can start late or change its motion in stretches.`,
    presets: {
      police: {
        title: 'Watch the speed limit!',
        text: String.raw`A car travelling at a constant \(45.0\ \text{m/s}\) passes a trooper hidden behind a billboard. One second later the trooper sets off in pursuit with a constant acceleration of \(3.00\ \text{m/s}^2\). How long does it take her to overtake the car? (Serway, example 2.8)`,
      },
      kathyStan: {
        title: 'Kathy and Stan',
        text: String.raw`Kathy’s sports car accelerates at \(4.90\ \text{m/s}^2\); Stan’s at \(3.50\ \text{m/s}^2\). Both start from rest, but Stan leaves \(1.00\ \text{s}\) before Kathy. Find when Kathy overtakes Stan, the distance she travels and the speeds of both cars at that instant. (Serway 2.59)`,
      },
      speedySue: {
        title: 'Speedy Sue in the tunnel',
        text: String.raw`Speedy Sue, driving at \(30.0\ \text{m/s}\), enters a one-lane tunnel and sees a slow van \(155\ \text{m}\) ahead moving at \(5.00\ \text{m/s}\). She brakes, but can only decelerate at \(2.00\ \text{m/s}^2\). Will there be a collision? If so, where and when? (Serway 2.32)`,
      },
      bikeCar: {
        title: 'Green light: car against bicycle',
        text: String.raw`When the light turns green a car speeds up from rest to \(50.0\ \text{mi/h}\) (22.4 m/s) at \(9.00\ \text{mi/h·s}\) (4.02 m/s²), and a cyclist from rest to \(20.0\ \text{mi/h}\) (8.94 m/s) at \(13.0\ \text{mi/h·s}\) (5.81 m/s²); each then keeps its cruising speed. For how long is the bicycle ahead of the car? (Serway 2.33)`,
      },
    },
  },
  phases: {
    title: 'Motion by stretches',
    lead: String.raw`Real motions are rarely a single stretch: a car speeds up, cruises and brakes. Each stretch has its own constant acceleration and starts where the previous one ended. Reading a \(v\)–\(t\) graph is exactly this: the slope of each segment is the acceleration and the area of each trapezoid is the displacement.`,
    presets: {
      performance: {
        title: 'Performance data of a car',
        text: String.raw`The \(v\)–\(t\) graph of a car rises from rest to \(50\ \text{m/s}\) at \(t = 15\ \text{s}\) (point a), stays constant until \(t = 40\ \text{s}\) (b) and drops to zero at \(t = 50\ \text{s}\) (c). (a) Total distance as the area under the graph. (b) Distance between \(t = 10\) and \(40\ \text{s}\). (c) The graph \(a(t)\). (d) The law \(x(t)\) of each phase. (e) Average velocity from 0 to 50 s. (Serway 2.22)`,
      },
      accelGraph: {
        title: 'From an acceleration graph',
        text: String.raw`A particle starts from rest and accelerates at \(2.00\ \text{m/s}^2\) for 10 s, moves at constant velocity for 5 s and then accelerates at \(-3.00\ \text{m/s}^2\) for 5 s. Find its speed at \(t = 10\) and \(20\ \text{s}\) and the distance travelled in the first 20 s. (Serway 2.11)`,
      },
      startStop: {
        title: 'Start, cruise and brake',
        text: String.raw`A car is at rest for 2 s, accelerates at \(3\ \text{m/s}^2\) for 5 s, moves at constant velocity for 10 s and brakes uniformly to rest in 3 s, the idealised motion of Resnick, figure 2-16.`,
      },
      reverse: {
        title: 'Displacement is not distance',
        text: String.raw`A body moving at \(8\ \text{m/s}\) decelerates at \(2\ \text{m/s}^2\) for 6 s and then keeps its velocity for 3 s. It stops at \(t = 4\ \text{s}\) and comes back: compare the displacement with the distance travelled and the average velocity with the average speed.`,
      },
    },
  },
  source: String.raw`Theory after R. Resnick, D. Halliday and K. Krane, <em>Física</em>, vol. 1, chapter 2 (sections 2-5 and 2-6); problems from R. Serway and J. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1, chapter 2, and from the course notes on motion in one dimension.`,
}

const es: typeof en = {
  lead: String.raw`Cuando la velocidad de un cuerpo cambia lo mismo en cada segundo, su aceleración es constante y todo el movimiento queda gobernado por un único juego de ecuaciones: <b>la invariante</b>. Todo lo demás, movimiento uniforme, uniformemente acelerado (MUA), retardado (MUR), caída libre o lanzamiento vertical, es una <b>variante</b>: la misma invariante con las condiciones del caso aplicadas. Escribe los datos de cualquier enunciado, deja vacío lo que pide y el laboratorio elige la ecuación adecuada, despeja la incógnita y sustituye los números, mientras el carro recorre el movimiento y las gráficas muestran de dónde sale cada ecuación.`,
  invariantTitle: 'La invariante (aceleración constante)',
  invariantLead: String.raw`Cinco ecuaciones relacionan las cinco magnitudes de un tramo, \(v_0\), \(v\), \(a\), \(t\) y \(\Delta x\). Cada una deja por fuera exactamente una, así que con tres datos siempre se hallan las otras dos: se toma la ecuación que no contiene la magnitud que ni conoces ni buscas (Resnick, tabla 2-2).`,
  invariantNote: String.raw`Solo dos de las cinco ecuaciones son independientes; las demás salen de eliminar una variable. Por eso se necesitan tres datos, y por eso un cuarto dato puede contradecir a los demás.`,
  graphsLead: String.raw`Las tres gráficas del mismo movimiento, alineadas en el tiempo: la pendiente de \(x(t)\) es \(v\), la pendiente de \(v(t)\) es \(a\), y las áreas van en sentido contrario: el área bajo \(v(t)\) es el desplazamiento y el área bajo \(a(t)\) el cambio de velocidad. Arrastra sobre cualquier gráfica para recorrer el movimiento.`,
  eventsLead: 'Instantes por los que suelen preguntar los enunciados, calculados a partir del movimiento que determinan los datos.',
  whyDelta: 'El desplazamiento es el cambio de posición, {eq}; relaciona {u} con las magnitudes ya conocidas.',
  variantMU: 'Variante: movimiento uniforme (MU)',
  variantMUNote: 'Con a = 0 la invariante se reduce: la velocidad nunca cambia y el desplazamiento crece linealmente con el tiempo.',
  variantMUR: 'Variante: movimiento uniformemente retardado (MUR)',
  variantMURNote: 'Aquí a se escribe como magnitud y el signo va en las ecuaciones: la rapidez disminuye, así que la aceleración actúa contra el movimiento.',
  variantMUA: 'Variante: movimiento uniformemente acelerado (MUA)',
  variantMUANote: 'La aceleración apunta en el sentido de la velocidad, así que la rapidez crece; en el curso la aceleración se toma positiva cuando la rapidez aumenta.',
  tagOpposed: 'a opuesta a v',
  tagAlong: 'a en el sentido de v',
  plotX: String.raw`Posición \(x(t)\)`,
  plotXNote: 'Una parábola cuya pendiente en cada instante es la velocidad; la secante punteada tiene pendiente {v}, la velocidad media del tramo.',
  plotV: String.raw`Velocidad \(v(t)\)`,
  plotVNote: 'Una recta de pendiente a. El área sombreada es el desplazamiento: {dx}.',
  plotA: String.raw`Aceleración \(a(t)\)`,
  plotANote: 'Constante. El área bajo ella es el cambio de velocidad: {dv}.',
  evFinal: 'Final del tramo',
  evStop: 'Se detiene (v = 0)',
  evStopCond: 'Haciendo v = 0 en la primera ecuación de la invariante:',
  evReturn: 'Regresa al punto de partida',
  evReturnCond: 'Si la aceleración sigue actuando, Δx vuelve a ser 0 al doble del tiempo de frenado:',
  evAverage: 'Velocidad media',
  evAverageCond: 'Con aceleración constante la velocidad media es el promedio de las velocidades inicial y final:',
  legendV: 'velocidad',
  legendA: 'aceleración',
  legendGhost: 'posiciones a intervalos iguales de tiempo',
  conditions: {
    free: 'Sin condición extra',
    fromRest: String.raw`Parte del reposo \((v_0 = 0)\)`,
    stops: String.raw`Se detiene \((v = 0)\)`,
  },
  query: { t: 'En el instante t =', x: 'Cuando la posición es x =', v: 'Cuando la velocidad es v =' },
  theory: [
    {
      title: 'La aceleración',
      body: String.raw`<p>La aceleración mide qué tan rápido cambia la velocidad. En un intervalo es la <b>aceleración media</b> \(\bar a = \dfrac{\Delta v}{\Delta t}\); al encoger el intervalo se obtiene la <b>aceleración instantánea</b> \(a = \dfrac{dv}{dt}\), la pendiente de la gráfica \(v(t)\).</p><p>Su signo por sí solo no dice si el cuerpo acelera: un elevador que sube (\(v > 0\)) y frena tiene \(a < 0\). La rapidez crece cuando \(a\) y \(v\) tienen el mismo signo y disminuye cuando tienen signos opuestos; esto último es una <b>desaceleración</b>.</p>`,
    },
    {
      title: 'De la definición a la invariante',
      body: String.raw`<p>Si \(a\) es constante, las aceleraciones media e instantánea coinciden y \(a = \dfrac{v - v_0}{t - 0}\), de donde</p>\[v = v_0 + a\,t.\]<p>La gráfica \(v(t)\) es una recta, así que la velocidad media es el promedio de sus extremos, \(\bar v = \tfrac12(v_0 + v)\), y \(\Delta x = \bar v\,t\) da \(\Delta x = \tfrac12(v_0 + v)\,t\). Reemplazando \(v\):</p>\[\Delta x = v_0\,t + \tfrac12 a\,t^2.\]<p>Despejando \(t = (v - v_0)/a\) de la primera ecuación y reemplazándolo en la segunda se elimina el tiempo:</p>\[v^2 = v_0^2 + 2a\,\Delta x.\]`,
    },
    {
      title: 'El mismo resultado integrando',
      body: String.raw`<p>De \(a = dv/dt\) se tiene \(dv = a\,dt\); integrando entre \(0\) y \(t\) con \(a\) constante, \(\int_{v_0}^{v} dv = \int_0^t a\,dt\), así que \(v - v_0 = a\,t\). Repitiendo con \(v = dx/dt\):</p>\[\int_{x_0}^{x} dx = \int_0^t (v_0 + a t)\,dt \;\Rightarrow\; x - x_0 = v_0 t + \tfrac12 a t^2.\]<p>Derivando este resultado se recuperan \(v\) y \(a\): las tres magnitudes se relacionan por derivadas en un sentido y por integrales (áreas) en el otro.</p>`,
    },
    {
      title: 'Cinco ecuaciones, cinco incógnitas',
      body: String.raw`<p>Un tramo con aceleración constante involucra cinco magnitudes, y cada ecuación de la invariante deja por fuera una de ellas:</p><ul><li>\(v = v_0 + at\) no tiene \(\Delta x\)</li><li>\(\Delta x = v_0 t + \tfrac12 a t^2\) no tiene \(v\)</li><li>\(v^2 = v_0^2 + 2a\Delta x\) no tiene \(t\)</li><li>\(\Delta x = \tfrac12(v_0 + v)t\) no tiene \(a\)</li><li>\(\Delta x = vt - \tfrac12 a t^2\) no tiene \(v_0\)</li></ul><p>Para hallar una incógnita se usa la ecuación que la contiene y a la que le falta la otra incógnita. Cuando hay varias partes independientes, conviene volver a los datos originales y no a un resultado calculado antes, para que un error no se propague.</p>`,
    },
    {
      title: 'La variante: MU, MUA y MUR',
      body: String.raw`<p>En el material de clase cada caso se obtiene <b>aplicando las condiciones de la variante a la invariante</b>. Si \(a = 0\) queda el movimiento uniforme, \(V = V_o\), \(S = V_o t\). Si la rapidez aumenta se tiene el MUA, \(V = V_o + at\), \(V^2 = V_o^2 + 2aS\), \(S = V_o t + \tfrac{at^2}{2}\). Si disminuye se tiene el MUR, con las mismas ecuaciones y el signo de \(a\) cambiado: \(V = V_o - at\), \(V^2 = V_o^2 - 2aS\), \(S = V_o t - \tfrac{at^2}{2}\), donde \(a\) es la magnitud.</p><p>El laboratorio trabaja con magnitudes con signo (un único sentido positivo), lo cual es equivalente y evita decidir el signo de antemano.</p>`,
    },
    {
      title: 'Origen, sentido positivo y signos',
      body: String.raw`<p>Antes de escribir cualquier ecuación se elige un origen y un sentido positivo, y se mantienen durante todo el problema. Desplazamientos, velocidades y aceleraciones que apuntan en el sentido positivo son positivos y los demás negativos. Normalmente se toma \(x_0 = 0\) donde empieza el tramo, ya que en las ecuaciones solo aparece la diferencia \(x - x_0\).</p><p>Un resultado negativo no es un error: dice que la magnitud apunta hacia el otro lado. Si supones que el movimiento va hacia la derecha y obtienes \(a < 0\), el cuerpo está frenando.</p>`,
    },
    {
      title: 'Cómo leer las gráficas',
      body: String.raw`<p>Con aceleración constante \(x(t)\) es una parábola, \(v(t)\) una recta y \(a(t)\) una recta horizontal. La pendiente de cada gráfica es la magnitud siguiente (\(v = dx/dt\), \(a = dv/dt\)) y el área bajo cada una es el cambio de la anterior: el área bajo \(v(t)\) entre dos instantes es el desplazamiento, negativa por debajo del eje, y el área bajo \(a(t)\) es \(\Delta v\).</p><p>Un diagrama de movimiento, las posiciones a intervalos iguales de tiempo, muestra lo mismo: puntos equiespaciados en el movimiento uniforme, separaciones crecientes cuando acelera y decrecientes cuando frena.</p>`,
    },
    {
      title: 'Cuándo no aplican estas ecuaciones',
      body: String.raw`<p>La invariante vale solo mientras la aceleración sea constante. Un péndulo, un cohete que quema combustible o una gota de lluvia que cae contra el aire tienen aceleraciones variables; entonces hay que volver a \(a = dv/dt\) e integrar. Un movimiento hecho de varios tramos con distintas aceleraciones constantes se resuelve tramo por tramo, siendo el estado final de uno el estado inicial del siguiente, como en el módulo de movimiento por tramos más abajo.</p>`,
    },
  ],
  presets: {
    tree: {
      title: 'Frenado ante un árbol',
      source: 'Serway 2.25 · material de clase',
      text: String.raw`El conductor de un automóvil aplica los frenos cuando ve un árbol que bloquea el camino. El automóvil frena uniformemente con una aceleración de \(-5.60\ \text{m/s}^2\) durante \(4.20\ \text{s}\), y hace marcas de derrape rectas de \(62.4\ \text{m}\) de largo que terminan en el árbol. ¿Con qué rapidez el automóvil golpea el árbol?`,
    },
    porsche: {
      title: 'Frenando un Porsche',
      source: 'Resnick, problema muestra 2-3',
      text: String.raw`Usted frena su Porsche desde \(85\ \text{km/h}\) hasta \(45\ \text{km/h}\) en una distancia de \(105\ \text{m}\). (a) ¿Cuál es la aceleración, suponiéndola constante? (b) ¿Cuánto tiempo transcurrió? Prueba luego la condición "se detiene" para responder (c): cuánto tardaría en detenerse y qué distancia adicional recorrería.`,
    },
    jet: {
      title: 'Un jet que aterriza en una isla',
      source: 'Serway 2.23',
      text: String.raw`Un avión jet se aproxima para aterrizar con una rapidez de \(100\ \text{m/s}\) y una aceleración de magnitud máxima \(5.00\ \text{m/s}^2\) conforme llega al reposo. (a) Desde el instante en que toca la pista, ¿cuál es el intervalo de tiempo mínimo necesario para detenerse? (b) ¿Puede aterrizar en el aeropuerto de una pequeña isla tropical cuya pista mide \(0.800\ \text{km}\)?`,
    },
    truck: {
      title: 'Un camión que frena',
      source: 'Serway 2.20',
      text: String.raw`Un camión cubre \(40.0\ \text{m}\) en \(8.50\ \text{s}\) mientras frena de manera uniforme a una rapidez final de \(2.80\ \text{m/s}\). (a) Encuentre su rapidez original. (b) Encuentre su aceleración.`,
    },
    glider: {
      title: 'Un objeto que se devuelve',
      source: 'Serway 2.21',
      text: String.raw`Un objeto que se mueve con aceleración uniforme tiene una velocidad de \(12.0\ \text{cm/s}\) en la dirección x positiva cuando su coordenada x es \(3.00\ \text{cm}\). Si su coordenada x \(2.00\ \text{s}\) después es \(-5.00\ \text{cm}\), ¿cuál es su aceleración?`,
    },
    electron: {
      title: 'Un electrón en un tubo de rayos catódicos',
      source: 'Serway 2.29',
      text: String.raw`Un electrón en un tubo de rayos catódicos acelera desde una rapidez de \(2.00\times10^4\ \text{m/s}\) a \(6.00\times10^6\ \text{m/s}\) en \(1.50\ \text{cm}\). (a) ¿En qué intervalo de tiempo recorre estos \(1.50\ \text{cm}\)? (b) ¿Cuál es su aceleración?`,
    },
    airAcc: {
      title: 'Una porción de aire en un tubo',
      source: 'Serway 2.19',
      text: String.raw`Una porción de aire se mueve en un tubo recto con aceleración constante de \(4.00\ \text{m/s}^2\) y tiene una velocidad de \(13.0\ \text{m/s}\) a las 10:05:00 a.m. ¿Cuál es su velocidad a las 10:05:02.5 a.m.? Cambia el tiempo para responder las demás partes (10:05:01, 10:05:04 e incluso 10:04:59, con \(t = -1\ \text{s}\)).`,
    },
    sled: {
      title: 'El trineo cohete del coronel Stapp',
      source: 'Serway 2.27',
      text: String.raw`El coronel John P. Stapp viajó en un trineo impulsado por cohete que se movía a \(632\ \text{mi/h}\); él y el trineo llegaron a un alto seguro en \(1.40\ \text{s}\). Determine la aceleración (negativa) que experimentó y la distancia que recorrió durante este frenado.`,
    },
  },
  encounter: {
    title: 'Persecuciones y encuentros',
    lead: String.raw`Dos cuerpos en la misma vía, cada uno con su propia ley de la invariante. Se encuentran cuando \(x_A(t) = x_B(t)\): por ecuaciones es una cuadrática en \(t\) dentro de cada intervalo donde ambas leyes se mantienen, y gráficamente es el cruce de las dos curvas \(x(t)\). Un cuerpo puede partir tarde o cambiar su movimiento por tramos.`,
    presets: {
      police: {
        title: '¡Observe el límite de rapidez!',
        text: String.raw`Un automóvil que viaja con rapidez constante de \(45.0\ \text{m/s}\) pasa por donde está un patrullero oculto detrás de un anuncio. Un segundo después, el patrullero parte en su persecución con aceleración constante de \(3.00\ \text{m/s}^2\). ¿Cuánto tarda en alcanzar al automóvil? (Serway, ejemplo 2.8)`,
      },
      kathyStan: {
        title: 'Kathy y Stan',
        text: String.raw`El automóvil deportivo de Kathy acelera a \(4.90\ \text{m/s}^2\); el de Stan a \(3.50\ \text{m/s}^2\). Ambos parten del reposo, pero Stan deja la línea de partida \(1.00\ \text{s}\) antes que Kathy. Encuentre cuándo Kathy alcanza a Stan, la distancia que recorre y las rapideces de ambos en ese instante. (Serway 2.59)`,
      },
      speedySue: {
        title: 'Speedy Sue en el túnel',
        text: String.raw`Speedy Sue, que conduce a \(30.0\ \text{m/s}\), entra a un túnel de un carril y observa una camioneta lenta \(155\ \text{m}\) adelante que se mueve a \(5.00\ \text{m/s}\). Aplica los frenos, pero solo puede desacelerar a \(2.00\ \text{m/s}^2\). ¿Habrá una colisión? Si es así, ¿dónde y cuándo? (Serway 2.32)`,
      },
      bikeCar: {
        title: 'Luz verde: automóvil contra bicicleta',
        text: String.raw`Cuando el semáforo se pone en verde, un automóvil aumenta su rapidez desde el reposo a \(50.0\ \text{mi/h}\) (22.4 m/s) con \(9.00\ \text{mi/h·s}\) (4.02 m/s²), y un ciclista desde el reposo a \(20.0\ \text{mi/h}\) (8.94 m/s) con \(13.0\ \text{mi/h·s}\) (5.81 m/s²); luego cada uno mantiene su rapidez de crucero. ¿Durante cuánto tiempo va la bicicleta adelante del automóvil? (Serway 2.33)`,
      },
    },
  },
  phases: {
    title: 'Movimiento por tramos',
    lead: String.raw`Los movimientos reales casi nunca son un solo tramo: un automóvil acelera, viaja a velocidad constante y frena. Cada tramo tiene su propia aceleración constante y empieza donde terminó el anterior. Leer una gráfica \(v\)–\(t\) es exactamente esto: la pendiente de cada segmento es la aceleración y el área de cada trapecio el desplazamiento.`,
    presets: {
      performance: {
        title: 'Datos de desempeño de un automóvil',
        text: String.raw`La gráfica \(v\)–\(t\) de un automóvil sube desde el reposo hasta \(50\ \text{m/s}\) en \(t = 15\ \text{s}\) (punto a), se mantiene constante hasta \(t = 40\ \text{s}\) (b) y baja a cero en \(t = 50\ \text{s}\) (c). (a) Distancia total como área bajo la gráfica. (b) Distancia entre \(t = 10\) y \(40\ \text{s}\). (c) La gráfica \(a(t)\). (d) La ley \(x(t)\) de cada fase. (e) Velocidad promedio entre 0 y 50 s. (Serway 2.22)`,
      },
      accelGraph: {
        title: 'A partir de una gráfica de aceleración',
        text: String.raw`Una partícula parte del reposo y acelera a \(2.00\ \text{m/s}^2\) durante 10 s, se mueve con velocidad constante durante 5 s y luego acelera a \(-3.00\ \text{m/s}^2\) durante 5 s. Determine su rapidez en \(t = 10\) y \(20\ \text{s}\) y la distancia recorrida en los primeros 20 s. (Serway 2.11)`,
      },
      startStop: {
        title: 'Arranque, crucero y frenado',
        text: String.raw`Un automóvil está en reposo durante 2 s, acelera a \(3\ \text{m/s}^2\) durante 5 s, avanza a velocidad constante durante 10 s y frena uniformemente hasta detenerse en 3 s: el movimiento idealizado de la figura 2-16 de Resnick.`,
      },
      reverse: {
        title: 'Desplazamiento no es distancia',
        text: String.raw`Un cuerpo que se mueve a \(8\ \text{m/s}\) desacelera a \(2\ \text{m/s}^2\) durante 6 s y luego mantiene su velocidad durante 3 s. Se detiene en \(t = 4\ \text{s}\) y se devuelve: compara el desplazamiento con la distancia recorrida y la velocidad media con la rapidez media.`,
      },
    },
  },
  source: String.raw`Teoría según R. Resnick, D. Halliday y K. Krane, <em>Física</em>, vol. 1, capítulo 2 (secciones 2-5 y 2-6); problemas de R. Serway y J. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1, capítulo 2, y del material de clase de movimiento en una dimensión.`,
}

export const accelerated = { en, es }
