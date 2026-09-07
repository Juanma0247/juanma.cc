import PlotBoard from '/js/core/PlotBoard.js'
import ExtText from '/js/core/ExtText.js'
import jStat from 'https://cdn.jsdelivr.net/npm/jstat@1.9.6/+esm'

// Per-distribution math: jStat bindings + the plot domain each needs. Kept
// separate from src/data/distributions.ts (build-time-only metadata for the
// .astro markup) because public/js/** is served as static files and can
// never import from src/** — the two are linked only by this shared `key`.
const CONFIG = {
  normal: {
    discrete: false,
    params: ['mu', 'sigma'],
    pdf: (p, x) => jStat.normal.pdf(x, p.mu, p.sigma),
    cdf: (p, x) => jStat.normal.cdf(x, p.mu, p.sigma),
    domain: p => [p.mu - 4 * p.sigma, p.mu + 4 * p.sigma],
  },
  studentt: {
    discrete: false,
    params: ['df'],
    pdf: (p, x) => jStat.studentt.pdf(x, p.df),
    cdf: (p, x) => jStat.studentt.cdf(x, p.df),
    domain: p => [jStat.studentt.inv(0.005, p.df), jStat.studentt.inv(0.995, p.df)],
  },
  chisquare: {
    discrete: false,
    params: ['df'],
    pdf: (p, x) => jStat.chisquare.pdf(x, p.df),
    cdf: (p, x) => jStat.chisquare.cdf(x, p.df),
    domain: p => [0, jStat.chisquare.inv(0.995, p.df)],
  },
  f: {
    discrete: false,
    params: ['df1', 'df2'],
    pdf: (p, x) => jStat.centralF.pdf(x, p.df1, p.df2),
    cdf: (p, x) => jStat.centralF.cdf(x, p.df1, p.df2),
    domain: p => [0, jStat.centralF.inv(0.995, p.df1, p.df2)],
  },
  binomial: {
    discrete: true,
    params: ['n', 'p'],
    pmf: (p, k) => jStat.binomial.pdf(k, p.n, p.p),
    cdf: (p, k) => jStat.binomial.cdf(k, p.n, p.p),
    domain: p => [0, p.n],
  },
  bernoulli: {
    discrete: true,
    params: ['p'],
    pmf: (p, k) => (k === 1 ? p.p : k === 0 ? 1 - p.p : 0),
    cdf: (p, k) => (k < 0 ? 0 : k < 1 ? 1 - p.p : 1),
    domain: () => [0, 1],
  },
  poisson: {
    discrete: true,
    params: ['lambda'],
    pmf: (p, k) => jStat.poisson.pdf(k, p.lambda),
    cdf: (p, k) => jStat.poisson.cdf(k, p.lambda),
    domain: p => [0, Math.max(4, Math.ceil(p.lambda + 4 * Math.sqrt(p.lambda) + 4))],
  },
  exponential: {
    discrete: false,
    params: ['lambda'],
    pdf: (p, x) => jStat.exponential.pdf(x, p.lambda),
    cdf: (p, x) => jStat.exponential.cdf(x, p.lambda),
    domain: p => [0, jStat.exponential.inv(0.995, p.lambda)],
  },
  uniform: {
    discrete: false,
    params: ['a', 'b'],
    pdf: (p, x) => jStat.uniform.pdf(x, p.a, Math.max(p.b, p.a + 0.001)),
    cdf: (p, x) => jStat.uniform.cdf(x, p.a, Math.max(p.b, p.a + 0.001)),
    domain: p => {
      const span = Math.max(p.b - p.a, 0.001)
      return [p.a - 0.15 * span, p.a + span + 0.15 * span]
    },
  },
  gamma: {
    discrete: false,
    params: ['shape', 'scale'],
    pdf: (p, x) => jStat.gamma.pdf(x, p.shape, p.scale),
    cdf: (p, x) => jStat.gamma.cdf(x, p.shape, p.scale),
    domain: p => [0, jStat.gamma.inv(0.995, p.shape, p.scale)],
  },
  beta: {
    discrete: false,
    params: ['alpha', 'beta'],
    pdf: (p, x) => jStat.beta.pdf(x, p.alpha, p.beta),
    cdf: (p, x) => jStat.beta.cdf(x, p.alpha, p.beta),
    domain: () => [0, 1],
  },
}

class Distributions {
  constructor() {
    this.board = null
    this.plot = null
    this.active = 'normal'
    this.picker = document.querySelectorAll('.p18PickBtn')
    this.evalInput = document.getElementById('p18Eval')
  }

  currentParams(key) {
    const values = {}
    for (const key_ of CONFIG[key].params) {
      const input = document.querySelector(`.p18ParamField[data-dist="${key}"][data-param="${key_}"] input`)
      values[key_] = parseFloat(input.value)
    }
    return values
  }

  peakValue(key, cfg, params, domain) {
    let peak = 0
    if (cfg.discrete) {
      for (let k = Math.ceil(domain[0]); k <= Math.floor(domain[1]); k++) peak = Math.max(peak, cfg.pmf(params, k))
    } else {
      const steps = 200
      for (let i = 0; i <= steps; i++) {
        const x = domain[0] + (domain[1] - domain[0]) * (i / steps)
        peak = Math.max(peak, cfg.pdf(params, x))
      }
    }
    return peak || 1
  }

  // Widens a discrete domain a bit past its exact [kMin, kMax] for display,
  // so the outermost bars get breathing room instead of sitting flush
  // against the plot edge — Bernoulli (only 2 bars spanning the whole
  // support) needs proportionally the most padding. Continuous domains are
  // already framed the way each distribution wants, so they pass through.
  viewDomain(cfg, domain) {
    if (!cfg.discrete) return domain
    const kMin = Math.ceil(domain[0])
    const kMax = Math.floor(domain[1])
    const pad = Math.max(0.75, (kMax - kMin) * 0.12)
    return [kMin - pad, kMax + pad]
  }

  draw() {
    const key = this.active
    const cfg = CONFIG[key]
    const params = this.currentParams(key)
    const domain = cfg.domain(params)

    this.board.suspendUpdate()
    if (this.plot) this.board.removeObject(this.plot)

    const c = PlotBoard.palette()
    const evalRaw = parseFloat(this.evalInput.value)
    const x0 = cfg.discrete
      ? Math.min(Math.max(Math.round(evalRaw), Math.ceil(domain[0])), Math.floor(domain[1]))
      : Math.min(Math.max(evalRaw, domain[0]), domain[1])

    let curveOrBars
    let y0
    if (cfg.discrete) {
      const kMin = Math.ceil(domain[0])
      const kMax = Math.floor(domain[1])
      curveOrBars = PlotBoard.bars(this.board, kMin, kMax, k => cfg.pmf(params, k), c.primary)
      y0 = cfg.pmf(params, x0)
    } else {
      curveOrBars = [PlotBoard.curve(this.board, x => cfg.pdf(params, x), c.primary, domain)]
      y0 = cfg.pdf(params, x0)
    }

    const point = this.board.create('point', [x0, y0], {
      strokeColor: c.secondary, fillColor: c.secondary, size: 3, name: '', fixed: true, highlight: false,
    })
    const vector = PlotBoard.vector(this.board, [x0, 0], [x0, y0], c.secondary)
    const tex = cfg.discrete ? `P(X=${x0})` : `f(${x0.toFixed(2)})`
    const obstacles = cfg.discrete ? [{ x: x0 }] : [x => cfg.pdf(params, x), { x: x0 }]
    const label = PlotBoard.label(this.board, x0, y0, tex, c.secondary, obstacles)

    this.plot = [...curveOrBars, point, vector, label]

    const peak = this.peakValue(key, cfg, params, domain)
    const [viewMin, viewMax] = this.viewDomain(cfg, domain)
    this.board.setBoundingBox([viewMin, peak * 1.15, viewMax, -peak * 0.12])
    this.board.unsuspendUpdate()

    const pdfTex = cfg.discrete ? `P(X=${x0})=${y0.toFixed(4)}` : `f(${x0.toFixed(2)})=${y0.toFixed(4)}`
    const cdfTex = cfg.discrete ? `P(X\\le ${x0})=${cfg.cdf(params, x0).toFixed(4)}` : `F(${x0.toFixed(2)})=${cfg.cdf(params, x0).toFixed(4)}`
    ExtText.tex(pdfTex, 'p18ReadoutPdf')
    ExtText.tex(cdfTex, 'p18ReadoutCdf')
  }

  setActive(key) {
    this.active = key
    this.picker.forEach(btn => btn.classList.toggle('is-active', btn.dataset.dist === key))
    document.querySelectorAll('.p18Formula, .p18Facts, .p18ParamField').forEach(el => {
      el.hidden = el.dataset.dist !== key
    })

    const cfg = CONFIG[key]
    const params = {}
    for (const p of cfg.params) {
      const input = document.querySelector(`.p18ParamField[data-dist="${key}"][data-param="${p}"] input`)
      params[p] = parseFloat(input.value)
    }
    const domain = cfg.domain(params)
    const evalLabel = document.getElementById('p18EvalLabel')
    if (cfg.discrete) {
      const kMin = Math.ceil(domain[0])
      const kMax = Math.floor(domain[1])
      this.evalInput.min = kMin
      this.evalInput.max = kMax
      this.evalInput.step = 1
      this.evalInput.value = Math.round((kMin + kMax) / 2)
      evalLabel.textContent = 'k'
    } else {
      this.evalInput.min = domain[0]
      this.evalInput.max = domain[1]
      this.evalInput.step = (domain[1] - domain[0]) / 100
      this.evalInput.value = Math.round((domain[0] + domain[1]) / 2 * 100) / 100
      evalLabel.textContent = 'x'
    }

    this.draw()
  }

  main() {
    this.board = PlotBoard.create('p18PlotContainer', [-4, 1, 4, -0.1])

    this.picker.forEach(btn => {
      btn.addEventListener('click', () => this.setActive(btn.dataset.dist))
    })

    document.querySelectorAll('.p18ParamField input').forEach(input => {
      input.addEventListener('input', () => { if (input.closest('.p18ParamField').dataset.dist === this.active) this.draw() })
    })
    this.evalInput.addEventListener('input', () => this.draw())

    document.querySelectorAll('.p18JumpBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActive(btn.dataset.dist)
        document.getElementById('p18Sandbox').scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })

    this.setActive('normal')
  }
}

export default Distributions
