class RecursiveConcat {
  constructor() {
    this.inputAlpha   = document.getElementById("p16iAlpha")
    this.inputBeta    = document.getElementById("p16iBeta")
    this.result       = document.getElementById("p16r1")
    this.previewTimer = null
    this.stepInterval = null
    this.STEP_MS      = 8000
    this.steps        = []
    this.currentStep  = 0
  }

  buildSteps(alpha, beta) {
    const steps = []

    if (beta.length === 0) {
      steps.push({
        type:   "base",
        alpha,
        beta:   "λ",
        gamma:  null,
        a:      null,
        result: alpha || "λ",
        desc:   `Base case: β = λ, so α·β = α`,
      })
      return steps
    }

    let current = beta
    while (current.length > 0) {
      const a     = current[current.length - 1]
      const gamma = current.slice(0, -1)
      const gammaLabel = gamma.length === 0 ? "λ" : gamma

      steps.push({
        type:   gamma.length === 0 ? "base_reached" : "recursive",
        alpha,
        beta:   current,
        gamma:  gammaLabel,
        a,
        result: alpha + current,
        desc:   gamma.length === 0
          ? `γ = λ → base case reached: α·λ = α, then '${a}' is appended`
          : `β = γ·'${a}' → recursive step: α·β = α·(γ${a}) = (α·γ)${a}`,
      })

      current = gamma === "λ" ? "" : gamma
    }

    steps.push({
      type:   "result",
      alpha,
      beta,
      gamma:  null,
      a:      null,
      result: alpha + beta,
      desc:   `Full concatenation: α·β = "${alpha + beta || "λ"}"`,
    })

    return steps
  }

  colorString(str, step) {
    if (!str || str === "λ") return `<span class="p16-lambda">λ</span>`
    const aLen     = step.alpha.length
    const gLen     = (step.gamma && step.gamma !== "λ") ? step.gamma.length : 0

    return str.split("").map((ch, i) => {
      if (i < aLen)                        return `<span class="p16-c-alpha">${ch}</span>`
      if (i < aLen + gLen)                 return `<span class="p16-c-gamma">${ch}</span>`
      if (step.a && i === aLen + gLen)     return `<span class="p16-c-a">${ch}</span>`
      return `<span class="p16-c-rest">${ch}</span>`
    }).join("")
  }

  colorFormula(step) {
    const α = `<span class="p16-c-alpha">α</span>`
    const β = `<span class="p16-c-beta">β</span>`
    const γ = `<span class="p16-c-gamma">γ</span>`
    const a = step.a ? `<span class="p16-c-a">'${step.a}'</span>` : `<span class="p16-c-a">a</span>`
    const R = `<span class="p16-c-result">${step.result || "λ"}</span>`

    if (step.type === "base")         return `${α}·λ = ${α}`
    if (step.type === "base_reached") return `${α}·(λ·${a}) = (${α}·λ)${a} = ${α}${a}`
    if (step.type === "recursive")    return `${α}·${β} = ${α}·(${γ}${a}) = (${α}·${γ})${a}`
    if (step.type === "result")       return `${α}·${β} = ${R}`
    return ""
  }

  renderStep(step, index, total) {
    const isResult = step.type === "result"
    const isBase   = step.type === "base" || step.type === "base_reached"

    const legend = [
      { cls: "p16-c-alpha", label: `α = "${step.alpha || "λ"}"` },
      step.gamma !== null
        ? { cls: "p16-c-gamma", label: `γ = "${step.gamma}"` }
        : null,
      step.a !== null
        ? { cls: "p16-c-a", label: `a = '${step.a}'` }
        : null,
      { cls: "p16-c-beta", label: `β = "${step.beta || "λ"}"` },
    ].filter(Boolean)

    const pct = Math.round(((index + 1) / total) * 100)

    return `
      <div class="p16-step p16-step--enter ${isResult ? "p16-step--result" : ""} ${isBase ? "p16-step--base" : ""}">

        <div class="p16-step-head">
          <span class="p16-badge ${isResult ? "p16-badge--ok" : isBase ? "p16-badge--base" : "p16-badge--rec"}">
            ${isResult ? "✓" : isBase ? "B" : "R"}
          </span>
          <span class="p16-step-type">
            ${isResult ? "Final result" : isBase ? "Base case" : "Recursive step"}
          </span>
          <span class="p16-step-counter">${index + 1} / ${total}</span>
        </div>

        <div class="p16-legend">
          ${legend.map(l => `
            <span class="p16-legend-item">
              <span class="p16-dot-color ${l.cls}"></span>
              <code class="p16-legend-val">${l.label}</code>
            </span>
          `).join("")}
        </div>

        <div class="p16-strings-row">
          <div class="p16-sblock">
            <span class="p16-slabel">α</span>
            <span class="p16-sval p16-sval--mono">${this.colorString(step.alpha || "λ", step)}</span>
          </div>
          <span class="p16-cdot">·</span>
          <div class="p16-sblock">
            <span class="p16-slabel">β</span>
            <span class="p16-sval p16-sval--mono">${this.colorString(step.beta || "λ", step)}</span>
          </div>
          <span class="p16-arrow">→</span>
          <div class="p16-sblock p16-sblock--res">
            <span class="p16-slabel">result</span>
            <span class="p16-sval p16-sval--mono">${this.colorString(step.result || "λ", step)}</span>
          </div>
        </div>

        <div class="p16-formula-box">
          <span class="p16-formula">${this.colorFormula(step)}</span>
        </div>

        <p class="p16-step-desc">${step.desc}</p>

        <div class="p16-progress">
          <div class="p16-progress-fill" style="width:${pct}%"></div>
        </div>

      </div>
    `
  }

  renderCurrent() {
    const step = this.steps[this.currentStep]
    if (!step) return
    this.result.innerHTML = this.renderStep(step, this.currentStep, this.steps.length)
  }

  startAnimation() {
    clearInterval(this.stepInterval)
    if (this.steps.length === 0) return
    this.currentStep = 0
    this.renderCurrent()
    this.stepInterval = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.steps.length
      this.renderCurrent()
    }, this.STEP_MS)
  }

  buildResult() {
    clearInterval(this.stepInterval)

    const alpha = (this.inputAlpha?.value ?? "").trim()
    const beta  = (this.inputBeta?.value  ?? "").trim()

    if (!beta && !alpha) {
      this.result.innerHTML = `<p class="p16-hint">Enter α and β to see the recursive breakdown.</p>`
      return
    }

    if (/[^a-zA-Z0-9]/.test(alpha) || /[^a-zA-Z0-9]/.test(beta)) {
      this.result.innerHTML = `<p class="p16-error">Only letters and digits are allowed.</p>`
      return
    }

    this.steps = this.buildSteps(alpha, beta)
    this.startAnimation()
  }

  schedulePreview() {
    clearTimeout(this.previewTimer)
    this.previewTimer = setTimeout(() => this.buildResult(), 400)
  }

  main() {
    const sanitize = (inp) => {
      inp.addEventListener("input", () => {
        const cur = inp.selectionStart
        inp.value = inp.value.replace(/[^a-zA-Z0-9]/g, "")
        inp.setSelectionRange(cur, cur)
        this.schedulePreview()
      })
    }
    if (this.inputAlpha) sanitize(this.inputAlpha)
    if (this.inputBeta)  sanitize(this.inputBeta)
    this.buildResult()
  }
}

export default RecursiveConcat
