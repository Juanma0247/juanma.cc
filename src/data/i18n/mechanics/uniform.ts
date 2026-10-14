// Uniform motion (pd.mechanics.uniform).

const en = {
  lead: String.raw`A body in uniform motion covers equal displacements in equal intervals of time: its velocity never changes. It is the simplest variant of the invariant, the one obtained with \(a = 0\), and it is enough to describe a tortoise heading for the finish line, the sound of an echo or two cars on a highway. Here you can solve any stretch of uniform motion, average several stretches and find, by equations and graphically, when two bodies meet.`,
  invariantTitle: 'The invariant with a = 0',
  invariantLead: String.raw`With no acceleration the five equations of the invariant reduce to a single relation between displacement, velocity and time, plus the definition of displacement. Two data fix the third quantity.`,
  invariantNote: String.raw`\(\Delta x = v\,t\) is the equation of a straight line in the plane \(t\)–\(x\): \(x = x_0 + v\,t\), with slope \(v\) and intercept \(x_0\).`,
  graphsLead: String.raw`In uniform motion \(x(t)\) is a straight line and \(v(t)\) a horizontal one; the area of the rectangle under \(v(t)\) is the displacement.`,
  eventsLead: 'Instants that follow from the motion fixed by the data.',
  whyDelta: 'The displacement is the change of position, {eq}.',
  variantTitle: 'Variant of the course: uniform motion',
  variantNote: 'Applying a = 0 to the invariant: the first equation says the velocity never changes, the second that the displacement grows in proportion to time, and the third becomes an identity.',
  plotX: String.raw`Position \(x(t)\)`,
  plotXNote: 'A straight line: its slope is the velocity, {v}.',
  plotV: String.raw`Velocity \(v(t)\)`,
  plotVNote: 'A horizontal line; the rectangle under it is the displacement, {dx}.',
  evFinal: 'End of the stretch',
  evOrigin: 'It passes through the origin',
  legendV: 'velocity (constant)',
  legendGhost: 'positions at equal time intervals: equally spaced',
  query: { t: 'At the instant t =', x: 'When the position is x =' },
  theory: [
    {
      title: 'The particle model',
      body: String.raw`<p>To describe a motion we treat the body as a <b>particle</b>: a point with mass and no size, so that all its parts move in exactly the same way. A train, a tortoise or an electron are particles as long as we ignore their rotations and vibrations. In one dimension its state is given by a single coordinate \(x\), measured from a chosen origin along an axis with a chosen positive direction.</p>`,
    },
    {
      title: 'Position, displacement and distance',
      body: String.raw`<p>The <b>displacement</b> between two instants is the change of position, \(\Delta x = x_f - x_i\); it has a sign and it ignores what happened in between. The <b>distance</b> travelled is the length of the path actually covered, always positive. Someone who walks 100 m and comes back has a displacement of zero and a distance of 200 m: the average velocity of a car over a full lap of a racing circuit is zero.</p>`,
    },
    {
      title: 'Average velocity and average speed',
      body: String.raw`<p>The <b>average velocity</b> over an interval is the displacement divided by the elapsed time,</p>\[\bar v = \frac{\Delta x}{\Delta t} = \frac{x_2 - x_1}{t_2 - t_1},\]<p>the slope of the straight line that joins the two points of the graph \(x(t)\). The <b>average speed</b> is the distance divided by the time; it is never negative and it is at least the magnitude of the average velocity.</p>`,
    },
    {
      title: 'Constant velocity',
      body: String.raw`<p>When the velocity is constant, the average velocity of every interval is the same number \(v\), and</p>\[x(t) = x_0 + v\,t.\]<p>The graph \(x(t)\) is a straight line of slope \(v\) (positive if it moves towards increasing \(x\)), and \(v(t)\) is a horizontal line. Equal times give equal displacements, which is what the equally spaced dots of the motion diagram show.</p>`,
    },
    {
      title: 'Uniform motion as a variant',
      body: String.raw`<p>The course obtains it by <b>applying the conditions of uniform motion to the invariant</b> \(V(t) = V_o + at\), \(V^2 = V_o^2 + 2aS\), \(S = V_o t + \tfrac{at^2}{2}\). With \(a = 0\):</p>\[V(t) = V_o,\qquad S(t) = V_o\,t,\qquad V(t)^2 = V_o^2.\]<p>Nothing new has to be memorised: the general equations already contain this case.</p>`,
    },
    {
      title: 'Encounters: by equations and graphically',
      body: String.raw`<p>Two bodies meet when they are at the same place at the same time. Writing the law of each one, \(x_A(t)\) and \(x_B(t)\), the meeting is the solution of \(x_A(t) = x_B(t)\). Graphically it is the crossing of the two lines in the plane \(t\)–\(x\); if one body starts late or stops for a while, its line is broken into segments and each segment is studied separately.</p>`,
    },
    {
      title: 'The average is not the mean',
      body: String.raw`<p>A cyclist who climbs at 5 km/h and descends at 20 km/h does not average 12.5 km/h unless both stretches last the same time. With equal lengths \(L\) the times are \(L/5\) and \(L/20\) and</p>\[\bar v = \frac{2L}{L/5 + L/20} = 8\ \text{km/h},\]<p>the harmonic mean: the slow stretch lasts longer and weighs more in the average.</p>`,
    },
  ],
  presets: {
    tortoise: {
      title: 'The tortoise heads for the finish',
      source: 'Serway 2.9 · class notes',
      text: String.raw`A tortoise moves steadily at its maximum speed of \(0.200\ \text{m/s}\) towards a finish line \(1.00\ \text{km}\) away. How long does it take?`,
    },
    highway: {
      title: 'A quarter of an hour on the highway',
      source: 'Own example',
      text: String.raw`A car keeps a constant \(90\ \text{km/h}\) for \(15\ \text{min}\). What distance does it cover?`,
    },
    sound: {
      title: 'An echo',
      source: 'Own example',
      text: String.raw`Sound travels in air at \(343\ \text{m/s}\). The echo of a shout comes back after \(2.4\ \text{s}\). How far did the sound travel, and how far is the wall?`,
    },
    backwards: {
      title: 'Moving towards the origin',
      source: 'Own example',
      text: String.raw`A body at \(x_0 = 50\ \text{m}\) moves with a constant velocity of \(-4.00\ \text{m/s}\). Where is it after \(10.0\ \text{s}\)? When does it pass through the origin?`,
    },
    twoPoints: {
      title: 'From two positions',
      source: 'Own example',
      text: String.raw`A particle in uniform motion goes from \(x = -20\ \text{m}\) to \(x = 60\ \text{m}\) in \(16\ \text{s}\). What is its velocity?`,
    },
  },
  average: {
    title: 'Average velocity over several stretches',
    lead: String.raw`When a trip is made of stretches at different constant speeds, the average velocity is the total displacement over the total time, not the mean of the velocities. Give each stretch its velocity and its length or duration.`,
    presets: {
      cyclistLength: {
        title: 'Cyclist: equal lengths',
        text: String.raw`A cyclist rides through a hilly region: uphill at a constant \(5\ \text{km/h}\) and downhill at \(20\ \text{km/h}\). What is the average velocity if the climbs and descents have the same length? (Course workshop, problem 1a.)`,
      },
      cyclistTime: {
        title: 'Cyclist: equal times',
        text: String.raw`The same cyclist, if the time spent uphill equals the time spent downhill. (Course workshop, problem 1b.)`,
      },
      cyclistDouble: {
        title: 'Cyclist: double time uphill',
        text: String.raw`The same cyclist, if the time spent uphill is twice the time spent downhill. (Course workshop, problem 1c.)`,
      },
      walkBack: {
        title: 'There and back',
        text: String.raw`A person walks from A to B at a constant \(5.00\ \text{m/s}\) and comes back from B to A at \(3.00\ \text{m/s}\). (a) What is the average speed of the whole trip? (b) Its average velocity? The distance AB does not matter. (Serway 2.3)`,
      },
      gas: {
        title: 'Out of gas',
        text: String.raw`You drive \(5.2\ \text{mi}\) along a straight road at \(43\ \text{mi/h}\) and run out of gas; you then walk \(1.2\ \text{mi}\) further in \(27\ \text{min}\). What was the average velocity from the start until you reached the gas station? (Resnick, sample problem 2-1)`,
      },
    },
  },
  encounter: {
    title: 'Encounters and races',
    lead: String.raw`Each body follows its own straight line \(x(t)\); where the lines cross, they meet. A body can start late, stop for a while (a stretch with \(v = 0\)) and set off again. With a finish line the module also decides the race and, if a body takes a nap, how long the nap can last for it to tie.`,
    presets: {
      hareTortoise: {
        title: 'The hare and the tortoise',
        text: String.raw`A hare and a tortoise race on a \(1.00\ \text{km}\) course. The tortoise moves steadily at \(0.200\ \text{m/s}\). The hare runs at \(8.00\ \text{m/s}\) for \(0.800\ \text{km}\) and stops to tease the tortoise. How close to the finish can the hare let the tortoise get before resuming the race, which the tortoise wins in a photo finish? (Serway 2.9, class notes: solve it graphically and by equations.)`,
      },
      overtake: {
        title: 'Overtaking on the highway',
        text: String.raw`How long does a car at \(60.0\ \text{km/h}\) take to overtake a car travelling in the same direction at \(40.0\ \text{km/h}\) if their front bumpers are \(100\ \text{m}\) apart? (Serway 4.36)`,
      },
      oncoming: {
        title: 'Two cars approaching',
        text: String.raw`Two cars start at the same time from towns \(3.00\ \text{km}\) apart and drive towards each other at \(72\ \text{km/h}\) and \(108\ \text{km/h}\). When and where do they meet?`,
      },
      lateStart: {
        title: 'The one who leaves later',
        text: String.raw`A runner leaves at \(4.0\ \text{m/s}\); \(30\ \text{s}\) later a second runner leaves the same point at \(6.0\ \text{m/s}\). When and where does the second one catch up?`,
      },
    },
  },
  source: String.raw`Theory after R. Resnick, D. Halliday and K. Krane, <em>Física</em>, vol. 1, chapter 2 (sections 2-1 to 2-4); problems from R. Serway and J. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1, chapters 2 and 4, and from the course notes and workshop.`,
}

const es: typeof en = {
  lead: String.raw`Un cuerpo en movimiento uniforme recorre desplazamientos iguales en intervalos de tiempo iguales: su velocidad nunca cambia. Es la variante más simple de la invariante, la que se obtiene con \(a = 0\), y basta para describir a una tortuga que se dirige a la meta, el sonido de un eco o dos automóviles en una autopista. Aquí puedes resolver cualquier tramo de movimiento uniforme, promediar varios tramos y hallar, por ecuaciones y gráficamente, cuándo se encuentran dos cuerpos.`,
  invariantTitle: 'La invariante con a = 0',
  invariantLead: String.raw`Sin aceleración, las cinco ecuaciones de la invariante se reducen a una sola relación entre desplazamiento, velocidad y tiempo, más la definición de desplazamiento. Dos datos fijan la tercera magnitud.`,
  invariantNote: String.raw`\(\Delta x = v\,t\) es la ecuación de una recta en el plano \(t\)–\(x\): \(x = x_0 + v\,t\), con pendiente \(v\) e intercepto \(x_0\).`,
  graphsLead: String.raw`En el movimiento uniforme \(x(t)\) es una recta y \(v(t)\) una recta horizontal; el área del rectángulo bajo \(v(t)\) es el desplazamiento.`,
  eventsLead: 'Instantes que se siguen del movimiento fijado por los datos.',
  whyDelta: 'El desplazamiento es el cambio de posición, {eq}.',
  variantTitle: 'Variante del curso: movimiento uniforme',
  variantNote: 'Aplicando a = 0 a la invariante: la primera ecuación dice que la velocidad nunca cambia, la segunda que el desplazamiento crece en proporción al tiempo, y la tercera se vuelve una identidad.',
  plotX: String.raw`Posición \(x(t)\)`,
  plotXNote: 'Una recta: su pendiente es la velocidad, {v}.',
  plotV: String.raw`Velocidad \(v(t)\)`,
  plotVNote: 'Una recta horizontal; el rectángulo bajo ella es el desplazamiento, {dx}.',
  evFinal: 'Final del tramo',
  evOrigin: 'Pasa por el origen',
  legendV: 'velocidad (constante)',
  legendGhost: 'posiciones a intervalos iguales de tiempo: equiespaciadas',
  query: { t: 'En el instante t =', x: 'Cuando la posición es x =' },
  theory: [
    {
      title: 'El modelo de partícula',
      body: String.raw`<p>Para describir un movimiento tratamos al cuerpo como una <b>partícula</b>: un punto con masa y sin tamaño, de modo que todas sus partes se mueven exactamente igual. Un tren, una tortuga o un electrón son partículas mientras ignoremos sus rotaciones y vibraciones. En una dimensión su estado queda dado por una sola coordenada \(x\), medida desde un origen elegido sobre un eje con un sentido positivo elegido.</p>`,
    },
    {
      title: 'Posición, desplazamiento y distancia',
      body: String.raw`<p>El <b>desplazamiento</b> entre dos instantes es el cambio de posición, \(\Delta x = x_f - x_i\); tiene signo e ignora lo que pasó en medio. La <b>distancia</b> recorrida es la longitud del camino efectivamente cubierto, siempre positiva. Quien camina 100 m y regresa tiene un desplazamiento nulo y una distancia de 200 m: la velocidad media de un automóvil en una vuelta completa a un circuito es cero.</p>`,
    },
    {
      title: 'Velocidad media y rapidez media',
      body: String.raw`<p>La <b>velocidad media</b> en un intervalo es el desplazamiento dividido entre el tiempo transcurrido,</p>\[\bar v = \frac{\Delta x}{\Delta t} = \frac{x_2 - x_1}{t_2 - t_1},\]<p>la pendiente de la recta que une los dos puntos de la gráfica \(x(t)\). La <b>rapidez media</b> es la distancia dividida entre el tiempo; nunca es negativa y es por lo menos la magnitud de la velocidad media.</p>`,
    },
    {
      title: 'Velocidad constante',
      body: String.raw`<p>Cuando la velocidad es constante, la velocidad media de cualquier intervalo es el mismo número \(v\), y</p>\[x(t) = x_0 + v\,t.\]<p>La gráfica \(x(t)\) es una recta de pendiente \(v\) (positiva si se mueve hacia los \(x\) crecientes), y \(v(t)\) es una recta horizontal. Tiempos iguales dan desplazamientos iguales, que es lo que muestran los puntos equiespaciados del diagrama de movimiento.</p>`,
    },
    {
      title: 'El movimiento uniforme como variante',
      body: String.raw`<p>El curso lo obtiene <b>aplicando las condiciones del movimiento uniforme a la invariante</b> \(V(t) = V_o + at\), \(V^2 = V_o^2 + 2aS\), \(S = V_o t + \tfrac{at^2}{2}\). Con \(a = 0\):</p>\[V(t) = V_o,\qquad S(t) = V_o\,t,\qquad V(t)^2 = V_o^2.\]<p>No hay nada nuevo que memorizar: las ecuaciones generales ya contienen este caso.</p>`,
    },
    {
      title: 'Encuentros: por ecuaciones y gráficamente',
      body: String.raw`<p>Dos cuerpos se encuentran cuando están en el mismo lugar en el mismo instante. Escribiendo la ley de cada uno, \(x_A(t)\) y \(x_B(t)\), el encuentro es la solución de \(x_A(t) = x_B(t)\). Gráficamente es el cruce de las dos rectas en el plano \(t\)–\(x\); si un cuerpo parte tarde o se detiene un rato, su recta se parte en segmentos y cada segmento se estudia por separado.</p>`,
    },
    {
      title: 'La velocidad media no es el promedio',
      body: String.raw`<p>Un ciclista que sube a 5 km/h y baja a 20 km/h no promedia 12.5 km/h, salvo que ambos tramos duren lo mismo. Con longitudes iguales \(L\) los tiempos son \(L/5\) y \(L/20\) y</p>\[\bar v = \frac{2L}{L/5 + L/20} = 8\ \text{km/h},\]<p>la media armónica: el tramo lento dura más y pesa más en el promedio.</p>`,
    },
  ],
  presets: {
    tortoise: {
      title: 'La tortuga se dirige a la meta',
      source: 'Serway 2.9 · material de clase',
      text: String.raw`Una tortuga avanza de manera estable a su máxima rapidez de \(0.200\ \text{m/s}\) hacia una meta ubicada a \(1.00\ \text{km}\). ¿Cuánto tarda?`,
    },
    highway: {
      title: 'Un cuarto de hora en la autopista',
      source: 'Ejemplo propio',
      text: String.raw`Un automóvil mantiene \(90\ \text{km/h}\) constantes durante \(15\ \text{min}\). ¿Qué distancia recorre?`,
    },
    sound: {
      title: 'Un eco',
      source: 'Ejemplo propio',
      text: String.raw`El sonido viaja en el aire a \(343\ \text{m/s}\). El eco de un grito regresa después de \(2.4\ \text{s}\). ¿Qué distancia recorrió el sonido, y a qué distancia está la pared?`,
    },
    backwards: {
      title: 'Hacia el origen',
      source: 'Ejemplo propio',
      text: String.raw`Un cuerpo en \(x_0 = 50\ \text{m}\) se mueve con velocidad constante de \(-4.00\ \text{m/s}\). ¿Dónde está después de \(10.0\ \text{s}\)? ¿Cuándo pasa por el origen?`,
    },
    twoPoints: {
      title: 'A partir de dos posiciones',
      source: 'Ejemplo propio',
      text: String.raw`Una partícula en movimiento uniforme va de \(x = -20\ \text{m}\) a \(x = 60\ \text{m}\) en \(16\ \text{s}\). ¿Cuál es su velocidad?`,
    },
  },
  average: {
    title: 'Velocidad media en varios tramos',
    lead: String.raw`Cuando un viaje se compone de tramos a distintas rapideces constantes, la velocidad media es el desplazamiento total sobre el tiempo total, no el promedio de las velocidades. Da a cada tramo su velocidad y su longitud o duración.`,
    presets: {
      cyclistLength: {
        title: 'Ciclista: longitudes iguales',
        text: String.raw`Un ciclista marcha por una región con muchas subidas y bajadas: en las subidas lleva una velocidad constante de \(5\ \text{km/h}\) y en las bajadas de \(20\ \text{km/h}\). ¿Cuál es su velocidad media si las subidas y bajadas tienen la misma longitud? (Taller de cinemática, problema 1a.)`,
      },
      cyclistTime: {
        title: 'Ciclista: tiempos iguales',
        text: String.raw`El mismo ciclista, si emplea el mismo tiempo en las subidas que en las bajadas. (Taller de cinemática, problema 1b.)`,
      },
      cyclistDouble: {
        title: 'Ciclista: doble tiempo en la subida',
        text: String.raw`El mismo ciclista, si emplea el doble de tiempo en las subidas que en las bajadas. (Taller de cinemática, problema 1c.)`,
      },
      walkBack: {
        title: 'Ida y vuelta',
        text: String.raw`Una persona camina de A a B con rapidez constante de \(5.00\ \text{m/s}\) y regresa de B a A a \(3.00\ \text{m/s}\). (a) ¿Cuál es su rapidez promedio en todo el viaje? (b) ¿Y su velocidad promedio? La distancia AB no importa. (Serway 2.3)`,
      },
      gas: {
        title: 'Sin gasolina',
        text: String.raw`Usted maneja \(5.2\ \text{mi}\) por una carretera recta a \(43\ \text{mi/h}\) y se queda sin gasolina; camina luego \(1.2\ \text{mi}\) más en \(27\ \text{min}\). ¿Cuál fue la velocidad promedio desde que arrancó hasta que llegó a la estación de gasolina? (Resnick, problema muestra 2-1)`,
      },
    },
  },
  encounter: {
    title: 'Encuentros y carreras',
    lead: String.raw`Cada cuerpo sigue su propia recta \(x(t)\); donde las rectas se cruzan, se encuentran. Un cuerpo puede partir tarde, detenerse un rato (un tramo con \(v = 0\)) y volver a arrancar. Con una línea de meta el módulo también decide la carrera y, si un cuerpo se duerme, cuánto puede durar la siesta para que empate.`,
    presets: {
      hareTortoise: {
        title: 'La liebre y la tortuga',
        text: String.raw`Una liebre y una tortuga compiten en una ruta de \(1.00\ \text{km}\). La tortuga avanza de manera estable a \(0.200\ \text{m/s}\). La liebre corre a \(8.00\ \text{m/s}\) durante \(0.800\ \text{km}\) y luego se detiene para fastidiar a la tortuga. ¿Cuán cerca de la meta puede dejar que se acerque la tortuga antes de reanudar la carrera, que gana la tortuga en un final de fotografía? (Serway 2.9, material de clase: resolver gráficamente y por ecuaciones.)`,
      },
      overtake: {
        title: 'Rebase en la autopista',
        text: String.raw`¿Cuánto tarda un automóvil a \(60.0\ \text{km/h}\) en rebasar a otro que viaja en la misma dirección a \(40.0\ \text{km/h}\), si sus defensas frontales están separadas \(100\ \text{m}\)? (Serway 4.36)`,
      },
      oncoming: {
        title: 'Dos automóviles que se acercan',
        text: String.raw`Dos automóviles salen al mismo tiempo de pueblos separados \(3.00\ \text{km}\) y viajan uno hacia el otro a \(72\ \text{km/h}\) y \(108\ \text{km/h}\). ¿Cuándo y dónde se encuentran?`,
      },
      lateStart: {
        title: 'El que sale después',
        text: String.raw`Un corredor sale a \(4.0\ \text{m/s}\); \(30\ \text{s}\) después un segundo corredor sale del mismo punto a \(6.0\ \text{m/s}\). ¿Cuándo y dónde lo alcanza?`,
      },
    },
  },
  source: String.raw`Teoría según R. Resnick, D. Halliday y K. Krane, <em>Física</em>, vol. 1, capítulo 2 (secciones 2-1 a 2-4); problemas de R. Serway y J. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1, capítulos 2 y 4, y del material y el taller de clase.`,
}

export const uniform = { en, es }
