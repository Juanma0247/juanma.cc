import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
globalThis.IDBKeyRange = IDBKeyRange
import { initializeApp, deleteApp } from 'firebase/app'
import { getDatabase, connectDatabaseEmulator, goOffline, goOnline, ref, get } from 'firebase/database'

await fetch('http://127.0.0.1:9411/.settings/rules.json?ns=demo-notes', { method: 'PUT', headers: { Authorization: 'Bearer owner' }, body: JSON.stringify({ rules: { '.read': true, '.write': true } }) })
globalThis.indexedDB = new IDBFactory()
const { NoteSync } = await import('../src/lib/notes/sync.js')

const sleep = ms => new Promise(r => setTimeout(r, ms))
const NOTE = 'n' + Date.now()
let n = 0
function device(idb) {
  const app = initializeApp({ projectId: 'demo-notes', databaseURL: 'http://127.0.0.1:9411?ns=demo-notes' }, 'dev' + n++)
  const db = getDatabase(app)
  connectDatabaseEmulator(db, '127.0.0.1', 9411)
  globalThis.indexedDB = idb
  const sync = new NoteSync(db, NOTE)
  return { app, db, sync, idb }
}
async function until(cond, label, ms = 4000) {
  const t0 = Date.now()
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error('timeout: ' + label)
    await sleep(20)
  }
  return Date.now() - t0
}
const ok = (c, m) => { if (!c) throw new Error('FAIL ' + m); console.log('ok -', m) }

const A = device(new IDBFactory())
const B = device(new IDBFactory())
await A.sync.ready; await B.sync.ready
await until(() => A.sync.listening && B.sync.listening, 'listening')

A.sync.text.insert(0, 'Hello')
const lat = await until(() => B.sync.text.toString() === 'Hello', 'A->B')
ok(true, `A->B propagation in ${lat} ms`)

A.sync.text.insert(0, 'X')
B.sync.text.insert(B.sync.text.length, 'Y')
await until(() => A.sync.text.toString() === B.sync.text.toString() && A.sync.text.toString().length === 7, 'concurrent')
ok(A.sync.text.toString().startsWith('X') && A.sync.text.toString().endsWith('Y'), `concurrent edits merged: ${A.sync.text.toString()}`)

goOffline(B.db)
await sleep(100)
B.sync.text.insert(0, '[offB]')
A.sync.text.insert(A.sync.text.length, '[onA]')
await sleep(300)
goOnline(B.db)
await until(() => A.sync.text.toString() === B.sync.text.toString() && A.sync.text.toString().includes('[offB]') && A.sync.text.toString().includes('[onA]'), 'offline merge', 8000)
ok(true, `offline edits merged: ${A.sync.text.toString()}`)

goOffline(B.db)
await sleep(100)
B.sync.text.insert(0, '[lost-queue]')
await sleep(100)
B.sync.destroy()
await sleep(200)
await deleteApp(B.app)
const C = device(B.idb)
await C.sync.ready
ok(C.sync.text.toString().includes('[lost-queue]'), 'edit kept in IndexedDB after app kill')
await until(() => A.sync.text.toString().includes('[lost-queue]'), 'reconcile pushes offline edit', 8000)
ok(true, 'reconcile pushed the unsent edit to other device')

for (let i = 0; i < 300; i++) { A.sync.text.insert(A.sync.text.length, String(i % 10)); A.sync.flush() }
await until(() => C.sync.text.toString() === A.sync.text.toString(), 'bulk sync', 15000)
const D = device(new IDBFactory())
await D.sync.ready
await until(() => D.sync.text.toString() === A.sync.text.toString(), 'fresh device load', 10000)
await sleep(1500)
const after = (await get(ref(A.db, `notes/ydoc/${NOTE}`))).val()
ok(after.snap && Object.keys(after.log || {}).length < 50, `compacted: snapshot + ${Object.keys(after.log || {}).length} log entries`)
const E = device(new IDBFactory())
await E.sync.ready
await until(() => E.sync.text.toString() === A.sync.text.toString(), 'load from snapshot', 10000)
ok(true, `device loaded from snapshot (${E.sync.text.length} chars)`)
A.sync.text.insert(0, 'Z')
await until(() => E.sync.text.toString().startsWith('Z') && D.sync.text.toString().startsWith('Z') && C.sync.text.toString().startsWith('Z'), 'post-compaction live')
ok(true, 'live sync after compaction')
const times = []
for (let i = 0; i < 30; i++) { const t0 = performance.now(); const tag = 'k' + i; A.sync.text.insert(0, tag); await until(() => E.sync.text.toString().startsWith(tag), 'lat'); times.push(performance.now() - t0) }
times.sort((a, b) => a - b)
console.log('latency A->E ms: median', times[15].toFixed(0), 'p90', times[27].toFixed(0))
console.log('ALL PASSED')
process.exit(0)
