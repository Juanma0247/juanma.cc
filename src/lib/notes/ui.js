import * as Y from 'yjs'
import { getAuth, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { FIREBASE_CONFIG, ROOT_ID, isAllowed } from './config.js'
import { t } from './i18n.js'
import { NotesStore } from './store.js'
import { NoteSync } from './sync.js'
import { createEditor, commands } from './editor.js'
import { createRenderer } from './render.js'
import { uploadImage } from './upload.js'

const LS = {
  last: 'jm-notes-last',
  mode: 'jm-notes-mode',
  open: 'jm-notes-open-groups',
  side: 'jm-notes-side',
}

const ICON = {
  search: '<path d="M9 3.5a5.5 5.5 0 1 0 3.4 9.83l3.63 3.64a.75.75 0 1 0 1.06-1.06l-3.63-3.64A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/>',
  note: '<path d="M5.5 2A1.5 1.5 0 0 0 4 3.5v13A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5V7.12a1.5 1.5 0 0 0-.44-1.06l-3.62-3.62A1.5 1.5 0 0 0 10.88 2H5.5Zm1.25 8h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5Zm0 3h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5Z"/>',
  noteAdd: '<path d="M5.5 2A1.5 1.5 0 0 0 4 3.5v13A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5V7.12a1.5 1.5 0 0 0-.44-1.06l-3.62-3.62A1.5 1.5 0 0 0 10.88 2H5.5Zm4.5 6a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 10 8Z"/>',
  folder: '<path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v10.5C2 16.22 2.78 17 3.75 17h12.5A1.75 1.75 0 0 0 18 15.25v-8.5A1.75 1.75 0 0 0 16.25 5h-5.69l-1.4-1.4A2 2 0 0 0 7.76 3H3.75Z"/>',
  folderAdd: '<path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v10.5C2 16.22 2.78 17 3.75 17h12.5A1.75 1.75 0 0 0 18 15.25v-8.5A1.75 1.75 0 0 0 16.25 5h-5.69l-1.4-1.4A2 2 0 0 0 7.76 3H3.75ZM10 8a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 10 8Z"/>',
  caret: '<path d="M7.2 14.8a.75.75 0 0 1 0-1.06L10.94 10 7.2 6.26a.75.75 0 1 1 1.06-1.06l4.27 4.27a.75.75 0 0 1 0 1.06L8.26 14.8a.75.75 0 0 1-1.06 0Z"/>',
  more: '<path d="M4 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm4.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm4.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"/>',
  plus: '<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"/>',
  back: '<path d="M12.8 15.2a.75.75 0 0 1-1.06 0l-4.67-4.67a.75.75 0 0 1 0-1.06l4.67-4.67a.75.75 0 1 1 1.06 1.06L8.66 10l4.14 4.14a.75.75 0 0 1 0 1.06Z"/>',
  side: '<path d="M3.5 3A1.5 1.5 0 0 0 2 4.5v11A1.5 1.5 0 0 0 3.5 17h13a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 16.5 3h-13ZM7 4.5h9.5v11H7v-11Z"/>',
  gear: '<path fill-rule="evenodd" d="M8.34 1.8A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.8l.3 1.48c.5.14.97.34 1.41.59l1.25-.84a1 1 0 0 1 1.27.13l.96.96a1 1 0 0 1 .12 1.26l-.83 1.25c.24.45.44.92.59 1.42l1.47.29a1 1 0 0 1 .8.98v1.36a1 1 0 0 1-.8.98l-1.47.3c-.15.5-.35.97-.59 1.41l.83 1.25a1 1 0 0 1-.12 1.27l-.96.96a1 1 0 0 1-1.27.12l-1.25-.83c-.44.24-.91.44-1.41.59l-.3 1.47a1 1 0 0 1-.98.8H9.32a1 1 0 0 1-.98-.8l-.3-1.47a6.96 6.96 0 0 1-1.41-.59l-1.25.83a1 1 0 0 1-1.26-.12l-.96-.96a1 1 0 0 1-.13-1.27l.84-1.25a6.96 6.96 0 0 1-.59-1.41l-1.47-.3A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .8-.98l1.48-.3c.14-.49.34-.96.59-1.41l-.84-1.25a1 1 0 0 1 .13-1.26l.96-.96A1 1 0 0 1 5.38 2.93l1.25.84c.44-.25.92-.45 1.41-.59l.3-1.48ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/>',
  logout: '<path d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .41.34.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Zm10.97 2.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H7.75a.75.75 0 0 1 0-1.5h7.19l-.97-.97a.75.75 0 0 1 0-1.06Z"/>',
  image: '<path fill-rule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .41.34.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.22a.75.75 0 0 0-1.06 0l-1.91 1.91.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.09a.75.75 0 0 0-1.06 0L2.5 11.06ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clip-rule="evenodd"/>',
  link: '<path d="M12.23 3.53a3.25 3.25 0 0 1 4.6 4.6l-1.72 1.71a.75.75 0 1 1-1.06-1.06l1.72-1.72a1.75 1.75 0 0 0-2.48-2.47l-3 3a1.75 1.75 0 0 0 0 2.47.75.75 0 1 1-1.06 1.06 3.25 3.25 0 0 1 0-4.6l3-3Zm-1.4 5.47a.75.75 0 0 1 1.06 0 3.25 3.25 0 0 1 0 4.6l-3 3a3.25 3.25 0 0 1-4.6-4.6l1.72-1.71a.75.75 0 1 1 1.06 1.06l-1.72 1.72a1.75 1.75 0 0 0 2.48 2.47l3-3a1.75 1.75 0 0 0 0-2.47.75.75 0 0 1 0-1.06Z"/>',
  undo: '<path d="M7.8 3.97a.75.75 0 0 1 0 1.06L6.08 6.75h6.17a4.75 4.75 0 0 1 0 9.5h-3a.75.75 0 0 1 0-1.5h3a3.25 3.25 0 0 0 0-6.5H6.08l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0Z"/>',
  redo: '<path d="M12.2 3.97a.75.75 0 0 0 0 1.06l1.72 1.72H7.75a4.75 4.75 0 0 0 0 9.5h3a.75.75 0 0 0 0-1.5h-3a3.25 3.25 0 0 1 0-6.5h6.17l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z"/>',
}

const svg = (name, extra = '') => `<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" ${extra}>${ICON[name]}</svg>`
const GOOGLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"/></svg>'

const TOOLS = [
  ['heading', '<b>H</b>', v => commands.heading(v)],
  ['bold', '<b>B</b>', v => commands.wrap(v, '**')],
  ['italic', '<i>I</i>', v => commands.wrap(v, '*')],
  ['strike', '<s>S</s>', v => commands.wrap(v, '~~')],
  ['task', '☑', v => commands.prefix(v, '- [ ] ', /^(\s*)([-*+]\s(\[[ xX]\]\s)?|\d+[.)]\s)/)],
  ['list', '•', v => commands.prefix(v, '- ', /^(\s*)([-*+]\s(\[[ xX]\]\s)?|\d+[.)]\s)/)],
  ['olist', '1.', v => commands.prefix(v, '1. ', /^(\s*)([-*+]\s(\[[ xX]\]\s)?|\d+[.)]\s)/)],
  ['math', '<span class="nt-tb__tex">∑</span>', v => commands.wrap(v, '$', '$', 'x')],
  ['mathBlock', '<span class="nt-tb__tex">$$</span>', v => commands.insert(v, '\n$$\n\n$$\n', 4)],
  ['image', svg('image'), null],
  ['link', svg('link'), v => commands.link(v)],
  ['noteLink', '[[ ]]', v => commands.wrap(v, '[[', ']]')],
  ['code', '<code>`</code>', v => commands.wrap(v, '`')],
  ['codeBlock', '<code>{ }</code>', v => commands.insert(v, '\n```\n\n```\n', 5)],
  ['quote', '❝', v => commands.prefix(v, '> ', /^>\s/)],
  ['table', '▦', v => commands.insert(v, '\n| A | B |\n| --- | --- |\n|  |  |\n', 3)],
  ['undo', svg('undo'), null],
  ['redo', svg('redo'), null],
]

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)) } catch {}
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
    getRoute = () => null,
    setRoute = () => {},
    autoHeight = true,
  } = opts

  const auth = getAuth(firebaseApp)
  const db = getDatabase(firebaseApp, FIREBASE_CONFIG.databaseURL)
  const storage = getStorage(firebaseApp)

  const state = {
    user: null,
    store: null,
    session: null,
    query: '',
    mode: localStorage.getItem(LS.mode) || 'live',
    open: new Set(readJSON(LS.open, [])),
    activeGroup: ROOT_ID,
    sideHidden: localStorage.getItem(LS.side) === '1',
  }

  root.classList.add('nt', 'no-katex')
  root.innerHTML = `
    <div class="nt-gate" hidden>
      <div class="nt-gate__card">
        <span class="nt-gate__icon">${svg('note')}</span>
        <h2 data-t="gateTitle"></h2>
        <p data-t="gateDesc"></p>
        <p class="nt-gate__error" data-gate-error hidden data-t="unauthorized"></p>
        <p class="nt-gate__loading" data-gate-loading data-t="loading"></p>
        <button class="nt-btn nt-btn--primary" data-act="signin" hidden>${GOOGLE}<span data-t="signIn"></span></button>
        <button class="nt-btn" data-act="signout" data-gate-signout hidden><span data-t="signOut"></span></button>
        ${settingsHref ? `<a class="nt-btn nt-btn--ghost" href="${settingsHref}">${svg('gear')}<span data-t="webSettings"></span></a>` : ''}
      </div>
    </div>
    <div class="nt-shell" hidden>
      <aside class="nt-side">
        <div class="nt-side__head">
          <label class="nt-search">${svg('search')}<input type="search" data-search data-t-placeholder="search" autocomplete="off"></label>
          <button class="nt-icon" data-act="new-note" data-t-title="newNote">${svg('noteAdd')}</button>
          <button class="nt-icon" data-act="new-group" data-t-title="newGroup">${svg('folderAdd')}</button>
        </div>
        <nav class="nt-tree" data-tree data-drop="${ROOT_ID}"></nav>
        <div class="nt-side__foot">
          <img class="nt-avatar" data-avatar alt="" referrerpolicy="no-referrer">
          <span class="nt-user" data-user></span>
          ${settingsHref ? `<a class="nt-icon" href="${settingsHref}" data-t-title="webSettings">${svg('gear')}</a>` : ''}
          <button class="nt-icon" data-act="signout" data-t-title="signOut">${svg('logout')}</button>
        </div>
      </aside>
      <section class="nt-main">
        <header class="nt-bar">
          <button class="nt-icon nt-bar__back" data-act="back" data-t-title="back">${svg('back')}</button>
          <button class="nt-icon nt-bar__side" data-act="toggle-side">${svg('side')}</button>
          <div class="nt-crumbs" data-crumbs></div>
          <span class="nt-status" data-status></span>
          <div class="nt-modes" role="tablist" data-modes>
            <button role="tab" data-mode="live" data-t="modeLive"></button>
            <button role="tab" data-mode="source" data-t="modeSource"></button>
            <button role="tab" data-mode="read" data-t="modeRead"></button>
          </div>
        </header>
        <div class="nt-scroll" data-scroll>
          <div class="nt-doc" data-doc hidden>
            <input class="nt-title" data-title data-t-placeholder="titlePlaceholder" autocomplete="off" spellcheck="true">
            <div class="nt-meta" data-meta></div>
            <div class="nt-editor" data-editor></div>
            <article class="nt-read" data-read hidden></article>
          </div>
          <div class="nt-empty" data-empty>
            <p data-t="pickNote"></p>
            <button class="nt-btn nt-btn--primary" data-act="new-note">${svg('plus')}<span data-t="newNote"></span></button>
          </div>
        </div>
        <div class="nt-toolbar" data-toolbar hidden>
          ${TOOLS.map(([k, html]) => `<button type="button" data-tool="${k}" data-t-title="tb.${k}">${html}</button>`).join('')}
          <input type="file" accept="image/*" multiple hidden data-file>
        </div>
      </section>
    </div>
    <div class="nt-menu" data-menu hidden></div>
    <dialog class="nt-dialog" data-dialog></dialog>
    <div class="nt-toast" data-toast hidden></div>
  `

  const $ = sel => root.querySelector(sel)
  const els = {
    gate: $('.nt-gate'),
    shell: $('.nt-shell'),
    tree: $('[data-tree]'),
    search: $('[data-search]'),
    crumbs: $('[data-crumbs]'),
    status: $('[data-status]'),
    doc: $('[data-doc]'),
    title: $('[data-title]'),
    meta: $('[data-meta]'),
    editor: $('[data-editor]'),
    read: $('[data-read]'),
    empty: $('[data-empty]'),
    toolbar: $('[data-toolbar]'),
    file: $('[data-file]'),
    menu: $('[data-menu]'),
    dialog: $('[data-dialog]'),
    toast: $('[data-toast]'),
    scroll: $('[data-scroll]'),
  }

  const resolveNote = name => state.store?.findByTitle(name) ?? null
  const render = createRenderer({ resolveNote })

  function applyLabels() {
    root.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t) })
    root.querySelectorAll('[data-t-placeholder]').forEach(el => { el.placeholder = t(el.dataset.tPlaceholder) })
    root.querySelectorAll('[data-t-title]').forEach(el => { el.title = t(el.dataset.tTitle); el.setAttribute('aria-label', el.title) })
    renderTree()
    renderHeader()
  }

  function toast(msg) {
    els.toast.textContent = msg
    els.toast.hidden = false
    clearTimeout(toast.timer)
    toast.timer = setTimeout(() => { els.toast.hidden = true }, 3200)
  }

  // ---------- dialogs ----------
  function dialog(html, onReady) {
    return new Promise(resolve => {
      const d = els.dialog
      d.innerHTML = `<form method="dialog" class="nt-dialog__form">${html}</form>`
      const form = d.querySelector('form')
      const done = val => { d.close(); resolve(val) }
      form.addEventListener('submit', e => { e.preventDefault(); done(onReady.submit()) })
      form.querySelector('[data-cancel]')?.addEventListener('click', () => done(null))
      d.addEventListener('cancel', () => resolve(null), { once: true })
      d.showModal()
      onReady.init?.(form)
    })
  }

  function askText(label, value = '') {
    let input
    return dialog(`
      <label class="nt-dialog__label">${esc(label)}<input class="nt-input" value="${esc(value)}" required></label>
      <div class="nt-dialog__actions"><button type="button" class="nt-btn" data-cancel>${esc(t('cancel'))}</button><button class="nt-btn nt-btn--primary">${esc(t('save'))}</button></div>`, {
      init: f => { input = f.querySelector('input'); input.focus(); input.select() },
      submit: () => input.value.trim() || null,
    })
  }

  function askConfirm(msg) {
    return dialog(`
      <p class="nt-dialog__msg">${esc(msg)}</p>
      <div class="nt-dialog__actions"><button type="button" class="nt-btn" data-cancel>${esc(t('cancel'))}</button><button class="nt-btn nt-btn--danger">${esc(t('ok'))}</button></div>`, {
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
      </label>
      <div class="nt-dialog__actions"><button type="button" class="nt-btn" data-cancel>${esc(t('cancel'))}</button><button class="nt-btn nt-btn--primary">${esc(t('save'))}</button></div>`, {
      init: f => { select = f.querySelector('select'); select.value = store.get(id)?.parent || ROOT_ID },
      submit: () => select.value,
    })
  }

  // ---------- context menu ----------
  function openMenu(anchor, id) {
    const item = state.store.get(id)
    if (!item) return
    const entries = item.kind === 'group'
      ? [['new-note-in', 'newNoteHere'], ['new-group-in', 'newSubgroup'], ['rename', 'rename'], ['move', 'move'], ['delete', 'delete']]
      : [['rename', 'rename'], ['move', 'move'], ['delete', 'delete']]
    els.menu.innerHTML = entries.map(([act, key]) => `<button data-menu-act="${act}" data-id="${id}" class="${act === 'delete' ? 'is-danger' : ''}">${esc(t(key))}</button>`).join('')
    els.menu.hidden = false
    const r = anchor.getBoundingClientRect()
    const host = root.getBoundingClientRect()
    const mw = els.menu.offsetWidth
    const mh = els.menu.offsetHeight
    els.menu.style.left = `${Math.max(4, Math.min(r.right - host.left - mw, host.width - mw - 4))}px`
    els.menu.style.top = `${Math.min(r.bottom - host.top + 4, host.height - mh - 4)}px`
  }
  const closeMenu = () => { els.menu.hidden = true }

  async function menuAction(act, id) {
    closeMenu()
    const store = state.store
    const item = store.get(id)
    if (!item) return
    if (act === 'new-note-in') return newNote(id)
    if (act === 'new-group-in') return newGroup(id)
    if (act === 'rename') {
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
      if (closing) closeNote()
      await store.remove(id)
    }
  }

  // ---------- tree ----------
  const saveOpen = () => writeLS(LS.open, [...state.open])

  function noteLabel(n) {
    if (n.title) return n.title
    const first = (n.excerpt || '').replace(/^[#>\-*\s[\]x]+/, '').slice(0, 60)
    return first || t('untitled')
  }

  function rowHtml(item, depth) {
    const active = state.session?.id === item.id ? ' is-active' : ''
    if (item.kind === 'group') {
      const open = state.open.has(item.id)
      const count = state.store.children(item.id).length
      return `<div class="nt-row nt-row--group${open ? ' is-open' : ''}${active}" data-id="${item.id}" data-kind="group" data-drop="${item.id}" draggable="true" style="--depth:${depth}" role="treeitem" aria-expanded="${open}">
        <span class="nt-row__caret">${svg('caret')}</span>${svg('folder', 'class="nt-row__icon"')}
        <span class="nt-row__title">${esc(item.title || t('untitledGroup'))}</span>
        <span class="nt-row__count">${count || ''}</span>
        <button class="nt-row__btn" data-row-act="add" data-t-title="newNoteHere" title="${esc(t('newNoteHere'))}">${svg('plus')}</button>
        <button class="nt-row__btn" data-row-act="menu" title="⋯">${svg('more')}</button>
      </div>`
    }
    return `<div class="nt-row nt-row--note${active}" data-id="${item.id}" data-kind="note" draggable="true" style="--depth:${depth}" role="treeitem">
      ${svg('note', 'class="nt-row__icon"')}
      <span class="nt-row__title">${esc(noteLabel(item))}</span>
      <button class="nt-row__btn" data-row-act="menu" title="⋯">${svg('more')}</button>
    </div>`
  }

  function renderLevel(parent, depth) {
    let html = ''
    for (const item of state.store.children(parent)) {
      html += rowHtml(item, depth)
      if (item.kind === 'group' && state.open.has(item.id)) {
        const inner = renderLevel(item.id, depth + 1)
        html += inner || `<div class="nt-row nt-row--empty" style="--depth:${depth + 1}">${esc(t('emptyGroup'))}</div>`
      }
    }
    return html
  }

  function renderSearch(q) {
    const store = state.store
    const needle = q.toLowerCase()
    const hits = store.notes().filter(n => {
      const body = store.texts?.[n.id] ?? n.excerpt ?? ''
      return (n.title || '').toLowerCase().includes(needle) || body.toLowerCase().includes(needle)
    }).sort((a, b) => (b.updated || 0) - (a.updated || 0))
    if (!hits.length) return `<p class="nt-tree__empty">${esc(t('noResults'))}</p>`
    return hits.map(n => {
      const path = store.path(n.id).map(g => g.title).join(' / ')
      const body = store.texts?.[n.id] ?? n.excerpt ?? ''
      const i = body.toLowerCase().indexOf(needle)
      const snippet = i >= 0 ? body.slice(Math.max(0, i - 30), i + 70).replace(/\s+/g, ' ') : ''
      return `<div class="nt-row nt-row--note nt-row--hit${state.session?.id === n.id ? ' is-active' : ''}" data-id="${n.id}" data-kind="note" style="--depth:0">
        ${svg('note', 'class="nt-row__icon"')}
        <span class="nt-row__stack"><span class="nt-row__title">${esc(noteLabel(n))}</span>${path ? `<span class="nt-row__path">${esc(path)}</span>` : ''}${snippet ? `<span class="nt-row__snippet">${esc(snippet)}</span>` : ''}</span>
      </div>`
    }).join('')
  }

  let treeFrame = 0
  function renderTree() {
    if (!state.store || treeFrame) return
    treeFrame = requestAnimationFrame(() => {
      treeFrame = 0
      const q = state.query.trim()
      if (q) els.tree.innerHTML = renderSearch(q)
      else {
        const html = renderLevel(ROOT_ID, 0)
        els.tree.innerHTML = html || `<p class="nt-tree__empty">${esc(t('empty'))}</p>`
      }
    })
  }

  // ---------- header / status ----------
  function renderHeader() {
    const s = state.session
    const item = s ? state.store?.get(s.id) : null
    if (!item) {
      els.crumbs.innerHTML = `<span class="nt-crumbs__title">${esc(t('title'))}</span>`
    } else {
      const path = state.store.path(s.id)
      els.crumbs.innerHTML = path.map(g => `<button class="nt-crumbs__group" data-crumb="${g.id}">${esc(g.title || t('untitledGroup'))}</button><span class="nt-crumbs__sep">/</span>`).join('') +
        `<span class="nt-crumbs__title">${esc(noteLabel(item))}</span>`
      if (document.activeElement !== els.title && els.title.value !== (item.title || '')) els.title.value = item.title || ''
      const parts = []
      if (item.words) parts.push(t('words', { n: item.words }))
      if (item.updated) parts.push(t('edited', { when: relTime(item.updated) }))
      els.meta.textContent = parts.join(' · ')
    }
    root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === state.mode)))
    renderStatus()
  }

  function renderStatus() {
    const st = state.session?.status || 'synced'
    const key = { synced: 'statusSynced', saving: 'statusSaving', offline: 'statusOffline', loading: 'statusLoading' }[st]
    els.status.dataset.state = st
    els.status.title = t(key)
    els.status.setAttribute('aria-label', t(key))
    els.status.hidden = !state.session
  }

  // ---------- notes ----------
  function newNote(parent) {
    const target = parent ?? state.activeGroup ?? ROOT_ID
    const id = state.store.create('note', state.store.get(target) ? target : ROOT_ID, '')
    if (target !== ROOT_ID) { state.open.add(target); saveOpen() }
    state.query = ''
    els.search.value = ''
    openNote(id, { focusTitle: true })
  }

  async function newGroup(parent = ROOT_ID) {
    const name = await askText(t('groupName'), t('untitledGroup'))
    if (!name) return
    const id = state.store.create('group', parent, name)
    if (parent !== ROOT_ID) state.open.add(parent)
    state.open.add(id)
    state.activeGroup = id
    saveOpen()
    renderTree()
  }

  function setView(view) {
    root.dataset.view = view
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

  function closeNote() {
    const s = state.session
    if (!s) return
    flushMeta()
    s.closed = true
    s.text.unobserve(s.onText)
    s.editor?.destroy()
    s.undo.destroy()
    if (s.uploads === 0) s.sync.destroy()
    state.session = null
    els.doc.hidden = true
    els.toolbar.hidden = true
    els.empty.hidden = false
    renderHeader()
    renderTree()
  }

  async function openNote(id, { focusTitle = false, push = true } = {}) {
    const store = state.store
    if (!store.get(id)) { toast(t('noteDeleted')); return }
    if (state.session?.id === id) { setView('note'); return }
    closeNote()
    const sync = new NoteSync(db, id, {
      onStatus: st => { if (state.session?.sync === sync) { state.session.status = st; renderStatus() } },
      onLocalChange: () => { if (state.session?.sync === sync) { state.session.dirty = true; scheduleMeta() } },
    })
    const s = { id, sync, text: sync.text, status: 'loading', uploads: 0, closed: false, dirty: false, editor: null }
    s.undo = new Y.UndoManager(sync.text, { captureTimeout: 600 })
    s.onText = () => { if (state.mode === 'read') scheduleRead() }
    sync.text.observe(s.onText)
    state.session = s
    state.activeGroup = store.get(id).parent || ROOT_ID
    writeLS(LS.last, id)
    if (push) setRoute(id)
    for (const g of store.path(id)) state.open.add(g.id)
    saveOpen()
    els.empty.hidden = true
    els.doc.hidden = false
    els.title.value = store.get(id).title || ''
    els.editor.innerHTML = ''
    setView('note')
    renderHeader()
    renderTree()
    await sync.ready
    if (state.session !== s) return
    s.editor = createEditor({
      parent: els.editor,
      ytext: sync.text,
      undoManager: s.undo,
      mode: state.mode === 'source' ? 'source' : 'live',
      placeholderText: '',
      ctx: {
        resolveNote,
        openNote: name => openByName(name),
        listNotes: () => store.notes().filter(n => n.title && n.id !== id).map(n => ({ title: n.title, group: store.path(n.id).map(g => g.title).join(' / ') })),
        insertImages: (view, files, pos) => insertImages(s, view, files, pos),
      },
    })
    applyMode()
    els.scroll.scrollTop = 0
    if (focusTitle) els.title.focus()
  }

  async function openByName(name) {
    const id = resolveNote(name)
    if (id) return openNote(id)
    if (!(await askConfirm(t('noteMissing', { name })))) return
    const nid = state.store.create('note', state.activeGroup, name)
    openNote(nid)
  }

  function applyMode() {
    const s = state.session
    writeLS(LS.mode, state.mode)
    root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === state.mode)))
    if (!s?.editor) return
    const reading = state.mode === 'read'
    els.editor.hidden = reading
    els.read.hidden = !reading
    els.toolbar.hidden = reading
    if (reading) renderRead()
    else s.editor.setMode(state.mode)
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
      const ph = `![${t('uploading')}](uploading://${tag})`
      const insert = `${before}${ph}\n`
      view.dispatch({ changes: { from: at, insert }, selection: { anchor: at + insert.length }, userEvent: 'input.paste' })
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
    const re = new RegExp(`!\\[[^\\]\\n]*\\]\\(uploading://${tag}\\)\\n?`)
    const m = re.exec(text)
    if (!m) return
    const keepNewline = replacement && m[0].endsWith('\n') ? '\n' : ''
    s.sync.doc.transact(() => {
      s.text.delete(m.index, m[0].length)
      if (replacement) s.text.insert(m.index, replacement + keepNewline)
    })
    if (!s.closed) { s.dirty = true; scheduleMeta() }
  }

  // ---------- events ----------
  root.addEventListener('click', e => {
    const el = e.target.closest('[data-act], [data-row-act], [data-menu-act], [data-mode], [data-tool], [data-crumb], .nt-row, .nt-wikilink, .nt-task')
    if (!el || !root.contains(el)) { closeMenu(); return }
    if (!el.closest('[data-menu]') && !el.matches('[data-row-act="menu"]')) closeMenu()

    if (el.matches('.nt-task')) {
      e.preventDefault()
      const line = Number(el.dataset.line)
      if (Number.isFinite(line)) toggleTask(line)
      return
    }
    if (el.matches('.nt-wikilink')) {
      e.preventDefault()
      const id = el.dataset.noteId
      if (id) openNote(id)
      else openByName(el.dataset.noteName)
      return
    }
    if (el.dataset.menuAct) return menuAction(el.dataset.menuAct, el.dataset.id)
    if (el.dataset.mode) {
      state.mode = el.dataset.mode
      applyMode()
      return
    }
    if (el.dataset.crumb) {
      state.open.add(el.dataset.crumb)
      saveOpen()
      setView('list')
      renderTree()
      return
    }
    if (el.dataset.rowAct) {
      e.stopPropagation()
      const id = el.closest('.nt-row').dataset.id
      if (el.dataset.rowAct === 'add') return newNote(id)
      return openMenu(el, id)
    }
    if (el.dataset.tool) return runTool(el.dataset.tool)
    if (el.matches('.nt-row') && el.dataset.id) {
      const { id, kind } = el.dataset
      if (kind === 'group') {
        if (state.open.has(id)) state.open.delete(id)
        else state.open.add(id)
        state.activeGroup = id
        saveOpen()
        renderTree()
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
      case 'new-note': newNote(); break
      case 'new-group': newGroup(); break
      case 'back': goList(); break
      case 'toggle-side':
        state.sideHidden = !state.sideHidden
        root.classList.toggle('nt--side-hidden', state.sideHidden)
        writeLS(LS.side, state.sideHidden ? '1' : '0')
        break
    }
  })

  root.addEventListener('contextmenu', e => {
    const row = e.target.closest('.nt-row[data-id]')
    if (!row || row.classList.contains('nt-row--hit')) return
    e.preventDefault()
    openMenu(row, row.dataset.id)
  })

  els.toolbar.addEventListener('mousedown', e => { if (e.target.closest('[data-tool]')) e.preventDefault() })

  function runTool(key) {
    const s = state.session
    if (!s?.editor) return
    const view = s.editor.view
    if (key === 'image') return els.file.click()
    if (key === 'undo') { s.undo.undo(); return }
    if (key === 'redo') { s.undo.redo(); return }
    const tool = TOOLS.find(([k]) => k === key)
    tool?.[2]?.(view)
  }

  els.file.addEventListener('change', () => {
    const s = state.session
    const files = [...els.file.files].filter(f => f.type.startsWith('image/'))
    els.file.value = ''
    if (s?.editor && files.length) insertImages(s, s.editor.view, files, s.editor.view.state.selection.main.from)
  })

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
      state.session?.editor?.view.focus()
    }
  })

  els.search.addEventListener('input', () => {
    state.query = els.search.value
    if (state.query) state.store?.loadTexts()
    renderTree()
  })

  // Drag and drop to move notes and groups between groups (desktop).
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
    if (mod && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); setView('list'); els.search.focus() }
    if (e.key === 'Escape') closeMenu()
  }
  window.addEventListener('keydown', onKey)

  function onLang() { applyLabels(); if (state.mode === 'read') renderRead(); state.session?.editor?.refresh() }
  window.addEventListener('langchanged', onLang)

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
    setView('list')
    if (window.matchMedia('(max-width: 47.99rem)').matches) setRoute(null)
  }

  // ---------- auth ----------
  function showGate(kind) {
    els.gate.hidden = false
    els.shell.hidden = true
    root.querySelector('[data-gate-loading]').hidden = kind !== 'loading'
    root.querySelector('[data-act="signin"]').hidden = kind !== 'signedout'
    root.querySelector('[data-gate-error]').hidden = kind !== 'unauthorized'
    root.querySelector('[data-gate-signout]').hidden = kind !== 'unauthorized'
  }

  function startSession(user) {
    els.gate.hidden = true
    els.shell.hidden = false
    root.classList.toggle('nt--side-hidden', state.sideHidden)
    const avatar = $('[data-avatar]')
    avatar.src = user.photoURL || ''
    avatar.hidden = !user.photoURL
    $('[data-user]').textContent = user.displayName || user.email
    if (!state.store) {
      state.store = new NotesStore(db, storage).start()
      state.store.subscribe(() => {
        renderTree()
        renderHeader()
        const s = state.session
        if (s && !state.store.get(s.id) && Object.keys(state.store.items).length) {
          closeNote()
          toast(t('noteDeleted'))
        }
      })
    }
    applyLabels()
    fitViewport()
    const route = getRoute()
    const wide = window.matchMedia('(min-width: 48rem)').matches
    const target = route || (wide ? localStorage.getItem(LS.last) : null)
    if (target && state.store.get(target)) openNote(target, { push: !route })
    else setView('list')
  }

  function stopSession() {
    closeNote()
    state.store?.stop()
    state.store = null
    els.tree.innerHTML = ''
  }

  showGate('loading')
  applyLabels()
  const unsubAuth = onAuthStateChanged(auth, user => {
    state.user = user
    if (!user) { stopSession(); showGate('signedout'); return }
    if (!isAllowed(user)) { stopSession(); showGate('unauthorized'); return }
    startSession(user)
  })

  return {
    openNote: id => state.store && openNote(id, { push: false }),
    showList: () => setView('list'),
    // Returns true when it consumed a "back" gesture (Android back button).
    back() {
      if (els.dialog.open) { els.dialog.close(); return true }
      if (!els.menu.hidden) { closeMenu(); return true }
      if (root.dataset.view === 'note' && window.matchMedia('(max-width: 47.99rem)').matches) { goList(); return true }
      return false
    },
    flush() {
      flushMeta()
      state.session?.sync.flush()
    },
    destroy() {
      unsubAuth()
      stopSession()
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('langchanged', onLang)
      window.removeEventListener('resize', fitViewport)
    },
  }
}
