// Symbolic layer for the Nonlinear Systems page (Strogatz, chapter 6).
//
// The parser of LSExpr already turns a typed entry into a syntax tree; what the
// phase plane needs on top of it is the partial derivatives that build the
// Jacobian of section 6.3, a simplifier that keeps the printed matrix readable,
// and a closure compiler, since the portrait evaluates the field hundreds of
// thousands of times per redraw and walking the tree with a switch is too slow.

import { parseExpr, toTex } from '/js/lib/LSExpr.js'

const CONSTANTS = { pi: Math.PI, 'π': Math.PI, e: Math.E }

const FUNCTIONS = {
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp,
  ln: Math.log, log: Math.log10, log10: Math.log10,
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  sign: Math.sign, floor: Math.floor, ceil: Math.ceil, round: Math.round,
}

// ── Node constructors ──────────────────────────────────────────────────────

// A negative literal is built as -(positive) so that toTex can parenthesise it
// by precedence; a bare "-3" would print as "2 \cdot -3".
export function num(v) {
  const r = Number(Number(v).toPrecision(12))
  if (r < 0) return { kind: 'neg', operand: { kind: 'num', value: -r, text: String(-r) } }
  return { kind: 'num', value: r, text: String(r) }
}

const bin = (op, left, right, implicit = false) => ({ kind: 'bin', op, left, right, implicit })
const neg = operand => ({ kind: 'neg', operand })
const call = (name, arg) => ({ kind: 'call', name, arg })

const ZERO = num(0)
const ONE = num(1)

// Numeric value of a literal, or null for anything else. Constants are left
// alone so that pi keeps printing as pi instead of 3.1416.
function asNum(n) {
  if (!n) return null
  if (n.kind === 'num') return n.value
  if (n.kind === 'neg' && n.operand.kind === 'num') return -n.operand.value
  return null
}

const isZero = n => asNum(n) === 0

// ── Differentiation ────────────────────────────────────────────────────────

// Derivative of the outer function of a call, evaluated at its own argument.
function dOuter(node) {
  const u = node.arg
  switch (node.name) {
    case 'sqrt': return bin('/', ONE, bin('*', num(2), node))
    case 'cbrt': return bin('/', ONE, bin('*', num(3), bin('^', node, num(2))))
    case 'abs': return call('sign', u)
    case 'exp': return node
    case 'ln': return bin('/', ONE, u)
    case 'log': case 'log10': return bin('/', ONE, bin('*', u, num(Math.LN10)))
    case 'sin': return call('cos', u)
    case 'cos': return neg(call('sin', u))
    case 'tan': return bin('+', ONE, bin('^', call('tan', u), num(2)))
    case 'asin': return bin('/', ONE, call('sqrt', bin('-', ONE, bin('^', u, num(2)))))
    case 'acos': return neg(bin('/', ONE, call('sqrt', bin('-', ONE, bin('^', u, num(2))))))
    case 'atan': return bin('/', ONE, bin('+', ONE, bin('^', u, num(2))))
    case 'sinh': return call('cosh', u)
    case 'cosh': return call('sinh', u)
    case 'tanh': return bin('-', ONE, bin('^', call('tanh', u), num(2)))
    default: return ZERO
  }
}

function diff(node, v) {
  switch (node.kind) {
    case 'num': case 'const': return ZERO
    case 'var': return node.name === v ? ONE : ZERO
    case 'group': return diff(node.operand, v)
    case 'neg': return neg(diff(node.operand, v))
    case 'call': return bin('*', dOuter(node), diff(node.arg, v))
    case 'bin': {
      const { op, left: l, right: r } = node
      const dl = diff(l, v), dr = diff(r, v)
      if (op === '+') return bin('+', dl, dr)
      if (op === '-') return bin('-', dl, dr)
      if (op === '*') return bin('+', bin('*', dl, r), bin('*', l, dr))
      if (op === '/') return bin('/', bin('-', bin('*', dl, r), bin('*', l, dr)), bin('^', r, num(2)))
      // Power rule when the exponent does not depend on v, the general
      // u^w (w' ln u + w u'/u) otherwise.
      if (isZero(simplify(dr))) {
        return bin('*', bin('*', r, bin('^', l, bin('-', r, ONE))), dl)
      }
      return bin('*', node, bin('+', bin('*', dr, call('ln', l)), bin('/', bin('*', r, dl), l)))
    }
    default: return ZERO
  }
}

export function derivative(node, v) {
  return collect(simplify(diff(node, v)))
}

// ── Simplification ─────────────────────────────────────────────────────────

function simplify(n) {
  switch (n.kind) {
    case 'group': return simplify(n.operand)
    case 'neg': {
      const a = simplify(n.operand)
      const v = asNum(a)
      if (v !== null) return num(-v)
      if (a.kind === 'neg') return a.operand
      return neg(a)
    }
    case 'call': {
      const a = simplify(n.arg)
      const v = asNum(a)
      if (v !== null && FUNCTIONS[n.name]) {
        const out = FUNCTIONS[n.name](v)
        if (Number.isFinite(out) && Math.abs(out - Math.round(out)) < 1e-12) return num(Math.round(out))
      }
      return call(n.name, a)
    }
    case 'bin': return simplifyBin(n)
    default: return n
  }
}

function simplifyBin(n) {
  const l = simplify(n.left)
  const r = simplify(n.right)
  const a = asNum(l), b = asNum(r)

  switch (n.op) {
    case '+':
      if (b === 0) return l
      if (a === 0) return r
      if (a !== null && b !== null) return num(a + b)
      if (r.kind === 'neg') return bin('-', l, r.operand)
      if (b !== null && b < 0) return bin('-', l, num(-b))
      return bin('+', l, r)
    case '-':
      if (b === 0) return l
      if (a === 0) return simplify(neg(r))
      if (a !== null && b !== null) return num(a - b)
      if (r.kind === 'neg') return bin('+', l, r.operand)
      if (b !== null && b < 0) return bin('+', l, num(-b))
      return bin('-', l, r)
    case '*': {
      if (a === 0 || b === 0) return ZERO
      if (a === 1) return r
      if (b === 1) return l
      if (a === -1) return simplify(neg(r))
      if (b === -1) return simplify(neg(l))
      if (a !== null && b !== null) return num(a * b)
      // Numbers to the front, and never a dot: 2x(x+y) reads the way the book
      // writes it, and a product of two numbers has been folded away already.
      if (b !== null && a === null) return bin('*', r, l, true)
      return bin('*', l, r, true)
    }
    case '/': {
      if (a === 0) return ZERO
      if (b === 1) return l
      if (b === -1) return simplify(neg(l))
      // Only fold when the quotient stays exact; 1/3 is clearer as a fraction.
      if (a !== null && b !== null && b !== 0 && Number.isInteger(a / b)) return num(a / b)
      return bin('/', l, r)
    }
    default: {
      if (b === 0) return ONE
      if (b === 1) return l
      if (a === 1) return ONE
      if (a !== null && b !== null) {
        const p = Math.pow(a, b)
        if (Number.isFinite(p) && Math.abs(p - Math.round(p)) < 1e-12) return num(Math.round(p))
      }
      return bin('^', l, r)
    }
  }
}

// ── Collecting like terms ──────────────────────────────────────────────────

// Differentiating a product leaves sums such as 3 - x - 2y - x, which is correct
// but not how anyone writes a Jacobian. The terms of every sum are flattened,
// grouped by their symbolic part and added back up.

function flatten(n, sign, out) {
  if (n.kind === 'bin' && (n.op === '+' || n.op === '-')) {
    flatten(n.left, sign, out)
    flatten(n.right, n.op === '-' ? -sign : sign, out)
    return out
  }
  if (n.kind === 'neg') return flatten(n.operand, -sign, out)
  out.push({ sign, node: n })
  return out
}

// Splits a term into a numeric coefficient and the rest of it.
function split(node) {
  const v = asNum(node)
  if (v !== null) return { coef: v, rest: null }
  if (node.kind === 'neg') {
    const inner = split(node.operand)
    return { coef: -inner.coef, rest: inner.rest }
  }
  if (node.kind === 'bin' && node.op === '*') {
    const a = asNum(node.left)
    if (a !== null) return { coef: a, rest: node.right }
    const b = asNum(node.right)
    if (b !== null) return { coef: b, rest: node.left }
  }
  return { coef: 1, rest: node }
}

export function collect(node) {
  const terms = flatten(simplify(node), 1, [])

  const order = []
  const groups = new Map()
  let constant = 0
  for (const { sign, node: term } of terms) {
    const { coef, rest } = split(deepCollect(term))
    if (rest === null) { constant += sign * coef; continue }
    const key = toTex(rest, 0)
    if (!groups.has(key)) { groups.set(key, { coef: 0, rest }); order.push(key) }
    groups.get(key).coef += sign * coef
  }

  const entries = order.map(k => groups.get(k)).filter(g => Math.abs(g.coef) > 1e-12)
  if (Math.abs(constant) > 1e-12) entries.push({ coef: constant, rest: null })
  // A sum that would start with a minus is rotated so that a positive term
  // leads: 3 - 2x - 2y instead of -2x - 2y + 3.
  if (entries.length && entries[0].coef < 0) {
    const i = entries.findIndex(e => e.coef > 0)
    if (i > 0) entries.unshift(entries.splice(i, 1)[0])
  }

  let out = null
  for (const { coef, rest } of entries) {
    const mag = Math.abs(coef)
    const piece = rest === null
      ? num(mag)
      : (Math.abs(mag - 1) < 1e-12 ? rest : mergeProduct(bin('*', num(mag), rest, true)))
    if (out === null) out = coef < 0 ? neg(piece) : piece
    else out = bin(coef < 0 ? '-' : '+', out, piece)
  }
  return out ?? ZERO
}

// Same treatment inside the pieces of a term, so (2x + 3x)y collapses too, and
// a chain of products is merged into one coefficient and one set of powers.
function deepCollect(n) {
  switch (n.kind) {
    case 'neg': {
      const inner = deepCollect(n.operand)
      return inner.kind === 'neg' ? inner.operand : neg(inner)
    }
    case 'call': return call(n.name, collect(n.arg))
    case 'group': return deepCollect(n.operand)
    case 'bin': {
      if (n.op === '+' || n.op === '-') return collect(n)
      if (n.op === '*') return mergeProduct(n)
      return simplifyBin({ ...n, left: deepCollect(n.left), right: deepCollect(n.right) })
    }
    default: return n
  }
}

function flattenMul(n, out) {
  if (n.kind === 'bin' && n.op === '*') { flattenMul(n.left, out); flattenMul(n.right, out); return out }
  if (n.kind === 'group') return flattenMul(n.operand, out)
  out.push(n)
  return out
}

function mergeProduct(n) {
  let coef = 1
  const order = []
  const counts = new Map()
  // Collecting a factor can uncover another product or a minus sign underneath
  // it, so the list is walked as a queue and grows while it is being read.
  const queue = flattenMul(n, []).map(deepCollect)
  for (let i = 0; i < queue.length; i++) {
    const f = queue[i]
    if (f.kind === 'neg') { coef = -coef; queue.push(f.operand); continue }
    if (f.kind === 'group') { queue.push(f.operand); continue }
    if (f.kind === 'bin' && f.op === '*') { queue.push(f.left, f.right); continue }
    const v = asNum(f)
    if (v !== null) { coef *= v; continue }
    const key = toTex(f, 0)
    if (!counts.has(key)) { counts.set(key, { node: f, n: 0 }); order.push(key) }
    counts.get(key).n++
  }
  if (Math.abs(coef) < 1e-14) return ZERO

  // The coefficient goes in first and the chain stays left associated, so the
  // printed product never picks up a bracket it does not need.
  let out = Math.abs(Math.abs(coef) - 1) > 1e-12 ? num(Math.abs(coef)) : null
  for (const key of order) {
    const { node: base, n: k } = counts.get(key)
    const piece = k > 1 ? bin('^', base, num(k)) : base
    out = out === null ? piece : bin('*', out, piece, true)
  }
  if (out === null) return num(coef)
  return coef < 0 ? neg(out) : out
}

// ── Compilation ────────────────────────────────────────────────────────────

// Turns the tree into nested closures reading (x, y, p): about twenty times
// faster than interpreting it, and without the eval a Function constructor
// would need.
export function compile(node) {
  switch (node.kind) {
    case 'num': { const v = node.value; return () => v }
    case 'const': { const v = CONSTANTS[node.name]; return () => v }
    case 'var': {
      const name = node.name
      if (name === 'x') return x => x
      if (name === 'y') return (x, y) => y
      return (x, y, p) => {
        const v = p[name]
        return typeof v === 'number' ? v : NaN
      }
    }
    case 'group': return compile(node.operand)
    case 'neg': { const a = compile(node.operand); return (x, y, p) => -a(x, y, p) }
    case 'call': {
      const fn = FUNCTIONS[node.name]
      const a = compile(node.arg)
      return fn ? (x, y, p) => fn(a(x, y, p)) : () => NaN
    }
    case 'bin': {
      const l = compile(node.left), r = compile(node.right)
      switch (node.op) {
        case '+': return (x, y, p) => l(x, y, p) + r(x, y, p)
        case '-': return (x, y, p) => l(x, y, p) - r(x, y, p)
        case '*': return (x, y, p) => l(x, y, p) * r(x, y, p)
        case '/': return (x, y, p) => l(x, y, p) / r(x, y, p)
        default: return (x, y, p) => Math.pow(l(x, y, p), r(x, y, p))
      }
    }
    default: return () => NaN
  }
}

export const texOf = node => toTex(node, 0)

export { parseExpr, toTex }

export default { parseExpr, derivative, collect, compile, texOf, toTex, num }
