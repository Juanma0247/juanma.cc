import * as Y from 'yjs'
import { getAuth, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth'
import { getDatabase, ref, onValue } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { FIREBASE_CONFIG, ROOT_ID, isAllowed } from './config.js'
import { t } from './i18n.js'
import { NotesStore } from './store.js'
import { NoteSync } from './sync.js'
import { createEditor, commands } from './editor.js'
import { createRenderer } from './render.js'
import { uploadImage } from './upload.js'
import { icon, GOOGLE } from './icons.js'

export const LS = {
  last: 'jm-notes-last',
  mode: 'jm-notes-mode',
  open: 'jm-notes-open-groups',
  side: 'jm-notes-side',
  user: 'jm-notes-user',
  peek: 'jm-notes-peek',
  view: 'jm-notes-view',
  folder: 'jm-notes-folder',
  sort: 'jm-notes-sort',
  scroll: 'jm-notes-scroll',
}

const LIST_RE = /^(\s*)([-*+]\s(\[[ xX]\]\s)?|\d+[.)]\s)/
const TOOLS = [
  ['heading', v => commands.heading(v)],
  ['bold', v => commands.wrap(v, '**')],
  ['italic', v => commands.wrap(v, '*')],
  ['task', v => commands.prefix(v, '- [ ] ', LIST_RE)],
  ['list', v => commands.prefix(v, '- ', LIST_RE)],
  ['olist', v => commands.prefix(v, '1. ', LIST_RE)],
  ['math', v => commands.wrap(v, '$', '$', 'x')],
  ['mathBlock', v => commands.insert(v, '\n$$\n\n$$\n', 4)],
  ['image', null],
  ['camera', null],
  ['link', v => commands.link(v)],
  ['noteLink', v => commands.wrap(v, '[[', ']]')],
  ['strike', v => commands.wrap(v, '~~')],
  ['code', v => commands.wrap(v, '`')],
  ['codeBlock', v => commands.insert(v, '\n```\n\n```\n', 5)],
  ['quote', v => commands.prefix(v, '> ', /^>\s/)],
  ['table', v => commands.insert(v, '\n| A | B |\n| --- | --- |\n|  |  |\n', 3)],
  ['undo', null],
  ['redo', null],
]
const STATUS_KEY = { synced: 'statusSynced', saving: 'statusSaving', offline: 'statusOffline', loading: 'statusLoading', error: 'statusError' }

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)) } catch {}
}
function dropLS(...keys) {
  try { keys.forEach(k => localStorage.removeItem(k)) } catch {}
}

function relTime(ts) {
  if (!ts) return ''
  const diff = (ts - Date.now()) / 1000
  if (Math.abs(diff) < 45) return t('justNow')
  const rtf = new Intl.RelativeTimeFormat(document.documentElement.lang || undefined, { numeric: 'auto' })
  const steps = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day'], [2629800, 'week'], [31557600, 'month'], [Infinity, 'year']]
  let unit = 1
  for (const [limit, name] of steps) {
    if (Math.abs(diff) < limit) return rtf.format(Math.round(diff / unit), name)
    unit = limit
  }
  return ''
}

export function mountNotes(root, opts) {
  const {
    firebaseApp,
    signIn,
    signOut,
    settingsHref = '',
    onHome = null,
    getRoute = () => null,
    setRoute = () => {},
    autoHeight = true,
  } = opts

  const auth = getAuth(firebaseApp)
  const db = getDatabase(firebaseApp, FIREBASE_CONFIG.databaseURL)
  const storage = getStorage(firebaseApp)
  const phone = window.matchMedia('(max-width: 47.99rem)')

  let resolveAuth
  const newGate = () => new Promise(r => { resolveAuth = r })

  const storedMode = localStorage.getItem(LS.mode)
  const state = {
    user: null,
    authed: false,
    gate: newGate(),
    online: false,
    store: null,
    session: null,
    query: '',
    mode: storedMode === 'read' ? 'read' : 'edit',
    open: new Set(readJSON(LS.open, [])),
    folder: localStorage.getItem(LS.folder) || ROOT_ID,
    sort: localStorage.getItem(LS.sort) === 'recent' ? 'recent' : 'name',
    sideHidden: localStorage.getItem(LS.side) === '1',
    peek: readJSON(LS.peek, null),
    scrolls: readJSON(LS.scroll, {}),
  }

  root.classList.add('nt', 'no-katex')
  root.innerHTML = `
    <div class="nt-gate" hidden>
      <div class="nt-gate__card">
        <span class="nt-gate__icon">${icon('note')}</span>
        <h2 data-t="gateTitle"></h2>
        <p data-t="gateDesc"></p>
        <p class="nt-gate__error" data-gate-error hidden data-t="unauthorized"></p>
        <p class="nt-gate__loading" data-gate-loading data-t="loading"></p>
        <button class="nt-btn nt-btn--light" data-act="signin" hidden>${GOOGLE}<span data-t="signIn"></span></button>
        <button class="nt-btn" data-act="signout" data-gate-signout hidden><span data-t="signOut"></span></button>
        ${settingsHref ? `<a class="nt-btn nt-btn--ghost" href="${settingsHref}">${icon('sliders')}<span data-t="webSettings"></span></a>` : ''}
      </div>
    </div>
    <div class="nt-shell" hidden>
      <aside class="nt-side">
        <div class="nt-side__head">
          <div class="nt-side__row">
            <h2 class="nt-side__title nt-status-text" data-t="title"></h2>
            <button class="nt-icon" data-act="new-note" data-t-title="newNote">${icon('noteAdd')}</button>
            <button class="nt-icon" data-act="new-group" data-t-title="newGroup">${icon('folderAdd')}</button>
          </div>
          <label class="nt-search">${icon('search')}<input type="search" data-search data-t-placeholder="search" autocomplete="off" enterkeyhint="search"><button type="button" class="nt-search__clear" data-act="clear-search" hidden>${icon('x')}</button></label>
        </div>
        <nav class="nt-tree" data-tree data-drop="${ROOT_ID}"></nav>
        <div class="nt-home nt-home--side" data-home-side></div>
        <div class="nt-side__foot">
          <img class="nt-avatar" data-avatar alt="" referrerpolicy="no-referrer">
          <span class="nt-user" data-user></span>
          ${settingsHref ? `<a class="nt-icon" href="${settingsHref}" data-t-title="webSettings">${icon('sliders')}</a>` : ''}
          ${onHome ? `<button class="nt-icon" data-act="home" data-t-title="apps">${icon('home')}</button>` : ''}
          <button class="nt-icon" data-act="signout" data-t-title="signOut">${icon('logout')}</button>
        </div>
      </aside>
      <section class="nt-main">
        <header class="nt-bar">
          <button class="nt-icon nt-bar__back" data-act="back" data-t-title="back">${icon('chevronLeft')}</button>
          <button class="nt-icon nt-bar__side" data-act="toggle-side">${icon('sidebar')}</button>
          <div class="nt-crumbs" data-crumbs></div>
          <div class="nt-modes" role="tablist" data-modes>
            <button role="tab" data-mode="edit">${icon('code')}<span data-t="modeCode"></span></button>
            <button role="tab" data-mode="read">${icon('eye')}<span data-t="modeRead"></span></button>
          </div>
          <button class="nt-icon" data-act="note-menu" data-t-title="noteOptions">${icon('more')}</button>
        </header>
        <div class="nt-scroll" data-scroll>
          <div class="nt-doc" data-doc hidden>
            <input class="nt-title nt-status-text" data-title data-t-placeholder="titlePlaceholder" autocomplete="off" spellcheck="true">
            <div class="nt-meta" data-meta></div>
            <div class="nt-editor" data-editor></div>
            <article class="nt-read" data-read hidden></article>
            <section class="nt-backlinks" data-backlinks hidden></section>
          </div>
          <div class="nt-home nt-home--main" data-home-main></div>
        </div>
        <div class="nt-toolbar" data-toolbar hidden></div>
        <input type="file" accept="image/*" multiple hidden data-file>
        <input type="file" accept="image/*" capture="environment" hidden data-camera>
      </section>
    </div>
    <div class="nt-menu" data-menu hidden></div>
    <dialog class="nt-dialog" data-dialog></dialog>
    <div class="nt-toast" data-toast hidden></div>
    <span class="nt-sr" aria-live="polite" data-status-live></span>
  `

  const $ = sel => root.querySelector(sel)
  const els = {
    gate: $('.nt-gate'),
    shell: $('.nt-shell'),
    tree: $('[data-tree]'),
    homeSide: $('[data-home-side]'),
    homeMain: $('[data-home-main]'),
    search: $('[data-search]'),
    crumbs: $('[data-crumbs]'),
    doc: $('[data-doc]'),
    title: $('[data-title]'),
    meta: $('[data-meta]'),
    editor: $('[data-editor]'),
    read: $('[data-read]'),
    backlinks: $('[data-backlinks]'),
    toolbar: $('[data-toolbar]'),
    file: $('[data-file]'),
    camera: $('[data-camera]'),
    menu: $('[data-menu]'),
    dialog: $('[data-dialog]'),
    toast: $('[data-toast]'),
    scroll: $('[data-scroll]'),
    live: $('[data-status-live]'),
  }

  const resolveNote = name => state.store?.findByTitle(name) ?? null
  const render = createRenderer({ resolveNote })

  function applyLabels() {
    root.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t) })
    root.querySelectorAll('[data-t-placeholder]').forEach(el => { el.placeholder = t(el.dataset.tPlaceholder) })
    root.querySelectorAll('[data-t-title]').forEach(el => { el.title = t(el.dataset.tTitle); el.setAttribute('aria-label', el.title) })
    renderAll()
    renderToolbar()
  }

  function toast(msg, ms = 3200) {
    els.toast.textContent = msg
    els.toast.hidden = false
    clearTimeout(toast.timer)
    toast.timer = setTimeout(() => { els.toast.hidden = true }, ms)
  }

  // ---------- dialogs ----------
  function dialog(html, hooks) {
    return new Promise(resolve => {
      const d = els.dialog
      d.innerHTML = `<form method="dialog" class="nt-dialog__form">${html}</form>`
      const form = d.querySelector('form')
      const done = val => { d.close(); resolve(val) }
      form.addEventListener('submit', e => { e.preventDefault(); done(hooks.submit()) })
      form.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', () => done(null)))
      d.addEventListener('cancel', () => resolve(null), { once: true })
      d.showModal()
      hooks.init?.(form)
    })
  }

  const actions = (okLabel, okClass = 'nt-btn--primary') => `<div class="nt-dialog__actions"><button type="button" class="nt-btn" data-cancel>${esc(t('cancel'))}</button><button class="nt-btn ${okClass}">${esc(okLabel)}</button></div>`

  function askText(label, value = '') {
    let input
    return dialog(`<label class="nt-dialog__label">${esc(label)}<input class="nt-input" value="${esc(value)}" required></label>${actions(t('save'))}`, {
      init: f => { input = f.querySelector('input'); input.focus(); input.select() },
      submit: () => input.value.trim() || null,
    })
  }

  function askConfirm(msg) {
    return dialog(`<p class="nt-dialog__msg">${esc(msg)}</p>${actions(t('ok'), 'nt-btn--danger')}`, {
      init: f => f.querySelector('.nt-btn--danger').focus(),
      submit: () => true,
    })
  }

  function askGroup(id) {
    const store = state.store
    const banned = new Set([id, ...store.descendants(id).map(d => d.id)])
    const groups = store.groups().filter(g => !banned.has(g.id))
    let select
    return dialog(`
      <label class="nt-dialog__label">${esc(t('move'))}
        <select class="nt-input">
          <option value="${ROOT_ID}">${esc(t('root'))}</option>
          ${groups.map(g => `<option value="${g.id}">${'  '.repeat(g.depth + 1)}${esc(g.title || t('untitledGroup'))}</option>`).join('')}
        </select>
      </label>${actions(t('save'))}`, {
      init: f => { select = f.querySelector('select'); select.value = store.get(id)?.parent || ROOT_ID },
      submit: () => select.value,
    })
  }

  function showHelp() {
    const rows = [['touch', 'helpTwoFinger'], ['keyboard', 'helpShortcut'], ['noteLink', 'helpLinks'], ['camera', 'helpImages'], ['more', 'helpLongPress'], ['flame', 'helpToolbar'], ['help', 'helpStatus']]
    dialog(`
      <h3 class="nt-dialog__title">${icon('help')}${esc(t('helpTitle'))}</h3>
      <ul class="nt-help">${rows.map(([ic, key]) => `<li>${icon(ic)}<span>${esc(t(key))}</span></li>`).join('')}</ul>
      <div class="nt-dialog__actions"><button class="nt-btn nt-btn--primary">${esc(t('close'))}</button></div>`, { submit: () => true })
  }

  // ---------- context menu ----------
  function openMenu(anchor, id, { note = false } = {}) {
    const item = state.store?.get(id)
    if (!item) return
    const entries = []
    if (item.kind === 'group') entries.push(['new-note-in', 'noteAdd', 'newNoteHere'], ['new-group-in', 'folderAdd', 'newSubgroup'])
    entries.push(item.pinned ? ['pin', 'pinOff', 'unpin'] : ['pin', 'pin', 'pin'])
    entries.push(['rename', 'edit', 'rename'], ['move', 'folderMove', 'move'])
    if (note) entries.push(['help', 'help', 'help'])
    entries.push(['delete', 'trash', 'delete'])
    els.menu.innerHTML = entries.map(([act, ic, key]) => `<button data-menu-act="${act}" data-id="${id}" class="${act === 'delete' ? 'is-danger' : ''}">${icon(ic)}<span>${esc(t(key))}</span></button>`).join('')
    els.menu.hidden = false
    const r = anchor.getBoundingClientRect()
    const host = root.getBoundingClientRect()
    const mw = els.menu.offsetWidth
    const mh = els.menu.offsetHeight
    els.menu.style.left = `${Math.max(4, Math.min(r.right - host.left - mw, host.width - mw - 4))}px`
    const below = r.bottom - host.top + 4
    els.menu.style.top = `${below + mh > host.height - 4 ? Math.max(4, r.top - host.top - mh - 4) : below}px`
  }
  const closeMenu = () => { els.menu.hidden = true }

  async function menuAction(act, id) {
    closeMenu()
    const store = state.store
    const item = store.get(id)
    if (!item) return
    if (act === 'new-note-in') return newNote(id)
    if (act === 'new-group-in') return newGroup(id)
    if (act === 'pin') return store.togglePin(id)
    if (act === 'help') return showHelp()
    if (act === 'rename') {
      if (state.session?.id === id && root.dataset.view === 'note') { els.title.focus(); els.title.select(); return }
      const name = await askText(item.kind === 'group' ? t('groupName') : t('titlePlaceholder'), item.title)
      if (name) store.rename(id, name)
      return
    }
    if (act === 'move') {
      const target = await askGroup(id)
      if (target) { store.move(id, target); state.open.add(target); saveOpen() }
      return
    }
    if (act === 'delete') {
      const name = item.title || (item.kind === 'group' ? t('untitledGroup') : t('untitled'))
      const msg = item.kind === 'group'
        ? t('confirmDeleteGroup', { name, count: store.descendants(id).length })
        : t('confirmDeleteNote', { name })
      if (!(await askConfirm(msg))) return
      const closing = state.session && (state.session.id === id || store.descendants(id).some(d => d.id === state.session.id))
      if (closing) { closeNote(); setView('list') }
      if (state.folder === id || store.descendants(id).some(d => d.id === state.folder)) setFolder(item.parent || ROOT_ID)
      await store.remove(id)
    }
  }

  // ---------- labels ----------
  const saveOpen = () => writeLS(LS.open, [...state.open])

  function noteLabel(n) {
    if (n.title) return n.title
    const first = (n.excerpt || '').replace(/^[#>\-*\s[\]x]+/, '').slice(0, 60)
    return first || t('untitled')
  }

  function countLabel(id) {
    const kids = state.store.children(id)
    const g = kids.filter(k => k.kind === 'group').length
    const n = kids.length - g
    const parts = []
    if (g) parts.push(g === 1 ? t('folderCount') : t('foldersCount', { n: g }))
    if (n) parts.push(n === 1 ? t('noteCount') : t('notesCount', { n }))
    return parts.join(' · ') || t('emptyGroup')
  }

  // ---------- desktop tree ----------
  function rowHtml(item, depth) {
    const active = state.session?.id === item.id ? ' is-active' : ''
    if (item.kind === 'group') {
      const open = state.open.has(item.id)
      const count = state.store.children(item.id).length
      return `<div class="nt-row nt-row--group${open ? ' is-open' : ''}${active}" data-id="${item.id}" data-kind="group" data-drop="${item.id}" draggable="true" style="--depth:${depth}" role="treeitem" aria-expanded="${open}">
        <span class="nt-row__caret">${icon('chevronRight')}</span>${icon('folder', 'nt-row__icon')}
        <span class="nt-row__title">${esc(item.title || t('untitledGroup'))}</span>
        <span class="nt-row__count">${count || ''}</span>
        <button class="nt-row__btn" data-row-act="add" title="${esc(t('newNoteHere'))}">${icon('plus')}</button>
        <button class="nt-row__btn" data-row-act="menu" title="${esc(t('noteOptions'))}">${icon('more')}</button>
      </div>`
    }
    return `<div class="nt-row nt-row--note${active}" data-id="${item.id}" data-kind="note" draggable="true" style="--depth:${depth}" role="treeitem">
      ${icon('note', 'nt-row__icon')}
      <span class="nt-row__title">${esc(noteLabel(item))}</span>
      ${item.pinned ? icon('pin', 'nt-row__pin') : ''}
      <button class="nt-row__btn" data-row-act="menu" title="${esc(t('noteOptions'))}">${icon('more')}</button>
    </div>`
  }

  function treeLevel(parent, depth) {
    let html = ''
    for (const item of state.store.children(parent)) {
      html += rowHtml(item, depth)
      if (item.kind === 'group' && state.open.has(item.id)) {
        html += treeLevel(item.id, depth + 1) || `<div class="nt-row nt-row--empty" style="--depth:${depth + 1}">${esc(t('emptyGroup'))}</div>`
      }
    }
    return html
  }

  function searchHtml(q) {
    const store = state.store
    const needle = q.toLowerCase()
    const hits = store.notes().filter(n => {
      const body = store.texts?.[n.id] ?? n.excerpt ?? ''
      return (n.title || '').toLowerCase().includes(needle) || String(body).toLowerCase().includes(needle)
    }).sort((a, b) => (b.updated || 0) - (a.updated || 0))
    if (!hits.length) return `<p class="nt-home__empty">${esc(t('noResults'))}</p>`
    return `<div class="nt-hits">${hits.map(n => {
      const path = store.path(n.id).map(g => g.title).join(' / ')
      const body = String(store.texts?.[n.id] ?? n.excerpt ?? '')
      const i = body.toLowerCase().indexOf(needle)
      const snippet = i >= 0 ? body.slice(Math.max(0, i - 30), i + 80).replace(/\s+/g, ' ') : ''
      return `<div class="nt-row nt-row--hit${state.session?.id === n.id ? ' is-active' : ''}" data-open="${n.id}" role="button" tabindex="0">
        ${icon('note', 'nt-row__icon')}
        <span class="nt-row__stack"><span class="nt-row__title">${esc(noteLabel(n))}</span>${path ? `<span class="nt-row__path">${esc(path)}</span>` : ''}${snippet ? `<span class="nt-row__snippet">${esc(snippet)}</span>` : ''}</span>
      </div>`
    }).join('')}</div>`
  }

  // ---------- home (cards) ----------
  function noteCard(n, extra = '') {
    return `<div class="nt-card nt-card--note${extra}" data-open="${n.id}" data-id="${n.id}" role="button" tabindex="0">
      <span class="nt-card__head">${icon('note', 'nt-card__icon')}<span class="nt-card__title">${esc(noteLabel(n))}</span>${n.pinned ? icon('pin', 'nt-card__pin') : ''}</span>
      ${n.excerpt ? `<span class="nt-card__excerpt">${esc(n.excerpt)}</span>` : ''}
      <span class="nt-card__meta">${esc(relTime(n.updated))}</span>
      <button class="nt-card__more" data-row-act="menu" aria-label="${esc(t('noteOptions'))}">${icon('more')}</button>
    </div>`
  }

  function folderCard(g) {
    const kids = state.store.children(g.id).slice(0, 3)
    return `<div class="nt-card nt-card--folder" data-folder="${g.id}" data-id="${g.id}" role="button" tabindex="0">
      <span class="nt-card__head">${icon('folder', 'nt-card__icon')}<span class="nt-card__title">${esc(g.title || t('untitledGroup'))}</span>${g.pinned ? icon('pin', 'nt-card__pin') : ''}</span>
      <span class="nt-card__kids">${kids.map(k => `<span>${icon(k.kind === 'group' ? 'folder' : 'note')}${esc(k.kind === 'group' ? (k.title || t('untitledGroup')) : noteLabel(k))}</span>`).join('')}</span>
      <span class="nt-card__meta">${esc(countLabel(g.id))}</span>
      <button class="nt-card__more" data-row-act="menu" aria-label="${esc(t('noteOptions'))}">${icon('more')}</button>
    </div>`
  }

  const section = (ic, title, body, tools = '') => `<section class="nt-sec"><h3 class="nt-sec__title">${icon(ic)}<span>${esc(title)}</span>${tools}</h3>${body}</section>`

  function homeHtml() {
    const store = state.store
    const q = state.query.trim()
    if (q) return searchHtml(q)
    const folder = store.get(state.folder)?.kind === 'group' ? state.folder : ROOT_ID
    let html = ''
    if (folder !== ROOT_ID) {
      const path = store.path(folder)
      const g = store.get(folder)
      html += `<div class="nt-where">
        <button class="nt-icon" data-folder="${g.parent || ROOT_ID}" aria-label="${esc(t('back'))}">${icon('chevronLeft')}</button>
        <div class="nt-where__text">
          <span class="nt-where__path"><button data-folder="${ROOT_ID}">${esc(t('title'))}</button>${path.map(p => `<span>/</span><button data-folder="${p.id}">${esc(p.title || t('untitledGroup'))}</button>`).join('')}</span>
          <span class="nt-where__title">${esc(g.title || t('untitledGroup'))}</span>
        </div>
        <button class="nt-icon" data-row-act="menu" data-id="${folder}" aria-label="${esc(t('noteOptions'))}">${icon('more')}</button>
      </div>`
    } else {
      const last = store.lastOpened()
      if (last) {
        const path = store.path(last.id).map(p => p.title).join(' / ')
        html += section('clock', t('continue'), `<div class="nt-card nt-card--hero" data-open="${last.id}" data-id="${last.id}" role="button" tabindex="0">
          <span class="nt-card__head">${icon('note', 'nt-card__icon')}<span class="nt-card__title">${esc(noteLabel(last))}</span></span>
          ${path ? `<span class="nt-card__path">${icon('folder')}${esc(path)}</span>` : ''}
          ${last.excerpt ? `<span class="nt-card__excerpt">${esc(last.excerpt)}</span>` : ''}
          <span class="nt-card__meta">${esc(t('openedWhen', { when: relTime(last.last) }))}</span>
        </div>`)
      }
      const freq = store.frequent(10).filter(x => !last || x.id !== last.id)
      if (freq.length) {
        html += section('flame', t('frequent'), `<div class="nt-chips">${freq.map(x => `<button class="nt-chip" ${x.kind === 'group' ? `data-folder="${x.id}"` : `data-open="${x.id}"`} data-id="${x.id}">${icon(x.kind === 'group' ? 'folder' : 'note')}<span>${esc(x.kind === 'group' ? (x.title || t('untitledGroup')) : noteLabel(x))}</span></button>`).join('')}</div>`)
      }
      const pins = store.pinned()
      if (pins.length) html += section('pin', t('pinned'), `<div class="nt-grid">${pins.map(p => p.kind === 'group' ? folderCard(p) : noteCard(p)).join('')}</div>`)
    }
    const kids = store.children(folder)
    const groups = kids.filter(k => k.kind === 'group')
    let notes = kids.filter(k => k.kind === 'note')
    if (state.sort === 'recent') notes = notes.sort((a, b) => (b.updated || 0) - (a.updated || 0))
    if (groups.length) html += section('folder', t('folders'), `<div class="nt-grid">${groups.map(folderCard).join('')}</div>`)
    const sortBtn = `<button class="nt-sec__tool" data-act="sort">${icon('sort')}<span>${esc(state.sort === 'recent' ? t('sortRecent') : t('sortName'))}</span></button>`
    const body = notes.length
      ? `<div class="nt-grid">${notes.map(n => noteCard(n)).join('')}</div>`
      : `<p class="nt-home__empty">${esc(groups.length ? t('emptyGroup') : (folder === ROOT_ID && !kids.length ? t('empty') : t('emptyGroup')))}</p>`
    if (notes.length || !groups.length) html += section('note', t('notes'), body, notes.length > 1 ? sortBtn : '')
    return html
  }

  let frame = 0
  function renderNow() {
    cancelAnimationFrame(frame)
    frame = 0
    if (!state.store) return
    if (phone.matches) {
      els.homeSide.innerHTML = homeHtml()
    } else {
      const q = state.query.trim()
      els.tree.innerHTML = q ? searchHtml(q) : (treeLevel(ROOT_ID, 0) || `<p class="nt-home__empty">${esc(t('empty'))}</p>`)
      if (!state.session) els.homeMain.innerHTML = homeHtml()
    }
    renderHeader()
    renderBacklinks()
  }

  function renderAll() {
    if (!state.store || frame) return
    frame = requestAnimationFrame(renderNow)
  }

  function setFolder(id, { touch = true } = {}) {
    state.folder = id || ROOT_ID
    writeLS(LS.folder, state.folder)
    if (touch && state.folder !== ROOT_ID) state.store.touch(state.folder)
    state.query = ''
    els.search.value = ''
    syncSearchClear()
    if (!phone.matches && state.session) closeNote()
    renderAll()
    const host = phone.matches ? els.homeSide : els.scroll
    host.scrollTop = 0
  }

  // ---------- header / status ----------
  function currentStatus() {
    if (state.session && root.dataset.view === 'note') return state.session.status
    if (!state.authed) return 'loading'
    return state.online ? 'synced' : 'offline'
  }

  function renderStatus() {
    const st = currentStatus()
    if (root.dataset.status === st) return
    root.dataset.status = st
    const label = t(STATUS_KEY[st])
    root.querySelectorAll('.nt-status-text').forEach(el => { el.title = label })
    els.live.textContent = label
  }

  function renderHeader() {
    const s = state.session
    const item = s ? state.store?.get(s.id) : null
    if (item) {
      const path = state.store.path(s.id)
      els.crumbs.innerHTML = path.map(g => `<button class="nt-crumbs__group" data-crumb="${g.id}">${esc(g.title || t('untitledGroup'))}</button><span class="nt-crumbs__sep">/</span>`).join('') +
        `<span class="nt-crumbs__title nt-status-text">${esc(noteLabel(item))}</span>`
      if (document.activeElement !== els.title && els.title.value !== (item.title || '')) els.title.value = item.title || ''
      const parts = []
      if (item.words) parts.push(t('words', { n: item.words }))
      if (item.updated) parts.push(t('edited', { when: relTime(item.updated) }))
      els.meta.textContent = parts.join(' · ')
    } else {
      els.crumbs.innerHTML = `<span class="nt-crumbs__title nt-status-text">${esc(t('title'))}</span>`
    }
    root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === state.mode)))
    root.dataset.status = ''
    renderStatus()
  }

  let backlinksKey = ''
  function renderBacklinks() {
    const s = state.session
    if (!s || !state.store) { els.backlinks.hidden = true; return }
    const links = state.store.backlinks(s.id)
    const key = s.id + ':' + links.map(l => l.id + l.title).join('|')
    if (key === backlinksKey) return
    backlinksKey = key
    els.backlinks.hidden = !links.length
    els.backlinks.innerHTML = links.length
      ? `<h4>${icon('link')}<span>${esc(t('backlinks'))}</span></h4><div class="nt-chips">${links.map(l => `<button class="nt-chip" data-open="${l.id}">${icon('note')}<span>${esc(noteLabel(l))}</span></button>`).join('')}</div>`
      : ''
  }

  // ---------- toolbar ----------
  function renderToolbar() {
    const store = state.store
    const order = TOOLS.map(([key], i) => ({ key, i, score: store ? store.toolScore(key) : 0 }))
      .sort((a, b) => (b.score - a.score) || (a.i - b.i))
    els.toolbar.innerHTML = order.map(({ key }) => `<button type="button" data-tool="${key}" title="${esc(t('tb.' + key))}" aria-label="${esc(t('tb.' + key))}">${icon(key)}</button>`).join('')
    els.toolbar.scrollLeft = 0
  }

  function runTool(key) {
    const s = state.session
    if (!s?.editor) return
    state.store.useTool(key)
    const view = s.editor.view
    if (key === 'image') return els.file.click()
    if (key === 'camera') return els.camera.click()
    if (key === 'undo') { s.undo.undo(); return }
    if (key === 'redo') { s.undo.redo(); return }
    TOOLS.find(([k]) => k === key)?.[1]?.(view)
  }

  // ---------- notes ----------
  function targetFolder() {
    if (root.dataset.view === 'note' && state.session) return state.store.get(state.session.id)?.parent || ROOT_ID
    return state.store.get(state.folder) ? state.folder : ROOT_ID
  }

  function newNote(parent) {
    const target = parent ?? targetFolder()
    const id = state.store.create('note', state.store.get(target) ? target : ROOT_ID, '')
    if (target !== ROOT_ID) { state.open.add(target); saveOpen() }
    state.query = ''
    els.search.value = ''
    syncSearchClear()
    openNote(id, { focusTitle: true })
  }

  async function newGroup(parent) {
    const where = parent ?? targetFolder()
    const name = await askText(t('groupName'), t('untitledGroup'))
    if (!name) return
    const id = state.store.create('group', where, name)
    if (where !== ROOT_ID) state.open.add(where)
    state.open.add(id)
    saveOpen()
    renderAll()
  }

  function setView(view) {
    root.dataset.view = view
    writeLS(LS.view, view)
    renderStatus()
  }

  let metaTimer = 0
  function scheduleMeta() {
    clearTimeout(metaTimer)
    const s = state.session
    metaTimer = setTimeout(() => {
      metaTimer = 0
      if (s && !s.closed && s.dirty) { s.dirty = false; state.store.saveMeta(s.id, s.sync.text.toString()) }
    }, 1200)
  }

  function flushMeta() {
    clearTimeout(metaTimer)
    metaTimer = 0
    const s = state.session
    if (s && s.dirty) { s.dirty = false; state.store.saveMeta(s.id, s.sync.text.toString()) }
  }

  function rememberScroll() {
    const s = state.session
    if (!s || !s.ready) return
    state.scrolls[s.id] = Math.round(els.scroll.scrollTop)
    const keys = Object.keys(state.scrolls)
    if (keys.length > 60) delete state.scrolls[keys[0]]
    writeLS(LS.scroll, state.scrolls)
  }

  function closeNote() {
    const s = state.session
    if (!s) return
    rememberScroll()
    flushMeta()
    s.closed = true
    s.text.unobserve(s.onText)
    s.editor?.destroy()
    s.undo.destroy()
    if (s.uploads === 0) s.sync.destroy()
    state.session = null
    backlinksKey = ''
    els.doc.hidden = true
    els.toolbar.hidden = true
    els.homeMain.hidden = false
    renderAll()
  }

  async function openNote(id, { focusTitle = false, push = true, restore = false } = {}) {
    const store = state.store
    if (!store.get(id)) { toast(t('noteDeleted')); return }
    if (state.session?.id === id) {
      setView('note')
      if (push) setRoute(id)
      return
    }
    closeNote()
    const sync = new NoteSync(db, id, {
      gate: state.gate,
      onStatus: st => { if (state.session?.sync === sync) { state.session.status = st; renderStatus() } },
      onLocalChange: () => { if (state.session?.sync === sync) { state.session.dirty = true; scheduleMeta() } },
    })
    const s = { id, sync, text: sync.text, status: 'loading', uploads: 0, closed: false, dirty: false, editor: null, ready: false }
    s.undo = new Y.UndoManager(sync.text, { captureTimeout: 600 })
    s.onText = () => { if (state.mode === 'read') scheduleRead() }
    sync.text.observe(s.onText)
    state.session = s
    if (!restore) store.touch(id)
    writeLS(LS.last, id)
    if (push) setRoute(id)
    for (const g of store.path(id)) state.open.add(g.id)
    saveOpen()
    els.homeMain.hidden = true
    els.doc.hidden = false
    els.title.value = store.get(id).title || ''
    const reading = state.mode === 'read'
    els.editor.hidden = reading
    els.read.hidden = !reading
    els.toolbar.hidden = reading
    const peek = state.peek
    if (peek && peek.id === id && peek.docHtml && peek.mode === state.mode) {
      ;(reading ? els.read : els.editor).innerHTML = peek.docHtml
    } else {
      els.editor.innerHTML = ''
      els.read.innerHTML = ''
    }
    state.peek = null
    setView('note')
    renderToolbar()
    renderNow()
    if (restore && state.scrolls[id]) els.scroll.scrollTop = state.scrolls[id]
    else els.scroll.scrollTop = 0
    await sync.ready
    if (state.session !== s) return
    els.editor.innerHTML = ''
    s.editor = createEditor({
      parent: els.editor,
      ytext: sync.text,
      undoManager: s.undo,
      ctx: {
        resolveNote,
        openNote: name => openByName(name),
        listNotes: () => store.notes().filter(n => n.title && n.id !== id).map(n => ({ title: n.title, group: store.path(n.id).map(g => g.title).join(' / ') })),
        insertImages: (view, files, pos) => insertImages(s, view, files, pos),
      },
    })
    if (reading) renderRead()
    s.ready = true
    const top = restore ? state.scrolls[id] : 0
    if (top) requestAnimationFrame(() => requestAnimationFrame(() => { els.scroll.scrollTop = top }))
    if (focusTitle) els.title.focus()
  }

  async function openByName(name) {
    const id = resolveNote(name)
    if (id) return openNote(id)
    if (!(await askConfirm(t('noteMissing', { name })))) return
    openNote(state.store.create('note', targetFolder(), name))
  }

  function setMode(mode) {
    const s = state.session
    const scrollable = els.scroll.scrollHeight - els.scroll.clientHeight
    const ratio = scrollable > 0 ? els.scroll.scrollTop / scrollable : 0
    state.mode = mode
    writeLS(LS.mode, mode)
    root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === mode)))
    if (!s) return
    const reading = mode === 'read'
    if (reading) document.activeElement?.blur?.()
    els.editor.hidden = reading
    els.read.hidden = !reading
    els.toolbar.hidden = reading
    if (reading) renderRead()
    else s.editor?.refresh()
    requestAnimationFrame(() => {
      const next = els.scroll.scrollHeight - els.scroll.clientHeight
      els.scroll.scrollTop = Math.round(ratio * next)
    })
  }

  function toggleMode() {
    if (!state.session) return
    setMode(state.mode === 'read' ? 'edit' : 'read')
    toast(state.mode === 'read' ? t('modeRead') : t('modeCode'), 900)
  }

  let readTimer = 0
  function scheduleRead() {
    clearTimeout(readTimer)
    readTimer = setTimeout(renderRead, 120)
  }

  function renderRead() {
    const s = state.session
    if (!s) return
    els.read.innerHTML = render(s.text.toString())
  }

  function toggleTask(line) {
    const s = state.session
    if (!s) return
    const text = s.text.toString()
    let pos = 0
    for (let i = 0; i < line; i++) {
      pos = text.indexOf('\n', pos) + 1
      if (pos === 0) return
    }
    const end = text.indexOf('\n', pos)
    const lineText = text.slice(pos, end === -1 ? text.length : end)
    const m = /^(\s*(?:[-*+]|\d+[.)])\s\[)([ xX])\]/.exec(lineText)
    if (!m) return
    const at = pos + m[1].length
    s.sync.doc.transact(() => {
      s.text.delete(at, 1)
      s.text.insert(at, m[2] === ' ' ? 'x' : ' ')
    })
  }

  // ---------- images ----------
  function insertImages(s, view, files, pos) {
    let at = pos
    for (const file of files) {
      const tag = Math.random().toString(36).slice(2, 10)
      const line = view.state.doc.lineAt(at)
      const before = at > line.from ? '\n' : ''
      const insert = `${before}![${t('uploading')}](uploading://${tag})\n`
      view.dispatch({ changes: { from: at, insert }, selection: { anchor: at + insert.length }, userEvent: 'input.paste', scrollIntoView: true })
      at += insert.length
      s.uploads++
      uploadImage(storage, s.id, file)
        .then(url => replacePlaceholder(s, tag, `![](${url})`))
        .catch(err => {
          console.warn('[notes] upload', err)
          toast(err?.message === 'too-big' ? t('imageTooBig') : t('uploadFailed'))
          replacePlaceholder(s, tag, '')
        })
        .finally(() => {
          s.uploads--
          if (s.closed && s.uploads === 0) setTimeout(() => s.sync.destroy(), 1500)
        })
    }
  }

  function replacePlaceholder(s, tag, replacement) {
    const text = s.text.toString()
    const m = new RegExp(`!\\[[^\\]\\n]*\\]\\(uploading://${tag}\\)\\n?`).exec(text)
    if (!m) return
    const keepNewline = replacement && m[0].endsWith('\n') ? '\n' : ''
    s.sync.doc.transact(() => {
      s.text.delete(m.index, m[0].length)
      if (replacement) s.text.insert(m.index, replacement + keepNewline)
    })
    if (!s.closed) { s.dirty = true; scheduleMeta() }
  }

  function filesFrom(input) {
    const s = state.session
    const files = [...input.files].filter(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|gif)$/i.test(f.name))
    input.value = ''
    if (s?.editor && files.length) insertImages(s, s.editor.view, files, s.editor.view.state.selection.main.from)
  }
  els.file.addEventListener('change', () => filesFrom(els.file))
  els.camera.addEventListener('change', () => filesFrom(els.camera))

  // ---------- events ----------
  root.addEventListener('click', e => {
    const el = e.target.closest('[data-act], [data-row-act], [data-menu-act], [data-mode], [data-tool], [data-crumb], [data-open], [data-folder], .nt-row[data-id], .nt-wikilink, .nt-task')
    if (!el || !root.contains(el)) { closeMenu(); return }
    if (!el.closest('[data-menu]') && !el.matches('[data-row-act="menu"], [data-act="note-menu"]')) closeMenu()

    if (el.matches('.nt-task')) {
      e.preventDefault()
      const line = Number(el.dataset.line)
      if (Number.isFinite(line)) toggleTask(line)
      return
    }
    if (el.matches('.nt-wikilink')) {
      e.preventDefault()
      if (el.dataset.noteId) openNote(el.dataset.noteId)
      else openByName(el.dataset.noteName)
      return
    }
    if (el.dataset.menuAct) return menuAction(el.dataset.menuAct, el.dataset.id)
    if (el.dataset.rowAct) {
      e.stopPropagation()
      const id = el.dataset.id || el.closest('[data-id]')?.dataset.id
      if (!id) return
      if (el.dataset.rowAct === 'add') return newNote(id)
      return openMenu(el, id)
    }
    if (el.dataset.mode) return setMode(el.dataset.mode)
    if (el.dataset.tool) return runTool(el.dataset.tool)
    if (el.dataset.crumb) {
      setFolder(el.dataset.crumb)
      if (phone.matches) { setView('list'); setRoute(null) }
      return
    }
    if (el.dataset.open) return openNote(el.dataset.open)
    if (el.dataset.folder) return setFolder(el.dataset.folder)
    if (el.matches('.nt-row[data-id]')) {
      const { id, kind } = el.dataset
      if (kind === 'group') {
        if (state.open.has(id)) state.open.delete(id)
        else { state.open.add(id); state.store.touch(id) }
        saveOpen()
        renderAll()
      } else openNote(id)
      return
    }
    switch (el.dataset.act) {
      case 'signin':
        Promise.resolve(signIn()).catch(err => { console.warn(err); toast(err?.message || String(err)) })
        break
      case 'signout':
        closeNote()
        Promise.resolve(signOut ? signOut() : fbSignOut(auth)).catch(() => fbSignOut(auth))
        break
      case 'home': flush(); onHome?.(); break
      case 'new-note': newNote(); break
      case 'new-group': newGroup(); break
      case 'back': goList(); break
      case 'note-menu': if (state.session) openMenu(el, state.session.id, { note: true }); break
      case 'sort':
        state.sort = state.sort === 'recent' ? 'name' : 'recent'
        writeLS(LS.sort, state.sort)
        renderAll()
        break
      case 'clear-search':
        els.search.value = ''
        state.query = ''
        syncSearchClear()
        renderAll()
        break
      case 'toggle-side':
        state.sideHidden = !state.sideHidden
        root.classList.toggle('nt--side-hidden', state.sideHidden)
        writeLS(LS.side, state.sideHidden ? '1' : '0')
        break
    }
  })

  root.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[role="button"][tabindex]')) {
      e.preventDefault()
      e.target.click()
    }
  })

  root.addEventListener('contextmenu', e => {
    const card = e.target.closest('[data-id]')
    if (!card || !state.store || card.closest('[data-menu]') || e.target.closest('.cm-editor')) return
    e.preventDefault()
    openMenu(card, card.dataset.id)
  })

  els.toolbar.addEventListener('mousedown', e => { if (e.target.closest('[data-tool]')) e.preventDefault() })

  let titleTimer = 0
  els.title.addEventListener('input', () => {
    const s = state.session
    if (!s) return
    clearTimeout(titleTimer)
    const value = els.title.value
    titleTimer = setTimeout(() => state.store.rename(s.id, value), 350)
  })
  els.title.addEventListener('keydown', e => {
    if (e.key === 'Enter' || (e.key === 'ArrowDown' && !e.shiftKey)) {
      e.preventDefault()
      if (state.mode === 'edit') state.session?.editor?.view.focus()
    }
  })

  function syncSearchClear() {
    root.querySelector('[data-act="clear-search"]').hidden = !els.search.value
  }
  els.search.addEventListener('input', () => {
    state.query = els.search.value
    syncSearchClear()
    renderAll()
  })

  let scrollTimer = 0
  els.scroll.addEventListener('scroll', () => {
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(rememberScroll, 300)
  }, { passive: true })

  // Two fingers down and up without moving toggles Code / Read.
  let two = null
  const mid = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2, d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) })
  els.scroll.addEventListener('touchstart', e => {
    if (e.touches.length === 2) two = { at: Date.now(), ...mid(e.touches[0], e.touches[1]), moved: false }
    else if (e.touches.length > 2) two = null
  }, { passive: true })
  els.scroll.addEventListener('touchmove', e => {
    if (!two || e.touches.length !== 2) return
    const m = mid(e.touches[0], e.touches[1])
    if (Math.hypot(m.x - two.x, m.y - two.y) > 14 || Math.abs(m.d - two.d) > 18) two.moved = true
  }, { passive: true })
  els.scroll.addEventListener('touchend', e => {
    if (!two || e.touches.length) return
    const ok = !two.moved && Date.now() - two.at < 450
    two = null
    if (ok) toggleMode()
  })
  els.scroll.addEventListener('touchcancel', () => { two = null })

  // Drag and drop to move notes and folders in the desktop tree.
  let dragId = null
  els.tree.addEventListener('dragstart', e => {
    const row = e.target.closest('.nt-row[data-id]')
    if (!row) return
    dragId = row.dataset.id
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dragId)
  })
  els.tree.addEventListener('dragover', e => {
    if (!dragId) return
    const target = e.target.closest('[data-drop]')
    if (!target) return
    e.preventDefault()
    root.querySelectorAll('.is-drop').forEach(x => x.classList.remove('is-drop'))
    target.classList.add('is-drop')
  })
  els.tree.addEventListener('dragleave', e => { e.target.closest?.('[data-drop]')?.classList.remove('is-drop') })
  els.tree.addEventListener('drop', e => {
    const target = e.target.closest('[data-drop]')
    root.querySelectorAll('.is-drop').forEach(x => x.classList.remove('is-drop'))
    if (!dragId || !target) return
    e.preventDefault()
    const dest = target.dataset.drop
    if (dest !== dragId) {
      state.store.move(dragId, dest)
      if (dest !== ROOT_ID) { state.open.add(dest); saveOpen() }
    }
    dragId = null
  })
  els.tree.addEventListener('dragend', () => { dragId = null })

  function onKey(e) {
    if (!state.store || root.hidden) return
    const mod = e.ctrlKey || e.metaKey
    if (mod && e.altKey && e.key.toLowerCase() === 'n') { e.preventDefault(); newNote() }
    if (mod && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); goList(); els.search.focus() }
    if (mod && e.key === '.') { e.preventDefault(); toggleMode() }
    if (e.key === 'Escape') closeMenu()
  }
  window.addEventListener('keydown', onKey)

  function onLang() { applyLabels(); if (state.mode === 'read') renderRead(); state.session?.editor?.refresh() }
  window.addEventListener('langchanged', onLang)

  const onPhoneChange = () => renderAll()
  phone.addEventListener('change', onPhoneChange)

  // Keeps the editor and its toolbar above the on-screen keyboard.
  function fitViewport() {
    if (!autoHeight) return
    const vv = window.visualViewport
    const top = root.getBoundingClientRect().top
    const h = (vv ? vv.height + vv.offsetTop : window.innerHeight) - Math.max(0, top)
    root.style.setProperty('--nt-height', `${Math.max(320, h)}px`)
  }
  window.visualViewport?.addEventListener('resize', fitViewport)
  window.visualViewport?.addEventListener('scroll', fitViewport)
  window.addEventListener('resize', fitViewport)

  function goList() {
    rememberScroll()
    setView('list')
    if (phone.matches) setRoute(null)
    renderAll()
  }

  // ---------- instant start ----------
  // The whole UI is snapshotted when the app goes to the background, so the next
  // launch can paint it before the bundle runs; see the boot script of the app.
  function savePeek() {
    if (!state.store || els.shell.hidden) return
    const s = state.session
    const view = root.dataset.view
    try {
      const html = root.innerHTML.replace(/contenteditable="true"/g, 'contenteditable="false"')
      if (html.length > 450000) { dropLS(LS.peek); return }
      const docHtml = s && view === 'note' ? (state.mode === 'read' ? els.read.innerHTML : els.editor.innerHTML).replace(/contenteditable="true"/g, 'contenteditable="false"') : ''
      writeLS(LS.peek, {
        html,
        cls: root.className,
        view,
        status: root.dataset.status,
        id: view === 'note' ? s?.id || null : null,
        mode: state.mode,
        docHtml,
        scroll: Math.round(els.scroll.scrollTop),
        homeScroll: Math.round(els.homeSide.scrollTop),
        at: Date.now(),
      })
    } catch {}
  }

  function flush() {
    rememberScroll()
    flushMeta()
    state.session?.sync.flush()
    state.store?.flushTools()
    savePeek()
  }

  // ---------- auth ----------
  function showGate(kind) {
    els.gate.hidden = false
    els.shell.hidden = true
    root.dataset.view = 'gate'
    root.querySelector('[data-gate-loading]').hidden = kind !== 'loading'
    root.querySelector('[data-act="signin"]').hidden = kind !== 'signedout'
    root.querySelector('[data-gate-error]').hidden = kind !== 'unauthorized'
    root.querySelector('[data-gate-signout]').hidden = kind !== 'unauthorized'
  }

  function showUser(user) {
    const avatar = $('[data-avatar]')
    if (user.photoURL && avatar.getAttribute('src') !== user.photoURL) avatar.src = user.photoURL
    avatar.hidden = !user.photoURL
    $('[data-user]').textContent = user.displayName || user.email
  }

  let unsubConn = null
  function startSession(user, { optimistic = false } = {}) {
    els.gate.hidden = true
    els.shell.hidden = false
    root.classList.toggle('nt--side-hidden', state.sideHidden)
    showUser(user)
    state.store = new NotesStore(db, storage).start(state.gate)
    state.store.subscribe(() => {
      renderAll()
      const s = state.session
      if (s && !state.store.get(s.id) && Object.keys(state.store.items).length && state.authed) {
        closeNote()
        setView('list')
        toast(t('noteDeleted'))
      }
    })
    unsubConn = onValue(ref(db, '.info/connected'), snap => { state.online = snap.val() === true; renderStatus() })
    applyLabels()
    fitViewport()
    const route = getRoute()
    const lastView = localStorage.getItem(LS.view)
    const last = localStorage.getItem(LS.last)
    const target = route || ((lastView === 'note' || (!phone.matches && lastView !== 'list')) ? last : null)
    if (target && state.store.get(target)) openNote(target, { push: !route && !optimistic, restore: true })
    else {
      setView('list')
      renderNow()
      if (state.peek?.homeScroll) els.homeSide.scrollTop = state.peek.homeScroll
    }
    state.peek = null
  }

  function stopSession() {
    closeNote()
    state.store?.stop()
    state.store = null
    unsubConn?.()
    unsubConn = null
    els.tree.innerHTML = ''
    els.homeSide.innerHTML = ''
    els.homeMain.innerHTML = ''
  }

  const cached = readJSON(LS.user, null)
  if (cached && isAllowed(cached)) startSession(cached, { optimistic: true })
  else showGate('loading')
  if (!state.store) applyLabels()

  const unsubAuth = onAuthStateChanged(auth, user => {
    state.user = user
    if (!user || !isAllowed(user)) {
      const wasAuthed = state.authed
      stopSession()
      state.authed = false
      if (wasAuthed) state.gate = newGate()
      dropLS(LS.user, LS.peek)
      showGate(user ? 'unauthorized' : 'signedout')
      return
    }
    writeLS(LS.user, { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL })
    state.authed = true
    resolveAuth()
    if (!state.store) startSession(user)
    else { showUser(user); renderStatus() }
  })

  return {
    openNote: id => state.store && openNote(id, { push: false }),
    showList: () => { if (state.store) goList() },
    // Returns true when it consumed a "back" gesture (Android back button).
    back() {
      if (els.dialog.open) { els.dialog.close(); return true }
      if (!els.menu.hidden) { closeMenu(); return true }
      if (!state.store) return false
      if (root.dataset.view === 'note' && phone.matches) { goList(); return true }
      if (state.query) { els.search.value = ''; state.query = ''; syncSearchClear(); renderAll(); return true }
      if (state.folder !== ROOT_ID && state.store.get(state.folder)) { setFolder(state.store.get(state.folder).parent || ROOT_ID, { touch: false }); return true }
      return false
    },
    flush,
    destroy() {
      unsubAuth()
      stopSession()
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('langchanged', onLang)
      window.removeEventListener('resize', fitViewport)
      phone.removeEventListener('change', onPhoneChange)
    },
  }
}
