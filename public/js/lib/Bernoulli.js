import PlotBoard from '/js/core/PlotBoard.js'

const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`pd.bernoulli.${key}`, fallback) : fallback

const DEFAULTS = { y: 2, z: 2, x: 1 }
const PRESETS = {
  general: { y: 2, z: 2, x: 1 },
  classic: { y: 1, z: 3, x: 0.8 },      // recovers (1+x)^n >= 1+nx
  counter: { y: 0.5, z: 2, x: 0 },      // Remark 6.1: y < 1 breaks the result
}

const fmt = v => {
  if (!Number.isFinite(v)) return '—'
  const a = Math.abs(v)
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(2)
  return (Math.round(v * 1000) / 1000).toString()
}

class Bernoulli {
  constructor() {
    this.iy = document.getElementById('p10y')
    this.iz = document.getElementById('p10z')
    this.ix = document.getElementById('p10x')
    this.xOut = document.getElementById('p10xValue')
    this.status = document.getElementById('p10Status')
    this.readout = document.getElementById('p10Readout')
    this.viewCtrl = document.getElementById('p10View')
    this.board = null
    this.drawn = []
    this.view = 'inequality'
    this.y = DEFAULTS.y
    this.z = DEFAULTS.z
    this.x = DEFAULTS.x
  }

  // -- The inequality itself -----------------------------
  // (y + x)^z >= y + xz for y, z >= 1 and x >= -y.

  power(x) {
    const base = this.y + x
    // A real exponent is only defined on a non-negative base, which is
    // exactly why the theorem restricts x to [-y, inf).
    return base < 0 ? NaN : Math.pow(base, this.z)
  }

  bound(x) { return this.y + x * this.z }
  gap(x) { return this.power(x) - this.bound(x) }

  // Auxiliary function of the proof: f(t) = t^z - tz, convex on t > 0 with
  // its global minimum at t = 1, where it equals 1 - z.
  aux(tv) { return tv < 0 ? NaN : Math.pow(tv, this.z) - tv * this.z }

  hypotheses() {
    return { y: this.y >= 1, z: this.z >= 1, x: this.x >= -this.y }
  }

  // -- Framing -------------------------------------------
  // The window follows the parameters so the interesting features (the
  // domain edge, the touch point, the growing gap) stay on screen instead
  // of the user having to pan after every change.

  inequalityBox() {
    const left = -this.y - Math.max(0.4, this.y * 0.25)
    const right = Math.max(1.6, this.y * 1.3)
    const top = Math.max(this.power(right), this.bound(right), this.y) * 1.15
    const low = Math.min(0, this.bound(-this.y), this.y * (1 - this.z))
    return [left, top, right, low - Math.max(0.6, Math.abs(low) * 0.15)]
  }

  proofBox() {
    const right = 2.6
    const top = Math.max(this.aux(right), 1) * 1.2
    const low = Math.min(this.y * (1 - this.z), 1 - this.z, 0)
    return [-0.35, top, right, low - Math.max(0.6, Math.abs(low) * 0.2)]
  }

  clear() {
    if (!this.board) return
    this.board.suspendUpdate()
    this.drawn.flat().forEach(o => { try { this.board.removeObject(o) } catch {} })
    this.drawn = []
  }

  drawInequality(c) {
    const [left, , right] = this.inequalityBox()
    const dom = [-this.y, right]
    const curve = PlotBoard.curve(this.board, x => this.power(x), c.primary, dom)
    const line = PlotBoard.curve(this.board, x => this.bound(x), c.secondary, [left, right], { dash: 2 })
    const band = PlotBoard.signedBand(this.board, x => this.power(x), x => this.bound(x),
      -this.y, right, c.primary, c.warn)
    const edge = PlotBoard.vLine(this.board, -this.y, c.muted)
    const touch = PlotBoard.marker(this.board, 0, Math.pow(this.y, this.z), c.text)

    // Vertical segment showing the gap at the sampled x, the quantity the
    // readout reports in numbers.
    const gx = this.x
    const probe = []
    if (Number.isFinite(this.power(gx))) {
      probe.push(this.board.create('segment', [[gx, this.bound(gx)], [gx, this.power(gx)]], {
        strokeColor: c.text, strokeWidth: 2, dash: 1, highlight: false, fixed: true,
      }))
      probe.push(PlotBoard.marker(this.board, gx, this.power(gx), c.text, { size: 2 }))
      probe.push(PlotBoard.marker(this.board, gx, this.bound(gx), c.text, { size: 2 }))
    }

    const obstacles = [x => this.power(x), x => this.bound(x), { x: -this.y }, { x: gx }]
    const labels = [
      PlotBoard.label(this.board, right * 0.45, this.power(right * 0.45),
        `(y+x)^{${fmt(this.z)}}`, c.primary, obstacles),
      PlotBoard.label(this.board, right * 0.6, this.bound(right * 0.6),
        `y+xz`, c.secondary, obstacles),
      PlotBoard.label(this.board, -this.y, 0, `x=-y`, c.muted, obstacles),
    ]
    this.drawn = [curve, line, band, edge, touch, probe, labels]
  }

  drawProof(c) {
    const [, , right] = this.proofBox()
    const curve = PlotBoard.curve(this.board, tv => this.aux(tv), c.primary, [0, right])
    const minLine = PlotBoard.hLine(this.board, 1 - this.z, c.secondary)
    const yLine = PlotBoard.hLine(this.board, this.y * (1 - this.z), c.tertiary)
    // The proof's whole content is that this band never turns negative:
    // f(t) stays above 1 - z, which in turn stays above y(1 - z).
    const band = PlotBoard.signedBand(this.board, tv => this.aux(tv), () => 1 - this.z,
      0, right, c.primary, c.warn)
    const minPt = PlotBoard.marker(this.board, 1, 1 - this.z, c.text)
    const tLine = PlotBoard.vLine(this.board, 1, c.muted, { width: 1 })

    const obstacles = [tv => this.aux(tv), { y: 1 - this.z }, { y: this.y * (1 - this.z) }, { x: 1 }]
    const labels = [
      PlotBoard.label(this.board, right * 0.75, this.aux(right * 0.75), `f(t)=t^z-tz`, c.primary, obstacles),
      PlotBoard.label(this.board, right * 0.2, 1 - this.z, `1-z`, c.secondary, obstacles),
      PlotBoard.label(this.board, 1, this.aux(right) * 0.55, `t=1`, c.muted, obstacles),
      PlotBoard.label(this.board, right * 0.2, this.y * (1 - this.z), `y(1-z)`, c.tertiary, obstacles),
    ]
    this.drawn = [curve, minLine, yLine, band, minPt, tLine, labels]
  }

  syncLegend(c) {
    const card = document.querySelector('.p10FigureCard')
    if (!card) return
    card.dataset.view = this.view
    card.style.setProperty('--p10-curve', c.primary)
    card.style.setProperty('--p10-bound', c.secondary)
    card.style.setProperty('--p10-aux', c.tertiary)
    card.style.setProperty('--p10-warn', c.warn)
  }

  render() {
    const c = PlotBoard.palette()
    const box = this.view === 'proof' ? this.proofBox() : this.inequalityBox()
    if (!this.board) {
      this.board = PlotBoard.create('p10PlotContainer', box)
    } else {
      this.clear()
      // The second argument is keepAspectRatio, and it must stay false: the
      // vertical range is computed from the parameters, and letting the board
      // force a square scale collapses it to whatever the x range implies.
      this.board.setBoundingBox(box, false)
    }
    this.board.suspendUpdate()
    if (this.view === 'proof') this.drawProof(c)
    else this.drawInequality(c)
    this.board.unsuspendUpdate()
    this.syncLegend(c)
    this.updateReadout()
  }

  // -- Readout -------------------------------------------

  updateReadout() {
    const h = this.hypotheses()
    const ok = h.y && h.z
    if (this.status) {
      this.status.classList.toggle('is-ok', ok)
      this.status.classList.toggle('is-warn', !ok)
      this.status.textContent = ok
        ? t('hypOk', 'Hypotheses hold: the inequality is guaranteed.')
        : t('hypFail', 'Hypotheses violated: y ≥ 1 and z ≥ 1 are required, so the inequality may fail.')
    }
    if (!this.readout) return
    const gap = this.gap(this.x)
    const holds = !(gap < -1e-12)
    const rows = [
      { tex: '(y+x)^z', value: this.power(this.x) },
      { tex: 'y+xz', value: this.bound(this.x) },
      { text: t('gapLabel', 'difference'), value: gap, strong: true },
    ]
    const cells = rows.map(r => {
      const key = r.tex ? `\\(${r.tex}\\)` : r.text
      return `<div class="p10Row${r.strong ? ' is-strong' : ''}">` +
             `<span class="p10Key">${key}</span><span class="p10Val">${fmt(r.value)}</span></div>`
    }).join('')
    const verdict = holds
      ? t('verdictHolds', 'Difference ≥ 0: the inequality holds here.')
      : t('verdictFails', 'Difference &lt; 0: the inequality fails here.')
    this.readout.innerHTML = cells + `<p class="p10Verdict ${holds ? 'is-ok' : 'is-warn'}">${verdict}</p>`
    if (window.renderMathInElement) window.renderMathInElement(this.readout)
  }

  // -- Wiring --------------------------------------------

  syncSlider() {
    if (!this.ix) return
    const [left, , right] = this.inequalityBox()
    this.ix.min = String(Math.round(-this.y * 100) / 100)
    this.ix.max = String(Math.round(right * 100) / 100)
    this.ix.step = '0.01'
    if (this.x < -this.y) this.x = -this.y
    if (this.x > right) this.x = right
    this.ix.value = String(this.x)
    if (this.xOut) this.xOut.textContent = fmt(this.x)
  }

  readInputs() {
    const y = parseFloat(this.iy?.value)
    const z = parseFloat(this.iz?.value)
    if (Number.isFinite(y) && y > 0) this.y = y
    if (Number.isFinite(z) && z > 0) this.z = z
  }

  apply(preset) {
    Object.assign(this, preset)
    if (this.iy) this.iy.value = String(this.y)
    if (this.iz) this.iz.value = String(this.z)
    this.syncSlider()
    this.render()
  }

  setView(view) {
    this.view = view
    this.viewCtrl?.querySelectorAll('[data-view]').forEach(b => {
      const active = b.dataset.view === view
      b.classList.toggle('is-active', active)
      b.setAttribute('aria-pressed', String(active))
    })
    this.render()
  }

  main() {
    if (!document.getElementById('p10PlotContainer')) return
    this.iy?.addEventListener('input', () => { this.readInputs(); this.syncSlider(); this.render() })
    this.iz?.addEventListener('input', () => { this.readInputs(); this.syncSlider(); this.render() })
    this.ix?.addEventListener('input', () => {
      const v = parseFloat(this.ix.value)
      if (Number.isFinite(v)) this.x = v
      if (this.xOut) this.xOut.textContent = fmt(this.x)
      this.render()
    })
    this.viewCtrl?.addEventListener('click', e => {
      const btn = e.target.closest('[data-view]')
      if (btn) this.setView(btn.dataset.view)
    })
    document.querySelectorAll('[data-preset]').forEach(b => {
      b.addEventListener('click', () => {
        const p = PRESETS[b.dataset.preset]
        if (p) this.apply({ ...p })
      })
    })
    // Curve labels and the readout are localized, so a language switch has
    // to redraw rather than leave stale text on the board.
    window.addEventListener('langchanged', () => this.render())

    this.apply({ ...DEFAULTS })
    this.setView('inequality')
  }
}

export default Bernoulli
