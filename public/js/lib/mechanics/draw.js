// Canvas drawing primitives shared by the simulations: a world-to-screen view,
// arrows for vectors, dimension lines, the ground, a building, a car, blocks,
// pulleys and ropes.

import { fmt, LABEL_FONT, UI_FONT } from './core.js'

// Fits the world rectangle [x0, x1] × [y0, y1] into the canvas with a uniform
// scale, y pointing up.
export class View {
  constructor(w, h, box, pad = 28) {
    const [x0, x1, y0, y1] = box
    const pads = typeof pad === 'number' ? { l: pad, r: pad, t: pad, b: pad } : pad
    const sw = (w - pads.l - pads.r) / Math.max(1e-9, x1 - x0)
    const sh = (h - pads.t - pads.b) / Math.max(1e-9, y1 - y0)
    this.s = Math.min(sw, sh)
    const usedW = (x1 - x0) * this.s
    const usedH = (y1 - y0) * this.s
    this.ox = pads.l + (w - pads.l - pads.r - usedW) / 2 - x0 * this.s
    this.oy = pads.t + (h - pads.t - pads.b - usedH) / 2 + y1 * this.s
    this.w = w
    this.h = h
  }

  // A horizontal strip: [x0, x1] fills the width and y = 0 sits at a fraction
  // of the height, for scenes that live on a road.
  static strip(w, h, x0, x1, baseFrac = 0.7, padX = 26) {
    const v = Object.create(View.prototype)
    v.s = (w - 2 * padX) / Math.max(1e-9, x1 - x0)
    v.ox = padX - x0 * v.s
    v.oy = h * baseFrac
    v.w = w
    v.h = h
    return v
  }

  X(x) { return this.ox + x * this.s }
  Y(y) { return this.oy - y * this.s }
  worldX(px) { return (px - this.ox) / this.s }
  worldY(py) { return (this.oy - py) / this.s }
}

export function arrow(ctx, x1, y1, x2, y2, { color = '#000', width = 2.2, head = 9, dash = null, alpha = 1 } = {}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len < 0.5) return
  const ux = dx / len
  const uy = dy / len
  const hd = Math.min(head, len * 0.6)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  if (dash) ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2 - ux * hd * 0.8, y2 - uy * hd * 0.8)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - ux * hd - uy * hd * 0.45, y2 - uy * hd + ux * hd * 0.45)
  ctx.lineTo(x2 - ux * hd + uy * hd * 0.45, y2 - uy * hd - ux * hd * 0.45)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// Math-looking label: the first glyph italic, subscripts after an underscore.
// "v_0" draws v with a small 0; "m_1g" draws m₁g.
export function mathLabel(ctx, src, x, y, { color = '#000', size = 15, align = 'left', baseline = 'middle', bg = null } = {}) {
  const parts = []
  let i = 0
  while (i < src.length) {
    if (src[i] === '_') {
      let j = i + 1
      if (src[j] === '{') { const k = src.indexOf('}', j); parts.push({ s: src.slice(j + 1, k), sub: true }); i = k + 1; continue }
      parts.push({ s: src[j], sub: true })
      i = j + 1
      continue
    }
    parts.push({ s: src[i], sub: false })
    i++
  }
  ctx.save()
  const fontMain = `italic ${size}px ${LABEL_FONT}`
  const fontSub = `${Math.round(size * 0.68)}px ${LABEL_FONT}`
  let width = 0
  for (const p of parts) {
    ctx.font = p.sub ? fontSub : (/[A-Za-zα-ωΑ-Ω]/.test(p.s) ? fontMain : `${size}px ${LABEL_FONT}`)
    p.w = ctx.measureText(p.s).width
    width += p.w
  }
  let cx = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x
  const cy = baseline === 'top' ? y + size * 0.5 : baseline === 'bottom' ? y - size * 0.5 : y
  if (bg) {
    ctx.fillStyle = bg
    ctx.globalAlpha = 0.82
    ctx.fillRect(cx - 3, cy - size * 0.62, width + 6, size * 1.24)
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  for (const p of parts) {
    ctx.font = p.sub ? fontSub : (/[A-Za-zα-ωΑ-Ω]/.test(p.s) ? fontMain : `${size}px ${LABEL_FONT}`)
    ctx.fillText(p.s, cx, p.sub ? cy + size * 0.28 : cy)
    cx += p.w
  }
  ctx.restore()
  return width
}

export function text(ctx, s, x, y, { color = '#000', size = 12, align = 'left', baseline = 'middle', font = UI_FONT, bold = false } = {}) {
  ctx.save()
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(s, x, y)
  ctx.restore()
}

// Measurement line with end ticks and a centred label.
export function dimLine(ctx, x1, y1, x2, y2, label, { color = '#888', size = 12, side = 1 } = {}) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 4) return
  const nx = -(y2 - y1) / len
  const ny = (x2 - x1) / len
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.setLineDash([4, 3])
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.setLineDash([])
  for (const [px, py] of [[x1, y1], [x2, y2]]) {
    ctx.beginPath(); ctx.moveTo(px - nx * 5, py - ny * 5); ctx.lineTo(px + nx * 5, py + ny * 5); ctx.stroke()
  }
  ctx.restore()
  if (label) {
    const mx = (x1 + x2) / 2 + nx * 12 * side
    const my = (y1 + y2) / 2 + ny * 12 * side
    text(ctx, label, mx, my, { color, size, align: 'center' })
  }
}

export function ground(ctx, view, y, x0, x1, c) {
  const py = view.Y(y)
  const a = view.X(x0)
  const b = view.X(x1)
  ctx.save()
  ctx.strokeStyle = c.muted
  ctx.lineWidth = 1.6
  ctx.beginPath(); ctx.moveTo(a, py); ctx.lineTo(b, py); ctx.stroke()
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.45
  for (let x = a; x < b; x += 10) {
    ctx.beginPath(); ctx.moveTo(x, py + 1); ctx.lineTo(x - 7, py + 8); ctx.stroke()
  }
  ctx.restore()
}

export function building(ctx, view, x, w, hgt, c) {
  const px = view.X(x)
  const pw = w * view.s
  const top = view.Y(hgt)
  const base = view.Y(0)
  ctx.save()
  ctx.fillStyle = c.soft
  ctx.strokeStyle = c.muted
  ctx.lineWidth = 1.2
  ctx.fillRect(px, top, pw, base - top)
  ctx.strokeRect(px, top, pw, base - top)
  ctx.globalAlpha = 0.5
  const cols = Math.max(1, Math.floor(pw / 14))
  const rows = Math.max(1, Math.floor((base - top) / 18))
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const wx = px + 4 + i * (pw - 8) / cols
      const wy = top + 6 + j * (base - top - 8) / rows
      ctx.strokeRect(wx, wy, Math.max(2, (pw - 8) / cols - 4), Math.max(2, (base - top - 8) / rows - 6))
    }
  }
  ctx.restore()
}

export function ball(ctx, x, y, r, color, ring = null) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  if (ring) {
    ctx.strokeStyle = ring
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
  ctx.restore()
}

// A side view of a car, centred on (x, y = road level), facing +x or −x.
export function car(ctx, x, y, size, color, facing = 1, c = null) {
  const w = size * 2.2
  const h = size * 0.62
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(facing, 1)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(-w / 2, -h * 0.35)
  ctx.lineTo(-w / 2, -h)
  ctx.lineTo(-w * 0.22, -h)
  ctx.lineTo(-w * 0.08, -h * 1.7)
  ctx.lineTo(w * 0.22, -h * 1.7)
  ctx.lineTo(w * 0.36, -h)
  ctx.lineTo(w / 2, -h * 0.92)
  ctx.lineTo(w / 2, -h * 0.35)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = c ? c.bg : '#fff'
  ctx.globalAlpha = 0.8
  ctx.fillRect(-w * 0.04, -h * 1.58, w * 0.22, h * 0.5)
  ctx.globalAlpha = 1
  ctx.fillStyle = c ? c.text : '#000'
  for (const wx of [-w * 0.3, w * 0.3]) {
    ctx.beginPath(); ctx.arc(wx, -h * 0.3, h * 0.36, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

// Block of world size (bw × bh) whose bottom-centre sits at (x, y), rotated by
// `angle` (radians, counter-clockwise) about that point.
export function block(ctx, view, x, y, bw, bh, angle, { fill, stroke, label = '', labelColor } = {}) {
  ctx.save()
  ctx.translate(view.X(x), view.Y(y))
  ctx.rotate(-angle)
  const w = bw * view.s
  const hh = bh * view.s
  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.roundRect(-w / 2, -hh, w, hh, 3)
  ctx.fill()
  ctx.stroke()
  if (label) mathLabel(ctx, label, 0, -hh / 2, { color: labelColor ?? stroke, size: Math.min(16, Math.max(11, hh * 0.38)), align: 'center' })
  ctx.restore()
}

export function pulley(ctx, px, py, r, c) {
  ctx.save()
  ctx.strokeStyle = c.text
  ctx.fillStyle = c.bg
  ctx.lineWidth = 1.6
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = c.text
  ctx.beginPath(); ctx.arc(px, py, Math.max(2, r * 0.18), 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

export function rope(ctx, pts, c) {
  ctx.save()
  ctx.strokeStyle = c.text
  ctx.lineWidth = 1.4
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.stroke()
  ctx.restore()
}

// Horizontal ruler with metre ticks along y = yWorld.
export function ruler(ctx, view, x0, x1, yWorld, c, unit = 'm') {
  const span = x1 - x0
  const raw = span / Math.max(3, Math.floor((x1 - x0) * view.s / 70))
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag
  const py = view.Y(yWorld)
  ctx.save()
  ctx.strokeStyle = c.muted
  ctx.fillStyle = c.muted
  ctx.lineWidth = 1
  ctx.font = `10px ${UI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (let v = Math.ceil(x0 / step) * step; v <= x1 + 1e-9; v += step) {
    const px = view.X(v)
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + 5); ctx.stroke()
    ctx.fillText(`${fmt(v, 3)}${unit ? ' ' + unit : ''}`, px, py + 7)
  }
  ctx.restore()
}

// Vertical scale along x = xWorld.
export function vruler(ctx, view, y0, y1, xWorld, c, unit = 'm') {
  const span = y1 - y0
  const raw = span / Math.max(3, Math.floor((y1 - y0) * view.s / 50))
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag
  const px = view.X(xWorld)
  ctx.save()
  ctx.strokeStyle = c.muted
  ctx.fillStyle = c.muted
  ctx.lineWidth = 1
  ctx.font = `10px ${UI_FONT}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.beginPath(); ctx.moveTo(px, view.Y(y0)); ctx.lineTo(px, view.Y(y1)); ctx.stroke()
  for (let v = Math.ceil(y0 / step) * step; v <= y1 + 1e-9; v += step) {
    const py = view.Y(v)
    ctx.beginPath(); ctx.moveTo(px - 4, py); ctx.lineTo(px, py); ctx.stroke()
    ctx.fillText(`${fmt(v, 3)}${unit ? ' ' + unit : ''}`, px - 6, py)
  }
  ctx.restore()
}

export function trail(ctx, pts, color, { width = 1.6, dash = [3, 4], alpha = 0.7 } = {}) {
  if (pts.length < 2) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.stroke()
  ctx.restore()
}

// Live values in the top-left corner: rows of [symbol, value, unit].
export function readout(ctx, c, rows, x = 12, y = 16) {
  rows.forEach(([sym, value, unit], i) => {
    const yy = y + i * 18
    const wSym = mathLabel(ctx, sym, x, yy, { color: c.text, size: 14 })
    text(ctx, ` = ${fmt(value, 4)} ${unit}`, x + wSym, yy, { color: c.text, size: 12.5 })
  })
}

export function arcAngle(ctx, cx, cy, r, a0, a1, color, label = '') {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.3
  ctx.beginPath()
  ctx.arc(cx, cy, r, -a0, -a1, a1 > a0)
  ctx.stroke()
  ctx.restore()
  if (label) {
    const am = (a0 + a1) / 2
    mathLabel(ctx, label, cx + Math.cos(am) * (r + 12), cy - Math.sin(am) * (r + 12), { color, size: 13, align: 'center' })
  }
}
