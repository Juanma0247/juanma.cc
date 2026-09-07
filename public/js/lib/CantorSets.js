import ExtText from '/js/core/ExtText.js'
import PlotBoard from '/js/core/PlotBoard.js'

const t = (key, fallback) =>
  typeof window !== "undefined" && window.i18nGet ? window.i18nGet(`pd.cantor.${key}`, fallback) : fallback

class CantorSets {
    constructor() {
        this.board = null
        this.plot = null
        this.i1 = document.getElementById("p3i1")
        this.i2 = document.getElementById("p3i2")
        this.b1 = document.getElementById("p3b1")
    }

    CPTG(p, q) {
        return (((parseInt(p) + parseInt(q)) * (parseInt(p) + parseInt(q) + 1)) / 2) + parseInt(q)
    }

    drawSequence(p, q, res) {
        const c = PlotBoard.palette()
        const objs = []

        const dot = (c1, c2, name) => {
            const isTarget = name === res
            const color = isTarget ? c.secondary : c.primary
            objs.push(this.board.create('point', [c1, c2], {
                name: String(name), size: 3, fixed: true, highlight: false,
                strokeColor: color, fillColor: color,
                label: { offset: [6, 6], strokeColor: color, fontSize: 12 },
            }))
        }

        const arrow = (from, to) => {
            objs.push(PlotBoard.vector(this.board, from, to, c.muted))
        }

        let direction = 1, c1 = 1, c2 = 0, cont = 0
        dot(0, 0, 0)
        while (c1 < p || c2 < q) {
            const c1_ = c1
            const c2_ = c2
            if (direction) {
                direction = 0
                c1 = c2 + 1
                c2 = 0
                cont++
                dot(c1, c2, cont)
                arrow([c1_, c2_], [c1, c2])
            } else if (c1 !== 0) {
                c2++
                c1--
                cont++
                dot(c1, c2, cont)
                arrow([c1_, c2_], [c1, c2])
            } else {
                direction = 1
            }
        }

        this.plot = objs
        return cont
    }

    makeProcces(x, y) {
        const p2 = document.getElementById("p3Prosessp2")
        const p4 = document.getElementById("p3Prosessp4")
        ExtText.tex(`f(p,q)=\\frac{(p+q)(p+q+1)}{2} + q`, p2)
        ExtText.tex(`f(${x},${y})=\\frac{(${x}+${y})(${x}+${y}+1)}{2} + ${y} = \\frac{${(parseInt(x) + parseInt(y)) * (parseInt(x) + parseInt(y) + 1)}}{2} + ${y} = \\textcolor{red}{\\text{${this.CPTG(x, y)}}}`, p4)
        this._lastXY = { x, y }
        document.getElementById("p3Prosessp5").innerHTML = t("resultLine", 'Therefore, the position for point {x} and {y} will be <a style="color: red">{n}.</a>')
            .replaceAll("{x}", x).replaceAll("{y}", y).replaceAll("{n}", this.CPTG(x, y))
    }

    execute(x, y) {
        const p = parseInt(x)
        const q = parseInt(y)
        this.board.suspendUpdate()
        if (this.plot) this.board.removeObject(this.plot)
        const res = this.drawSequence(p, q, this.CPTG(x, y))
        this.board.unsuspendUpdate()
        this.board.setBoundingBox([p - 5, q + 5, p + 5, q - 5])
        this.makeProcces(x, y, res)
    }

    main() {
        this.board = PlotBoard.create("p3PlotContainer", [-5, 5, 5, -5])
        this.execute(this.i1.value, this.i2.value)

        this.b1.addEventListener("click", () => {
            this.execute(this.i1.value, this.i2.value)
        })

        window.addEventListener("langchanged", () => {
            if (this._lastXY) this.makeProcces(this._lastXY.x, this._lastXY.y)
        })

        if (window.typeOfUser) {
            document.getElementById("p3CalcContainer").style.width = "100%"
        }
    }
}

export default CantorSets
