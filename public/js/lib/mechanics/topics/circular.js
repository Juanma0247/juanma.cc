// Circular motion: the angular version of the invariant (MCU and MCUA) and
// its links with the radius, the period, the frequency and the tangential and
// centripetal accelerations.

import { t, tex, texNum } from '../core.js'
import { eq } from '../algebra.js'
import { TopicPage } from '../topicPage.js'
import { arrow, ball, mathLabel, readout, text } from '../draw.js'

const tk = (k, f) => t(`circular.${k}`, f)
const POS = [0, Infinity]

const VARS = {
  r: { tex: 'r', dim: 'length', name: 'radius', range: POS, nonzero: true, optional: true },
  th: { tex: '\\theta', dim: 'angle', name: 'angularDisplacement', unit: 'rad' },
  N: { tex: 'N', dim: 'count', name: 'turns' },
  w0: { tex: '\\omega_0', dim: 'angularVelocity', name: 'initialAngularVelocity', range: POS, reject: 'circular.rejectOmega' },
  w: { tex: '\\omega', dim: 'angularVelocity', name: 'finalAngularVelocity', range: POS, reject: 'circular.rejectOmega' },
  al: { tex: '\\alpha', dim: 'angularAcceleration', name: 'angularAcceleration' },
  t: { tex: 't', dim: 'time', name: 'time', range: POS, nonzero: true, reject: 'common.steps.rejectTime' },
  s: { tex: 's', dim: 'length', name: 'arcLength', optional: true },
  v0: { tex: 'v_0', dim: 'velocity', name: 'initialTangentialSpeed', range: POS, optional: true },
  v: { tex: 'v', dim: 'velocity', name: 'tangentialSpeed', range: POS, optional: true },
  at: { tex: 'a_t', dim: 'acceleration', name: 'tangentialAcceleration', optional: true },
  ac: { tex: 'a_c', dim: 'acceleration', name: 'centripetalAcceleration', range: POS, optional: true },
  a: { tex: 'a', dim: 'acceleration', name: 'totalAcceleration', range: POS, optional: true },
  T: { tex: 'T', dim: 'time', name: 'period', range: POS, nonzero: true, optional: true },
  f: { tex: 'f', dim: 'frequency', name: 'frequency', range: POS, nonzero: true, optional: true },
}

const EQS = [
  eq('c1', 'w = w0 + al*t', { lacks: 'th' }),
  eq('c2', 'th = w0*t + 1/2*al*t^2', { lacks: 'w' }),
  eq('c3', 'w^2 = w0^2 + 2*al*th', { lacks: 't' }),
  eq('c4', 'th = 1/2*w0*t + 1/2*w*t', { lacks: 'al', tex: '\\theta = \\tfrac12\\,(\\omega_0 + \\omega)\\,t' }),
  eq('c5', 'th = 2*pi*N', { label: '(N)' }),
  eq('c6', 's = r*th', { label: '(s)' }),
  eq('c7', 'v = r*w', { label: '(v)' }),
  eq('c8', 'v0 = r*w0', { label: '(v_0)' }),
  eq('c9', 'at = r*al', { label: '(a_t)' }),
  eq('c10', 'ac = w^2*r', { label: '(a_c)', tex: 'a_c = \\omega^2 r = \\frac{v^2}{r}' }),
  eq('c11', 'a^2 = at^2 + ac^2', { label: '(a)' }),
  eq('c12', 'w*T = 2*pi', { label: '(T)', tex: 'T = \\frac{2\\pi}{\\omega}' }),
  eq('c13', 'f*T = 1', { label: '(f)', tex: 'f = \\frac{1}{T}' }),
]

const MCU_EQ = eq('cu', 'w0 = w', { label: '(\\text{MCU})' })

const PRESETS = [
  { id: 'motor', data: { w: [2000, 'rpm'], t: [2, 's'] }, condition: 'fromRest', asked: ['al', 'N'] },
  { id: 'point', data: { r: [1, 'm'], f: [30, 'rpm'] }, condition: 'mcu', asked: ['T', 'w', 'v', 'ac'] },
  { id: 'discus', data: { r: [1.06, 'm'], v: [20, 'm/s'] }, condition: 'mcu', asked: ['ac'] },
  { id: 'sling', data: { r: [0.6, 'm'], f: [8, 'Hz'] }, condition: 'mcu', asked: ['v', 'ac'] },
  { id: 'moon', data: { r: [3.82e8, 'm'], T: [27.3, 'd'] }, condition: 'mcu', asked: ['v', 'ac'] },
  { id: 'earth', data: { r: [6.37e6, 'm'], T: [24, 'h'] }, condition: 'mcu', asked: ['ac'] },
  { id: 'ferris', data: { r: [9, 'm'], f: [4, 'rpm'] }, condition: 'mcu', asked: ['ac'] },
  { id: 'train', data: { r: [150, 'm'], v0: [90, 'km/h'], v: [50, 'km/h'], t: [15, 's'] }, asked: ['a'] },
  { id: 'fan', data: { w0: [1200, 'rpm'], t: [8, 's'] }, condition: 'stops', asked: ['al', 'N'] },
]

const state = { cond: 'free' }

const topic = {
  key: 'circular',
  order: ['r', 'w0', 'w', 'al', 't', 'th', 'N', 'v', 'ac', 'T', 'f', 'v0', 'at', 'a', 's'],
  presets: PRESETS,
  conditions: [
    { id: 'free' },
    { id: 'mcu', lock: { al: 0 } },
    { id: 'fromRest', lock: { w0: 0 } },
    { id: 'stops', lock: { w: 0 } },
  ],

  system(page) {
    state.cond = page.condition
    return { vars: VARS, eqs: page.condition === 'mcu' ? [...EQS, MCU_EQ] : EQS }
  },

  why(s) {
    const map = { c5: 'whyN', c6: 'whyS', c7: 'whyV', c8: 'whyV', c9: 'whyAt', c10: 'whyAc', c11: 'whyA', c12: 'whyT', c13: 'whyF', cu: 'whyMCU' }
    const key = map[s.eqId]
    return key ? tk(key, '') || null : null
  },

  variant(vals) {
    if (state.cond === 'mcu' || (Number.isFinite(vals.al) && Math.abs(vals.al) < 1e-12)) {
      return {
        title: tk('variantMCU', 'Variant: uniform circular motion (MCU)'),
        tag: 'α = 0',
        eqs: ['\\omega = \\omega_0 = \\frac{2\\pi}{T} = 2\\pi f', '\\theta(t) = \\theta_0 + \\omega\\,t', 'v = r\\,\\omega,\\qquad a_c = \\frac{v^2}{r} = \\omega^2 r'],
        note: tk('variantMCUNote', 'With α = 0 the angle grows uniformly; the speed is constant but the velocity keeps turning, so there is always a centripetal acceleration towards the centre.'),
      }
    }
    return {
      title: tk('variantMCUA', 'Variant: uniformly accelerated circular motion (MCUA)'),
      tag: 'α = cte',
      eqs: ['\\omega(t) = \\omega_0 + \\alpha\\,t', '\\theta(t) = \\theta_0 + \\omega_0 t + \\tfrac12\\alpha t^2', '\\omega^2 = \\omega_0^2 + 2\\alpha\\,\\theta', 'a_t = r\\,\\alpha,\\qquad a_c = \\omega^2 r'],
      note: tk('variantMCUANote', 'The same invariant as in a straight line, with θ, ω and α in place of x, v and a. The tangential acceleration changes the speed; the centripetal one changes the direction.'),
    }
  },

  motion(vals) {
    const w0 = Number.isFinite(vals.w0) ? vals.w0 : (Number.isFinite(vals.w) && Number.isFinite(vals.al) && Math.abs(vals.al) < 1e-12 ? vals.w : null)
    const al = Number.isFinite(vals.al) ? vals.al : (state.cond === 'mcu' ? 0 : null)
    if (w0 === null || al === null) return null
    const r = Number.isFinite(vals.r) ? vals.r : null
    let T = Number.isFinite(vals.t) ? vals.t : null
    const final = T !== null
    if (T === null) {
      if (al < 0) T = -w0 / al
      else if (w0 > 0) T = Math.min(2 * 2 * Math.PI / w0, 1e9)
      else T = 4
    }
    return {
      r, w0, al, duration: T, final,
      theta: tt => w0 * tt + 0.5 * al * tt * tt,
      omega: tt => w0 + al * tt,
      radiusKnown: r !== null,
    }
  },

  plots(m) {
    const r = m.r ?? 1
    return [
      {
        id: 'th', title: tk('plotTh', 'Angle \\(\\theta(t)\\)'),
        note: tk('plotThNote', 'A straight line in MCU, a parabola in MCUA: the angular version of x(t).'),
        cfg: { xLabel: 't (s)', yLabel: 'θ (rad)', yUnit: 'rad', series: [{ fn: m.theta, color: 'primary' }] },
      },
      {
        id: 'w', title: tk('plotW', 'Angular velocity \\(\\omega(t)\\)'),
        note: tk('plotWNote', 'Slope α; the area under it is the angle swept.'),
        cfg: { xLabel: 't (s)', yLabel: 'ω (rad/s)', yUnit: 'rad/s', series: [{ fn: m.omega, color: 'second' }], areas: [{ fn: m.omega, from: 0, to: m.duration }] },
      },
      {
        id: 'ac', title: tk('plotAc', 'Accelerations \\(a_c\\), \\(a_t\\)'),
        note: m.radiusKnown ? tk('plotAcNote', 'a_c = ω²r grows with the square of ω; a_t = rα is constant (dashed).') : tk('plotAcNoR', 'Shown for r = 1 m: the radius is not given.'),
        cfg: { xLabel: 't (s)', yLabel: 'a (m/s²)', yUnit: 'm/s²', series: [{ fn: tt => m.omega(tt) ** 2 * r, color: 'third' }, { fn: () => m.al * r, color: 'muted', dash: [6, 4] }] },
      },
    ]
  },

  events(m) {
    const out = []
    if (m.w0 > 0 || m.al > 0) {
      const t1 = Math.abs(m.al) < 1e-12 ? 2 * Math.PI / m.w0 : (() => {
        const A = 0.5 * m.al, B = m.w0, C = -2 * Math.PI
        const d = B * B - 4 * A * C
        if (d < 0) return null
        const rr = [(-B + Math.sqrt(d)) / (2 * A), (-B - Math.sqrt(d)) / (2 * A)].filter(x => x > 0)
        return rr.length ? Math.min(...rr) : null
      })()
      if (t1 !== null) {
        out.push({
          title: tk('evTurn', 'First full turn'), t: t1 <= m.duration ? t1 : null,
          cond: tk('evTurnCond', 'θ = 2π rad:'),
          lines: [`t_1 = ${texNum(t1)}\\,\\text{s}`, `\\omega(t_1) = ${texNum(m.omega(t1))}\\,\\text{rad/s}`],
        })
      }
    }
    if (m.al < 0 && m.w0 > 0) {
      const ts = -m.w0 / m.al
      const th = m.theta(ts)
      out.push({
        title: tk('evStop', 'It stops (ω = 0)'), t: ts,
        lines: [`t_d = -\\frac{\\omega_0}{\\alpha} = ${texNum(ts)}\\,\\text{s}`, `\\theta = \\frac{\\omega_0^2}{2|\\alpha|} = ${texNum(th)}\\,\\text{rad} = ${texNum(th / (2 * Math.PI))}\\ \\text{${t('common.units.turns', 'turns')}}`],
      })
    }
    const T = m.duration
    out.push({
      title: tk('evEnd', 'At the end of the interval'), t: T,
      lines: [
        `\\theta = ${texNum(m.theta(T))}\\,\\text{rad} = ${texNum(m.theta(T) / (2 * Math.PI))}\\ \\text{${t('common.units.turns', 'turns')}}`,
        `\\omega = ${texNum(m.omega(T))}\\,\\text{rad/s} = ${texNum(m.omega(T) * 60 / (2 * Math.PI))}\\,\\text{rpm}`,
        ...(m.radiusKnown ? [`v = r\\omega = ${texNum(m.r * m.omega(T))}\\,\\text{m/s},\\quad a_c = ${texNum(m.r * m.omega(T) ** 2)}\\,\\text{m/s}^2`] : []),
      ],
    })
    return out
  },

  query: {
    kinds: [{ id: 't', unit: 's' }, { id: 'N', unit: '' }, { id: 'w', unit: 'rad/s' }],
    answer(kind, value, m) {
      const lines = tt => [
        `\\theta = \\omega_0 t + \\tfrac12\\alpha t^2 = ${texNum(m.theta(tt))}\\,\\text{rad} = ${texNum(m.theta(tt) / (2 * Math.PI))}\\ \\text{${t('common.units.turns', 'turns')}}`,
        `\\omega = \\omega_0 + \\alpha t = ${texNum(m.omega(tt))}\\,\\text{rad/s}`,
        ...(m.radiusKnown ? [`v = r\\omega = ${texNum(m.r * m.omega(tt))}\\,\\text{m/s},\\quad a_c = \\omega^2 r = ${texNum(m.r * m.omega(tt) ** 2)}\\,\\text{m/s}^2`] : []),
      ]
      if (kind === 't') return [{ t: value, lines: lines(value) }]
      if (kind === 'w') {
        if (Math.abs(m.al) < 1e-12) return [{ lines: [{ prose: t('common.query.neverV', 'The velocity is constant and never takes that value.') }] }]
        const tt = (value - m.w0) / m.al
        if (tt < 0) return [{ lines: [{ prose: t('common.query.beforeStart', 'That velocity would have been reached before t = 0, outside the motion.') }] }]
        return [{ t: tt, lines: [`t = \\frac{\\omega - \\omega_0}{\\alpha} = ${texNum(tt)}\\,\\text{s}`, ...lines(tt)] }]
      }
      const th = 2 * Math.PI * value
      let tt
      if (Math.abs(m.al) < 1e-12) tt = m.w0 > 0 ? th / m.w0 : NaN
      else {
        const A = 0.5 * m.al, B = m.w0, C = -th
        const d = B * B - 4 * A * C
        tt = d < 0 ? NaN : Math.min(...[(-B + Math.sqrt(d)) / (2 * A), (-B - Math.sqrt(d)) / (2 * A)].filter(x => x >= 0))
      }
      if (!Number.isFinite(tt)) return [{ lines: [{ prose: tk('neverTurns', 'It never completes that many turns.') }] }]
      return [{ t: tt, lines: [
        `\\theta = 2\\pi N = ${texNum(th)}\\,\\text{rad}`,
        `\\omega^2 = \\omega_0^2 + 2\\alpha\\theta \\;\\Rightarrow\\; \\omega = ${texNum(Math.sqrt(Math.max(0, m.w0 ** 2 + 2 * m.al * th)))}\\,\\text{rad/s}`,
        `t = ${texNum(tt)}\\,\\text{s}`,
      ] }]
    },
  },

  legend() {
    return [
      { color: 'primary', label: tex('\\vec v') + ' ' + tk('legendV', 'tangential velocity') },
      { color: 'third', label: tex('\\vec a_c') + ' ' + tk('legendAc', 'centripetal acceleration') },
      { color: 'second', label: tex('\\vec a_t') + ' ' + tk('legendAt', 'tangential acceleration') },
    ]
  },

  draw(ctx, w, h, m, time, c) {
    const cx = w / 2
    const cy = h / 2 + 4
    const R = Math.min(w, h) * 0.34
    ctx.save()
    ctx.strokeStyle = c.muted
    ctx.lineWidth = 1.4
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([3, 4])
    ctx.beginPath(); ctx.moveTo(cx - R - 16, cy); ctx.lineTo(cx + R + 16, cy); ctx.moveTo(cx, cy - R - 16); ctx.lineTo(cx, cy + R + 16); ctx.stroke()
    ctx.restore()

    const th = m.theta(time)
    const om = m.omega(time)
    // Swept angle (mod one turn, drawn as a sector).
    const sweep = th % (2 * Math.PI)
    ctx.save()
    ctx.fillStyle = c.soft
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 0.45, 0, -sweep, true); ctx.closePath(); ctx.fill()
    ctx.restore()
    mathLabel(ctx, `θ`, cx + R * 0.52 * Math.cos(sweep / 2), cy - R * 0.52 * Math.sin(sweep / 2), { color: c.text, size: 14, align: 'center' })

    const px = cx + R * Math.cos(th)
    const py = cy - R * Math.sin(th)
    ctx.save(); ctx.strokeStyle = c.text; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.restore()
    ball(ctx, cx, cy, 3, c.text)
    mathLabel(ctx, 'r', (cx + px) / 2 + 8 * Math.sin(th), (cy + py) / 2 + 8 * Math.cos(th), { color: c.text, size: 13 })

    const wmax = Math.max(Math.abs(m.w0), Math.abs(m.omega(m.duration)), 1e-9)
    const vLen = (Math.abs(om) / wmax) * R * 0.7
    const tx = -Math.sin(th)
    const ty = -Math.cos(th)
    arrow(ctx, px, py, px + tx * vLen, py + ty * vLen, { color: c.primary, width: 2.6 })
    mathLabel(ctx, 'v', px + tx * (vLen + 12), py + ty * (vLen + 12), { color: c.primary, align: 'center' })
    const acLen = Math.min(R * 0.6, (om * om) / (wmax * wmax) * R * 0.6)
    arrow(ctx, px, py, px + (cx - px) / R * acLen, py + (cy - py) / R * acLen, { color: c.third, width: 2.2 })
    if (Math.abs(m.al) > 1e-12) {
      const atLen = Math.sign(m.al) * R * 0.3
      arrow(ctx, px, py, px + tx * atLen, py + ty * atLen, { color: c.second, width: 2, dash: [5, 3] })
    }
    ball(ctx, px, py, 8, c.primary)
    readout(ctx, c, [
      ['t', time, 's'],
      ['θ', th, 'rad'],
      ['N', th / (2 * Math.PI), t('common.units.turns', 'turns')],
      ['ω', om, 'rad/s'],
    ])
    if (!m.radiusKnown) text(ctx, tk('noRadius', 'r not given'), w - 12, h - 14, { color: c.muted, size: 12, align: 'right' })
  },
}

export default {
  main() {
    new TopicPage(topic).main()
  },
}
