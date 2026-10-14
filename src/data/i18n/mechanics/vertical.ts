// Vertical throws (pd.mechanics.vertical).

const en = {
  lead: String.raw`A body thrown straight up slows down at the rate \(g\), stops for an instant at its highest point and comes back down speeding up at the same rate; one thrown down simply speeds up from the start. Both are variants of the invariant with \(a = -g\) along an axis pointing up. Choose the direction of the throw, the launch height if it leaves from a balcony or a roof, and the condition of the statement (maximum height, return to the hand, arrival at the ground); the laboratory solves it, draws the flight and tells apart the two instants at which the body passes through the same height.`,
  invariantTitle: 'The invariant with a = −g (y axis up)',
  invariantLead: String.raw`With the \(y\) axis pointing up, the acceleration is \(-g\) and every velocity carries its sign: positive while the body rises, negative while it falls. The five equations of the invariant become the ones below, each without one of the quantities.`,
  invariantNote: String.raw`The relation \((y)\) turns the displacement into a height above the ground when the body leaves from \(y_0\); "reaches the ground" means \(y = 0\).`,
  graphsLead: String.raw`\(y(t)\) is a parabola opening downwards, \(v(t)\) a straight line of slope \(-g\) that crosses zero at the top, and \(a(t)\) the constant \(-g\).`,
  eventsLead: 'The instants every vertical throw has: the top, the return to the launch point and the arrival at the ground.',
  rejectDir: 'its sign must match the direction of the throw chosen above.',
  signHint: 'Positive upwards, negative downwards',
  dirTitle: 'Direction of the throw',
  dir: { up: 'Upward', down: 'Downward' },
  whyY: 'The height above the ground is the launch height plus the vertical displacement: {eq}.',
  goingUp: 'Positive: at that instant the body is still going up.',
  goingDown: 'Negative: at that instant the body is already coming down.',
  branchUp: 'On the way up',
  branchDown: 'On the way down',
  variantUp: 'Variant: upward throw',
  tagUp: 'magnitudes, upward positive',
  variantUpNote: 'g opposes the motion while the body rises, so it is subtracted. The same equations keep working on the way down, where V becomes negative: that is why the laboratory uses signed quantities.',
  variantDown: 'Variant: downward throw',
  tagDown: 'magnitudes, downward positive',
  variantDownNote: 'The velocity and g point the same way, so the speed grows: in the variant g is added. H is measured downwards from the launch point.',
  plotY: String.raw`Height \(y(t)\)`,
  plotYNote: 'A parabola opening downwards; its vertex is the maximum height, where the slope (the velocity) is zero.',
  plotV: String.raw`Velocity \(v(t)\)`,
  plotVNote: 'A straight line of slope −g. It crosses zero at the top; the area above the axis is the rise and the one below the descent.',
  plotA: String.raw`Acceleration \(a(t) = -g\)`,
  plotANote: 'Constant and downwards, also at the top: the velocity is zero there, the acceleration is not.',
  evTop: 'Maximum height',
  evTopCond: 'At the top the velocity is zero: v = v₀ − g t = 0.',
  evBack: 'Back at the launch point',
  evBackCond: 'Δy = 0 gives t (v₀ − g t / 2) = 0: the time up equals the time down.',
  evGround: 'It reaches the ground',
  evGroundCond: 'Setting y = 0 in y = y₀ + v₀ t − ½ g t², a quadratic whose positive root is the answer:',
  legendV: 'velocity',
  legendG: 'acceleration of gravity',
  legendGhost: 'positions at equal time intervals',
  conditions: {
    free: 'No extra condition',
    maxHeight: String.raw`Maximum height \((v = 0)\)`,
    backToLaunch: String.raw`Back at the launch point \((\Delta y = 0)\)`,
    ground: String.raw`Reaches the ground \((y = 0)\)`,
  },
  query: { t: 'At the instant t =', y: 'When the height is y =', v: 'When the velocity is v =' },
  theory: [
    {
      title: 'The vertical throw as a variant',
      body: String.raw`<p>In the course notes the throw upwards comes from the invariant by applying its conditions: the acceleration is \(g\) and it opposes the motion, so</p>\[V(t) = V_o - g\,t,\qquad V(t)^2 = V_o^2 - 2g\,H,\qquad H(t) = V_o\,t - \frac{g\,t^2}{2},\]<p>while for a throw downwards the velocity and \(g\) point the same way and \(V = V_o + gt\), \(V^2 = V_o^2 + 2gH\), \(H = V_o t + \tfrac{gt^2}{2}\). Here \(g = \Delta V/\Delta t = 9.81\ \tfrac{\text{m/s}}{\text{s}}\): the velocity changes 9.81 m/s every second.</p>`,
    },
    {
      title: 'One axis and one sign convention',
      body: String.raw`<p>The safest way to handle the whole flight is Resnick’s: a single \(y\) axis pointing up and \(a = -g\) with \(g > 0\). Then \(v = v_0 - gt\) and \(y = y_0 + v_0 t - \tfrac12 g t^2\) describe the rise, the top and the fall without changing anything: the velocity is positive while it rises, zero at the top and negative while it falls.</p>`,
    },
    {
      title: 'Rise and fall are symmetric',
      body: String.raw`<p>The top is reached when \(v = 0\), at \(t_s = v_0/g\), and the maximum height above the launch point is \(H = \dfrac{v_0^2}{2g}\). Setting \(\Delta y = 0\) gives \(t = 2v_0/g\): the body takes as long to come down as to go up, and it comes back to the hand with the same speed, \(v = -v_0\). At every height it passes twice, with velocities equal in magnitude and opposite in sign.</p>`,
    },
    {
      title: 'At the top, v = 0 but a ≠ 0',
      body: String.raw`<p>A common mistake is to think that the acceleration vanishes at the highest point. The velocity is zero there for an instant, but it is still changing at the rate \(-g\): one instant before it was positive and one instant later it is negative. If the acceleration were zero at the top the body would stay there.</p>`,
    },
    {
      title: 'Throws from a height: two roots',
      body: String.raw`<p>When the body leaves from a height \(y_0\) and we ask when it reaches the ground, \(0 = y_0 + v_0 t - \tfrac12 g t^2\) is a quadratic with one positive and one negative root. As the course notes say, we keep the positive root, since there are no negative times; the negative one corresponds to the instant at which a body following the same parabola would have left the ground.</p>`,
    },
    {
      title: 'Two answers for one height',
      body: String.raw`<p>Asking when the body is 8 m above the launch point gives two times, one on the way up and one on the way down, and \(v^2 = v_0^2 - 2g\Delta y\) gives two velocities of opposite sign. Both are physically valid, and the laboratory shows them as two solutions. Only if the height exceeds \(v_0^2/2g\) is there no solution: the body never gets there.</p>`,
    },
  ],
  presets: {
    baseball: {
      title: 'A baseball hit straight up',
      source: 'Serway 2.41 · class notes',
      text: String.raw`A baseball is hit so that it travels straight upward after being struck by the bat. A fan observes that it takes \(3.00\ \text{s}\) for the ball to reach its maximum height. Find (a) the initial velocity of the ball and (b) the height it reaches.`,
    },
    balcony: {
      title: 'From a balcony',
      source: 'Course workshop, problem 2',
      text: String.raw`From a balcony \(14.1\ \text{m}\) above the street a body is thrown vertically upward at \(10\ \text{m/s}\). Calculate the time it takes to reach the ground.`,
    },
    roof: {
      title: 'From the roof of a building',
      source: 'Course workshop, problem 3',
      text: String.raw`A body is thrown vertically upward at \(98\ \text{m/s}\) from the roof of a building \(100\ \text{m}\) high. Determine (a) the maximum height it reaches above the ground, (b) the time when it passes the launch point, (c) the velocity on reaching the ground and (d) the total time until it reaches the ground.`,
    },
    tower: {
      title: 'A stone from a tower',
      source: 'Course workshop, problem 4',
      text: String.raw`From the top of a tower a stone is thrown up at \(15\ \text{m/s}\); it rises and falls along the outside of the tower. Taking the launch point as origin and \(g = 10\ \text{m/s}^2\), find (a) its position and velocity after 1 s and 4 s, (b) its velocity when it is 8 m above the starting point and (c) the time until it passes that point again. (Choose g = 10 above and query the other instants.)`,
    },
    balloon: {
      title: 'A water balloon thrown down',
      source: 'Class notes',
      text: String.raw`A student throws a water balloon vertically downward from a building with an initial speed of \(6\ \text{m/s}\). Air resistance can be ignored. (a) What is its speed after falling for 2 s? (b) How far does it fall in that time? (c) What is its speed after falling 10 m? (Query the position y = −10 m for part c.)`,
    },
    keys: {
      title: 'Keys to a window',
      source: 'Serway 2.39',
      text: String.raw`A student throws a set of keys vertically upward to her sorority sister in a window \(4.00\ \text{m}\) above. The keys are caught \(1.50\ \text{s}\) later. (a) With what initial velocity were they thrown? (b) What was their velocity just before they were caught?`,
    },
    castle: {
      title: 'Attacking a castle',
      source: 'Serway 2.42',
      text: String.raw`An attacker at the base of a castle wall \(3.65\ \text{m}\) high throws a rock straight up with speed \(7.40\ \text{m/s}\) from a height of \(1.55\ \text{m}\) above the ground. (a) Will the rock reach the top of the wall? (b) If so, what is its speed at the top? (The rock must rise \(\Delta y = 2.10\ \text{m}\).)`,
    },
    cliff: {
      title: 'From the edge of a cliff',
      source: 'Serway 2.38',
      text: String.raw`A ball is thrown directly upward with an initial speed of \(8.00\ \text{m/s}\) from a height of \(30.0\ \text{m}\). After what time interval does it strike the ground?`,
    },
  },
  encounter: {
    title: 'Two bodies on the same vertical',
    lead: String.raw`Two bodies thrown or dropped along the same vertical meet when \(y_A(t) = y_B(t)\). Both feel the same acceleration \(-g\), so the \(t^2\) terms cancel and the meeting condition becomes linear: relative to each other they move at constant velocity.`,
    presets: {
      dropThrow: {
        title: 'One drops, the other throws',
        text: String.raw`You drop a ball from a window 20.0 m up while a friend on the ground throws another ball upward with the speed the first one would have on reaching the ground, \(19.8\ \text{m/s}\). Is the meeting point at the midpoint, above it or below it? (Serway, question 2.14)`,
      },
      twoUp: {
        title: 'Two balls, one second apart',
        text: String.raw`Two balls are thrown straight up at \(20\ \text{m/s}\) from the same point, the second one 1.0 s after the first. When and at what height do they meet?`,
      },
      stones: {
        title: 'Two stones, one splash',
        text: String.raw`A climber on a 50.0 m cliff above a pool throws two stones vertically down 1.00 s apart and sees a single splash. The first has an initial speed of 2.00 m/s; the second is thrown at 15.25 m/s, the speed needed for both to hit the water together. Check it. (Serway 2.57)`,
      },
    },
  },
  source: String.raw`Theory after R. Resnick, D. Halliday and K. Krane, <em>Física</em>, vol. 1, chapter 2 (section 2-7); problems from R. Serway and J. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1, chapter 2, and from the course notes and kinematics workshop.`,
}

const es: typeof en = {
  lead: String.raw`Un cuerpo lanzado verticalmente hacia arriba frena al ritmo \(g\), se detiene un instante en su punto más alto y regresa acelerando al mismo ritmo; uno lanzado hacia abajo simplemente acelera desde el principio. Ambos son variantes de la invariante con \(a = -g\) sobre un eje que apunta hacia arriba. Elige el sentido del lanzamiento, la altura de lanzamiento si sale de un balcón o un tejado, y la condición del enunciado (altura máxima, regreso a la mano, llegada al suelo); el laboratorio lo resuelve, dibuja el vuelo y distingue los dos instantes en que el cuerpo pasa por una misma altura.`,
  invariantTitle: 'La invariante con a = −g (eje y hacia arriba)',
  invariantLead: String.raw`Con el eje \(y\) hacia arriba, la aceleración es \(-g\) y cada velocidad lleva su signo: positiva mientras el cuerpo sube, negativa mientras baja. Las cinco ecuaciones de la invariante quedan como sigue, cada una sin una de las magnitudes.`,
  invariantNote: String.raw`La relación \((y)\) convierte el desplazamiento en altura sobre el suelo cuando el cuerpo sale desde \(y_0\); "llega al suelo" significa \(y = 0\).`,
  graphsLead: String.raw`\(y(t)\) es una parábola que abre hacia abajo, \(v(t)\) una recta de pendiente \(-g\) que cruza el cero en la cima, y \(a(t)\) la constante \(-g\).`,
  eventsLead: 'Los instantes que tiene todo lanzamiento vertical: la cima, el regreso al punto de lanzamiento y la llegada al suelo.',
  rejectDir: 'su signo debe coincidir con el sentido de lanzamiento elegido arriba.',
  signHint: 'Positiva hacia arriba, negativa hacia abajo',
  dirTitle: 'Sentido del lanzamiento',
  dir: { up: 'Hacia arriba', down: 'Hacia abajo' },
  whyY: 'La altura sobre el suelo es la altura de lanzamiento más el desplazamiento vertical: {eq}.',
  goingUp: 'Positiva: en ese instante el cuerpo todavía sube.',
  goingDown: 'Negativa: en ese instante el cuerpo ya viene bajando.',
  branchUp: 'Subiendo',
  branchDown: 'Bajando',
  variantUp: 'Variante: lanzamiento hacia arriba',
  tagUp: 'magnitudes, positivo hacia arriba',
  variantUpNote: 'g se opone al movimiento mientras el cuerpo sube, así que se resta. Las mismas ecuaciones siguen valiendo en la bajada, donde V se vuelve negativa: por eso el laboratorio usa magnitudes con signo.',
  variantDown: 'Variante: lanzamiento hacia abajo',
  tagDown: 'magnitudes, positivo hacia abajo',
  variantDownNote: 'La velocidad y g apuntan hacia el mismo lado, así que la rapidez crece: en la variante g se suma. H se mide hacia abajo desde el punto de lanzamiento.',
  plotY: String.raw`Altura \(y(t)\)`,
  plotYNote: 'Una parábola que abre hacia abajo; su vértice es la altura máxima, donde la pendiente (la velocidad) es cero.',
  plotV: String.raw`Velocidad \(v(t)\)`,
  plotVNote: 'Una recta de pendiente −g. Cruza el cero en la cima; el área sobre el eje es la subida y la de abajo la bajada.',
  plotA: String.raw`Aceleración \(a(t) = -g\)`,
  plotANote: 'Constante y hacia abajo, también en la cima: allí la velocidad es cero, la aceleración no.',
  evTop: 'Altura máxima',
  evTopCond: 'En la cima la velocidad es cero: v = v₀ − g t = 0.',
  evBack: 'Regresa al punto de lanzamiento',
  evBackCond: 'Δy = 0 da t (v₀ − g t / 2) = 0: el tiempo de subida es igual al de bajada.',
  evGround: 'Llega al suelo',
  evGroundCond: 'Haciendo y = 0 en y = y₀ + v₀ t − ½ g t², una cuadrática cuya raíz positiva es la respuesta:',
  legendV: 'velocidad',
  legendG: 'aceleración de la gravedad',
  legendGhost: 'posiciones a intervalos iguales de tiempo',
  conditions: {
    free: 'Sin condición extra',
    maxHeight: String.raw`Altura máxima \((v = 0)\)`,
    backToLaunch: String.raw`Regresa al punto de lanzamiento \((\Delta y = 0)\)`,
    ground: String.raw`Llega al suelo \((y = 0)\)`,
  },
  query: { t: 'En el instante t =', y: 'Cuando la altura es y =', v: 'Cuando la velocidad es v =' },
  theory: [
    {
      title: 'El lanzamiento vertical como variante',
      body: String.raw`<p>En el material de clase el lanzamiento hacia arriba sale de la invariante aplicando sus condiciones: la aceleración es \(g\) y se opone al movimiento, así que</p>\[V(t) = V_o - g\,t,\qquad V(t)^2 = V_o^2 - 2g\,H,\qquad H(t) = V_o\,t - \frac{g\,t^2}{2},\]<p>mientras que en el lanzamiento hacia abajo la velocidad y \(g\) apuntan hacia el mismo lado y \(V = V_o + gt\), \(V^2 = V_o^2 + 2gH\), \(H = V_o t + \tfrac{gt^2}{2}\). Aquí \(g = \Delta V/\Delta t = 9.81\ \tfrac{\text{m/s}}{\text{s}}\): la velocidad cambia 9.81 m/s cada segundo.</p>`,
    },
    {
      title: 'Un solo eje y un solo convenio de signos',
      body: String.raw`<p>La forma más segura de tratar todo el vuelo es la de Resnick: un único eje \(y\) hacia arriba y \(a = -g\) con \(g > 0\). Entonces \(v = v_0 - gt\) y \(y = y_0 + v_0 t - \tfrac12 g t^2\) describen la subida, la cima y la bajada sin cambiar nada: la velocidad es positiva mientras sube, cero en la cima y negativa mientras baja.</p>`,
    },
    {
      title: 'Subida y bajada son simétricas',
      body: String.raw`<p>La cima se alcanza cuando \(v = 0\), en \(t_s = v_0/g\), y la altura máxima sobre el punto de lanzamiento es \(H = \dfrac{v_0^2}{2g}\). Haciendo \(\Delta y = 0\) se obtiene \(t = 2v_0/g\): el cuerpo tarda lo mismo en bajar que en subir, y regresa a la mano con la misma rapidez, \(v = -v_0\). Por cada altura pasa dos veces, con velocidades de igual magnitud y signo contrario.</p>`,
    },
    {
      title: 'En la cima, v = 0 pero a ≠ 0',
      body: String.raw`<p>Un error común es pensar que la aceleración se anula en el punto más alto. Allí la velocidad es cero durante un instante, pero sigue cambiando al ritmo \(-g\): un instante antes era positiva y un instante después es negativa. Si la aceleración fuera cero en la cima, el cuerpo se quedaría allí.</p>`,
    },
    {
      title: 'Lanzamientos desde una altura: dos raíces',
      body: String.raw`<p>Cuando el cuerpo sale desde una altura \(y_0\) y preguntamos cuándo llega al suelo, \(0 = y_0 + v_0 t - \tfrac12 g t^2\) es una cuadrática con una raíz positiva y una negativa. Como dice el material de clase, usamos la raíz positiva, ya que no tenemos tiempos negativos; la negativa corresponde al instante en que un cuerpo que siguiera la misma parábola habría salido del suelo.</p>`,
    },
    {
      title: 'Dos respuestas para una altura',
      body: String.raw`<p>Preguntar cuándo está el cuerpo 8 m por encima del punto de lanzamiento da dos tiempos, uno subiendo y otro bajando, y \(v^2 = v_0^2 - 2g\Delta y\) da dos velocidades de signo contrario. Ambas son físicamente válidas, y el laboratorio las muestra como dos soluciones. Solo si la altura supera \(v_0^2/2g\) no hay solución: el cuerpo nunca llega allí.</p>`,
    },
  ],
  presets: {
    baseball: {
      title: 'Una pelota de béisbol golpeada hacia arriba',
      source: 'Serway 2.41 · material de clase',
      text: String.raw`Se golpea una pelota de béisbol de modo que viaja recto hacia arriba después de ser golpeada por el bate. Un aficionado observa que a la bola le toma \(3.00\ \text{s}\) llegar a su máxima altura. Encuentre (a) la velocidad inicial de la bola y (b) la altura que alcanza.`,
    },
    balcony: {
      title: 'Desde un balcón',
      source: 'Taller de cinemática, problema 2',
      text: String.raw`Desde un balcón situado a \(14.1\ \text{m}\) sobre el suelo de una calle lanzamos un cuerpo verticalmente hacia arriba con una velocidad de \(10\ \text{m/s}\). Calcular el tiempo que tarda en llegar al suelo.`,
    },
    roof: {
      title: 'Desde el tejado de un edificio',
      source: 'Taller de cinemática, problema 3',
      text: String.raw`Se lanza un cuerpo hacia arriba verticalmente con una velocidad de \(98\ \text{m/s}\) desde el tejado de un edificio de \(100\ \text{m}\) de altura. Determinar (a) la altura máxima que alcanza desde el suelo, (b) el tiempo cuando pasa por el lugar de lanzamiento, (c) la velocidad al llegar al suelo y (d) el tiempo total transcurrido hasta llegar al suelo.`,
    },
    tower: {
      title: 'Una piedra desde una torre',
      source: 'Taller de cinemática, problema 4',
      text: String.raw`Desde lo alto de una torre se lanza verticalmente hacia arriba una piedra con una velocidad inicial de \(15\ \text{m/s}\); llega a cierta altura y cae por la parte exterior de la torre. Tomando como origen el punto de lanzamiento y \(g = 10\ \text{m/s}^2\), calcular (a) la posición y velocidad al cabo de 1 s y de 4 s, (b) la velocidad cuando se encuentra a 8 m por encima del punto de partida y (c) el tiempo hasta que vuelve a pasar por dicho punto. (Elige g = 10 arriba y consulta los demás instantes.)`,
    },
    balloon: {
      title: 'Un globo de agua lanzado hacia abajo',
      source: 'Material de clase',
      text: String.raw`Un estudiante lanza un globo lleno de agua verticalmente hacia abajo desde un edificio, con una rapidez inicial de \(6\ \text{m/s}\). Puede despreciarse la resistencia del aire. (a) ¿Qué rapidez tiene después de caer durante 2 s? (b) ¿Qué distancia cae en ese lapso? (c) ¿Qué magnitud tiene su velocidad después de caer 10 m? (Para la parte c consulta la posición y = −10 m.)`,
    },
    keys: {
      title: 'Llaves hacia una ventana',
      source: 'Serway 2.39',
      text: String.raw`Un estudiante lanza un conjunto de llaves verticalmente hacia arriba a su compañera, que está en una ventana \(4.00\ \text{m}\) arriba. Ella las atrapa \(1.50\ \text{s}\) después. (a) ¿Con qué velocidad inicial se lanzaron las llaves? (b) ¿Cuál era su velocidad justo antes de ser atrapadas?`,
    },
    castle: {
      title: 'El ataque al castillo',
      source: 'Serway 2.42',
      text: String.raw`Un atacante en la base de la pared de un castillo de \(3.65\ \text{m}\) de alto lanza una roca recta hacia arriba con una rapidez de \(7.40\ \text{m/s}\) desde una altura de \(1.55\ \text{m}\) sobre el suelo. (a) ¿Llegará la roca a lo alto de la pared? (b) Si es así, ¿cuál es su rapidez en lo alto? (La roca debe subir \(\Delta y = 2.10\ \text{m}\).)`,
    },
    cliff: {
      title: 'Desde el borde de un risco',
      source: 'Serway 2.38',
      text: String.raw`Una bola se lanza directamente hacia arriba con una rapidez inicial de \(8.00\ \text{m/s}\) desde una altura de \(30.0\ \text{m}\). ¿Después de qué intervalo de tiempo golpea el suelo?`,
    },
  },
  encounter: {
    title: 'Dos cuerpos en la misma vertical',
    lead: String.raw`Dos cuerpos lanzados o soltados sobre la misma vertical se encuentran cuando \(y_A(t) = y_B(t)\). Ambos sienten la misma aceleración \(-g\), así que los términos en \(t^2\) se cancelan y la condición de encuentro se vuelve lineal: uno respecto al otro se mueven con velocidad constante.`,
    presets: {
      dropThrow: {
        title: 'Uno suelta, el otro lanza',
        text: String.raw`Sueltas una bola desde una ventana a 20.0 m de altura mientras un amigo en el suelo lanza otra hacia arriba con la rapidez que tendría la primera al llegar al suelo, \(19.8\ \text{m/s}\). ¿El punto de encuentro está en la mitad, arriba o abajo de ella? (Serway, pregunta 2.14)`,
      },
      twoUp: {
        title: 'Dos bolas, con un segundo de diferencia',
        text: String.raw`Se lanzan dos bolas recto hacia arriba a \(20\ \text{m/s}\) desde el mismo punto, la segunda 1.0 s después de la primera. ¿Cuándo y a qué altura se encuentran?`,
      },
      stones: {
        title: 'Dos piedras, una salpicadura',
        text: String.raw`Un montañista sobre un risco de 50.0 m sobre un ojo de agua lanza dos piedras verticalmente hacia abajo con 1.00 s de separación y observa una sola salpicadura. La primera tiene una rapidez inicial de 2.00 m/s; la segunda se lanza a 15.25 m/s, la rapidez necesaria para que ambas lleguen juntas. Compruébalo. (Serway 2.57)`,
      },
    },
  },
  source: String.raw`Teoría según R. Resnick, D. Halliday y K. Krane, <em>Física</em>, vol. 1, capítulo 2 (sección 2-7); problemas de R. Serway y J. Jewett, <em>Física para ciencias e ingeniería</em>, vol. 1, capítulo 2, y del material y el taller de cinemática de clase.`,
}

export const vertical = { en, es }
