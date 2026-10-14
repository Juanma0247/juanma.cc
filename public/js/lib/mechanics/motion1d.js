// Straight-line motion with constant acceleration, shared by the uniform,
// accelerated, free-fall and vertical-throw pages: x(t), v(t), the instants
// where something notable happens and the answers to "where is it at t?",
// "when does it pass through x?" and "when does its velocity equal v?".

import { t, fill, texNum, texNumParen } from './core.js'

export function makeMotion({ x0 = 0, v0 = 0, a = 0, t1 = null, sym = 'x' }) {
  return {
    x0, v0, a, t1, sym,
    x: tt => x0 + v0 * tt + 0.5 * a * tt * tt,
    v: tt => v0 + a * tt,
  }
}

// Non-negative roots of x(t) = X, ascending.
export function timesAtPosition(m, X) {
  const A = 0.5 * m.a
  const B = m.v0
  const C = m.x0 - X
  if (Math.abs(A) < 1e-14) {
    if (Math.abs(B) < 1e-14) return []
    const r = -C / B
    return r >= -1e-9 ? [Math.max(0, r)] : []
  }
  const d = B * B - 4 * A * C
  if (d < -1e-12) return []
  const s = Math.sqrt(Math.max(0, d))
  return [(-B - s) / (2 * A), (-B + s) / (2 * A)]
    .filter(r => r >= -1e-9)
    .map(r => Math.max(0, r))
    .sort((p, q) => p - q)
    .filter((r, i, arr) => i === 0 || Math.abs(r - arr[i - 1]) > 1e-9)
}

const u = { x: 'm', v: 'm/s', a: 'm/s^2', t: 's' }
const q = (x, unit) => `${texNum(x)}\\,\\text{${unit}}`
const qp = (x, unit) => `(${texNum(x)}\\,\\text{${unit}})`

// Blocks for TopicPage's query box. names: { x: 'x', x0: 'x_0', v0: 'v_0' }.
export function answerQuery(kind, value, m, names = {}) {
  const X = names.x ?? 'x'
  const X0 = names.x0 ?? 'x_0'
  const V0 = names.v0 ?? 'v_0'
  const A = names.a ?? 'a'
  const blocks = []
  if (kind === 't') {
    const tt = value
    if (tt < 0) return [{ lines: [{ prose: t('common.query.negativeTime', 'The motion starts at t = 0; choose a non-negative time.') }] }]
    blocks.push({
      title: fill(t('common.query.atTime', 'At t = {t}'), { t: `\\(${q(tt, 's')}\\)` }),
      t: tt,
      lines: [
        `${X}(t) = ${X0} + ${V0}\\,t + \\tfrac12 ${A}\\,t^2 = ${texNum(m.x0)} + ${texNumParen(m.v0)}${qp(tt, 's')} + \\tfrac12${texNumParen(m.a)}${qp(tt, 's')}^2 = ${q(m.x(tt), u.x)}`,
        `v(t) = ${V0} + ${A}\\,t = ${texNum(m.v0)} + ${texNumParen(m.a)}${qp(tt, 's')} = ${q(m.v(tt), u.v)}`,
      ],
    })
    return blocks
  }
  if (kind === 'x') {
    const Xv = value
    const roots = timesAtPosition(m, Xv)
    const lines = [
      { prose: fill(t('common.query.positionEq', 'We ask when {x} = {X}: the position equation becomes a quadratic in t.'), { x: `\\(${X}\\)`, X: `\\(${q(Xv, u.x)}\\)` }) },
      `${q(Xv, u.x)} = ${texNum(m.x0)} + ${texNumParen(m.v0)}\\,t + \\tfrac12${texNumParen(m.a)}\\,t^2`,
      `${texNum(0.5 * m.a)}\\,t^2 + ${texNumParen(m.v0)}\\,t + ${texNumParen(m.x0 - Xv)} = 0`,
    ]
    if (!roots.length) {
      lines.push({ prose: t('common.query.never', 'There is no non-negative real root: the body never passes through that point.') })
      return [{ lines }]
    }
    blocks.push({ lines })
    roots.forEach((r, i) => blocks.push({
      title: fill(t('common.query.passN', 'Pass {n}: t = {t}'), { n: i + 1, t: `\\(${q(r, 's')}\\)` }),
      t: r,
      lines: [`v(${texNum(r)}) = ${texNum(m.v0)} + ${texNumParen(m.a)}${qp(r, 's')} = ${q(m.v(r), u.v)}`,
        { prose: m.v(r) > 1e-9 ? t('common.query.movingPos', 'Moving in the positive direction.') : m.v(r) < -1e-9 ? t('common.query.movingNeg', 'Moving in the negative direction.') : t('common.query.atRest', 'Instantaneously at rest.') }],
    }))
    return blocks
  }
  if (kind === 'v') {
    const V = value
    if (Math.abs(m.a) < 1e-12) {
      return [{ lines: [{ prose: Math.abs(V - m.v0) < 1e-9 ? t('common.query.alwaysV', 'The velocity is constant and always equal to that value.') : t('common.query.neverV', 'The velocity is constant and never takes that value.') }] }]
    }
    const tt = (V - m.v0) / m.a
    const lines = [
      `t = \\frac{v - ${V0}}{${A}} = \\frac{${texNum(V)} - ${texNumParen(m.v0)}}{${texNum(m.a)}} = ${q(tt, 's')}`,
    ]
    if (tt < -1e-9) {
      lines.push({ prose: t('common.query.beforeStart', 'That velocity would have been reached before t = 0, outside the motion.') })
      return [{ lines }]
    }
    lines.push(`${X}(t) = ${q(m.x(tt), u.x)}`)
    return [{ t: tt, lines }]
  }
  return blocks
}
