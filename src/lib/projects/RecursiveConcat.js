class RecursiveConcat {
  constructor() {
    this.inputAlpha   = document.getElementById("p16iAlpha")
    this.inputBeta    = document.getElementById("p16iBeta")
    this.stage        = document.getElementById("p16r1")
    this.controls     = document.getElementById("p16controls")
    this.btnPrev      = document.getElementById("p16prev")
    this.btnNext      = document.getElementById("p16next")
    this.btnPlay      = document.getElementById("p16play")
    this.dots         = document.getElementById("p16dots")

    this.previewTimer = null
    this.autoTimer    = null
    this.AUTO_MS      = 3000
    this.steps        = []
    this.current      = 0
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
        desc:   "Base case: β = λ, so α·β = α",
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

      current = gamma
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
    const aLen = step.alpha.length
    const gLen = (step.gamma && step.gamma !== "λ") ? step.gamma.length : 0

    return str.split("").map((ch, i) => {
      if (i < aLen)                    return `<span class="p16-c-alpha">${ch}</span>`
      if (i < aLen + gLen)             return `<span class="p16-c-gamma">${ch}</span>`
      if (step.a && i === aLen + gLen) return `<span class="p16-c-a">${ch}</span>`
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
      step.gamma !== null ? { cls: "p16-c-gamma", label: `γ = "${step.gamma}"` } : null,
      step.a !== null     ? { cls: "p16-c-a",     label: `a = '${step.a}'` }     : null,
      { cls: "p16-c-beta", label: `β = "${step.beta || "λ"}"` },
    ].filter(Boolean)

    return `
      <article class="p16-step ${isResult ? "p16-step--result" : ""} ${isBase ? "p16-step--base" : ""}">

        <div class="p16-step-head">
          <span class="p16-badge ${isResult ? "p16-badge--ok" : isBase ? "p16-badge--base" : "p16-badge--rec"}">${isResult ? "✓" : isBase ? "B" : "R"}</span>
          <span class="p16-step-type">${isResult ? "Final result" : isBase ? "Base case" : "Recursive step"}</span>
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
            <span class="p16-sval">${this.colorString(step.alpha || "λ", step)}</span>
          </div>
          <span class="p16-cdot">·</span>
          <div class="p16-sblock">
            <span class="p16-slabel">β</span>
            <span class="p16-sval">${this.colorString(step.beta || "λ", step)}</span>
          </div>
          <span class="p16-arrow">→</span>
          <div class="p16-sblock p16-sblock--res">
            <span class="p16-slabel">result</span>
            <span class="p16-sval">${this.colorString(step.result || "λ", step)}</span>
          </div>
        </div>

        <div class="p16-formula-box">
          <span class="p16-formula">${this.colorFormula(step)}</span>
        </div>

        <p class="p16-step-desc">${step.desc}</p>

      </article>
    `
  }

  renderDots() {
    if (!this.dots) return
    this.dots.innerHTML = this.steps.map((_, i) =>
      `<button type="button" class="cc-dot ${i === this.current ? "is-active" : ""}" data-i="${i}" aria-label="Step ${i + 1}"></button>`
    ).join("")
  }

  render() {
    const total = this.steps.length
    if (total === 0) return
    if (this.current >= total) this.current = 0

    this.stage.innerHTML = this.renderStep(this.steps[this.current], this.current, total)
    this.renderDots()

    const many = total > 1
    if (this.controls) this.controls.hidden = !many
    if (this.dots)     this.dots.hidden = !many
    if (!many) this.stopAuto()
  }

  goTo(i) {
    const total = this.steps.length
    if (total === 0) return
    this.current = ((i % total) + total) % total
    this.render()
  }
  next() { this.goTo(this.current + 1) }
  prev() { this.goTo(this.current - 1) }

  updatePlayButton() {
    if (!this.btnPlay) return
    const playing = !!this.autoTimer
    this.btnPlay.classList.toggle("is-playing", playing)
    this.btnPlay.setAttribute("aria-pressed", playing ? "true" : "false")
    const icon  = this.btnPlay.querySelector(".cc-play-icon")
    const label = this.btnPlay.querySelector(".cc-play-label")
    if (icon)  icon.textContent  = playing ? "❚❚" : "▶"
    if (label) label.textContent = playing ? "Pause" : "Auto"
  }
  startAuto() {
    this.stopAuto()
    if (this.steps.length <= 1) return
    this.autoTimer = setInterval(() => this.next(), this.AUTO_MS)
    this.updatePlayButton()
  }
  stopAuto() {
    if (this.autoTimer) { clearInterval(this.autoTimer); this.autoTimer = null }
    this.updatePlayButton()
  }
  toggleAuto() { this.autoTimer ? this.stopAuto() : this.startAuto() }

  buildResult() {
    const alpha = (this.inputAlpha?.value ?? "").trim()
    const beta  = (this.inputBeta?.value  ?? "").trim()

    if (!beta && !alpha) {
      this.stopAuto()
      this.steps = []
      this.stage.innerHTML = `<p class="p16-hint">Enter α and β to see the recursive breakdown.</p>`
      if (this.controls) this.controls.hidden = true
      if (this.dots) this.dots.hidden = true
      return
    }

    if (/[^a-zA-Z0-9]/.test(alpha) || /[^a-zA-Z0-9]/.test(beta)) {
      this.stopAuto()
      this.steps = []
      this.stage.innerHTML = `<p class="p16-error">Only letters and digits are allowed.</p>`
      if (this.controls) this.controls.hidden = true
      if (this.dots) this.dots.hidden = true
      return
    }

    this.steps = this.buildSteps(alpha, beta)
    this.current = 0
    this.render()
  }

  schedulePreview() {
    clearTimeout(this.previewTimer)
    this.previewTimer = setTimeout(() => this.buildResult(), 300)
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

    this.btnPrev?.addEventListener("click", () => { this.stopAuto(); this.prev() })
    this.btnNext?.addEventListener("click", () => { this.stopAuto(); this.next() })
    this.btnPlay?.addEventListener("click", () => this.toggleAuto())
    this.dots?.addEventListener("click", (e) => {
      const b = e.target.closest(".cc-dot")
      if (!b) return
      this.stopAuto()
      this.goTo(parseInt(b.dataset.i, 10))
    })

    document.addEventListener("keydown", (e) => {
      const tag = e.target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.key === "ArrowRight")     { this.stopAuto(); this.next(); e.preventDefault() }
      else if (e.key === "ArrowLeft") { this.stopAuto(); this.prev(); e.preventDefault() }
    })

    this.buildResult()
  }
}

export default RecursiveConcat
