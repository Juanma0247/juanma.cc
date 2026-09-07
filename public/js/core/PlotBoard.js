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
      pan: { enabled: false },
      zoom: { enabled: false },
      defaultAxes: { x: axis, y: axis },
    })
  }

  static curve(board, f, color, domain) {
    return board.create('functiongraph', domain ? [f, ...domain] : [f], {
      strokeColor: color, strokeWidth: 2, highlight: false,
    })
  }

  static vector(board, from, to, color) {
    return board.create('arrow', [from, to], {
      strokeColor: color, strokeWidth: 1.5, highlight: false, fixed: true,
    })
  }

  static label(board, x, y, tex, color, anchorX = 'left') {
    return board.create('text', [x, y, tex], {
      useKatex: true, anchorX, anchorY: 'bottom', fixed: true, highlight: false,
      strokeColor: color, fontSize: 13,
    })
  }
}

export default PlotBoard
