# Propuesta: sonificación del proyecto Sorting

Objetivo: que cada acción del algoritmo suene, que el tono varíe con la altura
de la barra, y que el resultado sea agradable al oído en vez del típico bip.

---

## 1. Por qué el "bip típico" suena mal

Casi todos los visualizadores de ordenamiento con sonido hacen lo mismo:
un `OscillatorNode` de onda cuadrada o de sierra, con la frecuencia mapeada
linealmente a la altura de la barra. Suena mal por cuatro razones concretas,
y cada una tiene una solución que no cuesta casi nada:

| Problema | Por qué molesta | Solución propuesta |
|---|---|---|
| Frecuencia continua | Los intervalos caen en cualquier parte, así que toda secuencia suena desafinada | Cuantizar a una escala **pentatónica** |
| Onda cruda sin envolvente | El corte abrupto produce un "clic" en cada nota | Sintetizar una **cuerda pulsada** con ataque y decaimiento naturales |
| Todo en el centro, seco | 30 notas por segundo apiladas en el mismo punto se vuelven barro | **Paneo estéreo** por índice + **reverberación** |
| Sin control de densidad | A retardo bajo se disparan cientos de notas por segundo | **Limitador de eventos** y decaimiento adaptativo |

El punto clave es el segundo de la tabla: **con cuantización pentatónica,
cualquier secuencia de valores, por aleatoria que sea, suena consonante.**
La escala pentatónica no tiene semitonos adyacentes ni tritonos, así que no
existe una combinación de dos notas que choque. Es el mismo truco por el que
un niño golpeando teclas negras al azar en un piano suena bien.

---

## 2. Diseño sonoro propuesto

### 2.1 La voz: cuerda pulsada (Karplus-Strong)

En vez de un oscilador, un modelo físico de cuerda pulsada. Suena a kalimba,
arpa o caja de música: cálido, con ataque suave y cola que se apaga sola.
El algoritmo completo son unas 15 líneas:

```js
// Ráfaga de ruido circulando por una línea de retardo con filtro promediador.
// Ojo con el +0.5: ver la nota de afinación en la sección 9.
function pluckBuffer(ctx, freq, seconds, damping = 0.996) {
  const rate = ctx.sampleRate
  const n = Math.round(rate / freq + 0.5)  // el lazo real mide n - 0.5
  const total = Math.ceil(seconds * rate)
  const buffer = ctx.createBuffer(1, total, rate)
  const out = buffer.getChannelData(0)
  const line = new Float32Array(n)
  for (let i = 0; i < n; i++) line[i] = Math.random() * 2 - 1
  let p = 0
  for (let i = 0; i < total; i++) {
    const next = (p + 1) % n
    out[i] = line[p]
    line[p] = damping * 0.5 * (line[p] + line[next])
    p = next
  }
  return buffer
}
```

**Detalle técnico importante.** La forma habitual de hacer Karplus-Strong en
Web Audio es con un `DelayNode` realimentado, y ahí aparece un techo de agudos:
un `DelayNode` dentro de un ciclo no puede bajar de un bloque de render
(128 muestras), lo que topa la nota más alta alrededor de **340 Hz, o sea un
fa4**. Para una escala de tres octavas eso no sirve. Renderizando el buffer
offline en JS ese límite desaparece: la afinación es exacta porque uno elige
el largo de la línea en muestras. Es también la razón por la que **no** conviene
`Tone.PluckSynth`, que se apoya en un peine con `DelayNode` (ver sección 3).

Coste: 15 notas x 0.9 s x 48 kHz x 4 bytes ≈ **2.6 MB de RAM**, generados una
sola vez al activar el sonido. El bucle son ~650 mil iteraciones, menos de un
milisegundo.

### 2.2 La afinación: pentatónica mayor, tres octavas

```js
const PENTATONIC = [0, 2, 4, 7, 9]          // semitonos dentro de la octava
const BASE = 220                             // la3
// altura de barra -> grado de escala -> frecuencia
const degree = Math.round((value - 1) / (n - 1) * (DEGREES - 1))
const semis = PENTATONIC[degree % 5] + 12 * Math.floor(degree / 5)
const freq = BASE * Math.pow(2, semis / 12)
```

15 grados cubren de 220 Hz a 1760 Hz. Barra baja, nota grave; barra alta,
nota aguda. Es exactamente lo que pediste, pero pasado por el filtro de la
escala para que nunca desafine.

### 2.3 El espacio: paneo por índice + reverberación procedural

- **Paneo:** `StereoPannerNode` con `pan = (i / (n - 1) * 2 - 1) * 0.7`.
  Como las barras se ordenan hacia la derecha, **literalmente se oye el
  algoritmo barrer de izquierda a derecha**. Este es el detalle que casi
  ninguna sonificación de ordenamiento tiene, y es el que más va a llamar
  la atención.
- **Reverberación:** un `ConvolverNode` con una respuesta al impulso
  generada en JS (ruido con decaimiento exponencial, ~1.8 s, decorrelacionado
  entre canales). Cero bytes de descarga y es lo que más contribuye a que
  suene "suave" en vez de seco y golpeado. Envío al 18%.

### 2.4 Timbre por tipo de evento

Los fotogramas ya traen `emphasis` (comparando) y `flags` (pivote / marca),
así que la distinción sale gratis:

| Evento | Sonido |
|---|---|
| Comparación | Pulsación normal |
| Pivote / intercambio | La misma nota una octava abajo, más un golpe corto y grave de cuerpo, para que se lea como acento |
| Fin de la corrida | Arpegio ascendente sobre el arreglo ya ordenado |

El arpegio final sale solo: al terminar, el arreglo es `1..n` ascendente, así
que muestrear ocho posiciones da una escala pentatónica que sube. Remate
satisfactorio sin ningún caso especial.

### 2.5 Decaimiento adaptativo

En vez de una duración fija, la envolvente se ata al retardo:

```js
decay = clamp(tick * 8, 0.12, 0.9)   // segundos
```

A retardo 400 ms las notas suenan largas y resonantes, casi ambientales.
A retardo 1 ms quedan cortas y percusivas, como una caja de música acelerada.
El mismo motor da dos texturas distintas según cómo lo uses, y de paso resuelve
el problema de la polifonía sin lógica extra.

---

## 3. Stack: Web Audio a pelo, sin librería

Medí los tamaños reales en vez de confiar en lo que dicen los blogs
(varios repiten que Tone.js pesa 20 KB comprimido, y no es cierto):

| Opción | Tamaño real | Veredicto |
|---|---|---|
| **Web Audio nativo** | ~3 KB (código propio) | **Recomendado** |
| Tone.js v15 | 346 KB crudo / **80 KB gzip** | 16 veces todo el JS de la página |
| Howler.js | 35 KB / 9 KB gzip | No sirve: reproduce archivos, no sintetiza |

Contexto: hoy toda la página de Sorting son **5 KB comprimidos** de
`Sorting.js` más 1 KB de `ExtText.js`. Meter 80 KB para el sonido sería
multiplicar por 16 el peso de la página.

Hay precedente de dependencias pesadas por CDN en el sitio (`cross-matrix`
carga 832 KB de p5.js), pero no me parece un precedente a seguir aquí.

Y más allá del tamaño, el argumento decisivo es técnico: **Tone.js daría un
resultado peor** para este caso concreto, porque su `PluckSynth` usa el peine
con `DelayNode` que tiene el techo de agudos de la sección 2.1. Todo lo que
necesito (`AudioBufferSourceNode`, `StereoPannerNode`, `ConvolverNode`,
`DynamicsCompressorNode`) es nativo y está soportado en todos lados.

### Cadena de audio

```
voz (AudioBufferSource) -> gain (envolvente) -> panner ->┬-> seco ────┐
                                                         └-> convolver ┤
                                                                       ├-> master -> compresor -> salida
```

El `DynamicsCompressorNode` final actúa de limitador suave y evita saturación
cuando se solapan muchas voces.

---

## 4. Arquitectura y enganche

**Módulo nuevo:** `public/js/core/Audio.js`, siguiendo el patrón de
`ExtText.js` y `PlotBoard.js`. Lo dejo en `core/` y no dentro de `Sorting.js`
para que otros proyectos (Cantor Sets, Fanctal, Cross Matrix) puedan
reutilizarlo después.

**Enganche:** el reproductor que quedó del arreglo anterior lo pone fácil.
En `play()`, junto a `this.draw(this.frame)`, va una sola línea:

```js
this.frame = this.frames[i++]
this.draw(this.frame)
this.sound?.step(this.frame, this.tick)   // <- único punto de contacto
```

**Un detalle a cuidar:** `mergeGraph()` puede pasar `[undefined]` como flags
cuando no marcó nada, y `dataToIndex()` puede devolver `-1`. En `draw()` eso
es inofensivo porque comparo contra enteros, pero el clasificador de audio
tiene que validar `Number.isInteger(i) && i >= 0 && i < data.length` antes de
tocar una nota.

---

## 5. El riesgo real de ingeniería: la densidad de eventos

Es el único punto donde esto se puede romper, así que lo detallo.

El retardo mínimo es 1 ms, o sea hasta **1000 eventos por segundo**. Ningún
sistema de audio toca mil notas por segundo, y aunque pudiera, sonaría a ruido
blanco. Solución en dos partes:

1. **Intervalo mínimo entre ataques (~28 ms).** Da un techo de ~35 notas por
   segundo, que ya es un trémolo rápido pero musical.
2. **Coalescencia por prioridad.** Los eventos que llegan dentro de la misma
   ranura no se descartan a ciegas: se guarda el más importante (un
   intercambio le gana a una comparación) y ese es el que suena.

```js
step(frame, tick) {
  const event = this.classify(frame)
  if (!event) return
  if (event.kind === 'mark' || !this.pending) this.pending = event
  const now = performance.now()
  if (now - this.last < MIN_IOI) return
  this.last = now
  this.fire(this.pending, tick)
  this.pending = null
}
```

Con el decaimiento adaptativo de 2.5, la polifonía se acota sola. Aun así
pondría un tope duro de 12 voces con robo de la más vieja, por seguridad.

---

## 6. Soporte necesario

- **Gesto de usuario.** Los navegadores no dejan arrancar un `AudioContext`
  sin interacción. Se crea de forma perezosa al activar el interruptor o al
  pulsar un algoritmo, y se llama `ctx.resume()` si quedó suspendido.
- **iOS.** Hay que reanudar el contexto en un evento táctil, y conviene saber
  que el interruptor físico de silencio del iPhone silencia este tipo de
  audio. Es una limitación del sistema, no del código.
- **Interruptor en el panel**, junto al botón de plegar, con icono de altavoz.
  Estado recordado en `localStorage`.
- **i18n** en los dos diccionarios: `pd.sorting.soundOn` y `pd.sorting.soundOff`
  para el `aria-label`, igual que hice con el botón de plegar.
- **Tema.** El interruptor usa los tokens del sitio, así que no necesita nada
  especial.

---

## 7. Fases

**Fase 1 (el encargo).** Módulo `core/Audio.js` con cuerda pulsada, escala
pentatónica, paneo, reverberación, limitador de eventos, acento en
intercambios, arpegio final, interruptor con persistencia e i18n.
Estimo unas 180 líneas de JS más el botón y las claves de traducción.

**Fase 2 (opcional, para después).** Un colchón grave continuo cuyo filtro se
abre a medida que crece el "grado de orden" del arreglo, es decir la fracción
de pares adyacentes ya ordenados. La música se va aclarando conforme el
algoritmo progresa y da un arco emocional a la corrida sin agregar notas.
Es la parte más original de todo esto, pero también la que más conviene
afinar a oído, así que la separaría.

---

## 8. Decisiones que necesito de ti

1. **Stack:** Web Audio nativo (mi recomendación, por peso y por calidad) o
   Tone.js por CDN si prefieres código más corto aunque suene peor arriba.
2. **Por defecto:** ¿el sonido arranca apagado con un interruptor visible, o
   encendido? Mi recomendación es **apagado**, porque el audio inesperado
   molesta y es la convención en la web, pero el interruptor tiene que
   invitar a pulsarlo.
3. **Fase 2:** ¿la incluyo desde el principio o la dejamos para una segunda
   pasada?
4. **Carácter:** pentatónica **mayor** (luminosa, tipo caja de música) o
   **menor** (más melancólica, tipo koto). Es cambiar un arreglo de cinco
   números, así que también podemos probar las dos.

---

## Fuentes consultadas

- [Karplus-Strong Demo, Lucio Paiva](https://luciopaiva.com/karplus/)
- [javascript-karplus-strong (mrahtz)](https://github.com/mrahtz/javascript-karplus-strong)
- [Web Audio Experiment: Karplus-Strong with Generic AudioNodes](https://codepen.io/tonywallace/pen/dvxowM)
- [Synthesizing a Plucked String Sound With the Karplus-Strong Algorithm](https://blog.demofox.org/2016/06/16/synthesizing-a-pluked-string-sound-with-the-karplus-strong-algorithm/)
- [strong-plus: Extended Karplus-Strong String Synthesizer](https://github.com/positivelofi/strong-plus)
- [Tone.js](https://tonejs.github.io/)
- [howler.js vs tone.js vs wavesurfer.js, PkgPulse](https://www.pkgpulse.com/guides/howler-vs-tone-js-vs-wavesurfer-web-audio-javascript-2026)

Tamaños de Tone.js y Howler medidos directamente contra jsDelivr, no tomados
de la comparativa anterior.

---

## 9. Estado: implementado y verificado

Implementado en `public/js/core/Sound.js` (motor reutilizable) más el enganche
en `public/js/lib/Sorting.js`. Decisiones tomadas: Web Audio nativo, sonido
encendido por defecto, Fase 1 más el colchón de progreso, y las dos escalas
con selector en el panel.

### La afinación no salió a la primera

El primer render sonaba desafinado hasta **64 cents**, casi un tercio de tono.
Dos causas, y la segunda no es la que dice la literatura:

1. `n` es un número entero de muestras, así que redondear el periodo ya cuesta
   hasta ~30 cents en la octava aguda, donde la línea mide unas 30 muestras.
2. El filtro del lazo **no** añade medio sample de retardo aquí. La forma
   canónica promedia una muestra con la *anterior* y da un periodo de
   `n + 0.5`, pero este bucle promedia con la *siguiente*, que es medio sample
   de adelanto: el periodo real es `n - 0.5` y el tono sale alto.

Los residuales medidos lo confirmaron antes de tocar nada: +9 cents en la nota
grave (línea de ~200 muestras) creciendo hasta +64 en la aguda (~30 muestras),
que es exactamente la curva que predice confundir `n - 0.5` con `n + 0.5`.

La corrección es doble: modelar el periodo como `n - 0.5` y pasarle al
reproductor la frecuencia realmente producida, que ajusta el resto con
`playbackRate`. **Residual final: 1 cent en mayor, 3 en menor**, por debajo del
umbral audible (5 a 10 cents).

### Mediciones

Renderizando el motor en un `OfflineAudioContext` y analizando la señal, no
solo comprobando que el grafo de nodos exista:

| Comprobación | Resultado |
|---|---|
| Afinación sobre 3 octavas (autocorrelación con interpolación parabólica) | ≤ 1 cent mayor, ≤ 3 cents menor |
| Patrón de semitonos | `0,2,4,7,9,12,...` mayor y `0,3,5,7,10,12,...` menor |
| Paneo estéreo | -0.891 izquierda, 0.000 centro, +0.891 derecha |
| Limitador de eventos a retardo 1 ms | 1.78 M eventos ofrecidos, **36 notas disparadas**, tope de 12 voces respetado |
| `AudioContext` | 0 antes del clic, 1 después, transición `suspended` a `running` |

La medición de afinación necesitó interpolación parabólica del pico de
autocorrelación: con retardos enteros la resolución en la octava aguda es de
unos 50 cents, más gruesa que el error que se buscaba.
