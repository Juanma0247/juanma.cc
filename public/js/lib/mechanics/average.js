// Average velocity and average speed over several stretches travelled at
// constant speed (the cyclist of the course workshop, Serway 2.3). Each
// stretch is given by its velocity and either its duration or its length; the
// module adds displacements, distances and times and prints both averages.

import { t, fill, h, texNum, fmt, parseNumber, debounce, renderMath, onLangChange } from './core.js'
import { mathify } from './steps.js'

const PRESETS = [
  { id: 'cyclistLength', unit: 'km', tunit: 'h', stretches: [{ v: 5, by: 'd', d: 1 }, { v: 20, by: 'd', d: 1 }] },
  { id: 'cyclistTime', unit: 'km', tunit: 'h', stretches: [{ v: 5, by: 't', t: 1 }, { v: 20, by: 't', t: 1 }] },
  { id: 'cyclistDouble', unit: 'km', tunit: 'h', stretches: [{ v: 5, by: 't', t: 2 }, { v: 20, by: 't', t: 1 }] },
  { id: 'walkBack', unit: 'm', tunit: 's', stretches: [{ v: 5, by: 'd', d: 100 }, { v: -3, by: 'd', d: 100 }] },
  { id: 'gas', unit: 'mi', tunit: 'h', stretches: [{ v: 43, by: 'd', d: 5.2 }, { v: 1.2 / (27 / 60), by: 'd', d: 1.2 }] },
]

export class AverageModule {
  constructor(root, { key }) {
    if (!root) return
    this.root = root
    this.key = key
    this.stretches = []
    this.build()
    onLangChange(() => { this.fill(); this.renderEditor(); this.update() })
    this.load(PRESETS[0].id)
  }

  tk(k, f) {
    return k.startsWith('presets.') ? t(`${this.key}.average.${k}`, f) : t(`common.average.${k}`, f)
  }

  build() {
    this.presetSel = h('select', { class: 'mxPresetSel', 'aria-label': 'preset' })
    this.statement = h('div', { class: 'mxStatement', hidden: true })
    this.editor = h('div', { class: 'mxBlock' })
    this.out = h('div', { class: 'mxSolution' })
    this.root.append(h('div', { class: 'mxModuleGrid' },
      this.out,
      h('aside', { class: 'mxPanel' },
        h('div', { class: 'mxBlock' }, h('h3', { class: 'mxH3', 'data-k': 'presetsTitle' }), this.presetSel, this.statement),
        this.editor)))
    this.presetSel.addEventListener('change', () => this.load(this.presetSel.value))
    this.fill()
  }

  fill() {
    const cur = this.presetSel.value
    this.presetSel.innerHTML = ''
    this.presetSel.append(h('option', { value: '' }, t('common.panel.custom', 'Your own problem')))
    for (const p of PRESETS) this.presetSel.append(h('option', { value: p.id }, this.tk(`presets.${p.id}.title`, p.id)))
    this.presetSel.value = cur
    this.root.querySelectorAll('[data-k]').forEach(el => { el.textContent = this.tk(el.dataset.k, el.dataset.k) })
    if (cur) this.showStatement(cur)
  }

  showStatement(id) {
    this.statement.innerHTML = `<p>${this.tk(`presets.${id}.text`, '')}</p>`
    renderMath(this.statement)
    this.statement.hidden = false
  }

  load(id) {
    const p = PRESETS.find(x => x.id === id)
    if (!p) { this.statement.hidden = true; return }
    this.presetSel.value = id
    this.showStatement(id)
    this.unit = p.unit
    this.tunit = p.tunit
    this.stretches = p.stretches.map(s => ({ ...s }))
    this.renderEditor()
    this.update()
  }

  renderEditor() {
    const fire = debounce(() => this.update(), 160)
    const field = (label, value, set) => {
      const inp = h('input', { class: 'mxIn', type: 'text', inputmode: 'decimal', value: Number.isFinite(value) ? fmt(value, 6) : '' })
      inp.addEventListener('input', () => { const p = parseNumber(inp.value); set(p.ok && !p.empty ? p.value : null); fire() })
      return h('label', { class: 'mxSmallField' }, h('span', { html: label }), inp)
    }
    const unitField = (label, value, set) => {
      const inp = h('input', { class: 'mxIn', type: 'text', value })
      inp.addEventListener('input', () => { set(inp.value.trim()); fire() })
      return h('label', { class: 'mxSmallField' }, h('span', {}, label), inp)
    }
    this.editor.innerHTML = ''
    this.editor.append(
      h('h3', { class: 'mxH3' }, this.tk('unitsTitle', 'Units')),
      h('div', { class: 'mxBodyGrid' },
        unitField(this.tk('lengthUnit', 'length'), this.unit, v => { this.unit = v }),
        unitField(this.tk('timeUnit', 'time'), this.tunit, v => { this.tunit = v })),
      h('h3', { class: 'mxH3', style: 'margin-top:.4rem' }, this.tk('stretchesTitle', 'Stretches')),
      h('p', { class: 'mxHint', html: this.tk('hint', 'A negative velocity means going back. Each stretch is fixed by its duration or by its length.') }))
    const list = h('div', { class: 'mxPhaseList' })
    this.stretches.forEach((s, i) => {
      const by = h('select', { class: 'mxUnit', 'aria-label': 'by' },
        h('option', { value: 'd', selected: s.by === 'd' }, this.tk('byLength', 'length')),
        h('option', { value: 't', selected: s.by === 't' }, this.tk('byTime', 'duration')))
      by.addEventListener('change', () => { s.by = by.value; this.renderEditor(); this.update() })
      const del = h('button', { class: 'mxPhaseDel', type: 'button', disabled: this.stretches.length < 2 }, '×')
      del.addEventListener('click', () => { this.stretches.splice(i, 1); this.renderEditor(); this.update() })
      list.append(h('div', { class: 'mxPhase', style: 'grid-template-columns: 1.4rem minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 1.8rem' },
        h('span', { class: 'mxPhaseNum' }, String(i + 1)),
        field(`v (${this.unit}/${this.tunit})`, s.v, v => { s.v = v }),
        h('label', { class: 'mxSmallField' }, h('span', {}, this.tk('given', 'given')), by),
        s.by === 'd' ? field(`d (${this.unit})`, s.d, v => { s.d = v }) : field(`Δt (${this.tunit})`, s.t, v => { s.t = v }),
        del))
    })
    const add = h('button', { class: 'mxMiniBtn', type: 'button' }, `+ ${this.tk('add', 'Add stretch')}`)
    add.addEventListener('click', () => { this.stretches.push({ v: 1, by: 't', t: 1 }); this.renderEditor(); this.update() })
    this.editor.append(list, add)
  }

  update() {
    const out = this.out
    out.innerHTML = ''
    const L = this.unit
    const T = this.tunit
    const rows = []
    let ok = true
    for (const s of this.stretches) {
      if (!Number.isFinite(s.v) || Math.abs(s.v) < 1e-12) { ok = false; break }
      if (s.by === 'd') {
        if (!Number.isFinite(s.d) || s.d <= 0) { ok = false; break }
        rows.push({ v: s.v, d: s.d, t: s.d / Math.abs(s.v), dx: Math.sign(s.v) * s.d, by: 'd' })
      } else {
        if (!Number.isFinite(s.t) || s.t <= 0) { ok = false; break }
        rows.push({ v: s.v, d: Math.abs(s.v) * s.t, t: s.t, dx: s.v * s.t, by: 't' })
      }
    }
    if (!ok || !rows.length) {
      out.append(h('p', { class: 'mxEmpty' }, this.tk('incomplete', 'Every stretch needs a non-zero velocity and a positive length or duration.')))
      return
    }
    const card = (title, ...lines) => {
      const c = h('article', { class: 'mxStep' }, h('header', { class: 'mxStepHead' }, h('span', { class: 'mxProse mxStepTitle', html: title })))
      for (const l of lines) {
        if (typeof l === 'object') c.append(h('p', { class: 'mxProse', html: l.prose }))
        else c.append(h('div', { class: 'mxEq', 'data-tex': l, 'data-display': '1' }))
      }
      out.append(c)
    }
    const u = s => `\\text{${s}}`
    card(this.tk('timesTitle', 'Time of each stretch'),
      { prose: this.tk('timesText', 'In uniform motion d = |v| Δt, so a stretch given by its length lasts Δt = d / |v| and one given by its duration covers d = |v| Δt.') },
      ...rows.map((r, i) => r.by === 'd'
        ? `\\Delta t_{${i + 1}} = \\frac{d_{${i + 1}}}{|v_{${i + 1}}|} = \\frac{${texNum(r.d)}\\,${u(L)}}{${texNum(Math.abs(r.v))}\\,${u(L + '/' + T)}} = ${texNum(r.t)}\\,${u(T)}`
        : `d_{${i + 1}} = |v_{${i + 1}}|\\,\\Delta t_{${i + 1}} = (${texNum(Math.abs(r.v))}\\,${u(L + '/' + T)})(${texNum(r.t)}\\,${u(T)}) = ${texNum(r.d)}\\,${u(L)}`))
    const tt = rows.reduce((a, r) => a + r.t, 0)
    const dd = rows.reduce((a, r) => a + r.d, 0)
    const dx = rows.reduce((a, r) => a + r.dx, 0)
    card(this.tk('avgTitle', 'Average velocity and average speed'),
      { prose: this.tk('avgText', 'The average velocity is the total displacement over the total time; the average speed, the total distance over the total time. Neither is the plain mean of the velocities unless every stretch lasts the same time.') },
      `\\bar v = \\frac{\\Delta x_{\\text{total}}}{\\Delta t_{\\text{total}}} = \\frac{${rows.map(r => texNum(r.dx)).join(' + ').replace(/\+ -/g, '- ')}}{${rows.map(r => texNum(r.t)).join(' + ')}} = \\frac{${texNum(dx)}}{${texNum(tt)}} = ${texNum(dx / tt)}\\,${u(L + '/' + T)}`,
      `\\bar{v}_{\\text{rapidez}} = \\frac{d_{\\text{total}}}{\\Delta t_{\\text{total}}} = \\frac{${texNum(dd)}}{${texNum(tt)}} = ${texNum(dd / tt)}\\,${u(L + '/' + T)}`,
      { prose: fill(this.tk('meanCompare', 'For comparison, the plain mean of the speeds is {m}.'), { m: `\\(${texNum(rows.reduce((a, r) => a + Math.abs(r.v), 0) / rows.length)}\\,${u(L + '/' + T)}\\)` }) })
    const allD = rows.every(r => r.by === 'd') && rows.every(r => Math.abs(r.d - rows[0].d) < 1e-9)
    const allT = rows.every(r => r.by === 't') && rows.every(r => Math.abs(r.t - rows[0].t) < 1e-9)
    if (allD && rows.every(r => r.v > 0)) {
      card(this.tk('harmonicTitle', 'Equal lengths: the harmonic mean'),
        { prose: this.tk('harmonicText', 'If every stretch has the same length L, the L cancels and the average speed is the harmonic mean of the speeds; the result does not depend on L.') },
        `\\bar v = \\frac{nL}{\\sum L/v_i} = \\frac{n}{\\sum 1/v_i} = \\frac{${rows.length}}{${rows.map(r => `\\frac{1}{${texNum(r.v)}}`).join(' + ')}} = ${texNum(rows.length / rows.reduce((a, r) => a + 1 / r.v, 0))}\\,${u(L + '/' + T)}`)
    }
    if (allT) {
      card(this.tk('arithTitle', 'Equal times: the arithmetic mean'),
        { prose: this.tk('arithText', 'If every stretch lasts the same time, the average velocity is just the arithmetic mean of the velocities.') },
        `\\bar v = \\frac{\\sum v_i T}{nT} = \\frac{${rows.map(r => texNum(r.v)).join(' + ')}}{${rows.length}} = ${texNum(rows.reduce((a, r) => a + r.v, 0) / rows.length)}\\,${u(L + '/' + T)}`)
    }
    mathify(out)
  }
}
