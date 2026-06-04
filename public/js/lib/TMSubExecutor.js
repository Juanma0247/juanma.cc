/**
 * TMSubExecutor.js
 *
 * Runner autónomo de Máquinas de Turing sin dependencias del DOM.
 * Se usa cuando una transición del padre apunta a un estado @machine-id.
 *
 * ── Sintaxis de llamada ───────────────────────────────────────────
 *   En el campo de instrucción de la tabla de transiciones:
 *
 *     1R@copy-unary          → llama a copy-unary; la máquina padre queda detenida
 *     1R@copy-unary:q3       → llama a copy-unary; la padre reanuda en q3 al finalizar
 *
 *   Formato completo:  <símbolo><D>@<machine-id>[:<resume-state>]
 *     símbolo   — carácter a escribir en la cinta (o #)
 *     D         — dirección R (derecha) | L (izquierda)
 *     machine-id — ID de la máquina en la librería (solo a-z, 0-9, guiones)
 *     resume-state — estado qN en que reanuda la máquina padre (opcional)
 *
 * ── Intercambio de cinta ─────────────────────────────────────────
 *   Input de la sub-máquina  = contenido de la cinta del padre desde la
 *                              posición del cabezal hasta el primer blanco.
 *   Output de la sub-máquina = reemplaza esa sección en la cinta del padre.
 *   El cabezal del padre queda al inicio del output.
 *
 * ── Llamadas anidadas ────────────────────────────────────────────
 *   Las sub-máquinas pueden a su vez llamar a otras máquinas usando la
 *   misma sintaxis en sus propias transiciones. El orquestador (astro page)
 *   maneja la recursión.
 */

export class TMSubExecutor {
  static BLANK = '#'

  /**
   * @param {object} machineData  — definición completa (trans, initState, …)
   * @param {string} inputTape    — contenido inicial de la cinta
   * @param {object} [opts]
   * @param {number} [opts.maxSteps=50000]
   */
  constructor(machineData, inputTape = '', { maxSteps = 50_000 } = {}) {
    this.machineData = machineData
    this.maxSteps    = maxSteps

    // ── Parsear instrucciones ────────────────────────────────────
    this._parsedTrans = {}
    Object.entries(machineData.trans || {}).forEach(([key, val]) => {
      const inst = TMSubExecutor._parseInst(String(val))
      if (inst) this._parsedTrans[key] = inst
    })

    // ── Estado de la máquina ─────────────────────────────────────
    this.tape     = {}
    this.head     = 0
    this.curState = machineData.initState || 'q0'
    this.steps    = 0
    this.status   = 'idle'    // 'idle'|'running'|'halted'|'loop'|'subcall'
    this.seenCfgs = new Set()

    // ── Cargar cinta ──────────────────────────────────────────────
    ;[...String(inputTape)].forEach((c, i) => {
      if (c !== '#' && c !== '_') this.tape[i] = c
    })
  }

  // ── Parser de instrucciones ──────────────────────────────────────

  /**
   * Parsea una instrucción de la forma:
   *   tDqN             → instrucción regular
   *   tD@machine-id    → llamada a sub-máquina (sin resume)
   *   tD@machine-id:qN → llamada a sub-máquina (con resume)
   */
  static _parseInst(raw) {
    const s = (raw ?? '').trim()
    if (!s) return null

    // Llamada a sub-máquina: símbolo + D + @machine-id[:qN]
    const cm = s.match(/^(.)(R|L)(@[a-z0-9-]+(?::q\d+)?)$/i)
    if (cm) return { write: cm[1], dir: cm[2].toUpperCase(), next: cm[3] }

    // Instrucción regular: símbolo + D + qN
    const m = s.match(/^(.)(R|L)(q\d+)$/i)
    if (!m) return null
    return { write: m[1], dir: m[2].toUpperCase(), next: m[3].toLowerCase() }
  }

  // ── Helpers de cinta ─────────────────────────────────────────────

  read(pos) { return this.tape[pos] ?? TMSubExecutor.BLANK }

  write(pos, s) {
    if (s === TMSubExecutor.BLANK) delete this.tape[pos]
    else this.tape[pos] = s
  }

  /** Retorna la cinta como string, sin blancos al final. */
  getTapeString() {
    const keys = Object.keys(this.tape).map(Number)
    if (!keys.length) return ''
    const min = Math.min(...keys)
    const max = Math.max(...keys)
    let out = ''
    for (let i = min; i <= max; i++) out += this.tape[i] ?? TMSubExecutor.BLANK
    return out.replace(/#+$/, '')
  }

  _serializeCfg() {
    const t = Object.entries(this.tape)
      .sort(([a], [b]) => +a - +b)
      .map(([k, v]) => `${k}:${v}`)
      .join(',')
    return `${this.curState}|${this.head}|${t}`
  }

  // ── Paso único ───────────────────────────────────────────────────

  /**
   * Ejecuta un paso.
   * @returns {true|false|{call:string, resume:string|null}}
   *   true              → continuar
   *   false             → máquina detenida (halt o loop)
   *   {call, resume}    → llamada a sub-máquina detectada
   */
  stepOnce() {
    if (this.status === 'halted' || this.status === 'loop') return false

    const sym  = this.read(this.head)
    const inst = this._parsedTrans[`${this.curState},${sym}`]

    if (!inst) {
      this.status = 'halted'
      return false
    }

    this.write(this.head, inst.write)
    this.head    += inst.dir === 'R' ? 1 : -1
    this.curState = inst.next
    this.steps++

    // Detección de llamada a sub-máquina
    if (typeof inst.next === 'string' && inst.next.startsWith('@')) {
      this.status = 'subcall'
      const callStr   = inst.next.slice(1)
      const colonIdx  = callStr.indexOf(':')
      const callId    = colonIdx >= 0 ? callStr.slice(0, colonIdx) : callStr
      const resume    = colonIdx >= 0 ? callStr.slice(colonIdx + 1) : null
      return { call: callId, resume }
    }

    const cfg = this._serializeCfg()
    if (this.seenCfgs.has(cfg)) { this.status = 'loop'; return false }
    this.seenCfgs.add(cfg)

    if (this.steps >= this.maxSteps) { this.status = 'loop'; return false }

    return true
  }

  // ── Ejecución asíncrona por ráfagas ─────────────────────────────

  /**
   * Ejecuta hasta detenerse, detectar loop o encontrar una llamada.
   * Cede al event loop cada BURST pasos para que el navegador pueda
   * actualizar la UI del sub-panel.
   *
   * @param {Function|null} onBurst  callback(executor) tras cada ráfaga
   * @returns {Promise<{status, tape, head, steps, subcall?}>}
   */
  async run(onBurst = null) {
    this.status = 'running'
    const BURST = 300

    return new Promise(resolve => {
      const tick = () => {
        for (let i = 0; i < BURST; i++) {
          const result = this.stepOnce()

          if (result === false) {
            onBurst?.(this)
            resolve({
              status: this.status,
              tape:   this.getTapeString(),
              head:   this.head,
              steps:  this.steps,
            })
            return
          }

          if (result && typeof result === 'object') {
            onBurst?.(this)
            resolve({
              status:  'subcall',
              subcall: result,
              tape:    this.getTapeString(),
              head:    this.head,
              steps:   this.steps,
            })
            return
          }
        }

        onBurst?.(this)
        setTimeout(tick, 0)   // ceder al navegador
      }

      setTimeout(tick, 0)
    })
  }

  /**
   * Reanuda la ejecución después de que se resolvió una llamada anidada.
   * El orquestador debe haber actualizado this.tape antes de llamar esto.
   *
   * @param {string} resumeState  estado qN en que reanuda esta máquina
   */
  resumeAfterSubCall(resumeState) {
    this.curState = resumeState
    this.status   = 'running'
    this.seenCfgs = new Set()   // reiniciar detección de bucle (la cinta cambió)
  }
}
