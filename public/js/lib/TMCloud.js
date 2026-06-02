import { initializeApp, getApps }      from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { getFirestore, collection, getDocs, setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
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

  if (!String(data.title       || '').trim()) errors.push('Title is required.')
  if (!String(data.description || '').trim()) errors.push('Description is required.')
  if (!String(data.author      || '').trim()) errors.push('Author is required.')

  if (rawAlph.length === 0) {
    errors.push('Alphabet Σ must have at least one symbol.')
  } else {
    rawAlph.forEach(s => {
      if (s.length !== 1) errors.push(`Symbol "${s}" must be a single character.`)
    })
    if (new Set(rawAlph).size !== rawAlph.length) errors.push('Alphabet Σ has duplicate symbols.')
  }

  if (K.length === 0) {
    errors.push('State set K must have at least one state.')
  } else {
    if (new Set(K).size !== K.length) errors.push('State set K has duplicate entries.')
  }

  if (K.length > 0 && !K.includes(data.initState)) {
    errors.push(`Initial state "${data.initState}" is not in K = {${K.join(', ')}}.`)
  }

  if (data.tape) {
    const invalid = [...String(data.tape)]
      .filter(c => c !== '#' && c !== '_')
      .filter(c => !rawAlph.includes(c))
    if (invalid.length) {
      errors.push(`Tape contains symbols outside Σ ∪ {#}: ${[...new Set(invalid)].join(' ')}`)
    }
  }

  if (Object.keys(I).length === 0) {
    errors.push('I must have at least one instruction (the machine cannot have an empty transition function).')
  }

  Object.entries(I).forEach(([key, val]) => {
    const parts = key.split(',')
    if (parts.length !== 2) {
      errors.push(`Malformed transition key: "${key}" — expected "state,symbol".`)
      return
    }
    const [fromState, readSym] = parts
    if (!K.includes(fromState))   errors.push(`Transition key "${key}": state "${fromState}" ∉ K.`)
    if (!allSym.includes(readSym)) errors.push(`Transition key "${key}": symbol "${readSym}" ∉ Σ ∪ {#}.`)

    const m = String(val).trim().match(/^(.)(R|L)(\w+)$/i)
    if (!m) {
      errors.push(`Instruction "${key}" → "${val}": invalid format. Expected ⟨symbol⟩⟨R|L⟩⟨state⟩ (e.g. 1Rq0, #Lq2).`)
    } else {
      const [, write, , next] = m
      if (!allSym.includes(write))        errors.push(`Instruction "${key}": writes "${write}" ∉ Σ ∪ {#}.`)
      if (!K.includes(next.toLowerCase())) errors.push(`Instruction "${key}": next state "${next}" ∉ K.`)
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
  info.innerHTML = `
    <span class="tm-lib-card-title">${esc(doc.title)}</span>
    <span class="tm-lib-card-author">by ${esc(doc.author || 'Unknown')}</span>
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
    this.grid.innerHTML = '<div class="tm-lib-status">Loading…</div>'
    const docs = await fetchMachines()
    this._renderGrid(docs)
  }

  _renderGrid(docs) {
    if (!this.grid) return
    const entries = Object.entries(docs)
    if (entries.length === 0) {
      this.grid.innerHTML = '<div class="tm-lib-status">No machines in the library yet. Be the first to upload one!</div>'
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
    if (btn) { btn.disabled = true; btn.textContent = 'Uploading…' }

    const id = `tm_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
    const ok = await saveMachine(id, data)

    if (btn) { btn.disabled = false; btn.textContent = 'Upload' }

    if (ok) {
      this.tm._loadedTitle       = title
      this.tm._loadedDescription = desc
      this.tm._loadedAuthor      = author
      this.tm._onMachineLoaded?.()
      this.close()
    }
  }
}
