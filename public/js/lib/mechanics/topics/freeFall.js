// Free fall from rest. The page keeps the notation of the course: magnitudes
// measured downwards, H for the height fallen and V for the speed, so that
// the variant reads V = gt, V² = 2gH, H = gt²/2.

import { t, fill, h, tex, texNum } from '../core.js'
import { eq } from '../algebra.js'
import { TopicPage } from '../topicPage.js'
import { verticalScene } from '../scenes.js'

const tk = (k, f) => t(`freeFall.${k}`, f)

const VARS = {
  H: { tex: 'H', dim: 'length', name: 'fallHeight', range: [0, Infinity], reject: 'common.steps.rejectSpeed' },
  V: { tex: 'V', dim: 'velocity', name: 'impactSpeed', range: [0, Infinity], reject: 'common.steps.rejectSpeed' },
  t: { tex: 't', dim: 'time', name: 'time', range: [0, Infinity], nonzero: true, reject: 'common.steps.rejectTime' },
  h0: { tex: 'h_0', dim: 'length', name: 'launchHeight', range: [0, Infinity], optional: true },
  y: { tex: 'y', dim: 'length', name: 'finalHeight', optional: true },
  u: { tex: 'u', dim: 'velocity', name: 'companionSpeed', optional: true },
  d: { tex: 'd', dim: 'length', name: 'companionDistance', optional: true },
  g: { tex: 'g', dim: 'acceleration', name: 'gravity', range: [0, Infinity], nonzero: true },
}

const EQS = [
  eq('f1', 'V = g*t', { lacks: 'H' }),
  eq('f2', 'V^2 = 2*g*H', { lacks: 't' }),
  eq('f3', 'H = 1/2*g*t^2', { lacks: 'V' }),
  eq('f4', 'H = 1/2*V*t', { lacks: 'g' }),
  eq('f5', 'y = h0 - H', { label: '(y)' }),
  eq('f6', 'd = u*t', { label: '(\\text{MU})' }),
]

const PRESETS = [
  { id: 'resnick', data: { t: [1, 's'] }, asked: ['H', 'V'] },
  { id: 'cowboy', data: { H: [3, 'm'], u: [10, 'm/s'] }, asked: ['t', 'd'] },
  { id: 'building', data: { h0: [45, 'm'] }, condition: 'ground', asked: ['t', 'V'] },
  { id: 'bill', data: { t: [0.2, 's'] }, asked: ['H'] },
  { id: 'cat', data: { t: [0.1, 's'] }, asked: ['H', 'V'] },
  { id: 'speed', data: { V: [20, 'm/s'] }, asked: ['H', 't'] },
  { id: 'planet', data: { H: [10, 'm'], t: [3.51, 's'] }, options: { unknownG: true }, asked: ['V'] },
]

const state = { unknownG: false }

const topic = {
  key: 'freeFall',
  usesG: true,
  order: ['H', 'V', 't', 'h0', 'y', 'u', 'd'],
  presets: PRESETS,
  options: { unknownG: false },
  conditions: [
    { id: 'free' },
    { id: 'ground', lock: { y: 0 } },
  ],

  system() {
    return { vars: VARS, eqs: EQS }
  },

  fixed(page) {
    return state.unknownG ? {} : { g: page.g }
  },

  syncOptions(page) {
    state.unknownG = !!page.options.unknownG
    if (page.gCheck) page.gCheck.checked = state.unknownG
  },

  extraControls(box, page) {
    const cb = h('input', { type: 'checkbox' })
    cb.addEventListener('change', () => { state.unknownG = cb.checked; page.options.unknownG = cb.checked; page.update() })
    page.gCheck = cb
    box.append(h('label', { class: 'checkbox' }, cb,
      h('span', { class: 'box', html: '<svg viewBox="0 0 16 16"><path d="M3 8.5 L6.5 12 L13 4" /></svg>' }),
      h('span', { class: 'checkbox-label', style: 'font-size:.85rem', 'data-mx': 'unknownG' }, tk('unknownG', 'g is unknown (another planet)'))))
  },

  retranslate(page) {
    document.querySelector('[data-mx="unknownG"]').textContent = tk('unknownG', 'g is unknown (another planet)')
  },

  why(s) {
    if (s.eqId === 'f5') return fill(tk('whyY', 'The height above the ground is the starting height minus what it has fallen: {eq}.'), { eq: '\\(y = h_0 - H\\)' })
    if (s.eqId === 'f6') return fill(tk('whyMU', 'While the body falls, the companion moves uniformly for the same time t: {eq}. The time is the link between both motions.'), { eq: '\\(d = u\\,t\\)' })
    return null
  },

  variant() {
    return {
      title: tk('variantTitle', 'Variant: free fall'),
      tag: 'V_o = 0, a = g',
      eqs: ['V(t) = g\\,t', 'V(t)^2 = 2g\\,H', 'H(t) = \\frac{g\\,t^2}{2}'],
      note: tk('variantNote', 'Applying to the invariant the conditions of free fall: it starts from rest (Vo = 0) and the acceleration is g, positive because the speed increases. H is measured downwards from the release point.'),
    }
  },

  motion(vals, page) {
    const g = Number.isFinite(vals.g) ? vals.g : page.g
    let T = Number.isFinite(vals.t) ? vals.t : null
    const h0 = Number.isFinite(vals.h0) ? vals.h0 : (Number.isFinite(vals.H) ? vals.H : null)
    if (T === null && Number.isFinite(vals.H)) T = Math.sqrt(2 * vals.H / g)
    if (T === null && h0 !== null) T = Math.sqrt(2 * h0 / g)
    if (T === null) return null
    const top = h0 ?? 0.5 * g * T * T
    return {
      g, y0: top, duration: T, building: Number.isFinite(vals.h0),
      y: tt => top - 0.5 * g * tt * tt,
      v: tt => -g * tt,
      fallen: tt => 0.5 * g * tt * tt,
      speed: tt => g * tt,
      ground: Number.isFinite(vals.h0) ? Math.sqrt(2 * vals.h0 / g) : null,
    }
  },

  plots(m) {
    return [
      {
        id: 'H', title: tk('plotH', 'Height fallen \\(H(t)\\)'),
        note: tk('plotHNote', 'A half parabola: equal intervals of time cover distances in the ratio 1 : 3 : 5 : 7…, Galileo’s law of odd numbers.'),
        cfg: { xLabel: 't (s)', yLabel: 'H (m)', yUnit: 'm', series: [{ fn: m.fallen, color: 'primary' }] },
      },
      {
        id: 'V', title: tk('plotV', 'Speed \\(V(t)\\)'),
        note: fill(tk('plotVNote', 'A straight line of slope g; the shaded area is the height fallen, {H}.'), { H: `\\(${texNum(m.fallen(m.duration))}\\,\\text{m}\\)` }),
        cfg: { xLabel: 't (s)', yLabel: 'V (m/s)', yUnit: 'm/s', series: [{ fn: m.speed, color: 'second' }], areas: [{ fn: m.speed, from: 0, to: m.duration }] },
      },
      {
        id: 'a', title: tk('plotA', 'Acceleration \\(g\\)'),
        note: tk('plotANote', 'The same at every instant, whatever the mass of the body.'),
        cfg: { xLabel: 't (s)', yLabel: 'a (m/s²)', yUnit: 'm/s²', series: [{ fn: () => m.g, color: 'third' }], areas: [{ fn: () => m.g, from: 0, to: m.duration }] },
      },
    ]
  },

  events(m) {
    const out = []
    const T = m.duration
    out.push({
      title: tk('evEnd', 'End of the fall'), t: T,
      lines: [`t = ${texNum(T)}\\,\\text{s}`, `H = \\tfrac12 g t^2 = ${texNum(m.fallen(T))}\\,\\text{m}`, `V = g\\,t = ${texNum(m.speed(T))}\\,\\text{m/s}`],
    })
    const half = T / Math.SQRT2
    out.push({
      title: tk('evHalf', 'Halfway down'), t: half,
      cond: tk('evHalfCond', 'Half the height is covered at 1/√2 of the total time, not at half of it: the body is slow at first.'),
      lines: [`t_{1/2} = \\frac{t}{\\sqrt2} = ${texNum(half)}\\,\\text{s}`, `V = ${texNum(m.speed(half))}\\,\\text{m/s}`],
    })
    const odd = [1, 2, 3, 4].map(k => 0.5 * m.g * ((k * T / 4) ** 2 - ((k - 1) * T / 4) ** 2))
    out.push({
      title: tk('evOdd', 'Distances in equal intervals'),
      cond: tk('evOddCond', 'Dividing the fall into four equal intervals of time:'),
      lines: [odd.map((d, i) => `\\Delta H_{${i + 1}} = ${texNum(d)}`).join(',\\; ') + '\\,\\text{m}', `1 : 3 : 5 : 7`],
    })
    return out
  },

  query: {
    kinds: [{ id: 't', unit: 's' }, { id: 'H', unit: 'm' }, { id: 'V', unit: 'm/s' }],
    answer(kind, value, m) {
      const g = m.g
      if (kind === 't') {
        return [{ t: value, title: fill(t('common.query.atTime', 'At {t}'), { t: `\\(t = ${texNum(value)}\\,\\text{s}\\)` }), lines: [
          `H = \\tfrac12 g t^2 = \\tfrac12(${texNum(g)})(${texNum(value)})^2 = ${texNum(0.5 * g * value * value)}\\,\\text{m}`,
          `V = g\\,t = (${texNum(g)})(${texNum(value)}) = ${texNum(g * value)}\\,\\text{m/s}`,
          `y = h_0 - H = ${texNum(m.y(value))}\\,\\text{m}`,
        ] }]
      }
      if (kind === 'H') {
        const tt = Math.sqrt(2 * Math.max(0, value) / g)
        return [{ t: tt, lines: [
          `t = \\sqrt{\\frac{2H}{g}} = \\sqrt{\\frac{2(${texNum(value)})}{${texNum(g)}}} = ${texNum(tt)}\\,\\text{s}`,
          `V = \\sqrt{2gH} = ${texNum(Math.sqrt(2 * g * Math.max(0, value)))}\\,\\text{m/s}`,
        ] }]
      }
      const tt = Math.max(0, value) / g
      return [{ t: tt, lines: [
        `t = \\frac{V}{g} = \\frac{${texNum(value)}}{${texNum(g)}} = ${texNum(tt)}\\,\\text{s}`,
        `H = \\frac{V^2}{2g} = ${texNum(value * value / (2 * g))}\\,\\text{m}`,
      ] }]
    },
  },

  legend() {
    return [
      { color: 'primary', label: tex('\\vec v') + ' ' + tk('legendV', 'velocity') },
      { color: 'second', label: tex('\\vec g') + ' ' + tk('legendG', 'acceleration of gravity') },
      { color: 'muted', label: tk('legendGhost', 'positions at equal time intervals'), dot: true },
    ]
  },

  draw(ctx, w, h, m, time, c) {
    verticalScene(ctx, w, h, m, time, c)
  },
}

export default {
  main() {
    new TopicPage(topic).main()
  },
}
