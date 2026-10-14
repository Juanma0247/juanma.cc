// Shared helpers for the Física Mecánica project: translation bridge, number
// formatting, units, KaTeX rendering, the canvas palette and a tiny DOM builder.

import { parseExpr, evaluate } from '/js/lib/LSExpr.js'

export const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet
    ? window.i18nGet(`pd.mechanics.${key}`, fallback ?? key)
    : (fallback ?? key)

export const fill = (text, vars) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), String(text))

export const lang = () => (typeof window !== 'undefined' && window.__lang) || 'en'

// ── Numbers ─────────────────────────────────────────────────────────────────

export const EPS = 1e-9

export function clean(x) {
  if (!Number.isFinite(x)) return x
  if (Math.abs(x) < 1e-12) return 0
  return Number(x.toPrecision(12))
}

// Significant figures follow the textbooks (three or four); trailing zeros are
// dropped so that an exact 0.5 does not print as 0.5000.
export function fmt(x, sig = 4) {
  if (x === null || x === undefined || Number.isNaN(x)) return '?'
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞'
  x = clean(x)
  if (x === 0) return '0'
  const ax = Math.abs(x)
  if (ax >= 1e6 || ax < 1e-3) {
    const [m, e] = x.toExponential(sig - 1).split('e')
    return `${trimZeros(m)}e${Number(e)}`
  }
  // toPrecision switches to exponent notation for 1000 with sig = 3; going
  // through Number keeps the plain digits.
  return String(Number(x.toPrecision(sig)))
}

function trimZeros(s) {
  if (!s.includes('.')) return s
  return s.replace(/0+$/, '').replace(/\.$/, '')
}

export function texNum(x, sig = 4) {
  const s = fmt(x, sig)
  if (s === '∞') return '\\infty'
  if (s === '−∞') return '-\\infty'
  if (s.includes('e')) {
    const [m, e] = s.split('e')
    return `${m}\\times 10^{${e}}`
  }
  return s
}

// A literal wrapped in parentheses when it is negative, so that a substitution
// such as 2(-9.8) reads correctly.
export function texNumParen(x, sig = 4) {
  const s = texNum(x, sig)
  return x < 0 ? `(${s})` : s
}

// Typed input: fractions, either decimal separator, pi, sqrt and so on.
export function parseNumber(src) {
  const s = String(src ?? '').trim()
  if (!s) return { ok: true, empty: true, value: null }
  try {
    const p = parseExpr(s)
    if (!p.ok || p.vars.length) return { ok: false, value: null }
    const v = evaluate(p, {})
    return Number.isFinite(v) ? { ok: true, value: v } : { ok: false, value: null }
  } catch {
    return { ok: false, value: null }
  }
}

// ── Units ───────────────────────────────────────────────────────────────────

const DEG = Math.PI / 180

export const UNITS = {
  length: [
    { id: 'm', tex: '\\text{m}', f: 1 },
    { id: 'cm', tex: '\\text{cm}', f: 0.01 },
    { id: 'km', tex: '\\text{km}', f: 1000 },
    { id: 'ft', tex: '\\text{ft}', f: 0.3048 },
    { id: 'mi', tex: '\\text{mi}', f: 1609.344 },
  ],
  time: [
    { id: 's', tex: '\\text{s}', f: 1 },
    { id: 'min', tex: '\\text{min}', f: 60 },
    { id: 'h', tex: '\\text{h}', f: 3600 },
    { id: 'ms', tex: '\\text{ms}', f: 0.001 },
  ],
  velocity: [
    { id: 'm/s', tex: '\\text{m/s}', f: 1 },
    { id: 'km/h', tex: '\\text{km/h}', f: 1 / 3.6 },
    { id: 'cm/s', tex: '\\text{cm/s}', f: 0.01 },
    { id: 'mi/h', tex: '\\text{mi/h}', f: 0.44704 },
    { id: 'ft/s', tex: '\\text{ft/s}', f: 0.3048 },
  ],
  acceleration: [
    { id: 'm/s2', tex: '\\text{m/s}^2', f: 1 },
    { id: 'cm/s2', tex: '\\text{cm/s}^2', f: 0.01 },
    { id: 'ft/s2', tex: '\\text{ft/s}^2', f: 0.3048 },
    { id: 'km/h2', tex: '\\text{km/h}^2', f: 1000 / 3600 / 3600 },
  ],
  angle: [
    { id: 'deg', tex: '^\\circ', f: DEG },
    { id: 'rad', tex: '\\text{rad}', f: 1 },
    { id: 'rev', tex: '\\text{rev}', f: 2 * Math.PI },
  ],
  angularVelocity: [
    { id: 'rad/s', tex: '\\text{rad/s}', f: 1 },
    { id: 'rpm', tex: '\\text{rpm}', f: 2 * Math.PI / 60 },
    { id: 'rev/s', tex: '\\text{rev/s}', f: 2 * Math.PI },
    { id: 'deg/s', tex: '{}^\\circ\\text{/s}', f: DEG },
  ],
  angularAcceleration: [
    { id: 'rad/s2', tex: '\\text{rad/s}^2', f: 1 },
    { id: 'rev/s2', tex: '\\text{rev/s}^2', f: 2 * Math.PI },
    { id: 'rpm/s', tex: '\\text{rpm/s}', f: 2 * Math.PI / 60 },
  ],
  frequency: [
    { id: 'Hz', tex: '\\text{Hz}', f: 1 },
    { id: 'rpm', tex: '\\text{rpm}', f: 1 / 60 },
  ],
  mass: [
    { id: 'kg', tex: '\\text{kg}', f: 1 },
    { id: 'g', tex: '\\text{g}', f: 0.001 },
  ],
  force: [
    { id: 'N', tex: '\\text{N}', f: 1 },
    { id: 'kgf', tex: '\\text{kgf}', f: 9.8 },
    { id: 'lb', tex: '\\text{lb}', f: 4.448 },
  ],
  count: [{ id: 'rev', tex: '\\text{vueltas}', f: 1 }],
  none: [{ id: '', tex: '', f: 1 }],
}

export function unitsOf(dim) {
  return UNITS[dim] || UNITS.none
}

export function unitOf(dim, id) {
  const list = unitsOf(dim)
  return list.find(u => u.id === id) || list[0]
}

// The count unit is the only one whose label is a word.
export function unitTex(dim, id) {
  if (dim === 'count') return `\\text{${t('common.units.turns', 'turns')}}`
  return unitOf(dim, id).tex
}

export const toSI = (value, dim, id) => value * unitOf(dim, id).f
export const fromSI = (value, dim, id) => value / unitOf(dim, id).f

// "(9.8 m/s²)" style substitution with the unit inside the parentheses.
export function texQty(value, dim, id) {
  const u = unitTex(dim, id ?? unitsOf(dim)[0].id)
  const n = texNum(fromSI(value, dim, id ?? unitsOf(dim)[0].id))
  return u ? `${n}\\,${u}` : n
}

// ── Gravity, shared by every page ───────────────────────────────────────────

const G_KEY = 'mx-gravity'
const gListeners = new Set()

export const Gravity = {
  get() {
    try {
      const v = Number(localStorage.getItem(G_KEY))
      return v > 0 ? v : 9.8
    } catch {
      return 9.8
    }
  },
  set(v) {
    try { localStorage.setItem(G_KEY, String(v)) } catch {}
    gListeners.forEach(cb => cb(v))
  },
  on(cb) { gListeners.add(cb) },
}

// ── KaTeX ───────────────────────────────────────────────────────────────────

export function tex(src, display = false) {
  if (typeof window === 'undefined' || !window.katex) return `<code>${escapeHtml(src)}</code>`
  try {
    return window.katex.renderToString(src, { throwOnError: false, displayMode: display, strict: false })
  } catch {
    return `<code>${escapeHtml(src)}</code>`
  }
}

export function whenKatex() {
  return new Promise(resolve => {
    if (window.katex) return resolve()
    const tick = () => (window.katex ? resolve() : setTimeout(tick, 40))
    tick()
  })
}

// Prose with \( … \) inline math, as stored in the dictionaries.
export function renderMath(el) {
  if (window.renderMathInElement) {
    window.renderMathInElement(el, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    })
  }
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// ── DOM ─────────────────────────────────────────────────────────────────────

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue
    if (k === 'class') el.className = v
    else if (k === 'html') el.innerHTML = v
    else if (k === 'text') el.textContent = v
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v)
    else if (k === 'dataset') Object.assign(el.dataset, v)
    else el.setAttribute(k, v === true ? '' : v)
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue
    el.append(c instanceof Node ? c : document.createTextNode(String(c)))
  }
  return el
}

export function debounce(fn, ms = 120) {
  let id = 0
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(() => fn(...args), ms)
  }
}

export function onLangChange(cb) {
  window.addEventListener('langchanged', () => cb(lang()))
}

// ── Palette ─────────────────────────────────────────────────────────────────

const cssVar = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

// getComputedStyle hands back the relative-colour expression verbatim for a
// custom property; resolving it through a probe's `color` yields something the
// canvas understands.
let probe = null
const resolveColor = expr => {
  if (!probe) {
    probe = document.createElement('span')
    probe.style.display = 'none'
    document.body.append(probe)
  }
  probe.style.color = ''
  probe.style.color = expr
  return getComputedStyle(probe).color || expr
}

export function readPalette() {
  const primary = cssVar('--color-primary', '#008888')
  return {
    primary: resolveColor(primary),
    text: resolveColor(cssVar('--color-text', '#000000')),
    bg: resolveColor(cssVar('--color-bg', '#ffffff')),
    muted: resolveColor(cssVar('--color-muted', '#888888')),
    second: resolveColor(`oklch(from ${primary} l c calc(h + 140))`),
    third: resolveColor(`oklch(from ${primary} l c calc(h - 130))`),
    fourth: resolveColor(`oklch(from ${primary} calc(l + 0.05) c calc(h + 70))`),
    soft: resolveColor(`color-mix(in srgb, ${primary} 14%, transparent)`),
    grid: resolveColor(`color-mix(in srgb, ${cssVar('--color-muted', '#888888')} 22%, transparent)`),
  }
}

export function watchPalette(cb) {
  const refresh = () => cb(readPalette())
  new MutationObserver(refresh).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'data-theme'],
  })
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh)
}

// ── Canvas sizing ───────────────────────────────────────────────────────────

export function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = canvas.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const hgt = Math.max(1, Math.round(rect.height))
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(hgt * dpr)) {
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(hgt * dpr)
  }
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { ctx, w, h: hgt, dpr }
}

export const LABEL_FONT = 'ComputerModern, "Times New Roman", serif'
export const UI_FONT = 'ProductSans, system-ui, sans-serif'
