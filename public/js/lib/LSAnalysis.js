// Eigen-analysis and classification of a 2x2 linear system x' = A x, following
// Strogatz, "Nonlinear Dynamics and Chaos", chapter 5: the characteristic
// equation lambda^2 - tau*lambda + Delta = 0, the eigensolutions x = e^{lambda t} v,
// and the (Delta, tau) classification diagram of figure 5.2.8.

// ── Number formatting ──────────────────────────────────────────────────────

export function nf(x, digits = 4) {
  if (!Number.isFinite(x)) return '—'
  if (Math.abs(x) < 5e-11) return '0'
  const r = Number(x.toFixed(digits))
  if (Number.isInteger(r)) return String(r)
  return String(r)
}

// Continued-fraction approximation, used only to print a nicer LaTeX number when
// the value really is a simple fraction (the common case, since the entries are
// typed as things like -1/8).
export function ratio(x, maxDen = 64, tol = 1e-10) {
  if (!Number.isFinite(x)) return null
  const sign = x < 0 ? -1 : 1
  let v = Math.abs(x)
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = v
  for (let i = 0; i < 32; i++) {
    const a = Math.floor(b)
    const nh = a * h1 + h2, nk = a * k1 + k2
    h2 = h1; h1 = nh; k2 = k1; k1 = nk
    if (k1 > maxDen) return null
    if (Math.abs(v - h1 / k1) < tol * Math.max(1, v)) return { num: sign * h1, den: k1 }
    const next = b - a
    if (next < 1e-12) return null
    b = 1 / next
  }
  return null
}

export function texNum(x, digits = 4) {
  if (!Number.isFinite(x)) return '\\text{--}'
  if (Math.abs(x) < 5e-11) return '0'
  if (Math.abs(x - Math.round(x)) < 1e-10) return String(Math.round(x))
  const r = ratio(x)
  if (r && Math.abs(r.den) !== 1 && Math.abs(r.num) < 1000) {
    const sign = r.num < 0 ? '-' : ''
    return `${sign}\\frac{${Math.abs(r.num)}}{${r.den}}`
  }
  return nf(x, digits)
}

export function texVec(v, digits = 4) {
  return `\\begin{pmatrix} ${texNum(v[0], digits)} \\\\ ${texNum(v[1], digits)} \\end{pmatrix}`
}

export function texMatrix(m) {
  return `\\begin{pmatrix} ${m[0]} & ${m[1]} \\\\ ${m[2]} & ${m[3]} \\end{pmatrix}`
}

// Signed term, ready to be appended after another term: 3 -> "+ 3", -3 -> "- 3".
export function texSigned(x) {
  const body = texNum(Math.abs(x))
  return `${x < 0 ? '-' : '+'} ${body}`
}

// ── Vectors ────────────────────────────────────────────────────────────────

function norm(v) { return Math.hypot(v[0], v[1]) }

function orient(v) {
  // Eigenvectors are only defined up to a scalar; pick the representative
  // pointing right (or up, on the vertical line) so the drawing never flips
  // while a parameter is being dragged.
  if (v[0] < -1e-12 || (Math.abs(v[0]) <= 1e-12 && v[1] < 0)) return [-v[0], -v[1]]
  return v
}

// Rescale to the smallest integer pair when the direction is rational, which is
// how the book writes eigenvectors, e.g. (1, -4).
export function prettyVector(v) {
  const n = norm(v)
  if (!Number.isFinite(n) || n < 1e-12) return [0, 0]
  const [x, y] = orient(v)
  const big = Math.abs(x) >= Math.abs(y) ? x : y
  const sx = x / big, sy = y / big
  const rx = ratio(sx, 24), ry = ratio(sy, 24)
  if (rx && ry) {
    const lcm = (rx.den * ry.den) / gcd(rx.den, ry.den)
    let ix = Math.round(rx.num * (lcm / rx.den))
    let iy = Math.round(ry.num * (lcm / ry.den))
    const g = gcd(Math.abs(ix), Math.abs(iy))
    if (g > 1) { ix /= g; iy /= g }
    if (Math.abs(ix) <= 999 && Math.abs(iy) <= 999) return orient([ix, iy])
  }
  return orient([x / n, y / n])
}

function gcd(a, b) {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b))
  while (b) { const t = b; b = a % b; a = t }
  return a || 1
}

export function unit(v) {
  const n = norm(v)
  return n < 1e-12 ? [0, 0] : [v[0] / n, v[1] / n]
}

// ── Eigen data ─────────────────────────────────────────────────────────────

// Null space of (A - lambda I) for a real eigenvalue. The row with the larger
// norm is used, and the eigenvector is taken orthogonal to it, which stays
// stable even when the other row nearly vanishes.
function nullVector(a, b, c, d, lam, eps) {
  const r1 = [a - lam, b]
  const r2 = [c, d - lam]
  const n1 = norm(r1), n2 = norm(r2)
  if (n1 < eps && n2 < eps) return null
  const r = n1 >= n2 ? r1 : r2
  return orient([-r[1], r[0]])
}

// Solves (A - lambda I) w = v for the generalized eigenvector of a degenerate
// node. The matrix has rank 1, so the minimum-norm solution on the row space is
// enough (adding any multiple of v just slides along the eigendirection).
function generalizedVector(a, b, c, d, lam, v) {
  const r1 = [a - lam, b]
  const r2 = [c, d - lam]
  const n1 = norm(r1), n2 = norm(r2)
  const useFirst = n1 >= n2
  const r = useFirst ? r1 : r2
  const rhs = useFirst ? v[0] : v[1]
  const den = r[0] * r[0] + r[1] * r[1]
  if (den < 1e-18) return null
  return [r[0] * (rhs / den), r[1] * (rhs / den)]
}

// ── Classification ─────────────────────────────────────────────────────────

const STABILITY = {
  stable: { attracting: true, liapunov: true },
  neutral: { attracting: false, liapunov: true },
  unstable: { attracting: false, liapunov: false },
}

export function analyze(a, b, c, d) {
  const finite = [a, b, c, d].every(Number.isFinite)
  if (!finite) return { ok: false }

  const scale = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d), 1)
  const epsLin = 1e-9 * scale
  const epsQuad = 1e-9 * scale * scale

  const tau = a + d
  const det = a * d - b * c
  const disc = tau * tau - 4 * det

  const res = {
    ok: true,
    A: [a, b, c, d],
    tau, det, disc,
    zeroMatrix: Math.abs(a) < epsLin && Math.abs(b) < epsLin && Math.abs(c) < epsLin && Math.abs(d) < epsLin,
  }

  // Eigenvalues from equation (5) of section 5.2.
  if (disc > epsQuad) {
    const s = Math.sqrt(disc)
    res.eigenType = 'realDistinct'
    res.l1 = (tau + s) / 2
    res.l2 = (tau - s) / 2
    res.v1 = nullVector(a, b, c, d, res.l1, epsLin)
    res.v2 = nullVector(a, b, c, d, res.l2, epsLin)
  } else if (disc < -epsQuad) {
    res.eigenType = 'complex'
    res.alpha = tau / 2
    res.omega = Math.sqrt(4 * det - tau * tau) / 2
    // v = (b, lambda - a) with lambda = alpha + i*omega.
    res.vRe = [b, res.alpha - a]
    res.vIm = [0, res.omega]
    if (Math.abs(b) < epsLin) {
      // b = 0 cannot happen for complex eigenvalues (b*c < 0), but keep the
      // fallback so a borderline numeric case never renders a zero vector.
      res.vRe = [res.alpha - d, c]
      res.vIm = [res.omega, 0]
    }
  } else {
    res.eigenType = 'realRepeated'
    res.l1 = res.l2 = tau / 2
    const v = nullVector(a, b, c, d, res.l1, epsLin)
    res.v1 = v
    res.eigenspaceDim = v ? 1 : 2
    if (v) res.w = generalizedVector(a, b, c, d, res.l1, v)
  }

  // Rotation sense: the velocity at (1, 0) is (a, c), so the cross product with
  // the radius is exactly c.
  res.ccw = c > 0

  // Classification diagram, figure 5.2.8.
  if (Math.abs(det) <= epsQuad) {
    if (res.zeroMatrix) {
      res.kind = 'planeOfFixedPoints'
      res.stability = 'neutral'
    } else {
      res.kind = 'lineOfFixedPoints'
      res.stability = tau < -epsLin ? 'neutral' : 'unstable'
      res.shear = Math.abs(tau) <= epsLin
      // Nonzero eigenvalue tau, with eigenvalue 0 spanning the line of fixed points.
      res.fixedLine = nullVector(a, b, c, d, 0, epsLin)
    }
  } else if (det < 0) {
    res.kind = 'saddle'
    res.stability = 'unstable'
  } else if (res.eigenType === 'complex') {
    if (Math.abs(tau) <= epsLin) { res.kind = 'center'; res.stability = 'neutral' }
    else if (tau < 0) { res.kind = 'stableSpiral'; res.stability = 'stable' }
    else { res.kind = 'unstableSpiral'; res.stability = 'unstable' }
  } else if (res.eigenType === 'realRepeated') {
    const star = res.eigenspaceDim === 2
    res.kind = (tau < 0 ? 'stable' : 'unstable') + (star ? 'Star' : 'Degenerate')
    res.stability = tau < 0 ? 'stable' : 'unstable'
  } else {
    res.kind = tau < 0 ? 'stableNode' : 'unstableNode'
    res.stability = tau < 0 ? 'stable' : 'unstable'
  }

  Object.assign(res, STABILITY[res.stability])

  // Slow / fast eigendirections and invariant manifolds, the labels the book
  // puts on its phase portraits.
  res.lines = buildLines(res)
  return res
}

function buildLines(r) {
  const lines = []
  if (r.eigenType === 'realDistinct') {
    const pairs = [{ lam: r.l1, v: r.v1 }, { lam: r.l2, v: r.v2 }]
    const slowFirst = Math.abs(r.l1) < Math.abs(r.l2)
    pairs.forEach((p, i) => {
      if (!p.v) return
      const role = r.kind === 'saddle'
        ? (p.lam > 0 ? 'unstableManifold' : 'stableManifold')
        : ((i === 0) === slowFirst ? 'slow' : 'fast')
      lines.push({ lambda: p.lam, v: p.v, role, outward: p.lam > 0 })
    })
  } else if (r.eigenType === 'realRepeated' && r.v1) {
    lines.push({ lambda: r.l1, v: r.v1, role: 'eigendirection', outward: r.l1 > 0 })
  }
  if (r.kind === 'lineOfFixedPoints' && r.fixedLine) {
    lines.push({ lambda: 0, v: r.fixedLine, role: 'fixedLine', outward: false })
  }
  return lines
}

// ── LaTeX for the worked solution ──────────────────────────────────────────

export function texEigenvalues(r) {
  if (r.eigenType === 'complex') {
    const sign = r.alpha === 0 ? '' : ''
    return `\\lambda_{1,2} = ${texNum(r.alpha)} ${sign}\\pm ${texNum(r.omega)}\\,i`
  }
  if (r.eigenType === 'realRepeated') return `\\lambda_1 = \\lambda_2 = ${texNum(r.l1)}`
  return `\\lambda_1 = ${texNum(r.l1)}, \\qquad \\lambda_2 = ${texNum(r.l2)}`
}

export function texGeneralSolution(r) {
  if (r.eigenType === 'realDistinct' && r.v1 && r.v2) {
    return `\\mathbf{x}(t) = c_1 e^{${texNum(r.l1)}t} ${texVec(prettyVector(r.v1))}
      + c_2 e^{${texNum(r.l2)}t} ${texVec(prettyVector(r.v2))}`
  }
  if (r.eigenType === 'complex') {
    const re = texVec(r.vRe), im = texVec(r.vIm)
    const w = texNum(r.omega)
    const decay = Math.abs(r.alpha) < 1e-12 ? '' : `e^{${texNum(r.alpha)}t}`
    return `\\mathbf{x}(t) = ${decay}\\left[
      c_1\\left(\\cos(${w}t)\\,${re} - \\sin(${w}t)\\,${im}\\right)
      + c_2\\left(\\sin(${w}t)\\,${re} + \\cos(${w}t)\\,${im}\\right)\\right]`
  }
  if (r.eigenType === 'realRepeated') {
    const lam = texNum(r.l1)
    if (r.eigenspaceDim === 2) return `\\mathbf{x}(t) = e^{${lam}t}\\,\\mathbf{x}_0`
    if (r.v1 && r.w) {
      return `\\mathbf{x}(t) = c_1 e^{${lam}t} ${texVec(prettyVector(r.v1))}
        + c_2 e^{${lam}t}\\left(t\\,${texVec(prettyVector(r.v1))} + ${texVec(r.w)}\\right)`
    }
  }
  return ''
}

export default { analyze, texNum, texVec, texMatrix, texSigned, texEigenvalues, texGeneralSolution, prettyVector, unit, nf, ratio }
