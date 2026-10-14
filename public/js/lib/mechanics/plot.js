// Function graphs for the Física Mecánica pages: x(t), v(t), a(t) and friends.
// A plot holds a set of series, an optional shaded area (the displacement under
// v(t)), straight helper lines (secants and tangents), labelled marks and a time
// cursor that follows the animation.

import { fitCanvas, fmt, LABEL_FONT, UI_FONT } from './core.js'

const SAMPLES = 480

function niceStep(span, target = 5) {
  const raw = span / target
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  const nice = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10
  return nice * mag
}

export class Plot {
  constructor(canvas, palette) {
    this.canvas = canvas
    this.c = palette
    this.cfg = { t0: 0, t1: 1, series: [], areas: [], lines: [], marks: [], xLabel: 't', yLabel: '', yUnit: '', xUnit: 's' }
    this.cursor = null
    this.ro = new ResizeObserver(() => this.draw())
    this.ro.observe(canvas)
  }

  setPalette(p) {
    this.c = p
    this.draw()
  }

  set(cfg) {
    this.cfg = { ...this.cfg, areas: [], lines: [], marks: [], ...cfg }
    this.computeRange()
    this.draw()
  }

  setCursor(t) {
    this.cursor = t
    this.draw()
  }

  computeRange() {
    const { t0, t1, series, marks, lines, fixedY } = this.cfg
    if (fixedY) { [this.y0, this.y1] = fixedY; return }
    let lo = Infinity
    let hi = -Infinity
    for (const s of series) {
      for (let i = 0; i <= SAMPLES; i++) {
        const tt = t0 + (t1 - t0) * i / SAMPLES
        const y = s.fn(tt)
        if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y) }
      }
    }
    for (const m of marks) if (Number.isFinite(m.y)) { lo = Math.min(lo, m.y); hi = Math.max(hi, m.y) }
    for (const l of lines) if (l.keepInRange) { lo = Math.min(lo, l.y1, l.y2); hi = Math.max(hi, l.y1, l.y2) }
    if (!Number.isFinite(lo)) { lo = -1; hi = 1 }
    lo = Math.min(lo, 0)
    hi = Math.max(hi, 0)
    if (hi - lo < 1e-9) { hi += 1; lo -= 1 }
    const pad = (hi - lo) * 0.12
    this.y0 = lo - (lo < 0 ? pad : 0)
    this.y1 = hi + (hi > 0 ? pad : 0)
    if (this.y0 === 0 && this.y1 > 0) this.y0 = -0.02 * this.y1
    if (this.y1 === 0 && this.y0 < 0) this.y1 = -0.02 * this.y0
  }

  draw() {
    if (!this.c) return
    const { ctx, w, h } = fitCanvas(this.canvas)
    const c = this.c
    const { t0, t1, series, areas, lines, marks, xLabel, yLabel } = this.cfg
    ctx.clearRect(0, 0, w, h)

    const L = 46
    const R = 12
    const T = 22
    const B = 30
    const pw = Math.max(10, w - L - R)
    const ph = Math.max(10, h - T - B)
    const X = tt => L + (tt - t0) / (t1 - t0 || 1) * pw
    const Y = y => T + (this.y1 - y) / (this.y1 - this.y0 || 1) * ph
    this.map = { X, Y, L, T, pw, ph }

    // Grid and ticks
    ctx.font = `11px ${UI_FONT}`
    ctx.lineWidth = 1
    const xs = niceStep(t1 - t0, Math.max(3, Math.floor(pw / 70)))
    const ys = niceStep(this.y1 - this.y0, Math.max(3, Math.floor(ph / 38)))
    ctx.strokeStyle = c.grid
    ctx.fillStyle = c.muted
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let v = Math.ceil(t0 / xs) * xs; v <= t1 + 1e-9; v += xs) {
      const px = X(v)
      ctx.beginPath(); ctx.moveTo(px, T); ctx.lineTo(px, T + ph); ctx.stroke()
      ctx.fillText(fmt(v, 3), px, T + ph + 5)
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let v = Math.ceil(this.y0 / ys) * ys; v <= this.y1 + 1e-9; v += ys) {
      const py = Y(v)
      ctx.beginPath(); ctx.moveTo(L, py); ctx.lineTo(L + pw, py); ctx.stroke()
      ctx.fillText(fmt(Math.abs(v) < ys * 1e-6 ? 0 : v, 3), L - 6, py)
    }

    // Axes (y = 0 line and t = t0 line)
    ctx.strokeStyle = c.muted
    ctx.lineWidth = 1.2
    const zy = Y(0)
    if (zy >= T && zy <= T + ph) { ctx.beginPath(); ctx.moveTo(L, zy); ctx.lineTo(L + pw, zy); ctx.stroke() }
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.stroke()

    ctx.save()
    ctx.beginPath()
    ctx.rect(L, T - 2, pw, ph + 4)
    ctx.clip()

    // Shaded areas: positive and negative parts in different tints.
    for (const a of areas) {
      const from = Math.max(t0, a.from ?? t0)
      const to = Math.min(t1, a.to ?? t1)
      if (to <= from) continue
      for (const sign of [1, -1]) {
        ctx.beginPath()
        ctx.moveTo(X(from), Y(0))
        const n = 200
        for (let i = 0; i <= n; i++) {
          const tt = from + (to - from) * i / n
          const y = a.fn(tt)
          const v = sign > 0 ? Math.max(0, y) : Math.min(0, y)
          ctx.lineTo(X(tt), Y(Number.isFinite(v) ? v : 0))
        }
        ctx.lineTo(X(to), Y(0))
        ctx.closePath()
        ctx.fillStyle = sign > 0 ? (a.pos ?? c.soft) : (a.neg ?? a.pos ?? c.soft)
        ctx.globalAlpha = sign > 0 ? 1 : 0.75
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    for (const l of lines) {
      ctx.strokeStyle = c[l.color] ?? l.color ?? c.muted
      ctx.lineWidth = l.width ?? 1.4
      ctx.setLineDash(l.dash ?? [5, 4])
      ctx.beginPath()
      ctx.moveTo(X(l.x1), Y(l.y1))
      ctx.lineTo(X(l.x2), Y(l.y2))
      ctx.stroke()
      ctx.setLineDash([])
    }

    for (const s of series) {
      ctx.strokeStyle = c[s.color] ?? s.color ?? c.primary
      ctx.lineWidth = s.width ?? 2.2
      ctx.setLineDash(s.dash ?? [])
      ctx.beginPath()
      let pen = false
      let lastY = null
      for (let i = 0; i <= SAMPLES; i++) {
        const tt = t0 + (t1 - t0) * i / SAMPLES
        const y = s.fn(tt)
        if (!Number.isFinite(y)) { pen = false; continue }
        const py = Y(y)
        // A jump (a velocity step at a phase change) is drawn as a gap.
        if (pen && s.jumps && lastY !== null && Math.abs(py - lastY) > ph * 0.25) pen = false
        if (!pen) { ctx.moveTo(X(tt), py); pen = true } else ctx.lineTo(X(tt), py)
        lastY = py
      }
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.restore()

    for (const m of marks) {
      if (!Number.isFinite(m.t) || !Number.isFinite(m.y) || m.t < t0 - 1e-9 || m.t > t1 + 1e-9) continue
      const px = X(m.t)
      const py = Y(m.y)
      ctx.fillStyle = c[m.color] ?? c.third
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill()
      if (m.label) {
        ctx.font = `12px ${LABEL_FONT}`
        ctx.fillStyle = c.text
        ctx.textAlign = px > L + pw * 0.75 ? 'right' : 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText(m.label, px + (ctx.textAlign === 'left' ? 6 : -6), py - 4)
      }
    }

    if (this.cursor !== null && this.cursor >= t0 && this.cursor <= t1) {
      const px = X(this.cursor)
      ctx.strokeStyle = c.text
      ctx.globalAlpha = 0.35
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(px, T); ctx.lineTo(px, T + ph); ctx.stroke()
      ctx.globalAlpha = 1
      for (const s of series) {
        if (s.noCursor) continue
        const y = s.fn(this.cursor)
        if (!Number.isFinite(y)) continue
        ctx.fillStyle = c[s.color] ?? s.color ?? c.primary
        ctx.beginPath(); ctx.arc(px, Y(y), 4.5, 0, Math.PI * 2); ctx.fill()
      }
      const s0 = series.find(s => !s.noCursor)
      if (s0) {
        const y = s0.fn(this.cursor)
        if (Number.isFinite(y)) {
          ctx.font = `11px ${UI_FONT}`
          ctx.fillStyle = c.text
          ctx.textAlign = px > L + pw * 0.7 ? 'right' : 'left'
          ctx.textBaseline = 'top'
          ctx.fillText(`${fmt(y, 3)} ${this.cfg.yUnit}`, px + (ctx.textAlign === 'left' ? 6 : -6), T + 2)
        }
      }
    }

    // Axis labels
    ctx.font = `italic 13px ${LABEL_FONT}`
    ctx.fillStyle = c.text
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(yLabel, 6, 3)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(xLabel, w - 4, h - 2)
  }

  // Time under the pointer, for scrubbing.
  timeAt(clientX) {
    if (!this.map) return null
    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const { L, pw } = this.map
    const { t0, t1 } = this.cfg
    return Math.max(t0, Math.min(t1, t0 + (x - L) / pw * (t1 - t0)))
  }
}
