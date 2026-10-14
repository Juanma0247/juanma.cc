// Uniform straight-line motion: the invariant with a = 0, average velocity
// over several stretches, encounters and races.

import { t, fill, tex, texNum } from '../core.js'
import { eq } from '../algebra.js'
import { TopicPage } from '../topicPage.js'
import { makeMotion, answerQuery } from '../motion1d.js'
import { roadScene } from '../scenes.js'
import { EncounterModule } from '../encounter.js'
import { AverageModule } from '../average.js'

const tk = (k, f) => t(`uniform.${k}`, f)

const VARS = {
  v: { tex: 'v', dim: 'velocity', name: 'velocity' },
  t: { tex: 't', dim: 'time', name: 'time', range: [0, Infinity], nonzero: true, reject: 'common.steps.rejectTime' },
  dx: { tex: '\\Delta x', dim: 'length', name: 'displacement' },
  x0: { tex: 'x_0', dim: 'length', name: 'initialPosition', optional: true },
  x: { tex: 'x', dim: 'length', name: 'finalPosition', optional: true },
}

const EQS = [
  eq('u1', 'dx = v*t'),
  eq('u2', 'dx = x - x0', { label: '(\\Delta)' }),
]

const PRESETS = [
  { id: 'tortoise', data: { v: [0.2, 'm/s'], dx: [1, 'km'] }, asked: ['t'] },
  { id: 'highway', data: { v: [90, 'km/h'], t: [15, 'min'] }, asked: ['dx'] },
  { id: 'sound', data: { v: [343, 'm/s'], t: [2.4, 's'] }, asked: ['dx'] },
  { id: 'backwards', data: { x0: [50, 'm'], v: [-4, 'm/s'], t: [10, 's'] }, asked: ['x'] },
  { id: 'twoPoints', data: { x0: [-20, 'm'], x: [60, 'm'], t: [16, 's'] }, asked: ['v'] },
]

const ENCOUNTERS = [
  {
    id: 'hareTortoise', finish: 1000,
    bodies: [
      { x0: 0, phases: [{ dt: 100, v: 8 }, { dt: 4800, v: 0 }, { v: 8 }] },
      { x0: 0, phases: [{ v: 0.2 }] },
    ],
  },
  {
    id: 'overtake',
    bodies: [
      { x0: 0, phases: [{ v: 60 / 3.6 }] },
      { x0: 100, phases: [{ v: 40 / 3.6 }] },
    ],
  },
  {
    id: 'oncoming',
    bodies: [
      { x0: 0, phases: [{ v: 72 / 3.6 }] },
      { x0: 3000, phases: [{ v: -108 / 3.6 }] },
    ],
  },
  {
    id: 'lateStart',
    bodies: [
      { x0: 0, phases: [{ v: 4 }] },
      { x0: 0, delay: 30, phases: [{ v: 6 }] },
    ],
  },
]

const topic = {
  key: 'uniform',
  order: ['v', 't', 'dx', 'x0', 'x'],
  presets: PRESETS,
  conditions: null,

  system() {
    return { vars: VARS, eqs: EQS }
  },

  why(s) {
    if (s.eqId === 'u2') {
      return fill(tk('whyDelta', 'The displacement is the change of position, {eq}.'), { eq: '\\(\\Delta x = x - x_0\\)' })
    }
    return null
  },

  variant() {
    return {
      title: tk('variantTitle', 'Variant of the course: uniform motion'),
      tag: 'a = 0',
      eqs: ['V(t) = V_o', 'S(t) = V_o\\,t', 'V(t)^2 = V_o^2'],
      note: tk('variantNote', 'Applying a = 0 to the invariant: the first equation says the velocity never changes, the second that the displacement grows in proportion to time, and the third becomes an identity.'),
    }
  },

  invariantExtra() {
    return []
  },

  motion(vals) {
    if (!Number.isFinite(vals.v)) return null
    const x0 = Number.isFinite(vals.x0) ? vals.x0 : 0
    const final = Number.isFinite(vals.t) && vals.t > 0
    const m = makeMotion({ x0, v0: vals.v, a: 0 })
    m.duration = final ? vals.t : 10
    m.final = final
    return m
  },

  plots(m) {
    const dx = m.x(m.duration) - m.x0
    return [
      {
        id: 'x', title: tk('plotX', 'Position \\(x(t)\\)'),
        note: fill(tk('plotXNote', 'A straight line: its slope is the velocity, {v}.'), { v: `\\(v = ${texNum(m.v0)}\\,\\text{m/s}\\)` }),
        cfg: {
          xLabel: 't (s)', yLabel: 'x (m)', yUnit: 'm',
          series: [{ fn: m.x, color: 'primary' }],
          marks: [{ t: 0, y: m.x0, label: 'x₀' }, ...(m.final ? [{ t: m.duration, y: m.x(m.duration), label: 'x' }] : [])],
        },
      },
      {
        id: 'v', title: tk('plotV', 'Velocity \\(v(t)\\)'),
        note: fill(tk('plotVNote', 'A horizontal line; the rectangle under it is the displacement, {dx}.'), { dx: `\\(\\Delta x = v\\,t = ${texNum(dx)}\\,\\text{m}\\)` }),
        cfg: {
          xLabel: 't (s)', yLabel: 'v (m/s)', yUnit: 'm/s',
          series: [{ fn: m.v, color: 'second' }],
          areas: [{ fn: m.v, from: 0, to: m.duration }],
        },
      },
    ]
  },

  events(m) {
    const out = []
    if (m.final) {
      out.push({
        title: tk('evFinal', 'End of the stretch'), t: m.duration,
        lines: [`t = ${texNum(m.duration)}\\,\\text{s}`, `x = x_0 + v\\,t = ${texNum(m.x(m.duration))}\\,\\text{m}`],
      })
    }
    if (Math.abs(m.v0) > 1e-12 && m.x0 * m.v0 < 0) {
      const t0 = -m.x0 / m.v0
      out.push({
        title: tk('evOrigin', 'It passes through the origin'), t: t0 <= m.duration ? t0 : null,
        lines: [`0 = x_0 + v\\,t \\;\\Rightarrow\\; t = -\\frac{x_0}{v} = ${texNum(t0)}\\,\\text{s}`],
      })
    }
    return out
  },

  query: {
    kinds: [{ id: 't', unit: 's' }, { id: 'x', unit: 'm' }],
    answer: (kind, value, m) => answerQuery(kind, value, m),
  },

  legend() {
    return [
      { color: 'primary', label: tex('\\vec v') + ' ' + tk('legendV', 'velocity (constant)') },
      { color: 'muted', label: tk('legendGhost', 'positions at equal time intervals: equally spaced'), dot: true },
    ]
  },

  draw(ctx, w, h, m, time, c) {
    roadScene(ctx, w, h, m, time, c)
  },

  init(page) {
    new AverageModule(document.getElementById('mxAverage'), { key: 'uniform' })
    new EncounterModule(document.getElementById('mxEncounter'), { key: 'uniform', palette: page.c, withAcceleration: false, race: true, presets: ENCOUNTERS })
  },
}

export default {
  main() {
    new TopicPage(topic).main()
  },
}
