// Controller shared by the topic pages. A topic module describes its model
// (variables, equations of the invariant, conditions, presets) and how to draw
// it (scene, plots, notable events); this class wires the data panel, the
// solver, the worked solution, the playback and the graphs together.

import { t, fill, h, tex, texNum, whenKatex, readPalette, watchPalette, fitCanvas, onLangChange, Gravity, renderMath, parseNumber, fmt } from './core.js'
import { solve, eqTex } from './algebra.js'
import { DataPanel, gravityControl } from './panel.js'
import { renderSolution, eqLabel, mathify } from './steps.js'
import { Player } from './player.js'
import { Plot } from './plot.js'

export class TopicPage {
  constructor(topic) {
    this.topic = topic
    this.key = topic.key
    this.g = Gravity.get()
    this.condition = topic.conditions?.[0]?.id ?? null
    this.options = { ...(topic.options ?? {}) }
    this.branch = 0
    this.time = 0
    this.plots = new Map()
  }

  tk(path, fallback) {
    return t(`${this.key}.${path}`, fallback)
  }

  async main() {
    await whenKatex()
    this.c = readPalette()
    this.canvas = document.getElementById('mxScene')
    this.player = new Player(document.getElementById('mxPlayer'), tt => this.setTime(tt))
    this.buildPanel()
    this.buildPresets()
    this.buildConditions()
    if (this.topic.extraControls) {
      const box = document.getElementById('mxExtraControls')
      box.hidden = false
      this.topic.extraControls(box, this)
    }
    watchPalette(p => { this.c = p; this.plots.forEach(pl => pl.plot.setPalette(p)); this.draw() })
    new ResizeObserver(() => this.draw()).observe(this.canvas)
    document.querySelectorAll('.mxLoadBtn[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadPreset(btn.dataset.preset)
        document.querySelector('.mxLab')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
    document.getElementById('mxClear')?.addEventListener('click', () => {
      this.presetSel.value = ''
      this.statement.hidden = true
      this.panel.clear()
      this.setCondition(this.topic.conditions?.[0]?.id ?? null, false)
      this.update()
    })
    this.buildQuery()
    onLangChange(() => this.retranslate())
    this.topic.init?.(this)
    const first = this.topic.presets?.[0]?.id
    if (first) this.loadPreset(first)
    else this.update()
  }

  // ── Panel, presets, conditions ──────────────────────────────────────────

  system() {
    return this.topic.system(this)
  }

  buildPanel() {
    const sys = this.system()
    this.panel = new DataPanel(document.getElementById('mxData'), {
      vars: sys.vars,
      order: this.topic.order,
      onChange: () => this.update(),
    })
    if (this.topic.usesG) {
      this.gCtl = gravityControl(document.getElementById('mxGravity'), v => { this.g = v; this.update() })
    }
  }

  buildPresets() {
    this.presetSel = document.getElementById('mxPreset')
    this.statement = document.getElementById('mxStatement')
    this.fillPresetOptions()
    this.presetSel.addEventListener('change', () => {
      if (this.presetSel.value) this.loadPreset(this.presetSel.value)
      else this.statement.hidden = true
    })
  }

  fillPresetOptions() {
    const cur = this.presetSel.value
    this.presetSel.innerHTML = ''
    this.presetSel.append(h('option', { value: '' }, t('common.panel.custom', 'Your own problem')))
    for (const p of this.topic.presets ?? []) {
      this.presetSel.append(h('option', { value: p.id }, this.tk(`presets.${p.id}.title`, p.id)))
    }
    this.presetSel.value = cur
  }

  showStatement(id) {
    if (!id) { this.statement.hidden = true; return }
    const src = this.tk(`presets.${id}.source`, '')
    this.statement.innerHTML = `<p>${this.tk(`presets.${id}.text`, '')}</p>${src ? `<span class="mxStatementSource">${src}</span>` : ''}`
    renderMath(this.statement)
    this.statement.hidden = false
  }

  loadPreset(id) {
    const p = (this.topic.presets ?? []).find(x => x.id === id)
    if (!p) return
    this.presetSel.value = id
    this.showStatement(id)
    this.branch = 0
    this.options = { ...(this.topic.options ?? {}), ...(p.options ?? {}) }
    this.topic.syncOptions?.(this)
    this.panel.load(p.data ?? {}, p.asked ?? [])
    this.setCondition(p.condition ?? this.topic.conditions?.[0]?.id ?? null, false)
    this.topic.onPreset?.(this, p)
    this.update()
    this.player.seek(0)
    this.player.play()
  }

  buildConditions() {
    const box = document.getElementById('mxConditions')
    if (!box || !this.topic.conditions) return
    this.condBox = box
    this.renderConditions()
  }

  renderConditions() {
    if (!this.condBox) return
    this.condBox.innerHTML = ''
    for (const c of this.topic.conditions) {
      if (c.when && !c.when(this)) continue
      const b = h('button', { class: `mxCond${c.id === this.condition ? ' is-active' : ''}`, type: 'button', dataset: { cond: c.id } },
        this.tk(`conditions.${c.id}`, c.id))
      b.addEventListener('click', () => this.setCondition(c.id))
      this.condBox.append(b)
    }
    renderMath(this.condBox)
  }

  setCondition(id, rerun = true) {
    this.condition = id
    this.panel.unlockAll()
    const c = this.topic.conditions?.find(x => x.id === id)
    if (c?.lock) {
      for (const [name, value] of Object.entries(typeof c.lock === 'function' ? c.lock(this) : c.lock)) {
        this.panel.lock(name, value, `${this.key}.conditions.${id}`)
      }
    }
    this.renderConditions()
    if (rerun) this.update()
  }

  // ── Solving ─────────────────────────────────────────────────────────────

  update() {
    const sys = this.system()
    this.sys = sys
    const given = { ...this.panel.given(), ...(this.topic.fixed?.(this) ?? {}) }
    const shown = this.panel.given()
    this.given = given
    this.result = solve(sys, given)
    if (this.branch >= this.result.branches.length) this.branch = 0
    renderSolution(document.getElementById('mxSolution'), this.result, {
      system: sys,
      panel: this.panel,
      given: shown,
      allGiven: given,
      asked: this.panel.asked,
      extraGiven: [
        ...(this.topic.extraGiven?.(this) ?? []),
        ...(this.topic.usesG && Number.isFinite(given.g) ? [`g = ${texNum(given.g)}\\,\\text{m/s}^2`] : []),
      ],
      why: s => this.topic.why?.(s, this),
      valueNote: (u, v) => this.topic.valueNote?.(u, v, this),
      branchName: (br, i) => this.topic.branchName?.(br, i, this) ?? null,
      onBranch: i => { this.branch = i; this.refreshMotion() },
    })
    this.panel.showSolution(this.values())
    this.renderInvariant()
    this.refreshMotion()
  }

  values() {
    const br = this.result?.branches?.[this.branch]
    return br && !br.fail ? br.values : (br?.values ?? {})
  }

  refreshMotion() {
    const vals = this.values()
    this.panel.showSolution(vals)
    this.motion = this.topic.motion(vals, this)
    const note = document.getElementById('mxSceneNote')
    if (!this.motion) {
      note.hidden = false
      note.textContent = t('common.panel.needMore', 'Add data until the motion is fully determined to see the simulation.')
      this.player.setDuration(1)
    } else {
      note.hidden = true
      this.player.setDuration(this.motion.duration)
    }
    this.renderPlots()
    this.renderEvents()
    this.renderLegend()
    this.setTime(Math.min(this.time, this.motion?.duration ?? 0))
  }

  // ── Invariant ───────────────────────────────────────────────────────────

  renderInvariant() {
    const box = document.getElementById('mxInvariant')
    if (!box) return
    const sys = this.sys
    const used = new Set()
    for (const s of this.result.branches[this.branch]?.steps ?? []) {
      if (s.type === 'single') used.add(s.eqId)
      else s.eqIds.forEach(id => used.add(id))
    }
    box.innerHTML = ''
    const inv = h('div', { class: 'mxInvCard' },
      h('h3', { class: 'mxInvCardTitle' },
        h('span', {}, this.tk('invariantTitle', t('common.sections.invariant', 'The invariant'))),
        h('span', { class: 'mxInvTag' }, t('common.invariant.tag', 'general'))))
    for (const e of sys.eqs) {
      if (e.hidden) continue
      inv.append(h('div', { class: `mxInvEq${used.has(e.id) ? ' is-used' : ''}` },
        h('span', { class: 'mxInvNum', html: tex(eqLabel(sys, e.id)) }),
        h('span', { html: tex(eqTex(e, sys.vars)) }),
        e.lacks ? h('span', { class: 'mxInvLacks', html: fill(t('common.invariant.lacks', 'without {v}'), { v: tex(sys.vars[e.lacks]?.tex ?? e.lacks) }) }) : h('span')))
    }
    const invNote = this.tk('invariantNote', '')
    if (invNote) inv.append(h('p', { class: 'mxInvNote', html: invNote }))
    inv.append(h('p', { class: 'mxInvNote', html: t('common.invariant.used', 'Highlighted: the equations used in the solution below.') }))
    box.append(inv)
    const variant = this.topic.variant?.(this.values(), this)
    if (variant) {
      const card = h('div', { class: 'mxInvCard mxInvCard--variant' },
        h('h3', { class: 'mxInvCardTitle' },
          h('span', {}, variant.title),
          variant.tag ? h('span', { class: 'mxInvTag' }, variant.tag) : null))
      variant.eqs.forEach((src, i) => card.append(h('div', { class: 'mxInvEq' },
        h('span', { class: 'mxInvNum' }, variant.labels?.[i] ?? ''),
        h('span', { html: tex(src) }),
        h('span'))))
      if (variant.note) card.append(h('p', { class: 'mxInvNote', html: variant.note }))
      box.append(card)
    }
    for (const extra of this.topic.invariantExtra?.(this.values(), this) ?? []) box.append(extra)
    renderMath(box)
  }

  // ── Plots ───────────────────────────────────────────────────────────────

  renderPlots() {
    const box = document.getElementById('mxPlots')
    if (!box) return
    const specs = this.motion ? this.topic.plots(this.motion, this) : []
    const ids = specs.map(s => s.id).join('|')
    if (ids !== this.plotIds) {
      this.plotIds = ids
      box.innerHTML = ''
      this.plots.clear()
      for (const s of specs) {
        const canvas = h('canvas', { class: 'mxPlotCanvas' })
        const title = h('h3', { class: 'mxPlotTitle' })
        const note = h('p', { class: 'mxPlotNote' })
        const card = h('div', { class: 'mxPlotCard' }, title, canvas, note)
        box.append(card)
        const plot = new Plot(canvas, this.c)
        const scrub = e => {
          const tt = plot.timeAt(e.clientX)
          if (tt !== null) { this.player.pause(); this.player.seek(tt) }
        }
        canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); scrub(e) })
        canvas.addEventListener('pointermove', e => { if (e.buttons) scrub(e) })
        this.plots.set(s.id, { plot, title, note })
      }
      if (!specs.length) box.append(h('p', { class: 'mxEmpty' }, t('common.panel.needMore', 'Add data until the motion is fully determined to see the simulation.')))
    }
    for (const s of specs) {
      const p = this.plots.get(s.id)
      p.title.innerHTML = s.title
      p.note.innerHTML = s.note ?? ''
      p.note.hidden = !s.note
      renderMath(p.title)
      renderMath(p.note)
      p.plot.set({ t0: 0, t1: this.motion.duration, ...s.cfg })
    }
  }

  // ── Events and query ────────────────────────────────────────────────────

  renderEvents() {
    const box = document.getElementById('mxEvents')
    if (!box) return
    box.innerHTML = ''
    const list = this.motion ? (this.topic.events?.(this.motion, this) ?? []) : []
    if (!list.length) {
      box.append(h('p', { class: 'mxEmpty' }, this.motion ? t('common.events.none', 'No notable events for this motion.') : t('common.panel.needMore', 'Add data until the motion is fully determined to see the simulation.')))
      return
    }
    for (const ev of list) {
      const go = Number.isFinite(ev.t)
        ? h('button', { class: 'mxEventGo', type: 'button' }, t('common.events.go', 'Go to instant'))
        : null
      go?.addEventListener('click', () => { this.player.pause(); this.player.seek(ev.t) })
      const card = h('div', { class: 'mxEvent' },
        h('div', { class: 'mxEventHead' }, h('h3', { class: 'mxEventTitle' }, ev.title), go),
        ev.cond ? h('p', { class: 'mxEventCond mxProse', html: ev.cond }) : null,
        ...ev.lines.map(src => h('div', { class: 'mxEq', html: tex(src, false) })))
      box.append(card)
    }
    mathify(box)
  }

  buildQuery() {
    const box = document.getElementById('mxQuery')
    if (!box || !this.topic.query) { if (box) box.hidden = true; return }
    this.queryBox = box
    this.renderQueryForm()
  }

  renderQueryForm() {
    const box = this.queryBox
    if (!box) return
    const q = this.topic.query
    box.innerHTML = ''
    const sel = h('select', { 'aria-label': 'query' }, ...q.kinds.map(k => h('option', { value: k.id }, this.tk(`query.${k.id}`, k.id))))
    const input = h('input', { type: 'text', inputmode: 'decimal', placeholder: '?', 'aria-label': 'value' })
    const unit = h('span', { class: 'mxHint' })
    const out = h('div', { class: 'mxQueryOut' })
    const syncUnit = () => { unit.textContent = q.kinds.find(k => k.id === sel.value)?.unit ?? '' }
    const run = () => {
      out.innerHTML = ''
      const p = parseNumber(input.value)
      if (!this.motion || !p.ok || p.empty) return
      const res = q.answer(sel.value, p.value, this.motion, this)
      for (const block of res) {
        const card = h('div', { class: 'mxStep' })
        if (block.title) card.append(h('header', { class: 'mxStepHead' }, h('span', { class: 'mxProse mxStepTitle', html: block.title })))
        for (const line of block.lines) {
          if (line.prose) card.append(h('p', { class: 'mxProse', html: line.prose }))
          else card.append(h('div', { class: 'mxEq', 'data-tex': line, 'data-display': '1' }))
        }
        if (Number.isFinite(block.t)) {
          const go = h('button', { class: 'mxEventGo', type: 'button' }, t('common.events.go', 'Go to instant'))
          go.addEventListener('click', () => { this.player.pause(); this.player.seek(block.t) })
          card.append(go)
        }
        out.append(card)
      }
      mathify(out)
    }
    sel.addEventListener('change', () => { syncUnit(); run() })
    input.addEventListener('input', run)
    syncUnit()
    box.append(
      h('h3', { class: 'mxH3' }, t('common.sections.query', 'Query an instant')),
      h('div', { class: 'mxQueryForm' }, sel, input, unit),
      out)
    this.queryRun = run
  }

  // ── Scene ───────────────────────────────────────────────────────────────

  setTime(tt) {
    this.time = tt
    this.plots.forEach(p => p.plot.setCursor(tt))
    this.draw()
  }

  draw() {
    if (!this.canvas || !this.c) return
    const { ctx, w, h: hh } = fitCanvas(this.canvas)
    ctx.clearRect(0, 0, w, hh)
    if (this.motion) this.topic.draw(ctx, w, hh, this.motion, this.time, this.c, this)
  }

  renderLegend() {
    const box = document.getElementById('mxLegend')
    if (!box) return
    box.innerHTML = ''
    for (const item of this.topic.legend?.(this) ?? []) {
      box.append(h('span', { class: 'mxLegendItem' },
        h('span', { class: `mxSwatch${item.dot ? ' mxSwatch--dot' : ''}`, style: `color: ${this.c[item.color] ?? item.color}` }),
        h('span', { html: item.label })))
    }
    renderMath(box)
  }

  retranslate() {
    this.panel.translate()
    this.gCtl?.translate()
    this.fillPresetOptions()
    this.showStatement(this.presetSel.value)
    this.renderConditions()
    this.topic.retranslate?.(this)
    this.renderQueryForm()
    this.update()
  }
}

export { fmt }
