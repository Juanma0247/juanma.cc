// Motion by stretches: a sequence of phases, each with constant acceleration,
// described either by its acceleration or by the velocity it ends with (which
// is how a v–t graph is read). The module draws x(t), v(t) and a(t), prints
// the law x(t) of every phase and the areas under v(t), and separates the
// displacement from the distance travelled.

import { t, fill, h, tex, texNum, fmt, parseNumber, fitCanvas, debounce, renderMath, onLangChange, watchPalette } from './core.js'
import { Plot } from './plot.js'
import { Player } from './player.js'
import { View, arrow, ground, ruler, car, readout } from './draw.js'
import { mathify } from './steps.js'

export class PhasesModule {
  constructor(root, { key, palette }) {
    if (!root) return
    this.root = root
    this.key = key
    this.c = palette
    this.x0 = 0
    this.v0 = 0
    this.phases = []
    this.time = 0
    this.presets = PRESETS
    this.build()
    watchPalette(p => { this.c = p; this.plots.forEach(pl => pl.setPalette(p)); this.draw() })
    onLangChange(() => { this.fillTexts(); this.renderEditor(); this.update() })
    this.load(PRESETS[0].id)
  }

  tk(k, f) {
    return k.startsWith('presets.') ? t(`${this.key}.phases.${k}`, f) : t(`common.phases.${k}`, f)
  }

  build() {
    this.canvas = h('canvas', { class: 'mxScene' })
    const playerBox = h('div', { class: 'mxPlayer' })
    const cvs = [0, 1, 2].map(() => h('canvas', { class: 'mxPlotCanvas' }))
    this.titles = [0, 1, 2].map(() => h('h3', { class: 'mxPlotTitle' }))
    const plotsBox = h('div', { class: 'mxPlots' }, ...cvs.map((cv, i) => h('div', { class: 'mxPlotCard' }, this.titles[i], cv)))
    this.presetSel = h('select', { class: 'mxPresetSel', 'aria-label': 'preset' })
    this.statement = h('div', { class: 'mxStatement', hidden: true })
    this.editor = h('div', { class: 'mxBlock' })
    this.out = h('div', { class: 'mxSolution' })
    this.root.append(
      h('div', { class: 'mxLabGrid' },
        h('div', { class: 'mxStageCol' }, h('div', { class: 'mxStageCard', style: 'aspect-ratio: 16/7' }, this.canvas), playerBox, plotsBox),
        h('aside', { class: 'mxPanel' },
          h('div', { class: 'mxBlock' }, h('h3', { class: 'mxH3', 'data-k': 'presetsTitle' }), this.presetSel, this.statement),
          this.editor)),
      this.out)
    this.player = new Player(playerBox, tt => this.setTime(tt))
    this.plots = cvs.map(cv => new Plot(cv, this.c))
    cvs.forEach((cv, i) => {
      const scrub = e => { const tt = this.plots[i].timeAt(e.clientX); if (tt !== null) { this.player.pause(); this.player.seek(tt) } }
      cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); scrub(e) })
      cv.addEventListener('pointermove', e => { if (e.buttons) scrub(e) })
    })
    new ResizeObserver(() => this.draw()).observe(this.canvas)
    this.presetSel.addEventListener('change', () => this.load(this.presetSel.value))
    this.fillTexts()
  }

  fillTexts() {
    const cur = this.presetSel.value
    this.presetSel.innerHTML = ''
    this.presetSel.append(h('option', { value: '' }, t('common.panel.custom', 'Your own problem')))
    for (const p of this.presets) this.presetSel.append(h('option', { value: p.id }, this.tk(`presets.${p.id}.title`, p.id)))
    this.presetSel.value = cur
    this.root.querySelectorAll('[data-k]').forEach(el => { el.textContent = this.tk(el.dataset.k, el.dataset.k) })
    this.titles[0].innerHTML = `${tex('x(t)')} · ${this.tk('plotX', 'position')}`
    this.titles[1].innerHTML = `${tex('v(t)')} · ${this.tk('plotV', 'velocity: area = displacement')}`
    this.titles[2].innerHTML = `${tex('a(t)')} · ${this.tk('plotA', 'acceleration: area = change of velocity')}`
    if (cur) this.showStatement(cur)
  }

  showStatement(id) {
    this.statement.innerHTML = `<p>${this.tk(`presets.${id}.text`, '')}</p>`
    renderMath(this.statement)
    this.statement.hidden = false
  }

  load(id) {
    const p = this.presets.find(x => x.id === id)
    if (!p) { this.statement.hidden = true; return }
    this.presetSel.value = id
    this.showStatement(id)
    this.x0 = p.x0 ?? 0
    this.v0 = p.v0 ?? 0
    this.phases = p.phases.map(ph => ({ ...ph }))
    this.renderEditor()
    this.update()
    this.player.seek(0)
  }

  renderEditor() {
    const fire = debounce(() => this.update(), 180)
    const field = (label, value, set) => {
      const inp = h('input', { class: 'mxIn', type: 'text', inputmode: 'decimal', value: value ?? '' })
      inp.addEventListener('input', () => { const p = parseNumber(inp.value); set(p.ok && !p.empty ? p.value : null); fire() })
      return h('label', { class: 'mxSmallField' }, h('span', { html: label }), inp)
    }
    this.editor.innerHTML = ''
    this.editor.append(
      h('h3', { class: 'mxH3' }, this.tk('initialTitle', 'Initial state')),
      h('div', { class: 'mxBodyGrid' },
        field(`${tex('x_0')} (m)`, this.x0, v => { this.x0 = v ?? 0 }),
        field(`${tex('v_0')} (m/s)`, this.v0, v => { this.v0 = v ?? 0 })),
      h('h3', { class: 'mxH3', style: 'margin-top:.4rem' }, this.tk('phasesTitle', 'Stretches')),
      h('p', { class: 'mxHint', html: this.tk('phasesHint', 'Each stretch lasts Δt and is defined by its acceleration or by the velocity it ends with (reading a v–t graph).') }))
    const list = h('div', { class: 'mxPhaseList' })
    this.phases.forEach((p, i) => {
      const mode = h('select', { class: 'mxUnit', 'aria-label': 'mode' },
        h('option', { value: 'a', selected: p.mode === 'a' }, 'a (m/s²)'),
        h('option', { value: 'v', selected: p.mode === 'v' }, this.tk('endV', 'v final (m/s)')))
      mode.addEventListener('change', () => { p.mode = mode.value; this.update() })
      const del = h('button', { class: 'mxPhaseDel', type: 'button', disabled: this.phases.length < 2 }, '×')
      del.addEventListener('click', () => { this.phases.splice(i, 1); this.renderEditor(); this.update() })
      list.append(h('div', { class: 'mxPhase', style: 'grid-template-columns: 1.4rem minmax(0,.8fr) minmax(0,1.2fr) minmax(0,.9fr) 1.8rem' },
        h('span', { class: 'mxPhaseNum' }, String(i + 1)),
        field(`${tex('\\Delta t')} (s)`, p.dt, v => { p.dt = v }),
        h('label', { class: 'mxSmallField' }, h('span', {}, this.tk('defineBy', 'defined by')), mode),
        field('&nbsp;', p.value, v => { p.value = v }),
        del))
    })
    const add = h('button', { class: 'mxMiniBtn', type: 'button' }, `+ ${this.tk('add', 'Add stretch')}`)
    add.addEventListener('click', () => { this.phases.push({ dt: 5, mode: 'a', value: 0 }); this.renderEditor(); this.update() })
    this.editor.append(list, add)
  }

  update() {
    // Build the segments in absolute time.
    let tc = 0
    let x = this.x0
    let v = this.v0
    this.segs = []
    for (const p of this.phases) {
      const dt = Math.max(0, p.dt ?? 0)
      if (!(dt > 0)) continue
      const a = p.mode === 'v' ? ((p.value ?? v) - v) / dt : (p.value ?? 0)
      const xf = x + v * dt + 0.5 * a * dt * dt
      const vf = v + a * dt
      // Distance: if v changes sign inside the stretch, split at the turning point.
      let dist = Math.abs(xf - x)
      const tz = Math.abs(a) > 1e-12 ? -v / a : -1
      if (tz > 1e-12 && tz < dt - 1e-12) {
        const xz = x + v * tz + 0.5 * a * tz * tz
        dist = Math.abs(xz - x) + Math.abs(xf - xz)
      }
      this.segs.push({ t0: tc, t1: tc + dt, x, v, a, xf, vf, dist })
      tc += dt
      x = xf
      v = vf
    }
    this.duration = Math.max(tc, 1e-6)
    this.player.setDuration(this.duration)
    this.renderPlots()
    this.renderOut()
    this.setTime(Math.min(this.time, this.duration))
  }

  seg(tt) {
    return this.segs.find(s => tt >= s.t0 && tt < s.t1) ?? this.segs[this.segs.length - 1]
  }

  pos(tt) { const s = this.seg(tt); if (!s) return this.x0; const d = tt - s.t0; return s.x + s.v * d + 0.5 * s.a * d * d }
  vel(tt) { const s = this.seg(tt); if (!s) return this.v0; return s.v + s.a * (tt - s.t0) }
  acc(tt) { const s = this.seg(tt); return s ? s.a : 0 }

  renderPlots() {
    const T = this.duration
    const marks = this.segs.map((s, i) => ({ t: s.t1, y: s.xf, label: String.fromCharCode(97 + i) }))
    this.plots[0].set({ t0: 0, t1: T, xLabel: 't (s)', yLabel: 'x (m)', yUnit: 'm', series: [{ fn: tt => this.pos(tt), color: 'primary' }], marks })
    this.plots[1].set({ t0: 0, t1: T, xLabel: 't (s)', yLabel: 'v (m/s)', yUnit: 'm/s', series: [{ fn: tt => this.vel(tt), color: 'second' }], areas: [{ fn: tt => this.vel(tt), from: 0, to: T }] })
    this.plots[2].set({ t0: 0, t1: T, xLabel: 't (s)', yLabel: 'a (m/s²)', yUnit: 'm/s²', series: [{ fn: tt => this.acc(tt), color: 'third', jumps: true }], areas: [{ fn: tt => this.acc(tt), from: 0, to: T }] })
  }

  renderOut() {
    const out = this.out
    out.innerHTML = ''
    if (!this.segs.length) return
    const rows = this.segs.map((s, i) => h('tr', {},
      h('td', {}, `${i + 1}`),
      h('td', {}, `${fmt(s.t0)} → ${fmt(s.t1)}`),
      h('td', {}, `${fmt(s.v)} → ${fmt(s.vf)}`),
      h('td', {}, fmt(s.a)),
      h('td', {}, fmt(s.xf - s.x)),
      h('td', {}, fmt(s.xf))))
    out.append(h('div', { class: 'mxTableWrap' }, h('table', { class: 'mxTable' },
      h('thead', {}, h('tr', {},
        h('th', {}, '#'), h('th', {}, 't (s)'), h('th', {}, 'v (m/s)'), h('th', {}, 'a (m/s²)'), h('th', {}, 'Δx (m)'), h('th', {}, 'x (m)'))),
      h('tbody', {}, ...rows))))

    const laws = h('article', { class: 'mxStep' }, h('header', { class: 'mxStepHead' }, h('span', { class: 'mxProse mxStepTitle', html: this.tk('lawsTitle', 'Law of motion of each stretch') })),
      h('p', { class: 'mxProse', html: this.tk('lawsText', 'Inside each stretch the acceleration is constant, so the invariant holds with the stretch’s own initial state; τ = t − tᵢ is the time measured from the start of the stretch.') }))
    this.segs.forEach((s, i) => {
      const tau = s.t0 > 0 ? `(t - ${texNum(s.t0)})` : 't'
      let law = `x_{${i + 1}}(t) = ${texNum(s.x)}`
      if (Math.abs(s.v) > 1e-12) law += ` ${s.v < 0 ? '-' : '+'} ${texNum(Math.abs(s.v))}\\,${tau}`
      if (Math.abs(s.a) > 1e-12) law += ` ${s.a < 0 ? '-' : '+'} ${texNum(Math.abs(s.a) / 2)}\\,${tau}^2`
      law += `\\qquad ${texNum(s.t0)} \\le t \\le ${texNum(s.t1)}\\,\\text{s}`
      laws.append(h('div', { class: 'mxEq', 'data-tex': law, 'data-display': '1' }))
    })
    out.append(laws)

    const disp = this.segs.reduce((acc, s) => acc + (s.xf - s.x), 0)
    const dist = this.segs.reduce((acc, s) => acc + s.dist, 0)
    const T = this.duration
    const areaTerms = this.segs.map(s => `\\tfrac12(${texNum(s.v)} + ${texNum(s.vf)})(${texNum(s.t1 - s.t0)})`).join(' + ')
    const totals = h('article', { class: 'mxStep' }, h('header', { class: 'mxStepHead' }, h('span', { class: 'mxProse mxStepTitle', html: this.tk('totalsTitle', 'Displacement, distance and averages') })),
      h('p', { class: 'mxProse', html: this.tk('totalsText', 'The displacement is the signed area under v(t): every stretch is a trapezoid of area ½(vᵢ + v_f)Δt. The distance adds the areas without sign, so it only differs from the displacement when the velocity changes sign.') }),
      h('div', { class: 'mxEq', 'data-tex': `\\Delta x = ${areaTerms} = ${texNum(disp)}\\,\\text{m}`, 'data-display': '1' }),
      h('div', { class: 'mxEq', 'data-tex': `d = \\int_0^{${texNum(T)}} |v|\\,dt = ${texNum(dist)}\\,\\text{m}`, 'data-display': '1' }),
      h('div', { class: 'mxEq', 'data-tex': `\\bar v = \\frac{\\Delta x}{\\Delta t} = \\frac{${texNum(disp)}}{${texNum(T)}} = ${texNum(disp / T)}\\,\\text{m/s}\\qquad \\bar{v}_{\\text{rapidez}} = \\frac{d}{\\Delta t} = ${texNum(dist / T)}\\,\\text{m/s}`, 'data-display': '1' }))
    out.append(totals)

    // Displacement between two instants (Serway 2.22 b)
    const q = h('div', { class: 'mxQuery' })
    const i1 = h('input', { type: 'text', inputmode: 'decimal', value: '0' })
    const i2 = h('input', { type: 'text', inputmode: 'decimal', value: fmt(T) })
    const res = h('div', { class: 'mxQueryOut' })
    const run = () => {
      const a = parseNumber(i1.value).value
      const b = parseNumber(i2.value).value
      res.innerHTML = ''
      if (!Number.isFinite(a) || !Number.isFinite(b)) return
      const lo = Math.max(0, Math.min(a, b))
      const hi = Math.min(T, Math.max(a, b))
      const dx = this.pos(hi) - this.pos(lo)
      res.append(h('div', { class: 'mxEq', 'data-tex': `\\Delta x\\big|_{${texNum(lo)}}^{${texNum(hi)}} = x(${texNum(hi)}) - x(${texNum(lo)}) = ${texNum(this.pos(hi))} - ${texNum(this.pos(lo))} = ${texNum(dx)}\\,\\text{m}`, 'data-display': '1' }),
        h('div', { class: 'mxEq', 'data-tex': `\\bar v = \\frac{${texNum(dx)}}{${texNum(hi - lo)}} = ${texNum(hi > lo ? dx / (hi - lo) : 0)}\\,\\text{m/s}`, 'data-display': '1' }))
      mathify(res)
    }
    i1.addEventListener('input', run)
    i2.addEventListener('input', run)
    q.append(h('h3', { class: 'mxH3' }, this.tk('betweenTitle', 'Displacement between two instants')),
      h('div', { class: 'mxQueryForm' }, h('span', { html: tex('t_1 =') }), i1, h('span', { html: tex('t_2 =') }), i2, h('span', { class: 'mxHint' }, 's')), res)
    out.append(q)
    run()
    mathify(out)
  }

  setTime(tt) {
    this.time = tt
    this.plots.forEach(p => p.setCursor(tt))
    this.draw()
  }

  draw() {
    if (!this.segs || !this.c) return
    const { ctx, w, h: hh } = fitCanvas(this.canvas)
    const c = this.c
    ctx.clearRect(0, 0, w, hh)
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i <= 100; i++) { const x = this.pos(this.duration * i / 100); lo = Math.min(lo, x); hi = Math.max(hi, x) }
    if (!(hi - lo > 1e-9)) { lo -= 1; hi += 1 }
    const span = hi - lo
    const view = new View(w, hh, [lo - span * 0.08, hi + span * 0.08, -span * 0.12, span * 0.16], { l: 20, r: 20, t: 14, b: 30 })
    ground(ctx, view, 0, lo - span * 0.08, hi + span * 0.08, c)
    ruler(ctx, view, lo - span * 0.06, hi + span * 0.06, -span * 0.01, c)
    for (const s of this.segs) {
      const px = view.X(s.xf)
      ctx.save(); ctx.strokeStyle = c.third; ctx.globalAlpha = 0.5; ctx.setLineDash([2, 3])
      ctx.beginPath(); ctx.moveTo(px, view.Y(0)); ctx.lineTo(px, view.Y(0) - 40); ctx.stroke(); ctx.restore()
    }
    const x = this.pos(this.time)
    const v = this.vel(this.time)
    car(ctx, view.X(x), view.Y(0), 13, c.primary, v < -1e-9 ? -1 : 1, c)
    const vmax = Math.max(...this.segs.map(s => Math.max(Math.abs(s.v), Math.abs(s.vf))), 1e-9)
    arrow(ctx, view.X(x), view.Y(0) - 36, view.X(x) + v / vmax * 70, view.Y(0) - 36, { color: c.primary, width: 2.4 })
    readout(ctx, c, [['t', this.time, 's'], ['x', x, 'm'], ['v', v, 'm/s']])
  }
}

const PRESETS = [
  { id: 'performance', x0: 0, v0: 0, phases: [{ dt: 15, mode: 'v', value: 50 }, { dt: 25, mode: 'v', value: 50 }, { dt: 10, mode: 'v', value: 0 }] },
  { id: 'accelGraph', x0: 0, v0: 0, phases: [{ dt: 10, mode: 'a', value: 2 }, { dt: 5, mode: 'a', value: 0 }, { dt: 5, mode: 'a', value: -3 }] },
  { id: 'startStop', x0: 0, v0: 0, phases: [{ dt: 2, mode: 'a', value: 0 }, { dt: 5, mode: 'a', value: 3 }, { dt: 10, mode: 'a', value: 0 }, { dt: 3, mode: 'v', value: 0 }] },
  { id: 'reverse', x0: 0, v0: 8, phases: [{ dt: 6, mode: 'a', value: -2 }, { dt: 3, mode: 'a', value: 0 }] },
]
