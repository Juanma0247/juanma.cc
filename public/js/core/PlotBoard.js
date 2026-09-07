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

  static curve(board, f, color, domain) {
    return board.create('functiongraph', domain ? [f, ...domain] : [f], {
      strokeColor: color, strokeWidth: 2, highlight: false,
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

  // Nudges the label `offsetPx` away from (x, y) — converted through the
  // board's pixel scale so it reads as the same small screen gap on every
  // board — so it sits near the point it annotates without covering it.
  static label(board, x, y, tex, color, offsetPx = [8, 8]) {
    const dx = offsetPx[0] / board.unitX
    const dy = offsetPx[1] / board.unitY
    return board.create('text', [x + dx, y + dy, tex], {
      useKatex: true, anchorX: 'left', anchorY: 'bottom', fixed: true, highlight: false,
      strokeColor: color, fontSize: 13,
    })
  }
}

export default PlotBoard
