const t = (key, fallback) =>
  typeof window !== "undefined" && window.i18nGet ? window.i18nGet(`pd.regex.${key}`, fallback) : fallback

class RegularExpressions {
  constructor() {
    this.input           = document.getElementById("p14i1")
    this.result          = document.getElementById("p14r1")
    this.extraContainer  = document.getElementById("p14extraAlphabets")
    this.defaultAlphabet = "abcdefghijklmnopqrstvwxyz".split("")
    this.extraAlphabets  = {}
    this.previewTimer    = null
    this.MAX_STRINGS     = 200
    this.MAX_LEN         = 80
    this.REP             = 25
    this.VISIBLE         = 40
    this.ROTATE_MS       = 4000
    this.rotateTimer     = null
    this.allStrings      = []
    this.lastBatch       = []
  }

  getExtraAlphaValue(letter) {
    const inp = document.getElementById(`p14alpha_${letter}`)
    if (!inp || !inp.value.trim()) return []
    return inp.value.trim().split(/\s+/).filter(s => s.length > 0)
  }

  detectUppercase(expr) {
    const upper = []
    for (const ch of expr) {
      if (ch >= "A" && ch <= "Z" && !upper.includes(ch)) upper.push(ch)
    }
    return upper
  }

  ensureExtraInputs(uppers) {
    const existing = Array.from(
      this.extraContainer.querySelectorAll(".p14alpha-group")
    ).map(el => el.dataset.letter)

    const toRemove = existing.filter(l => !uppers.includes(l))
    toRemove.forEach(l => {
      const el = this.extraContainer.querySelector(`.p14alpha-group[data-letter="${l}"]`)
      if (el) el.remove()
    })

    uppers.forEach(l => {
      if (!this.extraContainer.querySelector(`.p14alpha-group[data-letter="${l}"]`)) {
        const div = document.createElement("div")
        div.className    = "field p14alpha-group"
        div.dataset.letter = l
        div.innerHTML    = `<input id="p14alpha_${l}" autocomplete="off" required="" value="" placeholder=" "><label class="field-label">${t("alphabetFor", "Alphabet for")} ${l}</label>`
        this.extraContainer.appendChild(div)
        document.getElementById(`p14alpha_${l}`)
          .addEventListener("input", () => this.schedulePreview())
      }
    })
  }

  tokenize(expr) {
    const tokens = []
    let i = 0
    while (i < expr.length) {
      const ch = expr[i]
      if (ch === "u")                                       { tokens.push({ type: "union"  }); i++; continue }
      if (ch === "*")                                       { tokens.push({ type: "star"   }); i++; continue }
      if (ch === "(" || ch === "{")                         { tokens.push({ type: "lparen" }); i++; continue }
      if (ch === ")" || ch === "}")                         { tokens.push({ type: "rparen" }); i++; continue }
      if (ch === ",")                                       { tokens.push({ type: "union"  }); i++; continue }
      if ((ch >= "0" && ch <= "z" && ch !== "u") ||
          (ch >= "A" && ch <= "Z"))                         { tokens.push({ type: "symbol", value: ch }); i++; continue }
      if (ch === "λ" || ch === "\\lambda")                  { tokens.push({ type: "lambda" }); i++; continue }
      if (ch === "∅")                                       { tokens.push({ type: "empty"  }); i++; continue }
      i++
    }
    return tokens
  }

  insertConcat(tokens) {
    const result  = []
    const isAtom  = t => ["symbol", "lambda", "empty", "rparen", "star"].includes(t.type)
    const isStart = t => ["symbol", "lambda", "empty", "lparen"].includes(t.type)
    for (let i = 0; i < tokens.length; i++) {
      result.push(tokens[i])
      if (i + 1 < tokens.length && isAtom(tokens[i]) && isStart(tokens[i + 1])) {
        result.push({ type: "concat" })
      }
    }
    return result
  }

  parse(tokens) {
    let pos = 0
    const peek    = () => tokens[pos]
    const consume = () => tokens[pos++]

    const parseExpr = () => {
      let left = parseTerm()
      while (peek() && peek().type === "union") {
        consume()
        const right = parseTerm()
        left = { type: "union", left, right }
      }
      return left
    }

    const parseTerm = () => {
      let left = parseFactor()
      while (peek() && peek().type === "concat") {
        consume()
        const right = parseFactor()
        left = { type: "concat", left, right }
      }
      return left
    }

    const parseFactor = () => {
      let base = parseAtom()
      while (peek() && peek().type === "star") {
        consume()
        base = { type: "star", child: base }
      }
      return base
    }

    const parseAtom = () => {
      const t = peek()
      if (!t)              return { type: "empty_set" }
      if (t.type === "lambda") { consume(); return { type: "lambda" } }
      if (t.type === "empty")  { consume(); return { type: "empty_set" } }
      if (t.type === "symbol") { consume(); return { type: "symbol", value: t.value } }
      if (t.type === "lparen") {
        consume()
        const inner = parseExpr()
        if (peek() && peek().type === "rparen") consume()
        return inner
      }
      consume()
      return { type: "empty_set" }
    }

    return parseExpr()
  }

  generateStrings(node, depth = 0) {
    if (depth > 50)          return new Set(["…"])
    if (!node)               return new Set()
    if (node.type === "empty_set") return new Set()
    if (node.type === "lambda")    return new Set(["λ"])

    if (node.type === "symbol") {
      const ch = node.value
      if (ch >= "A" && ch <= "Z") {
        const syms = this.getExtraAlphaValue(ch)
        return new Set(syms.length === 0 ? [ch] : syms)
      }
      return new Set([ch])
    }

    if (node.type === "union") {
      const l = this.generateStrings(node.left,  depth + 1)
      const r = this.generateStrings(node.right, depth + 1)
      return new Set([...l, ...r])
    }

    if (node.type === "concat") {
      const l   = this.generateStrings(node.left,  depth + 1)
      const r   = this.generateStrings(node.right, depth + 1)
      const res = new Set()
      for (const a of l) {
        for (const b of r) {
          const str = (a === "λ" ? "" : a) + (b === "λ" ? "" : b)
          res.add(str || "λ")
          if (res.size >= this.MAX_STRINGS) return res
        }
      }
      return res
    }

    if (node.type === "star") {
      const base    = this.generateStrings(node.child, depth + 1)
      const res     = new Set(["λ"])
      let current   = new Set([""])

      for (let rep = 1; rep <= this.REP; rep++) {
        const next = new Set()
        for (const prev of current) {
          for (const b of base) {
            const bs  = b === "λ" ? "" : b
            const str = prev + bs
            if (str.length <= this.MAX_LEN) {
              next.add(str)
              res.add(str || "λ")
            }
            if (res.size >= this.MAX_STRINGS) return res
          }
        }
        current = next
        if (current.size === 0) break
      }
      return res
    }

    return new Set()
  }

  nodeToHTML(node) {
    if (!node)                    return `<span class="p14-empty">∅</span>`
    if (node.type === "empty_set") return `<span class="p14-empty">∅</span>`
    if (node.type === "lambda")    return `<span class="p14-lambda">λ</span>`

    if (node.type === "symbol") {
      const ch = node.value
      if (ch >= "A" && ch <= "Z") {
        const syms = this.getExtraAlphaValue(ch)
        return `<span class="p14-symbol p14-upper" title="${t("customAlphabet", "Custom alphabet:")} ${syms.join(", ")}">${ch}</span>`
      }
      return `<span class="p14-symbol">${ch}</span>`
    }

    if (node.type === "union") {
      return `<span class="p14-op-wrap">
        <span class="p14-sub">${this.nodeToHTML(node.left)}</span>
        <span class="p14-op p14-union">∪</span>
        <span class="p14-sub">${this.nodeToHTML(node.right)}</span>
      </span>`
    }

    if (node.type === "concat") {
      return `<span class="p14-op-wrap">
        <span class="p14-sub">${this.nodeToHTML(node.left)}</span>
        <span class="p14-op p14-concat">·</span>
        <span class="p14-sub">${this.nodeToHTML(node.right)}</span>
      </span>`
    }

    if (node.type === "star") {
      return `<span class="p14-op-wrap">
        <span class="p14-sub p14-starred">${this.nodeToHTML(node.child)}</span>
        <span class="p14-op p14-star">*</span>
      </span>`
    }

    return ""
  }

  pickBatch(strings) {
    const pool = strings.length > this.VISIBLE
      ? strings.filter(s => !this.lastBatch.includes(s))
      : strings

    const source = pool.length >= Math.min(this.VISIBLE, strings.length)
      ? pool
      : strings

    const shuffled = [...source].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, this.VISIBLE)
  }

  startRotation(strings) {
    clearInterval(this.rotateTimer)

    const render = () => {
      const container = this.result.querySelector(".p14-strings")
      if (!container || strings.length === 0) return

      const batch = this.pickBatch(strings)
      this.lastBatch = batch

      const hasMore = strings.length > this.VISIBLE
      const items   = batch.map(s => `<span class="p14-str">${s}</span>`).join("")
      const ellipsis = hasMore
        ? `<span class="p14-str p14-hint">…</span>`
        : ""

      container.innerHTML = items + ellipsis
    }

    render()
    this.rotateTimer = setInterval(render, this.ROTATE_MS)
  }

  buildResult(expr) {
    clearInterval(this.rotateTimer)
    this.lastBatch = []

    if (!expr.trim()) {
      this.result.innerHTML = `<p class="p14-hint">${t("writeExpr", "Write a regular expression.")}</p>`
      return
    }

    const uppers = this.detectUppercase(expr)
    this.ensureExtraInputs(uppers)

    let tokens, ast
    try {
      tokens = this.tokenize(expr)
      tokens = this.insertConcat(tokens)
      ast    = this.parse(tokens)
    } catch (e) {
      this.result.innerHTML = `<p class="p14-error">${t("parseError", "Error parsing the expression.")}</p>`
      return
    }

    const strings = this.generateStrings(ast)
    const sortedStrings = [...strings].sort((a, b) => {
      const la = a === "λ" ? 0 : a.length
      const lb = b === "λ" ? 0 : b.length
      return la - lb || a.localeCompare(b)
    })

    this.allStrings = sortedStrings

    const structHTML = this.nodeToHTML(ast)

    this.result.innerHTML = `
      <div class="p14-section">
        <p class="p14-label">${t("exprStructure", "Expression structure:")}</p>
        <p class="p14-struct">${structHTML}</p>
      </div>
      <div class="p14-section">
        <p class="p14-label">${t("generatedStrings", "Generated strings:")}</p>
        <div class="p14-strings"></div>
      </div>
    `

    this.startRotation(sortedStrings)
  }

  schedulePreview() {
    clearTimeout(this.previewTimer)
    this.previewTimer = setTimeout(() => this.buildResult(this.input.value), 500)
  }

  main() {
    this.input.addEventListener("input", () => {
      const allowed = /[^a-zA-Z0-9(){},.* ]/g
      const cur = this.input.selectionStart
      this.input.value = this.input.value.replace(allowed, "")
      this.input.setSelectionRange(cur, cur)
      this.schedulePreview()
    })
    this.buildResult(this.input.value)
    window.addEventListener("langchanged", () => this.buildResult(this.input.value))
  }
}

export default RegularExpressions
