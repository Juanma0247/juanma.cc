import { ref, push, update, onValue, runTransaction, serverTimestamp } from 'firebase/database'
import { ref as sref, listAll, deleteObject } from 'firebase/storage'
import { PATHS, ROOT_ID } from './config.js'
import { forgetLocalNote } from './sync.js'

const CACHE = { tree: 'jm-notes-tree', usage: 'jm-notes-usage', tools: 'jm-notes-tools', texts: 'jm-notes-texts' }
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

// Frecency: every visit adds 1 and the total halves every HALF_LIFE, so a note
// opened a lot last month ranks below one opened a few times this week.
const DAY = 86400000
const HALF_LIFE = 4 * DAY
const TOOL_HALF_LIFE = 21 * DAY

export function decayed(entry, now = Date.now(), half = HALF_LIFE) {
  if (!entry || !entry.s) return 0
  return entry.s * Math.pow(0.5, (now - (entry.at || now)) / half)
}

function readCache(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback } catch { return fallback }
}
function writeCache(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export class NotesStore {
  constructor(db, storage) {
    this.db = db
    this.storage = storage
    this.items = readCache(CACHE.tree, {})
    this.usage = readCache(CACHE.usage, {})
    this.tools = readCache(CACHE.tools, {})
    this.texts = readCache(CACHE.texts, {})
    this.listeners = new Set()
    this.unsubs = []
    this.toolPending = {}
    this.toolTimer = 0
    this.stopped = false
  }

  start(gate = Promise.resolve()) {
    gate.then(() => {
      if (this.stopped) return
      const listen = (path, apply) => this.unsubs.push(onValue(ref(this.db, path), s => { apply(s.val() || {}); this.emit() }, err => console.warn('[notes]', path, err)))
      listen(PATHS.tree, v => { this.items = v; writeCache(CACHE.tree, v) })
      listen(PATHS.usage, v => { this.usage = v; writeCache(CACHE.usage, v) })
      listen(PATHS.tools, v => { this.tools = v; writeCache(CACHE.tools, v) })
      listen(PATHS.text, v => {
        this.texts = v
        const json = JSON.stringify(v)
        if (json.length < 1500000) { try { localStorage.setItem(CACHE.texts, json) } catch {} }
      })
    })
    return this
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

  // ---------- usage ----------
  touch(id) {
    const now = Date.now()
    const prev = this.usage[id] || {}
    this.usage = { ...this.usage, [id]: { n: (prev.n || 0) + 1, last: now, s: decayed(prev, now) + 1, at: now } }
    writeCache(CACHE.usage, this.usage)
    runTransaction(ref(this.db, `${PATHS.usage}/${id}`), cur => {
      const t = Date.now()
      return { n: (cur?.n || 0) + 1, last: t, s: decayed(cur, t) + 1, at: t }
    }).catch(() => {})
  }

  lastOpened(kind = 'note') {
    let best = null
    for (const [id, u] of Object.entries(this.usage)) {
      const item = this.items[id]
      if (!item || item.kind !== kind) continue
      if (!best || (u.last || 0) > best.last) best = { id, last: u.last || 0 }
    }
    return best ? { ...this.get(best.id), last: best.last } : null
  }

  frequent(limit = 8) {
    const now = Date.now()
    return Object.entries(this.usage)
      .filter(([id]) => this.items[id])
      .map(([id, u]) => ({ ...this.get(id), score: decayed(u, now), last: u.last || 0 }))
      .filter(x => x.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  pinned() {
    return Object.entries(this.items).filter(([, v]) => v.pinned).map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => collator.compare(a.title || '', b.title || ''))
  }

  togglePin(id) {
    const item = this.items[id]
    if (!item) return
    return this.patch(id, { pinned: item.pinned ? null : true })
  }

  backlinks(id) {
    const title = (this.items[id]?.title || '').trim().toLowerCase()
    if (!title) return []
    const re = /\[\[([^[\]\n]+)\]\]/g
    const out = []
    for (const [nid, text] of Object.entries(this.texts)) {
      if (nid === id || !this.items[nid] || typeof text !== 'string' || !text.includes('[[')) continue
      for (const m of text.matchAll(re)) {
        if (m[1].trim().toLowerCase() === title) { out.push(this.get(nid)); break }
      }
    }
    return out.sort((a, b) => collator.compare(a.title || '', b.title || ''))
  }

  // ---------- toolbar usage ----------
  toolScore(key) {
    return decayed(this.tools[key], Date.now(), TOOL_HALF_LIFE)
  }

  useTool(key) {
    const now = Date.now()
    const next = { s: decayed(this.tools[key], now, TOOL_HALF_LIFE) + 1, at: now }
    this.tools = { ...this.tools, [key]: next }
    writeCache(CACHE.tools, this.tools)
    this.toolPending[key] = next
    clearTimeout(this.toolTimer)
    this.toolTimer = setTimeout(() => this.flushTools(), 4000)
  }

  flushTools() {
    clearTimeout(this.toolTimer)
    const patch = {}
    for (const [k, v] of Object.entries(this.toolPending)) patch[`${PATHS.tools}/${k}`] = v
    this.toolPending = {}
    if (Object.keys(patch).length) update(ref(this.db), patch).catch(() => {})
  }

  // ---------- writes ----------
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
    const next = { ...this.items[id], ...fields }
    for (const k of Object.keys(fields)) if (fields[k] === null) delete next[k]
    this.items = { ...this.items, [id]: next }
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
    this.texts = { ...this.texts, [id]: text }
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
      patch[`${PATHS.usage}/${v.id}`] = null
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
    this.stopped = true
    this.flushTools()
    this.unsubs.forEach(u => u())
    this.unsubs = []
  }
}
