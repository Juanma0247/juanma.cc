import ExtText from '/js/core/ExtText.js'
import PlotBoard from '/js/core/PlotBoard.js'
import jStat from 'https://cdn.jsdelivr.net/npm/jstat@1.9.6/+esm'

class NormalDistribution {
    constructor() {
        this.i1 = document.getElementById("p7i1")
        this.i2 = document.getElementById("p7i2")
        this.i3 = document.getElementById("p7i3")
        this.board = null
        this.plot = null
    }

    draw(x, mu, sigma) {
        this.board.suspendUpdate()
        if (this.plot) this.board.removeObject(this.plot)

        const c = PlotBoard.palette()
        const f    = x_ => jStat.normal.pdf(x_, mu, sigma)
        const F    = x_ => jStat.normal.cdf(x_, mu, sigma)
        const Finv = p  => jStat.normal.inv(p, mu, sigma)

        const curveF   = PlotBoard.curve(this.board, f, c.primary)
        const curveCDF = PlotBoard.curve(this.board, F, c.secondary)

        const cdfAtX = F(x)
        const invAtX = Finv(x)
        const vecP   = PlotBoard.vector(this.board, [x, 0], [x, cdfAtX], c.muted)
        const lblP   = PlotBoard.label(this.board, x, cdfAtX, `\\Phi(${x})`, c.muted)
        const vecPI  = PlotBoard.vector(this.board, [0, x], [invAtX, x], c.tertiary)
        const lblPI  = PlotBoard.label(this.board, invAtX, x, `\\Phi^{-1}(${x})`, c.tertiary)

        this.plot = [curveF, curveCDF, vecP, lblP, vecPI, lblPI]
        this.board.unsuspendUpdate()
    }

    executeBoard() {
        const x     = parseFloat(this.i1.value)
        const mu    = parseFloat(this.i2.value)
        const sigma = parseFloat(this.i3.value)
        this.board.setBoundingBox([mu - sigma - Math.E, 1.1, mu + sigma + Math.E, -0.1])
        this.draw(x, mu, sigma)
    }

    action() {
        this.i1.value = this.i1.value.replace(/[^0-9.-]/g, '')
        const val = this.i1.value
        ExtText.tex(`\\Phi(${val}) = ${jStat.normal.cdf(val, 0, 1)}`, "p7Res1")
        try { ExtText.tex(`\\Phi^{-1}(${val}) = ${jStat.normal.inv(val, 0, 1)}`, "p7Res2") } catch (_) {}
        if (this.board) this.executeBoard()
    }

    start() {
        const mu    = parseFloat(this.i2.value)
        const sigma = parseFloat(this.i3.value)
        this.board = PlotBoard.create("p7PlotContainer", [mu - sigma - Math.E, 1.1, mu + sigma + Math.E, -0.1])
        this.executeBoard()
    }

    main() {
        this.i1.value = "0.99"
        this.i2.value = "0"
        this.i3.value = "1"
        this.i1.addEventListener("input", () => this.action())
        this.i2.addEventListener("input", () => this.action())
        this.i3.addEventListener("input", () => this.action())
        this.start()
    }
}

export default NormalDistribution
