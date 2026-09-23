// Animated phase portrait for a nonlinear system x' = f(x, y), y' = g(x, y),
// following Strogatz, chapter 6.
//
// On top of the layers the linear page already draws (vector field, evenly
// spaced streamlines, advected particles) this one adds what only a nonlinear
// field needs: nullclines as real curves instead of straight lines, every fixed
// point found in the window rather than just the origin, the stable and unstable
// manifolds of each saddle (section 6.4), the basins of attraction they bound,
// the level curves of the conserved quantity (section 6.5), and the little
// circle that counts the index of a fixed point (section 6.8).

const TRAIL = 10
const PARTICLE_TARGET = 340

const cssVar = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

// getComputedStyle hands back an oklch() string verbatim for the derived hues,
// which withAlpha below cannot take apart, so the colour is rasterized once and
// read back as plain sRGB.
const resolveColor = (expr) => {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;visibility:hidden;color:${expr}`
  document.body.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  if (/^rgba?\(/.test(value)) return value
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return a ? `rgb(${r}, ${g}, ${b})` : value
}

const withAlpha = (rgb, alpha) => {
  const m = rgb.match(/-?[\d.]+/g)
  if (!m || m.length < 3) return rgb
  return `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${alpha})`
}

const NICE_STEPS = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]

const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`pd.nonlinearSystems.${key}`, fallback) : fallback

// ── Marching squares ───────────────────────────────────────────────────────

// Zero set of a sampled function, as polylines in grid coordinates. Segments
// that share an endpoint are stitched together so the curve can be dashed and
// labelled like a single line.
function contour(values, nx, ny, level) {
  const segs = []
  const at = (i, j) => values[i * ny + j] - level

  for (let i = 0; i < nx - 1; i++) {
    for (let j = 0; j < ny - 1; j++) {
      const v00 = at(i, j), v10 = at(i + 1, j), v11 = at(i + 1, j + 1), v01 = at(i, j + 1)
      if (!Number.isFinite(v00) || !Number.isFinite(v10) || !Number.isFinite(v11) || !Number.isFinite(v01)) continue
      const cross = []
      const mix = (a, b) => a / (a - b)
      if ((v00 < 0) !== (v10 < 0)) cross.push(['b', i + mix(v00, v10), j])
      if ((v10 < 0) !== (v11 < 0)) cross.push(['r', i + 1, j + mix(v10, v11)])
      if ((v01 < 0) !== (v11 < 0)) cross.push(['t', i + mix(v01, v11), j + 1])
      if ((v00 < 0) !== (v01 < 0)) cross.push(['l', i, j + mix(v00, v01)])

      if (cross.length === 2) {
        segs.push([[cross[0][1], cross[0][2]], [cross[1][1], cross[1][2]]])
      } else if (cross.length === 4) {
        // Ambiguous cell: the sign at its centre decides which way the two
        // branches of the saddle are joined.
        const mid = (v00 + v10 + v11 + v01) / 4
        const pair = (mid < 0) === (v00 < 0) ? [[0, 3], [1, 2]] : [[0, 1], [2, 3]]
        for (const [a, b] of pair) {
          segs.push([[cross[a][1], cross[a][2]], [cross[b][1], cross[b][2]]])
        }
      }
    }
  }
  return stitch(segs)
}

function stitch(segs) {
  const key = p => `${Math.round(p[0] * 4096)},${Math.round(p[1] * 4096)}`
  const ends = new Map()
  segs.forEach((s, i) => {
    for (const p of s) {
      const k = key(p)
      if (!ends.has(k)) ends.set(k, [])
      ends.get(k).push(i)
    }
  })

  const used = new Array(segs.length).fill(false)
  const lines = []
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue
    used[i] = true
    const line = [segs[i][0], segs[i][1]]
    for (const dir of [1, 0]) {
      for (let guard = 0; guard < 20000; guard++) {
        const tip = dir ? line[line.length - 1] : line[0]
        const next = (ends.get(key(tip)) ?? []).find(k => !used[k])
        if (next === undefined) break
        used[next] = true
        const [a, b] = segs[next]
        const other = key(a) === key(tip) ? b : a
        if (dir) line.push(other)
        else line.unshift(other)
      }
    }
    if (line.length > 1) lines.push(line)
  }
  return lines
}

class NLPortrait {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.bg = document.createElement('canvas')
    this.bgCtx = this.bg.getContext('2d')
    this.basinCanvas = document.createElement('canvas')

    this.field = null
    this.points = []
    this.selected = -1
    this.range = 4
    this.center = [0, 0]
    this.rate = 1
    this.speed = 1
    this.opts = {
      grid: true, field: false, streams: true, particles: true,
      nullclines: true, manifolds: true, basins: false, energy: false, index: false,
    }
    this.streams = []
    this.orbits = []
    this.particles = []
    this.manifolds = []
    this.dirty = true
    this.running = false
    this.last = 0
    this.w = 0
    this.h = 0
    this.onView = null
    this.onSelect = null

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
      accent: resolveColor(`oklch(from ${primary} l c calc(h + 60))`),
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

  get span() { const b = this.box; return Math.max(b.x1 - b.x0, b.y1 - b.y0) }

  // ── Flow ─────────────────────────────────────────────────────────────────

  velocity(x, y) {
    return this.field ? this.field.F(x, y) : [0, 0]
  }

  unitVel(x, y) {
    const [u, v] = this.velocity(x, y)
    const m = Math.hypot(u, v)
    if (!Number.isFinite(m) || m < this.span * 1e-7) return null
    return [u / m, v / m]
  }

  // Arclength-parameterized RK4: every step advances the same distance, which
  // keeps the streamline spacing uniform and, unlike stepping in time, cannot
  // run off to infinity where the field blows up.
  stepUnit(x, y, h) {
    const k1 = this.unitVel(x, y); if (!k1) return null
    const k2 = this.unitVel(x + h / 2 * k1[0], y + h / 2 * k1[1]); if (!k2) return null
    const k3 = this.unitVel(x + h / 2 * k2[0], y + h / 2 * k2[1]); if (!k3) return null
    const k4 = this.unitVel(x + h * k3[0], y + h * k3[1]); if (!k4) return null
    const nx = x + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
    const ny = y + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
    return Number.isFinite(nx) && Number.isFinite(ny) ? [nx, ny] : null
  }

  // Real time stepping for the particles, split into substeps wherever the flow
  // is fast enough that one RK4 step would jump across the screen.
  stepFlow(x, y, dt) {
    const f = (px, py) => this.velocity(px, py)
    const [u0, v0] = f(x, y)
    const speed = Math.hypot(u0, v0)
    if (!Number.isFinite(speed)) return [NaN, NaN]
    const limit = this.span * 0.05
    const subs = Math.min(8, Math.max(1, Math.ceil(speed * dt / limit)))
    const h = dt / subs
    for (let s = 0; s < subs; s++) {
      const k1 = f(x, y)
      const k2 = f(x + h / 2 * k1[0], y + h / 2 * k1[1])
      const k3 = f(x + h / 2 * k2[0], y + h / 2 * k2[1])
      const k4 = f(x + h * k3[0], y + h * k3[1])
      x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
      y += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
      if (!Number.isFinite(x) || !Number.isFinite(y)) return [NaN, NaN]
    }
    return [x, y]
  }

  // ── Public API ───────────────────────────────────────────────────────────

  setSystem(field, points, energy) {
    this.field = field
    this.points = points ?? []
    this.energy = energy ?? null
    if (this.selected >= this.points.length) this.selected = this.points.length ? 0 : -1
    const rate = field ? field.scaleOf(this.box) / this.span : 1
    this.rate = Math.min(Math.max(rate || 1, 0.02), 500)
    this.buildManifolds()
    this.retraceOrbits()
    this.streams = []
    this.basinKey = null
    this.invalidate()
    this.seedParticles()
  }

  setSelected(i) {
    if (i === this.selected) return
    this.selected = i
    this.invalidate()
    if (!this.running) this.draw(0)
  }

  setOption(key, value) {
    this.opts[key] = value
    this.invalidate()
    if (!this.running) this.draw(0)
  }

  setView(center, range) {
    this.center = center.slice()
    this.range = Math.min(Math.max(range, 1e-3), 1e4)
    this.viewChanged()
  }

  setRange(range) {
    this.range = Math.min(Math.max(range, 1e-3), 1e4)
    this.viewChanged()
  }

  zoom(factor) { this.setRange(this.range * factor) }

  reset() {
    this.center = this.home ? this.home.center.slice() : [0, 0]
    this.orbits = []
    this.setRange(this.home ? this.home.range : 4)
  }

  clearOrbits() { this.orbits = []; this.invalidate(); if (!this.running) this.draw(0) }

  invalidate() { this.dirty = true }

  // The window drives which fixed points exist, so the app is told about it
  // once the reader stops moving.
  viewChanged() {
    this.invalidate()
    if (!this.running) this.draw(0)
    clearTimeout(this.viewTimer)
    this.viewTimer = setTimeout(() => this.onView?.(), 180)
  }

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

  // ── Pointer ──────────────────────────────────────────────────────────────

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
      if (down && moved < 4) this.tap(e.offsetX, e.offsetY)
      down = null
      if (this.dragging) { this.dragging = false; this.viewChanged() }
    })
    cv.addEventListener('pointercancel', () => {
      down = null
      if (this.dragging) { this.dragging = false; this.viewChanged() }
    })
    cv.addEventListener('wheel', e => {
      e.preventDefault()
      this.zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12)
    }, { passive: false })
  }

  // A tap on a fixed point selects it; anywhere else it drops a trajectory.
  tap(px, py) {
    let best = -1, bestD = 14
    this.points.forEach((p, i) => {
      const d = Math.hypot(this.sx(p.x) - px, this.sy(p.y) - py)
      if (d < bestD) { bestD = d; best = i }
    })
    if (best >= 0) {
      this.setSelected(best)
      this.onSelect?.(best)
      return
    }
    this.addOrbit(this.wx(px), this.wy(py))
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

  retraceOrbits() {
    this.orbits = this.orbits
      .map(o => ({ seed: o.seed, line: this.traceBoth(o.seed[0], o.seed[1], null) }))
      .filter(o => o.line.length > 3)
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

  ensureStreams() {
    const sig = `${this.sig()}|${this.center.join(',')}|${this.range}|${this.w}x${this.h}`
    if (sig === this.streamSig && this.streams.length) return
    if (this.dragging && this.streams.length) return
    this.buildStreams()
    this.streamSig = sig
  }

  sig() {
    if (!this.field) return 'none'
    return `${this.field.tex?.f}|${this.field.tex?.g}|${JSON.stringify(this.field.p)}`
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

  // ── Invariant manifolds of the saddles (section 6.4) ──────────────────────

  buildManifolds() {
    this.manifolds = []
    if (!this.field) return
    const box = this.box
    const span = this.span
    const eps = span * 8e-4
    const h = span / 320

    for (const pt of this.points) {
      if (!pt.info?.ok || pt.info.kind !== 'saddle') continue
      for (const line of pt.info.lines ?? []) {
        const unstable = line.lambda > 0
        const m = Math.hypot(line.v[0], line.v[1])
        if (m < 1e-12) continue
        const ux = line.v[0] / m, uy = line.v[1] / m
        for (const s of [1, -1]) {
          const path = this.traceManifold(
            pt.x + s * eps * ux, pt.y + s * eps * uy, unstable ? 1 : -1, h, box, pt,
          )
          if (path.length > 2) {
            path.unshift([pt.x, pt.y])
            this.manifolds.push({ path, unstable })
          }
        }
      }
    }
  }

  traceManifold(x, y, dir, h, box, origin) {
    const pts = [[x, y]]
    const stop = this.span * 4e-3
    for (let i = 0; i < 2600; i++) {
      const n = this.stepUnit(x, y, h * dir)
      if (!n) break
      x = n[0]; y = n[1]
      pts.push([x, y])
      if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) break
      // Stop on arrival at another fixed point, so the curve does not crawl
      // around it forever.
      for (const q of this.points) {
        if (q === origin && i < 40) continue
        if (Math.hypot(q.x - x, q.y - y) < stop) return pts
      }
    }
    return pts
  }

  // ── Basins of attraction (section 6.4) ────────────────────────────────────

  ensureBasins() {
    const key = `${this.sig()}|${this.center.join(',')}|${this.range}`
    if (key === this.basinKey) return
    if (this.dragging) return
    this.basinKey = key
    this.buildBasins()
  }

  buildBasins() {
    const attractors = this.points.filter(p => p.attracting)
    this.basins = null
    if (!this.field || !attractors.length) return

    const n = 58
    const box = this.box
    const span = this.span
    const h = span / 80
    const near = span * 0.02
    const cv = this.basinCanvas
    cv.width = n; cv.height = n
    const ctx = cv.getContext('2d')
    const img = ctx.createImageData(n, n)
    const colors = attractors.map((p, i) => this.basinColor(i))

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let x = box.x0 + (box.x1 - box.x0) * (i + 0.5) / n
        let y = box.y1 - (box.y1 - box.y0) * (j + 0.5) / n
        let hit = -1
        for (let k = 0; k < 420 && hit < 0; k++) {
          for (let a = 0; a < attractors.length; a++) {
            if (Math.hypot(attractors[a].x - x, attractors[a].y - y) < near) { hit = a; break }
          }
          if (hit >= 0) break
          const p = this.stepUnit(x, y, h)
          if (!p) break
          x = p[0]; y = p[1]
          if (x < box.x0 - span || x > box.x1 + span || y < box.y0 - span || y > box.y1 + span) break
        }
        const o = (j * n + i) * 4
        if (hit >= 0) {
          const c = colors[hit]
          img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 64
        }
      }
    }
    ctx.putImageData(img, 0, 0)
    this.basins = { box, n }
  }

  basinColor(i) {
    const src = [this.c.primary, this.c.out, this.c.third, this.c.accent][i % 4]
    const m = src.match(/-?[\d.]+/g)
    return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [128, 128, 128]
  }

  // ── Particles ────────────────────────────────────────────────────────────

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
    if (this.opts.basins) { this.ensureBasins(); this.drawBasins(ctx) }
    if (this.opts.grid) this.drawGrid(ctx)
    this.drawAxes(ctx)
    if (this.opts.energy) this.drawEnergy(ctx)
    if (this.opts.nullclines) this.drawNullclines(ctx)
    if (this.opts.field) this.drawField(ctx)
    if (this.opts.streams) { this.ensureStreams(); this.drawStreams(ctx) }
    this.drawOrbits(ctx)
    if (this.opts.manifolds) { this.drawEigenStubs(ctx); this.drawManifolds(ctx) }
    if (this.opts.index) this.drawIndexProbe(ctx)
    this.drawFixedPoints(ctx)
  }

  gridStep() {
    const target = (2 * this.range) / 9
    const raw = NICE_STEPS.find(s => s >= target)
    if (raw) return raw
    const mag = Math.pow(10, Math.floor(Math.log10(target)))
    return Math.ceil(target / mag) * mag
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
    const label = v => (Math.abs(v) < step * 1e-6 ? '' : String(Number(v.toFixed(4))))
    const clampY = Math.min(Math.max(y0 + 3, 2), this.h - 14)
    for (let x = Math.ceil(box.x0 / step) * step; x <= box.x1; x += step) {
      const s = label(x)
      if (s) ctx.fillText(s, this.sx(x), clampY)
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const clampX = Math.min(Math.max(x0 - 4, 24), this.w - 3)
    for (let y = Math.ceil(box.y0 / step) * step; y <= box.y1; y += step) {
      const s = label(y)
      if (s) ctx.fillText(s, clampX, this.sy(y))
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
    const cells = []
    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = box.x0 + i * dx, y = box.y0 + j * dy
        const [u, v] = this.velocity(x, y)
        const m = Math.hypot(u, v)
        if (!Number.isFinite(m)) continue
        maxMag = Math.max(maxMag, m)
        cells.push([x, y, u, v, m])
      }
    }
    if (maxMag <= 0) return

    ctx.save()
    ctx.lineWidth = 1
    for (const [x, y, u, v, m] of cells) {
      if (m < maxMag * 1e-4) continue
      const s = Math.sqrt(m / maxMag)
      const L = len * (0.35 + 0.65 * s)
      const px = this.sx(x), py = this.sy(y)
      const ux = u / m, uy = -v / m
      ctx.strokeStyle = withAlpha(this.c.muted, 0.16 + 0.32 * s)
      ctx.beginPath()
      ctx.moveTo(px - ux * L / 2, py - uy * L / 2)
      ctx.lineTo(px + ux * L / 2, py + uy * L / 2)
      ctx.stroke()
      this.arrowHead(ctx, px + ux * L / 2, py + uy * L / 2, ux, uy, Math.max(2.4, L * 0.26), withAlpha(this.c.muted, 0.2 + 0.4 * s))
    }
    ctx.restore()
  }

  drawStreams(ctx) {
    ctx.save()
    ctx.strokeStyle = withAlpha(this.c.text, 0.4)
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
    for (const line of this.streams) this.arrowsAlong(ctx, line, withAlpha(this.c.text, 0.58), 2)
  }

  drawOrbits(ctx) {
    if (!this.orbits.length) return
    ctx.save()
    ctx.strokeStyle = this.c.text
    ctx.lineWidth = 2.2
    ctx.lineJoin = 'round'
    for (const { line, seed } of this.orbits) {
      ctx.beginPath()
      ctx.moveTo(this.sx(line[0][0]), this.sy(line[0][1]))
      for (let i = 1; i < line.length; i++) ctx.lineTo(this.sx(line[i][0]), this.sy(line[i][1]))
      ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = this.c.text
      ctx.arc(this.sx(seed[0]), this.sy(seed[1]), 3.2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    for (const { line } of this.orbits) this.arrowsAlong(ctx, line, this.c.text, 3, 2.8)
  }

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

  // Curves f = 0 and g = 0. Their crossings are the fixed points, which is how
  // section 6.1 finds them by hand.
  drawNullclines(ctx) {
    if (!this.field) return
    const box = this.box
    const n = 150
    const dx = (box.x1 - box.x0) / (n - 1)
    const dy = (box.y1 - box.y0) / (n - 1)
    const fv = new Float64Array(n * n)
    const gv = new Float64Array(n * n)
    for (let i = 0; i < n; i++) {
      const x = box.x0 + i * dx
      for (let j = 0; j < n; j++) {
        const y = box.y0 + j * dy
        const [u, v] = this.velocity(x, y)
        fv[i * n + j] = u
        gv[i * n + j] = v
      }
    }

    const toScreen = p => [this.sx(box.x0 + p[0] * dx), this.sy(box.y0 + p[1] * dy)]
    const specs = [
      { values: fv, color: this.c.third, label: t('nullclineX', 'ẋ = 0') },
      { values: gv, color: this.c.accent, label: t('nullclineY', 'ẏ = 0') },
    ]

    ctx.save()
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.setLineDash([7, 5])
    for (const spec of specs) {
      const lines = contour(spec.values, n, n, 0)
      ctx.strokeStyle = withAlpha(spec.color, 0.85)
      for (const line of lines) {
        ctx.beginPath()
        const p0 = toScreen(line[0])
        ctx.moveTo(p0[0], p0[1])
        for (let i = 1; i < line.length; i++) {
          const p = toScreen(line[i])
          ctx.lineTo(p[0], p[1])
        }
        ctx.stroke()
      }
      const longest = lines.reduce((a, b) => (b.length > (a?.length ?? 0) ? b : a), null)
      if (longest) {
        const p = toScreen(longest[Math.floor(longest.length * 0.28)])
        this.tag(ctx, spec.label, p[0], p[1], spec.color)
      }
    }
    ctx.restore()
  }

  // Level curves of the conserved quantity of section 6.5. The levels that pass
  // through a saddle are the separatrices, so they are always included.
  drawEnergy(ctx) {
    const grid = this.energy
    if (!grid) return
    const sorted = Array.from(grid.H).filter(Number.isFinite).sort((a, b) => a - b)
    if (sorted.length < 10) return
    const lo = sorted[Math.floor(sorted.length * 0.02)]
    const hi = sorted[Math.floor(sorted.length * 0.98)]
    if (!(hi > lo)) return

    const levels = []
    for (let k = 1; k <= 9; k++) levels.push({ v: lo + (hi - lo) * k / 10, sep: false })

    const saddles = []
    for (const p of this.points) {
      if (p.info?.kind !== 'saddle') continue
      const v = this.field.sampleEnergy(grid, p.x, p.y)
      if (Number.isFinite(v)) { levels.push({ v, sep: true }); saddles.push(v) }
    }

    // A well holds only a sliver of the range of E, so evenly spaced levels
    // would leave the closed orbits around a center undrawn. Each center gets
    // its own few, spread between its value and the separatrix that bounds it.
    for (const p of this.points) {
      if (p.info?.kind !== 'center') continue
      const hc = this.field.sampleEnergy(grid, p.x, p.y)
      if (!Number.isFinite(hc)) continue
      const edge = saddles.length
        ? saddles.reduce((a, b) => (Math.abs(b - hc) < Math.abs(a - hc) ? b : a))
        : (hc < (lo + hi) / 2 ? hi : lo)
      for (const f of [0.22, 0.48, 0.74, 0.92]) levels.push({ v: hc + (edge - hc) * f, sep: false })
    }

    ctx.save()
    ctx.lineJoin = 'round'
    for (const { v, sep } of levels) {
      const lines = contour(grid.H, grid.nx, grid.ny, v)
      ctx.strokeStyle = withAlpha(sep ? this.c.out : this.c.muted, sep ? 0.85 : 0.45)
      ctx.lineWidth = sep ? 1.8 : 1
      for (const line of lines) {
        ctx.beginPath()
        for (let i = 0; i < line.length; i++) {
          const x = this.sx(grid.x0 + line[i][0] * grid.dx)
          const y = this.sy(grid.y0 + line[i][1] * grid.dy)
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    }
    ctx.restore()
  }

  drawBasins(ctx) {
    if (!this.basins) return
    const b = this.basins.box
    const x0 = this.sx(b.x0), x1 = this.sx(b.x1)
    const y0 = this.sy(b.y1), y1 = this.sy(b.y0)
    ctx.save()
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(this.basinCanvas, x0, y0, x1 - x0, y1 - y0)
    ctx.restore()
  }

  drawManifolds(ctx) {
    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    for (const m of this.manifolds) {
      const color = m.unstable ? this.c.out : this.c.primary
      ctx.strokeStyle = color
      ctx.lineWidth = 2.4
      ctx.beginPath()
      ctx.moveTo(this.sx(m.path[0][0]), this.sy(m.path[0][1]))
      for (let i = 1; i < m.path.length; i++) ctx.lineTo(this.sx(m.path[i][0]), this.sy(m.path[i][1]))
      ctx.stroke()
      this.manifoldArrows(ctx, m, color)
    }
    ctx.restore()
  }

  // Arrows run outward along an unstable manifold and inward along a stable one,
  // which is the whole content of the two names.
  manifoldArrows(ctx, m, color) {
    const px = m.path.map(p => [this.sx(p[0]), this.sy(p[1])])
    let total = 0
    const cum = [0]
    for (let i = 1; i < px.length; i++) {
      total += Math.hypot(px[i][0] - px[i - 1][0], px[i][1] - px[i - 1][1])
      cum.push(total)
    }
    if (total < 26) return
    for (const frac of [0.35, 0.72]) {
      const target = total * frac
      let i = 1
      while (i < cum.length - 1 && cum[i] < target) i++
      const a = px[i - 1], b = px[i]
      let dx = b[0] - a[0], dy = b[1] - a[1]
      if (!m.unstable) { dx = -dx; dy = -dy }
      const d = Math.hypot(dx, dy)
      if (d < 1e-6) continue
      this.arrowHead(ctx, b[0], b[1], dx / d, dy / d, 7, color)
    }
  }

  // Short eigendirection segments at the fixed points where the linearization
  // has real eigenvectors but no manifold is drawn.
  drawEigenStubs(ctx) {
    const L = this.span * 0.07
    ctx.save()
    ctx.lineWidth = 1.8
    for (const p of this.points) {
      if (!p.info?.ok || p.info.kind === 'saddle') continue
      for (const line of p.info.lines ?? []) {
        const m = Math.hypot(line.v[0], line.v[1])
        if (m < 1e-12) continue
        const ux = line.v[0] / m, uy = line.v[1] / m
        ctx.strokeStyle = withAlpha(line.outward ? this.c.out : this.c.primary, 0.75)
        ctx.beginPath()
        ctx.moveTo(this.sx(p.x - ux * L), this.sy(p.y - uy * L))
        ctx.lineTo(this.sx(p.x + ux * L), this.sy(p.y + uy * L))
        ctx.stroke()
      }
    }
    ctx.restore()
  }

  // Section 6.8: the field sampled around a small circle, which is the picture
  // the index is read off.
  drawIndexProbe(ctx) {
    const p = this.points[this.selected]
    if (!p || !this.field) return
    const r = p.radius
    const R = r * this.scale
    ctx.save()
    ctx.strokeStyle = withAlpha(this.c.text, 0.5)
    ctx.setLineDash([4, 4])
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(this.sx(p.x), this.sy(p.y), R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    const n = 18
    const len = Math.max(9, Math.min(R * 0.45, 22))
    for (let k = 0; k < n; k++) {
      const th = 2 * Math.PI * k / n
      const x = p.x + r * Math.cos(th), y = p.y + r * Math.sin(th)
      const [u, v] = this.velocity(x, y)
      const m = Math.hypot(u, v)
      if (!Number.isFinite(m) || m < 1e-15) continue
      const ux = u / m, uy = -v / m
      const px = this.sx(x), py = this.sy(y)
      ctx.strokeStyle = withAlpha(this.c.text, 0.75)
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px + ux * len, py + uy * len)
      ctx.stroke()
      this.arrowHead(ctx, px + ux * len, py + uy * len, ux, uy, 4, withAlpha(this.c.text, 0.85))
    }
    if (p.index !== null && p.index !== undefined) {
      this.tag(ctx, `I = ${p.index > 0 ? '+' : ''}${p.index}`, this.sx(p.x), this.sy(p.y) - R - 12, this.c.text)
    }
    ctx.restore()
  }

  drawFixedPoints(ctx) {
    ctx.save()
    this.points.forEach((p, i) => {
      const x = this.sx(p.x), y = this.sy(p.y)
      if (i === this.selected) {
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.strokeStyle = withAlpha(this.c.text, 0.45)
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(x, y, 5.2, 0, Math.PI * 2)
      if (p.info?.liapunov) {
        ctx.fillStyle = this.c.text
        ctx.fill()
      } else {
        ctx.fillStyle = this.c.bg
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = this.c.text
        ctx.stroke()
      }
    })
    ctx.restore()
  }

  tag(ctx, text, x, y, color) {
    ctx.save()
    ctx.setLineDash([])
    ctx.font = `${Math.max(10, Math.min(13, this.w / 38))}px ${cssVar('--font-ui', 'sans-serif')}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const pad = 30
    const px = Math.min(Math.max(x, pad), this.w - pad)
    const py = Math.min(Math.max(y, 12), this.h - 10)
    const w = ctx.measureText(text).width + 8
    ctx.fillStyle = withAlpha(this.c.bg, 0.82)
    ctx.fillRect(px - w / 2, py - 9, w, 18)
    ctx.fillStyle = color
    ctx.fillText(text, px, py)
    ctx.restore()
  }

  drawParticles(ctx) {
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const p of this.particles) {
      const tr = p.trail
      if (tr.length < 4) continue
      const fade = Math.min(1, p.age * 3) * Math.min(1, (p.life - p.age) * 2.2)
      if (fade <= 0.02) continue
      for (let i = 2; i < tr.length; i += 2) {
        const a = (i / tr.length) * 0.7 * fade
        ctx.strokeStyle = withAlpha(this.c.primary, a)
        ctx.lineWidth = 0.6 + 1.3 * (i / tr.length)
        ctx.beginPath()
        ctx.moveTo(this.sx(tr[i - 2]), this.sy(tr[i - 1]))
        ctx.lineTo(this.sx(tr[i]), this.sy(tr[i + 1]))
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

export default NLPortrait
