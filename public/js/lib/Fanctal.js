import ExtText from '/js/core/ExtText.js'

const pi = Math.PI
const rootStyles = getComputedStyle(document.documentElement)
var color = rootStyles.getPropertyValue('--color-text').trim() || '#000000'

const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`pd.fanctal.${key}`, fallback) : fallback

// Google Drive file id for the full write-up PDF. Set once it's shared;
// the button stays hidden until then (see main()).
const PDF_DRIVE_ID = '18mrxCsuYxWPeMb-hP4Z7Yxh5pNsqDmcd'

// Animation sweep: every admissible pair (n, a) with n in [2, 20] and 1 <= a < n,
// 190 frames in total. The dwell time is constant inside each n group and drops
// linearly from ANIM_DELAY_START to ANIM_DELAY_END, which adds up to ~2 minutes.
const ANIM_N_MIN = 2
const ANIM_N_MAX = 20
const ANIM_DELAY_START = 1000
const ANIM_DELAY_END = 333

class Fanctal {
    constructor() {
        this.content = document.getElementById('fanctal')
        this.i1 = document.getElementById('p11i1')
        this.i2 = document.getElementById('p11i2')
        this.i3 = document.getElementById('p11i3')
        this.b1 = document.getElementById('p11b1')
        this.b2 = document.getElementById('p11b2')
        this.areaCalc = document.getElementById('p11AreaCalc')
        this.resArea = document.getElementById('p11ResArea')
        this.strokeW = 1
        this.n = 6
        this.a = 3
        this.step = (2 * pi) / this.n
        this.buffer = document.createDocumentFragment()

        this.figureCard = this.content?.parentElement
        this.panel = document.querySelector('.p11Panel')
        this.inputsWrap = document.querySelector('.p11inputs')
        this.panelFoot = document.querySelector('.p11PanelFoot')
        this.animBtn = document.getElementById('p11AnimBtn')
        this.fs = document.getElementById('p11Fs')
        this.fsStage = document.getElementById('p11FsStage')
        this.fsInputs = document.getElementById('p11FsInputs')
        this.fsExit = document.getElementById('p11FsExit')
        this.fsPlay = document.getElementById('p11FsPlay')
        this.fsStop = document.getElementById('p11FsStop')
        this.fsFrame = document.getElementById('p11FsFrame')
        this.fsCount = document.getElementById('p11FsCount')
        this.fsBarFill = document.getElementById('p11FsBarFill')
        this.fsArea = document.getElementById('p11FsArea')

        this.fsOpen = false
        this.animOn = false
        this.animTimer = null
        this.animIndex = 0
        this.sequence = []
        this.seqIndex = new Map()
        this.delays = new Map()
    }

    frac(decimal, tolerance = 1e-10) {
        if (decimal === 0) return { num: 0, den: 1 }
        let h1 = 1, h2 = 0
        let k1 = 0, k2 = 1
        let b = decimal
        for (let i = 0; i < 100; i++) {
            let a = Math.floor(b)
            let aux = h1
            h1 = a * h1 + h2
            h2 = aux
            aux = k1
            k1 = a * k1 + k2
            k2 = aux
            b = 1 / (b - a)
            if (Math.abs(decimal - h1 / k1) < tolerance || isNaN(b) || !isFinite(b)) {
                break
            }
        }
        return `\\frac{${h1}}{${k1}}`
    }

    calculateArea(r, n, a) {
        const sinVal = Math.sin(Math.PI / n)
        const bracketTerm = (1 / n) * ((1 + sinVal) / sinVal) ** 2 - 1
        const fractionTerm = (a * (sinVal ** 2)) / (((1 + sinVal) ** 2) - a * (sinVal ** 2))
        const area = bracketTerm * fractionTerm
        const sinValFrac = this.frac(sinVal)
        const bracketTermFrac = this.frac(bracketTerm)
        const fractionTermFrac = this.frac(fractionTerm)
        const areaFrac = this.frac(area)
        return { n, a, sinValFrac, bracketTermFrac, fractionTermFrac, areaFrac, area }
    }

    displayAreaCalculation(n, a) {
        this.areaCalc.innerHTML = ""
        this.resArea.innerHTML = ""

        const calc = this.calculateArea(1, n, a)
        const step0 = ExtText.createElement("div", "step", this.areaCalc)
        step0.innerHTML = `<div class="label">${t('generalFormula', 'General formula:')}</div>`

        ExtText.addTexToElement(
            `A(r,n,a) =
            \\pi r^2 \\left[
                \\frac{1}{n}
                \\left(
                    \\frac{1 + \\sin\\left(\\frac{\\pi}{n}\\right)}
                        {\\sin\\left(\\frac{\\pi}{n}\\right)}
                \\right)^2
                - 1
            \\right]
            \\left(
                \\frac{a\\sin^2\\left(\\frac{\\pi}{n}\\right)}
                    {\\left(1 + \\sin\\left(\\frac{\\pi}{n}\\right)\\right)^2 - a\\sin^2\\left(\\frac{\\pi}{n}\\right)}
            \\right)`,
            step0.id = "step0",
            "step0"
        )

        const step1 = document.createElement("div")
        step1.className = "step"
        step1.innerHTML = `<div class="label">${t('step1', 'Step 1: Substitute values n = {n}, a = {a}').replaceAll('{n}', n).replaceAll('{a}', a)}</div>`
        this.areaCalc.appendChild(step1)
        ExtText.addTexToElement(
            `A(r,${n},${a}) =
            \\pi r^2 \\left[
                \\frac{1}{${n}}
                \\left(
                    \\frac{1 + \\sin\\left(\\frac{\\pi}{${n}}\\right)}
                        {\\sin\\left(\\frac{\\pi}{${n}}\\right)}
                \\right)^2
                - 1
            \\right]
            \\left(
                \\frac{${a}\\sin^2\\left(\\frac{\\pi}{${n}}\\right)}
                    {\\left(1 + \\sin\\left(\\frac{\\pi}{${n}}\\right)\\right)^2 - ${a}\\sin^2\\left(\\frac{\\pi}{${n}}\\right)}
            \\right)`,
            step1.id = "step1",
            "step1"
        )

        const step2 = document.createElement("div")
        step2.className = "step"
        step2.innerHTML = `<div class="label">${t('step2', 'Step 2: Calculate')} \\(\\sin\\left(\\dfrac{\\pi}{${n}}\\right)\\)</div>`
        this.areaCalc.appendChild(step2)
        ExtText.addTexToElement(
            `\\sin\\left(\\dfrac{\\pi}{${n}}\\right) = ${calc.sinValFrac}`,
            step2.id = "step2",
            "step2"
        )

        const step3 = document.createElement("div")
        step3.className = "step"
        step3.innerHTML = `<div class="label">${t('step3', 'Step 3: Calculate the bracket term')}</div>`
        this.areaCalc.appendChild(step3)
        ExtText.addTexToElement(
            `\\left[ \\frac{1}{${n}} \\left( \\frac{1 + ${calc.sinValFrac}}{${calc.sinValFrac}} \\right)^2 - 1 \\right] = ${calc.bracketTermFrac}`,
            step3.id = "step3",
            "step3"
        )

        const step4 = document.createElement("div")
        step4.className = "step"
        step4.innerHTML = `<div class="label">${t('step4', 'Step 4: Calculate the final fraction')}</div>`
        this.areaCalc.appendChild(step4)
        ExtText.addTexToElement(
            `\\left( \\frac{${a} \\left(${calc.sinValFrac}\\right)^2}{\\left(1 + ${calc.sinValFrac}\\right)^2 - ${a} \\left(${calc.sinValFrac}\\right)^2} \\right) = ${calc.fractionTermFrac}`,
            step4.id = "step4",
            "step4"
        )

        const step5 = document.createElement("div")
        step5.className = "step"
        step5.innerHTML = `<div class="label">${t('step5', 'Step 5: Calculate the total product')}</div>`
        this.areaCalc.appendChild(step5)
        ExtText.addTexToElement(
            `A = \\pi r^2 \\times ${calc.bracketTermFrac} \\times ${calc.fractionTermFrac} = ${calc.areaFrac}\\, \\pi r^2`,
            step5.id = "step5",
            "step5"
        )

        const stepFinal = document.createElement("div")
        stepFinal.className = "step"
        stepFinal.innerHTML = `<div class="label">${t('totalArea', 'Total area:')}</div>`
        this.resArea.appendChild(stepFinal)
        ExtText.addTexToElement(
            `\\boxed{A(r,${n},${a}) = ${calc.areaFrac}\\, \\pi r^2 \\approx ${(parseFloat(calc.area)).toFixed(3)}\\, \\pi r^2}`,
            stepFinal.id = "stepFinal",
            "stepFinal"
        )

        renderMathInElement(document.body)
    }

    clean() {
        this.content.innerHTML = ""
        this.buffer = document.createDocumentFragment()
    }

    // A single fanctal can reach ~20k nodes, so shapes are staged in a fragment
    // and committed once per redraw instead of appended one by one.
    add(element) {
        this.buffer.appendChild(element)
    }

    flush() {
        this.content.appendChild(this.buffer)
        this.buffer = document.createDocumentFragment()
    }

    svg(element) {
        return document.createElementNS('http://www.w3.org/2000/svg', element)
    }

    circle(cx, cy, r, st = 0) {
        const c = this.svg('circle')
        c.setAttribute('cx', cx)
        c.setAttribute('cy', cy)
        c.setAttribute('r', r)
        c.setAttribute('fill', color)
        c.setAttribute("stroke", color)
        c.setAttribute("stroke-width", st)
        return c
    }

    con(cx, cy, x1, y1, x2, y2, r, nx, ny, nr, st) {
        const a = this.svg('path')
        const outer = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
        const inner = `M ${nx - nr} ${ny} A ${nr} ${nr} 0 1 0 ${nx + nr} ${ny} A ${nr} ${nr} 0 1 0 ${nx - nr} ${ny} Z`
        a.setAttribute('d', `${outer} ${inner}`)
        a.setAttribute('fill', color)
        a.setAttribute('fill-rule', 'evenodd')
        a.setAttribute('stroke', color)
        a.setAttribute('stroke-width', st)
        return a
    }

    fan(cx, cy, r, nextRadius) {
        const st = r / 300
        for (let i = 0; i < this.form.length; i++) {
            if (!this.form[i]) {
                const angle1 = i * this.step
                const angle2 = i * this.step + this.step
                const x1 = cx + r * Math.cos(angle2)
                const y1 = cy - r * Math.sin(angle2)
                const x2 = cx + r * Math.cos(angle1)
                const y2 = cy - r * Math.sin(angle1)
                const midAngle = ((angle1 + angle2) / 2) + (2 * Math.PI / this.n) - this.step
                const dist = r - nextRadius
                const nx = cx + dist * Math.cos(midAngle)
                const ny = cy - dist * Math.sin(midAngle)
                this.add(this.con(cx, cy, x1, y1, x2, y2, r, nx, ny, nextRadius, st))
            }
        }
    }

    graf(n = null, cx = 0, cy = 0, r = 1, aux = 0) {
        if (r < 0.01) {
            this.add(this.circle(cx, cy, r))
            return
        }
        let nextRadius = r * (Math.sin(Math.PI / this.n)) / (1 + Math.sin(Math.PI / this.n))
        if (n === aux) {
            this.fan(cx, cy, r, nextRadius)
        } else {
            if (n === null) {
                this.fan(cx, cy, r, nextRadius)
            }
            for (let i = 0; i < this.form.length; i++) {
                if (!this.form[i]) {
                    const angle1 = i * this.step
                    const angle2 = i * this.step + this.step
                    const midAngle = ((angle1 + angle2) / 2) + (2 * Math.PI / this.n) - this.step
                    const dist = r - nextRadius
                    const nx = cx + dist * Math.cos(midAngle)
                    const ny = cy - dist * Math.sin(midAngle)
                    this.graf(n, nx, ny, nextRadius, aux + 1)
                }
            }
        }
    }

    setForm(n, a) {
        if (a == n) {
            return Array(n).fill(0)
        }
        a = n - a
        let arr = Array(n).fill(0)
        let indices = []
        for (let i = 1; i < n; i += 2) indices.push(i)
        let selected = indices.slice(0, a)
        if (selected.length < a) {
            let remaining = [...Array(n).keys()].filter(i => !selected.includes(i))
            let extra = remaining.sort(() => Math.random() - 0.5).slice(0, a - selected.length)
            selected = selected.concat(extra)
        }
        selected.forEach(i => arr[i] = 1)
        return arr
    }

    downloadSVG(svgEl, filename = 'image.svg') {
        const svgData = new XMLSerializer().serializeToString(svgEl)
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    action() {
        this.clean()
        this.a = parseInt(this.i2.value)
        this.step = (2 * pi) / this.n
        this.form = this.setForm(this.n, this.a)
        this.i2.max = this.n
        if (this.a == this.n) {
            this.add(this.circle(0, 0, 1))
        } else if (!this.i3.value) {
            this.graf()
        } else {
            this.graf(parseInt(this.i3.value) - 1)
        }
        this.flush()
        // The step-by-step breakdown re-renders KaTeX over the whole document,
        // far too heavy to run once per animation frame.
        if (!this.animOn) this.displayAreaCalculation(this.n, this.a)
        if (this.fsOpen) this.updateAnimReadout()
    }

    buildSequence() {
        this.sequence = []
        for (let n = ANIM_N_MIN; n <= ANIM_N_MAX; n++) {
            for (let a = 1; a < n; a++) this.sequence.push({ n, a })
        }
        this.sequence.forEach((pair, i) => this.seqIndex.set(`${pair.n},${pair.a}`, i))

        const last = this.sequence.length - 1
        let offset = 0
        for (let n = ANIM_N_MIN; n <= ANIM_N_MAX; n++) {
            const count = n - 1
            const mid = offset + (count - 1) / 2
            this.delays.set(n, ANIM_DELAY_START + (ANIM_DELAY_END - ANIM_DELAY_START) * (mid / last))
            offset += count
        }
    }

    // First frame at or after the pair currently in the inputs, so resuming
    // always picks up from the values on screen.
    seqPos(n, a) {
        for (let i = 0; i < this.sequence.length; i++) {
            const pair = this.sequence[i]
            if (pair.n > n || (pair.n === n && pair.a >= a)) return i
        }
        return 0
    }

    updateAnimControls() {
        if (!this.fsPlay || !this.fsStop) return
        this.fsPlay.disabled = this.animOn
        this.fsStop.disabled = !this.animOn
    }

    updateAnimReadout() {
        if (!this.fsFrame) return
        const total = this.sequence.length
        const pos = this.seqIndex.get(`${this.n},${this.a}`)
        const done = pos == null ? 0 : pos + 1
        this.fsFrame.textContent = `f(r, ${this.n}, ${this.a})`
        this.fsCount.textContent = `${done || '-'} / ${total}`
        this.fsBarFill.style.width = `${(done / total) * 100}%`

        if (!Number.isFinite(this.n) || !Number.isFinite(this.a) || this.n < 2 || this.a < 1) {
            this.fsArea.innerHTML = ""
            return
        }
        const calc = this.calculateArea(1, this.n, this.a)
        katex.render(
            `A(r,${this.n},${this.a}) = ${calc.areaFrac}\\,\\pi r^2 \\approx ${calc.area.toFixed(3)}\\,\\pi r^2`,
            this.fsArea,
            { throwOnError: false }
        )
    }

    openAnimation() {
        if (this.fsOpen || !this.fs) return
        this.fsOpen = true
        this.fsStage.appendChild(this.content)
        this.fsInputs.appendChild(this.inputsWrap)
        this.fs.hidden = false
        document.body.classList.add('p11FsLock')
        this.playAnimation(true)
    }

    closeAnimation() {
        if (!this.fsOpen) return
        this.stopAnimation()
        this.fsOpen = false
        this.fs.hidden = true
        document.body.classList.remove('p11FsLock')
        this.figureCard.appendChild(this.content)
        this.panel.insertBefore(this.inputsWrap, this.panelFoot)
        this.action()
    }

    playAnimation(fromStart = false) {
        if (this.animOn) return
        let i = fromStart ? 0 : this.seqPos(this.n, this.a)
        if (i >= this.sequence.length - 1) i = 0
        this.animIndex = i
        this.animOn = true
        this.updateAnimControls()

        const run = () => {
            if (!this.animOn) return
            const pair = this.sequence[this.animIndex]
            this.n = pair.n
            this.i1.value = pair.n
            this.i2.value = pair.a
            this.action()
            this.animIndex++
            const next = this.animIndex >= this.sequence.length ? () => this.finishAnimation() : run
            this.animTimer = setTimeout(next, this.delays.get(pair.n))
        }
        run()
    }

    stopAnimation() {
        if (this.animTimer) {
            clearTimeout(this.animTimer)
            this.animTimer = null
        }
        if (!this.animOn) return
        this.animOn = false
        this.updateAnimControls()
    }

    finishAnimation() {
        this.stopAnimation()
        this.action()
    }

    main() {
        ExtText.restrictNI(this.i3, 1, 7, "N")
        this.content.setAttribute("viewBox", `-1 -1 2 2`)
        this.i1.addEventListener("input", () => {
            this.stopAnimation()
            this.n = parseInt(this.i1.value)
            this.i2.value = parseInt(this.i1.value / 2)
            this.action()
        })
        this.i2.addEventListener("input", () => {
            this.stopAnimation()
            this.action()
        })
        this.i3.addEventListener("input", () => {
            this.stopAnimation()
            this.action()
        })

        if (this.i3.value == "0") {
            this.action()
        }
        this.action()

        this.b1.addEventListener("click", () => {
            document.getElementById('p11About')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
        this.b2.addEventListener("click", () => {
            this.downloadSVG(this.content, `f(${this.n},${this.a}) - depth ${this.i3.value}.svg`)
        })

        // The overlay has to sit outside .contenedor, which opens its own
        // stacking context and would trap it under the navbar.
        if (this.fs && this.fs.parentElement !== document.body) document.body.appendChild(this.fs)
        this.buildSequence()
        this.updateAnimControls()
        this.animBtn?.addEventListener("click", () => this.openAnimation())
        this.fsExit?.addEventListener("click", () => this.closeAnimation())
        this.fsPlay?.addEventListener("click", () => this.playAnimation())
        this.fsStop?.addEventListener("click", () => this.stopAnimation())
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.fsOpen) this.closeAnimation()
        })

        const pdfBtn = document.getElementById('p11PdfBtn')
        if (pdfBtn && PDF_DRIVE_ID) {
            pdfBtn.hidden = false
            ExtText.linkButton(pdfBtn, `https://drive.google.com/uc?export=download&id=${PDF_DRIVE_ID}`)
        }

        window.addEventListener("langchanged", () => {
            if (!this.animOn) this.displayAreaCalculation(this.n, this.a)
            if (this.fsOpen) this.updateAnimReadout()
        })
    }
}

export default Fanctal
