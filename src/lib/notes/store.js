import { ref, push, update, onValue, serverTimestamp } from 'firebase/database'
import { ref as sref, listAll, deleteObject } from 'firebase/storage'
import { PATHS, ROOT_ID } from './config.js'
import { forgetLocalNote } from './sync.js'

const CACHE_KEY = 'jm-notes-tree'
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

export class NotesStore {
  constructor(db, storage) {
    this.db = db
    this.storage = storage
    this.items = {}
    this.texts = null
    this.listeners = new Set()
    this.unsubs = []
    try { this.items = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {} } catch { this.items = {} }
  }

  start() {
    this.unsubs.push(onValue(ref(this.db, PATHS.tree), s => {
      this.items = s.val() || {}
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(this.items)) } catch {}
      this.emit()
    }))
    return this
  }

  loadTexts() {
    if (this.texts) return
    this.texts = {}
    this.unsubs.push(onValue(ref(this.db, PATHS.text), s => {
      this.texts = s.val() || {}
      this.emit()
    }))
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit() {
    this.listeners.forEach(fn => fn(this.items))
  }

  get(id) {
    return this.items[id] ? { id, ...this.items[id] } : null
  }

  children(parent = ROOT_ID) {
    return Object.entries(this.items)
      .filter(([, v]) => (v.parent || ROOT_ID) === parent)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'group' ? -1 : 1
        return collator.compare(a.title || '', b.title || '')
      })
  }

  descendants(id) {
    const out = []
    const walk = pid => this.children(pid).forEach(c => { out.push(c); if (c.kind === 'group') walk(c.id) })
    walk(id)
    return out
  }

  path(id) {
    const out = []
    let cur = this.items[id]?.parent
    while (cur && cur !== ROOT_ID && this.items[cur] && out.length < 64) {
      out.unshift({ id: cur, ...this.items[cur] })
      cur = this.items[cur].parent
    }
    return out
  }

  groups() {
    const out = []
    const walk = (pid, depth) => this.children(pid)
      .filter(c => c.kind === 'group')
      .forEach(g => { out.push({ ...g, depth }); walk(g.id, depth + 1) })
    walk(ROOT_ID, 0)
    return out
  }

  findByTitle(title) {
    const needle = title.trim().toLowerCase()
    const hit = Object.entries(this.items).find(([, v]) => v.kind === 'note' && (v.title || '').trim().toLowerCase() === needle)
    return hit ? hit[0] : null
  }

  notes() {
    return Object.entries(this.items).filter(([, v]) => v.kind === 'note').map(([id, v]) => ({ id, ...v }))
  }

  create(kind, parent = ROOT_ID, title = '') {
    const id = push(ref(this.db, PATHS.tree)).key
    const now = Date.now()
    const item = { kind, parent, title, created: now, updated: now }
    this.items = { ...this.items, [id]: item }
    this.emit()
    update(ref(this.db), {
      [`${PATHS.tree}/${id}`]: { ...item, created: serverTimestamp(), updated: serverTimestamp() },
    })
    return id
  }

  patch(id, fields) {
    if (!this.items[id]) return
    this.items = { ...this.items, [id]: { ...this.items[id], ...fields } }
    this.emit()
    const patch = {}
    for (const [k, v] of Object.entries(fields)) patch[`${PATHS.tree}/${id}/${k}`] = v
    return update(ref(this.db), patch)
  }

  rename(id, title) {
    return this.patch(id, { title: title.trim(), updated: Date.now() })
  }

  move(id, parent) {
    if (id === parent) return
    if (this.descendants(id).some(d => d.id === parent)) return
    return this.patch(id, { parent: parent || ROOT_ID })
  }

  saveMeta(id, text) {
    if (!this.items[id]) return
    const excerpt = text.replace(/\s+/g, ' ').trim().slice(0, 160)
    const words = (text.match(/\S+/g) || []).length
    const now = Date.now()
    this.items = { ...this.items, [id]: { ...this.items[id], excerpt, words, updated: now } }
    this.emit()
    return update(ref(this.db), {
      [`${PATHS.text}/${id}`]: text,
      [`${PATHS.tree}/${id}/excerpt`]: excerpt,
      [`${PATHS.tree}/${id}/words`]: words,
      [`${PATHS.tree}/${id}/updated`]: serverTimestamp(),
    })
  }

  async remove(id) {
    const victims = [{ id, ...this.items[id] }, ...this.descendants(id)]
    const patch = {}
    for (const v of victims) {
      patch[`${PATHS.tree}/${v.id}`] = null
      if (v.kind === 'note') {
        patch[`${PATHS.text}/${v.id}`] = null
        patch[`${PATHS.ydoc}/${v.id}`] = null
      }
    }
    const items = { ...this.items }
    victims.forEach(v => delete items[v.id])
    this.items = items
    this.emit()
    await update(ref(this.db), patch)
    for (const v of victims) {
      if (v.kind !== 'note') continue
      forgetLocalNote(v.id)
      listAll(sref(this.storage, `notes/${v.id}`))
        .then(res => Promise.all(res.items.map(i => deleteObject(i))))
        .catch(() => {})
    }
  }

  stop() {
    this.unsubs.forEach(u => u())
    this.unsubs = []
  }
}
