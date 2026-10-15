// Free-body diagrams: one card per body, drawn in SVG with KaTeX labels. Each
// force is an arrow from the body at its real direction, with a length that
// grows with its magnitude once it is known; forces that are not along the
// chosen axes are also drawn split into their components (dashed). The axes
// are rotated with the body when it rests on an incline.

import { h, tex, texNum } from './core.js'

const NS = 'http://www.w3.org/2000/svg'
const svgEl = (tag, attrs) => {
  const el = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

// body: { title, axis: degrees of the x axis, shape: 'box' | 'dot', forces: [
//   { label (tex), angle (deg, world, counter-clockwise from +x), value (N or NaN),
//     color, components: bool, compLabels: [tex along x, tex along y] } ],
//   accel: { angle, label } }
export function renderFbd(container, bodies, palette) {
  container.innerHTML = ''
  for (const body of bodies) container.append(card(body, palette))
}

function card(body, c) {
  const stage = h('div', { class: 'mxFbdStage' })
  const S = 220
  const svg = svgEl('svg', { viewBox: `${-S / 2} ${-S / 2} ${S} ${S}` })
  stage.append(svg)
  const defs = svgEl('defs', {})
  svg.append(defs)
  const markers = new Map()
  const marker = color => {
    if (markers.has(color)) return markers.get(color)
    const id = `mxArrow${Math.random().toString(36).slice(2, 8)}`
    const m = svgEl('marker', { id, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' })
    m.append(svgEl('path', { d: 'M0 0 L10 5 L0 10 z', fill: color }))
    defs.append(m)
    markers.set(color, id)
    return id
  }
  const rad = d => d * Math.PI / 180
  const ax = body.axis ?? 0

  // Axes
  for (const [ang, name] of [[ax, 'x'], [ax + 90, 'y']]) {
    const ex = Math.cos(rad(ang)) * 98
    const ey = -Math.sin(rad(ang)) * 98
    svg.append(svgEl('line', { x1: -ex, y1: -ey, x2: ex, y2: ey, stroke: c.muted, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: 0.8 }))
    stage.append(label(`${name}`, 50 + ex / S * 100 * 1.06, 50 + ey / S * 100 * 1.06, c.muted, true))
  }

  const known = body.forces.filter(f => Number.isFinite(f.value) && f.value > 1e-12)
  const maxF = Math.max(...known.map(f => f.value), 1e-9)
  const lenOf = f => (Number.isFinite(f.value) ? 30 + 55 * Math.min(1, f.value / maxF) : 62)

  // Body
  if (body.shape === 'dot') svg.append(svgEl('circle', { cx: 0, cy: 0, r: 6, fill: c.text }))
  else {
    const g = svgEl('g', { transform: `rotate(${-ax})` })
    g.append(svgEl('rect', { x: -18, y: -14, width: 36, height: 28, rx: 3, fill: c.soft, stroke: c.text, 'stroke-width': 1.4 }))
    svg.append(g)
  }

  const items = []
  for (const f of body.forces) {
    if (Number.isFinite(f.value) && f.value < 1e-12 && !f.keepZero) continue
    const L = lenOf(f)
    const ux = Math.cos(rad(f.angle))
    const uy = -Math.sin(rad(f.angle))
    const color = c[f.color] ?? f.color ?? c.primary
    if (f.components) {
      for (const [k, cang] of [[0, ax], [1, ax + 90]]) {
        const proj = Math.cos(rad(f.angle - cang))
        if (Math.abs(proj) < 0.02) continue
        const cx = Math.cos(rad(cang)) * L * proj
        const cy = -Math.sin(rad(cang)) * L * proj
        svg.append(svgEl('line', { x1: 0, y1: 0, x2: cx, y2: cy, stroke: color, 'stroke-width': 1.4, 'stroke-dasharray': '4 3', opacity: 0.75, 'marker-end': `url(#${marker(color)})` }))
        if (f.compLabels?.[k]) stage.append(label(f.compLabels[k], 50 + (cx * 1.18) / S * 100, 50 + (cy * 1.18) / S * 100, color, false, true))
      }
    }
    svg.append(svgEl('line', { x1: ux * 8, y1: uy * 8, x2: ux * L, y2: uy * L, stroke: color, 'stroke-width': 2.4, 'marker-end': `url(#${marker(color)})` }))
    stage.append(label(f.label, 50 + (ux * (L + 16)) / S * 100, 50 + (uy * (L + 16)) / S * 100, color))
    items.push({ f, color })
  }
  if (body.accel && Number.isFinite(body.accel.value) && Math.abs(body.accel.value) > 1e-9) {
    const ang = body.accel.value > 0 ? body.accel.angle : body.accel.angle + 180
    const ux = Math.cos(rad(ang))
    const uy = -Math.sin(rad(ang))
    svg.append(svgEl('line', { x1: ux * 30 - uy * 26, y1: uy * 30 + ux * 26, x2: ux * 70 - uy * 26, y2: uy * 70 + ux * 26, stroke: c.third, 'stroke-width': 2, 'stroke-dasharray': '6 3', 'marker-end': `url(#${marker(c.third)})` }))
    stage.append(label('\\vec a', 50 + (ux * 80 - uy * 26) / S * 100, 50 + (uy * 80 + ux * 26) / S * 100, c.third))
  }

  const list = h('ul', { class: 'mxFbdList' })
  for (const { f, color } of items) {
    list.append(h('li', {},
      h('span', { class: 'mxFbdDot', style: `background:${color}` }),
      h('span', { html: tex(`${f.label}${Number.isFinite(f.value) ? ` = ${texNum(f.value)}\\,\\text{N}` : ''}`) }),
      f.note ? h('span', { class: 'mxHint' }, ` · ${f.note}`) : null))
  }
  return h('div', { class: 'mxFbdCard' },
    h('h3', { class: 'mxFbdTitle', html: body.title }),
    stage,
    list,
    body.eqs?.length ? h('div', { class: 'mxFbdEqs', html: body.eqs.map(e => tex(e, true)).join('') }) : null)
}

function label(src, xPct, yPct, color, plain = false, small = false) {
  const el = h('span', { class: 'mxFbdLabel', style: `left:${xPct}%;top:${yPct}%;color:${color};${small ? 'font-size:.75rem;' : ''}` })
  el.innerHTML = plain ? `<i>${src}</i>` : tex(src)
  return el
}
