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
    this.elTapeTrack   = document.getElementById('tm-tape-track')
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
    this.CELL_H_REM = 3.2

    // Debounce
    this._diagTimer = null
    this._fdefTimer = null

    // Interactive diagram state
    this.nodePositions = {}
    this._diagMode     = 'idle'
    this._diagConnFrom = null
    this._diagSel      = null
    this._diagPanel    = document.getElementById('tm-diag-panel')
    this._diagVB       = null   // custom viewBox from zoom; null = use computed base
    this._diagBaseW    = 0      // base viewBox width for clamping
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
    const removed = this.states.pop()
    delete this.nodePositions[removed]
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
    const el = this.elTapeTrack
    if (!el) return

    const FADE     = 3
    const FADE_OPS = [0, 0.34, 0.67]  // opacity per edge cell (outermost first)

    // Visible range: all written content ∪ head position, plus FADE buffer each side
    const keys   = Object.keys(this.tape).map(Number)
    const minC   = keys.length ? Math.min(...keys) : this.head
    const maxC   = keys.length ? Math.max(...keys) : this.head
    const minPos = Math.min(minC, this.head) - FADE
    const maxPos = Math.max(maxC, this.head) + FADE

    // Build cell descriptors
    const cells = []
    for (let i = minPos; i <= maxPos; i++) {
      const dL = i - minPos, dR = maxPos - i
      let op = 1
      if (dL < FADE) op = FADE_OPS[dL]
      if (dR < FADE) op = Math.min(op, FADE_OPS[dR])
      cells.push({ pos: i, sym: op < 1 ? '#' : this.read(i), isHead: i === this.head, op })
    }

    // Cells per row based on track width (climb DOM for a reliable width)
    const rootFs  = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const cellWPx = this.CELL_W_REM * rootFs
    const trackW  = el.offsetWidth
      || el.closest('.tm-card')?.clientWidth
      || el.parentElement?.offsetWidth
      || 900
    const perRow  = Math.max(4, Math.floor(trackW / cellWPx))

    // Head row/column within the wrapped layout
    const headIdx = cells.findIndex(c => c.isHead)
    const headRow = Math.floor(headIdx / perRow)
    const headCol = headIdx % perRow
    const markerL = headCol * cellWPx + cellWPx / 2

    const isHalt = this.status === 'halted'
    const isLoop = this.status === 'loop'

    let html = ''
    for (let ri = 0; ri * perRow < cells.length; ri++) {
      const isActive = ri === headRow
      html += `<div class="tm-tape-row${isActive ? ' tm-tape-row--active' : ''}">`

      cells.slice(ri * perRow, (ri + 1) * perRow).forEach(c => {
        const sym = c.sym === '#' ? `<span class="tm-blank-char">_</span>` : c.sym
        html += `<div class="tm-cell${c.isHead ? ' tm-cell--head' : ''}"${c.op < 1 ? ` style="opacity:${c.op}"` : ''}>`
          + `<span class="tm-cell-idx">${c.pos}</span>`
          + `<span class="tm-cell-sym">${sym}</span>`
          + `</div>`
      })

      if (isActive) {
        const mCls = ['tm-head-marker',
          dir === 'R' ? 'tm-head--r' : dir === 'L' ? 'tm-head--l' : '',
          isHalt ? 'tm-head--halt' : isLoop ? 'tm-head--loop' : this.isRunning ? 'tm-head--run' : '',
        ].filter(Boolean).join(' ')
        html += `<div class="${mCls}" style="left:${markerL}px">`
          + `<div class="tm-head-arrow">▲</div>`
          + `<div class="tm-head-state">${this.curState}</div>`
          + `</div>`
      }

      html += `</div>`
    }
    el.innerHTML = html
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
  //  10 · State diagram (SVG) — interactive, bidirectional sync
  // ══════════════════════════════════════════════════════════════

  _schedDiagram(ms = 80) {
    clearTimeout(this._diagTimer)
    this._diagTimer = setTimeout(() => this.renderDiagram(), ms)
  }

  _initNodePositions(W, H, CR) {
    const N       = this.states.length
    const PAD     = CR + 36
    const iW      = W - PAD * 2
    const iH      = H - PAD * 2
    const cx      = W / 2
    const cy      = H / 2

    // Preset 2D layouts as [fx, fy] fractions of available inner space
    const LAYOUTS = {
      1: [[.5, .5]],
      2: [[.12, .5], [.88, .5]],
      3: [[.12, .5], [.58, .1], [.88, .5]],
      // Horizontal diamond: left · top · right · bottom
      4: [[.1, .48], [.45, .1], [.9, .48], [.45, .88]],
      // Wide pentagon
      5: [[.08, .48], [.36, .08], [.78, .08], [.92, .65], [.42, .9]],
      // Hexagon (2-3-1 or 2×3)
      6: [[.08, .48], [.28, .1], [.62, .1], [.92, .32], [.92, .72], [.5, .9]],
      // Two staggered rows for 7-8
      7: [[.08, .3], [.35, .08], [.65, .08], [.92, .3], [.92, .7], [.65, .92], [.35, .92]],
      8: [[.08, .3], [.35, .08], [.65, .08], [.92, .3], [.92, .7], [.65, .92], [.35, .92], [.08, .7]],
    }

    this.states.forEach((s, i) => {
      if (this.nodePositions[s]) return

      let x, y
      if (LAYOUTS[N]) {
        const [fx, fy] = LAYOUTS[N][i] || [.5, .5]
        x = Math.round(PAD + fx * iW)
        y = Math.round(PAD + fy * iH)
      } else {
        // Grid for N > 8: wider than tall (1.6 ratio)
        const cols = Math.ceil(Math.sqrt(N * 1.6))
        const rows = Math.ceil(N / cols)
        const col  = i % cols
        const row  = Math.floor(i / cols)
        x = Math.round(PAD + (col / Math.max(cols - 1, 1)) * iW)
        y = Math.round(PAD + (row / Math.max(rows - 1, 1)) * iH)
      }

      this.nodePositions[s] = { x, y }
    })

    for (const s of Object.keys(this.nodePositions)) {
      if (!this.states.includes(s)) delete this.nodePositions[s]
    }
  }

  _computeEdges() {
    const map = {}
    Object.entries(this.transitions).forEach(([key, inst]) => {
      const [from, sym] = key.split(',')
      const to  = inst.next
      const ek  = `${from}→${to}`
      if (!map[ek]) map[ek] = { from, to, key: ek, items: [] }
      map[ek].items.push({ sym, inst })
    })
    return Object.values(map)
  }

  renderDiagram() {
    const svg = this.elDiagramSvg
    if (!svg) return
    this.buildTransitions()
    const N = this.states.length
    if (N === 0) { svg.innerHTML = ''; return }

    const CR = 22
    const W  = Math.max(svg.clientWidth  || 600, 300)
    const H  = Math.max(svg.clientHeight || 320, 200)

    this._initNodePositions(W, H, CR)

    const edges   = this._computeEdges()
    const edgeMap = {}
    edges.forEach(e => { edgeMap[e.key] = e })

    const selNode = this._diagSel?.type === 'node' ? this._diagSel.state : null
    const selKey  = this._diagSel?.type === 'edge' ? this._diagSel.key  : null
    const connSrc = this._diagConnFrom

    const defs = `<defs>
      <marker id="ta"   viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--color-primary)" opacity=".85"/>
      </marker>
      <marker id="ta-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--color-primary)"/>
      </marker>
      <marker id="ta-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--color-muted)" opacity=".5"/>
      </marker>
    </defs>`

    const bg = `<rect class="td-bg" x="0" y="0" width="${W}" height="${H}" fill="transparent"/>`

    const edgeParts = edges.map(edge => {
      const pF = this.nodePositions[edge.from]
      const pT = this.nodePositions[edge.to]
      if (!pF || !pT) return ''
      const isSel   = edge.key === selKey
      if (edge.from === edge.to) return this._tdSelfLoop(pF, CR, edge, isSel)
      const hasBidi = !!edgeMap[`${edge.to}→${edge.from}`]
      const isFirst = edge.from < edge.to
      return this._tdArrow(pF, pT, CR, edge, hasBidi, isFirst, isSel)
    }).join('')

    const nodeParts = this.states.map(state => {
      const p = this.nodePositions[state]
      if (!p) return ''
      return this._tdNode(
        state, p, CR,
        state === this.curState,
        state === this.initState,
        state === selNode,
        state === connSrc,
        W, H
      )
    }).join('')

    const ghost = `<path id="td-ghost" d="" fill="none" stroke="var(--color-muted)"
      stroke-width="1.4" stroke-opacity=".5" stroke-dasharray="5 3"
      marker-end="url(#ta-g)" style="display:none"/>`

    // Apply stored zoom or use base viewBox
    if (this._diagVB) {
      const { x, y, w, h } = this._diagVB
      svg.setAttribute('viewBox', `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`)
    } else {
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      this._diagBaseW = W
      this._diagBaseH = H
    }
    svg.innerHTML = defs + bg + edgeParts + nodeParts + ghost

    this._tdAttachEvents(svg)
  }

  _tdNode(state, p, CR, isActive, isInit, isSel, isConnSrc, W, H) {
    const fill    = isActive ? 'var(--color-primary)' : 'var(--color-bg)'
    const txtFill = isActive ? 'var(--color-bg)'      : 'var(--color-primary)'
    const sw = (isActive || isSel) ? 2 : 1.5

    let html = `<g class="td-node-g${isConnSrc ? ' td-connecting-src' : ''}" data-state="${this._esc(state)}">`

    if (isInit) {
      html += `<line x1="${(p.x - CR - 22).toFixed(1)}" y1="${p.y.toFixed(1)}"
        x2="${(p.x - CR - 2).toFixed(1)}" y2="${p.y.toFixed(1)}"
        stroke="var(--color-primary)" stroke-width="1.5" marker-end="url(#ta)"/>`
    }

    if (isSel) {
      html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${CR + 7}"
        fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-opacity=".35"
        stroke-dasharray="4 3"/>`
    } else if (isActive) {
      html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${CR + 5}"
        fill="none" stroke="var(--color-primary)" stroke-width="1" stroke-opacity=".25"
        stroke-dasharray="4 3"/>`
    }

    html += `<circle class="td-node-body" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${CR}"
      fill="${fill}" stroke="var(--color-primary)" stroke-width="${sw}" stroke-opacity=".9"/>`

    html += `<text x="${p.x.toFixed(1)}" y="${(p.y + 4.5).toFixed(1)}"
      class="tm-diag-state-lbl" fill="${txtFill}" pointer-events="none">${this._esc(state)}</text>`

    // Connect dot — visible on hover at the right edge of the node
    html += `<circle class="td-conn-dot" cx="${(p.x + CR).toFixed(1)}" cy="${p.y.toFixed(1)}"
      r="6" fill="var(--color-primary)" data-state="${this._esc(state)}"/>`

    html += `</g>`
    return html
  }

  _tdArrow(pF, pT, CR, edge, hasBidi, isFirst, isSel) {
    const dx  = pT.x - pF.x
    const dy  = pT.y - pF.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const ux  = dx / len, uy = dy / len

    // Canonical perpendicular: always referenced to the "first" (A→B) direction
    // so both arrows in a bidi pair use the SAME axis but opposite signs.
    // Formula: cpx = isFirst ? -uy : uy   (both resolve to the same absolute vector)
    //          cpy = isFirst ?  ux : -ux
    const cpx = isFirst ? -uy :  uy
    const cpy = isFirst ?  ux : -ux

    const bendAmt = hasBidi ? Math.max(48, Math.min(68, len * 0.36)) : 0
    const sign    = hasBidi ? (isFirst ? 1 : -1) : 0

    const sx = pF.x + ux * CR
    const sy = pF.y + uy * CR
    const ex = pT.x - ux * (CR + 7)
    const ey = pT.y - uy * (CR + 7)
    const mx = (sx + ex) / 2 + cpx * sign * bendAmt
    const my = (sy + ey) / 2 + cpy * sign * bendAmt

    const pathD = bendAmt > 0
      ? `M${sx.toFixed(1)},${sy.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`
      : `M${sx.toFixed(1)},${sy.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`

    const lx = mx + cpx * sign * 12
    const ly = my + cpy * sign * 12

    const stroke    = isSel ? 'var(--color-primary)' : 'var(--color-primary)'
    const opacity   = isSel ? '1' : '.75'
    const strokeW   = isSel ? '2' : '1.4'
    const markerId  = isSel ? 'ta-h' : 'ta'

    return `<g class="td-edge-g" data-key="${this._esc(edge.key)}" data-from="${this._esc(edge.from)}" data-to="${this._esc(edge.to)}">
      <path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${strokeW}"
        stroke-opacity="${opacity}" marker-end="url(#${markerId})"/>
      <path class="td-edge-hit" d="${pathD}" fill="none" stroke="transparent" stroke-width="14"/>
      ${this._tdEdgeLbl(lx, ly, edge.items, isSel)}
    </g>`
  }

  _tdSelfLoop(p, CR, edge, isSel) {
    const x = p.x, y = p.y - CR
    const pathD = `M${x - 8},${y} C${x - 28},${y - 42} ${x + 28},${y - 42} ${x + 8},${y}`
    const opacity  = isSel ? '1' : '.75'
    const strokeW  = isSel ? '2' : '1.4'
    const markerId = isSel ? 'ta-h' : 'ta'

    return `<g class="td-edge-g" data-key="${this._esc(edge.key)}" data-from="${this._esc(edge.from)}" data-to="${this._esc(edge.to)}">
      <path d="${pathD}" fill="none" stroke="var(--color-primary)" stroke-width="${strokeW}"
        stroke-opacity="${opacity}" marker-end="url(#${markerId})"/>
      <path class="td-edge-hit" d="${pathD}" fill="none" stroke="transparent" stroke-width="14"/>
      ${this._tdEdgeLbl(x, y - 32, edge.items, isSel)}
    </g>`
  }

  _tdEdgeLbl(cx, cy, items, isSel) {
    const MAX  = 4
    const fill = isSel ? 'var(--color-primary)' : 'var(--color-text)'
    const shown = items.slice(0, MAX)
    const overflow = items.length > MAX ? items.length - MAX : 0

    if (window.katex) {
      const LW     = 90
      const LINE_H = 17
      const H      = (shown.length + (overflow ? 1 : 0)) * LINE_H + 2
      const x      = (cx - LW / 2).toFixed(1)
      const y      = (cy - H / 2).toFixed(1)

      const lines = shown.map(({ sym, inst }) => {
        const r     = sym        === '#' ? '\\#' : this._esc(sym)
        const w     = inst.write === '#' ? '\\#' : this._esc(inst.write)
        const d     = inst.dir === 'R' ? '\\text{R}' : '\\text{L}'
        const latex = `${r} \\to ${w},\\!${d}`
        const html  = window.katex.renderToString(latex, { throwOnError: false, output: 'html' })
        return `<div class="td-fo-line">${html}</div>`
      }).join('')

      const ovf = overflow ? `<div class="td-fo-more">+${overflow}</div>` : ''

      return `<foreignObject x="${x}" y="${y}" width="${LW}" height="${H}" overflow="visible" pointer-events="none">
          <div xmlns="http://www.w3.org/1999/xhtml" class="td-fo-lbl" style="color:${fill}">
            ${lines}${ovf}
          </div>
        </foreignObject>`
    }

    // Fallback: plain SVG text
    const fallback = shown.map(({ sym, inst }) => {
      const r = sym === '#' ? '#' : sym
      const w = inst.write === '#' ? '#' : inst.write
      return `${r} → ${w}, ${inst.dir}`
    })
    const extra  = overflow ? `+${overflow}` : ''
    const count  = fallback.length + (extra ? 1 : 0)
    const yStart = (cy - (count - 1) * 11 / 2).toFixed(1)
    const tspans = fallback.map((l, i) =>
      `<tspan x="${cx.toFixed(1)}" dy="${i === 0 ? 0 : 11}">${this._esc(l)}</tspan>`
    ).join('')
    const ext = extra ? `<tspan x="${cx.toFixed(1)}" dy="11" fill="var(--color-muted)">${extra}</tspan>` : ''
    return `<text x="${cx.toFixed(1)}" y="${yStart}" class="tm-diag-edge-lbl" fill="${fill}" pointer-events="none">${tspans}${ext}</text>`
  }

  _tdAttachEvents(svg) {
    const self = this

    const svgPoint = (e) => {
      const rect = svg.getBoundingClientRect()
      const vb   = svg.viewBox.baseVal
      const scX  = vb.width  / rect.width
      const scY  = vb.height / rect.height
      return {
        x: (e.clientX - rect.left) * scX,
        y: (e.clientY - rect.top)  * scY
      }
    }

    // Background: pan on drag, deselect on click, add state on dblclick
    const bgEl = svg.querySelector('.td-bg')
    if (bgEl) {
      bgEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return
        e.preventDefault()

        const startX   = e.clientX, startY = e.clientY
        const vb       = svg.viewBox.baseVal
        const origX    = vb.x, origY = vb.y
        const origW    = vb.width, origH = vb.height
        const rect     = svg.getBoundingClientRect()
        const scX      = origW / rect.width
        const scY      = origH / rect.height
        let panned     = false

        const onMove = (me) => {
          const dx = me.clientX - startX
          const dy = me.clientY - startY
          if (!panned && Math.abs(dx) + Math.abs(dy) < 4) return
          panned = true
          svg.classList.add('td-panning')
          const nx = origX - dx * scX
          const ny = origY - dy * scY
          self._diagVB = { x: nx, y: ny, w: origW, h: origH }
          svg.setAttribute('viewBox', `${nx.toFixed(1)} ${ny.toFixed(1)} ${origW.toFixed(1)} ${origH.toFixed(1)}`)
        }

        const onUp = () => {
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)
          svg.classList.remove('td-panning')
          if (!panned) {
            self._tdClosePanel()
            self._diagSel = null
            self.renderDiagram()
          }
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
      })

      bgEl.addEventListener('dblclick', (e) => {
        const pt = svgPoint(e)
        self._tdAddState(pt.x, pt.y)
      })
    }

    svg.querySelectorAll('.td-node-g').forEach(g => {
      const state = g.dataset.state

      g.querySelector('.td-conn-dot')?.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        self._tdStartConnect(state, e, svg)
      })

      g.querySelector('.td-node-body')?.addEventListener('mousedown', (e) => {
        if (self._diagMode === 'connecting') return  // onUp via elementFromPoint handles it
        e.stopPropagation()
        const startPt = svgPoint(e)
        let dragged = false
        let moved   = false

        const onMove = (me) => {
          moved = true
          const pt = svgPoint(me)
          const dx = pt.x - startPt.x
          const dy = pt.y - startPt.y
          if (!dragged && Math.sqrt(dx*dx + dy*dy) > 4) dragged = true
          if (dragged) {
            self.nodePositions[state] = { x: pt.x, y: pt.y }
            self._tdClosePanel()
            self.renderDiagram()
          }
        }

        const onUp = (ue) => {
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)
          if (!dragged) {
            self._diagSel = { type: 'node', state }
            self.renderDiagram()
            const pt = svgPoint(ue)
            self._tdShowNodePanel(state, svg, pt)
          }
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
      })
    })

    svg.querySelectorAll('.td-edge-hit').forEach(hit => {
      hit.addEventListener('click', (e) => {
        e.stopPropagation()
        const g    = hit.closest('.td-edge-g')
        const from = g.dataset.from
        const to   = g.dataset.to
        const key  = g.dataset.key
        self._diagSel = { type: 'edge', from, to, key }
        self.renderDiagram()
        const pt = svgPoint(e)
        self._tdShowEdgePanel(from, to, svg, pt)
      })
    })

    // Ctrl+Scroll → zoom the diagram via viewBox manipulation
    svg.addEventListener('wheel', (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()

      const vb   = svg.viewBox.baseVal
      const rect = svg.getBoundingClientRect()

      // Current viewBox values
      let vx = vb.x, vy = vb.y, vw = vb.width, vh = vb.height

      // Mouse position in SVG coordinates
      const mx = vx + (e.clientX - rect.left) / rect.width  * vw
      const my = vy + (e.clientY - rect.top)  / rect.height * vh

      // Zoom factor (scroll up = zoom in)
      const factor = e.deltaY < 0 ? 0.85 : 1 / 0.85
      const nw     = vw * factor
      const nh     = vh * factor

      // Clamp: 20% – 400% of base viewBox
      const bw = self._diagBaseW || vw
      if (nw < bw * 0.2 || nw > bw * 4) return

      // Shift origin so the point under the cursor stays fixed
      const nx = mx - (mx - vx) * factor
      const ny = my - (my - vy) * factor

      self._diagVB = { x: nx, y: ny, w: nw, h: nh }
      svg.setAttribute('viewBox', `${nx.toFixed(1)} ${ny.toFixed(1)} ${nw.toFixed(1)} ${nh.toFixed(1)}`)
    }, { passive: false })
  }

  _tdStartConnect(fromState, e, svg) {
    this._diagMode     = 'connecting'
    this._diagConnFrom = fromState
    this._diagSel      = null
    this._tdClosePanel()

    // Visual feedback directly on the DOM — no renderDiagram() to avoid destroying ghost ref
    const nodeG = svg.querySelector(`.td-node-g[data-state="${CSS.escape(fromState)}"]`)
    if (nodeG) nodeG.classList.add('td-connecting-src')

    const ghost = svg.getElementById('td-ghost')
    const pF    = this.nodePositions[fromState]

    const toSVG = (ev) => {
      const rect = svg.getBoundingClientRect()
      const vb   = svg.viewBox.baseVal
      return {
        x: (ev.clientX - rect.left) * ((vb.width  || 600) / rect.width),
        y: (ev.clientY - rect.top)  * ((vb.height || 300) / rect.height),
      }
    }

    const onMove = (me) => {
      if (!ghost || !pF) return
      const pt = toSVG(me)
      ghost.setAttribute('d', `M${pF.x.toFixed(1)},${pF.y.toFixed(1)} L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
      ghost.style.display = ''
    }

    const onUp = (ue) => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (ghost) ghost.style.display = 'none'
      if (nodeG) nodeG.classList.remove('td-connecting-src')

      this._diagMode     = 'idle'
      this._diagConnFrom = null

      // Detect target node under cursor using elementFromPoint
      const el      = document.elementFromPoint(ue.clientX, ue.clientY)
      const targetG = el?.closest('.td-node-g')
      const toState = targetG?.dataset?.state

      if (toState) {
        this._tdCompleteConnect(fromState, toState, svg, ue)
      } else {
        this.renderDiagram()
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  _tdCompleteConnect(fromState, toState, svg, e) {
    this._diagSel = { type: 'edge', from: fromState, to: toState, key: `${fromState}→${toState}` }
    this.renderDiagram()
    const rect = svg.getBoundingClientRect()
    const vb   = svg.viewBox.baseVal
    const pt   = {
      x: (e.clientX - rect.left) * ((vb.width  || 600) / rect.width),
      y: (e.clientY - rect.top)  * ((vb.height || 300) / rect.height),
    }
    this._tdShowAddTransPanel(fromState, toState, svg, pt)
  }

  _tdPositionPanel(panel, svgPt, svg) {
    const rect   = svg.getBoundingClientRect()
    const vb     = svg.viewBox.baseVal
    const scaleX = rect.width  / vb.width
    const scaleY = rect.height / vb.height

    panel.style.display = 'block'

    let left = rect.left + svgPt.x * scaleX + 12
    let top  = rect.top  + svgPt.y * scaleY - 10

    const pw   = panel.offsetWidth  || 240
    const ph   = panel.offsetHeight || 120
    const maxL = window.innerWidth  - pw - 8
    const maxT = window.innerHeight - ph - 8

    left = Math.max(4, Math.min(left, maxL))
    top  = Math.max(4, Math.min(top,  maxT))

    panel.style.left = `${left}px`
    panel.style.top  = `${top}px`
  }

  _tdClosePanel() {
    if (this._diagPanel) this._diagPanel.style.display = 'none'
    this._diagSel      = null
    this._diagMode     = 'idle'
    this._diagConnFrom = null
  }

  _tdShowNodePanel(state, svg, pt) {
    const panel = this._diagPanel
    if (!panel) return

    const isInit = state === this.initState
    panel.innerHTML = `
      <div class="tdp-header">
        <span class="tdp-title">${this._esc(state)}</span>
        <button class="tdp-close-btn" title="Close">✕</button>
      </div>
      <div class="tdp-body">
        <button class="tdp-btn${isInit ? ' tdp-btn--active' : ''}" data-action="init">
          ${isInit ? '✓ Initial state' : 'Set as initial state'}
        </button>
        <button class="tdp-btn tdp-btn--danger" data-action="delete">Delete state</button>
      </div>`

    panel.querySelector('[data-action="init"]')?.addEventListener('click', () => {
      this.initState = state
      if (this.elInitState) this.elInitState.value = state
      this.buildTable()
      this.updateFormalDef()
      this._tdClosePanel()
      this.renderDiagram()
    })

    panel.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      if (this.states.length <= 1) return
      const idx = this.states.indexOf(state)
      if (idx === -1) return
      this.states.splice(idx, 1)
      delete this.nodePositions[state]
      if (!this.states.includes(this.initState)) this.initState = this.states[0]
      Object.keys(this.transitions).forEach(k => {
        const [s, sym] = k.split(',')
        if (s === state || this.transitions[k].next === state) delete this.transitions[k]
      })
      this._syncDiagramToTable()
      this._tdClosePanel()
    })

    panel.querySelector('.tdp-close-btn')?.addEventListener('click', () => this._tdClosePanel())

    this._tdPositionPanel(panel, pt, svg)
  }

  _tdShowEdgePanel(from, to, svg, pt) {
    const panel = this._diagPanel
    if (!panel) return

    const syms   = this.allSymbols
    const states = this.states

    const transItems = Object.entries(this.transitions)
      .filter(([k, v]) => {
        const [s] = k.split(',')
        return s === from && v.next === to
      })

    const makeSelOpts = (list, val) =>
      list.map(s => `<option value="${this._esc(s)}"${s === val ? ' selected' : ''}>${this._esc(s)}</option>`).join('')

    const rowsHtml = transItems.map(([key, inst]) => {
      const [, sym] = key.split(',')
      return `<div class="tdp-trans-row" data-tkey="${this._esc(key)}">
        <select class="tdp-sel tdp-read" title="Read symbol">${makeSelOpts(syms, sym)}</select>
        <span class="tdp-arrow">→</span>
        <select class="tdp-sel tdp-write" title="Write symbol">${makeSelOpts(syms, inst.write)}</select>
        <div class="tdp-dir-btns">
          <button class="tdp-dir${inst.dir === 'R' ? ' active' : ''}" data-dir="R">R</button>
          <button class="tdp-dir${inst.dir === 'L' ? ' active' : ''}" data-dir="L">L</button>
        </div>
        <select class="tdp-sel tdp-next" title="Next state">${makeSelOpts(states, inst.next)}</select>
        <button class="tdp-del-trans" title="Delete transition">✕</button>
      </div>`
    }).join('')

    const addRowHtml = `<div class="tdp-sep"></div>
      <div class="tdp-trans-row tdp-add-row">
        <select class="tdp-sel tdp-read" title="Read symbol">${makeSelOpts(syms, syms[0])}</select>
        <span class="tdp-arrow">→</span>
        <select class="tdp-sel tdp-write" title="Write symbol">${makeSelOpts(syms, syms[0])}</select>
        <div class="tdp-dir-btns">
          <button class="tdp-dir active" data-dir="R">R</button>
          <button class="tdp-dir" data-dir="L">L</button>
        </div>
        <select class="tdp-sel tdp-next" title="Next state">${makeSelOpts(states, to)}</select>
        <button class="tdp-add-trans">+ Add</button>
      </div>`

    panel.innerHTML = `
      <div class="tdp-header">
        <span class="tdp-title">${this._esc(from)} → ${this._esc(to)}</span>
        <button class="tdp-close-btn" title="Close">✕</button>
      </div>
      <div class="tdp-body">
        <div class="tdp-trans-list">${rowsHtml}</div>
        ${addRowHtml}
      </div>`

    const syncFromPanel = () => {
      const newTransitions = { ...this.transitions }

      transItems.forEach(([oldKey]) => { delete newTransitions[oldKey] })

      panel.querySelectorAll('.tdp-trans-row:not(.tdp-add-row)').forEach(row => {
        const sym   = row.querySelector('.tdp-read').value
        const write = row.querySelector('.tdp-write').value
        const dir   = row.querySelector('.tdp-dir.active')?.dataset.dir || 'R'
        const next  = row.querySelector('.tdp-next').value
        newTransitions[`${from},${sym}`] = { write, dir, next }
      })

      this.transitions = newTransitions
      this._syncDiagramToTable()
    }

    panel.querySelectorAll('.tdp-trans-row:not(.tdp-add-row)').forEach(row => {
      row.querySelectorAll('select').forEach(sel => sel.addEventListener('change', syncFromPanel))
      row.querySelectorAll('.tdp-dir').forEach(btn => {
        btn.addEventListener('click', () => {
          row.querySelectorAll('.tdp-dir').forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
          syncFromPanel()
        })
      })
      row.querySelector('.tdp-del-trans')?.addEventListener('click', () => {
        const sym = row.querySelector('.tdp-read').value
        delete this.transitions[`${from},${sym}`]
        this._syncDiagramToTable()
        const stillExist = Object.entries(this.transitions).some(([k, v]) => {
          const [s] = k.split(',')
          return s === from && v.next === to
        })
        if (!stillExist) {
          this._diagSel = null
          this._tdClosePanel()
        } else {
          this._tdShowEdgePanel(from, to, svg, pt)
        }
      })
    })

    const addRow = panel.querySelector('.tdp-add-row')
    addRow?.querySelectorAll('.tdp-dir').forEach(btn => {
      btn.addEventListener('click', () => {
        addRow.querySelectorAll('.tdp-dir').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      })
    })

    addRow?.querySelector('.tdp-add-trans')?.addEventListener('click', () => {
      const sym   = addRow.querySelector('.tdp-read').value
      const write = addRow.querySelector('.tdp-write').value
      const dir   = addRow.querySelector('.tdp-dir.active')?.dataset.dir || 'R'
      const next  = addRow.querySelector('.tdp-next').value
      this.transitions[`${from},${sym}`] = { write, dir, next }
      this._diagSel = { type: 'edge', from, to: next, key: `${from}→${next}` }
      this._syncDiagramToTable()
      this._tdShowEdgePanel(from, next, svg, pt)
    })

    panel.querySelector('.tdp-close-btn')?.addEventListener('click', () => this._tdClosePanel())

    this._tdPositionPanel(panel, pt, svg)
  }

  _tdShowAddTransPanel(from, to, svg, pt) {
    const panel = this._diagPanel
    if (!panel) return

    const syms   = this.allSymbols
    const states = this.states

    const makeSelOpts = (list, val) =>
      list.map(s => `<option value="${this._esc(s)}"${s === val ? ' selected' : ''}>${this._esc(s)}</option>`).join('')

    panel.innerHTML = `
      <div class="tdp-header">
        <span class="tdp-title">New: ${this._esc(from)} → ${this._esc(to)}</span>
        <button class="tdp-close-btn" title="Close">✕</button>
      </div>
      <div class="tdp-body">
        <div class="tdp-trans-row tdp-add-row">
          <select class="tdp-sel tdp-read" title="Read symbol">${makeSelOpts(syms, syms[0])}</select>
          <span class="tdp-arrow">→</span>
          <select class="tdp-sel tdp-write" title="Write symbol">${makeSelOpts(syms, syms[0])}</select>
          <div class="tdp-dir-btns">
            <button class="tdp-dir active" data-dir="R">R</button>
            <button class="tdp-dir" data-dir="L">L</button>
          </div>
          <select class="tdp-sel tdp-next" title="Next state">${makeSelOpts(states, to)}</select>
        </div>
        <button class="tdp-btn" data-action="add" style="margin-top:.3rem">Add transition</button>
      </div>`

    const addRow = panel.querySelector('.tdp-add-row')
    addRow?.querySelectorAll('.tdp-dir').forEach(btn => {
      btn.addEventListener('click', () => {
        addRow.querySelectorAll('.tdp-dir').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      })
    })

    panel.querySelector('[data-action="add"]')?.addEventListener('click', () => {
      const sym   = addRow.querySelector('.tdp-read').value
      const write = addRow.querySelector('.tdp-write').value
      const dir   = addRow.querySelector('.tdp-dir.active')?.dataset.dir || 'R'
      const next  = addRow.querySelector('.tdp-next').value
      this.transitions[`${from},${sym}`] = { write, dir, next }
      this._diagSel = { type: 'edge', from, to: next, key: `${from}→${next}` }
      this._syncDiagramToTable()
      this._tdShowEdgePanel(from, next, svg, pt)
    })

    panel.querySelector('.tdp-close-btn')?.addEventListener('click', () => this._tdClosePanel())

    this._tdPositionPanel(panel, pt, svg)
  }

  _tdAddState(x, y) {
    let n = this.states.length
    while (this.states.includes(`q${n}`)) n++
    const newState = `q${n}`
    this.states.push(newState)
    this.nodePositions[newState] = { x, y }
    this.buildTable()
    this._syncStateSelect()
    this.updateFormalDef()
    this.renderDiagram()
  }

  _syncDiagramToTable() {
    const cellMap = {}
    Object.entries(this.transitions).forEach(([k, v]) => {
      cellMap[k] = `${v.write}${v.dir}${v.next}`
    })
    this.buildTable(cellMap)
    this.buildTransitions()
    this.updateFormalDef()
    this._syncStateSelect()
    this.renderDiagram()
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
    this.alphabet      = ex.alphabet.split(/\s+/).filter(s => s && s !== '#')
    this.states        = [...ex.states]
    this.initState     = ex.initState
    this.nodePositions = {}
    this._diagVB       = null
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
    // Table / Diagram view switch
    const vsTable        = document.getElementById('tm-vs-table')
    const vsDiagram      = document.getElementById('tm-vs-diagram')
    const vsTableExtras  = document.getElementById('tm-vs-table-extras')
    const vsDiagExtras   = document.getElementById('tm-vs-diagram-extras')
    document.querySelectorAll('.tm-vs-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view
        document.querySelectorAll('.tm-vs-btn').forEach(b =>
          b.classList.toggle('is-active', b.dataset.view === view)
        )
        vsTable.style.display       = view === 'table'   ? '' : 'none'
        vsDiagram.style.display     = view === 'diagram' ? '' : 'none'
        vsTableExtras.style.display = view === 'table'   ? '' : 'none'
        vsDiagExtras.style.display  = view === 'diagram' ? '' : 'none'
        if (view === 'diagram') requestAnimationFrame(() => this.renderDiagram())
      })
    })

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

    // Re-render tape when card resizes (handles wrapping recalculation)
    if (this.elTapeTrack && window.ResizeObserver) {
      new ResizeObserver(() => this.renderTape()).observe(this.elTapeTrack)
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      if (e.key === ' ')          { e.preventDefault(); this.isRunning ? this.pause() : this.play() }
      if (e.key === 'ArrowRight') { e.preventDefault(); if (!this.isRunning) this.step() }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this.stepBack() }
      if (e.key === 'r' || e.key === 'R') this.reset()
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault()
        this._diagVB = null
        this.renderDiagram()
      }
      if (e.key === 'Escape') {
        this.hideTheory()
        if (this._diagMode === 'connecting' || this._diagSel) {
          this._tdClosePanel()
          this.renderDiagram()
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this._diagSel?.type === 'node') {
          const state = this._diagSel.state
          if (this.states.length > 1) {
            const idx = this.states.indexOf(state)
            if (idx !== -1) {
              this.states.splice(idx, 1)
              delete this.nodePositions[state]
              if (!this.states.includes(this.initState)) this.initState = this.states[0]
              Object.keys(this.transitions).forEach(k => {
                const [s] = k.split(',')
                if (s === state || this.transitions[k].next === state) delete this.transitions[k]
              })
              this._syncDiagramToTable()
              this._tdClosePanel()
            }
          }
        } else if (this._diagSel?.type === 'edge') {
          const { from, to } = this._diagSel
          Object.keys(this.transitions).forEach(k => {
            const [s] = k.split(',')
            if (s === from && this.transitions[k].next === to) delete this.transitions[k]
          })
          this._syncDiagramToTable()
          this._tdClosePanel()
        }
      }
    })
  }

  main() {
    this.loadExample('count-ones')
  }
}

export default TuringMachine
