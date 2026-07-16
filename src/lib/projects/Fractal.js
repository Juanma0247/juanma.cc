import ExtText from '../core/ExtText.js'

const pi = Math.PI
const rootStyles = getComputedStyle(document.documentElement)
var color = rootStyles.getPropertyValue('--color-text').trim() || '#000000'

class Fractal {
    constructor() {
        this.content = document.getElementById('fractal')
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
        step0.innerHTML = '<div class="label">General formula:</div>'

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
        step1.innerHTML = `<div class="label">Step 1: Substitute values n = ${n}, a = ${a}</div>`
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
        step2.innerHTML = `<div class="label">Step 2: Calculate \\(\\sin\\left(\\dfrac{\\pi}{${n}}\\right)\\)</div>`
        this.areaCalc.appendChild(step2)
        ExtText.addTexToElement(
            `\\sin\\left(\\dfrac{\\pi}{${n}}\\right) = ${calc.sinValFrac}`,
            step2.id = "step2",
            "step2"
        )

        const step3 = document.createElement("div")
        step3.className = "step"
        step3.innerHTML = '<div class="label">Step 3: Calculate the bracket term</div>'
        this.areaCalc.appendChild(step3)
        ExtText.addTexToElement(
            `\\left[ \\frac{1}{${n}} \\left( \\frac{1 + ${calc.sinValFrac}}{${calc.sinValFrac}} \\right)^2 - 1 \\right] = ${calc.bracketTermFrac}`,
            step3.id = "step3",
            "step3"
        )

        const step4 = document.createElement("div")
        step4.className = "step"
        step4.innerHTML = '<div class="label">Step 4: Calculate the final fraction</div>'
        this.areaCalc.appendChild(step4)
        ExtText.addTexToElement(
            `\\left( \\frac{${a} \\left(${calc.sinValFrac}\\right)^2}{\\left(1 + ${calc.sinValFrac}\\right)^2 - ${a} \\left(${calc.sinValFrac}\\right)^2} \\right) = ${calc.fractionTermFrac}`,
            step4.id = "step4",
            "step4"
        )

        const step5 = document.createElement("div")
        step5.className = "step"
        step5.innerHTML = '<div class="label">Step 5: Calculate the total product</div>'
        this.areaCalc.appendChild(step5)
        ExtText.addTexToElement(
            `A = \\pi r^2 \\times ${calc.bracketTermFrac} \\times ${calc.fractionTermFrac} = ${calc.areaFrac}\\, \\pi r^2`,
            step5.id = "step5",
            "step5"
        )

        const stepFinal = document.createElement("div")
        stepFinal.className = "step"
        stepFinal.innerHTML = '<div class="label">Total area:</div>'
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
    }

    add(element) {
        this.content.appendChild(element)
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
        this.displayAreaCalculation(this.n, this.a)
        if (this.a == this.n) {
            this.add(this.circle(0, 0, 1))
            return
        }
        if (!this.i3.value) {
            this.graf()
        } else {
            this.graf(parseInt(this.i3.value) - 1)
        }
    }

    main() {
        this.content.setAttribute("width", window.typeOfUser ? "95vw" : "80vh")
        ExtText.restrictNI(this.i3, 1, 7, "N")
        this.content.setAttribute("viewBox", `-1 -1 2 2`)
        this.i1.addEventListener("input", () => {
            this.n = parseInt(this.i1.value)
            this.i2.value = parseInt(this.i1.value / 2)
            this.action()
        })
        this.i2.addEventListener("input", () => {
            this.action()
        })
        this.i3.addEventListener("input", () => {
            this.action()
        })

        if (this.i3.value == "0") {
            this.action()
        }
        this.action()

        this.b1.addEventListener("click", () => {
            let idRef = "1X5aZ-jnnQy5nOX3G4kNKYIPtuaPjRCaV"
            ExtText.linkButton(this.b1, `https://drive.google.com/uc?export=download&id=${idRef}`)
        })
        this.b2.addEventListener("click", () => {
            this.downloadSVG(this.content, `f(${this.n},${this.a}) - depth ${this.i3.value}.svg`)
        })
    }
}

export default Fractal
