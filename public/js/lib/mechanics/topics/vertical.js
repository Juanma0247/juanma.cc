// Vertical throws, upward and downward, from the ground or from a height.
// The invariant is written with the y axis pointing up (Resnick), so a = −g
// and every velocity carries its sign; the variant card shows the course's
// version in magnitudes for each direction.

import { t, fill, h, tex, texNum } from '../core.js'
import { eq } from '../algebra.js'
import { TopicPage } from '../topicPage.js'
import { verticalScene } from '../scenes.js'
import { answerQuery, timesAtPosition } from '../motion1d.js'
import { EncounterModule } from '../encounter.js'

const tk = (k, f) => t(`vertical.${k}`, f)
const state = { dir: 'up' }

const VARS = {
  v0: {
    tex: 'v_0', dim: 'velocity', name: 'initialSpeed',
    get range() { return state.dir === 'up' ? [0, Infinity] : [-Infinity, 0] },
    signFrom: () => (state.dir === 'down' ? -1 : 1),
    reject: 'vertical.rejectDir',
  },
  v: { tex: 'v', dim: 'velocity', name: 'finalVelocity', hint: 'vertical.signHint' },
  t: { tex: 't', dim: 'time', name: 'time', range: [0, Infinity], nonzero: true, reject: 'common.steps.rejectTime' },
  dy: { tex: '\\Delta y', dim: 'length', name: 'verticalDisplacement' },
  y0: { tex: 'y_0', dim: 'length', name: 'launchHeight', range: [0, Infinity], optional: true },
  y: { tex: 'y', dim: 'length', name: 'finalHeight', optional: true },
  g: { tex: 'g', dim: 'acceleration', name: 'gravity' },
}

const EQS = [
  eq('w1', 'v = v0 - g*t', { lacks: 'dy' }),
  eq('w2', 'dy = v0*t - 1/2*g*t^2', { lacks: 'v' }),
  eq('w3', 'v^2 = v0^2 - 2*g*dy', { lacks: 't' }),
  eq('w4', 'dy = 1/2*v0*t + 1/2*v*t', { lacks: 'g', tex: '\\Delta y = \\tfrac12\\,(v_0 + v)\\,t' }),
  eq('w5', 'dy = v*t + 1/2*g*t^2', { lacks: 'v0' }),
  eq('w6', 'y = y0 + dy', { label: '(y)' }),
]

const PRESETS = [
  { id: 'baseball', data: { t: [3, 's'] }, condition: 'maxHeight', asked: ['v0', 'dy'] },
  { id: 'balcony', data: { v0: [10, 'm/s'], y0: [14.1, 'm'] }, condition: 'ground', asked: ['t'] },
  { id: 'roof', data: { v0: [98, 'm/s'], y0: [100, 'm'] }, condition: 'ground', asked: ['t', 'v'] },
  { id: 'tower', data: { v0: [15, 'm/s'], t: [1, 's'] }, asked: ['dy', 'v'] },
  { id: 'balloon', data: { v0: [6, 'm/s'], t: [2, 's'] }, options: { dir: 'down' }, asked: ['v', 'dy'] },
  { id: 'keys', data: { dy: [4, 'm'], t: [1.5, 's'] }, asked: ['v0', 'v'] },
  { id: 'castle', data: { v0: [7.4, 'm/s'], dy: [2.1, 'm'] }, asked: ['v'] },
  { id: 'cliff', data: { v0: [8, 'm/s'], y0: [30, 'm'] }, condition: 'ground', asked: ['t'] },
]

const ENCOUNTERS = [
  { id: 'dropThrow', bodies: [{ x0: 20, phases: [{ v: 0 }] }, { x0: 0, phases: [{ v: 19.8 }] }] },
  { id: 'twoUp', bodies: [{ x0: 0, phases: [{ v: 20 }] }, { x0: 0, delay: 1, phases: [{ v: 20 }] }] },
  { id: 'stones', bodies: [{ x0: 50, phases: [{ v: -2 }] }, { x0: 50, delay: 1, phases: [{ v: -15.25 }] }] },
]

const topic = {
  key: 'vertical',
  usesG: true,
  order: ['v0', 'v', 't', 'dy', 'y0', 'y'],
  presets: PRESETS,
  options: { dir: 'up' },
  conditions: [
    { id: 'free' },
    { id: 'maxHeight', lock: { v: 0 }, when: () => state.dir === 'up' },
    { id: 'backToLaunch', lock: { dy: 0 }, when: () => state.dir === 'up' },
    { id: 'ground', lock: { y: 0 } },
  ],

  system() {
    return { vars: VARS, eqs: EQS }
  },

  fixed(page) {
    return { g: page.g }
  },

  syncOptions(page) {
    state.dir = page.options.dir ?? 'up'
    page.dirButtons?.forEach(b => b.classList.toggle('is-active', b.dataset.dir === state.dir))
  },

  extraControls(box, page) {
    const title = h('h3', { class: 'mxH3', 'data-mx': 'dirTitle' }, tk('dirTitle', 'Direction of the throw'))
    const seg = h('div', { class: 'mxConditions' })
    page.dirButtons = ['up', 'down'].map(dir => {
      const b = h('button', { class: `mxCond${dir === state.dir ? ' is-active' : ''}`, type: 'button', dataset: { dir } }, tk(`dir.${dir}`, dir))
      b.addEventListener('click', () => {
        state.dir = dir
        page.options.dir = dir
        page.dirButtons.forEach(x => x.classList.toggle('is-active', x === b))
        const cond = topic.conditions.find(c => c.id === page.condition)
        page.setCondition(cond?.when && !cond.when() ? 'free' : page.condition)
      })
      seg.append(b)
      return b
    })
    box.append(title, seg)
  },

  retranslate(page) {
    document.querySelector('[data-mx="dirTitle"]').textContent = tk('dirTitle', 'Direction of the throw')
    page.dirButtons.forEach(b => { b.textContent = tk(`dir.${b.dataset.dir}`, b.dataset.dir) })
  },

  why(s) {
    if (s.eqId === 'w6') return fill(tk('whyY', 'The height above the ground is the launch height plus the vertical displacement: {eq}.'), { eq: '\\(y = y_0 + \\Delta y\\)' })
    return null
  },

  valueNote(u, v) {
    if (u === 'v' && Math.abs(v) > 1e-9) return v > 0 ? tk('goingUp', 'Positive: at that instant the body is still going up.') : tk('goingDown', 'Negative: at that instant the body is already coming down.')
    return null
  },

  branchName(br, i) {
    const lab = br.label.find(l => l.u === 'v' || l.u === 't')
    if (lab?.u === 'v') return lab.value >= 0 ? tk('branchUp', 'On the way up') : tk('branchDown', 'On the way down')
    return null
  },

  variant() {
    if (state.dir === 'down') {
      return {
        title: tk('variantDown', 'Variant: downward throw'),
        tag: tk('tagDown', 'magnitudes, downward positive'),
        eqs: ['V(t) = V_o + g\\,t', 'V(t)^2 = V_o^2 + 2g\\,H', 'H(t) = V_o\\,t + \\frac{g\\,t^2}{2}'],
        note: tk('variantDownNote', 'The velocity and g point the same way, so the speed grows: in the variant g is added. H is measured downwards from the launch point.'),
      }
    }
    return {
      title: tk('variantUp', 'Variant: upward throw'),
      tag: tk('tagUp', 'magnitudes, upward positive'),
      eqs: ['V(t) = V_o - g\\,t', 'V(t)^2 = V_o^2 - 2g\\,H', 'H(t) = V_o\\,t - \\frac{g\\,t^2}{2}'],
      note: tk('variantUpNote', 'g opposes the motion while the body rises, so it is subtracted. The same equations keep working on the way down, where V becomes negative: that is why the laboratory uses signed quantities.'),
    }
  },

  motion(vals, page) {
    const g = page.g
    if (!Number.isFinite(vals.v0)) return null
    const y0 = Number.isFinite(vals.y0) ? vals.y0 : 0
    const m = { g, y0, v0: vals.v0 }
    m.y = tt => y0 + vals.v0 * tt - 0.5 * g * tt * tt
    m.v = tt => vals.v0 - g * tt
    const hit = timesAtPosition({ x0: y0, v0: vals.v0, a: -g }, 0).filter(r => r > 1e-9)
    m.tGround = hit.length ? hit[hit.length - 1] : null
    m.tEnd = Number.isFinite(vals.t) ? vals.t : null
    m.duration = Math.max(m.tGround ?? 0, m.tEnd ?? 0) || 2 * Math.abs(vals.v0) / g || 1
    m.ymax = vals.v0 > 0 ? y0 + vals.v0 * vals.v0 / (2 * g) : y0
    const yEnd = m.tEnd !== null ? m.y(m.tEnd) : null
    const showEnd = yEnd !== null && m.tGround !== null && Math.abs(m.tEnd - m.tGround) > 1e-6 && Math.abs(yEnd - m.ymax) > 1e-6
    m.marks = showEnd ? [{ y: yEnd, label: 'y(t)' }] : []
    return m
  },

  plots(m) {
    const marks = []
    if (m.v0 > 0) marks.push({ t: m.v0 / m.g, y: m.ymax, label: 'máx' })
    if (m.tEnd !== null) marks.push({ t: m.tEnd, y: m.y(m.tEnd), label: 't', color: 'second' })
    return [
      {
        id: 'y', title: tk('plotY', 'Height \\(y(t)\\)'),
        note: tk('plotYNote', 'A parabola opening downwards; its vertex is the maximum height, where the slope (the velocity) is zero.'),
        cfg: { xLabel: 't (s)', yLabel: 'y (m)', yUnit: 'm', series: [{ fn: m.y, color: 'primary' }], marks },
      },
      {
        id: 'v', title: tk('plotV', 'Velocity \\(v(t)\\)'),
        note: tk('plotVNote', 'A straight line of slope −g. It crosses zero at the top; the area above the axis is the rise and the one below the descent.'),
        cfg: { xLabel: 't (s)', yLabel: 'v (m/s)', yUnit: 'm/s', series: [{ fn: m.v, color: 'second' }], areas: [{ fn: m.v, from: 0, to: m.duration }] },
      },
      {
        id: 'a', title: tk('plotA', 'Acceleration \\(a(t) = -g\\)'),
        note: tk('plotANote', 'Constant and downwards, also at the top: the velocity is zero there, the acceleration is not.'),
        cfg: { xLabel: 't (s)', yLabel: 'a (m/s²)', yUnit: 'm/s²', series: [{ fn: () => -m.g, color: 'third' }], areas: [{ fn: () => -m.g, from: 0, to: m.duration }] },
      },
    ]
  },

  events(m) {
    const out = []
    const g = m.g
    if (m.v0 > 0) {
      const ts = m.v0 / g
      out.push({
        title: tk('evTop', 'Maximum height'), t: ts,
        cond: tk('evTopCond', 'At the top the velocity is zero: v = v₀ − g t = 0.'),
        lines: [
          `t_s = \\frac{v_0}{g} = \\frac{${texNum(m.v0)}}{${texNum(g)}} = ${texNum(ts)}\\,\\text{s}`,
          `H = \\frac{v_0^2}{2g} = ${texNum(m.v0 * m.v0 / (2 * g))}\\,\\text{m}`,
          `y_{\\text{máx}} = y_0 + H = ${texNum(m.ymax)}\\,\\text{m}`,
        ],
      })
      out.push({
        title: tk('evBack', 'Back at the launch point'), t: 2 * ts <= m.duration + 1e-9 ? 2 * ts : null,
        cond: tk('evBackCond', 'Δy = 0 gives t (v₀ − g t / 2) = 0: the time up equals the time down.'),
        lines: [`t = \\frac{2v_0}{g} = ${texNum(2 * ts)}\\,\\text{s}`, `v = -v_0 = ${texNum(-m.v0)}\\,\\text{m/s}`],
      })
    }
    if (m.tGround !== null && m.y0 > 1e-9) {
      const tg = m.tGround
      out.push({
        title: tk('evGround', 'It reaches the ground'), t: tg,
        cond: tk('evGroundCond', 'Setting y = 0 in y = y₀ + v₀ t − ½ g t², a quadratic whose positive root is the answer:'),
        lines: [
          `\\tfrac12(${texNum(g)})\\,t^2 ${m.v0 < 0 ? '+' : '-'} ${texNum(Math.abs(m.v0))}\\,t - ${texNum(m.y0)} = 0`,
          `t = ${texNum(tg)}\\,\\text{s}`,
          `v = v_0 - g\\,t = ${texNum(m.v(tg))}\\,\\text{m/s}`,
        ],
      })
    }
    return out
  },

  query: {
    kinds: [{ id: 't', unit: 's' }, { id: 'y', unit: 'm' }, { id: 'v', unit: 'm/s' }],
    answer(kind, value, m) {
      const mm = { x0: m.y0, v0: m.v0, a: -m.g, x: m.y, v: m.v }
      return answerQuery(kind === 'y' ? 'x' : kind, value, mm, { x: 'y', x0: 'y_0', v0: 'v_0', a: '(-g)' })
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

  init(page) {
    new EncounterModule(document.getElementById('mxEncounter'), {
      key: 'vertical', palette: page.c, withAcceleration: false, vertical: true, presets: ENCOUNTERS, gravity: () => page.g,
    })
  },
}

export default {
  main() {
    new TopicPage(topic).main()
  },
}
