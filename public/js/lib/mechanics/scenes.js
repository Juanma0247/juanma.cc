// Scenes shared by several topics.

import { View, arrow, car, ground, ruler, vruler, building, mathLabel, ball, readout } from './draw.js'

// Vertical motion seen from the side: ground at y = 0, an optional building of
// height y0 from which the body leaves, the ball with its velocity and g, the
// motion diagram at equal time intervals and the maximum height.
// m: { y(t), v(t), y0, duration, g, ymax?, marks?: [{ y, label }] }
export function verticalScene(ctx, w, h, m, time, c) {
  const T = m.duration
  let lo = 0
  let hi = Math.max(m.y0, 0)
  for (let i = 0; i <= 80; i++) {
    const y = m.y(T * i / 80)
    lo = Math.min(lo, y)
    hi = Math.max(hi, y)
  }
  if (hi - lo < 1e-6) hi = lo + 1
  const span = hi - lo
  const view = new View(w, h, [-span * 0.75, span * 0.75, lo - span * 0.04, hi + span * 0.1], { l: 70, r: 24, t: 24, b: 24 })
  const bx = -span * 0.1
  if (m.y0 > 1e-9 && m.building !== false) building(ctx, view, bx - span * 0.32, span * 0.3, m.y0, c)
  ground(ctx, view, Math.min(0, lo), -span * 0.75, span * 0.75, c)
  vruler(ctx, view, Math.min(0, lo), hi, -span * 0.62, c)

  if (Number.isFinite(m.ymax) && m.ymax > m.y0 + 1e-9) {
    ctx.save()
    ctx.strokeStyle = c.third
    ctx.setLineDash([4, 4])
    const py = view.Y(m.ymax)
    ctx.beginPath(); ctx.moveTo(view.X(bx - span * 0.3), py); ctx.lineTo(view.X(bx + span * 0.35), py); ctx.stroke()
    ctx.restore()
    mathLabel(ctx, 'y_{máx}', view.X(bx + span * 0.37), view.Y(m.ymax) - 9, { color: c.third, size: 13 })
  }
  for (const mk of m.marks ?? []) {
    const py = view.Y(mk.y)
    ctx.save(); ctx.strokeStyle = c.muted; ctx.setLineDash([2, 4])
    ctx.beginPath(); ctx.moveTo(view.X(bx - span * 0.05), py); ctx.lineTo(view.X(bx + span * 0.25), py); ctx.stroke(); ctx.restore()
    mathLabel(ctx, mk.label, view.X(bx + span * 0.27), py, { color: c.muted, size: 12 })
  }

  // Motion diagram, shifted aside so the dots do not hide the ball.
  const n = 12
  for (let i = 0; i <= n; i++) ball(ctx, view.X(bx + span * 0.16), view.Y(m.y(T * i / n)), 3, c.muted)

  const y = m.y(time)
  const v = m.v(time)
  const px = view.X(bx)
  const py = view.Y(y)
  ball(ctx, px, py, 9, c.primary)
  const vmax = Math.max(Math.abs(m.v(0)), Math.abs(m.v(T)), 1e-9)
  const vl = -v / vmax * Math.min(80, h * 0.2)
  if (Math.abs(vl) > 3) {
    arrow(ctx, px - 16, py, px - 16, py + vl, { color: c.primary, width: 2.6 })
    mathLabel(ctx, 'v', px - 30, py + vl, { color: c.primary })
  }
  arrow(ctx, px + 16, py, px + 16, py + 36, { color: c.second, width: 2.2 })
  mathLabel(ctx, 'g', px + 24, py + 30, { color: c.second })

  readout(ctx, c, [['t', time, 's'], ['y', y, 'm'], ['v', v, 'm/s']])
}

// A car on a straight road with its velocity and acceleration vectors and the
// motion diagram (ghost dots at equal time intervals, Serway section 2.5).
export function roadScene(ctx, w, h, m, time, c) {
  const T = m.duration
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i <= 60; i++) {
    const x = m.x(T * i / 60)
    lo = Math.min(lo, x)
    hi = Math.max(hi, x)
  }
  if (hi - lo < 1e-9) { lo -= 1; hi += 1 }
  const span = hi - lo
  const view = View.strip(w, h, lo - span * 0.08, hi + span * 0.08, 0.7)
  ground(ctx, view, 0, lo - span * 0.08, hi + span * 0.08, c)
  ruler(ctx, view, lo - span * 0.06, hi + span * 0.06, 0, c)

  const n = 10
  for (let i = 0; i <= n; i++) ball(ctx, view.X(m.x(T * i / n)), view.Y(0) - 30, 3.2, c.muted)
  for (const [x, lbl] of [[m.x0, 'x_0'], ...(m.final ? [[m.x(T), 'x']] : [])]) {
    const px = view.X(x)
    ctx.save()
    ctx.strokeStyle = c.third
    ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(px, view.Y(0)); ctx.lineTo(px, view.Y(0) - 48); ctx.stroke()
    ctx.restore()
    mathLabel(ctx, lbl, px, view.Y(0) - 56, { color: c.third, size: 14, align: 'center' })
  }

  const x = m.x(time)
  const v = m.v(time)
  const px = view.X(x)
  const py = view.Y(0)
  const facing = (Math.abs(v) > 1e-9 ? Math.sign(v) : Math.sign(m.v0 || m.a || 1)) || 1
  car(ctx, px, py, 17, c.primary, facing, c)

  const vmax = Math.max(Math.abs(m.v0), Math.abs(m.v(T)), 1e-9)
  const vl = v / vmax * Math.min(90, w * 0.16)
  arrow(ctx, px, py - 46, px + vl, py - 46, { color: c.primary, width: 2.6 })
  if (Math.abs(vl) > 8) mathLabel(ctx, 'v', px + vl + Math.sign(vl) * 10, py - 46, { color: c.primary, align: 'center' })
  if (Math.abs(m.a) > 1e-12) {
    const al = Math.sign(m.a) * Math.min(60, w * 0.1)
    arrow(ctx, px, py - 64, px + al, py - 64, { color: c.second, width: 2.2 })
    mathLabel(ctx, 'a', px + al + Math.sign(al) * 10, py - 64, { color: c.second, align: 'center' })
  }
  readout(ctx, c, [['t', time, 's'], ['x', x, 'm'], ['v', v, 'm/s']])
}
