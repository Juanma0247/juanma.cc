// Projectile motion: uniform motion along x plus a vertical throw along y,
// linked by the common time t. The trajectory equation, obtained by removing
// t, lets the solver aim at a target (find the angle or the launch speed).

import { t, fill, tex, texNum, fmt } from '../core.js'
import { eq } from '../algebra.js'
import { TopicPage } from '../topicPage.js'
import { View, arrow, ground, building, ball, mathLabel, readout, trail, dimLine, arcAngle, ruler, vruler } from '../draw.js'

const tk = (k, f) => t(`projectile.${k}`, f)
const HALF_PI = Math.PI / 2

const VARS = {
  v0: { tex: 'v_0', dim: 'velocity', name: 'launchSpeed', range: [0, Infinity], nonzero: true, reject: 'common.steps.rejectSpeed' },
  th: { tex: '\\theta', dim: 'angle', name: 'launchAngle', unit: 'deg', range: [-HALF_PI, HALF_PI], reject: 'projectile.rejectAngle' },
  y0: { tex: 'y_0', dim: 'length', name: 'launchHeight', range: [0, Infinity], optional: true },
  t: { tex: 't', dim: 'time', name: 'time', range: [0, Infinity], nonzero: true, reject: 'common.steps.rejectTime' },
  dx: { tex: '\\Delta x', dim: 'length', name: 'horizontalDisplacement', range: [0, Infinity] },
  dy: { tex: '\\Delta y', dim: 'length', name: 'verticalDisplacement' },
  y: { tex: 'y', dim: 'length', name: 'finalHeight', optional: true },
  vy: { tex: 'v_y', dim: 'velocity', name: 'vy' },
  v: { tex: 'v', dim: 'velocity', name: 'speed', range: [0, Infinity], reject: 'common.steps.rejectSpeed' },
  ph: { tex: '\\varphi', dim: 'angle', name: 'finalAngle', unit: 'deg', range: [-HALF_PI, HALF_PI] },
  v0x: { tex: 'v_{0x}', dim: 'velocity', name: 'v0x' },
  v0y: { tex: 'v_{0y}', dim: 'velocity', name: 'v0y' },
  vx: { tex: 'v_x', dim: 'velocity', name: 'vx' },
  g: { tex: 'g', dim: 'acceleration', name: 'gravity' },
}

const EQS = [
  eq('p1', 'v0x = v0*cos(th)', { label: '(1)' }),
  eq('p2', 'v0y = v0*sin(th)', { label: '(2)' }),
  eq('p3', 'dx = v0x*t', { label: '(3)' }),
  eq('p4', 'dy = v0y*t - 1/2*g*t^2', { label: '(4)' }),
  eq('p5', 'vx = v0x', { label: '(5)' }),
  eq('p6', 'vy = v0y - g*t', { label: '(6)' }),
  eq('p7', 'vy^2 = v0y^2 - 2*g*dy', { label: '(7)' }),
  eq('p8', 'v^2 = vx^2 + vy^2', { label: '(8)' }),
  eq('p9', 'dy = dx*tan(th) - 1/2*g*dx^2/v0^2 - 1/2*g*dx^2*tan(th)^2/v0^2', {
    label: '(T)',
    tex: '\\Delta y = \\Delta x\\tan\\theta - \\frac{g\\,\\Delta x^2}{2v_0^2\\cos^2\\theta}',
  }),
  eq('p10', 'tan(ph)*vx = vy', { label: '(\\varphi)', tex: '\\tan\\varphi = \\frac{v_y}{v_x}' }),
  eq('p11', 'y = y0 + dy', { label: '(y)' }),
]

const PRESETS = [
  { id: 'building', data: { v0: [20, 'm/s'], th: [30, 'deg'], y0: [45, 'm'] }, condition: 'ground', asked: ['t', 'v'] },
  { id: 'soccer', data: { v0: [15.5, 'm/s'], th: [36, 'deg'] }, condition: 'sameLevel', asked: ['t', 'dx'] },
  { id: 'cannonTarget', data: { v0: [1000, 'm/s'], dx: [2000, 'm'], dy: [800, 'm'] }, asked: ['th'] },
  { id: 'cannon20', data: { v0: [200, 'm/s'], th: [40, 'deg'], t: [20, 's'] }, asked: ['dx', 'dy', 'v'] },
  { id: 'wall', data: { th: [45, 'deg'], dx: [15, 'm'], dy: [3.5, 'm'] }, asked: ['v0'] },
  { id: 'bomber', data: { v0: [720, 'km/h'], th: [0, 'deg'], y0: [7840, 'm'] }, condition: 'ground', asked: ['v', 'dx'] },
  { id: 'window', data: { v0: [8, 'm/s'], th: [-20, 'deg'], t: [3, 's'] }, condition: 'ground', asked: ['dx', 'y0'] },
  { id: 'fieldGoal', data: { v0: [20, 'm/s'], th: [53, 'deg'], dx: [36, 'm'] }, asked: ['dy'] },
  { id: 'motorcycle', data: { th: [53, 'deg'], dx: [40, 'm'], dy: [-15, 'm'] }, asked: ['v0'] },
  { id: 'package', data: { v0: [155, 'km/h'], th: [0, 'deg'], y0: [225, 'm'] }, condition: 'ground', asked: ['t', 'dx'] },
]

const topic = {
  key: 'projectile',
  usesG: true,
  order: ['v0', 'th', 'y0', 't', 'dx', 'dy', 'y', 'vy', 'v', 'ph'],
  presets: PRESETS,
  conditions: [
    { id: 'free' },
    { id: 'ground', lock: { y: 0 } },
    { id: 'sameLevel', lock: { dy: 0 } },
    { id: 'maxHeight', lock: { vy: 0 } },
  ],

  system() {
    return { vars: VARS, eqs: EQS }
  },

  fixed(page) {
    return { g: page.g }
  },

  why(s) {
    const map = {
      p1: 'whyComp', p2: 'whyComp', p3: 'whyX', p4: 'whyY', p5: 'whyVx', p6: 'whyVy', p7: 'whyVy2', p8: 'whyPyth', p9: 'whyTraj', p10: 'whyPhi', p11: 'whyHeight',
    }
    const key = map[s.eqId]
    if (!key) return null
    return fill(tk(key, ''), { u: `\\(${VARS[s.unknown].tex}\\)` }) || null
  },

  branchName(br, i) {
    const lab = br.label.find(l => l.u === 'th')
    if (lab) return fill(tk('branchAngle', 'θ = {a}°'), { a: fmt(lab.value * 180 / Math.PI, 4) })
    return null
  },

  variant() {
    return {
      title: tk('variantTitle', 'Variant: two simultaneous motions'),
      tag: tk('variantTag', 'MU in x · vertical throw in y'),
      eqs: [
        'x = (V_o\\cos\\theta)\\,t',
        'y = (V_o\\sin\\theta)\\,t - \\tfrac12 g\\,t^2',
        'y = x\\tan\\theta - \\frac{g\\,x^2}{2(V_o\\cos\\theta)^2}',
        'Y_{\\text{máx}} = \\frac{V_o^2\\sin^2\\theta}{2g},\\quad X = \\frac{V_o^2\\sin 2\\theta}{g}',
      ],
      note: tk('variantNote', 'Along x there is no acceleration (uniform motion) and along y the acceleration is −g (a vertical throw with Voy = Vo sin θ). Eliminating t gives the parabola; the last line holds only when the projectile lands at the launch level.'),
    }
  },

  motion(vals, page) {
    const g = page.g
    if (!Number.isFinite(vals.v0) || !Number.isFinite(vals.th)) return null
    const y0 = Number.isFinite(vals.y0) ? vals.y0 : (Number.isFinite(vals.y) && Number.isFinite(vals.dy) ? vals.y - vals.dy : 0)
    const vx0 = vals.v0 * Math.cos(vals.th)
    const vy0 = vals.v0 * Math.sin(vals.th)
    const m = {
      g, y0, vx0, vy0, v0: vals.v0, th: vals.th,
      x: tt => vx0 * tt,
      y: tt => y0 + vy0 * tt - 0.5 * g * tt * tt,
      vx: () => vx0,
      vy: tt => vy0 - g * tt,
    }
    const disc = vy0 * vy0 + 2 * g * y0
    m.tGround = disc >= 0 ? (vy0 + Math.sqrt(disc)) / g : null
    m.tEnd = Number.isFinite(vals.t) ? vals.t : null
    m.duration = Math.max(m.tGround ?? 0, m.tEnd ?? 0) || 1
    m.tTop = vy0 > 0 ? vy0 / g : null
    const given = page.given ?? {}
    m.target = Number.isFinite(given.dx) && Number.isFinite(given.dy) ? { x: given.dx, y: y0 + given.dy } : null
    return m
  },

  plots(m) {
    const marks = m.tEnd !== null ? [{ t: m.tEnd, y: m.y(m.tEnd), label: 't', color: 'second' }] : []
    return [
      {
        id: 'x', title: tk('plotX', 'Horizontal position \\(x(t)\\)'),
        note: tk('plotXNote', 'A straight line: along x the motion is uniform.'),
        cfg: { xLabel: 't (s)', yLabel: 'x (m)', yUnit: 'm', series: [{ fn: m.x, color: 'primary' }] },
      },
      {
        id: 'y', title: tk('plotY', 'Height \\(y(t)\\)'),
        note: tk('plotYNote', 'A parabola: along y it is a vertical throw.'),
        cfg: { xLabel: 't (s)', yLabel: 'y (m)', yUnit: 'm', series: [{ fn: m.y, color: 'primary' }], marks: [...(m.tTop ? [{ t: m.tTop, y: m.y(m.tTop), label: 'máx' }] : []), ...marks] },
      },
      {
        id: 'v', title: tk('plotV', 'Components \\(v_x\\), \\(v_y\\)'),
        note: tk('plotVNote', 'vₓ stays constant; v_y decreases at the rate g and is zero at the top.'),
        cfg: { xLabel: 't (s)', yLabel: 'v (m/s)', yUnit: 'm/s', series: [{ fn: m.vy, color: 'second' }, { fn: m.vx, color: 'third', dash: [6, 4] }] },
      },
    ]
  },

  events(m) {
    const out = []
    const g = m.g
    if (m.tTop !== null) {
      out.push({
        title: tk('evTop', 'Maximum height'), t: m.tTop,
        cond: tk('evTopCond', 'The vertical component vanishes, v_y = v₀ sin θ − g t = 0:'),
        lines: [
          `t_s = \\frac{v_0\\sin\\theta}{g} = ${texNum(m.tTop)}\\,\\text{s}`,
          `y_{\\text{máx}} = y_0 + \\frac{v_0^2\\sin^2\\theta}{2g} = ${texNum(m.y(m.tTop))}\\,\\text{m}`,
          `x = ${texNum(m.x(m.tTop))}\\,\\text{m}`,
        ],
      })
      const tl = 2 * m.tTop
      out.push({
        title: tk('evLevel', 'Back at the launch level'), t: tl <= m.duration + 1e-9 ? tl : null,
        cond: tk('evLevelCond', 'Twice the rising time; the horizontal distance is the range formula:'),
        lines: [`t_v = \\frac{2v_0\\sin\\theta}{g} = ${texNum(tl)}\\,\\text{s}`, `X = \\frac{v_0^2\\sin 2\\theta}{g} = ${texNum(m.x(tl))}\\,\\text{m}`],
      })
    }
    if (m.tGround !== null && m.y0 > 1e-9) {
      const tg = m.tGround
      const vy = m.vy(tg)
      out.push({
        title: tk('evGround', 'It reaches the ground'), t: tg,
        cond: tk('evGroundCond', 'y = 0 in y = y₀ + v₀ sin θ · t − ½ g t² (positive root):'),
        lines: [
          `t = ${texNum(tg)}\\,\\text{s},\\quad x = ${texNum(m.x(tg))}\\,\\text{m}`,
          `v = \\sqrt{v_x^2 + v_y^2} = \\sqrt{(${texNum(m.vx0)})^2 + (${texNum(vy)})^2} = ${texNum(Math.hypot(m.vx0, vy))}\\,\\text{m/s}`,
          `\\varphi = \\tan^{-1}\\frac{v_y}{v_x} = ${texNum(Math.atan2(vy, m.vx0) * 180 / Math.PI)}^\\circ`,
        ],
      })
    }
    return out
  },

  query: {
    kinds: [{ id: 't', unit: 's' }, { id: 'x', unit: 'm' }, { id: 'y', unit: 'm' }],
    answer(kind, value, m) {
      const at = tt => [
        `x = (v_0\\cos\\theta)\\,t = (${texNum(m.vx0)})(${texNum(tt)}) = ${texNum(m.x(tt))}\\,\\text{m}`,
        `y = y_0 + (v_0\\sin\\theta)\\,t - \\tfrac12 g t^2 = ${texNum(m.y(tt))}\\,\\text{m}`,
        `v_x = ${texNum(m.vx0)}\\,\\text{m/s},\\quad v_y = ${texNum(m.vy(tt))}\\,\\text{m/s},\\quad v = ${texNum(Math.hypot(m.vx0, m.vy(tt)))}\\,\\text{m/s}`,
      ]
      if (kind === 't') return [{ t: value, lines: at(value) }]
      if (kind === 'x') {
        if (Math.abs(m.vx0) < 1e-12) return [{ lines: [{ prose: tk('noX', 'The launch is vertical: x never changes.') }] }]
        const tt = value / m.vx0
        if (tt < 0) return [{ lines: [{ prose: t('common.query.never', 'There is no non-negative real root: the body never passes through that point.') }] }]
        return [{ t: tt, lines: [`t = \\frac{x}{v_0\\cos\\theta} = \\frac{${texNum(value)}}{${texNum(m.vx0)}} = ${texNum(tt)}\\,\\text{s}`, ...at(tt)] }]
      }
      const A = -0.5 * m.g
      const B = m.vy0
      const C = m.y0 - value
      const d = B * B - 4 * A * C
      if (d < 0) return [{ lines: [{ prose: tk('tooHigh', 'The projectile never reaches that height.') }] }]
      const roots = [(-B + Math.sqrt(d)) / (2 * A), (-B - Math.sqrt(d)) / (2 * A)].filter(r => r >= 0).sort((p, q) => p - q)
      return roots.map((r, i) => ({ t: r, title: fill(t('common.query.passN', 'Pass {n}: t = {t}'), { n: i + 1, t: `\\(${texNum(r)}\\,\\text{s}\\)` }), lines: at(r) }))
    },
  },

  legend() {
    return [
      { color: 'primary', label: tex('\\vec v') + ' ' + tk('legendV', 'velocity') },
      { color: 'third', label: tex('v_x,\\ v_y') + ' ' + tk('legendComp', 'components') },
      { color: 'second', label: tex('\\vec g') },
      { color: 'muted', label: tk('legendGhost', 'positions at equal time intervals'), dot: true },
    ]
  },

  draw(ctx, w, h, m, time, c) {
    const T = m.duration
    let x0 = 0
    let x1 = 0
    let y0 = Math.min(0, m.y0)
    let y1 = m.y0
    const pts = []
    for (let i = 0; i <= 120; i++) {
      const tt = T * i / 120
      const x = m.x(tt)
      const y = m.y(tt)
      pts.push([x, y])
      x0 = Math.min(x0, x); x1 = Math.max(x1, x)
      y0 = Math.min(y0, y); y1 = Math.max(y1, y)
    }
    if (m.target) { x0 = Math.min(x0, m.target.x); x1 = Math.max(x1, m.target.x); y1 = Math.max(y1, m.target.y); y0 = Math.min(y0, m.target.y) }
    const span = Math.max(x1 - x0, y1 - y0, 1e-6)
    const view = new View(w, h, [x0 - span * 0.06, x1 + span * 0.06, y0 - span * 0.04, y1 + span * 0.08], { l: 52, r: 18, t: 22, b: 30 })
    if (m.y0 > 1e-9) building(ctx, view, x0 - span * 0.08, span * 0.08, m.y0, c)
    ground(ctx, view, Math.min(0, y0), x0 - span * 0.1, x1 + span * 0.1, c)
    ruler(ctx, view, x0, x1, Math.min(0, y0), c)
    vruler(ctx, view, Math.min(0, y0), y1, x0 - span * 0.05, c)
    trail(ctx, pts.map(([x, y]) => [view.X(x), view.Y(y)]), c.muted, { dash: [4, 4], alpha: 0.6 })

    for (let i = 0; i <= 10; i++) {
      const tt = T * i / 10
      ball(ctx, view.X(m.x(tt)), view.Y(m.y(tt)), 2.8, c.muted)
    }
    if (m.tTop !== null) {
      const xt = m.x(m.tTop)
      const yt = m.y(m.tTop)
      dimLine(ctx, view.X(xt), view.Y(Math.min(0, y0)), view.X(xt), view.Y(yt), `${fmt(yt - Math.min(0, y0), 3)} m`, { color: c.third, size: 11, side: -1 })
    }
    if (m.target) {
      const px = view.X(m.target.x)
      const py = view.Y(m.target.y)
      ctx.save(); ctx.strokeStyle = c.third; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(px - 7, py - 7); ctx.lineTo(px + 7, py + 7); ctx.moveTo(px + 7, py - 7); ctx.lineTo(px - 7, py + 7); ctx.stroke(); ctx.restore()
    }
    arcAngle(ctx, view.X(0), view.Y(m.y0), 26, 0, m.th, c.third, 'θ')

    const x = m.x(time)
    const y = m.y(time)
    const px = view.X(x)
    const py = view.Y(y)
    const scale = Math.min(70, h * 0.16) / Math.max(m.v0, 1e-9)
    const vx = m.vx0 * scale
    const vy = m.vy(time) * scale
    arrow(ctx, px, py, px + vx, py, { color: c.third, width: 1.8, dash: [4, 3] })
    arrow(ctx, px, py, px, py - vy, { color: c.third, width: 1.8, dash: [4, 3] })
    arrow(ctx, px, py, px + vx, py - vy, { color: c.primary, width: 2.6 })
    mathLabel(ctx, 'v', px + vx + 8, py - vy, { color: c.primary })
    arrow(ctx, px, py, px, py + 30, { color: c.second, width: 2 })
    ball(ctx, px, py, 7, c.primary)
    readout(ctx, c, [['t', time, 's'], ['x', x, 'm'], ['y', y, 'm'], ['v', Math.hypot(m.vx0, m.vy(time)), 'm/s']], w - 150, 16)
  },
}

export default {
  main() {
    new TopicPage(topic).main()
  },
}
