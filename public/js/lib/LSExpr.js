// Small expression language for the matrix entries of the Linear Systems page.
// Accepts fractions (-1/8), decimals with either separator (-0.8 / -0,8), the
// constants pi and e, and free letters that become extra parameters the page
// asks the reader to fill in, GeoGebra style.

const CONSTANTS = {
  pi: Math.PI,
  'π': Math.PI,
  e: Math.E,
}

const CONSTANT_TEX = {
  pi: '\\pi',
  'π': '\\pi',
  e: 'e',
}

const FUNCTIONS = {
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  log10: Math.log10,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sign: Math.sign,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
}

const FUNCTION_TEX = {
  sqrt: null, cbrt: null, abs: null,
  exp: '\\exp', ln: '\\ln', log: '\\log', log10: '\\log_{10}',
  sin: '\\sin', cos: '\\cos', tan: '\\tan',
  asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan',
  sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh',
  sign: '\\operatorname{sign}', floor: '\\operatorname{floor}',
  ceil: '\\operatorname{ceil}', round: '\\operatorname{round}',
}

const IDENT_START = /[A-Za-z_Α-Ωα-ω]/
const IDENT_BODY = /[A-Za-z0-9_Α-Ωα-ω]/

export class ExprError extends Error {}

function tokenize(src) {
  // Comma as a decimal separator, and the unicode dashes/operators a reader is
  // likely to paste, folded onto their ASCII equivalents before parsing.
  const s = String(src)
    .replace(/,/g, '.')
    .replace(/[−–—]/g, '-')
    .replace(/[×·∙]/g, '*')
    .replace(/÷/g, '/')
    .replace(/√/g, 'sqrt')

  const tokens = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (/\s/.test(ch)) { i++; continue }
    if (/[0-9.]/.test(ch)) {
      let j = i
      while (j < s.length && /[0-9]/.test(s[j])) j++
      if (s[j] === '.') { j++; while (j < s.length && /[0-9]/.test(s[j])) j++ }
      const text = s.slice(i, j)
      if (text === '.') throw new ExprError(`unexpected "." at ${i + 1}`)
      tokens.push({ type: 'num', value: Number(text), text })
      i = j
      continue
    }
    if (IDENT_START.test(ch)) {
      let j = i
      while (j < s.length && IDENT_BODY.test(s[j])) j++
      tokens.push({ type: 'ident', text: s.slice(i, j) })
      i = j
      continue
    }
    if ('+-*/^()'.includes(ch)) { tokens.push({ type: ch }); i++; continue }
    throw new ExprError(`unexpected "${ch}" at ${i + 1}`)
  }
  return tokens
}

// `2a`, `3pi`, `2(x+1)` and `(a)(b)` all read as products; the multiplication is
// materialised here so the parser itself stays a plain precedence climber.
function insertImplicitProducts(tokens) {
  const out = []
  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i]
    const next = tokens[i + 1]
    out.push(cur)
    if (!next) continue
    const endsValue = cur.type === 'num' || cur.type === 'ident' || cur.type === ')'
    const startsValue = next.type === 'num' || next.type === 'ident' || next.type === '('
    const callParen = cur.type === 'ident' && next.type === '(' && cur.text in FUNCTIONS
    if (endsValue && startsValue && !callParen) out.push({ type: '*', implicit: true })
  }
  return out
}

function parseTokens(tokens) {
  let pos = 0
  const peek = () => tokens[pos]
  const eat = type => {
    if (!tokens[pos] || tokens[pos].type !== type) {
      throw new ExprError(`expected "${type}"`)
    }
    return tokens[pos++]
  }

  function parseExpr() {
    let node = parseTerm()
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = tokens[pos++].type
      node = { kind: 'bin', op, left: node, right: parseTerm() }
    }
    return node
  }

  function parseTerm() {
    let node = parseUnary()
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const tok = tokens[pos++]
      node = { kind: 'bin', op: tok.type, implicit: tok.implicit, left: node, right: parseUnary() }
    }
    return node
  }

  function parseUnary() {
    if (peek() && (peek().type === '-' || peek().type === '+')) {
      const op = tokens[pos++].type
      const operand = parseUnary()
      return op === '-' ? { kind: 'neg', operand } : operand
    }
    return parsePower()
  }

  function parsePower() {
    const base = parseAtom()
    if (peek() && peek().type === '^') {
      pos++
      return { kind: 'bin', op: '^', left: base, right: parseUnary() }
    }
    return base
  }

  function parseAtom() {
    const tok = peek()
    if (!tok) throw new ExprError('unexpected end of expression')
    if (tok.type === 'num') { pos++; return { kind: 'num', value: tok.value, text: tok.text } }
    if (tok.type === '(') {
      pos++
      const inner = parseExpr()
      eat(')')
      return { kind: 'group', operand: inner }
    }
    if (tok.type === 'ident') {
      pos++
      const name = tok.text
      if (peek() && peek().type === '(' && name in FUNCTIONS) {
        pos++
        const arg = parseExpr()
        eat(')')
        return { kind: 'call', name, arg }
      }
      if (name in CONSTANTS) return { kind: 'const', name }
      if (name in FUNCTIONS) throw new ExprError(`"${name}" needs an argument, e.g. ${name}(2)`)
      return { kind: 'var', name }
    }
    throw new ExprError(`unexpected "${tok.type}"`)
  }

  const node = parseExpr()
  if (pos < tokens.length) throw new ExprError('trailing input')
  return node
}

function collectVars(node, out) {
  if (!node) return out
  switch (node.kind) {
    case 'var': out.add(node.name); break
    case 'neg': case 'group': collectVars(node.operand, out); break
    case 'call': collectVars(node.arg, out); break
    case 'bin': collectVars(node.left, out); collectVars(node.right, out); break
  }
  return out
}

function evalNode(node, scope) {
  switch (node.kind) {
    case 'num': return node.value
    case 'const': return CONSTANTS[node.name]
    case 'var': {
      const v = scope[node.name]
      return typeof v === 'number' && Number.isFinite(v) ? v : NaN
    }
    case 'group': return evalNode(node.operand, scope)
    case 'neg': return -evalNode(node.operand, scope)
    case 'call': return FUNCTIONS[node.name](evalNode(node.arg, scope))
    case 'bin': {
      const l = evalNode(node.left, scope)
      const r = evalNode(node.right, scope)
      if (node.op === '+') return l + r
      if (node.op === '-') return l - r
      if (node.op === '*') return l * r
      if (node.op === '/') return l / r
      return Math.pow(l, r)
    }
    default: return NaN
  }
}

const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 }

function precOf(node) {
  if (node.kind === 'bin') return PREC[node.op]
  if (node.kind === 'neg') return 0.5
  return 10
}

export function toTex(node, parentPrec = 0) {
  switch (node.kind) {
    case 'num': return node.text ?? String(node.value)
    case 'const': return CONSTANT_TEX[node.name]
    case 'var': return node.name.length === 1 ? node.name : `\\mathit{${node.name}}`
    case 'group': return toTex(node.operand, parentPrec)
    case 'neg': {
      const inner = toTex(node.operand, 2)
      return parentPrec > 0.5 ? `\\left(-${inner}\\right)` : `-${inner}`
    }
    case 'call': {
      const arg = toTex(node.arg, 0)
      if (node.name === 'sqrt') return `\\sqrt{${arg}}`
      if (node.name === 'cbrt') return `\\sqrt[3]{${arg}}`
      if (node.name === 'abs') return `\\left|${arg}\\right|`
      return `${FUNCTION_TEX[node.name]}\\left(${arg}\\right)`
    }
    case 'bin': {
      if (node.op === '/') {
        return `\\frac{${toTex(node.left, 0)}}{${toTex(node.right, 0)}}`
      }
      if (node.op === '^') {
        return `${toTex(node.left, 5)}^{${toTex(node.right, 0)}}`
      }
      const prec = PREC[node.op]
      const sep = node.op === '*' ? (node.implicit ? '' : ' \\cdot ') : ` ${node.op} `
      // A sum keeps its left operand unbracketed, so a leading minus sign reads
      // as "-2x + 1" rather than "(-2x) + 1".
      const leftPrec = node.op === '+' || node.op === '-' ? 0.5 : prec
      const body = `${toTex(node.left, leftPrec)}${sep}${toTex(node.right, prec + 0.5)}`
      return prec < parentPrec ? `\\left(${body}\\right)` : body
    }
    default: return ''
  }
}

// Parses one matrix entry. Returns the AST, the free letters it introduces and a
// LaTeX rendering of the entry exactly as it was typed.
export function parseExpr(src) {
  const text = String(src ?? '').trim()
  if (!text) return { ok: true, empty: true, node: { kind: 'num', value: 0, text: '0' }, vars: [], tex: '0' }
  try {
    const node = parseTokens(insertImplicitProducts(tokenize(text)))
    return {
      ok: true,
      empty: false,
      node,
      vars: [...collectVars(node, new Set())],
      tex: toTex(node),
    }
  } catch (err) {
    return { ok: false, empty: false, error: err.message, node: null, vars: [], tex: '' }
  }
}

export function evaluate(parsed, scope = {}) {
  if (!parsed?.ok || !parsed.node) return NaN
  return evalNode(parsed.node, scope)
}

export const RESERVED = Object.keys(CONSTANTS)

export default { parseExpr, evaluate, toTex, ExprError, RESERVED }
