// The classification diagram of figure 5.2.8: the (Delta, tau) plane split by
// the parabola tau^2 - 4*Delta = 0 and by the axes, with a marker on the region
// the current matrix falls into.

const cssVar = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

const resolveColor = (expr) => {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;visibility:hidden;color:${expr}`
  document.body.appendChild(probe)
  const rgb = getComputedStyle(probe).color
  probe.remove()
  return rgb
}

const withAlpha = (rgb, alpha) => {
  const m = rgb.match(/-?[\d.]+/g)
  if (!m || m.length < 3) return rgb
  return `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${alpha})`
}

const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`pd.linearSystems.${key}`, fallback) : fallback

class LSDiagram {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.det = 0
    this.tau = 0
    this.readPalette()
    this.observer = new MutationObserver(() => { this.readPalette(); this.draw() })
    this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme'] })
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    window.addEventListener('langchanged', () => this.draw())
    this.resize()
  }

  readPalette() {
    const primary = cssVar('--color-primary', '#008888')
    this.c = {
      primary: resolveColor(primary),
      text: resolveColor(cssVar('--color-text', '#000000')),
      bg: resolveColor(cssVar('--color-bg', '#ffffff')),
      muted: resolveColor(cssVar('--color-muted', '#888888')),
      out: resolveColor(`oklch(from ${primary} l c calc(h + 140))`),
      third: resolveColor(`oklch(from ${primary} l c calc(h - 130))`),
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = this.canvas.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    if (w === this.w && h === this.h && dpr === this.dpr) return
    this.w = w; this.h = h; this.dpr = dpr
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.draw()
  }

  set(det, tau) {
    this.det = det
    this.tau = tau
    this.draw()
  }

  destroy() {
    this.observer?.disconnect()
    this.resizeObserver?.disconnect()
  }

  get range() {
    const m = Math.max(Math.abs(this.det) || 0, Math.abs(this.tau) || 0)
    return Math.min(Math.max(2.5, m * 1.4), 60)
  }

  px(d) { return this.pad + (d + this.range) / (2 * this.range) * (this.w - 2 * this.pad) }
  py(v) { return this.pad + (this.range - v) / (2 * this.range) * (this.h - 2 * this.pad) }

  draw() {
    if (!this.w || !this.h) return
    const ctx = this.ctx
    const R = this.range
    this.pad = 14
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.w, this.h)

    const X = d => this.px(d), Y = v => this.py(v)
    const steps = 80

    // Inside the parabola (tau^2 < 4*Delta): spirals and centers.
    const insidePath = (from, to) => {
      ctx.beginPath()
      for (let i = 0; i <= steps; i++) {
        const v = from + (to - from) * (i / steps)
        const d = (v * v) / 4
        if (d > R) continue
        ctx[i === 0 ? 'moveTo' : 'lineTo'](X(d), Y(v))
      }
      for (let i = steps; i >= 0; i--) {
        const v = from + (to - from) * (i / steps)
        if ((v * v) / 4 > R) continue
        ctx.lineTo(X(R), Y(v))
      }
      ctx.closePath()
    }

    // Between the tau axis and the parabola (tau^2 > 4*Delta, Delta > 0): nodes.
    const outsidePath = (from, to) => {
      ctx.beginPath()
      ctx.moveTo(X(0), Y(from))
      for (let i = 0; i <= steps; i++) {
        const v = from + (to - from) * (i / steps)
        ctx.lineTo(X(Math.min((v * v) / 4, R)), Y(v))
      }
      ctx.lineTo(X(0), Y(to))
      ctx.closePath()
    }

    // Saddles fill the whole Delta < 0 half plane.
    ctx.fillStyle = withAlpha(this.c.third, 0.13)
    ctx.fillRect(X(-R), Y(R), X(0) - X(-R), Y(-R) - Y(R))

    ctx.fillStyle = withAlpha(this.c.out, 0.22); outsidePath(0, R); ctx.fill()
    ctx.fillStyle = withAlpha(this.c.primary, 0.22); outsidePath(-R, 0); ctx.fill()
    ctx.fillStyle = withAlpha(this.c.out, 0.1); insidePath(0, R); ctx.fill()
    ctx.fillStyle = withAlpha(this.c.primary, 0.1); insidePath(-R, 0); ctx.fill()

    // Axes.
    ctx.strokeStyle = withAlpha(this.c.muted, 0.8)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(X(-R), Math.round(Y(0)) + 0.5); ctx.lineTo(X(R), Math.round(Y(0)) + 0.5)
    ctx.moveTo(Math.round(X(0)) + 0.5, Y(R)); ctx.lineTo(Math.round(X(0)) + 0.5, Y(-R))
    ctx.stroke()

    // Centers live on the positive Delta axis; non-isolated fixed points on the
    // tau axis. Both are borderline cases, so they get their own stroke.
    ctx.strokeStyle = this.c.third
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(R), Y(0))
    ctx.stroke()

    // The parabola itself: stars and degenerate nodes.
    ctx.strokeStyle = withAlpha(this.c.text, 0.75)
    ctx.lineWidth = 1.6
    ctx.beginPath()
    let started = false
    for (let i = 0; i <= 200; i++) {
      const v = -R + (2 * R) * (i / 200)
      const d = (v * v) / 4
      if (d > R) { started = false; continue }
      ctx[started ? 'lineTo' : 'moveTo'](X(d), Y(v))
      started = true
    }
    ctx.stroke()

    this.drawLabels(ctx, X, Y, R)
    this.drawMarker(ctx, X, Y, R)
  }

  drawLabels(ctx, X, Y, R) {
    ctx.save()
    const fs = Math.max(8, Math.min(11, this.w / 34))
    ctx.font = `${fs}px ${cssVar('--font-ui', 'sans-serif')}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const put = (text, d, v, color) => {
      ctx.fillStyle = color
      ctx.fillText(text, X(d), Y(v))
    }
    put(t('regionSaddle', 'saddles'), -R * 0.5, R * 0.55, withAlpha(this.c.text, 0.75))
    put(t('regionUnstableNode', 'unstable nodes'), R * 0.22, R * 0.82, withAlpha(this.c.text, 0.75))
    put(t('regionUnstableSpiral', 'unstable spirals'), R * 0.62, R * 0.45, withAlpha(this.c.text, 0.75))
    put(t('regionCenter', 'centers'), R * 0.6, R * 0.09, this.c.third)
    put(t('regionStableSpiral', 'stable spirals'), R * 0.62, -R * 0.45, withAlpha(this.c.text, 0.75))
    put(t('regionStableNode', 'stable nodes'), R * 0.22, -R * 0.82, withAlpha(this.c.text, 0.75))

    ctx.font = `italic ${fs + 1}px ${cssVar('--font-label', 'serif')}`
    ctx.fillStyle = this.c.muted
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'
    ctx.fillText('Δ', this.w - 3, Y(0) - 3)
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText('τ', X(0) + 4, 2)
    ctx.restore()
  }

  drawMarker(ctx, X, Y, R) {
    if (!Number.isFinite(this.det) || !Number.isFinite(this.tau)) return
    const d = Math.min(Math.max(this.det, -R), R)
    const v = Math.min(Math.max(this.tau, -R), R)
    const x = X(d), y = Y(v)
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, 6.5, 0, Math.PI * 2)
    ctx.strokeStyle = this.c.text
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y, 3.2, 0, Math.PI * 2)
    ctx.fillStyle = this.c.text
    ctx.fill()
    ctx.restore()
  }
}

export default LSDiagram
