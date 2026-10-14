// Two bodies on the same line: encounters, chases and races. Each body has an
// initial position, a delay before it starts and a list of stretches (each with
// a duration, an optional new velocity and an acceleration), so the hare that
// runs, naps and runs again is as easy to describe as a police car that starts
// one second late. The meeting instants are found "by equations" (x_A = x_B in
// every interval where both laws are fixed) and "graphically" (the crossings of
// the two x(t) curves).

import { t, fill, h, tex, texNum, fmt, parseNumber, fitCanvas, debounce, renderMath, onLangChange, watchPalette } from './core.js'
import { Plot } from './plot.js'
import { Player } from './player.js'
import { View, arrow, ground, ruler, vruler, car, ball, mathLabel, readout } from './draw.js'
import { mathify } from './steps.js'

const BIG = 1e7

function segmentsOf(body) {
  const segs = []
  let tc = 0
  let x = body.x0
  let v = 0
  if (body.delay > 0) { segs.push({ t0: 0, t1: body.delay, x, v: 0, a: 0, rest: true }); tc = body.delay }
  body.phases.forEach((p, i) => {
    const last = i === body.phases.length - 1
    if (Number.isFinite(p.v)) v = p.v
    const a = Number.isFinite(p.a) ? p.a : 0
    let dt = last || !Number.isFinite(p.dt) ? Infinity : Math.max(0, p.dt)
    if (body.stopAtRest && Math.abs(a) > 1e-12 && a * v < 0) {
      const ts = -v / a
      if (ts < dt) {
        segs.push({ t0: tc, t1: tc + ts, x, v, a, phase: i })
        x += v * ts + 0.5 * a * ts * ts
        tc += ts
        v = 0
        const rest = last ? Infinity : dt - ts
        segs.push({ t0: tc, t1: tc + rest, x, v: 0, a: 0, rest: true, phase: i })
        tc += rest
        return
      }
    }
    segs.push({ t0: tc, t1: tc + dt, x, v, a, phase: i })
    if (Number.isFinite(dt)) {
      x += v * dt + 0.5 * a * dt * dt
      v += a * dt
      tc += dt
    }
  })
  return segs
}

const segAt = (segs, tt) => segs.find(s => tt >= s.t0 - 1e-12 && tt < s.t1) ?? segs[segs.length - 1]
const posAt = (segs, tt) => { const s = segAt(segs, tt); const d = tt - s.t0; return s.x + s.v * d + 0.5 * s.a * d * d }
const velAt = (segs, tt) => { const s = segAt(segs, tt); return s.v + s.a * (tt - s.t0) }

// c2 t² + c1 t + c0 without the terms whose coefficient vanishes.
function polyTex({ c2, c1, c0 }) {
  const parts = []
  for (const [c, s] of [[c2, '\\,t^2'], [c1, '\\,t'], [c0, '']]) {
    if (Math.abs(c) < 1e-12) continue
    const mag = texNum(Math.abs(c))
    parts.push(`${parts.length ? (c < 0 ? ' - ' : ' + ') : (c < 0 ? '-' : '')}${mag}${s}`)
  }
  return parts.join('') || '0'
}

// x(t) = c0 + c1 t + c2 t² in absolute time.
function polyOf(s) {
  return { c2: s.a / 2, c1: s.v - s.a * s.t0, c0: s.x - s.v * s.t0 + 0.5 * s.a * s.t0 * s.t0 }
}

function rootsIn(p, lo, hi) {
  const { c0, c1, c2 } = p
  const out = []
  if (Math.abs(c2) < 1e-14) {
    if (Math.abs(c1) < 1e-14) return Math.abs(c0) < 1e-9 ? ['all'] : []
    out.push(-c0 / c1)
  } else {
    const d = c1 * c1 - 4 * c2 * c0
    if (d < -1e-12) return []
    const s = Math.sqrt(Math.max(0, d))
    out.push((-c1 - s) / (2 * c2), (-c1 + s) / (2 * c2))
  }
  return out.filter(r => r >= lo - 1e-9 && r <= hi + 1e-9).map(r => Math.max(lo, r)).sort((a, b) => a - b)
}

export class EncounterModule {
  constructor(root, { key, palette, withAcceleration = true, vertical = false, race = false, presets = [], gravity = null }) {
    if (!root) return
    this.root = root
    this.key = key
    this.c = palette
    this.withA = withAcceleration
    this.vertical = vertical
    this.raceMode = race
    this.presets = presets
    this.gravity = gravity
    this.bodies = []
    this.finish = null
    this.time = 0
    this.build()
    watchPalette(p => { this.c = p; this.xPlot.setPalette(p); this.vPlot.setPalette(p); this.draw() })
    onLangChange(() => { this.renderEditors(); this.fillPresets(); this.update() })
    if (presets.length) this.load(presets[0].id)
  }

  tk(k, f) {
    return k.startsWith('presets.') ? t(`${this.key}.encounter.${k}`, f) : t(`common.encounter.${k}`, f)
  }

  build() {
    this.canvas = h('canvas', { class: 'mxScene' })
    const stage = h('div', { class: 'mxStageCard' }, this.canvas)
    const playerBox = h('div', { class: 'mxPlayer' })
    const xCanvas = h('canvas', { class: 'mxPlotCanvas' })
    const vCanvas = h('canvas', { class: 'mxPlotCanvas' })
    this.xTitle = h('h3', { class: 'mxPlotTitle' })
    this.vTitle = h('h3', { class: 'mxPlotTitle' })
    const plots = h('div', { class: 'mxPlots' },
      h('div', { class: 'mxPlotCard' }, this.xTitle, xCanvas),
      h('div', { class: 'mxPlotCard' }, this.vTitle, vCanvas))
    this.presetSel = h('select', { class: 'mxPresetSel', 'aria-label': 'preset' })
    this.statement = h('div', { class: 'mxStatement', hidden: true })
    this.editors = h('div', { class: 'mxBlock' })
    this.raceBox = h('div', { class: 'mxBlock', hidden: !this.raceMode })
    const aside = h('aside', { class: 'mxPanel' },
      h('div', { class: 'mxBlock' }, h('h3', { class: 'mxH3', 'data-k': 'presetsTitle' }), this.presetSel, this.statement),
      this.editors,
      this.raceBox)
    this.out = h('div', { class: 'mxSolution' })
    this.root.append(
      h('div', { class: 'mxLabGrid' },
        h('div', { class: 'mxStageCol' }, stage, playerBox, plots),
        aside),
      h('h3', { class: 'mxH3 mxModuleStepsTitle', 'data-k': 'stepsTitle', style: 'margin: 1.4rem 0 .6rem' }),
      this.out)
    this.player = new Player(playerBox, tt => this.setTime(tt))
    this.xPlot = new Plot(xCanvas, this.c)
    this.vPlot = new Plot(vCanvas, this.c)
    for (const [cv, plot] of [[xCanvas, this.xPlot], [vCanvas, this.vPlot]]) {
      const scrub = e => { const tt = plot.timeAt(e.clientX); if (tt !== null) { this.player.pause(); this.player.seek(tt) } }
      cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); scrub(e) })
      cv.addEventListener('pointermove', e => { if (e.buttons) scrub(e) })
    }
    new ResizeObserver(() => this.draw()).observe(this.canvas)
    this.presetSel.addEventListener('change', () => this.load(this.presetSel.value))
    this.fillPresets()
  }

  fillPresets() {
    const cur = this.presetSel.value
    this.presetSel.innerHTML = ''
    this.presetSel.append(h('option', { value: '' }, t('common.panel.custom', 'Your own problem')))
    for (const p of this.presets) this.presetSel.append(h('option', { value: p.id }, this.tk(`presets.${p.id}.title`, p.id)))
    this.presetSel.value = cur
    this.root.querySelectorAll('[data-k]').forEach(el => { el.textContent = this.tk(el.dataset.k, el.dataset.k) })
    this.xTitle.innerHTML = tex(this.vertical ? 'y(t)' : 'x(t)') + ' · ' + this.tk('plotX', 'position of both bodies')
    this.vTitle.innerHTML = tex('v(t)') + ' · ' + this.tk('plotV', 'velocity of both bodies')
    if (this.presetSel.value) this.showStatement(this.presetSel.value)
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
    this.bodies = p.bodies.map(b => ({
      x0: b.x0 ?? 0, delay: b.delay ?? 0, stopAtRest: !!b.stopAtRest,
      phases: b.phases.map(ph => ({ dt: ph.dt ?? null, v: ph.v ?? null, a: ph.a ?? (this.gravity ? null : 0) })),
    }))
    this.finish = p.finish ?? null
    this.renderEditors()
    this.update()
    this.player.seek(0)
  }

  // ── Editors ─────────────────────────────────────────────────────────────

  renderEditors() {
    this.editors.innerHTML = ''
    const fire = debounce(() => this.update(), 180)
    const X = this.vertical ? 'y' : 'x'
    this.bodies.forEach((b, bi) => {
      const name = bi === 0 ? 'A' : 'B'
      const color = bi === 0 ? 'primary' : 'second'
      const field = (label, value, set) => {
        const inp = h('input', { class: 'mxIn', type: 'text', inputmode: 'decimal', value: Number.isFinite(value) ? fmt(value, 5) : '', placeholder: '—' })
        inp.addEventListener('input', () => { const p = parseNumber(inp.value); set(p.ok && !p.empty ? p.value : null); fire() })
        return h('label', { class: 'mxSmallField' }, h('span', { html: label }), inp)
      }
      const card = h('div', { class: 'mxBodyCard' },
        h('h4', {}, h('span', { class: 'mxSwatch mxSwatch--dot', style: `color:${this.c[color]}` }), `${this.tk('body', 'Body')} ${name}`),
        h('div', { class: 'mxBodyGrid' },
          field(`${tex(`${X}_0`)} (m)`, b.x0, v => { b.x0 = v ?? 0 }),
          field(`${tex('t_{\\text{start}}')} (s)`, b.delay || '', v => { b.delay = v ?? 0 })))
      if (this.withA && !this.vertical) {
        const cb = h('input', { type: 'checkbox', checked: b.stopAtRest })
        cb.addEventListener('change', () => { b.stopAtRest = cb.checked; this.update() })
        card.append(h('label', { class: 'checkbox' }, cb,
          h('span', { class: 'box', html: '<svg viewBox="0 0 16 16"><path d="M3 8.5 L6.5 12 L13 4" /></svg>' }),
          h('span', { class: 'checkbox-label', style: 'font-size:.8rem' }, this.tk('stopAtRest', 'Stays at rest once it stops (braking)'))))
      }
      const list = h('div', { class: 'mxPhaseList' })
      b.phases.forEach((p, pi) => {
        const last = pi === b.phases.length - 1
        const row = h('div', { class: 'mxPhase', style: this.withA ? 'grid-template-columns: 1.4rem repeat(3, minmax(0,1fr)) 1.8rem' : '' },
          h('span', { class: 'mxPhaseNum' }, String(pi + 1)),
          field(`${tex('\\Delta t')} (s)`, last ? '' : p.dt, v => { p.dt = v }),
          field(`${tex(pi === 0 ? 'v_0' : 'v_i')} (m/s)`, p.v, v => { p.v = v }))
        if (this.withA) row.append(field(`${tex('a')} (m/s²)`, p.a, v => { p.a = v }))
        const del = h('button', { class: 'mxPhaseDel', type: 'button', title: this.tk('removePhase', 'Remove stretch'), disabled: b.phases.length < 2 }, '×')
        del.addEventListener('click', () => { b.phases.splice(pi, 1); this.renderEditors(); this.update() })
        row.append(del)
        if (last) row.querySelector('input').placeholder = '∞'
        list.append(row)
      })
      const add = h('button', { class: 'mxMiniBtn', type: 'button' }, `+ ${this.tk('addPhase', 'Add stretch')}`)
      add.addEventListener('click', () => {
        const lastP = b.phases[b.phases.length - 1]
        if (!Number.isFinite(lastP.dt)) lastP.dt = 5
        b.phases.push({ dt: null, v: null, a: this.withA ? 0 : 0 })
        this.renderEditors()
        this.update()
      })
      card.append(h('p', { class: 'mxHint', html: this.tk('phasesHint', 'Stretches in order. An empty initial velocity continues from the previous stretch; the last one lasts indefinitely.') }), list, add)
      this.editors.append(card)
    })
    if (this.raceMode) {
      this.raceBox.innerHTML = ''
      const inp = h('input', { class: 'mxIn', type: 'text', inputmode: 'decimal', value: this.finish ?? '', placeholder: '—' })
      inp.addEventListener('input', () => { const p = parseNumber(inp.value); this.finish = p.ok && !p.empty ? p.value : null; fire() })
      this.raceBox.append(h('h3', { class: 'mxH3' }, this.tk('finishTitle', 'Finish line')),
        h('label', { class: 'mxSmallField' }, h('span', { html: `${tex('x_{\\text{meta}}')} (m)` }), inp))
    }
  }

  // ── Analysis ────────────────────────────────────────────────────────────

  update() {
    if (this.bodies.length < 2) return
    const g = this.gravity?.() ?? 0
    const bodies = this.bodies.map(b => ({
      ...b,
      phases: b.phases.map(p => ({ ...p, a: Number.isFinite(p.a) ? p.a : (this.vertical ? -g : 0) })),
    }))
    this.segs = bodies.map(segmentsOf)
    const [A, B] = this.segs
    const cuts = [...new Set([0, ...A.map(s => s.t0), ...A.map(s => s.t1), ...B.map(s => s.t0), ...B.map(s => s.t1)])]
      .filter(x => Number.isFinite(x) && x >= 0).sort((p, q) => p - q)
    cuts.push(BIG)
    const meets = []
    let together = null
    for (let i = 0; i < cuts.length - 1; i++) {
      const lo = cuts[i]
      const hi = cuts[i + 1]
      if (hi - lo < 1e-12) continue
      const mid = Math.min((lo + hi) / 2, lo + 1)
      const pa = polyOf(segAt(A, mid))
      const pb = polyOf(segAt(B, mid))
      const diff = { c0: pa.c0 - pb.c0, c1: pa.c1 - pb.c1, c2: pa.c2 - pb.c2 }
      const r = rootsIn(diff, lo, hi)
      if (r[0] === 'all') { together = together ?? { lo, hi }; continue }
      for (const root of r) if (!meets.some(m => Math.abs(m.t - root) < 1e-7)) meets.push({ t: root, lo, hi, pa, pb, diff, sa: segAt(A, mid), sb: segAt(B, mid) })
    }
    meets.sort((p, q) => p.t - q.t)
    // Sharing the starting point at t = 0 (the car passing the hidden trooper)
    // is the initial condition, not the meeting the statement asks for.
    this.startTogether = meets.length > 0 && meets[0].t < 1e-9
    if (this.startTogether) meets.shift()
    this.meets = meets
    this.together = together

    // Race to a finish line
    this.arrivals = null
    if (this.raceMode && Number.isFinite(this.finish)) {
      this.arrivals = this.segs.map(segs => {
        for (const s of segs) {
          const r = rootsIn({ ...(() => { const p = polyOf(s); return { c0: p.c0 - this.finish, c1: p.c1, c2: p.c2 } })() }, s.t0, Math.min(s.t1, BIG))
          if (r.length && r[0] !== 'all') return r[0]
        }
        return null
      })
    }

    // Closest approach when they never meet
    this.closest = null
    if (!meets.length && !together) {
      let best = null
      for (let i = 0; i < cuts.length - 1; i++) {
        const lo = cuts[i]
        const hi = Math.min(cuts[i + 1], 1e5)
        if (hi <= lo) continue
        const mid = Math.min((lo + hi) / 2, lo + 1)
        const sa = segAt(A, mid)
        const sb = segAt(B, mid)
        const pa = polyOf(sa)
        const pb = polyOf(sb)
        const d = { c0: pa.c0 - pb.c0, c1: pa.c1 - pb.c1, c2: pa.c2 - pb.c2 }
        const cand = [lo, hi]
        if (Math.abs(d.c2) > 1e-14) { const tv = -d.c1 / (2 * d.c2); if (tv > lo && tv < hi) cand.push(tv) }
        for (const tt of cand) {
          const sep = Math.abs(d.c0 + d.c1 * tt + d.c2 * tt * tt)
          if (!best || sep < best.sep - 1e-9) best = { t: tt, sep, d, sa, sb, lo, hi }
        }
      }
      this.closest = best
    }

    const ends = [...meets.map(m => m.t), ...(this.arrivals ?? []).filter(Number.isFinite), ...(this.closest ? [this.closest.t] : [])]
    const lastBreak = Math.max(...this.segs.flat().map(s => (Number.isFinite(s.t1) ? s.t1 : s.t0)), 0)
    let dur = Math.max(...ends, lastBreak, 1)
    dur *= ends.length ? 1.2 : 1.5
    const arrived = (this.arrivals ?? []).filter(Number.isFinite)
    if (arrived.length === 2) dur = Math.max(...arrived) * 1.03
    if (this.vertical) {
      // Stop shortly after both bodies reach the ground.
      const hits = this.segs.map(segs => { for (const s of segs) { const p = polyOf(s); const r = rootsIn({ c0: p.c0, c1: p.c1, c2: p.c2 }, s.t0 + 1e-9, Math.min(s.t1, BIG)); if (r.length && r[0] !== 'all') return r[0] } return null })
      const hmax = Math.max(...hits.filter(Number.isFinite), 0)
      if (hmax > 0) dur = Math.min(Math.max(dur, hmax), hmax)
      this.hits = hits
    }
    this.duration = dur
    this.player.setDuration(dur)
    this.renderPlots()
    this.renderSteps()
    this.setTime(Math.min(this.time, dur))
  }

  renderPlots() {
    const [A, B] = this.segs
    const marks = this.meets.filter(m => m.t <= this.duration).map((m, i) => ({ t: m.t, y: posAt(A, m.t), label: `${this.tk('meetShort', 'meet')} ${i + 1}`, color: 'third' }))
    const lines = []
    if (this.raceMode && Number.isFinite(this.finish)) lines.push({ x1: 0, y1: this.finish, x2: this.duration, y2: this.finish, color: 'muted', keepInRange: true })
    const clip = this.vertical ? (segs, f) => tt => { const y = f(segs, tt); return y < -1e-9 ? NaN : y } : (segs, f) => tt => f(segs, tt)
    this.xPlot.set({
      t0: 0, t1: this.duration, xLabel: 't (s)', yLabel: this.vertical ? 'y (m)' : 'x (m)', yUnit: 'm',
      series: [{ fn: clip(A, posAt), color: 'primary' }, { fn: clip(B, posAt), color: 'second' }],
      marks, lines,
    })
    this.vPlot.set({
      t0: 0, t1: this.duration, xLabel: 't (s)', yLabel: 'v (m/s)', yUnit: 'm/s',
      series: [{ fn: tt => velAt(A, tt), color: 'primary', jumps: true }, { fn: tt => velAt(B, tt), color: 'second', jumps: true }],
    })
  }

  // ── Steps ───────────────────────────────────────────────────────────────

  lawTex(s, sym, X) {
    const tt = s.t0 > 0 ? `(t - ${texNum(s.t0)})` : 't'
    if (s.rest || (Math.abs(s.v) < 1e-12 && Math.abs(s.a) < 1e-12)) return `${X}_${sym}(t) = ${texNum(s.x)}`
    let out = `${X}_${sym}(t) = ${texNum(s.x)}`
    if (Math.abs(s.v) > 1e-12) out += ` ${s.v < 0 ? '-' : '+'} ${texNum(Math.abs(s.v))}\\,${tt}`
    if (Math.abs(s.a) > 1e-12) out += ` ${s.a < 0 ? '-' : '+'} ${texNum(Math.abs(s.a) / 2)}\\,${tt}^2`
    return out
  }

  renderSteps() {
    const out = this.out
    out.innerHTML = ''
    const X = this.vertical ? 'y' : 'x'
    const card = (title, ...lines) => {
      const c = h('article', { class: 'mxStep' }, h('header', { class: 'mxStepHead' }, h('span', { class: 'mxProse mxStepTitle', html: title })))
      for (const l of lines) {
        if (l === null) continue
        if (typeof l === 'object' && l.prose) c.append(h('p', { class: 'mxProse', html: l.prose }))
        else if (typeof l === 'object' && l.go !== undefined) {
          const b = h('button', { class: 'mxEventGo', type: 'button' }, t('common.events.go', 'Go to instant'))
          b.addEventListener('click', () => { this.player.pause(); this.player.seek(l.go) })
          c.append(b)
        } else c.append(h('div', { class: 'mxEq', 'data-tex': l, 'data-display': '1' }))
      }
      out.append(c)
      return c
    }

    if (this.together) {
      card(this.tk('togetherTitle', 'They move together'), { prose: this.tk('togetherText', 'In part of the motion both laws are identical: the bodies travel side by side.') })
    }
    if (this.startTogether) {
      out.append(h('p', { class: 'mxProse', html: this.tk('startTogether', 'At t = 0 both bodies are at the same point; that is the initial condition, so we look for the next meeting.') }))
    }

    const first = this.meets[0]
    if (first) {
      card(this.tk('lawsTitle', 'Position laws in the interval of the meeting'),
        { prose: fill(this.tk('lawsText', 'Between {lo} and {hi} each body follows a single law of the invariant (with its own origin of time if it started late):'), { lo: `\\(t = ${texNum(first.lo)}\\,\\text{s}\\)`, hi: first.hi >= BIG ? '\\(\\infty\\)' : `\\(t = ${texNum(first.hi)}\\,\\text{s}\\)` }) },
        this.lawTex(first.sa, 'A', X), this.lawTex(first.sb, 'B', X))
      const d = first.diff
      const quad = Math.abs(d.c2) > 1e-14
      card(this.tk('meetTitle', 'Meeting condition'),
        { prose: fill(this.tk('meetText', 'They meet when they occupy the same position at the same instant, {cond}. Moving every term to one side:'), { cond: `\\(${X}_A(t) = ${X}_B(t)\\)` }) },
        `${polyTex(d)} = 0`,
        quad ? `t = \\frac{-B \\pm \\sqrt{B^2 - 4AC}}{2A} = \\frac{${texNum(-d.c1)} \\pm \\sqrt{${texNum(d.c1 * d.c1 - 4 * d.c2 * d.c0)}}}{${texNum(2 * d.c2)}}` : `t = -\\frac{C}{B} = ${texNum(-d.c0 / d.c1)}\\,\\text{s}`,
        { prose: this.tk('meetValid', 'Only the roots inside the interval where these laws hold, and after both bodies have started, are meetings.') })
      this.meets.forEach((m, i) => {
        const [A, B] = this.segs
        card(fill(this.tk('meetN', 'Meeting {n}'), { n: i + 1 }),
          `t = ${texNum(m.t)}\\,\\text{s}`,
          `${X} = ${texNum(posAt(A, m.t))}\\,\\text{m}`,
          `v_A = ${texNum(velAt(A, m.t))}\\,\\text{m/s},\\qquad v_B = ${texNum(velAt(B, m.t))}\\,\\text{m/s}`,
          { go: m.t })
      })
    } else if (this.closest && !this.together) {
      const cl = this.closest
      card(this.tk('noMeetTitle', 'They never meet'),
        { prose: this.tk('noMeetText', 'The equation x_A(t) = x_B(t) has no root after both bodies start: the curves of the graph never cross. The separation d(t) = x_A(t) − x_B(t) is smallest where its derivative vanishes (or at the start of an interval):') },
        `d(t) = ${polyTex(cl.d)}`,
        Math.abs(cl.d.c2) > 1e-14 ? `\\frac{dd}{dt} = 0 \\;\\Rightarrow\\; t^* = -\\frac{${texNum(cl.d.c1)}}{2(${texNum(cl.d.c2)})} = ${texNum(cl.t)}\\,\\text{s}` : null,
        `|d|_{\\min} = ${texNum(cl.sep)}\\,\\text{m}`,
        { go: cl.t })
    }

    if (this.arrivals) {
      const [ta, tb] = this.arrivals
      const lines = [
        `t_A = ${Number.isFinite(ta) ? texNum(ta) + '\\,\\text{s}' : '\\text{—}'},\\qquad t_B = ${Number.isFinite(tb) ? texNum(tb) + '\\,\\text{s}' : '\\text{—}'}`,
      ]
      if (Number.isFinite(ta) && Number.isFinite(tb)) {
        const win = Math.abs(ta - tb) < 1e-6 ? this.tk('tie', 'It is a tie.') : fill(this.tk('winner', 'Body {w} wins by {dt}.'), { w: ta < tb ? 'A' : 'B', dt: `\\(${texNum(Math.abs(ta - tb))}\\,\\text{s}\\)` })
        lines.push({ prose: win })
        const tie = this.tieAnalysis(ta, tb)
        if (tie) lines.push(...tie)
      }
      card(fill(this.tk('raceTitle', 'Arrival at the finish line {x}'), { x: `\\(x = ${texNum(this.finish)}\\,\\text{m}\\)` }), ...lines)
    }
    mathify(out)
  }

  // If one of the bodies naps (a stretch with v = 0), how long can the nap be so
  // that it still ties? (Serway 2.9, the hare and the tortoise.)
  tieAnalysis(ta, tb) {
    const idx = [0, 1].find(i => this.bodies[i].phases.some((p, pi) => pi < this.bodies[i].phases.length - 1 && Math.abs(p.v ?? 1) < 1e-12 && Math.abs(p.a ?? 0) < 1e-12 && Number.isFinite(p.dt)))
    if (idx === undefined) return null
    const other = 1 - idx
    const mine = idx === 0 ? ta : tb
    const theirs = idx === 0 ? tb : ta
    const b = this.bodies[idx]
    const nap = b.phases.find((p, pi) => pi < b.phases.length - 1 && Math.abs(p.v ?? 1) < 1e-12 && Math.abs(p.a ?? 0) < 1e-12)
    const napMax = nap.dt + (theirs - mine)
    if (napMax < 0) return [{ prose: this.tk('tieImpossible', 'Even without stopping it could not tie.') }]
    const napIdx = b.phases.indexOf(nap)
    const segs = this.segs[idx]
    const resume = segs.find(s => s.phase === napIdx)?.t0 + napMax
    const otherPos = posAt(this.segs[other], resume)
    const name = idx === 0 ? 'A' : 'B'
    return [
      { prose: fill(this.tk('tieText', 'For body {n} to arrive exactly with the other one, its stop may last at most {w}; it must set off again at {tr}, when the other body is at {x}, that is, {d} from the finish.'), {
        n: name,
        w: `\\(${texNum(napMax)}\\,\\text{s}\\)`,
        tr: `\\(t = ${texNum(resume)}\\,\\text{s}\\)`,
        x: `\\(x = ${texNum(otherPos)}\\,\\text{m}\\)`,
        d: `\\(${texNum(this.finish - otherPos)}\\,\\text{m}\\)`,
      }) },
      `\\Delta t_{\\text{pausa,máx}} = \\Delta t_{\\text{pausa}} + (t_{\\text{otro}} - t_{\\text{propio}}) = ${texNum(nap.dt)} + (${texNum(theirs)} - ${texNum(mine)}) = ${texNum(napMax)}\\,\\text{s}`,
    ]
  }

  // ── Scene ───────────────────────────────────────────────────────────────

  setTime(tt) {
    this.time = tt
    this.xPlot.setCursor(tt)
    this.vPlot.setCursor(tt)
    this.draw()
  }

  draw() {
    if (!this.segs || !this.c) return
    const { ctx, w, h: hh } = fitCanvas(this.canvas)
    const c = this.c
    ctx.clearRect(0, 0, w, hh)
    const T = this.duration
    let lo = Infinity
    let hi = -Infinity
    for (const segs of this.segs) for (let i = 0; i <= 80; i++) {
      const v = posAt(segs, T * i / 80)
      if (this.vertical && v < 0) continue
      lo = Math.min(lo, v); hi = Math.max(hi, v)
    }
    if (Number.isFinite(this.finish)) { lo = Math.min(lo, this.finish); hi = Math.max(hi, this.finish) }
    if (this.vertical) lo = Math.min(lo, 0)
    if (!(hi - lo > 1e-9)) { lo -= 1; hi += 1 }
    const span = hi - lo
    const colors = [c.primary, c.second]
    if (this.vertical) {
      const view = new View(w, hh, [-span * 0.6, span * 0.6, lo - span * 0.05, hi + span * 0.08], { l: 50, r: 20, t: 20, b: 20 })
      ground(ctx, view, 0, -span * 0.6, span * 0.6, c)
      vruler(ctx, view, Math.max(0, lo), hi, -span * 0.45, c)
      this.segs.forEach((segs, i) => {
        const y = Math.max(0, posAt(segs, this.time))
        const x = (i === 0 ? -0.12 : 0.12) * span
        ball(ctx, view.X(x), view.Y(y), 8, colors[i])
        mathLabel(ctx, i === 0 ? 'A' : 'B', view.X(x) + 12, view.Y(y), { color: colors[i], size: 13 })
        const v = velAt(segs, this.time)
        if (y > 0 || this.time === 0) arrow(ctx, view.X(x), view.Y(y), view.X(x), view.Y(y) - Math.max(-60, Math.min(60, v * 3)), { color: colors[i], width: 2 })
      })
    } else {
      const view = View.strip(w, hh, lo - span * 0.08, hi + span * 0.08, 0.72)
      ground(ctx, view, 0, lo - span * 0.08, hi + span * 0.08, c)
      ruler(ctx, view, lo - span * 0.06, hi + span * 0.06, 0, c)
      if (Number.isFinite(this.finish)) {
        const px = view.X(this.finish)
        ctx.save(); ctx.strokeStyle = c.third; ctx.lineWidth = 2; ctx.setLineDash([6, 4])
        ctx.beginPath(); ctx.moveTo(px, view.Y(0)); ctx.lineTo(px, 20); ctx.stroke(); ctx.restore()
      }
      this.segs.forEach((segs, i) => {
        const x = posAt(segs, this.time)
        const v = velAt(segs, this.time)
        const lane = view.Y(0) - (i === 0 ? 46 : 8)
        car(ctx, view.X(x), lane, 13, colors[i], v < -1e-9 ? -1 : 1, c)
        mathLabel(ctx, i === 0 ? 'A' : 'B', view.X(x), lane - 26, { color: colors[i], size: 13, align: 'center' })
      })
      for (const m of this.meets) {
        if (m.t > this.time) continue
        const x = posAt(this.segs[0], m.t)
        ctx.save(); ctx.strokeStyle = c.third; ctx.globalAlpha = 0.6; ctx.setLineDash([3, 3])
        ctx.beginPath(); ctx.moveTo(view.X(x), view.Y(0)); ctx.lineTo(view.X(x), view.Y(0) - 70); ctx.stroke(); ctx.restore()
      }
    }
    readout(ctx, c, [['t', this.time, 's']])
  }
}
