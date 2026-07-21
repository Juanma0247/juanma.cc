const t = (key, fallback) =>
  typeof window !== "undefined" && window.i18nGet ? window.i18nGet(`pd.sigmaStar.${key}`, fallback) : fallback

class SigmaStarEnum {
  constructor() {
    this.alphabetInput   = document.getElementById("p15alphabet")
    this.modeSelect      = document.getElementById("p15mode")
    this.queryInput      = document.getElementById("p15query")
    this.resultContainer = document.getElementById("p15r1")
    this.alphabet        = []
  }

  parseAlphabet(raw) {
    return raw.trim().split(/\s+/).filter(s => s.length > 0)
  }

  blockStart(k, sigma) {
    const q = sigma.length
    if (k === 0) return 0
    if (q === 1)  return k
    return Math.round((Math.pow(q, k) - 1) / (q - 1))
  }

  findK(n, sigma) {
    const q = sigma.length
    if (n === 0) return 0
    let k = 0
    while (this.blockStart(k + 1, sigma) <= n) k++
    return k
  }

  renderBlockStrip(sigma, activeK, activeN = null, maxBlocks = 6) {
    const q = sigma.length
    const rows = []

    for (let k = 0; k <= maxBlocks; k++) {
      const start  = this.blockStart(k, sigma)
      const count  = k === 0 ? 1 : Math.pow(q, k)
      const end    = start + count - 1
      const isActive = k === activeK

      const examples = []
      if (k === 0) {
        examples.push("λ")
      } else {
        const limit = Math.min(3, count)
        for (let p = 0; p < limit; p++) {
          let rem = p
          let str = ""
          for (let i = k - 1; i >= 0; i--) {
            const pow = Math.pow(q, i)
            const d   = Math.floor(rem / pow)
            str      += sigma[d] ?? "?"
            rem       = rem % pow
          }
          examples.push(str)
        }
        if (count > 3) examples.push("…")
      }

      let nLabel = ""
      if (isActive && activeN !== null) {
        nLabel = `n=${activeN}`
      }

      rows.push({ k, start, end, count, examples, isActive, nLabel })
    }

    const strips = rows.map(r => {
      const exStr    = r.examples.map(e =>
        `<span class="p15-bex ${r.isActive && e !== "…" ? "p15-bex--active" : ""}">${e}</span>`
      ).join("")
      const rangeStr = r.count === 1
        ? `[${r.start}]`
        : `[${r.start}…${r.end}]`

      return `
        <div class="p15-brow ${r.isActive ? "p15-brow--active" : ""}">
          <div class="p15-bcell p15-bcell--k">
            <span class="p15-bk-label">k=${r.k}</span>
            <span class="p15-bsize">${r.count === 1 ? t("sizeOne", "1 string") : `${r.count === Infinity ? "∞" : r.count} ${t("sizeMany", "strings")}`}</span>
          </div>
          <div class="p15-bcell p15-bcell--range">${rangeStr}${r.nLabel ? `<span class="p15-n-pin">← ${r.nLabel}</span>` : ""}</div>
          <div class="p15-bcell p15-bcell--examples">${exStr}</div>
        </div>`
    }).join("")

    return `
      <div class="p15-block-strip">
        <div class="p15-bheader">
          <span>${t("hBlock", "Block")}</span>
          <span>${t("hRange", "Index range")}</span>
          <span>${t("hFirst", "First strings")}</span>
        </div>
        ${strips}
        <div class="p15-brow p15-brow--dots">
          <div class="p15-bcell">⋮</div>
          <div class="p15-bcell">⋮</div>
          <div class="p15-bcell">⋮</div>
        </div>
      </div>`
  }

  nToString(n, sigma) {
    const q     = sigma.length
    const steps = []
    const k     = this.findK(n, sigma)
    const sk    = this.blockStart(k, sigma)
    const sk1   = this.blockStart(k + 1, sigma)
    const p     = n - sk

    const digits      = []
    const digitSteps  = []
    let rem = p
    for (let i = k - 1; i >= 0; i--) {
      const pow = Math.pow(q, i)
      const d   = Math.floor(rem / pow)
      digitSteps.push(`d_${k - i} = ⌊${rem}/${q}^${i}⌋ mod ${q} = ${d}  →  σ(${d}) = "${sigma[d]}"`)
      digits.push(d)
      rem = rem % pow
    }
    const symbols = digits.map(d => sigma[d])
    const result  = symbols.join("")

    steps.push({ label: t("lblResult", "Result"), value: result || "λ", highlight: true })
    steps.push({ label: t("lblInput", "Input"),  value: `n = ${n},  |Σ| = ${q},  Σ = {${sigma.join(", ")}}` })

    if (q === 1) {
      steps.push({
        label:  t("caseSigma1", "Case |Σ| = 1"),
        value:  `s(k) = k  →  k(n) = n = ${n}`,
        detail: t("detailRepeated", "The string is the only symbol repeated {n} times.").replaceAll("{n}", n)
      })
      const r = n === 0 ? "λ" : sigma[0].repeat(n)
      steps.push({ label: t("lblResult", "Result"), value: r, highlight: true })
      return { result: r, steps }
    }

    steps.push({
      label:  t("step1FindK", "Step 1 — find k(n)"),
      value:  `k(n) = ⌊ log_${q}(n·(${q}−1) + 1) ⌋ = ⌊ log_${q}(${n * (q - 1) + 1}) ⌋ = ${k}`,
      detail: `Verification: s( ${k} ) = ${sk} ≤ ${n} < ${sk1} = s( ${k + 1} )  ✓`,
      blockStrip: this.renderBlockStrip(sigma, k, n)
    })

    steps.push({
      label:  t("step2PosBlock", "Step 2 — position within block"),
      value:  `p(n) = n − s(k) = ${n} − ${sk} = ${p}`,
      detail: `Block k=${k} has ${q}^${k} = ${Math.pow(q, k)} strings (indices ${sk}…${sk1 - 1})`
    })

    if (k === 0) {
      steps.push({
        label:  t("step3EmptyString", "Step 3 — empty string"),
        value:  `k = 0  →  f(${n}) = λ`,
        detail: t("detailEmptyLambda", "The only string of length 0 is the empty string λ")
      })
      steps.push({ label: t("lblResult", "Result"), value: "λ", highlight: true })
      return { result: "λ", steps }
    }

    steps.push({
      label:  t("step3Convert", "Step 3 — convert p={p} to base {q} with {k} digit{s}").replaceAll("{p}", p).replaceAll("{q}", q).replaceAll("{k}", k).replaceAll("{s}", k > 1 ? "s" : ""),
      value:  digitSteps.join("\n"),
      detail: `Representation: [${digits.join(", ")}]`
    })

    steps.push({
      label: t("step4ApplySigma", "Step 4 — apply σ"),
      value: `f(${n}) = ${symbols.map((s, i) => `σ(${digits[i]})="${s}"`).join(" · ")} = "${result}"`
    })

    return { result: result || "λ", steps }
  }

  stringToN(alpha, sigma) {
    const q        = sigma.length
    const steps    = []
    const isLambda = alpha === "λ" || alpha === "" || alpha.toLowerCase() === "lambda"
    const str      = isLambda ? "" : alpha
    const k        = str.length
    const sk       = this.blockStart(k, sigma)
    const symbolMap = {}
    sigma.forEach((s, i) => { symbolMap[s] = i })
    let p = 0
    const digitSteps = []
    for (let i = 0; i < k; i++) {
      const d      = symbolMap[str[i]]
      const pow    = Math.pow(q, k - 1 - i)
      const contrib = d * pow
      digitSteps.push(`"${str[i]}" → σ⁻¹("${str[i]}") = ${d},  contribution = ${d}·${q}^${k - 1 - i} = ${contrib}`)
      p += contrib
    }
    const n = sk + p

    steps.push({ label: t("lblResult", "Result"), value: String(n), highlight: true })
    steps.push({ label: t("lblInput", "Input"),  value: `α = "${isLambda ? "λ" : str}",  |Σ| = ${q},  Σ = {${sigma.join(", ")}}` })

    for (const ch of str) {
      if (!sigma.includes(ch)) {
        return {
          result: null,
          steps: [...steps, {
            label: t("lblError", "Error"),
            value: t("symbolNotInSigma", 'Symbol "{ch}" does not belong to alphabet Σ').replaceAll("{ch}", ch),
            error: true
          }]
        }
      }
    }

    if (q === 1) {
      steps.push({
        label:  t("caseSigma1", "Case |Σ| = 1"),
        value:  `f⁻¹(α) = length(α) = ${k}`,
        detail: t("caseSingle", "With a single symbol, the index is simply the length.")
      })
      steps.push({ label: t("lblResult", "Result"), value: String(k), highlight: true })
      return { result: k, steps }
    }

    steps.push({
      label:  t("step1Length", "Step 1 — length k"),
      value:  `k = |α| = ${k}`,
      detail: t("detailStringLength", "The string has length {k}").replaceAll("{k}", k)
    })

    if (k === 0) {
      steps.push({
        label:  t("step2EmptyString", "Step 2 — empty string"),
        value:  `α = λ  →  f⁻¹(λ) = 0`,
        detail: t("detailEmptyIdx0", "The empty string always has index 0")
      })
      steps.push({
        label:       t("blocksOfSigma", "Blocks of Σ*"),
        value:       "",
        blockStrip:  this.renderBlockStrip(sigma, 0, 0),
        noNum:       true
      })
      steps.push({ label: t("lblResult", "Result"), value: "0", highlight: true })
      return { result: 0, steps }
    }

    if (q > 1) {
      steps.push({
        label:  t("step2BlockStart", "Step 2 — block start s(k)"),
        value:  `s(${k}) = (${q}^${k} − 1) / (${q} − 1) = (${Math.pow(q, k)} − 1) / ${q - 1} = ${sk}`,
        detail: t("detailBlockStart", "The block of strings of length {k} starts at index {sk}").replaceAll("{k}", k).replaceAll("{sk}", sk),
        blockStrip: this.renderBlockStrip(sigma, k, n)
      })
    }

    steps.push({
      label:  t("step3LexPos", "Step 3 — lexicographic position p(α)"),
      value:  digitSteps.join("\n"),
      detail: `p = ${p}  (interpreting the string as a number in base ${q})`
    })

    steps.push({
      label: t("step4FinalIdx", "Step 4 — final index"),
      value: `f⁻¹(α) = s(${k}) + p(α) = ${sk} + ${p} = ${n}`
    })

    return { result: n, steps }
  }

  renderSteps(steps, mode) {
    const stepsHTML = steps.map((step, i) => {
      if (step.highlight) {
        return `<div class="p15-result-step">
          <span class="p15-step-label p15-final-label">${step.label}</span>
          <span class="p15-final-value">${step.value}</span>
        </div>`
      }
      if (step.error) {
        return `<div class="p15-step p15-step-error">
          <span class="p15-step-label">${step.label}</span>
          <span class="p15-step-value">${step.value}</span>
        </div>`
      }

      const valueLines = step.value
        ? step.value.split("\n").map(l => `<span class="p15-line">${l}</span>`).join("")
        : ""

      const stripHTML = step.blockStrip
        ? `<div class="p15-strip-wrap">${step.blockStrip}</div>`
        : ""

      const numBadge = step.noNum
        ? ""
        : `<span class="p15-step-num">${i}</span>`

      return `<div class="p15-step" style="animation-delay:${i * 0.07}s">
        <div class="p15-step-header">
          ${numBadge}
          <span class="p15-step-label">${step.label}</span>
        </div>
        <div class="p15-step-body">
          ${valueLines ? `<div class="p15-step-value">${valueLines}</div>` : ""}
          ${step.detail ? `<div class="p15-step-detail">${step.detail}</div>` : ""}
          ${stripHTML}
        </div>
      </div>`
    }).join("")

    return stepsHTML
  }

  buildResult() {
    const raw   = this.alphabetInput.value
    const mode  = this.modeSelect.value
    const query = this.queryInput.value.trim()

    if (!raw.trim()) {
      this.resultContainer.innerHTML = `<p class="p15-hint">${t("hintDefineAlphabet", "Define the alphabet Σ first.")}</p>`
      return
    }
    const sigma = this.parseAlphabet(raw)
    if (sigma.length === 0) {
      this.resultContainer.innerHTML = `<p class="p15-hint">${t("hintEmptyAlphabet", "The alphabet cannot be empty.")}</p>`
      return
    }
    if (!query) {
      const what = mode === "n2s" ? t("hintEnterN", "a natural number n") : t("hintEnterAlpha", "a string α")
      this.resultContainer.innerHTML = `<p class="p15-hint">${t("enterWord", "Enter")} ${what}.</p>`
      return
    }

    let data
    if (mode === "n2s") {
      const n = parseInt(query, 10)
      if (isNaN(n) || n < 0) {
        this.resultContainer.innerHTML = `<p class="p15-hint">${t("hintNonNeg", "Enter a non-negative integer.")}</p>`
        return
      }
      data = this.nToString(n, sigma)
    } else {
      data = this.stringToN(query, sigma)
    }

    this.resultContainer.innerHTML = this.renderSteps(data.steps, mode)
  }

  updatePlaceholder() {
    const mode = this.modeSelect.value
    const lbl  = document.getElementById("p15queryLabel")
    if (lbl) lbl.textContent = mode === "n2s" ? t("labelNumberN", "Number n ∈ ℕ") : t("labelStringAlpha", "String α ∈ Σ*")
    const what = mode === "n2s" ? t("enterToSeeNum", "a number") : t("enterToSeeStr", "a string")
    this.resultContainer.innerHTML = `<p class="p15-hint">${t("enterWord", "Enter")} ${what} ${t("enterToSeeSuffix", "to see the process.")}</p>`
  }

  main() {
    this.alphabetInput.addEventListener("input", () => this.buildResult())
    this.modeSelect.addEventListener("change",  () => this.updatePlaceholder())
    this.queryInput.addEventListener("input",   () => this.buildResult())
    this.updatePlaceholder()
    window.addEventListener("langchanged", () => {
      const q = this.queryInput.value.trim()
      if (q) this.buildResult(); else this.updatePlaceholder()
    })
  }
}

export default SigmaStarEnum
