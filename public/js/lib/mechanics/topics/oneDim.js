// Motion in one dimension from a law x(t): position, displacement, average and
// instantaneous velocity and acceleration, the limit process that turns one
// into the other (Resnick, table 2-1) and the difference between displacement
// and distance. The derivatives are symbolic, taken with the NLExpr layer.

import { t, fill, h, tex, texNum, fmt, whenKatex, readPalette, watchPalette, fitCanvas, onLangChange, renderMath, parseNumber, debounce } from '../core.js'
import { parseExpr } from '/js/lib/LSExpr.js'
import { derivative, compile, texOf } from '/js/lib/NLExpr.js'
import { Player } from '../player.js'
import { Plot } from '../plot.js'
import { mathify } from '../steps.js'
import { View, arrow, ground, ruler, ball, mathLabel, readout } from '../draw.js'

const tk = (k, f) => t(`oneDim.${k}`, f)

const PRESETS = [
  { id: 'serway13', x: '2 + 3t - t^2', t1: 0, t2: 3 },
  { id: 'resnickLimit', x: '3 + t + 2t^2', t1: 1, t2: 2 },
  { id: 'serway4', x: '10t^2', t1: 2, t2: 3 },
  { id: 'serway15', x: '3t^2 - 2t + 3', t1: 2, t2: 3 },
  { id: 'serway28', x: '2 + 3t - 4t^2', t1: 0, t2: 1 },
  { id: 'cubic', x: 't^3 - 6t^2 + 9t', t1: 0, t2: 4 },
  { id: 'oscillation', x: '5cos(2t)', t1: 0, t2: 3 },
]

// The law with t replaced by a number in parentheses, for the substitution step.
function substitute(node, value) {
  if (!node || typeof node !== 'object') return node
  if (node.kind === 'var' && node.name === 't') return { kind: 'num', value, text: `(${texNum(value)})` }
  const out = { ...node }
  for (const k of ['left', 'right', 'operand', 'arg']) if (node[k]) out[k] = substitute(node[k], value)
  return out
}

class OneDimPage {
  async main() {
    await whenKatex()
    this.c = readPalette()
    this.canvas = document.getElementById('mxScene')
    this.player = new Player(document.getElementById('mxPlayer'), tt => this.setTime(tt))
    this.buildPanel()
    this.buildPresets()
    this.plots = ['x', 'v', 'a'].map(id => this.makePlot(id))
    watchPalette(p => { this.c = p; this.plots.forEach(pl => pl.plot.setPalette(p)); this.draw() })
    new ResizeObserver(() => this.draw()).observe(this.canvas)
    document.querySelectorAll('.mxLoadBtn[data-preset]').forEach(btn => btn.addEventListener('click', () => {
      this.load(btn.dataset.preset)
      document.querySelector('.mxLab')?.scrollIntoView({ behavior: 'smooth' })
    }))
    document.getElementById('mxClear')?.addEventListener('click', () => { this.xIn.value = ''; this.update() })
    document.getElementById('mxQuery').hidden = true
    onLangChange(() => { this.fillPresets(); this.translatePanel(); this.update() })
    this.load(PRESETS[0].id)
  }

  buildPanel() {
    const box = document.getElementById('mxData')
    this.xIn = h('input', { class: 'mxIn', type: 'text', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'x(t)' })
    this.t1In = h('input', { class: 'mxIn', type: 'text', inputmode: 'decimal' })
    this.t2In = h('input', { class: 'mxIn', type: 'text', inputmode: 'decimal' })
    this.err = h('p', { class: 'mxHint', style: 'color: var(--mx-bad)', hidden: true })
    const row = (sym, inp, key, unit) => h('div', { class: 'mxRow', style: 'grid-template-columns: 2.6rem minmax(0,1fr) 3rem' },
      h('span', { class: 'mxSym', html: tex(sym) }),
      h('label', { class: 'mxField' }, h('span', { class: 'mxName', 'data-k': key }), inp),
      h('span', { class: 'mxUnitStatic' }, unit))
    box.append(h('div', { class: 'mxRows' },
      row('x(t)', this.xIn, 'lawName', 'm'),
      row('t_1', this.t1In, 't1Name', 's'),
      row('t_2', this.t2In, 't2Name', 's')), this.err,
    h('p', { class: 'mxHint', 'data-k': 'lawHint' }))
    const fire = debounce(() => this.update(), 200)
    for (const el of [this.xIn, this.t1In, this.t2In]) el.addEventListener('input', fire)
    this.translatePanel()
    document.querySelector('#mxData')?.closest('.mxBlock')?.querySelector('.mxHint')?.setAttribute('hidden', '')
  }

  translatePanel() {
    document.querySelectorAll('#mxData [data-k]').forEach(el => { el.textContent = tk(el.dataset.k, el.dataset.k) })
  }

  buildPresets() {
    this.presetSel = document.getElementById('mxPreset')
    this.statement = document.getElementById('mxStatement')
    this.fillPresets()
    this.presetSel.addEventListener('change', () => this.load(this.presetSel.value))
  }

  fillPresets() {
    const cur = this.presetSel.value
    this.presetSel.innerHTML = ''
    this.presetSel.append(h('option', { value: '' }, t('common.panel.custom', 'Your own problem')))
    for (const p of PRESETS) this.presetSel.append(h('option', { value: p.id }, tk(`presets.${p.id}.title`, p.id)))
    this.presetSel.value = cur
    if (cur) this.showStatement(cur)
  }

  showStatement(id) {
    const src = tk(`presets.${id}.source`, '')
    this.statement.innerHTML = `<p>${tk(`presets.${id}.text`, '')}</p>${src ? `<span class="mxStatementSource">${src}</span>` : ''}`
    renderMath(this.statement)
    this.statement.hidden = false
  }

  load(id) {
    const p = PRESETS.find(x => x.id === id)
    if (!p) { this.statement.hidden = true; return }
    this.presetSel.value = id
    this.showStatement(id)
    this.xIn.value = p.x
    this.t1In.value = String(p.t1)
    this.t2In.value = String(p.t2)
    this.update()
    this.player.seek(0)
    this.player.play()
  }

  makePlot(id) {
    const box = document.getElementById('mxPlots')
    const canvas = h('canvas', { class: 'mxPlotCanvas' })
    const title = h('h3', { class: 'mxPlotTitle' })
    const note = h('p', { class: 'mxPlotNote' })
    box.append(h('div', { class: 'mxPlotCard' }, title, canvas, note))
    const plot = new Plot(canvas, this.c)
    const scrub = e => { const tt = plot.timeAt(e.clientX); if (tt !== null) { this.player.pause(); this.player.seek(tt) } }
    canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); scrub(e) })
    canvas.addEventListener('pointermove', e => { if (e.buttons) scrub(e) })
    return { id, plot, title, note }
  }

  // ── Analysis ────────────────────────────────────────────────────────────

  update() {
    const parsed = parseExpr(this.xIn.value.replace(/\bx\s*\(\s*t\s*\)\s*=/, ''))
    const bad = !parsed.ok || parsed.empty || parsed.vars.some(v => v !== 't')
    const t1 = parseNumber(this.t1In.value).value
    const t2 = parseNumber(this.t2In.value).value
    this.err.hidden = !bad
    if (bad) {
      this.err.textContent = parsed.empty ? '' : tk('badLaw', 'The law must be an expression in t, such as 2 + 3t − t^2.')
      this.model = null
      return
    }
    const xN = parsed.node
    const vN = derivative(xN, 't')
    const aN = derivative(vN, 't')
    const ev = n => { const f = compile(n); return tt => f(0, 0, { t: tt }) }
    this.model = {
      xN, vN, aN, x: ev(xN), v: ev(vN), a: ev(aN),
      t1: Number.isFinite(t1) ? t1 : 0,
      t2: Number.isFinite(t2) && t2 > (Number.isFinite(t1) ? t1 : 0) ? t2 : (Number.isFinite(t1) ? t1 : 0) + 1,
    }
    const m = this.model
    m.duration = Math.max(m.t2 * 1.15, m.t2 + 0.5)
    m.turns = this.turningPoints(m, 0, m.duration)
    this.player.setDuration(m.duration)
    this.renderInvariant()
    this.renderSolution()
    this.renderPlots()
    this.renderEvents()
    this.renderLegend()
    this.setTime(Math.min(this.time ?? 0, m.duration))
  }

  turningPoints(m, a, b) {
    const out = []
    const N = 600
    let pt = a
    let pv = m.v(a)
    for (let i = 1; i <= N; i++) {
      const tt = a + (b - a) * i / N
      const v = m.v(tt)
      if (Number.isFinite(pv) && Number.isFinite(v) && pv * v < 0) {
        let lo = pt
        let hi = tt
        for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (m.v(lo) * m.v(mid) <= 0) hi = mid; else lo = mid }
        out.push((lo + hi) / 2)
      }
      pt = tt
      pv = v
    }
    return out
  }

  distance(m, a, b) {
    const cuts = [a, ...m.turns.filter(x => x > a && x < b), b]
    let d = 0
    for (let i = 0; i < cuts.length - 1; i++) d += Math.abs(m.x(cuts[i + 1]) - m.x(cuts[i]))
    return { d, cuts }
  }

  renderInvariant() {
    const box = document.getElementById('mxInvariant')
    const m = this.model
    box.innerHTML = ''
    const defs = [
      ['\\Delta x = x(t_2) - x(t_1)', tk('defDisp', 'displacement')],
      ['\\bar v = \\frac{\\Delta x}{\\Delta t}', tk('defAvgV', 'average velocity')],
      ['v = \\lim_{\\Delta t \\to 0}\\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}', tk('defV', 'instantaneous velocity')],
      ['\\bar a = \\frac{\\Delta v}{\\Delta t}', tk('defAvgA', 'average acceleration')],
      ['a = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}', tk('defA', 'instantaneous acceleration')],
    ]
    const card = h('div', { class: 'mxInvCard' }, h('h3', { class: 'mxInvCardTitle' }, h('span', {}, tk('defsTitle', 'Definitions'))))
    defs.forEach(([src, name], i) => card.append(h('div', { class: 'mxInvEq' }, h('span', { class: 'mxInvNum' }, `(${i + 1})`), h('span', { html: tex(src) }), h('span', { class: 'mxInvLacks' }, name))))
    box.append(card)
    const law = h('div', { class: 'mxInvCard mxInvCard--variant' }, h('h3', { class: 'mxInvCardTitle' }, h('span', {}, tk('lawTitle', 'This motion'))))
    law.append(
      h('div', { class: 'mxInvEq' }, h('span', { class: 'mxInvNum' }, 'x'), h('span', { html: tex(`x(t) = ${texOf(m.xN)}`) }), h('span')),
      h('div', { class: 'mxInvEq' }, h('span', { class: 'mxInvNum' }, 'v'), h('span', { html: tex(`v(t) = ${texOf(m.vN)}`) }), h('span')),
      h('div', { class: 'mxInvEq' }, h('span', { class: 'mxInvNum' }, 'a'), h('span', { html: tex(`a(t) = ${texOf(m.aN)}`) }), h('span')))
    // Constant acceleration? Then the law is the invariant.
    const as = [0, 0.7, 1.9, 3.3].map(m.a)
    const constA = as.every(a => Math.abs(a - as[0]) < 1e-9 * Math.max(1, Math.abs(as[0])))
    law.append(h('p', { class: 'mxInvNote mxProse', html: constA
      ? fill(tk('constA', 'The acceleration is constant, so this law is the invariant x = x₀ + v₀t + ½at² with {vals}: everything on the accelerated-motion page applies.'), { vals: `\\(x_0 = ${texNum(m.x(0))}\\,\\text{m},\\ v_0 = ${texNum(m.v(0))}\\,\\text{m/s},\\ a = ${texNum(as[0])}\\,\\text{m/s}^2\\)` })
      : tk('varA', 'The acceleration changes with time: the equations of constant acceleration do not apply, and velocity and acceleration must be obtained by differentiating.') }))
    box.append(law)
    renderMath(box)
  }

  renderSolution() {
    const out = document.getElementById('mxSolution')
    const m = this.model
    const { t1, t2 } = m
    out.innerHTML = ''
    const card = (title, ...lines) => {
      const c = h('article', { class: 'mxStep' }, h('header', { class: 'mxStepHead' }, h('span', { class: 'mxStepNum' }, String(out.childElementCount + 1)), h('span', { class: 'mxProse mxStepTitle', html: title })))
      for (const l of lines) c.append(typeof l === 'object' ? h('p', { class: 'mxProse', html: l.prose }) : h('div', { class: 'mxEq', 'data-tex': l, 'data-display': '1' }))
      out.append(c)
    }
    const sub = tt => `x(${texNum(tt)}) = ${texOf(substitute(m.xN, tt))} = ${texNum(m.x(tt))}\\,\\text{m}`
    const x1 = m.x(t1)
    const x2 = m.x(t2)
    const v1 = m.v(t1)
    const v2 = m.v(t2)
    card(tk('s1', 'Positions at both instants'), { prose: tk('s1p', 'Substituting each instant in the law x(t):') }, sub(t1), sub(t2))
    card(tk('s2', 'Displacement and average velocity'), { prose: tk('s2p', 'The average velocity is the slope of the secant that joins both points of the graph x(t); it ignores what happens in between.') },
      `\\Delta x = x(t_2) - x(t_1) = ${texNum(x2)} - ${texNum(x1) < 0 ? `(${texNum(x1)})` : texNum(x1)} = ${texNum(x2 - x1)}\\,\\text{m}`,
      `\\bar v = \\frac{\\Delta x}{\\Delta t} = \\frac{${texNum(x2 - x1)}\\,\\text{m}}{${texNum(t2 - t1)}\\,\\text{s}} = ${texNum((x2 - x1) / (t2 - t1))}\\,\\text{m/s}`)
    card(tk('s3', 'Instantaneous velocity: the derivative'), { prose: tk('s3p', 'Differentiating the law term by term:') },
      `v(t) = \\frac{dx}{dt} = ${texOf(m.vN)}`,
      `v(${texNum(t1)}) = ${texNum(v1)}\\,\\text{m/s},\\qquad v(${texNum(t2)}) = ${texNum(v2)}\\,\\text{m/s}`)
    card(tk('s4', 'Acceleration'), { prose: tk('s4p', 'The average acceleration uses the velocities at the ends; the instantaneous one is the derivative of v(t).') },
      `\\bar a = \\frac{v(t_2) - v(t_1)}{\\Delta t} = \\frac{${texNum(v2)} - ${v1 < 0 ? `(${texNum(v1)})` : texNum(v1)}}{${texNum(t2 - t1)}} = ${texNum((v2 - v1) / (t2 - t1))}\\,\\text{m/s}^2`,
      `a(t) = \\frac{dv}{dt} = ${texOf(m.aN)},\\qquad a(${texNum(t1)}) = ${texNum(m.a(t1))}\\,\\text{m/s}^2`)
    const { d, cuts } = this.distance(m, t1, t2)
    const inside = m.turns.filter(x => x > t1 && x < t2)
    card(tk('s5', 'Distance travelled and average speed'),
      { prose: inside.length ? fill(tk('s5turn', 'The velocity vanishes at {list}: the body turns back, so the distance is the sum of the stretches without sign.'), { list: inside.map(x => `\\(t = ${texNum(x)}\\,\\text{s}\\)`).join(', ') }) : tk('s5same', 'The velocity does not change sign between both instants, so the distance equals the magnitude of the displacement.') },
      `d = ${cuts.slice(0, -1).map((c, i) => `|x(${texNum(cuts[i + 1])}) - x(${texNum(c)})|`).join(' + ')} = ${texNum(d)}\\,\\text{m}`,
      `\\bar{v}_{\\text{rapidez}} = \\frac{d}{\\Delta t} = ${texNum(d / (t2 - t1))}\\,\\text{m/s}`)
    mathify(out)
  }

  renderEvents() {
    const box = document.getElementById('mxEvents')
    const m = this.model
    box.innerHTML = ''
    // Resnick, table 2-1: the average velocity tends to the instantaneous one.
    const rows = [1, 0.5, 0.25, 0.1, 0.05, 0.01, 0.001].map(dt => {
      const tA = m.t1
      const tB = m.t1 + dt
      const vb = (m.x(tB) - m.x(tA)) / dt
      return h('tr', {}, h('td', {}, fmt(dt, 3)), h('td', {}, fmt(m.x(tA), 5)), h('td', {}, fmt(tB, 5)), h('td', {}, fmt(m.x(tB), 6)), h('td', {}, fmt(m.x(tB) - m.x(tA), 5)), h('td', {}, fmt(vb, 6)))
    })
    box.append(h('div', { class: 'mxEvent', style: 'grid-column: 1 / -1' },
      h('div', { class: 'mxEventHead' }, h('h3', { class: 'mxEventTitle' }, tk('limitTitle', 'The limit process (Resnick, table 2-1)'))),
      h('p', { class: 'mxEventCond mxProse', html: fill(tk('limitText', 'Keeping t₁ fixed and moving t₂ closer, the average velocity approaches the instantaneous one, {v}.'), { v: `\\(v(${texNum(m.t1)}) = ${texNum(m.v(m.t1))}\\,\\text{m/s}\\)` }) }),
      h('div', { class: 'mxTableWrap' }, h('table', { class: 'mxTable' },
        h('thead', {}, h('tr', {}, ...['Δt (s)', 'x₁ (m)', 't₂ (s)', 'x₂ (m)', 'Δx (m)', 'v̄ (m/s)'].map(s => h('th', {}, s)))),
        h('tbody', {}, ...rows)))))
    for (const tt of m.turns) {
      const go = h('button', { class: 'mxEventGo', type: 'button' }, t('common.events.go', 'Go to instant'))
      go.addEventListener('click', () => { this.player.pause(); this.player.seek(tt) })
      box.append(h('div', { class: 'mxEvent' },
        h('div', { class: 'mxEventHead' }, h('h3', { class: 'mxEventTitle' }, tk('turnTitle', 'It turns back (v = 0)')), go),
        h('div', { class: 'mxEq', html: tex(`t = ${texNum(tt)}\\,\\text{s},\\quad x = ${texNum(m.x(tt))}\\,\\text{m},\\quad a = ${texNum(m.a(tt))}\\,\\text{m/s}^2`) })))
    }
    mathify(box)
  }

  renderPlots() {
    const m = this.model
    const [px, pv, pa] = this.plots
    px.title.innerHTML = tk('plotX', 'Position \\(x(t)\\)')
    px.note.innerHTML = tk('plotXNote', 'Dashed: the secant between t₁ and t₂ (slope = average velocity) and the tangent at t₁ (slope = instantaneous velocity).')
    pv.title.innerHTML = tk('plotV', 'Velocity \\(v(t)\\)')
    pv.note.innerHTML = tk('plotVNote', 'The shaded area between t₁ and t₂ is the displacement; the slope of the curve is the acceleration.')
    pa.title.innerHTML = tk('plotA', 'Acceleration \\(a(t)\\)')
    pa.note.innerHTML = tk('plotANote', 'The area under a(t) between two instants is the change of velocity.')
    for (const p of this.plots) { renderMath(p.title); renderMath(p.note) }
    const { t1, t2 } = m
    const x1 = m.x(t1)
    const v1 = m.v(t1)
    const T = m.duration
    px.plot.set({
      t0: 0, t1: T, xLabel: 't (s)', yLabel: 'x (m)', yUnit: 'm',
      series: [{ fn: m.x, color: 'primary' }],
      lines: [
        { x1: t1, y1: x1, x2: t2, y2: m.x(t2), color: 'third', keepInRange: true },
        { x1: Math.max(0, t1 - T * 0.25), y1: x1 - v1 * Math.min(t1, T * 0.25), x2: t1 + T * 0.25, y2: x1 + v1 * T * 0.25, color: 'second', dash: [2, 3] },
      ],
      marks: [{ t: t1, y: x1, label: 't₁' }, { t: t2, y: m.x(t2), label: 't₂' }],
    })
    pv.plot.set({ t0: 0, t1: T, xLabel: 't (s)', yLabel: 'v (m/s)', yUnit: 'm/s', series: [{ fn: m.v, color: 'second' }], areas: [{ fn: m.v, from: t1, to: t2 }] })
    pa.plot.set({ t0: 0, t1: T, xLabel: 't (s)', yLabel: 'a (m/s²)', yUnit: 'm/s²', series: [{ fn: m.a, color: 'third' }] })
  }

  renderLegend() {
    const box = document.getElementById('mxLegend')
    box.innerHTML = ''
    for (const [color, label] of [['primary', tex('\\vec v') + ' ' + tk('legendV', 'velocity')], ['second', tex('\\vec a') + ' ' + tk('legendA', 'acceleration')], ['muted', tk('legendGhost', 'positions at equal time intervals')]]) {
      box.append(h('span', { class: 'mxLegendItem' }, h('span', { class: 'mxSwatch', style: `color:${this.c[color]}` }), h('span', { html: label })))
    }
  }

  setTime(tt) {
    this.time = tt
    this.plots?.forEach(p => p.plot.setCursor(tt))
    this.draw()
  }

  draw() {
    const m = this.model
    if (!m || !this.c) return
    const { ctx, w, h: hh } = fitCanvas(this.canvas)
    const c = this.c
    ctx.clearRect(0, 0, w, hh)
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i <= 200; i++) { const x = m.x(m.duration * i / 200); if (Number.isFinite(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x) } }
    if (!(hi - lo > 1e-9)) { lo -= 1; hi += 1 }
    const span = hi - lo
    const view = View.strip(w, hh, lo - span * 0.08, hi + span * 0.08, 0.62)
    ground(ctx, view, 0, lo - span * 0.08, hi + span * 0.08, c)
    ruler(ctx, view, lo - span * 0.06, hi + span * 0.06, 0, c)
    for (let i = 0; i <= 14; i++) ball(ctx, view.X(m.x(m.duration * i / 14)), view.Y(0) - 26, 3, c.muted)
    for (const [tt, lbl] of [[m.t1, 'x_1'], [m.t2, 'x_2']]) {
      const px = view.X(m.x(tt))
      ctx.save(); ctx.strokeStyle = c.third; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px, view.Y(0)); ctx.lineTo(px, view.Y(0) - 44); ctx.stroke(); ctx.restore()
      mathLabel(ctx, lbl, px, view.Y(0) - 52, { color: c.third, size: 13, align: 'center' })
    }
    const x = m.x(this.time ?? 0)
    const v = m.v(this.time ?? 0)
    const a = m.a(this.time ?? 0)
    const px = view.X(x)
    const py = view.Y(0) - 8
    let vmax = 1e-9
    let amax = 1e-9
    for (let i = 0; i <= 100; i++) { const tt = m.duration * i / 100; vmax = Math.max(vmax, Math.abs(m.v(tt))); amax = Math.max(amax, Math.abs(m.a(tt))) }
    arrow(ctx, px, py - 40, px + v / vmax * 80, py - 40, { color: c.primary, width: 2.6 })
    arrow(ctx, px, py - 58, px + a / amax * 60, py - 58, { color: c.second, width: 2.2 })
    ball(ctx, px, py, 9, c.primary)
    readout(ctx, c, [['t', this.time ?? 0, 's'], ['x', x, 'm'], ['v', v, 'm/s'], ['a', a, 'm/s²']])
  }
}

export default {
  main() {
    new OneDimPage().main()
  },
}
