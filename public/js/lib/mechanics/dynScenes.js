// Drawings of the dynamics setups. The world is schematic (about 10 × 7
// units): the animation maps the displacement found by the solver onto the
// available track, so the bodies always move the right way and with the right
// timing, but not to scale.

import { View, arrow, block, pulley, rope, mathLabel, ground, text, ball, arcAngle } from './draw.js'
import { fmt } from './core.js'

const box = (w, h) => new View(w, h, [0, 10, 0, 6.6], 14)

// Fraction of the track covered at `time` (0 … ±1).
export function progress(m, time) {
  if (!m.moving) return 0
  const end = Math.abs(m.s(m.duration))
  return end > 1e-12 ? m.s(time) / end : 0
}

function hatch(ctx, view, x0, x1, y, c, below = true) {
  ctx.save()
  ctx.strokeStyle = c.muted
  ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(view.X(x0), view.Y(y)); ctx.lineTo(view.X(x1), view.Y(y)); ctx.stroke()
  ctx.globalAlpha = 0.45
  ctx.lineWidth = 1
  for (let x = view.X(x0); x < view.X(x1); x += 9) {
    ctx.beginPath(); ctx.moveTo(x, view.Y(y)); ctx.lineTo(x - 6, view.Y(y) + (below ? 7 : -7)); ctx.stroke()
  }
  ctx.restore()
}

const B = (c, label) => ({ fill: c.soft, stroke: c.primary, label, labelColor: c.primary })

// Block on a horizontal floor pulled (or pushed) by F at an angle.
export function pullScene(ctx, w, h, c, { p, th = 0, labels = ['m'], forceLabel = 'F', friction = false }) {
  const view = box(w, h)
  hatch(ctx, view, 0.3, 9.7, 1, c)
  const x = 2.6 + 4.2 * Math.max(-0.4, Math.min(1, p))
  block(ctx, view, x, 1, 1.8, 1.1, 0, B(c, labels[0]))
  const ang = th
  const L = 70
  const dx = Math.cos(ang)
  const dy = -Math.sin(ang)
  if (ang >= 0) {
    const sx = view.X(x + 0.9)
    const sy = view.Y(1 + 0.8)
    arrow(ctx, sx, sy, sx + L * dx, sy + L * dy, { color: c.second, width: 2.6 })
    mathLabel(ctx, forceLabel, sx + L * dx + 8, sy + L * dy, { color: c.second })
    if (ang > 1e-6) arcAngle(ctx, sx, sy, 22, 0, ang, c.muted, 'θ')
  } else {
    const ex = view.X(x - 0.9)
    const ey = view.Y(1 + 1.1)
    arrow(ctx, ex - L * dx, ey - L * dy, ex, ey, { color: c.second, width: 2.6 })
    mathLabel(ctx, forceLabel, ex - L * dx - 14, ey - L * dy, { color: c.second })
    arcAngle(ctx, ex, ey, 22, Math.PI, Math.PI - ang, c.muted, 'θ')
  }
  if (friction) mathLabel(ctx, 'μ', view.X(x) - 4, view.Y(0.7), { color: c.muted, size: 13 })
}

// Block on an incline that goes down to the right; u in [0,1] along the slope.
export function inclineScene(ctx, w, h, c, { th, p, rope: withRope = false, label = 'm', friction = false }) {
  const view = box(w, h)
  const S = 7.6
  const t = Math.max(0.05, Math.min(1.4, th))
  const top = [9.3 - S * Math.cos(t), 1 + S * Math.sin(t)]
  const sc = Math.min(1, 5.4 / (S * Math.sin(t)))
  const ox = 9.3
  const pt = u => [ox - (ox - top[0]) * sc * (1 - u), 1 + (top[1] - 1) * sc * (1 - u)]
  const A = pt(0)
  ctx.save()
  ctx.fillStyle = c.soft
  ctx.strokeStyle = c.muted
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(view.X(A[0]), view.Y(A[1])); ctx.lineTo(view.X(ox), view.Y(1)); ctx.lineTo(view.X(A[0]), view.Y(1)); ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.restore()
  hatch(ctx, view, 0.3, 9.7, 1, c)
  arcAngle(ctx, view.X(ox), view.Y(1), 34, Math.PI - t, Math.PI, c.text, 'θ')
  const u = 0.25 + 0.55 * Math.max(-0.4, Math.min(1, p))
  const [bx, by] = pt(u)
  block(ctx, view, bx, by, 1.2, 0.8, -t, B(c, label))
  if (withRope) {
    rope(ctx, [[view.X(bx - 0.6 * Math.cos(t) + 0.4 * Math.sin(t)), view.Y(by + 0.6 * Math.sin(t) + 0.4 * Math.cos(t))], [view.X(A[0]), view.Y(A[1] + 0.4)]], c)
    ctx.save(); ctx.fillStyle = c.text; ctx.fillRect(view.X(A[0]) - 3, view.Y(A[1] + 0.9), 6, view.Y(A[1]) - view.Y(A[1] + 0.9)); ctx.restore()
  }
  if (friction) mathLabel(ctx, 'μ', view.X(bx) + 14, view.Y(by) + 10, { color: c.muted, size: 13 })
}

export function atwoodScene(ctx, w, h, c, { p, labels = ['m_1', 'm_2'] }) {
  const view = box(w, h)
  ctx.save(); ctx.fillStyle = c.text; ctx.fillRect(view.X(3.5), view.Y(6.5), view.X(6.5) - view.X(3.5), 4); ctx.restore()
  rope(ctx, [[view.X(5), view.Y(6.45)], [view.X(5), view.Y(5.6)]], c)
  const d = 1.8 * Math.max(-1, Math.min(1, p))
  const y1 = 3.2 + d
  const y2 = 3.2 - d
  rope(ctx, [[view.X(4.45), view.Y(5.6)], [view.X(4.45), view.Y(y1 + 0.9)]], c)
  rope(ctx, [[view.X(5.55), view.Y(5.6)], [view.X(5.55), view.Y(y2 + 0.9)]], c)
  pulley(ctx, view.X(5), view.Y(5.6), 0.55 * view.s, c)
  block(ctx, view, 4.45, y1, 0.9, 0.9, 0, B(c, labels[0]))
  block(ctx, view, 5.55, y2, 1.05, 1.05, 0, B(c, labels[1]))
  hatch(ctx, view, 2, 8, 0.5, c)
}

export function tableHangScene(ctx, w, h, c, { p, labels = ['m_1', 'm_2'], friction = false }) {
  const view = box(w, h)
  const top = 4
  ctx.save(); ctx.fillStyle = c.soft; ctx.strokeStyle = c.muted
  ctx.fillRect(view.X(0.6), view.Y(top), view.X(7.4) - view.X(0.6), view.Y(top - 0.25) - view.Y(top))
  ctx.strokeRect(view.X(0.6), view.Y(top), view.X(7.4) - view.X(0.6), view.Y(top - 0.25) - view.Y(top))
  ctx.fillRect(view.X(1), view.Y(top - 0.25), 6, view.Y(0.4) - view.Y(top - 0.25))
  ctx.fillRect(view.X(6.9), view.Y(top - 0.25), 6, view.Y(0.4) - view.Y(top - 0.25))
  ctx.restore()
  const d = 2.4 * Math.max(-0.5, Math.min(1, p))
  const x1 = 3 + d
  const y2 = 2.3 - d * 0.75
  const px = 7.5
  const py = top + 0.4
  rope(ctx, [[view.X(x1 + 0.75), view.Y(top + 0.45)], [view.X(px), view.Y(top + 0.45 + 0.35)]], c)
  rope(ctx, [[view.X(px + 0.4), view.Y(py)], [view.X(px + 0.4), view.Y(y2 + 0.9)]], c)
  pulley(ctx, view.X(px), view.Y(py), 0.4 * view.s, c)
  block(ctx, view, x1, top, 1.5, 0.9, 0, B(c, labels[0]))
  block(ctx, view, px + 0.4, Math.max(0.5, y2), 0.9, 0.9, 0, B(c, labels[1]))
  if (friction) mathLabel(ctx, 'μ', view.X(x1), view.Y(top) + 12, { color: c.muted, size: 13 })
  hatch(ctx, view, 0.3, 9.7, 0.4, c)
}

// Incline rising to the right, pulley at the top, hanging body on the right.
export function inclineHangScene(ctx, w, h, c, { th, p, labels = ['m_1', 'm_2'], friction = false }) {
  const view = box(w, h)
  const t = Math.max(0.05, Math.min(1.3, th))
  let S = 6.2
  if (1 + S * Math.sin(t) > 5.6) S = 4.6 / Math.sin(t)
  const top = [1 + S * Math.cos(t), 1 + S * Math.sin(t)]
  ctx.save(); ctx.fillStyle = c.soft; ctx.strokeStyle = c.muted; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(view.X(1), view.Y(1)); ctx.lineTo(view.X(top[0]), view.Y(top[1])); ctx.lineTo(view.X(top[0]), view.Y(1)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore()
  hatch(ctx, view, 0.3, 9.7, 1, c)
  arcAngle(ctx, view.X(1), view.Y(1), 34, 0, t, c.text, 'θ')
  const u = 0.35 + 0.35 * Math.max(-0.8, Math.min(1, p))
  const bx = 1 + S * u * Math.cos(t)
  const by = 1 + S * u * Math.sin(t)
  const px = top[0] + 0.15
  const py = top[1] + 0.35
  const nx = -Math.sin(t)
  const ny = Math.cos(t)
  rope(ctx, [[view.X(bx + 0.6 * Math.cos(t) + 0.4 * nx), view.Y(by + 0.6 * Math.sin(t) + 0.4 * ny)], [view.X(px - 0.35 * Math.sin(t)), view.Y(py + 0.35 * Math.cos(t))]], c)
  const y2 = Math.max(0.6, top[1] - 2.2 - 2 * Math.max(-0.8, Math.min(1, p)))
  rope(ctx, [[view.X(px + 0.35), view.Y(py)], [view.X(px + 0.35), view.Y(y2 + 0.85)]], c)
  pulley(ctx, view.X(px), view.Y(py), 0.35 * view.s, c)
  block(ctx, view, bx, by, 1.2, 0.8, t, B(c, labels[0]))
  block(ctx, view, px + 0.35, y2, 0.85, 0.85, 0, B(c, labels[1]))
  if (friction) mathLabel(ctx, 'μ', view.X(bx) - 14, view.Y(by) + 12, { color: c.muted, size: 13 })
}

export function contactScene(ctx, w, h, c, { p, labels = ['m_1', 'm_2'], rope: joined = false, friction = false }) {
  const view = box(w, h)
  hatch(ctx, view, 0.3, 9.7, 1.5, c)
  const d = 3.2 * Math.max(-0.3, Math.min(1, p))
  const x1 = 2.6 + d
  const x2 = joined ? x1 + 2.4 : x1 + 1.45
  block(ctx, view, x1, 1.5, 1.3, 1.1, 0, B(c, labels[0]))
  block(ctx, view, x2, 1.5, 1.6, 1.4, 0, B(c, labels[1]))
  if (joined) {
    rope(ctx, [[view.X(x1 + 0.65), view.Y(2)], [view.X(x2 - 0.8), view.Y(2)]], c)
    arrow(ctx, view.X(x2 + 0.8), view.Y(2.2), view.X(x2 + 0.8) + 64, view.Y(2.2), { color: c.second, width: 2.6 })
    mathLabel(ctx, 'F', view.X(x2 + 0.8) + 70, view.Y(2.2), { color: c.second })
  } else {
    arrow(ctx, view.X(x1 - 0.65) - 64, view.Y(2), view.X(x1 - 0.65), view.Y(2), { color: c.second, width: 2.6 })
    mathLabel(ctx, 'F', view.X(x1 - 0.65) - 74, view.Y(2), { color: c.second })
  }
  if (friction) mathLabel(ctx, 'μ', view.X(x1), view.Y(1.2), { color: c.muted, size: 13 })
}

export function elevatorScene(ctx, w, h, c, { p, reading, a, label = 'm' }) {
  const view = box(w, h)
  ctx.save(); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.4
  ctx.strokeRect(view.X(3), view.Y(6.5), view.X(7) - view.X(3), view.Y(0.2) - view.Y(6.5)); ctx.restore()
  const y = 1.6 + 1.6 * Math.max(-1, Math.min(1, p))
  ctx.save(); ctx.fillStyle = c.bg; ctx.strokeStyle = c.primary; ctx.lineWidth = 2
  ctx.fillRect(view.X(3.4), view.Y(y + 3), view.X(6.6) - view.X(3.4), view.Y(y) - view.Y(y + 3))
  ctx.strokeRect(view.X(3.4), view.Y(y + 3), view.X(6.6) - view.X(3.4), view.Y(y) - view.Y(y + 3)); ctx.restore()
  rope(ctx, [[view.X(5), view.Y(6.5)], [view.X(5), view.Y(y + 3)]], c)
  ctx.save(); ctx.fillStyle = c.muted; ctx.fillRect(view.X(4.3), view.Y(y + 0.25), view.X(5.7) - view.X(4.3), view.Y(y) - view.Y(y + 0.25)); ctx.restore()
  block(ctx, view, 5, y + 0.25, 0.9, 1.4, 0, B(c, label))
  text(ctx, Number.isFinite(reading) ? `${fmt(reading, 4)} N` : '? N', view.X(6.5) - 6, view.Y(y + 2.75), { color: c.text, size: 13, align: 'right', bold: true })
  if (Number.isFinite(a) && Math.abs(a) > 1e-9) {
    const px = view.X(7.6)
    const py = view.Y(3.3)
    arrow(ctx, px, py, px, py - Math.sign(a) * 46, { color: c.third, width: 2.4, dash: [6, 3] })
    mathLabel(ctx, 'a', px + 10, py - Math.sign(a) * 30, { color: c.third })
  }
}

export function knotScene(ctx, w, h, c, { th1, th2, labels = ['T_1', 'T_2', 'T_3'] }) {
  const view = box(w, h)
  hatch(ctx, view, 0.5, 9.5, 6.3, c, false)
  const K = [5, 3.6]
  const L1 = Math.min(5, (6.3 - K[1]) / Math.max(0.15, Math.sin(th1)))
  const L2 = Math.min(5, (6.3 - K[1]) / Math.max(0.15, Math.sin(th2)))
  const A = [K[0] - L1 * Math.cos(th1), K[1] + L1 * Math.sin(th1)]
  const Bp = [K[0] + L2 * Math.cos(th2), K[1] + L2 * Math.sin(th2)]
  rope(ctx, [[view.X(A[0]), view.Y(A[1])], [view.X(K[0]), view.Y(K[1])], [view.X(Bp[0]), view.Y(Bp[1])]], c)
  rope(ctx, [[view.X(K[0]), view.Y(K[1])], [view.X(K[0]), view.Y(2.1)]], c)
  ball(ctx, view.X(K[0]), view.Y(K[1]), 4, c.text)
  block(ctx, view, K[0], 1.1, 1.3, 1, 0, B(c, 'm'))
  mathLabel(ctx, labels[0], view.X((A[0] + K[0]) / 2) - 16, view.Y((A[1] + K[1]) / 2), { color: c.second })
  mathLabel(ctx, labels[1], view.X((Bp[0] + K[0]) / 2) + 8, view.Y((Bp[1] + K[1]) / 2), { color: c.second })
  mathLabel(ctx, labels[2], view.X(K[0]) + 8, view.Y(2.8), { color: c.second })
  arcAngle(ctx, view.X(A[0]), view.Y(A[1]), 30, -th1, 0, c.muted, 'θ_1')
  arcAngle(ctx, view.X(Bp[0]), view.Y(Bp[1]), 30, Math.PI, Math.PI + th2, c.muted, 'θ_2')
}

export function conicalScene(ctx, w, h, c, { th, time }) {
  const view = box(w, h)
  hatch(ctx, view, 3.5, 6.5, 6.3, c, false)
  const L = 4.4
  const t = Math.max(0.03, Math.min(1.4, th))
  const cy = 6.3 - L * Math.cos(t)
  const R = L * Math.sin(t)
  const phi = 2 * Math.PI * time / 2.4
  ctx.save(); ctx.strokeStyle = c.muted; ctx.setLineDash([4, 4])
  ctx.beginPath(); ctx.ellipse(view.X(5), view.Y(cy), R * view.s, R * view.s * 0.28, 0, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(view.X(5), view.Y(6.3)); ctx.lineTo(view.X(5), view.Y(cy)); ctx.stroke(); ctx.restore()
  const bx = view.X(5 + R * Math.cos(phi))
  const by = view.Y(cy) + R * view.s * 0.28 * Math.sin(phi)
  rope(ctx, [[view.X(5), view.Y(6.3)], [bx, by]], c)
  ball(ctx, bx, by, 9, c.primary)
  arcAngle(ctx, view.X(5), view.Y(6.3), 40, -Math.PI / 2, -Math.PI / 2 + t, c.muted, 'θ')
  mathLabel(ctx, 'L', (view.X(5) + bx) / 2 + 10, (view.Y(6.3) + by) / 2, { color: c.text })
  mathLabel(ctx, 'r', view.X(5 + R / 2), view.Y(cy) - 10, { color: c.text })
}

export function bankedScene(ctx, w, h, c, { th }) {
  const view = box(w, h)
  const t = Math.max(0, Math.min(1.3, th))
  hatch(ctx, view, 0.3, 9.7, 1, c)
  const L = 6.5
  const A = [1.8, 1]
  const Bp = [A[0] + L * Math.cos(t), 1 + L * Math.sin(t)]
  ctx.save(); ctx.fillStyle = c.soft; ctx.strokeStyle = c.muted; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(view.X(A[0]), view.Y(1)); ctx.lineTo(view.X(Bp[0]), view.Y(Bp[1])); ctx.lineTo(view.X(Bp[0]), view.Y(1)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore()
  arcAngle(ctx, view.X(A[0]), view.Y(1), 36, 0, t, c.text, 'θ')
  const mx = A[0] + 0.55 * L * Math.cos(t)
  const my = 1 + 0.55 * L * Math.sin(t)
  block(ctx, view, mx, my, 1.6, 0.9, t, B(c, 'm'))
  text(ctx, '⊙', view.X(0.9), view.Y(5.6), { color: c.muted, size: 16 })
  arrow(ctx, view.X(mx), view.Y(my + 0.5), view.X(0.9), view.Y(my + 0.5), { color: c.third, width: 2, dash: [6, 3] })
  mathLabel(ctx, 'a_c', view.X(1.4), view.Y(my + 0.5) - 12, { color: c.third })
}

// Body on a vertical circle at the top or bottom, or a car over a hilltop.
export function verticalCircleScene(ctx, w, h, c, { point = 'bottom', time }) {
  const view = box(w, h)
  const C = [5, 3.4]
  const R = 2.5
  ctx.save(); ctx.strokeStyle = c.muted; ctx.setLineDash([4, 4])
  ctx.beginPath(); ctx.arc(view.X(C[0]), view.Y(C[1]), R * view.s, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
  if (point === 'hill') {
    hatch(ctx, view, 0.3, 9.7, 0.6, c)
    ctx.save(); ctx.fillStyle = c.soft; ctx.strokeStyle = c.text; ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.arc(view.X(C[0]), view.Y(C[1]), R * view.s, Math.PI, 0); ctx.fill(); ctx.stroke(); ctx.restore()
    const sway = 0.25 * Math.sin(2 * Math.PI * time / 3)
    const ang = Math.PI / 2 + sway
    block(ctx, view, C[0] + R * Math.cos(ang), C[1] + R * Math.sin(ang), 1.4, 0.7, ang - Math.PI / 2, B(c, 'm'))
  } else {
    const ang = point === 'top' ? Math.PI / 2 : -Math.PI / 2
    const sway = 0.18 * Math.sin(2 * Math.PI * time / 3)
    const bx = C[0] + R * Math.cos(ang + sway)
    const by = C[1] + R * Math.sin(ang + sway)
    rope(ctx, [[view.X(C[0]), view.Y(C[1])], [view.X(bx), view.Y(by)]], c)
    ball(ctx, view.X(C[0]), view.Y(C[1]), 4, c.text)
    ball(ctx, view.X(bx), view.Y(by), 12, c.primary)
  }
  const ax = point === 'bottom' ? 1 : -1
  arrow(ctx, view.X(C[0]) + 70, view.Y(C[1]) - ax * 40, view.X(C[0]) + 70, view.Y(C[1]) + ax * 10, { color: c.third, width: 2, dash: [6, 3] })
  mathLabel(ctx, 'a_c', view.X(C[0]) + 80, view.Y(C[1]) - ax * 20, { color: c.third })
  mathLabel(ctx, 'r', view.X(C[0] + 0.15), view.Y(C[1] + (point === 'bottom' ? -1.2 : 1.2)), { color: c.text })
}

// Seen from above: a body that circles a centre (string through a hole, a car
// in a flat curve, a person in a rotor).
export function topViewScene(ctx, w, h, c, { time, kind = 'string' }) {
  const view = box(w, h)
  const C = [5, 3.3]
  const R = 2.6
  ctx.save(); ctx.strokeStyle = c.muted; ctx.lineWidth = kind === 'rotor' ? 6 : 1.4; ctx.setLineDash(kind === 'rotor' ? [] : [4, 4])
  ctx.beginPath(); ctx.arc(view.X(C[0]), view.Y(C[1]), (R + (kind === 'rotor' ? 0.35 : 0)) * view.s, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
  const ang = 2 * Math.PI * time / 3
  const bx = view.X(C[0] + R * Math.cos(ang))
  const by = view.Y(C[1] + R * Math.sin(ang))
  if (kind === 'string') rope(ctx, [[view.X(C[0]), view.Y(C[1])], [bx, by]], c)
  ball(ctx, view.X(C[0]), view.Y(C[1]), 4, c.text)
  ball(ctx, bx, by, kind === 'car' ? 10 : 9, c.primary)
  const tx = -Math.sin(ang)
  const ty = -Math.cos(ang)
  arrow(ctx, bx, by, bx + tx * 46, by + ty * 46, { color: c.primary, width: 2.4 })
  mathLabel(ctx, 'v', bx + tx * 56, by + ty * 56, { color: c.primary, align: 'center' })
  arrow(ctx, bx, by, bx + (view.X(C[0]) - bx) * 0.4, by + (view.Y(C[1]) - by) * 0.4, { color: c.third, width: 2, dash: [6, 3] })
}

export function brakingScene(ctx, w, h, c, { p }) {
  const view = box(w, h)
  hatch(ctx, view, 0.3, 9.7, 1.4, c)
  const x = 1.2 + 7 * Math.max(0, Math.min(1, p))
  ctx.save()
  ctx.translate(view.X(x), view.Y(1.4))
  ctx.fillStyle = c.primary
  ctx.fillRect(-34, -22, 68, 14)
  ctx.fillRect(-18, -34, 34, 14)
  ctx.fillStyle = c.text
  ctx.beginPath(); ctx.arc(-20, -6, 7, 0, Math.PI * 2); ctx.arc(20, -6, 7, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  ground(ctx, view, 1.4, 0.3, 0.3, c)
}
