import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'

// ── Firebase ──────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain:        import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

const webDocRef = doc(db, 'settings', 'web')
const userDocRef = uid => doc(db, 'users', uid)

// ── Constants ─────────────────────────────────────────────────────────────────

export const BROADCAST_TTL = 4 * 60 * 60 * 1000 // web theme/font/lang: 4 hours
export const LOCK_TTL       = 60 * 60 * 1000     // kiosk redirect: 1 hour

export const LS = {
  theme:   'site-theme',
  custom:  'site-theme-custom',
  font:    'site-font',
  lang:    'site-lang',
  lastPage:'site-last-page',
  landing: 'site-default-landing',
  web:     'site-web',        // cached settings/web doc
  optout:  'site-web-optout', // appliedAt of the broadcast the user dismissed
  admin:   'site-is-admin',   // '1' when an authorized account is signed in
}

export const FONT_MAP = {
  inter:       { stack: "'Inter', sans-serif",        url: 'Inter:wght@400;700' },
  roboto:      { stack: "'Roboto', sans-serif",       url: 'Roboto:wght@400;700' },
  playfair:    { stack: "'Playfair Display', serif",  url: 'Playfair+Display:wght@400;700' },
  montserrat:  { stack: "'Montserrat', sans-serif",   url: 'Montserrat:wght@400;700' },
  'fira-code': { stack: "'Fira Code', monospace",     url: 'Fira+Code:wght@400;700' },
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

function safeParse(str) {
  try { return JSON.parse(str) } catch { return null }
}

export function detectSystemLang() {
  const l = (navigator.language || 'en').toLowerCase()
  return l.startsWith('es') ? 'es' : 'en'
}

export function readWeb() {
  return safeParse(localStorage.getItem(LS.web))
}

export function readUser() {
  return {
    theme:  localStorage.getItem(LS.theme) || '',
    custom: safeParse(localStorage.getItem(LS.custom)),
    font:   localStorage.getItem(LS.font) || '',
    lang:   localStorage.getItem(LS.lang) || '',
  }
}

export function broadcastActive(web, now = Date.now()) {
  return !!(web && web.broadcast && web.broadcast.appliedAt &&
    now - web.broadcast.appliedAt < BROADCAST_TTL)
}

export function lockActive(web, now = Date.now()) {
  return !!(web && web.lock && web.lock.appliedAt &&
    now - web.lock.appliedAt < LOCK_TTL)
}

// A broadcast applies to a user only if it is active and the user has not
// dismissed this particular broadcast (identified by its appliedAt).
export function broadcastEligible(web, now = Date.now()) {
  if (!broadcastActive(web, now)) return false
  return String(web.broadcast.appliedAt) !== localStorage.getItem(LS.optout)
}

// Resolve the effective settings under the priority: web (3) > user (2) > system (1).
export function resolve(web, user, now = Date.now()) {
  const b = broadcastEligible(web, now) ? web.broadcast : null
  const theme = (b && b.theme != null) ? b.theme : (user.theme || 'system')
  let custom = null
  if (theme === 'customizable') {
    custom = (b && b.theme === 'customizable' && b.customColors) ? b.customColors : user.custom
  }
  const font = (b && b.font != null) ? b.font : (user.font || '')
  const lang = (b && b.lang != null) ? b.lang : (user.lang || detectSystemLang())
  return { theme, custom, font, lang }
}

// ── DOM appliers (do NOT persist user preferences) ──────────────────────────────

const COLOR_VARS = ['--color-primary', '--color-text', '--color-bg', '--color-muted']

export function applyThemeDom(theme, custom) {
  const r = document.documentElement
  r.dataset.theme = theme
  if (theme === 'customizable' && custom) {
    r.style.setProperty('--color-primary', custom.primary)
    r.style.setProperty('--color-text',    custom.text)
    r.style.setProperty('--color-bg',      custom.bg)
    r.style.setProperty('--color-muted',   custom.muted)
  } else {
    COLOR_VARS.forEach(p => r.style.removeProperty(p))
  }
}

export function applyFontDom(key) {
  const r = document.documentElement
  if (!key || !FONT_MAP[key]) {
    r.style.removeProperty('--font-ui')
    r.style.removeProperty('--font-bold')
    document.getElementById('gfont-link')?.remove()
    return
  }
  const { stack, url } = FONT_MAP[key]
  r.style.setProperty('--font-ui',   stack)
  r.style.setProperty('--font-bold', stack)
  let lnk = document.getElementById('gfont-link')
  const href = `https://fonts.googleapis.com/css2?family=${url}&display=swap`
  if (!lnk) {
    lnk = document.createElement('link')
    lnk.id  = 'gfont-link'
    lnk.rel = 'stylesheet'
    document.head.appendChild(lnk)
  }
  if (lnk.href !== href) lnk.href = href
}

export function applyLangDom(lang) {
  // persist = false: applying a resolved value must not overwrite the user's own.
  window.applyLang?.(lang, false)
}

export function applyResolved(r) {
  applyThemeDom(r.theme, r.custom)
  applyFontDom(r.font)
  applyLangDom(r.lang)
}

// Re-resolve from the current caches and apply. Returns the resolved values.
export function reapply(now = Date.now()) {
  const r = resolve(readWeb(), readUser(), now)
  applyResolved(r)
  return r
}

// ── Web doc (global / real-time) ────────────────────────────────────────────────

export async function getWeb() {
  const snap = await getDoc(webDocRef)
  const data = snap.exists() ? snap.data() : null
  if (data) localStorage.setItem(LS.web, JSON.stringify(data))
  return data
}

export function listenWeb(callback) {
  return onSnapshot(webDocRef, snap => {
    const data = snap.exists() ? snap.data() : null
    if (data) localStorage.setItem(LS.web, JSON.stringify(data))
    else localStorage.removeItem(LS.web)
    if (data && data.defaultLanding) localStorage.setItem(LS.landing, data.defaultLanding)
    callback(data)
  })
}

export async function saveBroadcast(fields) {
  await setDoc(webDocRef, { broadcast: { ...fields, appliedAt: Date.now() } }, { merge: true })
}

export async function clearBroadcast() {
  await setDoc(webDocRef, { broadcast: null }, { merge: true })
}

export async function saveLock(path) {
  await setDoc(webDocRef, { lock: { path, appliedAt: Date.now() } }, { merge: true })
}

export async function clearLock() {
  await setDoc(webDocRef, { lock: null }, { merge: true })
}

export async function saveLanding(defaultLanding) {
  await setDoc(webDocRef, { defaultLanding }, { merge: true })
  localStorage.setItem(LS.landing, defaultLanding)
}

// The user opts out of the current broadcast (used by "reset to default").
export function optOutOfBroadcast() {
  const web = readWeb()
  if (web && web.broadcast && web.broadcast.appliedAt) {
    localStorage.setItem(LS.optout, String(web.broadcast.appliedAt))
  }
}

// ── User doc (per-account, survives history clears) ─────────────────────────────

export async function getUserSettings(uid) {
  const snap = await getDoc(userDocRef(uid))
  return snap.exists() ? snap.data() : null
}

export async function saveUserSettings(uid, fields) {
  await setDoc(userDocRef(uid), { ...fields, updatedAt: Date.now() }, { merge: true })
}

// ── Kiosk / lock (web-forced redirect) ──────────────────────────────────────────

export function isAdminCached() {
  return localStorage.getItem(LS.admin) === '1'
}

export function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = n => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`
}

let lockTimer = null
let lockGuardsInstalled = false

function lockClickGuard(e) {
  const a = e.target.closest && e.target.closest('a[href]')
  if (!a) return
  const url = new URL(a.href, location.href)
  if (url.origin === location.origin && url.pathname === location.pathname) return
  e.preventDefault()
  e.stopPropagation()
  flashLockBanner()
}
function lockPopGuard() {
  history.pushState(null, '', location.href)
  flashLockBanner()
}
function lockBeforeUnload(e) { e.preventDefault(); e.returnValue = '' }

function installLockGuards() {
  if (lockGuardsInstalled) return
  lockGuardsInstalled = true
  document.addEventListener('click', lockClickGuard, true)
  history.pushState(null, '', location.href)
  window.addEventListener('popstate', lockPopGuard)
  window.addEventListener('beforeunload', lockBeforeUnload)
}

function removeLockGuards() {
  if (!lockGuardsInstalled) return
  lockGuardsInstalled = false
  document.removeEventListener('click', lockClickGuard, true)
  window.removeEventListener('popstate', lockPopGuard)
  window.removeEventListener('beforeunload', lockBeforeUnload)
}

function flashLockBanner() {
  const el = document.getElementById('kiosk-lock')
  if (!el) return
  el.classList.remove('kiosk-lock--flash')
  void el.offsetWidth
  el.classList.add('kiosk-lock--flash')
}

function showLockBanner(appliedAt, message) {
  let el = document.getElementById('kiosk-lock')
  if (!el) {
    el = document.createElement('div')
    el.id = 'kiosk-lock'
    el.innerHTML =
      '<span class="kiosk-lock__msg"></span><span class="kiosk-lock__timer"></span>'
    document.body.appendChild(el)
  }
  el.querySelector('.kiosk-lock__msg').textContent = message
  const timerEl = el.querySelector('.kiosk-lock__timer')
  if (lockTimer) clearInterval(lockTimer)
  const tick = () => {
    const remaining = appliedAt + LOCK_TTL - Date.now()
    timerEl.textContent = fmtCountdown(remaining)
    if (remaining <= 0) {
      // TTL elapsed: free the user even if no new snapshot arrives.
      removeLockGuards()
      hideLockBanner()
    }
  }
  tick()
  lockTimer = setInterval(tick, 1000)
}

function hideLockBanner() {
  if (lockTimer) { clearInterval(lockTimer); lockTimer = null }
  document.getElementById('kiosk-lock')?.remove()
}

// Enforce (or release) the kiosk lock. `message` is the localized restriction text.
// Returns true when a redirect was triggered (caller should stop further work).
export function applyKiosk(web, message) {
  const path = web && web.lock && web.lock.path
  const active = lockActive(web) && !isAdminCached() && !!path
  if (active) {
    if (location.pathname !== path) {
      location.replace(path)
      return true
    }
    installLockGuards()
    showLockBanner(web.lock.appliedAt, message)
  } else {
    removeLockGuards()
    hideLockBanner()
  }
  return false
}
