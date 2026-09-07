import ExtText from '/js/core/ExtText.js'
import PlotBoard from '/js/core/PlotBoard.js'
import jStat from 'https://cdn.jsdelivr.net/npm/jstat@1.9.6/+esm'

class TStudent {
    constructor() {
        this.i1 = document.getElementById("p8i1")
        this.i2 = document.getElementById("p8i2")
        this.board = null
        this.plot = null
    }

    tStudentCDF(x, df) { return jStat.studentt.cdf(x, df) }
    tStudentInv(p, df)  { return jStat.studentt.inv(p, df) }

    draw(x, df) {
        this.board.suspendUpdate()
        if (this.plot) this.board.removeObject(this.plot)

        const c = PlotBoard.palette()
        const f = x_ => jStat.studentt.pdf(x_, df)
        const curve  = PlotBoard.curve(this.board, f, c.primary)
        const point  = this.board.create('point', [x, f(x)], {
            strokeColor: c.secondary, fillColor: c.secondary, size: 3, name: '', fixed: true, highlight: false,
        })
        const vector = PlotBoard.vector(this.board, [x, 0], [x, f(x)], c.secondary)
        const label  = PlotBoard.label(this.board, x, f(x), `T_{${df}}(${x})`, c.secondary, [f, { x }])

        this.plot = [curve, point, vector, label]
        this.board.unsuspendUpdate()
    }

    executeBoard() {
        const x  = parseFloat(this.i1.value)
        const df = parseInt(this.i2.value)
        this.draw(x, df)
    }

    action() {
        this.i1.value = this.i1.value.replace(/[^0-9.-]/g, '')
        const val = parseFloat(this.i1.value)
        const df  = parseInt(this.i2.value)

        const p = this.tStudentCDF(val, df).toFixed(10)
        const x = this.tStudentInv(val, df).toFixed(10)
        ExtText.tex(`T_{${df}}(${val}) = ${p}`, "p8Res1")
        ExtText.tex(`T_{${df}}^{-1}(${val}) = ${x}`, "p8Res2")

        if (this.board) this.executeBoard()
    }

    start() {
        this.board = PlotBoard.create("p8PlotContainer", [-4, 1.1, 4, -0.1])
        this.executeBoard()
    }

    main() {
        this.i1.value = "0.6"
        this.i2.value = "10"
        this.i1.addEventListener("input", () => this.action())
        this.i2.addEventListener("input", () => this.action())
        this.start()
    }
}

export default TStudent
