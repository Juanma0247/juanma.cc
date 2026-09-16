import LSPortrait from '/js/lib/LSPortrait.js'
import LSDiagram from '/js/lib/LSDiagram.js'
import { parseExpr, evaluate } from '/js/lib/LSExpr.js'
import {
  analyze, texNum, texVec, texSigned, texEigenvalues, texGeneralSolution, prettyVector, nf,
} from '/js/lib/LSAnalysis.js'

const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`pd.linearSystems.${key}`, fallback) : fallback

const fill = (text, vars) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), text)

// Worked examples from chapter 5. The ones written with letters double as a demo
// of the parameter inputs: sweeping them walks through whole families of
// portraits, the way figure 5.1.5 does for a single parameter a.
const PRESETS = [
  { id: 'example521', A: ['1', '1', '4', '-2'], vars: {} },
  { id: 'harmonic', A: ['0', '1', '-w^2', '0'], vars: { w: 1.2 } },
  { id: 'damped', A: ['0', '1', '-w^2', '-2b'], vars: { w: 1.4, b: 0.35 } },
  { id: 'uncoupled', A: ['a', '0', '0', '-1'], vars: { a: -2 } },
  { id: 'star', A: ['k', '0', '0', 'k'], vars: { k: -1 } },
  { id: 'degenerate', A: ['k', '1', '0', 'k'], vars: { k: -1 } },
  { id: 'example526', A: ['1', '2', '3', '4'], vars: {} },
  { id: 'example527', A: ['2', '1', '3', '4'], vars: {} },
  { id: 'romeo', A: ['0', 'a', '-b', '0'], vars: { a: 1, b: 1 } },
  { id: 'cautious', A: ['a', 'b', 'b', 'a'], vars: { a: -1, b: 1.5 } },
  { id: 'fixedLine', A: ['1', '1', '1', '1'], vars: {} },
  { id: 'rotation', A: ['-1/4', '-pi', 'pi', '-1/4'], vars: {} },
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
  slow: 'slow eigendirection',
  fast: 'fast eigendirection',
  stableManifold: 'stable manifold',
  unstableManifold: 'unstable manifold',
  eigendirection: 'eigendirection',
  fixedLine: 'line of fixed points',
}

const OPTION_KEYS = ['grid', 'field', 'streams', 'particles', 'eigen', 'nullclines']

class LinearSystems {
  constructor() {
    this.inputs = ['a', 'b', 'c', 'd'].map(k => document.getElementById(`p19${k}`))
    this.stage = document.getElementById('p19Stage')
    this.canvas = document.getElementById('p19Canvas')
    this.controls = document.getElementById('p19Controls')
    this.verdict = document.getElementById('p19Verdict')
    this.params = document.getElementById('p19Params')
    this.paramsWrap = document.getElementById('p19ParamsWrap')
    this.error = document.getElementById('p19Error')
    this.preset = document.getElementById('p19Preset')
    this.speed = document.getElementById('p19Speed')
    this.steps = document.getElementById('p19Steps')
    this.tdCanvas = document.getElementById('p19Td')

    this.kindEl = document.getElementById('p19Kind')
    this.kindNote = document.getElementById('p19KindNote')
    this.invariants = document.getElementById('p19Invariants')
    this.eigenSummary = document.getElementById('p19EigenSummary')

    this.fs = document.getElementById('p19Fs')
    this.fsStage = document.getElementById('p19FsStage')
    this.fsControls = document.getElementById('p19FsControls')
    this.fsVerdict = document.getElementById('p19FsVerdict')
    this.fsExit = document.getElementById('p19FsExit')
    this.fsBtn = document.getElementById('p19FsBtn')

    this.paramValues = {}
    this.paramOrder = []
    this.fsOpen = false
    this.homes = new Map()
  }

  // ── Reading the matrix ──────────────────────────────────────────────────

  readMatrix() {
    const parsed = this.inputs.map(el => parseExpr(el.value))
    parsed.forEach((p, i) => {
      this.inputs[i].classList.toggle('is-invalid', !p.ok)
    })
    const bad = parsed.find(p => !p.ok)
    const vars = []
    for (const p of parsed) for (const v of p.vars) if (!vars.includes(v)) vars.push(v)
    return { parsed, vars, error: bad ? bad.error : null }
  }

  // ── Parameter inputs, created on demand for every free letter ───────────

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
      row.className = 'p19Param'

      const label = document.createElement('span')
      label.className = 'p19ParamName'
      label.textContent = name

      const num = document.createElement('input')
      num.type = 'text'
      num.className = 'p19ParamValue'
      num.value = String(value)
      num.setAttribute('inputmode', 'decimal')
      num.setAttribute('aria-label', name)

      const range = document.createElement('input')
      range.type = 'range'
      range.className = 'p19ParamRange'
      range.min = String(-this.paramBound(value))
      range.max = String(this.paramBound(value))
      range.step = '0.01'
      range.value = String(value)

      num.addEventListener('input', () => {
        const parsedValue = parseExpr(num.value)
        const v = parsedValue.ok ? evaluate(parsedValue, {}) : NaN
        num.classList.toggle('is-invalid', !Number.isFinite(v))
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
        num.value = String(Number(v.toFixed(3)))
        num.classList.remove('is-invalid')
        this.update()
      })

      row.append(label, num, range)
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
    const { parsed, vars, error } = this.readMatrix()
    this.syncParams(vars)

    this.error.textContent = error ? `${t('errorInvalid', 'Could not read the matrix')}: ${error}` : ''
    this.error.hidden = !error
    if (error) return

    const scope = {}
    for (const name of vars) scope[name] = this.paramValues[name]

    const A = parsed.map(p => evaluate(p, scope))
    if (!A.every(Number.isFinite)) {
      this.error.textContent = t('errorNotNumeric', 'The entries do not evaluate to numbers.')
      this.error.hidden = false
      return
    }

    this.A = A
    this.texEntries = parsed.map(p => p.tex)
    this.hasVars = vars.length > 0
    const info = analyze(...A)
    this.info = info

    this.portrait.setMatrix(A, info)
    this.diagram.set(info.det, info.tau)
    this.renderVerdict(info)
    this.renderSteps(info)
  }

  // ── Verdict panel ───────────────────────────────────────────────────────

  renderVerdict(r) {
    const kind = t(`kind_${r.kind}`, KIND_FALLBACK[r.kind] ?? r.kind)
    this.kindEl.textContent = kind
    this.kindEl.dataset.stability = r.stability

    const notes = []
    notes.push(t(`stability_${r.stability}`, r.stability))
    if (r.kind === 'center' || r.kind.endsWith('Spiral')) {
      notes.push(t(r.ccw ? 'rotationCcw' : 'rotationCw', r.ccw ? 'counterclockwise' : 'clockwise'))
    }
    if (r.kind === 'lineOfFixedPoints' && r.shear) notes.push(t('shearNote', 'shear flow'))
    this.kindNote.textContent = notes.join(' · ')

    this.invariants.innerHTML = ''
    const stat = (tex, value) => {
      const box = document.createElement('div')
      box.className = 'p19Stat'
      const k = document.createElement('span')
      k.className = 'p19StatKey'
      this.tex(k, tex, false)
      const v = document.createElement('span')
      v.className = 'p19StatValue'
      v.textContent = value
      box.append(k, v)
      this.invariants.appendChild(box)
    }
    stat('\\tau', nf(r.tau))
    stat('\\Delta', nf(r.det))
    stat('\\tau^2 - 4\\Delta', nf(r.disc))

    this.eigenSummary.innerHTML = ''
    const line = (label, tex) => {
      const row = document.createElement('div')
      row.className = 'p19EigenRow'
      const l = document.createElement('span')
      l.className = 'p19EigenLabel'
      l.textContent = label
      const m = document.createElement('span')
      m.className = 'p19EigenMath'
      this.tex(m, tex, false)
      row.append(l, m)
      this.eigenSummary.appendChild(row)
    }

    if (r.eigenType === 'complex') {
      line(t('eigenvalues', 'Eigenvalues'), texEigenvalues(r))
      line(t('realPart', 'Real part'), `\\alpha = ${texNum(r.alpha)}`)
      line(t('frequency', 'Frequency'), `\\omega = ${texNum(r.omega)}, \\quad T = ${texNum(2 * Math.PI / r.omega)}`)
    } else {
      line(t('eigenvalues', 'Eigenvalues'), texEigenvalues(r))
      for (const ln of r.lines) {
        if (ln.role === 'fixedLine') {
          line(t('role_fixedLine', ROLE_FALLBACK.fixedLine), texVec(prettyVector(ln.v)))
        } else {
          line(t(`role_${ln.role}`, ROLE_FALLBACK[ln.role]), `\\lambda = ${texNum(ln.lambda)}, \\ \\mathbf{v} = ${texVec(prettyVector(ln.v))}`)
        }
      }
      if (r.eigenType === 'realRepeated' && r.eigenspaceDim === 2) {
        line(t('eigenspace', 'Eigenspace'), `\\mathbb{R}^2`)
      }
      if (r.eigenType === 'realRepeated' && r.w) {
        line(t('generalizedVector', 'Generalized vector'), `\\mathbf{w} = ${texVec(r.w)}`)
      }
    }
  }

  // ── Worked solution ─────────────────────────────────────────────────────

  tex(el, source, display = true) {
    if (typeof katex === 'undefined') { el.textContent = source; return }
    katex.render(source, el, { throwOnError: false, displayMode: display })
  }

  step(label, source, note) {
    const box = document.createElement('div')
    box.className = 'p19Step'
    const head = document.createElement('div')
    head.className = 'p19StepLabel'
    head.textContent = label
    box.appendChild(head)
    if (source) {
      const math = document.createElement('div')
      math.className = 'p19StepMath'
      this.tex(math, source)
      box.appendChild(math)
    }
    if (note) {
      const p = document.createElement('p')
      p.className = 'p19StepNote'
      p.innerHTML = note
      box.appendChild(p)
      if (window.renderMathInElement) window.renderMathInElement(p)
    }
    this.steps.appendChild(box)
    return box
  }

  renderSteps(r) {
    this.steps.innerHTML = ''
    const [a, b, c, d] = this.A
    const [ta, tb, tc, td] = this.texEntries
    const symbolic = `\\begin{pmatrix} ${ta} & ${tb} \\\\ ${tc} & ${td} \\end{pmatrix}`
    const numeric = `\\begin{pmatrix} ${texNum(a)} & ${texNum(b)} \\\\ ${texNum(c)} & ${texNum(d)} \\end{pmatrix}`

    // 1 - the system
    this.step(
      t('stepSystem', 'Step 1 — The system'),
      `\\begin{aligned}
        \\dot{x} &= ${texNum(a)}\\,x ${texSigned(b)}\\,y \\\\
        \\dot{y} &= ${texNum(c)}\\,x ${texSigned(d)}\\,y
      \\end{aligned}
      \\qquad \\dot{\\mathbf{x}} = A\\mathbf{x}, \\quad A = ${this.hasVars ? `${symbolic} = ${numeric}` : numeric}`,
      t('noteSystem', 'Because \\(\\dot{\\mathbf{x}} = \\mathbf{0}\\) when \\(\\mathbf{x} = \\mathbf{0}\\), the origin is a fixed point for every choice of \\(A\\).'),
    )

    // 2 - trace and determinant
    this.step(
      t('stepTraceDet', 'Step 2 — Trace and determinant'),
      `\\tau = \\operatorname{tr}(A) = ${texNum(a)} ${texSigned(d)} = ${texNum(r.tau)}
       \\qquad
       \\Delta = \\det(A) = (${texNum(a)})(${texNum(d)}) - (${texNum(b)})(${texNum(c)}) = ${texNum(r.det)}`,
      t('noteTraceDet', 'The eigenvalues depend on nothing but these two numbers.'),
    )

    // 3 - characteristic equation
    this.step(
      t('stepCharEq', 'Step 3 — Characteristic equation'),
      `\\det(A - \\lambda I) = \\det ${`\\begin{pmatrix} ${texNum(a)} - \\lambda & ${texNum(b)} \\\\ ${texNum(c)} & ${texNum(d)} - \\lambda \\end{pmatrix}`} = 0
       \\quad \\Longrightarrow \\quad
       \\lambda^2 ${texSigned(-r.tau)}\\lambda ${texSigned(r.det)} = 0`,
    )

    // 4 - eigenvalues
    const discSign = r.disc > 0 ? '>' : (r.disc < 0 ? '<' : '=')
    this.step(
      t('stepEigenvalues', 'Step 4 — Eigenvalues'),
      `\\lambda_{1,2} = \\frac{\\tau \\pm \\sqrt{\\tau^2 - 4\\Delta}}{2}
        = \\frac{${texNum(r.tau)} \\pm \\sqrt{${texNum(r.disc)}}}{2}
       \\qquad ${texEigenvalues(r)}`,
      fill(t('noteDiscriminant', 'The discriminant is \\(\\tau^2 - 4\\Delta = {disc} {sign} 0\\), so {case}.'), {
        disc: nf(r.disc),
        sign: discSign,
        case: t(`case_${r.eigenType}`, r.eigenType),
      }),
    )

    // 5 - eigenvectors
    this.renderEigenvectorStep(r)

    // 6 - general solution
    const gen = texGeneralSolution(r)
    if (gen) {
      this.step(
        t('stepGeneralSolution', 'Step 6 — General solution'),
        gen,
        t('noteGeneralSolution', 'Any initial condition \\(\\mathbf{x}_0\\) fixes \\(c_1\\) and \\(c_2\\); by the existence and uniqueness theorem this is the only solution.'),
      )
    }

    // 7 - classification
    this.step(
      t('stepClassification', 'Step 7 — Classification'),
      null,
      this.classificationText(r),
    )
  }

  renderEigenvectorStep(r) {
    const [a, b, c, d] = this.A
    const sys = lam => `\\begin{pmatrix} ${texNum(a)} - ${texNum(lam)} & ${texNum(b)} \\\\ ${texNum(c)} & ${texNum(d)} - ${texNum(lam)} \\end{pmatrix}
      \\begin{pmatrix} v_1 \\\\ v_2 \\end{pmatrix} = \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix}`

    const label = t('stepEigenvectors', 'Step 5 — Eigenvectors')

    if (r.eigenType === 'realDistinct' && r.v1 && r.v2) {
      this.step(label,
        `\\begin{gathered}
         ${sys(r.l1)} \\quad \\Longrightarrow \\quad \\mathbf{v}_1 = ${texVec(prettyVector(r.v1))} \\\\[6pt]
         ${sys(r.l2)} \\quad \\Longrightarrow \\quad \\mathbf{v}_2 = ${texVec(prettyVector(r.v2))}
         \\end{gathered}`,
        t('noteEigenvectors', 'Each eigenvector spans a straight-line trajectory \\(\\mathbf{x}(t) = e^{\\lambda t}\\mathbf{v}\\): motion stays on that line forever, growing if \\(\\lambda > 0\\) and decaying if \\(\\lambda < 0\\).'),
      )
      return
    }

    if (r.eigenType === 'complex') {
      this.step(label,
        `\\mathbf{v} = \\begin{pmatrix} ${texNum(r.vRe[0])} \\\\ ${texNum(r.vRe[1])} ${texSigned(r.vIm[1])}\\,i \\end{pmatrix}
         \\qquad
         \\operatorname{Re}\\mathbf{v} = ${texVec(r.vRe)}, \\quad \\operatorname{Im}\\mathbf{v} = ${texVec(r.vIm)}`,
        t('noteComplexEigen', 'With complex eigenvalues there is no real straight-line solution: Euler’s formula turns \\(e^{(\\alpha \\pm i\\omega)t}\\) into \\(e^{\\alpha t}\\cos\\omega t\\) and \\(e^{\\alpha t}\\sin\\omega t\\), so the trajectories rotate while their amplitude follows \\(e^{\\alpha t}\\).'),
      )
      return
    }

    if (r.eigenType === 'realRepeated') {
      if (r.eigenspaceDim === 2) {
        this.step(label,
          `A = ${texNum(r.l1)} I \\quad \\Longrightarrow \\quad A\\mathbf{v} = ${texNum(r.l1)}\\mathbf{v}
           \\ \\text{ for every } \\mathbf{v} \\neq \\mathbf{0}`,
          t('noteStar', 'Multiplication by \\(A\\) just stretches every vector by the same factor, so every direction is an eigendirection and all trajectories are straight lines through the origin: a star node.'),
        )
      } else if (r.v1) {
        this.step(label,
          `\\begin{gathered}
           ${sys(r.l1)} \\quad \\Longrightarrow \\quad \\mathbf{v} = ${texVec(prettyVector(r.v1))} \\\\[6pt]
           (A - ${texNum(r.l1)}I)\\,\\mathbf{w} = \\mathbf{v} \\quad \\Longrightarrow \\quad \\mathbf{w} = ${texVec(r.w ?? [0, 0])}
           \\end{gathered}`,
          t('noteDegenerate', 'The eigenspace is only one-dimensional, so a generalized eigenvector \\(\\mathbf{w}\\) is needed. The fixed point is a degenerate node, sitting exactly on the borderline between a node and a spiral.'),
        )
      }
      return
    }

    this.step(label, null, t('noteNoEigenvectors', 'With \\(\\Delta = 0\\) one eigenvalue vanishes, and its eigendirection is a whole line of fixed points rather than a single trajectory.'))
  }

  classificationText(r) {
    const kind = t(`kind_${r.kind}`, KIND_FALLBACK[r.kind] ?? r.kind)
    const reason = t(`reason_${r.kind}`, '')
    const stability = t(`stabilityLong_${r.stability}`, '')
    const vars = { kind: `<strong>${kind}</strong>`, tau: nf(r.tau), det: nf(r.det), disc: nf(r.disc) }
    return `${fill(reason, vars)} ${fill(stability, vars)}`
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
    document.body.classList.add('p19FsLock')
    requestAnimationFrame(() => this.portrait.resize())
  }

  closeFs() {
    if (!this.fsOpen) return
    this.fsOpen = false
    this.fs.hidden = true
    document.body.classList.remove('p19FsLock')
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
    preset.A.forEach((v, i) => { this.inputs[i].value = v })
    Object.assign(this.paramValues, preset.vars)
    // null, not [], so the rebuild also runs for a preset with no free letters
    // and clears whatever parameter rows the previous one left behind.
    this.paramOrder = null
    this.update()
  }

  // ── Wiring ──────────────────────────────────────────────────────────────

  main() {
    this.portrait = new LSPortrait(this.canvas)
    this.diagram = new LSDiagram(this.tdCanvas)

    for (const el of this.inputs) {
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

    document.getElementById('p19ZoomIn')?.addEventListener('click', () => this.portrait.zoom(1 / 1.35))
    document.getElementById('p19ZoomOut')?.addEventListener('click', () => this.portrait.zoom(1.35))
    document.getElementById('p19ResetView')?.addEventListener('click', () => this.portrait.reset())
    document.getElementById('p19ClearOrbits')?.addEventListener('click', () => this.portrait.clearOrbits())

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
      if (this.info) { this.renderVerdict(this.info); this.renderSteps(this.info) }
      this.portrait.invalidate()
    })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.portrait.stop()
      else this.portrait.start()
    })

    this.applyPreset('example521')
    this.preset.value = 'example521'
    this.portrait.start()
  }
}

export default LinearSystems
