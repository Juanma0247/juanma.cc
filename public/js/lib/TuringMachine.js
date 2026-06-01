// ══════════════════════════════════════════════════════════════════
//  TuringMachine.js
//  Based on: De Castro Korgi, "Teoría de la Computación", Cap. 6
//
//  T = (K, q₀, I)  —  instruction quintuple:  qᵢ s t D qⱼ
//
//  Features:
//   1  Editable transition table
//   2  Animated tape
//   3  Play / Pause / Step / Back / Reset controls
//   4  Configuration history
//   5  Preloaded examples
//   6  Formal definition rendered with KaTeX
//   7  Docente theory panel
//   8  Halt / loop detection (combination final)
//   9  Export / import as JSON
//  10  SVG state diagram (auto-layout, live highlight)
//  +   Table cell flash — shows which instruction was applied
//  +   Last-instruction narration
//  +   Tape position index row
//  +   Tape content summary
//  +   Backward step (undo) with full state stack
// ══════════════════════════════════════════════════════════════════

class TuringMachine {

  // ── Constructor ───────────────────────────────────────────────
  constructor() {
    // Execution DOM
    this.elPosDisp     = document.getElementById('tm-pos-display')
    this.elMaxSteps    = document.getElementById('tm-max-steps')
    this.elAlphabet    = document.getElementById('tm-alphabet')
    this.elTapeInput   = document.getElementById('tm-tape-input')
    this.elTableWrap   = document.getElementById('tm-table-wrap')
    this.elTapeVP      = document.getElementById('tm-tape-viewport')
    this.elTapeCells   = document.getElementById('tm-tape-cells')
    this.elTapeIndices = document.getElementById('tm-tape-indices')
    this.elTapeOutput  = document.getElementById('tm-tape-output')
    this.elLastInst    = document.getElementById('tm-last-inst')
    this.elStateDisp   = document.getElementById('tm-state-display')
    this.elReadDisp    = document.getElementById('tm-read-display')
    this.elStepDisp    = document.getElementById('tm-step-display')
    this.elStatus      = document.getElementById('tm-status')
    this.elHistory     = document.getElementById('tm-history')
    this.elSpeed       = document.getElementById('tm-speed')
    this.elSpeedLabel  = document.getElementById('tm-speed-label')
    this.elBtnPlay     = document.getElementById('tm-btn-play')
    this.elBtnPause    = document.getElementById('tm-btn-pause')
    this.elBtnStep     = document.getElementById('tm-btn-step')
    this.elBtnBack     = document.getElementById('tm-btn-back')
    this.elBtnReset    = document.getElementById('tm-btn-reset')
    this.elAddState    = document.getElementById('tm-add-state')
    this.elRemoveState = document.getElementById('tm-remove-state')
    this.elExamples    = document.getElementById('tm-examples')
    this.elInitState   = document.getElementById('tm-init-state')
    // Feature 6 / 7 / 9 / 10
    this.elFormalDef   = document.getElementById('tm-formal-def')
    this.elDiagramSvg  = document.getElementById('tm-diagram-svg')
    this.elTheoryPanel = document.getElementById('tm-theory-panel')
    this.elTheoryBack  = document.getElementById('tm-theory-backdrop')
    this.elTheoryTitle = document.getElementById('tm-theory-title')
    this.elTheoryBody  = document.getElementById('tm-theory-body')
    this.elBtnExport   = document.getElementById('tm-btn-export')
    this.elBtnImport   = document.getElementById('tm-btn-import')
    this.elImportFile  = document.getElementById('tm-import-file')

    // Machine config
    this.states     = ['q0', 'q1', 'q2']
    this.alphabet   = ['1', '0', 'a']
    this.initState  = 'q0'

    // Runtime state
    this.tape        = {}
    this.head        = 0
    this.curState    = 'q0'
    this.steps       = 0
    this.status      = 'idle'
    this.isRunning   = false
    this.timer       = null
    this.transitions = {}
    this.history     = []
    this.seenCfgs    = new Set()

    // Undo stack — stores full snapshots before each step
    this.stateStack  = []
    this.MAX_STACK   = 500

    // Constants
    this.MAX_STEPS  = 5000
    this.MAX_HIST   = 30
    this.VIEW_HALF  = 10
    this.CELL_W_REM = 2.2

    // Debounce
    this._diagTimer = null
    this._fdefTimer = null
  }

  // ── Tape helpers ──────────────────────────────────────────────

  get allSymbols() { return [...this.alphabet, '#'] }

  read(pos)     { return this.tape[pos] ?? '#' }
  write(pos, s) { s === '#' ? delete this.tape[pos] : (this.tape[pos] = s) }

  loadTape(str) {
    this.tape = {}
    ;[...str].forEach((ch, i) => { if (ch !== '#' && ch !== '_') this.tape[i] = ch })
  }

  // ── Transition parsing ────────────────────────────────────────

  parseCell(raw) {
    const s = (raw ?? '').trim()
    if (!s || s === '–' || s === '-' || s === '—') return null
    const m = s.match(/^(.)(R|L)(q\d+)$/i)
    if (!m) return null
    return { write: m[1], dir: m[2].toUpperCase(), next: m[3].toLowerCase() }
  }

  buildTransitions() {
    this.transitions = {}
    this.elTableWrap?.querySelectorAll('input[data-state][data-sym]').forEach(inp => {
      const inst = this.parseCell(inp.value)
      if (inst) this.transitions[`${inp.dataset.state},${inp.dataset.sym}`] = inst
    })
  }

  getInst(state, sym) { return this.transitions[`${state},${sym}`] ?? null }

  // ── Core step ─────────────────────────────────────────────────

  step() {
    if (this.status === 'halted' || this.status === 'loop') return false
    this.buildTransitions()

    const sym  = this.read(this.head)
    const inst = this.getInst(this.curState, sym)

    if (!inst) {
      this.setStatus('halted')
      this._snapshot()
      this.renderTape()
      this.renderTapeOutput()
      this.renderUI()
      this._schedDiagram()
      if (this.elLastInst) {
        this.elLastInst.innerHTML = `<span class="tm-li-state">${this.curState}</span> reads <span class="tm-li-sym">${sym === '#' ? '_' : sym}</span> — <strong>final combination, machine halts</strong>`
      }
      return false
    }

    // Push undo snapshot BEFORE modifying state
    this._pushState()

    // Flash the table cell being applied (visual)
    this._flashTableCell(this.curState, sym)

    // Narrate the instruction
    this._showLastInst(this.curState, sym, inst)

    const dir = inst.dir
    this.write(this.head, inst.write)
    this.head    += dir === 'R' ? 1 : -1
    this.curState = inst.next
    this.steps++

    const cfg = this._serializeCfg()
    if (this.seenCfgs.has(cfg)) {
      this.setStatus('loop')
      this._snapshot()
      this.renderTape()
      this.renderTapeOutput()
      this.renderUI()
      this._schedDiagram()
      return false
    }
    this.seenCfgs.add(cfg)

    if (this.steps >= this.MAX_STEPS) {
      this.setStatus('loop')
      this._snapshot()
      this.renderTape()
      this.renderTapeOutput()
      this.renderUI()
      return false
    }

    this._snapshot()
    this.renderTape(dir)
    this.renderTapeOutput()
    this.renderUI()
    if (!this.isRunning || this.steps % 5 === 0) this._schedDiagram(0)
    return true
  }

  _serializeCfg() {
    const t = Object.entries(this.tape)
      .sort(([a],[b]) => +a - +b).map(([k,v]) => `${k}:${v}`).join(',')
    return `${this.curState}|${this.head}|${t}`
  }

  // ── Undo / step-back ──────────────────────────────────────────

  _pushState() {
    if (this.stateStack.length >= this.MAX_STACK) this.stateStack.shift()
    this.stateStack.push({
      tape:     { ...this.tape },
      head:     this.head,
      curState: this.curState,
      steps:    this.steps,
    })
  }

  stepBack() {
    if (this.stateStack.length === 0 || this.isRunning) return
    const s = this.stateStack.pop()
    this.tape     = { ...s.tape }
    this.head     = s.head
    this.curState = s.curState
    this.steps    = s.steps
    // Clear seenCfgs to avoid false loop detections after undoing
    this.seenCfgs = new Set()
    if (this.history.length > 0) this.history.shift()
    if (this.status === 'halted' || this.status === 'loop') this.setStatus('idle')
    if (this.elLastInst) this.elLastInst.textContent = '← step undone'
    this.renderTape()
    this.renderTapeOutput()
    this.renderHistory()
    this.renderUI()
    this._schedDiagram(0)
  }

  // ── Visual feedback: table cell flash + narration ─────────────

  _flashTableCell(state, sym) {
    if (+this.elSpeed.value > 5) return   // skip flash at high speeds
    const inp = this.elTableWrap?.querySelector(
      `input[data-state="${state}"][data-sym="${sym}"]`
    )
    if (!inp) return
    inp.classList.remove('tm-flash')
    void inp.offsetWidth
    inp.classList.add('tm-flash')
    setTimeout(() => inp.classList.remove('tm-flash'), 450)
  }

  _showLastInst(state, sym, inst) {
    if (!this.elLastInst) return
    const rs = sym  === '#' ? '_' : sym
    const ws = inst.write === '#' ? '_' : inst.write
    const dr = inst.dir === 'R' ? 'Right →' : '← Left'
    this.elLastInst.innerHTML =
      `<span class="tm-li-state">${state}</span> reads ` +
      `<span class="tm-li-sym">${rs}</span> → ` +
      `write <span class="tm-li-sym">${ws}</span>, ` +
      `move ${dr}, go to <span class="tm-li-state">${inst.next}</span>`
  }

  // ── Execution control ─────────────────────────────────────────

  play() {
    if (this.isRunning || this.status === 'halted' || this.status === 'loop') return
    this.isRunning = true
    this.setStatus('running')
    this.renderUI()
    const ms = Math.round(1000 / Math.max(1, +this.elSpeed.value))
    this.timer = setInterval(() => {
      if (!this.step()) {
        clearInterval(this.timer)
        this.timer = null
        this.isRunning = false
        this.renderUI()
      }
    }, ms)
  }

  pause() {
    if (!this.isRunning) return
    clearInterval(this.timer)
    this.timer = null
    this.isRunning = false
    if (this.status === 'running') this.setStatus('idle')
    this.renderUI()
  }

  reset() {
    clearInterval(this.timer)
    this.timer      = null
    this.isRunning  = false
    this.stateStack = []

    if (this.elMaxSteps) this.MAX_STEPS = Math.max(100, +this.elMaxSteps.value || 5000)
    const alphaRaw = (this.elAlphabet?.value || '').trim()
    this.alphabet  = alphaRaw.split(/\s+/).filter(s => s && s !== '#')
    this.initState = this.elInitState?.value || this.states[0]
    this.curState  = this.initState

    this.loadTape(this.elTapeInput?.value || '')
    this.head     = 0
    this.steps    = 0
    this.history  = []
    this.seenCfgs = new Set()

    if (this.elLastInst) this.elLastInst.textContent = ''

    this._snapshot()
    this.renderTape()
    this.renderTapeOutput()
    this.renderHistory()
    this.renderUI()
    this.setStatus('idle')
    this.renderDiagram()
  }

  // ── Table builder ─────────────────────────────────────────────

  buildTable(preload = null) {
    const saved = preload ?? {}
    if (!preload) {
      this.elTableWrap?.querySelectorAll('input[data-state][data-sym]').forEach(inp => {
        const v = inp.value.trim()
        if (v) saved[`${inp.dataset.state},${inp.dataset.sym}`] = v
      })
    }

    const syms = this.allSymbols
    let html = `<table class="tm-table"><thead><tr>`
    html += `<th class="tm-th-q">State</th>`
    syms.forEach(s => { html += `<th class="${s === '#' ? 'tm-th-blank' : ''}">${s}</th>` })
    html += `</tr></thead><tbody>`

    this.states.forEach(state => {
      const isInit = state === this.initState
      html += `<tr><td class="tm-td-state${isInit ? ' tm-init-state' : ''}">${state}</td>`
      syms.forEach(sym => {
        const key = `${state},${sym}`
        const val = (saved[key] ?? '').replace(/"/g, '&quot;')
        html += `<td class="tm-td-cell"><input
          class="tm-inst-input"
          data-state="${state}"
          data-sym="${sym}"
          value="${val}"
          placeholder="–"
          autocomplete="off"
          spellcheck="false"
          title="Instruction: symbol Direction state  (e.g. 1Rq0 · #Lq2)"
        ></td>`
      })
      html += `</tr>`
    })
    html += `</tbody></table>`
    this.elTableWrap.innerHTML = html

    this.elTableWrap.querySelectorAll('.tm-inst-input').forEach(inp => {
      inp.addEventListener('input', () => {
        this._validateCell(inp)
        this._schedDiagram(400)
        // Rebuild transitions to keep |I| count updated
        clearTimeout(this._fdefTimer)
        this._fdefTimer = setTimeout(() => {
          this.buildTransitions()
          this.updateFormalDef()
        }, 300)
      })
      if (inp.value) this._validateCell(inp)
    })
  }

  _validateCell(inp) {
    const v    = inp.value.trim()
    const inst = this.parseCell(v)
    if (!v || v === '-' || v === '–') { inp.classList.remove('tm-v', 'tm-x'); return }
    const ok = inst
      && this.states.includes(inst.next)
      && (inst.write === '#' || this.allSymbols.includes(inst.write))
    inp.classList.toggle('tm-v', !!ok)
    inp.classList.toggle('tm-x', !ok)
  }

  revalidateAll() {
    this.elTableWrap?.querySelectorAll('.tm-inst-input').forEach(inp => this._validateCell(inp))
  }

  clearTable() {
    this.elTableWrap?.querySelectorAll('.tm-inst-input').forEach(inp => {
      inp.value = ''
      inp.classList.remove('tm-v', 'tm-x')
    })
    this.buildTransitions()
    this.updateFormalDef()
    this.renderDiagram()
  }

  // ── State management ──────────────────────────────────────────

  addState() {
    let n = this.states.length
    while (this.states.includes(`q${n}`)) n++
    this.states.push(`q${n}`)
    this.buildTable()
    this._syncStateSelect()
    this.updateFormalDef()
    this.renderDiagram()
  }

  removeState() {
    if (this.states.length <= 1) return
    this.states.pop()
    if (!this.states.includes(this.initState)) this.initState = this.states[0]
    this.buildTable()
    this._syncStateSelect()
    this.updateFormalDef()
    this.renderDiagram()
  }

  _syncStateSelect() {
    if (!this.elInitState) return
    const cur = this.elInitState.value
    this.elInitState.innerHTML = this.states
      .map(s => `<option value="${s}"${s === cur ? ' selected' : ''}>${s}</option>`)
      .join('')
    if (!this.states.includes(this.initState)) {
      this.initState = this.states[0]
      this.elInitState.value = this.initState
    }
  }

  // ── Tape rendering ────────────────────────────────────────────

  renderTape(dir = null) {
    const cells = []
    for (let i = this.head - this.VIEW_HALF; i <= this.head + this.VIEW_HALF; i++) {
      cells.push({ pos: i, sym: this.read(i), isHead: i === this.head })
    }

    // Infinite-tape edge markers + cells
    const infCell = '<div class="tm-cell tm-cell--inf">···</div>'
    this.elTapeCells.innerHTML = infCell + cells.map(c => {
      const content = c.sym === '#'
        ? '<span class="tm-blank-char">_</span>'
        : c.sym
      return `<div class="tm-cell${c.isHead ? ' tm-cell--head' : ''}">${content}</div>`
    }).join('') + infCell

    // Position index row
    if (this.elTapeIndices) {
      const infIdx = '<div class="tm-cell-idx tm-cell-idx--inf"></div>'
      this.elTapeIndices.innerHTML = infIdx + cells.map(c =>
        `<div class="tm-cell-idx${c.isHead ? ' tm-cell-idx--head' : ''}">${c.pos}</div>`
      ).join('') + infIdx
    }

    // Update head arrow with current state
    if (this.elTapeArrow) {
      this.elTapeArrow.innerHTML =
        `<span class="tm-arr-sym">▲</span><span class="tm-arr-state">${this.curState}</span>`
    }

    // Slide animation (disabled at high speed)
    if (dir && +this.elSpeed.value <= 10) {
      const cls = dir === 'R' ? 'tm-slide-r' : 'tm-slide-l'
      this.elTapeCells.classList.remove('tm-slide-r', 'tm-slide-l')
      void this.elTapeCells.offsetWidth
      this.elTapeCells.classList.add(cls)
    }

    // Center head in viewport
    const rootFs = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const cellW  = this.CELL_W_REM * rootFs
    const totalW = cellW * (this.VIEW_HALF * 2 + 1)
    const vpW    = this.elTapeVP?.offsetWidth ?? totalW
    if (this.elTapeVP) this.elTapeVP.scrollLeft = (totalW - vpW) / 2
  }

  // ── Tape content summary ──────────────────────────────────────

  renderTapeOutput() {
    const el = this.elTapeOutput
    if (!el) return
    const keys = Object.keys(this.tape).map(Number).sort((a, b) => a - b)
    if (keys.length === 0) {
      el.className = 'tm-tape-output'
      el.innerHTML = ''
      return
    }
    const min   = keys[0]
    const max   = keys[keys.length - 1]
    const parts = []
    for (let i = min; i <= max; i++) {
      const s = this.tape[i] || '#'
      parts.push(s === '#' ? '_' : s)
    }
    const rangeLabel = min === max ? `pos ${min}` : `pos ${min}…${max}`
    el.className = 'tm-tape-output tm-out-active'
    el.innerHTML = `<span class="tm-out-label">Tape (${rangeLabel}):</span><span class="tm-out-content">${parts.join(' ')}</span>`
  }

  // ── Configuration history ─────────────────────────────────────

  _snapshot() {
    const half  = 8
    const cells = []
    for (let i = this.head - half; i <= this.head + half; i++) {
      cells.push({ sym: this.read(i), isHead: i === this.head })
    }
    this.history.unshift({ step: this.steps, state: this.curState, cells })
    if (this.history.length > this.MAX_HIST) this.history.pop()
    this.renderHistory()
  }

  renderHistory() {
    if (!this.elHistory) return
    this.elHistory.innerHTML = this.history.slice(0, 20).map(h => {
      const tape = h.cells.map(c => {
        const s = c.sym === '#' ? '_' : c.sym
        return c.isHead
          ? `<span class="tm-hist-active">${s}</span>`
          : `<span class="tm-hist-sym">${s}</span>`
      }).join('')
      return `<div class="tm-hist-row">
        <span class="tm-hist-n">${h.step}</span>
        <span class="tm-hist-q">${h.state}</span>
        <span class="tm-hist-tape">${tape}</span>
      </div>`
    }).join('')
  }

  // ── Status ────────────────────────────────────────────────────

  setStatus(type) {
    this.status = type
    const map = {
      idle:    ['Idle',                ''],
      running: ['Running…',            'tm-s-run'],
      halted:  ['Halted',              'tm-s-halt'],
      loop:    ['∞ Loop / step limit', 'tm-s-loop'],
    }
    const [text, cls] = map[type] ?? map.idle
    this.elStatus.textContent = text
    this.elStatus.className   = `tm-status ${cls}`
  }

  // ── UI sync ───────────────────────────────────────────────────

  renderUI() {
    const done = this.status === 'halted' || this.status === 'loop'
    this.elBtnPlay.disabled  = this.isRunning || done
    this.elBtnPause.disabled = !this.isRunning
    this.elBtnStep.disabled  = this.isRunning || done
    const n       = this.stateStack.length
    const canBack = !this.isRunning && n > 0
    if (this.elBtnBack) {
      this.elBtnBack.disabled = !canBack
      this.elBtnBack.title    = canBack
        ? `Step back (←) — ${n} step${n > 1 ? 's' : ''} available`
        : 'Step back (←) — no steps to undo'
    }
    const elBadge = document.getElementById('tm-back-count')
    if (elBadge) elBadge.textContent = n > 0 ? `(${n})` : ''

    const sym = this.read(this.head)
    this.elStateDisp.textContent = this.curState
    this.elReadDisp.textContent  = sym === '#' ? '_' : sym
    this.elStepDisp.textContent  = this.steps
    if (this.elPosDisp)   this.elPosDisp.textContent  = this.head
    if (this.elSpeedLabel) this.elSpeedLabel.textContent = `${this.elSpeed.value}×`
  }

  // ══════════════════════════════════════════════════════════════
  //  6 · Formal definition (KaTeX)
  // ══════════════════════════════════════════════════════════════

  updateFormalDef() {
    if (!this.elFormalDef) return
    const esc = s => s.replace(/[#{}\\&_^]/g, c => `\\${c}`)
    const ls  = s => { const m = s.match(/^q(\d+)$/); return m ? `q_{${m[1]}}` : esc(s) }

    // States: always show all (max ~8 states expected)
    const K  = this.states.map(ls).join(',\\,')

    // Alphabet: truncate if > 5 symbols to avoid overflow
    const A  = this.alphabet
    const S  = A.length <= 5
      ? A.map(esc).join(',\\,')
      : `${A.slice(0, 3).map(esc).join(',\\,')},\\,\\ldots,\\,${esc(A[A.length - 1])}`

    const q0 = ls(this.initState)
    const nI = Object.keys(this.transitions).length

    this.elFormalDef.innerHTML = `
      <span>\\(T = (K,\\; q_0,\\; I)\\)</span>
      <span class="tm-fdef-sep">·</span>
      <span>\\(K = \\{${K}\\}\\)</span>
      <span class="tm-fdef-sep">·</span>
      <span>\\(\\Sigma = \\{${S}\\}\\)</span>
      <span class="tm-fdef-sep">·</span>
      <span>\\(q_0 = ${q0}\\)</span>
      <span class="tm-fdef-sep">·</span>
      <span class="tm-fdef-count">|I| = ${nI}</span>
    `
    if (window.renderMathInElement) window.renderMathInElement(this.elFormalDef, { throwOnError: false })
  }

  // ══════════════════════════════════════════════════════════════
  //  7 · Theory panel
  // ══════════════════════════════════════════════════════════════

  get _theory() {
    return {
      table: {
        title: 'Instructions & Final Combinations',
        html: `
<h4>Máquina de Turing</h4>
<div class="tm-def">
  Una <em>máquina de Turing</em> T sobre Σ es una tripla
  <em>T = (K, q₀, I)</em> donde K es un conjunto finito de estados,
  q₀ ∈ K es el estado inicial, e I es una función parcial
  <em>I : K × (Σ ∪ {#}) → (Σ ∪ {#}) × {R, L} × K</em>.
</div>
<h4>Instrucción</h4>
<div class="tm-def">
  Una <em>instrucción</em> es una quíntupla
  <em>(qᵢ, s, t, D, qⱼ)</em> tal que:<br>
  · qᵢ, qⱼ ∈ K &nbsp;(estados)<br>
  · s, t ∈ Σ ∪ {#} &nbsp;(símbolos)<br>
  · D ∈ {R, L} &nbsp;(dirección)<br>
  · I(qᵢ, s) = (t, D, qⱼ)
</div>
<h4>Combinación final</h4>
<div class="tm-def">
  Una pareja <em>(qᵢ, s)</em> es una <em>combinación final</em>
  si no aparece al comienzo de ninguna instrucción.
  La máquina <em>se detiene</em> al leer s en estado qᵢ.
</div>
<p class="tm-ref">De Castro Korgi §6.1 · slides §1–5</p>`
      },
      execution: {
        title: 'Instantaneous Configuration & Step',
        html: `
<h4>Configuración instantánea</h4>
<div class="tm-def">
  Expresión <em>a₁…aᵢ₋₁ q aᵢ…aₙ</em>: la unidad de control
  está en estado <em>q</em> escaneando el símbolo <em>aᵢ</em>.
  Las celdas fuera del rango contienen el blanco #.
</div>
<h4>Paso computacional ⊢</h4>
<div class="tm-def">
  Si <em>I(q, s) = (p, b, R)</em>:&nbsp; <em>…qsa… ⊢ …bpa…</em><br>
  Si <em>I(q, s) = (p, b, L)</em>:&nbsp; <em>…cqs… ⊢ …pcb…</em>
</div>
<h4>Lenguaje aceptado</h4>
<div class="tm-def">
  <em>L(M) = &#123; w ∈ Σ* : q₀w ⊢* w₁pw₂, p ∈ F &#125;</em><br>
  La máquina acepta w si se detiene en un estado final.
</div>
<h4>Bucle infinito</h4>
<div class="tm-def">
  Si la misma configuración se repite, la máquina no se detiene.
  El simulador detecta esto automáticamente.
</div>
<p class="tm-ref">De Castro Korgi §6.1 · slides §6–16</p>`
      },
      diagram: {
        title: 'State Diagram',
        html: `
<h4>Diagrama de transiciones</h4>
<div class="tm-def">
  El diagrama es un <em>digrafo etiquetado</em>:<br>
  · Nodos = estados q ∈ K<br>
  · Flechas = instrucciones con etiqueta <em>s|tD</em><br>
  &nbsp;&nbsp;(lee s, escribe t, mueve D)
</div>
<h4>Convenciones</h4>
<div class="tm-def">
  · Estado inicial: flecha de entrada ►<br>
  · Estado activo: resaltado en tiempo real<br>
  · Auto-bucle: flecha circular misma celda<br>
  · Arcos opuestos: curvas en lados contrarios
</div>
<p class="tm-ref">De Castro Korgi §6.1 · slides §6</p>`
      },
      history: {
        title: 'Configuration History & Accepted Language',
        html: `
<h4>Historial de configuraciones</h4>
<div class="tm-def">
  Cada fila muestra la configuración instantánea <em>u q v</em>
  en ese paso. La celda resaltada es la posición del cabezal.
</div>
<h4>Recursivamente enumerable (RE)</h4>
<div class="tm-def">
  Un lenguaje L es <em>RE</em> si existe una MT M tal que L(M) = L.
  L es <em>recursivo</em> si además M se detiene con toda entrada.
</div>
<h4>Bucles y no-decidibilidad</h4>
<div class="tm-def">
  Si la misma configuración se repite, la MT no se detiene nunca.
  El <em>problema de la parada</em> (¿se detiene M con entrada w?)
  es <em>indecidible</em> — no existe ningún algoritmo general.
</div>
<p class="tm-ref">De Castro Korgi §7.5–§7.6</p>`
      }
    }
  }

  showTheory(key) {
    const t = this._theory[key]
    if (!t || !this.elTheoryPanel) return
    this.elTheoryTitle.textContent = t.title
    this.elTheoryBody.innerHTML    = t.html
    if (window.renderMathInElement) window.renderMathInElement(this.elTheoryBody, { throwOnError: false })
    this.elTheoryPanel.classList.add('tm-open')
    this.elTheoryBack.classList.add('tm-open')
    this.elTheoryPanel.setAttribute('aria-hidden', 'false')
  }

  hideTheory() {
    this.elTheoryPanel?.classList.remove('tm-open')
    this.elTheoryBack?.classList.remove('tm-open')
    this.elTheoryPanel?.setAttribute('aria-hidden', 'true')
  }

  // ══════════════════════════════════════════════════════════════
  //  9 · Export / Import JSON
  // ══════════════════════════════════════════════════════════════

  exportMachine() {
    this.buildTransitions()
    const trans = {}
    Object.entries(this.transitions).forEach(([k, v]) => { trans[k] = `${v.write}${v.dir}${v.next}` })
    const blob = new Blob([JSON.stringify({
      states: this.states, alphabet: this.alphabet,
      initState: this.initState, tape: this.elTapeInput?.value || '', trans
    }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: 'turing-machine.json' }).click()
    URL.revokeObjectURL(url)
  }

  importMachine(file) {
    if (!file) return
    const r = new FileReader()
    r.onload = e => {
      try {
        const d = JSON.parse(e.target.result)
        this.states    = Array.isArray(d.states) && d.states.length ? d.states : ['q0','q1']
        this.alphabet  = Array.isArray(d.alphabet) ? d.alphabet.filter(s => s !== '#') : ['0','1']
        this.initState = d.initState || this.states[0]
        if (this.elAlphabet)  this.elAlphabet.value  = this.alphabet.join(' ')
        if (this.elTapeInput) this.elTapeInput.value  = d.tape || ''
        this._syncStateSelect()
        if (this.elInitState) this.elInitState.value = this.initState
        this.buildTable(d.trans || {})
        this.reset()
        this.updateFormalDef()
      } catch { alert('Invalid file. Expected a Turing Machine JSON export.') }
    }
    r.readAsText(file)
  }

  // ══════════════════════════════════════════════════════════════
  //  10 · State diagram (SVG) — auto-layout + live highlight
  // ══════════════════════════════════════════════════════════════

  _schedDiagram(ms = 80) {
    clearTimeout(this._diagTimer)
    this._diagTimer = setTimeout(() => this.renderDiagram(), ms)
  }

  renderDiagram() {
    const svg = this.elDiagramSvg
    if (!svg) return
    this.buildTransitions()
    const N = this.states.length
    if (N === 0) { svg.innerHTML = ''; return }

    // ── Layout ──────────────────────────────────────────────────
    const PAD  = 55
    const CR   = 22

    let W, H, posArr

    if (N <= 4) {
      // Horizontal line for small N — cleaner arrows
      const SPACING = 130
      W = Math.max(400, PAD * 2 + (N - 1) * SPACING + CR * 2 + 44)
      H = 200
      const cx = W / 2
      const cy = H / 2
      const startX = cx - ((N - 1) * SPACING) / 2
      posArr = this.states.map((_, i) => ({ x: startX + i * SPACING, y: cy }))
    } else {
      // Circular for larger N
      const LAY_R = Math.max(90, (N * 78) / (2 * Math.PI))
      W = LAY_R * 2 + PAD * 2 + CR * 2 + 44
      H = W
      const cx = W / 2, cy = H / 2
      posArr = this.states.map((_, i) => {
        const a = (i * 2 * Math.PI / N) - Math.PI / 2
        return { x: cx + LAY_R * Math.cos(a), y: cy + LAY_R * Math.sin(a) }
      })
    }

    const cx = W / 2, cy = H / 2
    const pos = {}
    this.states.forEach((s, i) => { pos[s] = posArr[i] })

    // ── Group edges ──────────────────────────────────────────────
    const edges = {}
    Object.entries(this.transitions).forEach(([key, inst]) => {
      const [state, sym] = key.split(',')
      const ek = `${state},${inst.next}`
      if (!edges[ek]) edges[ek] = []
      const lbl = `${sym === '#' ? '_' : sym}|${inst.write === '#' ? '_' : inst.write}${inst.dir}`
      edges[ek].push(lbl)
    })

    // ── SVG ─────────────────────────────────────────────────────
    const parts = [`<defs>
      <marker id="tm-arr" viewBox="0 0 10 10" refX="8" refY="5"
        markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--color-primary)" opacity=".85"/>
      </marker></defs>`]

    Object.entries(edges).forEach(([ek, labels]) => {
      const [from, to] = ek.split(',')
      const pF = pos[from], pT = pos[to]
      if (!pF || !pT) return
      if (from === to)         parts.push(this._selfLoop(pF, CR, labels))
      else {
        const hasBidi = !!edges[`${to},${from}`]
        parts.push(this._arrow(pF, pT, CR, labels, hasBidi, from < to))
      }
    })

    this.states.forEach(state => {
      parts.push(this._stateNode(pos[state], state, state === this.curState, state === this.initState, CR, cx, cy))
    })

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.innerHTML = parts.join('')
  }

  _arrow(pF, pT, R, labels, curved, first) {
    const dx  = pT.x - pF.x
    const dy  = pT.y - pF.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const ux  = dx / len, uy = dy / len
    const px  = -uy,       py = ux   // left-hand perpendicular

    const sign  = curved ? (first ? -1 : 1) : 0
    const bend  = sign * Math.min(35, len * 0.3)
    const nudge = curved ? 0 : 8     // slight offset even for straight arrows

    const sx = pF.x + ux * R
    const sy = pF.y + uy * R
    const ex = pT.x - ux * (R + 7)
    const ey = pT.y - uy * (R + 7)
    const mx = (sx + ex) / 2 + px * (bend || nudge)
    const my = (sy + ey) / 2 + py * (bend || nudge)

    const pathD = bend !== 0
      ? `M${sx.toFixed(1)},${sy.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`
      : `M${sx.toFixed(1)},${sy.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`

    const lx = mx + px * (bend !== 0 ? 0 : 10)
    const ly = my + py * (bend !== 0 ? 0 : 10)

    return `<path d="${pathD}" fill="none" stroke="var(--color-primary)" stroke-width="1.4"
        stroke-opacity=".8" marker-end="url(#tm-arr)"/>
      ${this._edgeLabel(lx, ly, labels)}`
  }

  _selfLoop(pos, R, labels) {
    const x  = pos.x, y = pos.y - R
    const lp = `M${x - 8},${y} C${x - 28},${y - 42} ${x + 28},${y - 42} ${x + 8},${y}`
    return `<path d="${lp}" fill="none" stroke="var(--color-primary)" stroke-width="1.4"
        stroke-opacity=".8" marker-end="url(#tm-arr)"/>
      ${this._edgeLabel(x, y - 32, labels)}`
  }

  _edgeLabel(x, y, labels) {
    const MAX   = 4
    const shown = labels.slice(0, MAX)
    const extra = labels.length > MAX ? `+${labels.length - MAX}` : ''
    const total = shown.length + (extra ? 1 : 0)
    const yStart = (y - (total - 1) * 11 / 2).toFixed(1)
    const tspans = shown.map((l, i) =>
      `<tspan x="${x.toFixed(1)}" dy="${i === 0 ? 0 : 11}">${this._esc(l)}</tspan>`
    ).join('')
    const ext = extra
      ? `<tspan x="${x.toFixed(1)}" dy="11" fill="var(--color-muted)">${extra}</tspan>`
      : ''
    return `<text x="${x.toFixed(1)}" y="${yStart}" class="tm-diag-edge-lbl">${tspans}${ext}</text>`
  }

  _stateNode(pos, state, active, initial, R, cx, cy) {
    const fill    = active ? 'var(--color-primary)' : 'var(--color-bg)'
    const txtFill = active ? 'var(--color-bg)'      : 'var(--color-primary)'
    const sw      = active ? 2 : 1.5
    let html = ''

    if (initial) {
      const angle = Math.atan2(pos.y - cy, pos.x - cx)
      const arrowLen = R + 20
      const ax1 = (pos.x + Math.cos(angle) * arrowLen).toFixed(1)
      const ay1 = (pos.y + Math.sin(angle) * arrowLen).toFixed(1)
      const ax2 = (pos.x + Math.cos(angle) * (R + 5)).toFixed(1)
      const ay2 = (pos.y + Math.sin(angle) * (R + 5)).toFixed(1)
      html += `<line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}"
        stroke="var(--color-primary)" stroke-width="1.5" marker-end="url(#tm-arr)"/>`
    }

    html += `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="${R}"
      fill="${fill}" stroke="var(--color-primary)" stroke-width="${sw}" stroke-opacity=".85"/>`

    if (active) {
      html += `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="${R + 5}"
        fill="none" stroke="var(--color-primary)" stroke-width="1" stroke-opacity=".25"
        stroke-dasharray="4 3"/>`
    }

    html += `<text x="${pos.x.toFixed(1)}" y="${(pos.y + 4.5).toFixed(1)}"
      class="tm-diag-state-lbl" fill="${txtFill}">${this._esc(state)}</text>`
    return html
  }

  _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  }

  // ══════════════════════════════════════════════════════════════
  //  Examples
  // ══════════════════════════════════════════════════════════════

  get EXAMPLES() {
    return {
      'count-ones': {
        label:     'Count ones — book example (slides §2)',
        alphabet:  '1 0 a',
        states:    ['q0', 'q1', 'q2', 'q3'],
        initState: 'q0',
        tape:      '11010011',
        trans: {
          'q0,1':'aRq1', 'q0,0':'0Rq0',
          'q1,1':'1Rq1', 'q1,0':'0Rq1', 'q1,#':'#Rq2',
          'q2,1':'1Rq2', 'q2,#':'1Lq3',
          'q3,1':'1Lq3', 'q3,0':'0Lq3', 'q3,a':'1Rq0', 'q3,#':'#Lq3',
        }
      },
      'parity': {
        label:     'Parity checker — q0=even, q1=odd (halts at end)',
        alphabet:  '1',
        states:    ['q0', 'q1'],
        initState: 'q0',
        tape:      '1111',
        trans: { 'q0,1':'1Rq1', 'q1,1':'1Rq0' }
      },
      'unary-add': {
        label:     'Unary addition  111+11=11111  (slides §22)',
        alphabet:  '1',
        states:    ['q0', 'q1', 'q2', 'q3'],
        initState: 'q0',
        tape:      '111#11',
        trans: {
          'q0,1':'1Rq0', 'q0,#':'1Rq1',
          'q1,1':'1Rq1', 'q1,#':'#Lq2',
          'q2,1':'#Lq3',
        }
      },
      'add-one-decimal': {
        label:     'Add 1 in decimal  2397→2398  (slides §31)',
        alphabet:  '0 1 2 3 4 5 6 7 8 9',
        states:    ['q0', 'q1', 'q2'],
        initState: 'q0',
        tape:      '2397',
        trans: {
          'q0,0':'0Rq0','q0,1':'1Rq0','q0,2':'2Rq0','q0,3':'3Rq0',
          'q0,4':'4Rq0','q0,5':'5Rq0','q0,6':'6Rq0','q0,7':'7Rq0',
          'q0,8':'8Rq0','q0,9':'9Rq0','q0,#':'#Lq1',
          'q1,0':'1Lq2','q1,1':'2Lq2','q1,2':'3Lq2','q1,3':'4Lq2',
          'q1,4':'5Lq2','q1,5':'6Lq2','q1,6':'7Lq2','q1,7':'8Lq2',
          'q1,8':'9Lq2','q1,9':'0Lq1','q1,#':'1Lq2',
          'q2,0':'0Lq2','q2,1':'1Lq2','q2,2':'2Lq2','q2,3':'3Lq2',
          'q2,4':'4Lq2','q2,5':'5Lq2','q2,6':'6Lq2','q2,7':'7Lq2',
          'q2,8':'8Lq2','q2,9':'9Lq2',
        }
      },
      'binary-increment': {
        label:     'Binary increment  1011→1100',
        alphabet:  '0 1',
        states:    ['q0', 'q1', 'q2'],
        initState: 'q0',
        tape:      '1011',
        trans: {
          'q0,0':'0Rq0','q0,1':'1Rq0','q0,#':'#Lq1',
          'q1,1':'0Lq1','q1,0':'1Lq2','q1,#':'1Lq2',
          'q2,0':'0Lq2','q2,1':'1Lq2',
        }
      },
      'swap': {
        label:     'Swap 0↔1 (complement bits)',
        alphabet:  '0 1',
        states:    ['q0'],
        initState: 'q0',
        tape:      '1011010',
        trans: { 'q0,0': '1Rq0', 'q0,1': '0Rq0' }
      },
      'busy-beaver-2': {
        label:     'Busy Beaver 2 — writes 4 ones in 6 steps',
        alphabet:  '1',
        states:    ['q0', 'q1'],
        initState: 'q0',
        tape:      '',
        trans: {
          'q0,#': '1Rq1', 'q0,1': '1Lq1',
          'q1,#': '1Lq0',
          // q1,1 → halt (no transition = final combination)
        }
      },
      'busy-beaver-3': {
        label:     'Busy Beaver 3 — writes 6 ones in 21 steps',
        alphabet:  '1',
        states:    ['q0', 'q1', 'q2'],
        initState: 'q0',
        tape:      '',
        trans: {
          'q0,#': '1Rq1', 'q0,1': '1Rq2',
          'q1,#': '1Lq0', 'q1,1': '1Rq1',
          'q2,#': '1Lq1',
          // q2,1 → halt
        }
      },
      'blank': {
        label:     '— Blank machine (start from scratch) —',
        alphabet:  '0 1',
        states:    ['q0', 'q1'],
        initState: 'q0',
        tape:      '',
        trans:     {}
      }
    }
  }

  loadExample(key) {
    const ex = this.EXAMPLES[key]
    if (!ex) return
    this.alphabet  = ex.alphabet.split(/\s+/).filter(s => s && s !== '#')
    this.states    = [...ex.states]
    this.initState = ex.initState
    if (this.elAlphabet)  this.elAlphabet.value  = ex.alphabet
    if (this.elTapeInput) this.elTapeInput.value  = ex.tape
    this._syncStateSelect()
    if (this.elInitState) this.elInitState.value = ex.initState
    this.buildTable(ex.trans)
    this.buildTransitions()
    this.reset()
    this.updateFormalDef()
  }

  // ══════════════════════════════════════════════════════════════
  //  Init & event binding
  // ══════════════════════════════════════════════════════════════

  starter() {
    // Examples
    if (this.elExamples) {
      this.elExamples.innerHTML = Object.entries(this.EXAMPLES)
        .map(([k, e]) => `<option value="${k}">${e.label}</option>`).join('')
      this.elExamples.addEventListener('change', e => {
        if (e.target.value) this.loadExample(e.target.value)
      })
    }

    // Execution buttons
    this.elBtnPlay?.addEventListener('click',  () => this.play())
    this.elBtnPause?.addEventListener('click', () => this.pause())
    this.elBtnStep?.addEventListener('click',  () => {
      if (!this.isRunning && this.status !== 'halted' && this.status !== 'loop') this.step()
    })
    this.elBtnBack?.addEventListener('click',  () => this.stepBack())
    this.elBtnReset?.addEventListener('click', () => this.reset())

    // State management
    this.elAddState?.addEventListener('click',    () => { this.addState(); this.revalidateAll() })
    this.elRemoveState?.addEventListener('click', () => this.removeState())
    document.getElementById('tm-btn-clear')?.addEventListener('click', () => this.clearTable())

    // Speed
    this.elSpeed?.addEventListener('input', () => {
      if (this.elSpeedLabel) this.elSpeedLabel.textContent = `${this.elSpeed.value}×`
      if (this.isRunning) { this.pause(); this.play() }
    })

    // Alphabet — rebuild on Enter/blur ('change'), also debounced on typing
    let _alphaTimer = null
    const _rebuildAlphabet = () => {
      const raw = this.elAlphabet.value.trim()
      this.alphabet = raw.split(/\s+/).filter(s => s && s !== '#')
      this.buildTable()
      this.revalidateAll()
      this.buildTransitions()
      this.updateFormalDef()
      this.renderDiagram()
    }
    this.elAlphabet?.addEventListener('change', _rebuildAlphabet)
    this.elAlphabet?.addEventListener('input', () => {
      clearTimeout(_alphaTimer)
      _alphaTimer = setTimeout(_rebuildAlphabet, 600)
    })

    // Max steps — listen to both 'input' (spinner) and 'change' (manual edit)
    const _updateMax = () => {
      const v = Math.max(100, Math.min(100000, +this.elMaxSteps.value || 5000))
      this.MAX_STEPS = v
      this.elMaxSteps.value = v
    }
    this.elMaxSteps?.addEventListener('input',  _updateMax)
    this.elMaxSteps?.addEventListener('change', _updateMax)

    // Init state change
    this.elInitState?.addEventListener('change', () => {
      this.initState = this.elInitState.value
      this.buildTable()
      this.updateFormalDef()
      this.renderDiagram()
    })

    // 7 · Theory panel
    document.querySelectorAll('.tm-help-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showTheory(btn.dataset.theory))
    })
    this.elTheoryBack?.addEventListener('click', () => this.hideTheory())
    document.getElementById('tm-theory-close')?.addEventListener('click', () => this.hideTheory())

    // 9 · Export / Import
    this.elBtnExport?.addEventListener('click', () => this.exportMachine())
    this.elBtnImport?.addEventListener('click', () => this.elImportFile?.click())
    this.elImportFile?.addEventListener('change', e => {
      this.importMachine(e.target.files?.[0])
      e.target.value = ''
    })

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      if (e.key === ' ')          { e.preventDefault(); this.isRunning ? this.pause() : this.play() }
      if (e.key === 'ArrowRight') { e.preventDefault(); if (!this.isRunning) this.step() }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this.stepBack() }
      if (e.key === 'r' || e.key === 'R') this.reset()
      if (e.key === 'Escape') this.hideTheory()
    })
  }

  main() {
    this.loadExample('count-ones')
  }
}

export default TuringMachine
