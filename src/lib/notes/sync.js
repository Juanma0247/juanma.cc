import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { toBase64, fromBase64 } from 'lib0/buffer'
import {
  ref, get, push, update, onValue, onChildAdded, query, orderByKey, startAfter, runTransaction,
} from 'firebase/database'
import { PATHS } from './config.js'

const REMOTE = 'remote'
const FLUSH_MS = 24
const COMPACT_AT = 250

// Each note is a Y.Doc. The server keeps a compacted snapshot plus an append-only
// log of incremental updates; every client applies both (Yjs merges are
// idempotent and commutative), so concurrent edits never overwrite each other.
export class NoteSync {
  constructor(db, id, { onStatus, onLocalChange } = {}) {
    this.db = db
    this.id = id
    this.doc = new Y.Doc()
    this.text = this.doc.getText('md')
    this.base = ref(db, `${PATHS.ydoc}/${id}`)
    this.logRef = ref(db, `${PATHS.ydoc}/${id}/log`)
    this.snapRef = ref(db, `${PATHS.ydoc}/${id}/snap`)
    this.onStatus = onStatus || (() => {})
    this.onLocalChange = onLocalChange || (() => {})
    this.pending = []
    this.inflight = 0
    this.timer = 0
    this.lastKey = null
    this.listening = false
    this.connected = false
    this.destroyed = false
    this.unsubs = []
    this.idb = new IndexeddbPersistence(`jm-note-${id}`, this.doc)
    this.onLocal = this.onLocal.bind(this)
    this.ready = this.idb.whenSynced.then(() => {
      if (this.destroyed) return
      this.doc.on('update', this.onLocal)
      this.unsubs.push(onValue(ref(db, '.info/connected'), s => this.onConnection(s.val() === true)))
    })
  }

  status() {
    if (!this.connected) return 'offline'
    if (!this.listening) return 'loading'
    return this.pending.length || this.inflight ? 'saving' : 'synced'
  }

  emitStatus() {
    if (!this.destroyed) this.onStatus(this.status())
  }

  onConnection(online) {
    this.connected = online
    this.emitStatus()
    if (online) this.reconcile().catch(err => console.warn('[notes] sync', err))
  }

  // Pulls the server state, merges it locally and pushes whatever this device
  // has that the server lacks (e.g. edits made offline in a previous session).
  async reconcile() {
    const snap = await get(this.base)
    if (this.destroyed) return
    const data = snap.val() || {}
    const remote = new Y.Doc()
    const updates = []
    if (data.snap?.data) updates.push(fromBase64(data.snap.data))
    const keys = Object.keys(data.log || {}).sort()
    for (const k of keys) updates.push(fromBase64(data.log[k]))
    for (const u of updates) {
      Y.applyUpdate(remote, u)
      Y.applyUpdate(this.doc, u, REMOTE)
    }
    if (keys.length) this.lastKey = keys[keys.length - 1]
    else if (data.snap?.upTo && (!this.lastKey || data.snap.upTo > this.lastKey)) this.lastKey = data.snap.upTo

    const diff = Y.encodeStateAsUpdate(this.doc, Y.encodeStateVector(remote))
    let missing = false
    remote.on('update', () => { missing = true })
    Y.applyUpdate(remote, diff)
    remote.destroy()
    if (missing) this.send(diff)

    if (!this.listening) this.listen()
    this.emitStatus()
    if (keys.length > COMPACT_AT) this.compact().catch(() => {})
  }

  listen() {
    this.listening = true
    const q = this.lastKey ? query(this.logRef, orderByKey(), startAfter(this.lastKey)) : query(this.logRef, orderByKey())
    this.unsubs.push(onChildAdded(q, s => {
      if (this.lastKey == null || s.key > this.lastKey) this.lastKey = s.key
      Y.applyUpdate(this.doc, fromBase64(s.val()), REMOTE)
    }))
    this.unsubs.push(onValue(this.snapRef, s => {
      const v = s.val()
      if (v?.data) Y.applyUpdate(this.doc, fromBase64(v.data), REMOTE)
    }))
  }

  onLocal(update, origin) {
    if (origin === REMOTE || origin === this.idb) return
    this.pending.push(update)
    this.onLocalChange()
    if (!this.timer) this.timer = setTimeout(() => this.flush(), FLUSH_MS)
    this.emitStatus()
  }

  flush() {
    clearTimeout(this.timer)
    this.timer = 0
    if (!this.pending.length) return
    const merged = this.pending.length === 1 ? this.pending[0] : Y.mergeUpdates(this.pending)
    this.pending = []
    this.send(merged)
  }

  send(update) {
    this.inflight++
    this.emitStatus()
    push(this.logRef, toBase64(update))
      .catch(err => console.warn('[notes] push', err))
      .finally(() => { this.inflight--; this.emitStatus() })
  }

  // Folds the log into the snapshot. The transaction refuses to replace a newer
  // snapshot, and only log entries already contained in it are removed.
  async compact() {
    const upTo = this.lastKey
    if (!upTo) return
    const data = toBase64(Y.encodeStateAsUpdate(this.doc))
    const res = await runTransaction(this.snapRef, cur => {
      if (cur && cur.upTo && cur.upTo >= upTo) return undefined
      return { data, upTo }
    }, { applyLocally: false })
    if (!res.committed) return
    const log = (await get(query(this.logRef, orderByKey()))).val() || {}
    const patch = {}
    for (const k of Object.keys(log)) if (k <= upTo) patch[`log/${k}`] = null
    if (Object.keys(patch).length) await update(this.base, patch)
  }

  destroy() {
    this.flush()
    this.destroyed = true
    this.unsubs.forEach(u => u())
    this.unsubs = []
    this.doc.off('update', this.onLocal)
    this.idb.destroy()
    this.doc.destroy()
  }
}

export async function forgetLocalNote(id) {
  const { clearDocument } = await import('y-indexeddb')
  return clearDocument(`jm-note-${id}`).catch(() => {})
}
