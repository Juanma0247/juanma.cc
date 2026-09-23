import NLPortrait from '/js/lib/NLPortrait.js'
import LSDiagram from '/js/lib/LSDiagram.js'
import { NLField } from '/js/lib/NLField.js'
import { parseExpr, evaluate } from '/js/lib/LSExpr.js'
import {
  texNum, texVec, texSigned, texEigenvalues, prettyVector, nf,
} from '/js/lib/LSAnalysis.js'

const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`pd.nonlinearSystems.${key}`, fallback) : fallback

// The names of the linear classification are the vocabulary of chapter 5 and are
// read from that page's dictionary rather than copied into this one.
const tLin = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`pd.linearSystems.${key}`, fallback) : fallback

const fill = (text, vars) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), text)

// Worked examples from chapter 6, each with the window it is usually drawn in.
const PRESETS = [
  { id: 'example611', f: 'x + exp(-y)', g: '-y', vars: {}, view: [[0, 0], 3.4] },
  { id: 'example631', f: '-x + x^3', g: '-2y', vars: {}, view: [[0, 0], 2.2] },
  { id: 'example632', f: '-y + a x(x^2 + y^2)', g: 'x + a y(x^2 + y^2)', vars: { a: -1 }, view: [[0, 0], 1.6] },
  { id: 'rabbits', f: 'x(3 - x - 2y)', g: 'y(2 - x - y)', vars: {}, view: [[1.5, 1.05], 2.3] },
  { id: 'doubleWell', f: 'y', g: 'x - x^3', vars: {}, view: [[0, 0], 1.9] },
  { id: 'homoclinic', f: 'y', g: 'x - x^2', vars: {}, view: [[0.35, 0], 1.9] },
  { id: 'reversible', f: 'y - y^3', g: '-x - y^2', vars: {}, view: [[-0.4, 0], 2.1] },
  { id: 'pendulum', f: 'y', g: '-sin(x)', vars: {}, view: [[0, 0], 4.6] },
  { id: 'dampedPendulum', f: 'y', g: '-b y - sin(x)', vars: { b: 0.3 }, view: [[0, 0], 4.6] },
  { id: 'dipole', f: '2 x y', g: 'y^2 - x^2', vars: {}, view: [[0, 0], 1.6] },
  { id: 'lotka', f: 'x(a - y)', g: 'y(x - b)', vars: { a: 1, b: 1 }, view: [[1.1, 1.1], 1.9] },
]

const KIND_FALLBACK = {
  saddle: 'Saddle point',
  stableNode: 'Stable node',
  unstableNode: 'Unstable node',
  stableSpiral: 'Stable spiral',
  unstableSpiral: 'Unstable spiral',
  center: 'Center',
  stableStar: 'Stable star node',
  unstableStar: 'Unstable star node',
  stableDegenerate: 'Stable degenerate node',
  unstableDegenerate: 'Unstable degenerate node',
  lineOfFixedPoints: 'Line of fixed points',
  planeOfFixedPoints: 'Plane of fixed points',
}

const ROLE_FALLBACK = {
  slow: 'Slow eigendirection',
  fast: 'Fast eigendirection',
  stableManifold: 'Stable manifold',
  unstableManifold: 'Unstable manifold',
  eigendirection: 'Eigendirection',
  fixedLine: 'Line of fixed points',
}

const OPTION_KEYS = ['grid', 'field', 'streams', 'particles', 'nullclines', 'manifolds', 'basins', 'energy', 'index']

class NonlinearSystems {
  constructor() {
    this.fInput = document.getElementById('p20f')
    this.gInput = document.getElementById('p20g')
    this.stage = document.getElementById('p20Stage')
    this.canvas = document.getElementById('p20Canvas')
    this.controls = document.getElementById('p20Controls')
    this.verdict = document.getElementById('p20Verdict')
    this.params = document.getElementById('p20Params')
    this.paramsWrap = document.getElementById('p20ParamsWrap')
    this.error = document.getElementById('p20Error')
    this.preset = document.getElementById('p20Preset')
    this.speed = document.getElementById('p20Speed')
    this.steps = document.getElementById('p20Steps')
    this.tdCanvas = document.getElementById('p20Td')
    this.list = document.getElementById('p20Points')
    this.summary = document.getElementById('p20Summary')
    this.global = document.getElementById('p20Global')

    this.kindEl = document.getElementById('p20Kind')
    this.kindNote = document.getElementById('p20KindNote')
    this.invariants = document.getElementById('p20Invariants')

    this.fs = document.getElementById('p20Fs')
    this.fsStage = document.getElementById('p20FsStage')
    this.fsControls = document.getElementById('p20FsControls')
    this.fsVerdict = document.getElementById('p20FsVerdict')
    this.fsExit = document.getElementById('p20FsExit')
    this.fsBtn = document.getElementById('p20FsBtn')

    this.paramValues = {}
    this.paramOrder = null
    this.points = []
    this.selected = 0
    this.fsOpen = false
    this.homes = new Map()
  }

  // ── Parameters, created on demand for every free letter ─────────────────

  syncParams(vars) {
    const same = this.paramOrder !== null
      && vars.length === this.paramOrder.length
      && vars.every((v, i) => v === this.paramOrder[i])
    if (same) return
    this.paramOrder = vars.slice()
    this.params.innerHTML = ''
    this.paramsWrap.hidden = vars.length === 0

    for (const name of vars) {
      if (!(name in this.paramValues)) this.paramValues[name] = 1
      const value = this.paramValues[name]

      const row = document.createElement('div')
      row.className = 'p20Param'

      const label = document.createElement('span')
      label.className = 'p20ParamName'
      label.textContent = name

      const numInput = document.createElement('input')
      numInput.type = 'text'
      numInput.className = 'p20ParamValue'
      numInput.value = String(value)
      numInput.setAttribute('inputmode', 'decimal')
      numInput.setAttribute('aria-label', name)

      const range = document.createElement('input')
      range.type = 'range'
      range.className = 'p20ParamRange'
      range.min = String(-this.paramBound(value))
      range.max = String(this.paramBound(value))
      range.step = '0.01'
      range.value = String(value)

      numInput.addEventListener('input', () => {
        const parsed = parseExpr(numInput.value)
        const v = parsed.ok ? evaluate(parsed, {}) : NaN
        numInput.classList.toggle('is-invalid', !Number.isFinite(v))
        if (!Number.isFinite(v)) return
        this.paramValues[name] = v
        const bound = this.paramBound(v)
        range.min = String(-bound)
        range.max = String(bound)
        range.value = String(v)
        this.update()
      })

      range.addEventListener('input', () => {
        const v = Number(range.value)
        this.paramValues[name] = v
        numInput.value = String(Number(v.toFixed(3)))
        numInput.classList.remove('is-invalid')
        this.update()
      })

      row.append(label, numInput, range)
      this.params.appendChild(row)
    }
  }

  paramBound(v) {
    const a = Math.abs(v)
    if (a <= 5) return 5
    return Math.ceil(a * 1.5)
  }

  // ── Update cycle ────────────────────────────────────────────────────────

  update() {
    const field = new NLField(this.fInput.value, this.gInput.value)
    this.fInput.classList.toggle('is-invalid', !!field.badF)
    this.gInput.classList.toggle('is-invalid', !!field.badG)

    this.error.textContent = field.ok ? '' : `${t('errorInvalid', 'Could not read the equations')}: ${field.error}`
    this.error.hidden = field.ok
    if (!field.ok) return

    this.syncParams(field.vars)
    const scope = {}
    for (const name of field.vars) scope[name] = this.paramValues[name]
    field.setParams(scope)

    this.field = field
    this.recompute()
  }

  // Everything that depends on the window: which fixed points exist, the
  // conserved quantity, and the index of the border.
  recompute() {
    if (!this.field) return
    const box = this.portrait.box
    const previous = this.points[this.selected]

    this.points = this.field.fixedPoints(box)
    this.conservative = this.field.isConservative(box)
    this.symmetry = this.field.symmetries(box)
    this.energy = this.conservative ? this.field.energyGrid(box, 150) : null
    this.boxIndex = this.field.indexOfBox(box)

    this.selected = 0
    if (previous && this.points.length) {
      let best = 0, bestD = Infinity
      this.points.forEach((p, i) => {
        const d = Math.hypot(p.x - previous.x, p.y - previous.y)
        if (d < bestD) { bestD = d; best = i }
      })
      this.selected = best
    }

    this.portrait.selected = this.selected
    this.portrait.setSystem(this.field, this.points, this.energy)
    this.syncEnergyOption()
    this.render()
  }

  // The conserved quantity only exists for a conservative system, so its switch
  // is disabled otherwise rather than silently drawing nothing.
  syncEnergyOption() {
    document.querySelectorAll('[data-opt="energy"]').forEach(box => {
      const label = box.closest('label')
      box.disabled = !this.conservative
      if (label) label.classList.toggle('is-disabled', !this.conservative)
      if (!this.conservative && box.checked) {
        box.checked = false
        this.portrait.setOption('energy', false)
      }
    })
  }

  // The name shown for a fixed point. A vanishing Jacobian has no linear type
  // to report, so it gets a name of its own instead of the one analyze() falls
  // back to for a singular matrix.
  kindName(p) {
    if (!p?.info?.ok) return ''
    if (p.jZero) return t('kindHigherOrder', 'Higher-order fixed point')
    return tLin(`kind_${p.info.kind}`, KIND_FALLBACK[p.info.kind] ?? p.info.kind)
  }

  select(i) {
    if (i === this.selected || i < 0 || i >= this.points.length) return
    this.selected = i
    this.portrait.setSelected(i)
    this.render()
  }

  render() {
    this.renderSummary()
    this.renderPoints()
    this.renderSteps()
    this.renderGlobal()
    const p = this.points[this.selected]
    this.diagram.set(p?.info?.det ?? NaN, p?.info?.tau ?? NaN)
  }

  // ── Verdict strip ───────────────────────────────────────────────────────

  renderSummary() {
    const p = this.points[this.selected]
    const n = this.points.length

    if (!n) {
      this.kindEl.textContent = t('noFixedPoints', 'No fixed points in this window')
      this.kindEl.dataset.stability = 'neutral'
      this.kindNote.textContent = t('noFixedPointsNote', 'Pan or zoom out to look for them elsewhere.')
      this.invariants.innerHTML = ''
      this.summary.textContent = ''
      return
    }

    this.kindEl.textContent = this.kindName(p)
    this.kindEl.dataset.stability = p.info.stability

    const notes = [tLin(`stability_${p.info.stability}`, p.info.stability)]
    if (p.info.kind === 'center' || p.info.kind.endsWith('Spiral')) {
      notes.push(tLin(p.info.ccw ? 'rotationCcw' : 'rotationCw', p.info.ccw ? 'counterclockwise' : 'clockwise'))
    }
    this.kindNote.textContent = notes.join(' · ')

    this.summary.textContent = fill(
      n === 1 ? t('summaryOne', '{n} fixed point in this window') : t('summaryMany', '{n} fixed points in this window'),
      { n: String(n) },
    )

    this.invariants.innerHTML = ''
    const stat = (tex, value) => {
      const box = document.createElement('div')
      box.className = 'p20Stat'
      const k = document.createElement('span')
      k.className = 'p20StatKey'
      this.tex(k, tex, false)
      const v = document.createElement('span')
      v.className = 'p20StatValue'
      v.textContent = value
      box.append(k, v)
      this.invariants.appendChild(box)
    }
    stat('(x^*, y^*)', `(${nf(p.x)}, ${nf(p.y)})`)
    stat('\\tau', nf(p.info.tau))
    stat('\\Delta', nf(p.info.det))
    stat('\\tau^2 - 4\\Delta', nf(p.info.disc))
    if (p.index !== null && p.index !== undefined) stat('I', `${p.index > 0 ? '+' : ''}${p.index}`)
  }

  // ── Fixed point list ────────────────────────────────────────────────────

  renderPoints() {
    this.list.innerHTML = ''
    this.points.forEach((p, i) => {
      const card = document.createElement('button')
      card.type = 'button'
      card.className = 'p20Point'
      card.dataset.stability = p.info.stability
      if (i === this.selected) card.classList.add('is-selected')
      card.addEventListener('click', () => this.select(i))

      const coords = document.createElement('span')
      coords.className = 'p20PointCoords'
      this.tex(coords, `(${texNum(p.x)},\\ ${texNum(p.y)})`, false)

      const kind = document.createElement('span')
      kind.className = 'p20PointKind'
      kind.textContent = this.kindName(p)

      const meta = document.createElement('span')
      meta.className = 'p20PointMeta'
      const bits = [`τ = ${nf(p.info.tau)}`, `Δ = ${nf(p.info.det)}`]
      if (p.index !== null && p.index !== undefined) bits.push(`I = ${p.index > 0 ? '+' : ''}${p.index}`)
      meta.textContent = bits.join(' · ')

      const badge = document.createElement('span')
      badge.className = 'p20Badge'
      badge.dataset.verdict = p.verdict
      badge.textContent = t(`verdict_${p.verdict}`, p.verdict)

      card.append(coords, kind, meta, badge)
      this.list.appendChild(card)
    })

    if (!this.points.length) {
      const empty = document.createElement('p')
      empty.className = 'p20Empty'
      empty.textContent = t('noFixedPointsNote', 'Pan or zoom out to look for them elsewhere.')
      this.list.appendChild(empty)
    }
  }

  // ── Worked solution ─────────────────────────────────────────────────────

  tex(el, source, display = true) {
    if (typeof katex === 'undefined') { el.textContent = source; return }
    katex.render(source, el, { throwOnError: false, displayMode: display })
  }

  step(label, source, note) {
    const box = document.createElement('div')
    box.className = 'p20Step'
    const head = document.createElement('div')
    head.className = 'p20StepLabel'
    head.textContent = label
    box.appendChild(head)
    if (source) {
      const math = document.createElement('div')
      math.className = 'p20StepMath'
      this.tex(math, source)
      box.appendChild(math)
    }
    if (note) {
      const p = document.createElement('p')
      p.className = 'p20StepNote'
      p.innerHTML = note
      box.appendChild(p)
      if (window.renderMathInElement) window.renderMathInElement(p)
    }
    this.steps.appendChild(box)
    return box
  }

  renderSteps() {
    this.steps.innerHTML = ''
    const field = this.field
    if (!field?.ok) return
    const p = this.points[this.selected]

    // 1 - the system
    this.step(
      t('stepSystem', 'Step 1 · The system'),
      `\\begin{aligned}
        \\dot{x} &= f(x, y) = ${field.tex.f} \\\\
        \\dot{y} &= g(x, y) = ${field.tex.g}
      \\end{aligned}`,
      t('noteSystem', 'The pair \\((f, g)\\) is a vector field on the plane: it attaches a velocity to every point, and a trajectory is whatever curve follows those velocities.'),
    )

    // 2 - nullclines and fixed points
    const list = this.points.length
      ? this.points.map(q => `(${texNum(q.x)},\\ ${texNum(q.y)})`).join(', \\quad ')
      : `\\varnothing`
    this.step(
      t('stepFixedPoints', 'Step 2 · Nullclines and fixed points'),
      `f(x, y) = 0, \\quad g(x, y) = 0 \\qquad \\Longrightarrow \\qquad ${list}`,
      t('noteFixedPoints', 'The curve \\(f = 0\\) carries purely vertical motion and \\(g = 0\\) purely horizontal motion; where the two nullclines cross, the velocity vanishes and the point is fixed.'),
    )

    if (!p) return

    // 3 - the Jacobian
    this.step(
      t('stepJacobian', 'Step 3 · The Jacobian'),
      `A = \\begin{pmatrix}
        \\dfrac{\\partial f}{\\partial x} & \\dfrac{\\partial f}{\\partial y} \\\\[8pt]
        \\dfrac{\\partial g}{\\partial x} & \\dfrac{\\partial g}{\\partial y}
      \\end{pmatrix}
      = \\begin{pmatrix} ${field.texJ.fx} & ${field.texJ.fy} \\\\[4pt] ${field.texJ.gx} & ${field.texJ.gy} \\end{pmatrix}`,
      t('noteJacobian', 'Write \\(x = x^* + u\\), \\(y = y^* + v\\) with \\(u, v\\) small. Taylor expanding \\(f\\) and \\(g\\) and dropping the quadratic terms leaves \\(\\dot{\\mathbf u} = A\\mathbf u\\): the linearized system.'),
    )

    // 4 - evaluate at the fixed point
    const [a, b, c, d] = p.A
    this.step(
      t('stepEvaluate', 'Step 4 · Evaluate at the fixed point'),
      `A(${texNum(p.x)},\\ ${texNum(p.y)}) =
        \\begin{pmatrix} ${texNum(a)} & ${texNum(b)} \\\\ ${texNum(c)} & ${texNum(d)} \\end{pmatrix}`,
      t('noteEvaluate', 'Every fixed point gets its own matrix, so one system can mix saddles, nodes and spirals in the same picture.'),
    )

    // 5 - trace, determinant, eigenvalues
    const discSign = p.info.disc > 0 ? '>' : (p.info.disc < 0 ? '<' : '=')
    this.step(
      t('stepEigen', 'Step 5 · Trace, determinant and eigenvalues'),
      `\\tau = ${texNum(p.info.tau)}, \\quad \\Delta = ${texNum(p.info.det)}, \\quad \\tau^2 - 4\\Delta = ${texNum(p.info.disc)}
       \\qquad ${texEigenvalues(p.info)}`,
      fill(t('noteEigen', 'The discriminant is \\({disc} {sign} 0\\), so {case}.'), {
        disc: nf(p.info.disc),
        sign: discSign,
        case: tLin(`case_${p.info.eigenType}`, p.info.eigenType),
      }),
    )

    // 6 - eigenvectors
    this.renderEigenStep(p)

    // 7 - how much of it survives
    this.step(
      t('stepValidity', 'Step 6 · What the linearization guarantees'),
      null,
      this.validityText(p),
    )

    // 8 - index
    this.renderIndexStep(p)
  }

  renderEigenStep(p) {
    const r = p.info
    const label = t('stepEigenvectors', 'Step 5b · Eigendirections')
    if (r.eigenType === 'realDistinct' && r.v1 && r.v2) {
      const rows = (r.lines ?? []).map(ln =>
        `\\lambda = ${texNum(ln.lambda)}: \\quad \\mathbf{v} = ${texVec(prettyVector(ln.v))} \\quad (\\text{${tLin(`role_${ln.role}`, ROLE_FALLBACK[ln.role] ?? ln.role)}})`).join(' \\\\[6pt] ')
      this.step(label, `\\begin{gathered} ${rows} \\end{gathered}`,
        r.kind === 'saddle'
          ? t('noteSaddleManifolds', 'At a saddle the two eigendirections are only the tangents at the point. Following the flow away from them draws the full stable and unstable manifolds, the curves that organize the whole portrait.')
          : t('noteEigenvectors', 'Near the fixed point the flow looks like the linear system: trajectories leave or arrive tangent to the slow eigendirection, the one with the smaller \\(|\\lambda|\\).'))
      return
    }
    if (r.eigenType === 'complex') {
      this.step(label, `\\lambda_{1,2} = ${texNum(r.alpha)} \\pm ${texNum(r.omega)}\\,i, \\qquad T = \\frac{2\\pi}{\\omega} = ${texNum(2 * Math.PI / r.omega)}`,
        t('noteComplex', 'Complex eigenvalues mean rotation: there is no straight-line direction, and the trajectories wind around the fixed point with period \\(T = 2\\pi/\\omega\\) while their amplitude follows \\(e^{\\alpha t}\\).'))
      return
    }
    this.step(label, null, t('noteDegenerateEigen', 'The linearization is degenerate here, so it has no pair of independent eigendirections to offer.'))
  }

  renderIndexStep(p) {
    if (p.index === null || p.index === undefined) return
    const sign = p.index > 0 ? '+' : ''
    this.step(
      t('stepIndex', 'Step 7 · Index of the fixed point'),
      `I = \\frac{1}{2\\pi}\\oint_C d\\phi = ${sign}${p.index}`,
      t(`indexNote_${p.index === -1 ? 'saddle' : (p.index === 1 ? 'plusOne' : 'other')}`,
        p.index === -1
          ? 'Walking once counterclockwise around a saddle, the vector field turns once the other way: every saddle has index \\(-1\\).'
          : (p.index === 1
            ? 'The field turns once with the curve, so the index is \\(+1\\). Nodes, spirals and centers all share this value, which is why the index sees stability but not type.'
            : 'The index counts how many net turns the field makes around the curve; a value other than \\(\\pm 1\\) marks a higher-order fixed point such as the dipole.')),
    )
  }

  validityText(p) {
    const kind = `<strong>${this.kindName(p)}</strong>`
    if (p.verdict === 'degenerate') {
      return t('validZeroJacobian', 'Every entry of the Jacobian vanishes here, so the linearized system is \\(\\dot{\\mathbf u} = \\mathbf 0\\) and says nothing whatever about the flow. Only the nonlinear terms decide, and the index still measures them: no simple fixed point can have one other than \\(\\pm 1\\).')
    }
    if (p.verdict === 'robust') {
      return fill(t('validRobust', 'The eigenvalues have nonzero real parts, so the fixed point is hyperbolic. By the Hartman–Grobman theorem the nonlinear portrait near it is a smooth deformation of the linear one: it really is a {kind}, and small changes to the equations cannot change that.'), { kind })
    }
    if (p.verdict === 'typeOnly') {
      return fill(t('validTypeOnly', 'The eigenvalues are real and equal, which is a borderline case. Both have the same nonzero sign, so the stability is still decided, but the nonlinear terms may turn this {kind} into an ordinary node or a spiral.'), { kind })
    }
    // Marginal: the linearization does not decide. Sections 6.5 and 6.6 provide
    // the two arguments that can.
    const parts = [fill(t('validMarginal', 'The linearization predicts a {kind}, and that is a borderline case: its eigenvalues have zero real part, so arbitrarily small nonlinear terms could turn it into a slow spiral. Linearization alone cannot decide.'), { kind })]
    if (p.info.kind === 'center') {
      if (this.conservative) parts.push(t('validConservative', 'The system is conservative, though, and a conserved quantity cannot decrease along a trajectory the way a spiral needs it to. By the theorem of section 6.5 this really is a nonlinear center.'))
      else if (this.symmetry?.xAxis || this.symmetry?.yAxis) parts.push(t('validReversible', 'The system is reversible, though, and the symmetry maps the outward half of a would-be spiral onto the inward half. By the theorem of section 6.6 this really is a nonlinear center.'))
      else parts.push(t('validUndecided', 'Neither of the two tests of this chapter applies here: the system is neither conservative nor reversible, so the question has to be settled by hand.'))
    }
    return parts.join(' ')
  }

  // ── Structure of the system ─────────────────────────────────────────────

  renderGlobal() {
    this.global.innerHTML = ''
    if (!this.field?.ok) return

    const row = (title, value, note, state) => {
      const box = document.createElement('div')
      box.className = 'p20GlobalRow'
      box.dataset.state = state
      const h = document.createElement('h4')
      h.textContent = title
      const v = document.createElement('p')
      v.className = 'p20GlobalValue'
      v.innerHTML = value
      const n = document.createElement('p')
      n.className = 'p20GlobalNote'
      n.innerHTML = note
      box.append(h, v, n)
      if (window.renderMathInElement) window.renderMathInElement(box)
      this.global.appendChild(box)
    }

    const divTex = `\\(\\nabla \\cdot \\mathbf{f} = \\dfrac{\\partial f}{\\partial x} + \\dfrac{\\partial g}{\\partial y}`
      + ` = \\left(${this.field.texJ.fx}\\right) + \\left(${this.field.texJ.gy}\\right)${this.conservative ? ' = 0' : ''}\\)`
    row(
      t('globalConservative', 'Conserved quantity'),
      this.conservative ? t('yes', 'Yes') : t('no', 'No'),
      this.conservative
        ? `${divTex}. ${t('globalConservativeYes', 'The divergence vanishes, so the flow preserves area and there is a conserved quantity \\(E\\) with \\(f = \\partial E/\\partial y\\) and \\(g = -\\partial E/\\partial x\\). Switch on the level curves to see it: every trajectory rides along one of them, and no fixed point can attract.')}`
        : `${divTex}. ${t('globalConservativeNo', 'The divergence is not identically zero, so the flow does not preserve area and this test finds no conserved quantity.')}`,
      this.conservative ? 'yes' : 'no',
    )

    const sym = []
    if (this.symmetry?.xAxis) sym.push(t('symX', '\\((y, t) \\to (-y, -t)\\)'))
    if (this.symmetry?.yAxis) sym.push(t('symY', '\\((x, t) \\to (-x, -t)\\)'))
    row(
      t('globalReversible', 'Reversibility'),
      sym.length ? t('yes', 'Yes') : t('no', 'No'),
      sym.length
        ? `${sym.join(' · ')}. ${t('globalReversibleYes', 'The system is unchanged when time and one coordinate are both reversed, so the portrait is symmetric about that axis and a predicted center is a true nonlinear center.')}`
        : t('globalReversibleNo', 'Neither of the two reversing symmetries of section 6.6 leaves the system unchanged.'),
      sym.length ? 'yes' : 'no',
    )

    const sum = this.points.reduce((s, q) => s + (q.index ?? 0), 0)
    const known = this.points.every(q => q.index !== null && q.index !== undefined)
    row(
      t('globalIndex', 'Index'),
      known ? `${sum > 0 ? '+' : ''}${sum}` : '—',
      fill(t('globalIndexNote', 'The indices of the fixed points inside the window add up to {sum}, and the index measured directly on the border of the window is {border}. Any closed orbit must enclose fixed points whose indices add up to \\(+1\\).'), {
        sum: known ? `\\(${sum > 0 ? '+' : ''}${sum}\\)` : '—',
        border: this.boxIndex === null || this.boxIndex === undefined ? '—' : `\\(${this.boxIndex > 0 ? '+' : ''}${this.boxIndex}\\)`,
      }),
      'info',
    )
  }

  // ── Fullscreen ──────────────────────────────────────────────────────────

  remember(el) {
    if (!el || this.homes.has(el)) return
    this.homes.set(el, { parent: el.parentElement, next: el.nextElementSibling })
  }

  restore(el) {
    const home = this.homes.get(el)
    if (!home) return
    home.parent.insertBefore(el, home.next)
  }

  openFs() {
    if (this.fsOpen || !this.fs) return
    this.fsOpen = true
    for (const el of [this.stage, this.controls, this.verdict]) this.remember(el)
    this.fsStage.appendChild(this.stage)
    this.fsVerdict.appendChild(this.verdict)
    this.fsControls.appendChild(this.controls)
    this.fs.hidden = false
    document.body.classList.add('p20FsLock')
    requestAnimationFrame(() => this.portrait.resize())
  }

  closeFs() {
    if (!this.fsOpen) return
    this.fsOpen = false
    this.fs.hidden = true
    document.body.classList.remove('p20FsLock')
    for (const el of [this.stage, this.verdict, this.controls]) this.restore(el)
    requestAnimationFrame(() => this.portrait.resize())
  }

  // ── Presets ─────────────────────────────────────────────────────────────

  fillPresets() {
    this.preset.innerHTML = ''
    const blank = document.createElement('option')
    blank.value = ''
    blank.textContent = t('presetPick', 'Choose an example…')
    this.preset.appendChild(blank)
    for (const p of PRESETS) {
      const opt = document.createElement('option')
      opt.value = p.id
      opt.textContent = t(`preset_${p.id}`, p.id)
      this.preset.appendChild(opt)
    }
  }

  applyPreset(id) {
    const preset = PRESETS.find(p => p.id === id)
    if (!preset) return
    this.fInput.value = preset.f
    this.gInput.value = preset.g
    Object.assign(this.paramValues, preset.vars)
    this.paramOrder = null
    this.portrait.home = { center: preset.view[0], range: preset.view[1] }
    this.portrait.center = preset.view[0].slice()
    this.portrait.range = preset.view[1]
    this.portrait.orbits = []
    this.portrait.invalidate()
    this.update()
  }

  // ── Wiring ──────────────────────────────────────────────────────────────

  main() {
    this.portrait = new NLPortrait(this.canvas)
    this.diagram = new LSDiagram(this.tdCanvas)
    this.portrait.onView = () => this.recompute()
    this.portrait.onSelect = i => { this.selected = i; this.render() }

    for (const el of [this.fInput, this.gInput]) {
      el.addEventListener('input', () => { this.preset.value = ''; this.update() })
    }

    this.fillPresets()
    this.preset.addEventListener('change', () => this.applyPreset(this.preset.value))

    document.querySelectorAll('[data-opt]').forEach(box => {
      const key = box.dataset.opt
      if (!OPTION_KEYS.includes(key)) return
      box.checked = this.portrait.opts[key]
      box.addEventListener('change', () => {
        this.portrait.setOption(key, box.checked)
        document.querySelectorAll(`[data-opt="${key}"]`).forEach(other => { other.checked = box.checked })
      })
    })

    this.speed?.addEventListener('input', () => { this.portrait.speed = Number(this.speed.value) })

    document.getElementById('p20ZoomIn')?.addEventListener('click', () => this.portrait.zoom(1 / 1.35))
    document.getElementById('p20ZoomOut')?.addEventListener('click', () => this.portrait.zoom(1.35))
    document.getElementById('p20ResetView')?.addEventListener('click', () => this.portrait.reset())
    document.getElementById('p20ClearOrbits')?.addEventListener('click', () => this.portrait.clearOrbits())

    // The overlay must sit outside .contenedor, which opens its own stacking
    // context and would trap it under the navbar.
    if (this.fs && this.fs.parentElement !== document.body) document.body.appendChild(this.fs)
    this.fsBtn?.addEventListener('click', () => this.openFs())
    this.fsExit?.addEventListener('click', () => this.closeFs())
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.fsOpen) this.closeFs()
    })

    window.addEventListener('langchanged', () => {
      const current = this.preset.value
      this.fillPresets()
      this.preset.value = current
      this.render()
      this.portrait.invalidate()
    })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.portrait.stop()
      else this.portrait.start()
    })

    this.applyPreset('rabbits')
    this.preset.value = 'rabbits'
    this.portrait.start()
  }
}

export default NonlinearSystems
