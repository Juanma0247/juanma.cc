// The vector field of a nonlinear system, following Strogatz chapter 6.
//
// Everything the page says about a system is computed here: the Jacobian of
// section 6.3 (symbolically, so it can also be printed), the fixed points of
// section 6.1 (numerically, by Newton from a grid of seeds), the index of
// section 6.8, and the two tests that rescue a borderline center — a conserved
// quantity (6.5) or a reversing symmetry (6.6).

import { parseExpr } from '/js/lib/LSExpr.js'
import { derivative, compile, texOf } from '/js/lib/NLExpr.js'
import { analyze } from '/js/lib/LSAnalysis.js'

// Linearization tells the whole truth only at a hyperbolic fixed point; the
// borderline cases of section 6.3 are flagged so the page can say so.
const VERDICT = {
  saddle: 'robust', stableNode: 'robust', unstableNode: 'robust',
  stableSpiral: 'robust', unstableSpiral: 'robust',
  stableStar: 'typeOnly', unstableStar: 'typeOnly',
  stableDegenerate: 'typeOnly', unstableDegenerate: 'typeOnly',
  center: 'marginal', lineOfFixedPoints: 'marginal', planeOfFixedPoints: 'marginal',
}

export class NLField {
  constructor(fSrc, gSrc) {
    const pf = parseExpr(fSrc)
    const pg = parseExpr(gSrc)
    this.ok = pf.ok && pg.ok
    this.badF = !pf.ok
    this.badG = !pg.ok
    this.error = pf.ok ? (pg.ok ? null : pg.error) : pf.error
    this.p = {}
    if (!this.ok) return

    this.vars = []
    for (const v of [...pf.vars, ...pg.vars]) {
      if (v !== 'x' && v !== 'y' && !this.vars.includes(v)) this.vars.push(v)
    }

    this.tex = { f: pf.tex, g: pg.tex }
    const d = {
      fx: derivative(pf.node, 'x'), fy: derivative(pf.node, 'y'),
      gx: derivative(pg.node, 'x'), gy: derivative(pg.node, 'y'),
    }
    this.texJ = { fx: texOf(d.fx), fy: texOf(d.fy), gx: texOf(d.gx), gy: texOf(d.gy) }

    const f = compile(pf.node), g = compile(pg.node)
    const fx = compile(d.fx), fy = compile(d.fy), gx = compile(d.gx), gy = compile(d.gy)
    const p = () => this.p
    this.f = (x, y) => f(x, y, p())
    this.g = (x, y) => g(x, y, p())
    this.jfx = (x, y) => fx(x, y, p())
    this.jfy = (x, y) => fy(x, y, p())
    this.jgx = (x, y) => gx(x, y, p())
    this.jgy = (x, y) => gy(x, y, p())
  }

  setParams(values) {
    this.p = { ...values }
  }

  F(x, y) { return [this.f(x, y), this.g(x, y)] }

  J(x, y) { return [this.jfx(x, y), this.jfy(x, y), this.jgx(x, y), this.jgy(x, y)] }

  divergence(x, y) { return this.jfx(x, y) + this.jgy(x, y) }

  // Typical speed of the flow over the window, used as the yardstick every
  // tolerance below is measured against. The median keeps a single blow-up
  // (a pole, an exponential corner) from setting the scale for the whole box.
  scaleOf(box, n = 17) {
    const mags = []
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = box.x0 + (box.x1 - box.x0) * i / n
        const y = box.y0 + (box.y1 - box.y0) * j / n
        const m = Math.hypot(this.f(x, y), this.g(x, y))
        if (Number.isFinite(m)) mags.push(m)
      }
    }
    if (!mags.length) return 1
    mags.sort((a, b) => a - b)
    return Math.max(mags[Math.floor(mags.length / 2)], 1e-9)
  }

  // ── Fixed points ─────────────────────────────────────────────────────────

  // Newton's method with a backtracking line search, falling back to a step
  // down the gradient of |F|^2 wherever the Jacobian is singular.
  newton(x, y, box, tol) {
    const spanX = box.x1 - box.x0, spanY = box.y1 - box.y0
    let [u, v] = this.F(x, y)
    for (let k = 0; k < 60; k++) {
      if (!Number.isFinite(u) || !Number.isFinite(v)) return null
      const r2 = u * u + v * v
      if (Math.sqrt(r2) < tol) return [x, y]

      const [a, b, c, d] = this.J(x, y)
      if (![a, b, c, d].every(Number.isFinite)) return null
      const det = a * d - b * c
      const jScale = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d), 1e-12)
      let dx, dy
      if (Math.abs(det) > 1e-12 * jScale * jScale) {
        dx = -(d * u - b * v) / det
        dy = -(a * v - c * u) / det
      } else {
        dx = -(a * u + c * v)
        dy = -(b * u + d * v)
        const m = Math.hypot(dx, dy)
        if (m < 1e-18) return null
        const step = 0.05 * Math.max(spanX, spanY)
        dx = dx / m * step; dy = dy / m * step
      }

      let t = 1, moved = false
      for (let s = 0; s < 24; s++) {
        const nx = x + t * dx, ny = y + t * dy
        const [nu, nv] = this.F(nx, ny)
        if (Number.isFinite(nu) && Number.isFinite(nv) && nu * nu + nv * nv < r2) {
          x = nx; y = ny; u = nu; v = nv; moved = true
          break
        }
        t /= 2
      }
      if (!moved) return Math.sqrt(r2) < tol * 50 ? [x, y] : null
      if (x < box.x0 - spanX || x > box.x1 + spanX || y < box.y0 - spanY || y > box.y1 + spanY) return null
    }
    return null
  }

  // Seeds a grid over the window, polishes each seed and keeps the distinct
  // roots that land inside it. This is the numerical version of "the fixed
  // points are where the nullclines cross".
  fixedPoints(box, { seeds = 26, max = 40 } = {}) {
    if (!this.ok) return []
    const scale = this.scaleOf(box)
    const tol = Math.max(scale * 1e-11, 1e-13)
    const spanX = box.x1 - box.x0, spanY = box.y1 - box.y0
    const tolDup = Math.max(spanX, spanY) * 4e-4
    const out = []

    for (let i = 0; i <= seeds && out.length < max; i++) {
      for (let j = 0; j <= seeds && out.length < max; j++) {
        // Half-cell offset: a seed sitting exactly on a fixed point of a field
        // like (2xy, y^2 - x^2) has a singular Jacobian and gets nowhere.
        const sx = box.x0 + spanX * (i + 0.5) / (seeds + 1)
        const sy = box.y0 + spanY * (j + 0.5) / (seeds + 1)
        const p = this.newton(sx, sy, box, tol)
        if (!p) continue
        const [x, y] = p
        if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) continue
        if (out.some(q => Math.abs(q.x - x) < tolDup && Math.abs(q.y - y) < tolDup)) continue
        out.push({ x, y })
      }
    }

    out.sort((a, b) => (Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y)))
    // Natural size of a Jacobian entry here: a velocity divided by a length.
    const jRef = scale / Math.max(spanX, spanY)
    for (const pt of out) this.describe(pt, out, box, jRef)
    return out
  }

  // Everything the fixed-point card shows: linearization, classification, how
  // much of it survives the nonlinear terms, and the index of section 6.8.
  describe(pt, all, box, jRef = 1) {
    const A = this.J(pt.x, pt.y)
    pt.A = A
    pt.info = analyze(...A)
    // A Jacobian that vanishes altogether, as at the dipole of section 6.8,
    // leaves the linearization with nothing at all to say. Newton only reaches
    // such a degenerate zero linearly, so the test has to be a relative one.
    pt.jZero = A.every(v => Math.abs(v) < Math.max(jRef, 1e-12) * 1e-4)
    pt.verdict = pt.jZero ? 'degenerate' : (pt.info.ok ? (VERDICT[pt.info.kind] ?? 'robust') : 'marginal')
    pt.attracting = pt.info.ok && pt.info.stability === 'stable'

    const span = Math.max(box.x1 - box.x0, box.y1 - box.y0)
    let nearest = span
    for (const q of all) {
      if (q === pt) continue
      nearest = Math.min(nearest, Math.hypot(q.x - pt.x, q.y - pt.y))
    }
    pt.radius = Math.max(Math.min(nearest * 0.35, span * 0.07), span * 1e-3)
    pt.index = this.indexAt(pt.x, pt.y, pt.radius)
    return pt
  }

  // Index of a closed curve, section 6.8: the number of turns the vector field
  // makes as the curve is traversed once counterclockwise.
  indexAt(cx, cy, r, steps = 360) {
    let prev = null
    let total = 0
    for (let k = 0; k <= steps; k++) {
      const th = 2 * Math.PI * k / steps
      const [u, v] = this.F(cx + r * Math.cos(th), cy + r * Math.sin(th))
      if (!Number.isFinite(u) || !Number.isFinite(v)) return null
      if (Math.hypot(u, v) < 1e-14) return null
      const ang = Math.atan2(v, u)
      if (prev !== null) {
        let d = ang - prev
        while (d > Math.PI) d -= 2 * Math.PI
        while (d < -Math.PI) d += 2 * Math.PI
        total += d
      }
      prev = ang
    }
    const idx = total / (2 * Math.PI)
    return Math.abs(idx - Math.round(idx)) < 0.05 ? Math.round(idx) : null
  }

  // Index of the window border, which by the theorems of 6.8 must equal the sum
  // of the indices of the fixed points inside it.
  indexOfBox(box) {
    const pts = []
    const n = 90
    const push = (x, y) => pts.push([x, y])
    for (let i = 0; i < n; i++) push(box.x0 + (box.x1 - box.x0) * i / n, box.y0)
    for (let i = 0; i < n; i++) push(box.x1, box.y0 + (box.y1 - box.y0) * i / n)
    for (let i = 0; i < n; i++) push(box.x1 - (box.x1 - box.x0) * i / n, box.y1)
    for (let i = 0; i < n; i++) push(box.x0, box.y1 - (box.y1 - box.y0) * i / n)
    pts.push(pts[0])

    let prev = null, total = 0
    for (const [x, y] of pts) {
      const [u, v] = this.F(x, y)
      if (!Number.isFinite(u) || !Number.isFinite(v) || Math.hypot(u, v) < 1e-14) return null
      const ang = Math.atan2(v, u)
      if (prev !== null) {
        let d = ang - prev
        while (d > Math.PI) d -= 2 * Math.PI
        while (d < -Math.PI) d += 2 * Math.PI
        total += d
      }
      prev = ang
    }
    const idx = total / (2 * Math.PI)
    return Math.abs(idx - Math.round(idx)) < 0.08 ? Math.round(idx) : null
  }

  // ── Structure of the system ──────────────────────────────────────────────

  // Section 6.5: a system with zero divergence preserves area, which is exactly
  // the condition for a conserved quantity H with f = H_y and g = -H_x.
  isConservative(box, n = 21) {
    if (!this.ok) return false
    let worst = 0, scale = 0
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = box.x0 + (box.x1 - box.x0) * i / n
        const y = box.y0 + (box.y1 - box.y0) * j / n
        const [a, b, c, d] = this.J(x, y)
        if (![a, b, c, d].every(Number.isFinite)) continue
        worst = Math.max(worst, Math.abs(a + d))
        scale = Math.max(scale, Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d))
      }
    }
    return worst <= Math.max(scale, 1) * 1e-9
  }

  // Section 6.6: invariance under (y, t) -> (-y, -t), or under (x, t) -> (-x, -t).
  symmetries(box, n = 15) {
    const res = { xAxis: this.ok, yAxis: this.ok }
    if (!this.ok) return res
    const scale = this.scaleOf(box)
    const tol = Math.max(scale, 1) * 1e-9
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = box.x0 + (box.x1 - box.x0) * i / n
        const y = box.y0 + (box.y1 - box.y0) * j / n
        const [u, v] = this.F(x, y)
        if (!Number.isFinite(u) || !Number.isFinite(v)) continue
        if (res.xAxis) {
          const [u2, v2] = this.F(x, -y)
          if (!Number.isFinite(u2) || Math.abs(u2 + u) > tol || Math.abs(v2 - v) > tol) res.xAxis = false
        }
        if (res.yAxis) {
          const [u3, v3] = this.F(-x, y)
          if (!Number.isFinite(u3) || Math.abs(u3 - u) > tol || Math.abs(v3 + v) > tol) res.yAxis = false
        }
        if (!res.xAxis && !res.yAxis) return res
      }
    }
    return res
  }

  // The conserved quantity itself, built on a grid by integrating dH = f dy - g dx.
  // Path independence is guaranteed by the zero divergence tested above, so any
  // path does; going along the bottom edge and then up each column is the
  // cheapest one.
  energyGrid(box, n = 190) {
    const nx = n, ny = n
    const dx = (box.x1 - box.x0) / (nx - 1)
    const dy = (box.y1 - box.y0) / (ny - 1)
    const H = new Float64Array(nx * ny)
    let bad = false

    for (let i = 1; i < nx; i++) {
      const xm = box.x0 + (i - 0.5) * dx
      const g = this.g(xm, box.y0)
      H[i * ny] = H[(i - 1) * ny] - (Number.isFinite(g) ? g : 0) * dx
      if (!Number.isFinite(g)) bad = true
    }
    for (let i = 0; i < nx; i++) {
      const x = box.x0 + i * dx
      for (let j = 1; j < ny; j++) {
        const ym = box.y0 + (j - 0.5) * dy
        const f = this.f(x, ym)
        H[i * ny + j] = H[i * ny + j - 1] + (Number.isFinite(f) ? f : 0) * dy
        if (!Number.isFinite(f)) bad = true
      }
    }
    return bad ? null : { H, nx, ny, x0: box.x0, y0: box.y0, dx, dy }
  }

  sampleEnergy(grid, x, y) {
    if (!grid) return NaN
    const fi = (x - grid.x0) / grid.dx
    const fj = (y - grid.y0) / grid.dy
    const i = Math.min(Math.max(Math.floor(fi), 0), grid.nx - 2)
    const j = Math.min(Math.max(Math.floor(fj), 0), grid.ny - 2)
    const tx = fi - i, ty = fj - j
    const h = (a, b) => grid.H[a * grid.ny + b]
    return h(i, j) * (1 - tx) * (1 - ty) + h(i + 1, j) * tx * (1 - ty)
      + h(i, j + 1) * (1 - tx) * ty + h(i + 1, j + 1) * tx * ty
  }
}

export default NLField
