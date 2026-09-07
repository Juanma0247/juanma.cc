import ExtText from '/js/core/ExtText.js'
import PlotBoard from '/js/core/PlotBoard.js'
import jStat from 'https://cdn.jsdelivr.net/npm/jstat@1.9.6/+esm'

class ChiSquared {
    constructor() {
        this.i1 = document.getElementById("p9i1")
        this.i2 = document.getElementById("p9i2")
        this.board = null
        this.plot = null
    }

    chiSquaredCDF(x, df) { return jStat.chisquare.cdf(x, df) }
    chiSquaredInv(p, df)  { return jStat.chisquare.inv(p, df) }

    draw(x, df) {
        this.board.suspendUpdate()
        if (this.plot) this.board.removeObject(this.plot)

        const c = PlotBoard.palette()
        const f = x_ => jStat.chisquare.pdf(x_, df)
        const curve  = PlotBoard.curve(this.board, f, c.primary, [0, df * 3])
        const point  = this.board.create('point', [x, f(x)], {
            strokeColor: c.secondary, fillColor: c.secondary, size: 3, name: '', fixed: true, highlight: false,
        })
        const vector = PlotBoard.vector(this.board, [x, 0], [x, f(x)], c.secondary)
        const label  = PlotBoard.label(this.board, x, f(x), `\\chi^2_{${df}}(${x})`, c.secondary, [f, { x }])

        this.plot = [curve, point, vector, label]
        this.board.unsuspendUpdate()
    }

    executeBoard() {
        const x  = parseFloat(this.i1.value)
        const df = parseInt(this.i2.value)
        this.board.setBoundingBox([-2, 0.4, df * 3, -0.1])
        this.draw(x, df)
    }

    action() {
        this.i1.value = this.i1.value.replace(/[^0-9.-]/g, '')
        const val = parseFloat(this.i1.value)
        const df  = parseInt(this.i2.value)
        const p   = this.chiSquaredCDF(val, df)
        const x   = this.chiSquaredInv(val, df)
        ExtText.tex(`(\\chi^2)_{${df}}(${val}) = ${p}`, "p9Res1")
        ExtText.tex(`(\\chi^2)_{${df}}^{-1}(${val}) = ${x}`, "p9Res2")
        if (this.board) this.executeBoard()
    }

    start() {
        const df = parseInt(this.i2.value)
        this.board = PlotBoard.create("p9PlotContainer", [-2, 0.4, df * 3, -0.1])
        this.executeBoard()
    }

    main() {
        this.i1.value = "8"
        this.i2.value = "10"
        this.i1.addEventListener("input", () => this.action())
        this.i2.addEventListener("input", () => this.action())
        this.start()
    }
}

export default ChiSquared
