const cssVar = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

// Resolves a CSS color expression to a concrete rgb() string by letting the
// browser compute it on a throwaway element. JSXGraph draws colors as SVG
// attributes (not through CSS), so a raw `oklch(from var(--x) ...)` string
// can't be handed to it directly — this is the same hue-shift trick used for
// `--cat-t`/`--cat-g` in projects-index.css, just resolved in JS.
const resolveColor = (expr) => {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;visibility:hidden;color:${expr}`
  document.body.appendChild(probe)
  const rgb = getComputedStyle(probe).color
  probe.remove()
  return rgb
}

class PlotBoard {
  static palette() {
    const primary = cssVar('--color-primary', '#008888')
    return {
      primary,
      text: cssVar('--color-text', '#000000'),
      muted: cssVar('--color-muted', '#888888'),
      secondary: resolveColor(`oklch(from ${primary} l c calc(h + 140))`),
      tertiary: resolveColor(`oklch(from ${primary} l c calc(h - 130))`),
      // Reserved for "this is wrong / out of hypothesis" marks, so a broken
      // case never reads as just another series in the theme colour.
      warn: resolveColor('oklch(0.62 0.20 25)'),
    }
  }

  static create(containerId, boundingBox) {
    const c = PlotBoard.palette()
    const axis = {
      strokeColor: c.muted,
      strokeWidth: 1,
      highlight: false,
      ticks: { strokeColor: c.muted, drawLabels: true, label: { strokeColor: c.muted, fontSize: 12 } },
    }
    return JXG.JSXGraph.initBoard(containerId, {
      boundingbox: boundingBox,
      axis: true,
      showCopyright: false,
      showNavigation: false,
      keepAspectRatio: false,
      pan: { enabled: true, needShift: false, needTwoFingers: false },
      zoom: { enabled: false },
      defaultAxes: { x: axis, y: axis },
    })
  }

  static curve(board, f, color, domain, opts = {}) {
    return board.create('functiongraph', domain ? [f, ...domain] : [f], {
      strokeColor: color, strokeWidth: 2, highlight: false, ...opts,
    })
  }

  // Lollipop bars for a discrete PMF over integers [kMin, kMax] — one
  // segment per k, fixed pixel width regardless of the board's data scale
  // (same trick `vector` uses for its arrowhead gap), so bars stay readable
  // whether k spans 2 values or 50.
  static bars(board, kMin, kMax, pmf, color, widthPx = 14) {
    const items = []
    for (let k = kMin; k <= kMax; k++) {
      items.push(board.create('segment', [[k, 0], [k, pmf(k)]], {
        strokeColor: color, strokeWidth: widthPx, lineCap: 'round', highlight: false, fixed: true,
      }))
    }
    return items
  }

  // Shaded region between two functions over [xmin, xmax], split at every
  // sign change of f - g so the part where f dominates and the part where it
  // does not can be painted differently. That distinction is the point: it
  // makes a violated inequality visible as a region rather than as something
  // the reader has to infer from two crossing lines.
  static signedBand(board, f, g, xmin, xmax, colorPos, colorNeg, opts = {}) {
    const samples = opts.samples ?? 240
    const opacity = opts.opacity ?? 0.18
    const at = i => {
      const x = xmin + (xmax - xmin) * (i / samples)
      const a = f(x), b = g(x)
      return Number.isFinite(a) && Number.isFinite(b) ? [x, a, b] : null
    }
    const emit = (run, positive) => {
      if (run.length < 2) return null
      const xs = [], ys = []
      run.forEach(([x, a]) => { xs.push(x); ys.push(a) })
      for (let i = run.length - 1; i >= 0; i--) { xs.push(run[i][0]); ys.push(run[i][2]) }
      return board.create('curve', [xs, ys], {
        fillColor: positive ? colorPos : colorNeg,
        fillOpacity: opacity, strokeWidth: 0, highlight: false, fixed: true,
      })
    }
    const out = []
    let run = [], positive = null
    for (let i = 0; i <= samples; i++) {
      const p = at(i)
      if (!p) { const o = emit(run, positive); if (o) out.push(o); run = []; positive = null; continue }
      const sign = p[1] >= p[2]
      if (positive === null) positive = sign
      if (sign !== positive) {
        // Carry the crossing point into both runs so the two regions meet
        // instead of leaving a sliver of unpainted gap between them.
        run.push(p)
        const o = emit(run, positive); if (o) out.push(o)
        run = [p]; positive = sign
      } else {
        run.push(p)
      }
    }
    const o = emit(run, positive); if (o) out.push(o)
    return out
  }

  // Filled dot with an optional LaTeX caption, for marking a distinguished
  // point (an equality case, a minimum) that the reader should notice.
  static marker(board, x, y, color, opts = {}) {
    return board.create('point', [x, y], {
      size: opts.size ?? 3, fillColor: color, strokeColor: color,
      strokeWidth: 1, fixed: true, highlight: false, showInfobox: false,
      name: opts.name ?? '', withLabel: !!opts.name, label: { useKatex: true, strokeColor: color, fontSize: 12, offset: opts.offset ?? [8, 8] },
    })
  }

  // Vertical guide, e.g. the left edge x = -y of the inequality's domain.
  static vLine(board, x, color, opts = {}) {
    return board.create('line', [[x, 0], [x, 1]], {
      straightFirst: true, straightLast: true, strokeColor: color,
      strokeWidth: opts.width ?? 1.5, dash: opts.dash ?? 2, highlight: false, fixed: true,
    })
  }

  static hLine(board, y, color, opts = {}) {
    return board.create('line', [[0, y], [1, y]], {
      straightFirst: true, straightLast: true, strokeColor: color,
      strokeWidth: opts.width ?? 1.5, dash: opts.dash ?? 2, highlight: false, fixed: true,
    })
  }

  // Stops the arrowhead `gapPx` short of `to` (in screen pixels, so the gap
  // reads the same regardless of the board's data scale) instead of letting
  // it touch/overlap whatever marker sits at that coordinate.
  static vector(board, from, to, color, gapPx = 8) {
    const dxPx = (to[0] - from[0]) * board.unitX
    const dyPx = (to[1] - from[1]) * board.unitY
    const lenPx = Math.hypot(dxPx, dyPx)
    const t = lenPx > gapPx * 1.5 ? (lenPx - gapPx) / lenPx : 1
    const end = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]
    return board.create('arrow', [from, end], {
      strokeColor: color, strokeWidth: 1.5, highlight: false, fixed: true,
    })
  }

  static _toPx(board, x, y) {
    const c = new JXG.Coords(JXG.COORDS_BY_USER, [x, y], board).scrCoords
    return [c[1], c[2]]
  }

  static _toData(board, px, py) {
    const c = new JXG.Coords(JXG.COORDS_BY_SCREEN, [px, py], board).usrCoords
    return [c[1], c[2]]
  }

  // Rough on-screen size of a LaTeX label in px: collapses each macro
  // (\chi, \Phi, ...) to one glyph and drops grouping/scripting chars,
  // which don't take horizontal room, then estimates from remaining
  // character count. Not pixel-exact, but close enough to compare
  // candidate spots before anything is actually rendered.
  static _labelSizePx(tex, fontSize) {
    const plain = tex.replace(/\\[a-zA-Z]+/g, 'M').replace(/[{}^_$\\]/g, '')
    return [Math.max(plain.length, 2) * fontSize * 0.62, fontSize * 1.5]
  }

  // True if function `f` crosses the pixel rect [left,right] x [top,bottom]
  // at, or between, its sampled points — checking the segment between
  // consecutive samples (not just the samples themselves) matters because
  // a curve that explodes (e.g. a high power) can swing across the whole
  // label band between two adjacent x samples without either endpoint
  // landing inside it.
  static _curveHits(board, f, left, top, right, bottom, pad) {
    const samples = 20
    let prevPy = null
    for (let i = 0; i <= samples; i++) {
      const px = left + (right - left) * (i / samples)
      const dataX = PlotBoard._toData(board, px, 0)[0]
      const dataY = f(dataX)
      const py = Number.isFinite(dataY) ? PlotBoard._toPx(board, dataX, dataY)[1] : null
      if (py !== null) {
        if (py >= top - pad && py <= bottom + pad) return true
        if (prevPy !== null && Math.max(prevPy, py) >= top - pad && Math.min(prevPy, py) <= bottom + pad) return true
      }
      prevPy = py
    }
    return false
  }

  // True if `obstacle` — a curve (x => y) or a guide line ({ x } vertical /
  // { y } horizontal, e.g. an axis or a vector) — passes through the pixel
  // rect [left,right] x [top,bottom].
  static _hits(board, obstacle, left, top, right, bottom, pad) {
    if (typeof obstacle === 'function') return PlotBoard._curveHits(board, obstacle, left, top, right, bottom, pad)
    if ('x' in obstacle) {
      const px = PlotBoard._toPx(board, obstacle.x, 0)[0]
      return px >= left - pad && px <= right + pad
    }
    const py = PlotBoard._toPx(board, 0, obstacle.y)[1]
    return py >= top - pad && py <= bottom + pad
  }

  // Number of obstacles a label box at (px, py) — its top-left corner,
  // matching the text's anchorX:'left'/anchorY:'bottom' — collides with.
  static _collisions(board, obstacles, px, py, boxW, boxH, pad) {
    const left = px, right = px + boxW, top = py - boxH, bottom = py
    return obstacles.reduce((n, o) => n + (PlotBoard._hits(board, o, left, top, right, bottom, pad) ? 1 : 0), 0)
  }

  static _inCanvas(board, px, py, boxW, boxH, edge) {
    return px >= edge && px + boxW <= board.canvasWidth - edge && py - boxH >= edge && py <= board.canvasHeight - edge
  }

  // Places a LaTeX label near (x, y), searching an outward ring of
  // candidate spots for one that clears every obstacle — the board's
  // curves, any extra guide line passed in `obstacles` (a mix of x => y
  // functions and { x } / { y } lines; the axes are always included), and
  // the canvas edge — instead of a fixed pixel offset that can land the
  // label on top of the very thing it's meant to explain. If the board is
  // too crowded for a fully clear spot, keeps the least-colliding
  // candidate seen (always on-canvas) rather than an unchecked fallback.
  static label(board, x, y, tex, color, obstacles = [], opts = {}) {
    const fontSize = opts.fontSize ?? 13
    const all = [...obstacles, { x: 0 }, { y: 0 }]
    const [boxW, boxH] = PlotBoard._labelSizePx(tex, fontSize)
    const pad = 8
    const edge = 16 // stays clear of the CSS edge fade

    const [ax, ay] = PlotBoard._toPx(board, x, y)
    const angles = [0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180]
    let best = null, bestScore = Infinity
    for (let ring = 0; ring < 10 && bestScore > 0; ring++) {
      const radius = 8 + ring * (boxH * 0.75 + 6)
      for (const deg of angles) {
        const rad = deg * Math.PI / 180
        const px = ax + Math.cos(rad) * radius
        const py = ay - Math.sin(rad) * radius
        if (!PlotBoard._inCanvas(board, px, py, boxW, boxH, edge)) continue
        const score = PlotBoard._collisions(board, all, px, py, boxW, boxH, pad)
        if (score < bestScore) { bestScore = score; best = [px, py] }
        if (score === 0) break
      }
    }

    const clampedFallback = () => [
      Math.min(Math.max(ax + 8, edge), board.canvasWidth - edge - boxW),
      Math.min(Math.max(ay - 8, edge + boxH), board.canvasHeight - edge),
    ]
    const [spotPx, spotPy] = best ?? clampedFallback()
    const [lx, ly] = PlotBoard._toData(board, spotPx, spotPy)

    return board.create('text', [lx, ly, tex], {
      useKatex: true, anchorX: 'left', anchorY: 'bottom', fixed: true, highlight: false,
      strokeColor: color, fontSize,
    })
  }
}

export default PlotBoard
