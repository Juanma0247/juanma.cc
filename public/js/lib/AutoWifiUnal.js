const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`pd.autowifiunal.${key}`, fallback) : fallback

const fill = (text, vars) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), text)

const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
}

const loadScript = src => new Promise((resolve, reject) => {
  const s = document.createElement('script')
  s.src = src
  s.async = true
  s.onload = resolve
  s.onerror = reject
  document.head.appendChild(s)
})

const HLJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js'
const QR_URL = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'
const STORE_PROGRESS = 'p21-progress'
const STORE_PHONE = 'p21-phone'
const TOTAL_STEPS = 6

// Line ranges (1-based, inclusive) of each explained block, matched to the
// published files, whose SHA-256 pins their exact content.
const FILES = {
  instalar: {
    name: 'instalar.sh',
    lang: 'bash',
    sha: 'e50397f301c965b166d6578e995356ceb88479351b3093afd359135347694a25',
    blocks: [
      [1, 1, 'inShebang'], [3, 3, 'inSetE'], [5, 5, 'inOrigin'], [7, 8, 'inFind'],
      [10, 14, 'inMissing'], [16, 18, 'inStage1'], [20, 21, 'inStage2'], [23, 25, 'inStage3'],
      [27, 32, 'inStage4'], [34, 41, 'inStage5'], [43, 46, 'inStage6'], [48, 50, 'inEnd'],
    ],
  },
  unal: {
    name: 'unal.sh',
    lang: 'bash',
    sha: 'c76b855c7dfc09335136e55e8b3c3ddf549733cd2d30633882a2e79a4c70efbe',
    blocks: [
      [1, 1, 'shShebang'], [3, 7, 'shCred'], [9, 9, 'shExport'], [11, 11, 'shSleep'], [13, 13, 'shRun'],
    ],
  },
  login: {
    name: 'unal_wifi_login.py',
    lang: 'python',
    sha: '84a31e1112e1d6833b6c2b8a93661eb70cf72c0a936f9fa87aa32f428855a791',
    blocks: [
      [1, 1, 'pyShebang'], [3, 13, 'pyImports'], [15, 15, 'pyWarnings'], [17, 28, 'pyConfig'],
      [31, 38, 'pyLog'], [41, 42, 'pyStop'], [45, 51, 'pyAdapter'], [54, 71, 'pySession'],
      [74, 79, 'pyInternet'], [82, 84, 'pyAllowed'], [87, 94, 'pyRequest'], [97, 108, 'pyFind'],
      [111, 122, 'pyForm'], [125, 130, 'pyDebug'], [133, 173, 'pyPass'], [176, 200, 'pyMain'],
      [203, 204, 'pyEntry'],
    ],
  },
}

// Device models as reported by Client Hints or the user agent. Only confident
// prefixes are mapped; anything else keeps the generic instructions.
const BRAND_PATTERNS = [
  ['samsung', /^SM-|galaxy|samsung/i],
  ['stock', /^pixel|^moto|motorola|^XT\d{4}|nokia|^TA-\d{4}/i],
  ['xiaomi', /xiaomi|redmi|poco|^mi\s|^M\d{4}J|^2\d{3}[0-9A-Z]{4,}$/i],
  ['oppo', /oneplus|^CPH\d{4}|^RMX\d{4}|^(IN|LE|KB|NE|PH[A-Z]|PJ[A-Z])\d{3,}/i],
  ['huawei', /huawei|honor|^[A-Z]{3}-[A-Z]{1,3}\d{1,2}[A-Z]?$/i],
]

const versionCategory = v => (v >= 10 ? '10' : v >= 8 ? '8' : v === 7 ? '7' : '6')

const qrSvg = qr => {
  const n = qr.getModuleCount()
  const m = 2
  let d = ''
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`
  }
  return `<svg viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" shape-rendering="crispEdges"><path d="${d}"/></svg>`
}

class AutoWifiUnal {
  constructor() {
    this.root = document.getElementById('p21Root')
    this.base = this.root?.dataset.base || '/scripts/autowifiunal'
    this.tip = document.getElementById('p21Tip')
    this.tipBody = this.tip?.querySelector('.p21TipBody')
    this.live = document.getElementById('p21Live')
    this.activeTip = null
    this.phone = { brand: 'other', version: '10' }
    this.device = ''
    this.done = new Set()
    this.files = {}
    this.viewer = { file: 'login', mode: 'explained' }
    this.renderToken = 0
    this.smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  main() {
    if (!this.root) return
    this.initTips()
    this.initCopy()
    this.initPhone()
    this.initProgress()
    this.initTabs()
    this.initFiles()
    this.initTrouble()
    window.addEventListener('langchanged', () => this.onLangChanged())
  }

  scrollTo(el) {
    el.scrollIntoView({ behavior: this.smooth ? 'smooth' : 'auto', block: 'start' })
  }

  announce(msg) {
    if (!this.live) return
    this.live.textContent = ''
    requestAnimationFrame(() => { this.live.textContent = msg })
  }

  // ── "?" toggletips ─────────────────────────────────────────

  initTips() {
    if (!this.tip) return
    document.body.appendChild(this.tip)

    this.root.addEventListener('click', e => {
      const btn = e.target.closest('.p21Q')
      if (!btn) return
      e.preventDefault()
      if (this.activeTip === btn) this.closeTip()
      else this.openTip(btn)
    })

    this.tip.querySelector('.p21TipClose').addEventListener('click', () => this.closeTip(true))

    document.addEventListener('click', e => {
      if (!this.activeTip) return
      if (this.tip.contains(e.target) || e.target.closest('.p21Q')) return
      this.closeTip()
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.activeTip) this.closeTip(true)
    })

    window.addEventListener('resize', () => { if (this.activeTip) this.placeTip() })
  }

  openTip(btn) {
    this.closeTip()
    this.activeTip = btn
    btn.setAttribute('aria-expanded', 'true')
    btn.classList.add('is-open')
    this.tipBody.innerHTML = t(btn.dataset.tip, '')
    this.tip.hidden = false
    this.placeTip()
  }

  placeTip() {
    const r = this.activeTip.getBoundingClientRect()
    if (!r.width) { this.closeTip(); return }
    const gutter = 16
    const gap = 10
    const w = this.tip.offsetWidth
    const h = this.tip.offsetHeight
    const vw = document.documentElement.clientWidth
    const left = Math.max(gutter, Math.min(r.left + r.width / 2 - w / 2, vw - w - gutter))
    let top = r.bottom + gap
    const above = top + h > window.innerHeight - gutter && r.top - gap - h > gutter
    if (above) top = r.top - gap - h
    this.tip.style.left = `${left + window.scrollX}px`
    this.tip.style.top = `${top + window.scrollY}px`
    this.tip.classList.toggle('is-above', above)
    const arrow = Math.max(14, Math.min(r.left + r.width / 2 - left, w - 14))
    this.tip.style.setProperty('--arrow-x', `${arrow}px`)
  }

  closeTip(returnFocus = false) {
    const btn = this.activeTip
    if (!btn) return
    btn.setAttribute('aria-expanded', 'false')
    btn.classList.remove('is-open')
    this.tip.hidden = true
    this.activeTip = null
    if (returnFocus) btn.focus()
  }

  // ── Copy buttons ──────────────────────────────────────────

  initCopy() {
    this.root.addEventListener('click', async e => {
      const btn = e.target.closest('[data-copy]')
      if (!btn) return
      const code = btn.closest('.p21Cmd')?.querySelector('.p21CmdCode')
      if (!code) return
      await this.copyText(code.textContent)
      btn.classList.add('is-copied')
      clearTimeout(btn.copyTimer)
      btn.copyTimer = setTimeout(() => btn.classList.remove('is-copied'), 1400)
    })
  }

  async copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      try { document.execCommand('copy') } catch {}
      area.remove()
    }
    this.announce(t('copied', 'Copied!'))
  }

  // ── Phone brand and Android version ───────────────────────

  initPhone() {
    this.brandSel = document.getElementById('p21Brand')
    this.versionSel = document.getElementById('p21Version')
    this.detectedEl = document.getElementById('p21Detected')
    this.unsupportedEl = document.getElementById('p21Unsupported')

    const saved = store.get(STORE_PHONE)
    if (saved?.brand) this.phone.brand = saved.brand
    if (saved?.version) this.phone.version = saved.version
    this.applyPhone()

    this.brandSel.addEventListener('change', () => {
      this.phone.brand = this.brandSel.value
      store.set(STORE_PHONE, this.phone)
      this.applyPhone()
    })
    this.versionSel.addEventListener('change', () => {
      this.phone.version = this.versionSel.value
      store.set(STORE_PHONE, this.phone)
      this.applyPhone()
    })

    this.detectDevice(!saved)
  }

  applyPhone() {
    const { brand, version } = this.phone
    this.brandSel.value = brand
    this.versionSel.value = version
    this.root.querySelectorAll('[data-brand]').forEach(el => {
      el.hidden = !el.dataset.brand.split(' ').includes(brand)
    })
    this.root.querySelectorAll('[data-av]').forEach(el => {
      el.hidden = !el.dataset.av.split(' ').includes(version)
    })
    this.unsupportedEl.hidden = version !== '6'
  }

  async detectDevice(applyDetected) {
    const ua = navigator.userAgent || ''
    const isIos = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (isIos) {
      document.getElementById('p21Ios').hidden = false
      return
    }
    if (!/Android/i.test(ua)) {
      this.showDesktop()
      return
    }

    let model = ''
    let version = 0
    try {
      const uaData = navigator.userAgentData
      if (uaData?.getHighEntropyValues && /android/i.test(uaData.platform || '')) {
        const hints = await uaData.getHighEntropyValues(['model', 'platformVersion'])
        model = (hints.model || '').trim()
        version = parseInt(hints.platformVersion, 10) || 0
      }
    } catch {}

    // Chrome's reduced user agent freezes every phone to "Android 10; K",
    // so the user agent is only trusted when it is not that placeholder.
    const m = ua.match(/Android (\d+)[^;)]*;\s*([^;)]+)/)
    if (m) {
      const uaModel = m[2].replace(/\s*Build\/.*$/, '').trim()
      const frozen = uaModel === 'K'
      if (!version && !frozen) version = parseInt(m[1], 10)
      if (!model && !frozen && !/^(mobile|tablet|wv)$/i.test(uaModel)) model = uaModel
    }

    const parts = []
    if (model) parts.push(model)
    if (version) parts.push(`Android ${version}`)
    if (!parts.length) return
    this.device = parts.join(' · ')
    this.renderDetected()

    if (!applyDetected) return
    const brand = BRAND_PATTERNS.find(([, re]) => re.test(model))?.[0]
    if (brand) this.phone.brand = brand
    if (version) this.phone.version = versionCategory(version)
    this.applyPhone()
  }

  renderDetected() {
    if (!this.device) return
    const text = t('detected', 'Detected on this device: {device}. Change it if it is not right.')
    this.detectedEl.textContent = fill(text, { device: this.device })
    this.detectedEl.hidden = false
  }

  async showDesktop() {
    const banner = document.getElementById('p21Desktop')
    const box = document.getElementById('p21Qr')
    banner.hidden = false
    try {
      await loadScript(QR_URL)
      const qr = window.qrcode(0, 'M')
      qr.addData(location.origin + location.pathname)
      qr.make()
      box.innerHTML = qrSvg(qr)
    } catch {
      box.hidden = true
    }
  }

  // ── Steps and progress ────────────────────────────────────

  initProgress() {
    this.steps = [...this.root.querySelectorAll('.p21Step')]
    this.navLinks = [...this.root.querySelectorAll('[data-goto]')]

    const saved = store.get(STORE_PROGRESS)
    if (Array.isArray(saved)) saved.forEach(n => this.done.add(Number(n)))

    this.root.querySelectorAll('[data-done]').forEach(box => {
      const n = Number(box.dataset.done)
      box.checked = this.done.has(n)
      box.addEventListener('change', () => this.setDone(n, box.checked))
    })

    this.steps.forEach(step => {
      if (this.done.has(Number(step.dataset.step))) step.open = false
    })

    this.navLinks.forEach(link => link.addEventListener('click', () => {
      const step = document.getElementById(`p21Step${link.dataset.goto}`)
      if (step) step.open = true
    }))

    document.getElementById('p21Reset').addEventListener('click', () => {
      this.done.clear()
      store.set(STORE_PROGRESS, [])
      this.root.querySelectorAll('[data-done]').forEach(box => { box.checked = false })
      this.steps.forEach(step => { step.open = true })
      this.renderProgress()
      this.scrollTo(this.steps[0])
    })

    const openFromHash = () => {
      const target = location.hash ? document.getElementById(location.hash.slice(1)) : null
      if (target?.classList.contains('p21Step')) target.open = true
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)

    this.renderProgress()
    this.initScrollSpy()
  }

  setDone(n, isDone) {
    if (isDone) this.done.add(n)
    else this.done.delete(n)
    store.set(STORE_PROGRESS, [...this.done])
    this.renderProgress()
    if (!isDone) return

    document.getElementById(`p21Step${n}`).open = false
    const next = this.steps.find(s => !this.done.has(Number(s.dataset.step)))
    if (next) {
      next.open = true
      this.scrollTo(next)
    } else {
      this.scrollTo(document.getElementById('p21AllDone'))
    }
  }

  renderProgress() {
    const count = this.done.size
    const text = t('progressCount', '{done} of {total} steps')
    document.getElementById('p21ProgressCount').textContent = fill(text, { done: count, total: TOTAL_STEPS })
    document.getElementById('p21BarFill').style.width = `${(count / TOTAL_STEPS) * 100}%`
    this.navLinks.forEach(link => link.classList.toggle('is-done', this.done.has(Number(link.dataset.goto))))
    this.steps.forEach(step => step.classList.toggle('is-done', this.done.has(Number(step.dataset.step))))
    document.getElementById('p21AllDone').hidden = count < TOTAL_STEPS
  }

  initScrollSpy() {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        this.navLinks.forEach(link => {
          link.classList.toggle('is-current', link.dataset.goto === entry.target.dataset.step)
        })
      })
    }, { rootMargin: '-30% 0px -60% 0px' })
    this.steps.forEach(step => io.observe(step))
  }

  // ── Install tabs ──────────────────────────────────────────

  initTabs() {
    const tabs = [...this.root.querySelectorAll('.p21Tab')]
    const select = tab => {
      tabs.forEach(other => {
        const on = other === tab
        other.setAttribute('aria-selected', String(on))
        other.tabIndex = on ? 0 : -1
        document.getElementById(other.getAttribute('aria-controls')).hidden = !on
      })
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab))
      tab.addEventListener('keydown', e => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
        if (!dir) return
        e.preventDefault()
        const next = tabs[(i + dir + tabs.length) % tabs.length]
        select(next)
        next.focus()
      })
    })
  }

  // ── Files: fingerprints, downloads and the code viewer ────

  initFiles() {
    this.viewerEl = document.getElementById('p21Viewer')
    this.viewerBody = document.getElementById('p21ViewerBody')

    this.root.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => this.openViewer(btn.dataset.view))
    })

    document.getElementById('p21ViewerFiles').addEventListener('click', e => {
      const btn = e.target.closest('[data-file]')
      if (btn) this.showFile(btn.dataset.file)
    })

    document.getElementById('p21ViewerModes').addEventListener('click', e => {
      const btn = e.target.closest('[data-mode]')
      if (!btn) return
      this.viewer.mode = btn.dataset.mode
      this.renderViewer()
    })

    const copyBtn = document.getElementById('p21ViewerCopy')
    copyBtn.addEventListener('click', async () => {
      const { text } = await this.loadFile(this.viewer.file)
      await this.copyText(text)
      const label = copyBtn.querySelector('[data-i18n]')
      label.textContent = t('copied', 'Copied!')
      clearTimeout(copyBtn.copyTimer)
      copyBtn.copyTimer = setTimeout(() => { label.textContent = t('copy', 'Copy') }, 1400)
    })

    document.getElementById('p21DownloadAll').addEventListener('click', () => this.downloadAll())

    const section = document.getElementById('p21Files')
    if (!('IntersectionObserver' in window)) {
      this.verifyHashes()
      return
    }
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return
      io.disconnect()
      this.verifyHashes()
    }, { rootMargin: '300px 0px' })
    io.observe(section)
  }

  loadFile(id) {
    if (!this.files[id]) {
      this.files[id] = fetch(`${this.base}/${FILES[id].name}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.arrayBuffer()
        })
        .then(buf => ({ buf, text: new TextDecoder().decode(buf) }))
        .catch(err => {
          delete this.files[id]
          throw err
        })
    }
    return this.files[id]
  }

  loadHljs() {
    if (!this.hljs) this.hljs = import(HLJS_URL).then(m => m.default).catch(() => null)
    return this.hljs
  }

  async verifyHashes() {
    if (!window.crypto?.subtle) return
    for (const [id, f] of Object.entries(FILES)) {
      try {
        const { buf } = await this.loadFile(id)
        const digest = await crypto.subtle.digest('SHA-256', buf)
        const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
        const ok = hex === f.sha
        this.root.querySelector(`[data-hash-for="${id}"]`).hidden = !ok
        this.root.querySelector(`[data-hash-bad-for="${id}"]`).hidden = ok
      } catch {}
    }
  }

  downloadAll() {
    Object.values(FILES).forEach((f, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = `${this.base}/${f.name}`
        a.download = f.name
        document.body.appendChild(a)
        a.click()
        a.remove()
      }, i * 700)
    })
  }

  openViewer(id) {
    this.viewerEl.hidden = false
    this.showFile(id)
    this.scrollTo(this.viewerEl)
  }

  showFile(id) {
    this.viewer.file = id
    const f = FILES[id]
    const dl = document.getElementById('p21ViewerDownload')
    dl.href = `${this.base}/${f.name}`
    dl.setAttribute('download', f.name)
    this.renderViewer()
  }

  async renderViewer() {
    const { file, mode } = this.viewer
    this.viewerEl.querySelectorAll('[data-file]').forEach(b => b.classList.toggle('is-active', b.dataset.file === file))
    this.viewerEl.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('is-active', b.dataset.mode === mode))

    const token = ++this.renderToken
    let text
    let hljs
    try {
      ;[{ text }, hljs] = await Promise.all([this.loadFile(file), this.loadHljs()])
    } catch {
      if (token !== this.renderToken) return
      this.viewerBody.innerHTML = `<p class="p21ViewerError" data-i18n="pd.autowifiunal.loadError">${t('loadError', 'The file could not be loaded. Try downloading it instead.')}</p>`
      return
    }
    if (token !== this.renderToken) return

    const f = FILES[file]
    const lines = text.replace(/\n$/, '').split('\n')
    const paint = code => (hljs
      ? hljs.highlight(code, { language: f.lang, ignoreIllegals: true }).value
      : escapeHtml(code))
    const lineLabel = (from, to) => {
      const key = from === to ? 'viewerLine' : 'viewerLines'
      const word = t(key, from === to ? 'Line' : 'Lines')
      return `<span data-i18n="pd.autowifiunal.${key}">${word}</span> ${from === to ? from : `${from}–${to}`}`
    }
    const pre = code => `<pre><code class="hljs language-${f.lang}">${paint(code)}</code></pre>`

    if (mode === 'code') {
      this.viewerBody.innerHTML = `<div class="p21CodeWhole">${pre(lines.join('\n'))}</div>`
    } else {
      this.viewerBody.innerHTML = f.blocks.map(([from, to, key]) => `
        <div class="p21Block">
          <div class="p21BlockCode">
            <span class="p21BlockLines">${lineLabel(from, to)}</span>
            ${pre(lines.slice(from - 1, to).join('\n'))}
          </div>
          <p class="p21BlockText" data-i18n="pd.autowifiunal.${key}">${t(key, '')}</p>
        </div>`).join('')
    }
    this.viewerBody.scrollTop = 0
  }

  // ── Troubleshooting search ────────────────────────────────

  initTrouble() {
    const input = document.getElementById('p21TroubleSearch')
    const items = [...this.root.querySelectorAll('[data-tr]')]
    const groups = [...this.root.querySelectorAll('[data-tr-group]')]
    const empty = document.getElementById('p21TroubleEmpty')
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

    this.runTroubleSearch = () => {
      const words = norm(input.value.trim()).split(/\s+/).filter(Boolean)
      let shown = 0
      items.forEach(item => {
        const text = norm(item.textContent)
        const match = words.every(w => text.includes(w))
        item.hidden = !match
        if (match) shown++
      })
      groups.forEach(g => { g.hidden = !g.querySelector('[data-tr]:not([hidden])') })
      empty.hidden = shown > 0
      if (words.length && shown <= 3) items.forEach(item => { if (!item.hidden) item.open = true })
    }

    input.addEventListener('input', this.runTroubleSearch)
  }

  onLangChanged() {
    if (this.activeTip) {
      this.tipBody.innerHTML = t(this.activeTip.dataset.tip, '')
      this.placeTip()
    }
    this.renderDetected()
    this.renderProgress()
    this.runTroubleSearch?.()
  }
}

export default AutoWifiUnal
