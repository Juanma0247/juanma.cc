// Animated phase portrait for x' = A x on a 2D canvas.
//
// Three layers are drawn: the vector field, a set of evenly spaced streamlines
// (Jobard & Lefebvre seeding, so the curves never bunch up or leave holes), and
// a cloud of particles advected by the real flow, which is what makes the
// portrait move. The straight-line eigensolutions of section 5.2 are overlaid on
// top, with arrows pointing the way the flow runs along them.

const TRAIL = 10
const PARTICLE_TARGET = 340

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

const NICE_STEPS = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]

class LSPortrait {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.bg = document.createElement('canvas')
    this.bgCtx = this.bg.getContext('2d')

    this.A = [0, 1, -1, 0]
    this.range = 4
    this.center = [0, 0]
    this.rate = 1
    this.speed = 1
    this.opts = { grid: true, field: true, streams: true, particles: true, eigen: true, nullclines: false }
    this.lines = []
    this.streams = []
    this.orbits = []
    this.particles = []
    this.dirty = true
    this.running = false
    this.last = 0
    this.w = 0
    this.h = 0

    this.readPalette()
    this.watchPalette()
    this.observeResize()
    this.bindPointer()
  }

  // ── Palette ──────────────────────────────────────────────────────────────

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

  watchPalette() {
    const refresh = () => { this.readPalette(); this.invalidate() }
    this.paletteObserver = new MutationObserver(refresh)
    this.paletteObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-theme'],
    })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh)
  }

  // ── Sizing ───────────────────────────────────────────────────────────────

  observeResize() {
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this.canvas)
    this.resize()
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = this.canvas.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    if (w === this.w && h === this.h && dpr === this.dpr) return
    this.w = w; this.h = h; this.dpr = dpr
    for (const cv of [this.canvas, this.bg]) {
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
    }
    // The display size stays under CSS control (width/height 100%); only the
    // backing store is resized here, or the canvas would pin itself to whatever
    // width it first measured and never shrink again.
    this.invalidate()
    this.seedParticles()
    if (!this.running) this.draw(0)
  }

  // ── Coordinates ──────────────────────────────────────────────────────────

  get scale() { return Math.min(this.w, this.h) / (2 * this.range) }

  sx(x) { return this.w / 2 + (x - this.center[0]) * this.scale }
  sy(y) { return this.h / 2 - (y - this.center[1]) * this.scale }
  wx(px) { return this.center[0] + (px - this.w / 2) / this.scale }
  wy(py) { return this.center[1] - (py - this.h / 2) / this.scale }

  get box() {
    const rx = (this.w / 2) / this.scale, ry = (this.h / 2) / this.scale
    const m = 1.15
    return {
      x0: this.center[0] - rx * m, x1: this.center[0] + rx * m,
      y0: this.center[1] - ry * m, y1: this.center[1] + ry * m,
      rx, ry,
    }
  }

  // ── Flow ─────────────────────────────────────────────────────────────────

  velocity(x, y) {
    const [a, b, c, d] = this.A
    return [a * x + b * y, c * x + d * y]
  }

  unitVel(x, y) {
    const [u, v] = this.velocity(x, y)
    const m = Math.hypot(u, v)
    if (!Number.isFinite(m) || m < this.range * 1e-7) return null
    return [u / m, v / m]
  }

  // Arclength-parameterized RK4: every step advances the same distance, so the
  // streamline spacing stays uniform no matter how fast the flow is locally.
  stepUnit(x, y, h) {
    const k1 = this.unitVel(x, y); if (!k1) return null
    const k2 = this.unitVel(x + h / 2 * k1[0], y + h / 2 * k1[1]); if (!k2) return null
    const k3 = this.unitVel(x + h / 2 * k2[0], y + h / 2 * k2[1]); if (!k3) return null
    const k4 = this.unitVel(x + h * k3[0], y + h * k3[1]); if (!k4) return null
    return [
      x + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      y + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ]
  }

  stepFlow(x, y, dt) {
    const f = (px, py) => this.velocity(px, py)
    const k1 = f(x, y)
    const k2 = f(x + dt / 2 * k1[0], y + dt / 2 * k1[1])
    const k3 = f(x + dt / 2 * k2[0], y + dt / 2 * k2[1])
    const k4 = f(x + dt * k3[0], y + dt * k3[1])
    return [
      x + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      y + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ]
  }

  // ── Public API ───────────────────────────────────────────────────────────

  setMatrix(A, info) {
    this.A = A.slice()
    this.info = info
    this.lines = info?.lines ?? []
    const [a, b, c, d] = A
    let rate
    if (info?.eigenType === 'complex') rate = Math.hypot(info.alpha, info.omega)
    else if (info?.ok) rate = Math.max(Math.abs(info.l1 ?? 0), Math.abs(info.l2 ?? 0))
    else rate = Math.hypot(a, b, c, d) / 2
    this.rate = Math.min(Math.max(rate || 1, 0.05), 500)
    this.retraceOrbits()
    this.invalidate()
    this.seedParticles()
  }

  // Trajectories the reader dropped keep their seed point and are redrawn for
  // the new matrix, so dragging a parameter shows how that particular orbit
  // deforms instead of making it disappear.
  retraceOrbits() {
    this.orbits = this.orbits
      .map(o => ({ seed: o.seed, line: this.traceBoth(o.seed[0], o.seed[1], null) }))
      .filter(o => o.line.length > 3)
  }

  setOption(key, value) {
    this.opts[key] = value
    this.invalidate()
  }

  // Zooming keeps the particles it already has: the ones that fall outside the
  // new box get recycled by advance() a frame later, which reads as the flow
  // refilling rather than as a hard cut.
  setRange(range) {
    this.range = Math.min(Math.max(range, 0.25), 200)
    this.invalidate()
  }

  zoom(factor) { this.setRange(this.range * factor) }

  reset() {
    this.center = [0, 0]
    this.setRange(4)
    this.orbits = []
    this.invalidate()
  }

  clearOrbits() { this.orbits = []; this.invalidate() }

  invalidate() { this.dirty = true }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    const loop = (ts) => {
      if (!this.running) return
      this.draw(ts)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
  }

  destroy() {
    this.stop()
    this.resizeObserver?.disconnect()
    this.paletteObserver?.disconnect()
  }

  // ── Pointer: drag to pan, click to drop a trajectory, wheel to zoom ───────

  bindPointer() {
    let down = null
    let moved = 0
    const cv = this.canvas

    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId)
      down = { x: e.offsetX, y: e.offsetY, cx: this.center[0], cy: this.center[1] }
      moved = 0
    })
    cv.addEventListener('pointermove', e => {
      if (!down) return
      const dx = e.offsetX - down.x, dy = e.offsetY - down.y
      moved = Math.max(moved, Math.hypot(dx, dy))
      if (moved < 4) return
      this.dragging = true
      this.center = [down.cx - dx / this.scale, down.cy + dy / this.scale]
      this.invalidate()
      if (!this.running) this.draw(0)
    })
    cv.addEventListener('pointerup', e => {
      if (down && moved < 4) this.addOrbit(this.wx(e.offsetX), this.wy(e.offsetY))
      down = null
      if (this.dragging) { this.dragging = false; this.invalidate() }
    })
    cv.addEventListener('pointercancel', () => {
      down = null
      if (this.dragging) { this.dragging = false; this.invalidate() }
    })
    cv.addEventListener('wheel', e => {
      e.preventDefault()
      this.zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12)
    }, { passive: false })
  }

  addOrbit(x, y) {
    const line = this.traceBoth(x, y, null)
    if (line.length > 3) {
      this.orbits.push({ line, seed: [x, y] })
      if (this.orbits.length > 8) this.orbits.shift()
      this.invalidate()
      if (!this.running) this.draw(0)
    }
  }

  // ── Streamlines ──────────────────────────────────────────────────────────

  traceBoth(sx, sy, hash) {
    const box = this.box
    const dsep = (box.rx + box.ry) / 13
    const h = dsep * 0.22
    const maxPts = 900

    const trace = (dir) => {
      const pts = []
      let x = sx, y = sy
      for (let i = 0; i < maxPts; i++) {
        pts.push([x, y])
        const n = this.stepUnit(x, y, h * dir)
        if (!n) break
        x = n[0]; y = n[1]
        if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) { pts.push([x, y]); break }
        // Closed orbit: it came back to where it started.
        if (i > 24 && Math.hypot(x - sx, y - sy) < h) { pts.push([x, y]); break }
        if (hash && i > 2 && hash.near(x, y)) break
      }
      return pts
    }

    const back = trace(-1)
    const fwd = trace(1)
    back.reverse()
    return back.concat(fwd.slice(1))
  }

  // Rebuilding the streamlines is the expensive part of a redraw, so it is
  // skipped while the reader is dragging the view and whenever nothing that
  // shapes them has changed.
  ensureStreams() {
    const sig = `${this.A.join(',')}|${this.center.join(',')}|${this.range}|${this.w}x${this.h}`
    if (sig === this.streamSig && this.streams.length) return
    if (this.dragging && this.streams.length) return
    this.buildStreams()
    this.streamSig = sig
  }

  buildStreams() {
    const box = this.box
    const dsep = (box.rx + box.ry) / 13
    const dtest = dsep * 0.52
    const cell = dsep
    const buckets = new Map()
    const key = (i, j) => `${i},${j}`
    const hash = {
      add: (x, y) => {
        const k = key(Math.floor((x - box.x0) / cell), Math.floor((y - box.y0) / cell))
        let arr = buckets.get(k)
        if (!arr) buckets.set(k, arr = [])
        arr.push(x, y)
      },
      near: (x, y) => {
        const gi = Math.floor((x - box.x0) / cell), gj = Math.floor((y - box.y0) / cell)
        for (let i = gi - 1; i <= gi + 1; i++) {
          for (let j = gj - 1; j <= gj + 1; j++) {
            const arr = buckets.get(key(i, j))
            if (!arr) continue
            for (let k = 0; k < arr.length; k += 2) {
              if (Math.hypot(arr[k] - x, arr[k + 1] - y) < dtest) return true
            }
          }
        }
        return false
      },
    }

    const cx = this.center[0], cy = this.center[1]
    const queue = []
    for (const [fx, fy] of [[0.45, 0.45], [-0.45, 0.45], [0.45, -0.45], [-0.45, -0.45], [0.9, 0], [0, 0.9], [-0.9, 0], [0, -0.9]]) {
      queue.push([cx + fx * box.rx, cy + fy * box.ry])
    }

    const lines = []
    let guard = 0
    while (queue.length && lines.length < 110 && guard++ < 4000) {
      const [sx, sy] = queue.shift()
      if (sx < box.x0 || sx > box.x1 || sy < box.y0 || sy > box.y1) continue
      if (hash.near(sx, sy)) continue
      const line = this.traceBoth(sx, sy, hash)
      if (line.length < 8) continue
      lines.push(line)
      for (const p of line) hash.add(p[0], p[1])
      for (let i = 0; i < line.length - 1; i += 7) {
        const p = line[i], q = line[i + 1]
        const tx = q[0] - p[0], ty = q[1] - p[1]
        const m = Math.hypot(tx, ty)
        if (m < 1e-12) continue
        const nx = -ty / m, ny = tx / m
        queue.push([p[0] + nx * dsep, p[1] + ny * dsep])
        queue.push([p[0] - nx * dsep, p[1] - ny * dsep])
      }
    }
    this.streams = lines
  }

  // ── Particles ────────────────────────────────────────────────────────────

  // The population is sized by the canvas area and then left alone: changing the
  // matrix keeps the particles where they are, so the flow morphs continuously
  // while a parameter slider is being dragged instead of restarting each frame.
  seedParticles() {
    const area = Math.max(1, this.w * this.h)
    const n = Math.round(Math.min(PARTICLE_TARGET, Math.max(90, area / 1800)))
    if (n === this.particles.length) return
    this.particles = []
    for (let i = 0; i < n; i++) {
      const p = { x: 0, y: 0, age: 0, life: 1, trail: [] }
      this.respawn(p, true)
      this.particles.push(p)
    }
  }

  respawn(p, initial = false) {
    const box = this.box
    p.x = box.x0 + Math.random() * (box.x1 - box.x0)
    p.y = box.y0 + Math.random() * (box.y1 - box.y0)
    p.life = 2.2 + Math.random() * 4.5
    p.age = initial ? Math.random() * p.life : 0
    p.trail.length = 0
  }

  advance(dt) {
    const box = this.box
    const dead = Math.max(box.rx, box.ry) * 2e-5
    for (const p of this.particles) {
      const next = this.stepFlow(p.x, p.y, dt)
      if (!Number.isFinite(next[0]) || !Number.isFinite(next[1])) { this.respawn(p); continue }
      const moved = Math.hypot(next[0] - p.x, next[1] - p.y)
      p.trail.push(p.x, p.y)
      if (p.trail.length > TRAIL * 2) p.trail.splice(0, p.trail.length - TRAIL * 2)
      p.x = next[0]; p.y = next[1]
      p.age += dt
      const out = p.x < box.x0 || p.x > box.x1 || p.y < box.y0 || p.y > box.y1
      // A particle that has converged onto a fixed point stops contributing.
      if (out || moved < dead || p.age > p.life) this.respawn(p)
    }
  }

  // ── Drawing ──────────────────────────────────────────────────────────────

  draw(ts) {
    if (!this.w || !this.h) return
    if (this.dirty) { this.drawStatic(); this.dirty = false }

    const ctx = this.ctx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.w, this.h)
    ctx.drawImage(this.bg, 0, 0, this.w, this.h)

    if (this.opts.particles) {
      const now = ts || performance.now()
      const raw = this.last ? (now - this.last) / 1000 : 0.016
      this.last = now
      const frame = Math.min(Math.max(raw, 0), 1 / 24)
      this.advance(frame * this.speed * 0.9 / this.rate)
      this.drawParticles(ctx)
    }
  }

  drawStatic() {
    const ctx = this.bgCtx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.w, this.h)
    if (this.opts.grid) this.drawGrid(ctx)
    this.drawAxes(ctx)
    if (this.opts.nullclines) this.drawNullclines(ctx)
    if (this.opts.field) this.drawField(ctx)
    if (this.opts.streams) { this.ensureStreams(); this.drawStreams(ctx) }
    this.drawOrbits(ctx)
    if (this.opts.eigen) this.drawEigenLines(ctx)
    this.drawFixedPoint(ctx)
  }

  gridStep() {
    const target = (2 * this.range) / 9
    return NICE_STEPS.find(s => s >= target) ?? NICE_STEPS[NICE_STEPS.length - 1]
  }

  drawGrid(ctx) {
    const step = this.gridStep()
    const box = this.box
    ctx.save()
    ctx.strokeStyle = withAlpha(this.c.muted, 0.18)
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = Math.ceil(box.x0 / step) * step; x <= box.x1; x += step) {
      const px = Math.round(this.sx(x)) + 0.5
      ctx.moveTo(px, 0); ctx.lineTo(px, this.h)
    }
    for (let y = Math.ceil(box.y0 / step) * step; y <= box.y1; y += step) {
      const py = Math.round(this.sy(y)) + 0.5
      ctx.moveTo(0, py); ctx.lineTo(this.w, py)
    }
    ctx.stroke()
    ctx.restore()
  }

  drawAxes(ctx) {
    const step = this.gridStep()
    const box = this.box
    const x0 = this.sx(0), y0 = this.sy(0)
    ctx.save()
    ctx.strokeStyle = withAlpha(this.c.muted, 0.75)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, Math.round(y0) + 0.5); ctx.lineTo(this.w, Math.round(y0) + 0.5)
    ctx.moveTo(Math.round(x0) + 0.5, 0); ctx.lineTo(Math.round(x0) + 0.5, this.h)
    ctx.stroke()

    ctx.fillStyle = withAlpha(this.c.muted, 0.9)
    ctx.font = `${Math.max(9, Math.min(12, this.w / 42))}px ${cssVar('--font-ui', 'sans-serif')}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const label = v => (Math.abs(v) < 1e-9 ? '' : String(Number(v.toFixed(4))))
    const clampY = Math.min(Math.max(y0 + 3, 2), this.h - 14)
    for (let x = Math.ceil(box.x0 / step) * step; x <= box.x1; x += step) {
      const t = label(x)
      if (t) ctx.fillText(t, this.sx(x), clampY)
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const clampX = Math.min(Math.max(x0 - 4, 24), this.w - 3)
    for (let y = Math.ceil(box.y0 / step) * step; y <= box.y1; y += step) {
      const t = label(y)
      if (t) ctx.fillText(t, clampX, this.sy(y))
    }

    ctx.fillStyle = withAlpha(this.c.muted, 1)
    ctx.font = `italic ${Math.max(11, Math.min(14, this.w / 34))}px ${cssVar('--font-label', 'serif')}`
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'
    ctx.fillText('x', this.w - 5, Math.min(Math.max(y0 - 4, 14), this.h - 2))
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText('y', Math.min(Math.max(x0 + 5, 2), this.w - 14), 4)
    ctx.restore()
  }

  drawField(ctx) {
    const cols = Math.round(Math.min(19, Math.max(9, this.w / 42)))
    const rows = Math.round(cols * this.h / Math.max(1, this.w))
    const box = this.box
    const dx = (box.x1 - box.x0) / cols
    const dy = (box.y1 - box.y0) / rows
    const len = Math.min(dx, dy) * this.scale * 0.42

    let maxMag = 0
    const cellsData = []
    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = box.x0 + i * dx, y = box.y0 + j * dy
        const [u, v] = this.velocity(x, y)
        const m = Math.hypot(u, v)
        if (!Number.isFinite(m)) continue
        maxMag = Math.max(maxMag, m)
        cellsData.push([x, y, u, v, m])
      }
    }
    if (maxMag <= 0) return

    ctx.save()
    ctx.lineWidth = 1
    for (const [x, y, u, v, m] of cellsData) {
      if (m < maxMag * 1e-4) continue
      // Length by a compressed magnitude so slow regions stay visible without
      // the fast ones running across the whole plot.
      const t = Math.sqrt(m / maxMag)
      const L = len * (0.35 + 0.65 * t)
      const px = this.sx(x), py = this.sy(y)
      const ux = u / m, uy = -v / m
      ctx.strokeStyle = withAlpha(this.c.muted, 0.16 + 0.32 * t)
      ctx.beginPath()
      ctx.moveTo(px - ux * L / 2, py - uy * L / 2)
      ctx.lineTo(px + ux * L / 2, py + uy * L / 2)
      ctx.stroke()
      this.arrowHead(ctx, px + ux * L / 2, py + uy * L / 2, ux, uy, Math.max(2.4, L * 0.26), withAlpha(this.c.muted, 0.2 + 0.4 * t))
    }
    ctx.restore()
  }

  drawStreams(ctx) {
    ctx.save()
    ctx.strokeStyle = withAlpha(this.c.text, 0.42)
    ctx.lineWidth = 1.2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    for (const line of this.streams) {
      ctx.beginPath()
      ctx.moveTo(this.sx(line[0][0]), this.sy(line[0][1]))
      for (let i = 1; i < line.length; i++) ctx.lineTo(this.sx(line[i][0]), this.sy(line[i][1]))
      ctx.stroke()
    }
    ctx.restore()
    for (const line of this.streams) this.arrowsAlong(ctx, line, withAlpha(this.c.text, 0.6), 2)
  }

  drawOrbits(ctx) {
    if (!this.orbits.length) return
    ctx.save()
    ctx.strokeStyle = this.c.third
    ctx.lineWidth = 2.2
    ctx.lineJoin = 'round'
    for (const { line, seed } of this.orbits) {
      ctx.beginPath()
      ctx.moveTo(this.sx(line[0][0]), this.sy(line[0][1]))
      for (let i = 1; i < line.length; i++) ctx.lineTo(this.sx(line[i][0]), this.sy(line[i][1]))
      ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = this.c.third
      ctx.arc(this.sx(seed[0]), this.sy(seed[1]), 3.2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    for (const { line } of this.orbits) this.arrowsAlong(ctx, line, this.c.third, 3, 2.8)
  }

  // Arrowheads spread along a polyline, pointing the way the flow runs.
  arrowsAlong(ctx, line, color, count, size = 2.4) {
    if (line.length < 4) return
    const px = line.map(p => [this.sx(p[0]), this.sy(p[1])])
    let total = 0
    const cum = [0]
    for (let i = 1; i < px.length; i++) {
      total += Math.hypot(px[i][0] - px[i - 1][0], px[i][1] - px[i - 1][1])
      cum.push(total)
    }
    if (total < 30) return
    for (let k = 1; k <= count; k++) {
      const target = total * k / (count + 1)
      let i = 1
      while (i < cum.length - 1 && cum[i] < target) i++
      const a = px[i - 1], b = px[i]
      const dx = b[0] - a[0], dy = b[1] - a[1]
      const m = Math.hypot(dx, dy)
      if (m < 1e-6) continue
      this.arrowHead(ctx, b[0], b[1], dx / m, dy / m, size * 2.2, color)
    }
  }

  arrowHead(ctx, x, y, ux, uy, size, color) {
    const nx = -uy, ny = ux
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - ux * size + nx * size * 0.5, y - uy * size + ny * size * 0.5)
    ctx.lineTo(x - ux * size - nx * size * 0.5, y - uy * size - ny * size * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  drawNullclines(ctx) {
    const [a, b, c, d] = this.A
    const specs = [
      { dir: [-b, a], color: this.c.third, label: 'ẋ = 0' },
      { dir: [-d, c], color: this.c.out, label: 'ẏ = 0' },
    ]
    ctx.save()
    ctx.setLineDash([6, 5])
    ctx.lineWidth = 1.4
    for (const s of specs) {
      const m = Math.hypot(s.dir[0], s.dir[1])
      if (m < 1e-12) continue
      const ux = s.dir[0] / m, uy = s.dir[1] / m
      const L = Math.hypot(this.box.rx, this.box.ry) * 1.2
      ctx.strokeStyle = withAlpha(s.color, 0.55)
      ctx.beginPath()
      ctx.moveTo(this.sx(-ux * L), this.sy(-uy * L))
      ctx.lineTo(this.sx(ux * L), this.sy(uy * L))
      ctx.stroke()
    }
    ctx.restore()
  }

  drawEigenLines(ctx) {
    const L = Math.hypot(this.box.rx, this.box.ry) * 1.2
    for (const line of this.lines) {
      const m = Math.hypot(line.v[0], line.v[1])
      if (m < 1e-12) continue
      const ux = line.v[0] / m, uy = line.v[1] / m
      const isFixed = line.role === 'fixedLine'
      const color = isFixed ? this.c.third : (line.outward ? this.c.out : this.c.primary)

      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = isFixed ? 3.2 : 2.4
      if (isFixed) {
        ctx.setLineDash([2, 6])
        ctx.lineCap = 'round'
      }
      ctx.beginPath()
      ctx.moveTo(this.sx(-ux * L), this.sy(-uy * L))
      ctx.lineTo(this.sx(ux * L), this.sy(uy * L))
      ctx.stroke()
      ctx.restore()

      if (!isFixed) {
        // Two arrows per half-line: outward when the eigenvalue grows, inward
        // when it decays (Strogatz, figures 5.2.2 and 5.2.3).
        for (const s of [1, -1]) {
          for (const f of [0.45, 0.8]) {
            const x = this.sx(ux * L * f * s), y = this.sy(uy * L * f * s)
            const dirX = (line.outward ? s : -s) * ux
            const dirY = (line.outward ? s : -s) * -uy
            this.arrowHead(ctx, x, y, dirX, dirY, 7, color)
          }
        }
      }

      this.labelLine(ctx, ux, uy, line, color)
    }
  }

  labelLine(ctx, ux, uy, line, color) {
    const r = Math.min(this.box.rx, this.box.ry) * 0.8
    let x = this.sx(ux * r), y = this.sy(uy * r)
    const pad = 46
    x = Math.min(Math.max(x, pad), this.w - pad)
    y = Math.min(Math.max(y, 14), this.h - 8)
    const text = line.role === 'fixedLine'
      ? (window.i18nGet ? window.i18nGet('pd.linearSystems.fixedPointsLine', 'fixed points') : 'fixed points')
      : `λ = ${Number(line.lambda.toFixed(3))}`
    ctx.save()
    ctx.font = `${Math.max(10, Math.min(13, this.w / 38))}px ${cssVar('--font-ui', 'sans-serif')}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const wBox = ctx.measureText(text).width + 8
    ctx.fillStyle = withAlpha(this.c.bg, 0.82)
    ctx.fillRect(x - wBox / 2, y - 9, wBox, 18)
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  drawFixedPoint(ctx) {
    const info = this.info
    if (info?.kind === 'planeOfFixedPoints') return
    const x = this.sx(0), y = this.sy(0)
    const solid = !!info?.liapunov && info?.kind !== 'lineOfFixedPoints'
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    if (solid) {
      ctx.fillStyle = this.c.text
      ctx.fill()
    } else {
      ctx.fillStyle = this.c.bg
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = this.c.text
      ctx.stroke()
    }
    ctx.restore()
  }

  drawParticles(ctx) {
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const p of this.particles) {
      const t = p.trail
      if (t.length < 4) continue
      const fade = Math.min(1, p.age * 3) * Math.min(1, (p.life - p.age) * 2.2)
      if (fade <= 0.02) continue
      for (let i = 2; i < t.length; i += 2) {
        const a = (i / t.length) * 0.7 * fade
        ctx.strokeStyle = withAlpha(this.c.primary, a)
        ctx.lineWidth = 0.6 + 1.3 * (i / t.length)
        ctx.beginPath()
        ctx.moveTo(this.sx(t[i - 2]), this.sy(t[i - 1]))
        ctx.lineTo(this.sx(t[i]), this.sy(t[i + 1]))
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.fillStyle = withAlpha(this.c.primary, 0.85 * fade)
      ctx.arc(this.sx(p.x), this.sy(p.y), 1.4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

export default LSPortrait
