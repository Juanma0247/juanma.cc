// Equation engine of the Física Mecánica project.
//
// Every model (the kinematic invariant, the circular-motion relations, the
// component equations of a free-body diagram) is written as a short list of
// equations in a tiny language, e.g. "dx = v0*t + 1/2*a*t^2". Given whichever
// variables the statement supplies, `solve` repeatedly looks for an equation in
// which only one quantity is still unknown, isolates it symbolically, substitutes
// the numbers and records the step, exactly as one would on paper. When no such
// equation is left it looks for a small linear system (two tensions and an
// acceleration, say) and solves it by substitution. Quadratics keep both roots,
// discard the ones that make no physical sense (a negative time, a negative
// mass) and, when two roots survive, split the solution into branches.

import { clean, texNum, unitTex, fromSI } from './core.js'

// ── Parsing ─────────────────────────────────────────────────────────────────

const FNS = ['sin', 'cos', 'tan']

function tokenize(src) {
  const out = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) { i++; continue }
    if (/[0-9.]/.test(ch)) {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      out.push({ type: 'num', value: Number(src.slice(i, j)) })
      i = j
      continue
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++
      out.push({ type: 'id', text: src.slice(i, j) })
      i = j
      continue
    }
    if ('+-*/^()='.includes(ch)) { out.push({ type: ch }); i++; continue }
    throw new Error(`algebra: bad char "${ch}" in ${src}`)
  }
  return out
}

function parseSide(tokens, start, stop) {
  const terms = []
  let pos = start
  let sign = 1
  if (tokens[pos] && (tokens[pos].type === '+' || tokens[pos].type === '-')) {
    sign = tokens[pos].type === '-' ? -1 : 1
    pos++
  }
  while (pos < stop) {
    const term = { s: sign, n: 1, d: 1, pi: 0, f: [] }
    let op = '*'
    for (;;) {
      pos = parseFactor(tokens, pos, term, op)
      const tok = tokens[pos]
      if (tok && (tok.type === '*' || tok.type === '/') && pos < stop) { op = tok.type; pos++; continue }
      break
    }
    terms.push(normalizeTerm(term))
    const tok = tokens[pos]
    if (pos >= stop) break
    if (tok.type === '+' || tok.type === '-') { sign = tok.type === '-' ? -1 : 1; pos++; continue }
    throw new Error('algebra: unexpected token')
  }
  return terms
}

function parseFactor(tokens, pos, term, op) {
  const tok = tokens[pos]
  const inv = op === '/'
  if (tok.type === 'num') {
    if (inv) term.d *= tok.value
    else term.n *= tok.value
    return pos + 1
  }
  if (tok.type === 'id' && tok.text === 'pi') {
    term.pi += inv ? -1 : 1
    return pos + 1
  }
  if (tok.type === 'id' && FNS.includes(tok.text)) {
    const arg = tokens[pos + 2].text
    pos += 4
    let p = 1
    if (tokens[pos] && tokens[pos].type === '^') { [p, pos] = readPower(tokens, pos + 1) }
    term.f.push({ v: arg, fn: tok.text, p: inv ? -p : p })
    return pos
  }
  if (tok.type === 'id') {
    pos += 1
    let p = 1
    if (tokens[pos] && tokens[pos].type === '^') { [p, pos] = readPower(tokens, pos + 1) }
    term.f.push({ v: tok.text, p: inv ? -p : p })
    return pos
  }
  throw new Error('algebra: bad factor')
}

function readPower(tokens, pos) {
  let s = 1
  if (tokens[pos].type === '-') { s = -1; pos++ }
  return [s * tokens[pos].value, pos + 1]
}

function normalizeTerm(term) {
  const merged = []
  for (const f of term.f) {
    const same = merged.find(m => m.v === f.v && (m.fn || '') === (f.fn || ''))
    if (same) same.p += f.p
    else merged.push({ ...f })
  }
  term.f = merged.filter(f => f.p !== 0)
  return term
}

// eq('k1', 'v = v0 + a*t', { tex: '…' })
export function eq(id, src, opts = {}) {
  const tokens = tokenize(src)
  const at = tokens.findIndex(tk => tk.type === '=')
  const L = parseSide(tokens, 0, at)
  const R = parseSide(tokens, at + 1, tokens.length)
  return { id, src, L, R, ...opts }
}

export function varsOf(e) {
  const s = new Set()
  for (const term of [...e.L, ...e.R]) for (const f of term.f) s.add(f.v)
  return [...s]
}

// ── Evaluation ──────────────────────────────────────────────────────────────

const coefOf = term => term.s * (term.n / term.d) * Math.PI ** term.pi

function factorValue(f, x) {
  const base = f.fn ? Math[f.fn](x) : x
  return base ** f.p
}

function termValue(term, values) {
  let v = coefOf(term)
  for (const f of term.f) v *= factorValue(f, values[f.v])
  return v
}

export function residual(e, values) {
  let l = 0
  let r = 0
  let scale = 0
  for (const term of e.L) { const v = termValue(term, values); l += v; scale = Math.max(scale, Math.abs(v)) }
  for (const term of e.R) { const v = termValue(term, values); r += v; scale = Math.max(scale, Math.abs(v)) }
  return { res: l - r, scale, l, r }
}

// ── TeX ─────────────────────────────────────────────────────────────────────

function fracTex(n, d) {
  return d === 1 ? texNum(n) : `\\tfrac{${texNum(n)}}{${texNum(d)}}`
}

function factorSym(f, vars, absPow = false) {
  const vt = vars[f.v]?.tex ?? f.v
  const p = absPow ? Math.abs(f.p) : f.p
  if (f.fn) {
    const fn = `\\${f.fn}`
    return p === 1 ? `${fn}${needsSpace(vt)}${vt}` : `${fn}^{${p}}${needsSpace(vt)}${vt}`
  }
  if (p === 1) return vt
  return `${wrapPow(vt)}^{${p}}`
}

const needsSpace = vt => (/^[A-Za-z]/.test(vt) ? ' ' : '')
const wrapPow = vt => (/[_^]/.test(vt) && !/^\{/.test(vt) ? `{${vt}}` : vt)

// The value printed in place of a symbol, with its unit, in SI.
function factorNum(f, vars, values, withUnits) {
  const spec = vars[f.v] || {}
  const x = values[f.v]
  const p = Math.abs(f.p)
  if (f.fn) {
    const arg = spec.dim === 'angle' ? `${texNum(x * 180 / Math.PI)}^\\circ` : texNum(x)
    const fn = `\\${f.fn}`
    return p === 1 ? `${fn}(${arg})` : `${fn}^{${p}}(${arg})`
  }
  const u = withUnits && spec.dim ? unitTex(spec.dim, siUnit(spec.dim)) : ''
  const inner = u ? `${texNum(x)}\\,${u}` : texNum(x)
  const wrapped = `(${inner})`
  return p === 1 ? wrapped : `${wrapped}^{${p}}`
}

const siUnit = dim => (dim === 'angle' ? 'rad' : undefined)

// Renders a single term without its sign. `known` decides which symbols are
// replaced by numbers when `values` is given.
function termTex(term, vars, values = null, known = null, withUnits = true) {
  const num = []
  const den = []
  const sub = f => values && known && known.has(f.v)
  for (const f of term.f) {
    const piece = sub(f) ? factorNum(f, vars, values, withUnits) : factorSym(f, vars, true)
    if (f.p > 0) num.push(piece)
    else den.push(piece)
  }
  const n = term.n
  const d = term.d
  const piNum = term.pi > 0 ? (term.pi === 1 ? '\\pi' : `\\pi^{${term.pi}}`) : ''
  const piDen = term.pi < 0 ? (term.pi === -1 ? '\\pi' : `\\pi^{${-term.pi}}`) : ''
  const joinNum = parts => parts.join(values ? '' : '\\,')
  if (!den.length && !piDen) {
    const body = joinNum([piNum, ...num].filter(Boolean))
    if (d !== 1) {
      const c = `\\tfrac{${texNum(n)}}{${texNum(d)}}`
      return body ? `${c}${values ? '' : '\\,'}${body}` : c
    }
    if (n === 1) return body || '1'
    return body ? `${texNum(n)}${body}` : texNum(n)
  }
  const top = joinNum([n !== 1 ? texNum(n) : '', piNum, ...num].filter(Boolean)) || '1'
  const bottom = joinNum([d !== 1 ? texNum(d) : '', piDen, ...den].filter(Boolean))
  return `\\frac{${top}}{${bottom}}`
}

export function sumTex(terms, vars, values = null, known = null, withUnits = true) {
  if (!terms.length) return '0'
  return terms.map((term, i) => {
    const body = termTex(term, vars, values, known, withUnits)
    if (i === 0) return term.s < 0 ? `-${body}` : body
    return term.s < 0 ? ` - ${body}` : ` + ${body}`
  }).join('')
}

export function eqTex(e, vars) {
  if (e.tex) return e.tex
  return `${sumTex(e.L, vars)} = ${sumTex(e.R, vars)}`
}

export function eqTexNum(e, vars, values, known) {
  return `${sumTex(e.L, vars, values, known)} = ${sumTex(e.R, vars, values, known)}`
}

// ── Single-unknown isolation ────────────────────────────────────────────────

function strip(term, u) {
  return { ...term, f: term.f.filter(f => f.v !== u) }
}

const flip = term => ({ ...term, s: -term.s })

function classify(e, u) {
  const all = [...e.L, ...e.R.map(flip)]
  const constant = []
  const groups = new Map()
  for (const term of all) {
    const occ = term.f.filter(f => f.v === u)
    if (!occ.length) { constant.push(term); continue }
    if (occ.length > 1) return { kind: 'mixed', all }
    const key = `${occ[0].fn || ''}|${occ[0].p}`
    if (!groups.has(key)) groups.set(key, { fn: occ[0].fn || '', p: occ[0].p, terms: [] })
    groups.get(key).terms.push(strip(term, u))
  }
  const keys = [...groups.values()]
  const fns = new Set(keys.map(k => k.fn))
  if (fns.size > 1) return { kind: 'mixed', all }
  const fn = keys[0]?.fn || ''
  const powers = keys.map(k => k.p).sort((a, b) => a - b)
  const byPow = p => keys.find(k => k.p === p)?.terms ?? []
  if (powers.length === 1) return { kind: 'power', fn, p: powers[0], coef: byPow(powers[0]), constant, all }
  if (powers.length === 2 && powers[0] === 1 && powers[1] === 2) {
    return { kind: 'quadratic', fn, A: byPow(2), B: byPow(1), C: constant, all }
  }
  return { kind: 'mixed', all }
}

const sumValue = (terms, values) => terms.reduce((acc, term) => acc + termValue(term, values), 0)

function inverseFn(fn, x) {
  if (!fn) return [x]
  if (fn === 'sin') {
    if (Math.abs(x) > 1 + 1e-9) return []
    const a = Math.asin(Math.max(-1, Math.min(1, x)))
    return [a, Math.PI - a]
  }
  if (fn === 'cos') {
    if (Math.abs(x) > 1 + 1e-9) return []
    const a = Math.acos(Math.max(-1, Math.min(1, x)))
    return [a, -a]
  }
  if (fn === 'tan') {
    const a = Math.atan(x)
    return [a, a + Math.PI, a - Math.PI]
  }
  return [x]
}

function inDomain(spec, x) {
  if (!Number.isFinite(x)) return false
  const [lo, hi] = spec?.range ?? [-Infinity, Infinity]
  const tol = 1e-9 * Math.max(1, Math.abs(x))
  if (x < lo - tol || x > hi + tol) return false
  if (spec?.nonzero && Math.abs(x) < 1e-12) return false
  return true
}

function uniqueRoots(xs) {
  const out = []
  for (const x of xs) {
    const c = clean(x)
    if (!out.some(y => Math.abs(y - c) <= 1e-9 * Math.max(1, Math.abs(c)))) out.push(c)
  }
  return out
}

// Isolates u. Returns { method, roots, sym, num, extra } where sym/num are the
// TeX lines of the derivation.
function isolate(e, u, vars, values, known) {
  const c = classify(e, u)
  const spec = vars[u]
  const ut = vars[u]?.tex ?? u

  if (c.kind === 'power') {
    const Bv = sumValue(c.coef, values)
    const Kv = sumValue(c.constant, values)
    if (Math.abs(Bv) < 1e-14) return { method: 'degenerate', roots: [] }
    const X = -Kv / Bv
    const head = powHead(ut, c.fn, c.p)
    const { symFrac, numFrac } = fracParts(c.constant, c.coef, vars, values, known)
    let base = []
    if (c.p === 1) base = [X]
    else if (Number.isInteger(c.p) && c.p % 2 === 0) {
      if (X < -1e-12) return { method: 'noReal', roots: [], sym: `${head} = ${symFrac}`, num: `${head} = ${numFrac} = ${texNum(X)}` }
      const r = Math.abs(X) ** (1 / c.p)
      base = [r, -r]
    } else base = [Math.sign(X) * Math.abs(X) ** (1 / c.p)]
    const roots = uniqueRoots(base.flatMap(x => inverseFn(c.fn, x)))
    const method = c.fn ? 'inverse' : (c.p === 1 ? 'linear' : 'root')
    return {
      method, fn: c.fn, p: c.p, X,
      roots: roots.filter(x => inDomain(spec, x)),
      rejected: roots.filter(x => !inDomain(spec, x)),
      head, sym: `${head} = ${symFrac}`, num: `${head} = ${numFrac} = ${texNum(X)}`,
    }
  }

  if (c.kind === 'quadratic') {
    const A = sumValue(c.A, values)
    const B = sumValue(c.B, values)
    const C = sumValue(c.C, values)
    const X = powHead(ut, c.fn, 1)
    const X2 = powHead(ut, c.fn, 2)
    const sym = `${sumTex(c.all, vars)} = 0`
    const num = `(${texNum(A)})\\,${X2} + (${texNum(B)})\\,${X} + (${texNum(C)}) = 0`
    let base = []
    let disc = B * B - 4 * A * C
    if (Math.abs(A) < 1e-14) base = Math.abs(B) < 1e-14 ? [] : [-C / B]
    else if (disc < -1e-12 * Math.max(1, B * B)) base = []
    else {
      disc = Math.max(0, disc)
      base = [(-B + Math.sqrt(disc)) / (2 * A), (-B - Math.sqrt(disc)) / (2 * A)]
    }
    const roots = uniqueRoots(base.flatMap(x => inverseFn(c.fn, x)))
    const formula = `${X} = \\frac{-B \\pm \\sqrt{B^2 - 4AC}}{2A} = \\frac{-${texNumParenS(B)} \\pm \\sqrt{${texNumParenS(B)}^2 - 4${texNumParenS(A)}${texNumParenS(C)}}}{2${texNumParenS(A)}}`
    return {
      method: 'quadratic', fn: c.fn, A, B, C, disc, base: uniqueRoots(base),
      roots: roots.filter(x => inDomain(spec, x)),
      rejected: roots.filter(x => !inDomain(spec, x)),
      sym, num, formula, head: X,
    }
  }

  // Anything else (θ inside both a sine and a cosine, say) is solved by scanning
  // the residual for sign changes and refining each one by bisection.
  const f = x => {
    const vals = { ...values, [u]: x }
    return residual(e, vals).res
  }
  const [lo, hi] = numericRange(spec)
  const roots = scanRoots(f, lo, hi).filter(x => inDomain(spec, x))
  return { method: 'numeric', roots, sym: `${sumTex(c.all, vars)} = 0`, num: '' }
}

const texNumParenS = x => (x < 0 ? `(${texNum(x)})` : texNum(x))

function powHead(ut, fn, p) {
  if (fn) {
    const f = `\\${fn}`
    if (p === 1) return `${f}${needsSpace(ut)}${ut}`
    if (p > 0) return `${f}^{${p}}${needsSpace(ut)}${ut}`
    return `\\frac{1}{${f}^{${-p}}${needsSpace(ut)}${ut}}`
  }
  if (p === 1) return ut
  if (p > 0) return `${wrapPow(ut)}^{${p}}`
  return p === -1 ? `\\frac{1}{${ut}}` : `\\frac{1}{${wrapPow(ut)}^{${-p}}}`
}

function fracParts(constant, coef, vars, values, known) {
  // u·B + K = 0  ⇒  u = −K / B, written with the signs tidied up.
  let top = constant.map(flip)
  let bottom = coef.slice()
  if (bottom.length && bottom.every(term => term.s < 0)) {
    top = top.map(flip)
    bottom = bottom.map(flip)
  }
  top = leadPositive(top)
  const oneDen = bottom.length === 1 && !bottom[0].f.length && bottom[0].n === 1 && bottom[0].d === 1 && bottom[0].pi === 0
  const fr = (a, b) => (oneDen ? a : `\\frac{${a}}{${b}}`)
  const symFrac = fr(sumTex(top, vars), sumTex(bottom, vars))
  const numFrac = fr(sumTex(top, vars, values, known), sumTex(bottom, vars, values, known))
  return { symFrac, numFrac }
}

function leadPositive(terms) {
  if (!terms.length || terms[0].s > 0) return terms
  const i = terms.findIndex(term => term.s > 0)
  if (i <= 0) return terms
  const out = terms.slice()
  out.unshift(out.splice(i, 1)[0])
  return out
}

function numericRange(spec) {
  const [lo, hi] = spec?.range ?? [-1e6, 1e6]
  return [Number.isFinite(lo) ? lo : -1e6, Number.isFinite(hi) ? hi : 1e6]
}

function scanRoots(f, lo, hi) {
  const N = 4000
  const pts = []
  // Log-spaced samples resolve both 0.01 and 10⁵ on a wide positive range.
  if (lo >= 0 && hi / Math.max(lo, 1e-6) > 1e4) {
    const a = Math.log(Math.max(lo, 1e-6))
    const b = Math.log(hi)
    if (lo === 0) pts.push(0)
    for (let i = 0; i <= N; i++) pts.push(Math.exp(a + (b - a) * i / N))
  } else {
    for (let i = 0; i <= N; i++) pts.push(lo + (hi - lo) * i / N)
  }
  const roots = []
  let px = pts[0]
  let pf = f(px)
  for (let i = 1; i < pts.length; i++) {
    const x = pts[i]
    const fx = f(x)
    if (Number.isFinite(pf) && Number.isFinite(fx)) {
      if (pf === 0) roots.push(px)
      else if (pf * fx < 0) roots.push(bisect(f, px, x, pf))
    }
    px = x
    pf = fx
  }
  return uniqueRoots(roots)
}

function bisect(f, a, b, fa) {
  for (let i = 0; i < 80; i++) {
    const m = (a + b) / 2
    const fm = f(m)
    if (fm === 0) return m
    if (fa * fm < 0) b = m
    else { a = m; fa = fm }
  }
  return (a + b) / 2
}

// ── Linear systems ──────────────────────────────────────────────────────────

function linearRow(e, unknowns, values) {
  const all = [...e.L, ...e.R.map(flip)]
  const coef = Object.fromEntries(unknowns.map(u => [u, 0]))
  let rhs = 0
  for (const term of all) {
    const occ = term.f.filter(f => unknowns.includes(f.v))
    if (!occ.length) { rhs -= termValue(term, values); continue }
    if (occ.length > 1 || occ[0].p !== 1 || occ[0].fn) return null
    coef[occ[0].v] += termValue(strip(term, occ[0].v), values)
  }
  return { coef, rhs }
}

function solveLinearSystem(rows, unknowns) {
  // Substitution, recorded step by step so it can be printed.
  const work = rows.map(r => ({ coef: { ...r.coef }, rhs: r.rhs, eqId: r.eqId }))
  const order = []
  const used = new Set()
  const log = []
  for (let k = 0; k < unknowns.length; k++) {
    const remaining = unknowns.filter(u => !order.some(o => o.u === u))
    let best = null
    for (const [ri, row] of work.entries()) {
      if (used.has(ri)) continue
      for (const u of remaining) {
        const c = row.coef[u]
        if (Math.abs(c) < 1e-12) continue
        const others = remaining.filter(x => x !== u && Math.abs(row.coef[x]) > 1e-12).length
        const score = others * 10 + (Math.abs(Math.abs(c) - 1) < 1e-9 ? 0 : 1)
        if (!best || score < best.score) best = { ri, u, score }
      }
    }
    if (!best) return null
    used.add(best.ri)
    const row = work[best.ri]
    const c = row.coef[best.u]
    const expr = { u: best.u, rhs: row.rhs / c, coef: {} }
    for (const x of remaining) if (x !== best.u && Math.abs(row.coef[x]) > 1e-12) expr.coef[x] = -row.coef[x] / c
    order.push(expr)
    log.push({ type: 'express', ri: best.ri, eqId: row.eqId, u: best.u, expr: { ...expr, coef: { ...expr.coef } } })
    for (const [rj, other] of work.entries()) {
      if (used.has(rj)) continue
      const k2 = other.coef[best.u]
      if (Math.abs(k2) < 1e-14) continue
      other.rhs -= k2 * expr.rhs
      for (const [x, cx] of Object.entries(expr.coef)) other.coef[x] += k2 * cx
      other.coef[best.u] = 0
      log.push({ type: 'substitute', rj, eqId: other.eqId, u: best.u, row: { coef: { ...other.coef }, rhs: other.rhs } })
    }
  }
  const sol = {}
  for (let i = order.length - 1; i >= 0; i--) {
    const ex = order[i]
    let v = ex.rhs
    for (const [x, cx] of Object.entries(ex.coef)) v += cx * sol[x]
    sol[ex.u] = clean(v)
  }
  for (const u of unknowns) if (!Number.isFinite(sol[u])) return null
  return { sol, order, log }
}

function combinations(arr, k) {
  const out = []
  const rec = (start, acc) => {
    if (acc.length === k) { out.push(acc.slice()); return }
    for (let i = start; i < arr.length; i++) { acc.push(arr[i]); rec(i + 1, acc); acc.pop() }
  }
  rec(0, [])
  return out
}

// ── Solver ──────────────────────────────────────────────────────────────────

const METHOD_RANK = { linear: 0, inverse: 1, root: 2, quadratic: 3, numeric: 6 }

// system = { vars: {name: spec}, eqs: [eq…] }
// given  = { name: valueSI } for every quantity the statement supplies.
export function solve(system, given, opts = {}) {
  const { vars, eqs } = system
  const maxBranches = opts.maxBranches ?? 4
  const relevant = new Set(eqs.flatMap(varsOf))
  const start = {
    values: { ...given },
    known: new Set(Object.keys(given)),
    derived: new Set(),
    steps: [],
    fail: null,
    label: [],
  }
  const done = []
  const queue = [start]
  while (queue.length) {
    const br = queue.shift()
    const split = advance(br, system, relevant)
    if (split) {
      for (const b of split) {
        if (queue.length + done.length + 1 < maxBranches + 2) queue.push(b)
      }
      continue
    }
    done.push(br)
  }
  for (const br of done) {
    br.unresolved = [...relevant].filter(v => !br.known.has(v))
    br.inconsistent = []
    if (!br.fail) {
      for (const e of eqs) {
        const vs = varsOf(e)
        if (!vs.every(v => br.known.has(v))) continue
        const { res, scale } = residual(e, br.values)
        if (Math.abs(res) > 1e-6 * Math.max(scale, 1e-9) + 1e-9) br.inconsistent.push({ eqId: e.id, res })
      }
    }
  }
  // Branches born from a split that turn out inconsistent are discarded; the
  // original data, if inconsistent itself, is reported as such.
  let branches = done.filter(b => !b.fail && (!b.inconsistent.length || !b.label.length))
  if (!branches.length) branches = done.slice(0, 1)
  return { branches, vars, eqs }
}

function advance(br, system, relevant) {
  const { vars, eqs } = system
  for (;;) {
    if (br.fail) return null
    const unknown = [...relevant].filter(v => !br.known.has(v))
    if (!unknown.length) return null

    let best = null
    for (const [idx, e] of eqs.entries()) {
      const vs = varsOf(e)
      const miss = vs.filter(v => !br.known.has(v))
      if (miss.length !== 1) continue
      const u = miss[0]
      const iso = isolate(e, u, vars, br.values, br.known)
      if (iso.method === 'degenerate') continue
      const derivedUsed = vs.filter(v => v !== u && br.derived.has(v)).length
      const score = (METHOD_RANK[iso.method] ?? 5) + 0.1 * derivedUsed + 0.001 * idx
      if (!best || score < best.score) best = { score, e, u, iso }
    }

    if (best) {
      const { e, u, iso } = best
      const step = {
        type: 'single', unknown: u, eqId: e.id, eq: e, iso,
        inputs: varsOf(e).filter(v => v !== u),
        values: { ...br.values },
        known: new Set(br.known),
      }
      if (!iso.roots.length) {
        br.steps.push(step)
        br.fail = { unknown: u, eqId: e.id, iso }
        return null
      }
      if (iso.roots.length > 1) {
        return iso.roots.map((root, i) => {
          const nb = cloneBranch(br)
          nb.steps.push({ ...step, value: root, choice: i, of: iso.roots.length })
          nb.values[u] = root
          nb.known.add(u)
          nb.derived.add(u)
          nb.label.push({ u, i, value: root })
          return nb
        })
      }
      step.value = iso.roots[0]
      br.steps.push(step)
      br.values[u] = iso.roots[0]
      br.known.add(u)
      br.derived.add(u)
      continue
    }

    const sys = findLinearSubsystem(br, system, unknown)
    if (sys) {
      br.steps.push(sys.step)
      for (const [u, v] of Object.entries(sys.sol)) {
        br.values[u] = v
        br.known.add(u)
        br.derived.add(u)
      }
      continue
    }
    return null
  }
}

function findLinearSubsystem(br, system, unknown) {
  const { vars, eqs } = system
  const candidates = eqs.filter(e => {
    const miss = varsOf(e).filter(v => !br.known.has(v))
    return miss.length >= 2 && miss.length <= 4
  })
  for (let k = 2; k <= 4; k++) {
    for (const us of combinations(unknown, k)) {
      const fitting = candidates.filter(e => varsOf(e).filter(v => !br.known.has(v)).every(v => us.includes(v)))
      if (fitting.length < k) continue
      for (const group of combinations(fitting, k)) {
        const rows = []
        for (const e of group) {
          const r = linearRow(e, us, br.values)
          if (!r) break
          rows.push({ ...r, eqId: e.id, eq: e })
        }
        if (rows.length !== k) continue
        const res = solveLinearSystem(rows, us)
        if (!res) continue
        const bad = us.find(u => !inDomain(vars[u], res.sol[u]))
        if (bad) {
          br.fail = { unknown: bad, system: true, value: res.sol[bad] }
        }
        return {
          sol: res.sol,
          step: {
            type: 'system', unknowns: us, eqIds: group.map(e => e.id), eqs: group,
            rows, log: res.log, sol: res.sol,
            values: { ...br.values }, known: new Set(br.known),
            failed: bad ?? null,
          },
        }
      }
    }
  }
  return null
}

function cloneBranch(br) {
  return {
    values: { ...br.values },
    known: new Set(br.known),
    derived: new Set(br.derived),
    steps: br.steps.slice(),
    fail: null,
    label: br.label.slice(),
  }
}

// ── Row helpers for printing linear systems ─────────────────────────────────

export function rowTex(coef, rhs, vars) {
  const parts = []
  for (const [u, c] of Object.entries(coef)) {
    if (Math.abs(c) < 1e-12) continue
    const ut = vars[u]?.tex ?? u
    const mag = Math.abs(c)
    const cTex = Math.abs(mag - 1) < 1e-12 ? '' : texNum(mag)
    const sign = c < 0 ? (parts.length ? ' - ' : '-') : (parts.length ? ' + ' : '')
    parts.push(`${sign}${cTex}${cTex ? '\\,' : ''}${ut}`)
  }
  return `${parts.join('') || '0'} = ${texNum(rhs)}`
}

export function exprTex(expr, vars) {
  const ut = vars[expr.u]?.tex ?? expr.u
  const parts = [texNum(expr.rhs)]
  for (const [x, c] of Object.entries(expr.coef)) {
    const xt = vars[x]?.tex ?? x
    const mag = Math.abs(c)
    const cTex = Math.abs(mag - 1) < 1e-12 ? '' : texNum(mag)
    parts.push(`${c < 0 ? ' - ' : ' + '}${cTex}${cTex ? '\\,' : ''}${xt}`)
  }
  return `${ut} = ${parts.join('')}`
}

// SI value of a variable printed with its unit.
export function valueTex(name, value, vars, unitId) {
  const spec = vars[name] || {}
  const dim = spec.dim
  if (!dim) return texNum(value)
  const id = unitId ?? spec.unit
  if (dim === 'angle' && (!id || id === 'deg')) return `${texNum(value * 180 / Math.PI)}^\\circ`
  const u = unitTex(dim, id)
  const n = texNum(fromSI(value, dim, id))
  return u ? (u.startsWith('^') ? `${n}${u}` : `${n}\\,${u}`) : n
}
