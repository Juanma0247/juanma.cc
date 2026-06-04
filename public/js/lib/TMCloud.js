import { initializeApp, getApps }      from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { getFirestore, collection, getDocs, setDoc, doc, query, where, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
import TuringMachine from '/js/lib/TuringMachine.js'

const COLLECTION = 'turing-machines'
let   _db        = null

export function initDB(config) {
  const app = getApps().length ? getApps()[0] : initializeApp(config)
  _db = getFirestore(app)
}

async function fetchMachines() {
  if (!_db) return {}
  const snap = await getDocs(collection(_db, COLLECTION))
  const res  = {}
  snap.forEach(d => { res[d.id] = d.data() })
  return res
}

// ── Machine ID helpers ────────────────────────────────────────────

/** Genera un ID URL-safe a partir del título. */
function generateMachineId(title) {
  return String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40) || 'machine'
}

/** True si el machineId no está en uso. */
async function isMachineIdAvailable(id) {
  if (!_db) return true
  try {
    const q    = query(collection(_db, COLLECTION), where('machineId', '==', id), limit(1))
    const snap = await getDocs(q)
    return snap.empty
  } catch { return true }
}

/** Devuelve el primer machineId disponible a partir de la base dada. */
async function resolveUniqueMachineId(base) {
  if (await isMachineIdAvailable(base)) return base
  for (let n = 2; n <= 99; n++) {
    const candidate = `${base}-${n}`.substring(0, 44)
    if (await isMachineIdAvailable(candidate)) return candidate
  }
  return `${base}-${Date.now()}`
}

/**
 * Busca una máquina por su machineId (campo del documento, no el doc-id).
 * @param   {string} machineId
 * @returns {Promise<object|null>}
 */
export async function getMachineById(machineId) {
  if (!_db || !machineId) return null
  try {
    const q    = query(collection(_db, COLLECTION), where('machineId', '==', machineId), limit(1))
    const snap = await getDocs(q)
    return snap.empty ? null : snap.docs[0].data()
  } catch (e) {
    console.warn('[TMCloud] getMachineById error:', e)
    return null
  }
}

async function saveMachine(id, data) {
  if (!_db) return false
  try {
    await setDoc(doc(collection(_db, COLLECTION), id), data)
    return true
  } catch (e) {
    alert(`Error uploading: ${e.message}`)
    return false
  }
}

// ── Validation ────────────────────────────────────────────────────────

export function validateMachine(data) {
  const errors = []
  const rawAlph = (data.alphabet || '').split(/\s+/).filter(s => s && s !== '#')
  const allSym  = [...rawAlph, '#']
  const K       = data.states || []
  const I       = data.trans  || {}

  if (!String(data.title       || '').trim()) errors.push('El título es obligatorio.')
  if (!String(data.description || '').trim()) errors.push('La descripción es obligatoria.')
  if (!String(data.author      || '').trim()) errors.push('El autor es obligatorio.')

  if (rawAlph.length === 0) {
    errors.push('El alfabeto Σ debe tener al menos un símbolo.')
  } else {
    rawAlph.forEach(s => {
      if (s.length !== 1) errors.push(`El símbolo "${s}" debe ser un único carácter.`)
    })
    if (new Set(rawAlph).size !== rawAlph.length) errors.push('El alfabeto Σ tiene símbolos duplicados.')
  }

  if (K.length === 0) {
    errors.push('El conjunto de estados K debe tener al menos un estado.')
  } else {
    if (new Set(K).size !== K.length) errors.push('El conjunto de estados K tiene entradas duplicadas.')
  }

  if (K.length > 0 && !K.includes(data.initState)) {
    errors.push(`El estado inicial "${data.initState}" no pertenece a K = {${K.join(', ')}}.`)
  }

  if (data.tape) {
    const invalid = [...String(data.tape)]
      .filter(c => c !== '#' && c !== '_')
      .filter(c => !rawAlph.includes(c))
    if (invalid.length) {
      errors.push(`La cinta contiene símbolos fuera de Σ ∪ {#}: ${[...new Set(invalid)].join(' ')}`)
    }
  }

  if (Object.keys(I).length === 0) {
    errors.push('I debe tener al menos una instrucción (la función de transición no puede estar vacía).')
  }

  Object.entries(I).forEach(([key, val]) => {
    const parts = key.split(',')
    if (parts.length !== 2) {
      errors.push(`Clave de transición malformada: "${key}" — se esperaba "estado,símbolo".`)
      return
    }
    const [fromState, readSym] = parts
    if (!K.includes(fromState))    errors.push(`Transición "${key}": el estado "${fromState}" ∉ K.`)
    if (!allSym.includes(readSym)) errors.push(`Transición "${key}": el símbolo "${readSym}" ∉ Σ ∪ {#}.`)

    const str = String(val).trim()

    // Llamada a sub-máquina: tD@machine-id  o  tD@machine-id:qN
    const cm = str.match(/^(.)(R|L)(@[a-z0-9-]+(?::q\d+)?)$/i)
    if (cm) {
      const [, write] = cm
      if (!allSym.includes(write)) errors.push(`Instrucción "${key}": escribe "${write}" ∉ Σ ∪ {#}.`)
      return   // el estado destino (@machine-id) no se valida contra K
    }

    // Instrucción regular
    const m = str.match(/^(.)(R|L)(\w+)$/i)
    if (!m) {
      errors.push(`Instrucción "${key}" → "${val}": formato inválido. Se espera ⟨símbolo⟩⟨R|L⟩⟨estado⟩ (ej. 1Rq0, #Lq2) o llamada a sub-máquina (ej. 1R@copy-unary:q2).`)
    } else {
      const [, write, , next] = m
      if (!allSym.includes(write))         errors.push(`Instrucción "${key}": escribe "${write}" ∉ Σ ∪ {#}.`)
      if (!K.includes(next.toLowerCase())) errors.push(`Instrucción "${key}": estado siguiente "${next}" ∉ K.`)
    }
  })

  return errors
}

// ── Helpers ───────────────────────────────────────────────────────────

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function buildCard(id, doc) {
  const card = document.createElement('div')
  card.className = 'tm-lib-card'
  card.dataset.id = id

  const svgWrap = document.createElement('div')
  svgWrap.className = 'tm-lib-card-svg'

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.classList.add('tm-lib-preview-svg')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgWrap.appendChild(svg)

  const info = document.createElement('div')
  info.className = 'tm-lib-card-info'
  const idBadge = doc.machineId
    ? `<span class="tm-lib-card-id" title="ID para llamadas: @${esc(doc.machineId)}">@${esc(doc.machineId)}</span>`
    : ''
  info.innerHTML = `
    <span class="tm-lib-card-title">${esc(doc.title)}</span>
    <span class="tm-lib-card-author">by ${esc(doc.author || 'Unknown')}</span>
    ${idBadge}
  `

  card.appendChild(svgWrap)
  card.appendChild(info)

  requestAnimationFrame(() => TuringMachine.renderPreview(svg, doc))

  return card
}

// ── Gallery (overlay) ────────────────────────────────────────────────

export class TMGallery {
  constructor(tm) {
    this.tm       = tm
    this.backdrop = document.getElementById('tm-lib-backdrop')
    this.view     = document.getElementById('tm-lib-view')
    this.grid     = document.getElementById('tm-lib-grid')
    this.detail   = document.getElementById('tm-lib-detail')
    this.btnClose = document.getElementById('tm-lib-close')
    this.btnBack  = document.getElementById('tm-lib-back')

    // Move both to body so position:fixed works even with transformed ancestors
    if (this.backdrop) document.body.appendChild(this.backdrop)
    if (this.view)     document.body.appendChild(this.view)

    this.backdrop?.addEventListener('click', () => this.close())
    this.btnClose?.addEventListener('click', () => this.close())
    this.btnBack?.addEventListener('click',  () => this._showGrid())

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.view?.classList.contains('tm-lib-open')) {
        if (this.detail?.style.display !== 'none') {
          this._showGrid()
        } else {
          this.close()
        }
      }
    })
  }

  open() {
    this.backdrop?.classList.add('tm-lib-open')
    this.view?.classList.add('tm-lib-open')
    this._showGrid()
    this._load()
  }

  close() {
    this.backdrop?.classList.remove('tm-lib-open')
    this.view?.classList.remove('tm-lib-open')
  }

  async _load() {
    if (!this.grid) return
    this.grid.innerHTML = '<div class="tm-lib-status">Cargando…</div>'
    const docs = await fetchMachines()
    this._renderGrid(docs)
  }

  _renderGrid(docs) {
    if (!this.grid) return
    const entries = Object.entries(docs)
    if (entries.length === 0) {
      this.grid.innerHTML = '<div class="tm-lib-status">Aún no hay máquinas en la librería. ¡Sé el primero en subir una!</div>'
      return
    }
    this.grid.innerHTML = ''
    entries.forEach(([id, data]) => {
      const card = buildCard(id, data)
      card.addEventListener('click', () => this._showDetail(data))
      this.grid.appendChild(card)
    })
  }

  _showGrid() {
    if (this.grid)    this.grid.style.display   = ''
    if (this.detail)  this.detail.style.display = 'none'
    if (this.btnBack) this.btnBack.style.display = 'none'
  }

  _showDetail(data) {
    if (!this.detail) return
    if (this.grid)    this.grid.style.display   = 'none'
    this.detail.style.display = ''
    if (this.btnBack) this.btnBack.style.display = ''

    const titleEl  = this.detail.querySelector('.tm-lib-detail-title')
    const authorEl = this.detail.querySelector('.tm-lib-detail-author')
    const descEl   = this.detail.querySelector('.tm-lib-detail-desc')
    const svgEl    = this.detail.querySelector('.tm-lib-detail-preview-svg')
    const btnLoad  = this.detail.querySelector('.tm-lib-detail-load')

    if (titleEl)  titleEl.textContent  = data.title || ''
    if (authorEl) authorEl.textContent = `by ${data.author || 'Unknown'}`
    if (descEl)   descEl.textContent   = data.description || ''

    const idRowEl = this.detail.querySelector('.tm-lib-detail-id')
    if (idRowEl) {
      if (data.machineId) {
        idRowEl.style.display = ''
        idRowEl.innerHTML = `ID para llamadas: <code class="tm-lib-detail-id-code">@${esc(data.machineId)}</code>
          <button class="tm-lib-id-copy-btn" data-id="@${esc(data.machineId)}">Copiar</button>`
        idRowEl.querySelector('.tm-lib-id-copy-btn')?.addEventListener('click', function () {
          navigator.clipboard.writeText(this.dataset.id).then(() => {
            this.textContent = '✓ Copiado'
            setTimeout(() => { this.textContent = 'Copiar' }, 2000)
          }).catch(() => {})
        })
      } else {
        idRowEl.style.display = 'none'
      }
    }

    if (svgEl) {
      svgEl.innerHTML = ''
      requestAnimationFrame(() => TuringMachine.renderPreview(svgEl, data, { cr: 22 }))
    }

    if (btnLoad) {
      btnLoad.onclick = () => {
        this.tm.loadFromData(data)
        this.close()
      }
    }
  }
}

// ── Upload ────────────────────────────────────────────────────────────

export class TMUpload {
  constructor(tm) {
    this.tm       = tm
    this.backdrop = document.getElementById('tm-up-backdrop')
    this.modal    = document.getElementById('tm-up-modal')
    this.form     = document.getElementById('tm-up-form')
    this.errEl    = document.getElementById('tm-up-errors')
    this.btnClose = document.getElementById('tm-up-close')

    this.backdrop?.addEventListener('click', () => this.close())
    this.btnClose?.addEventListener('click', () => this.close())
    this.form?.addEventListener('submit', e => { e.preventDefault(); this._submit() })

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.modal?.classList.contains('tm-open')) this.close()
    })
  }

  open() {
    this.backdrop?.classList.add('tm-open')
    this.modal?.classList.add('tm-open')
    this.form?.reset()
    if (this.errEl) this.errEl.innerHTML = ''
  }

  close() {
    this.backdrop?.classList.remove('tm-open')
    this.modal?.classList.remove('tm-open')
  }

  async _submit() {
    if (!this.form) return
    const title  = this.form.querySelector('#tm-up-title').value.trim()
    const desc   = this.form.querySelector('#tm-up-desc').value.trim()
    const author = this.form.querySelector('#tm-up-author').value.trim()

    const machineData = this.tm.collectMachineData()
    const data = { title, description: desc, author, ...machineData, createdAt: new Date().toISOString() }

    const errs = validateMachine(data)
    if (errs.length) {
      if (this.errEl) this.errEl.innerHTML = errs.map(e => `<li>${esc(e)}</li>`).join('')
      return
    }

    if (this.errEl) this.errEl.innerHTML = ''
    const btn = this.form.querySelector('button[type="submit"]')
    if (btn) { btn.disabled = true; btn.textContent = 'Subiendo…' }

    // Generar machineId único a partir del título
    const baseId    = generateMachineId(title)
    const machineId = await resolveUniqueMachineId(baseId)

    const id = `tm_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
    const ok = await saveMachine(id, { ...data, machineId })

    if (btn) { btn.disabled = false; btn.textContent = 'Subir' }

    if (ok) {
      this.tm._loadedTitle       = title
      this.tm._loadedDescription = desc
      this.tm._loadedAuthor      = author
      this.tm._onMachineLoaded?.()
      this._showUploadSuccess(machineId)
    }
  }

  _showUploadSuccess(machineId) {
    if (!this.errEl) return
    const id = esc(machineId)
    this.errEl.innerHTML = `
      <li class="tm-up-success">
        ¡Máquina subida exitosamente!<br>
        <strong>ID para llamadas:</strong>
        <code class="tm-up-machine-id">@${id}</code>
        <button class="tm-up-copy-id" data-copy="@${id}">Copiar</button>
      </li>
    `
    this.errEl.querySelector('.tm-up-copy-id')?.addEventListener('click', function () {
      navigator.clipboard.writeText(this.dataset.copy).then(() => {
        this.textContent = '✓ Copiado'
        setTimeout(() => { this.textContent = 'Copiar' }, 2000)
      }).catch(() => {})
    })
  }
}
