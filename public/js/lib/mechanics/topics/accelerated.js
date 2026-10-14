// Uniformly accelerated (and decelerated) straight-line motion: the invariant
// of the course, Resnick's five constant-acceleration equations, solved for
// whatever the statement leaves unknown.

import { t, fill, tex, texNum } from '../core.js'
import { eq } from '../algebra.js'
import { TopicPage } from '../topicPage.js'
import { roadScene } from '../scenes.js'
import { makeMotion, answerQuery } from '../motion1d.js'
import { EncounterModule } from '../encounter.js'
import { PhasesModule } from '../phases.js'

const tk = (k, f) => t(`accelerated.${k}`, f)

const VARS = {
  v0: { tex: 'v_0', dim: 'velocity', name: 'initialVelocity' },
  v: { tex: 'v', dim: 'velocity', name: 'finalVelocity' },
  a: { tex: 'a', dim: 'acceleration', name: 'acceleration' },
  t: { tex: 't', dim: 'time', name: 'time', range: [0, Infinity], nonzero: true, reject: 'common.steps.rejectTime' },
  dx: { tex: '\\Delta x', dim: 'length', name: 'displacement' },
  x0: { tex: 'x_0', dim: 'length', name: 'initialPosition', optional: true },
  x: { tex: 'x', dim: 'length', name: 'finalPosition', optional: true },
}

const EQS = [
  eq('k1', 'v = v0 + a*t', { lacks: 'dx' }),
  eq('k2', 'dx = v0*t + 1/2*a*t^2', { lacks: 'v' }),
  eq('k3', 'v^2 = v0^2 + 2*a*dx', { lacks: 't' }),
  eq('k4', 'dx = 1/2*v0*t + 1/2*v*t', { lacks: 'a', tex: '\\Delta x = \\tfrac12\\,(v_0 + v)\\,t' }),
  eq('k5', 'dx = v*t - 1/2*a*t^2', { lacks: 'v0' }),
  eq('k6', 'dx = x - x0', { label: '(\\Delta)' }),
]

const PRESETS = [
  { id: 'tree', data: { a: [-5.6, 'm/s2'], t: [4.2, 's'], dx: [62.4, 'm'] }, asked: ['v'] },
  { id: 'porsche', data: { v0: [85, 'km/h'], v: [45, 'km/h'], dx: [105, 'm'] }, asked: ['a', 't'] },
  { id: 'jet', data: { v0: [100, 'm/s'], a: [-5, 'm/s2'] }, condition: 'stops', asked: ['t', 'dx'] },
  { id: 'truck', data: { dx: [40, 'm'], t: [8.5, 's'], v: [2.8, 'm/s'] }, asked: ['v0', 'a'] },
  { id: 'glider', data: { v0: [12, 'cm/s'], x0: [3, 'cm'], t: [2, 's'], x: [-5, 'cm'] }, asked: ['a'] },
  { id: 'electron', data: { v0: [2e4, 'm/s'], v: [6e6, 'm/s'], dx: [1.5, 'cm'] }, asked: ['t', 'a'] },
  { id: 'airAcc', data: { v0: [13, 'm/s'], a: [4, 'm/s2'], t: [2.5, 's'] }, asked: ['v'] },
  { id: 'sled', data: { v0: [632, 'mi/h'], t: [1.4, 's'] }, condition: 'stops', asked: ['a', 'dx'] },
]

const ENCOUNTERS = [
  {
    id: 'police',
    bodies: [
      { x0: 0, phases: [{ v: 45, a: 0 }] },
      { x0: 0, delay: 1, phases: [{ v: 0, a: 3 }] },
    ],
  },
  {
    id: 'kathyStan',
    bodies: [
      { x0: 0, delay: 1, phases: [{ v: 0, a: 4.9 }] },
      { x0: 0, phases: [{ v: 0, a: 3.5 }] },
    ],
  },
  {
    id: 'speedySue',
    bodies: [
      { x0: 0, stopAtRest: true, phases: [{ v: 30, a: -2 }] },
      { x0: 155, phases: [{ v: 5, a: 0 }] },
    ],
  },
  {
    id: 'bikeCar',
    bodies: [
      { x0: 0, phases: [{ dt: 22.352 / 4.0234, v: 0, a: 4.0234 }, { v: null, a: 0 }] },
      { x0: 0, phases: [{ dt: 8.9408 / 5.8115, v: 0, a: 5.8115 }, { v: null, a: 0 }] },
    ],
  },
]

const topic = {
  key: 'accelerated',
  order: ['v0', 'v', 'a', 't', 'dx', 'x0', 'x'],
  presets: PRESETS,
  conditions: [
    { id: 'free' },
    { id: 'fromRest', lock: { v0: 0 } },
    { id: 'stops', lock: { v: 0 } },
  ],

  system() {
    return { vars: VARS, eqs: EQS }
  },

  why(s) {
    if (s.eqId === 'k6') {
      return fill(tk('whyDelta', 'The displacement is the change of position, {eq}; it links {u} with the quantities already known.'), {
        eq: '\\(\\Delta x = x - x_0\\)',
        u: `\\(${VARS[s.unknown].tex}\\)`,
      })
    }
    return null
  },

  variant(vals) {
    const { v0, a } = vals
    if (!Number.isFinite(a)) return null
    if (Math.abs(a) < 1e-12) {
      return {
        title: tk('variantMU', 'Variant: uniform motion (MU)'),
        tag: 'a = 0',
        eqs: ['V(t) = V_o', 'S(t) = V_o\\,t', 'V(t)^2 = V_o^2'],
        note: tk('variantMUNote', 'With a = 0 the invariant collapses: the velocity never changes and the displacement grows linearly with time.'),
      }
    }
    const slowing = Number.isFinite(v0) && Math.abs(v0) > 1e-12 && a * v0 < 0
    if (slowing) {
      return {
        title: tk('variantMUR', 'Variant: uniformly retarded motion (MUR)'),
        tag: tk('tagOpposed', 'a opposes v'),
        eqs: ['V(t) = V_o - a\\,t', 'V(t)^2 = V_o^2 - 2a\\,S', 'S(t) = V_o\\,t - \\tfrac{a\\,t^2}{2}'],
        note: tk('variantMURNote', 'Here a is written as a magnitude and the sign is carried by the equations: the speed decreases, so the acceleration is taken as negative with respect to the motion.'),
      }
    }
    return {
      title: tk('variantMUA', 'Variant: uniformly accelerated motion (MUA)'),
      tag: tk('tagAlong', 'a along v'),
      eqs: ['V(t) = V_o + a\\,t', 'V(t)^2 = V_o^2 + 2a\\,S', 'S(t) = V_o\\,t + \\tfrac{a\\,t^2}{2}'],
      note: tk('variantMUANote', 'The acceleration points along the velocity, so the speed grows; the course takes a positive whenever the speed increases.'),
    }
  },

  motion(vals) {
    const { v0, a } = vals
    if (!Number.isFinite(v0) || !Number.isFinite(a)) return null
    const x0 = Number.isFinite(vals.x0) ? vals.x0 : 0
    let t1 = Number.isFinite(vals.t) && vals.t > 0 ? vals.t : null
    const final = t1 !== null
    if (!final) {
      const stop = a * v0 < 0 ? -v0 / a : null
      t1 = stop && stop > 0 ? stop : 5
    }
    const m = makeMotion({ x0, v0, a })
    m.duration = t1
    m.final = final
    return m
  },

  plots(m) {
    const dx = m.x(m.duration) - m.x0
    return [
      {
        id: 'x', title: tk('plotX', 'Position \\(x(t)\\)'),
        note: fill(tk('plotXNote', 'A parabola whose slope at each instant is the velocity; the dashed secant has slope {v}, the average velocity of the stretch.'), { v: `\\(\\bar v = ${texNum(dx / m.duration)}\\,\\text{m/s}\\)` }),
        cfg: {
          xLabel: 't (s)', yLabel: 'x (m)', yUnit: 'm',
          series: [{ fn: m.x, color: 'primary' }],
          lines: [{ x1: 0, y1: m.x0, x2: m.duration, y2: m.x(m.duration), color: 'third', keepInRange: true }],
          marks: [{ t: 0, y: m.x0, label: 'x₀' }, { t: m.duration, y: m.x(m.duration), label: m.final ? 'x' : '' }],
        },
      },
      {
        id: 'v', title: tk('plotV', 'Velocity \\(v(t)\\)'),
        note: fill(tk('plotVNote', 'A straight line of slope a. The shaded area is the displacement: {dx}.'), { dx: `\\(\\Delta x = ${texNum(dx)}\\,\\text{m}\\)` }),
        cfg: {
          xLabel: 't (s)', yLabel: 'v (m/s)', yUnit: 'm/s',
          series: [{ fn: m.v, color: 'second' }],
          areas: [{ fn: m.v, from: 0, to: m.duration }],
        },
      },
      {
        id: 'a', title: tk('plotA', 'Acceleration \\(a(t)\\)'),
        note: fill(tk('plotANote', 'Constant. The area under it is the change of velocity: {dv}.'), { dv: `\\(\\Delta v = ${texNum(m.a * m.duration)}\\,\\text{m/s}\\)` }),
        cfg: {
          xLabel: 't (s)', yLabel: 'a (m/s²)', yUnit: 'm/s²',
          series: [{ fn: () => m.a, color: 'third' }],
          areas: [{ fn: () => m.a, from: 0, to: m.duration }],
        },
      },
    ]
  },

  events(m) {
    const out = []
    if (m.final) {
      out.push({
        title: tk('evFinal', 'End of the stretch'), t: m.duration,
        lines: [`t = ${texNum(m.duration)}\\,\\text{s}`, `x = ${texNum(m.x(m.duration))}\\,\\text{m}`, `v = ${texNum(m.v(m.duration))}\\,\\text{m/s}`],
      })
    }
    if (Math.abs(m.a) > 1e-12 && m.a * m.v0 < 0) {
      const ts = -m.v0 / m.a
      out.push({
        title: tk('evStop', 'It stops (v = 0)'), t: ts <= m.duration ? ts : null,
        cond: tk('evStopCond', 'Setting v = 0 in the first equation of the invariant:'),
        lines: [
          `t_d = -\\frac{v_0}{a} = -\\frac{${texNum(m.v0)}}{${texNum(m.a)}} = ${texNum(ts)}\\,\\text{s}`,
          `x_d = x_0 - \\frac{v_0^2}{2a} = ${texNum(m.x(ts))}\\,\\text{m}`,
        ],
      })
      const tr = 2 * ts
      out.push({
        title: tk('evReturn', 'Back at the starting point'), t: tr <= m.duration ? tr : null,
        cond: tk('evReturnCond', 'If the acceleration keeps acting, Δx = 0 again at twice the stopping time:'),
        lines: [`t = -\\frac{2v_0}{a} = ${texNum(tr)}\\,\\text{s}`, `v = -v_0 = ${texNum(m.v(tr))}\\,\\text{m/s}`],
      })
    }
    const avg = (m.x(m.duration) - m.x0) / m.duration
    out.push({
      title: tk('evAverage', 'Average velocity'),
      cond: tk('evAverageCond', 'With constant acceleration the average velocity is the mean of the initial and final velocities:'),
      lines: [`\\bar v = \\frac{v_0 + v}{2} = \\frac{\\Delta x}{t} = ${texNum(avg)}\\,\\text{m/s}`],
    })
    return out
  },

  query: {
    kinds: [{ id: 't', unit: 's' }, { id: 'x', unit: 'm' }, { id: 'v', unit: 'm/s' }],
    answer: (kind, value, m) => answerQuery(kind, value, m),
  },

  legend() {
    return [
      { color: 'primary', label: tex('\\vec v') + ' ' + tk('legendV', 'velocity') },
      { color: 'second', label: tex('\\vec a') + ' ' + tk('legendA', 'acceleration') },
      { color: 'muted', label: tk('legendGhost', 'positions at equal time intervals'), dot: true },
    ]
  },

  draw(ctx, w, h, m, time, c) {
    roadScene(ctx, w, h, m, time, c)
  },

  init(page) {
    new EncounterModule(document.getElementById('mxEncounter'), { key: 'accelerated', palette: page.c, withAcceleration: true, presets: ENCOUNTERS })
    new PhasesModule(document.getElementById('mxPhases'), { key: 'accelerated', palette: page.c })
  },
}

export default {
  main() {
    new TopicPage(topic).main()
  },
}
