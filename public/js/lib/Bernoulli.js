import PlotBoard from '/js/core/PlotBoard.js'

class Bernoulli {
    constructor() {
        this.i1 = document.getElementById("p10i1")
        this.i2 = document.getElementById("p10i2")
        this.cb1 = document.getElementById("p10cb1")
        this.board = null
        this.plot = null
    }

    draw(n, a) {
        this.board.suspendUpdate()
        if (this.plot) this.board.removeObject(this.plot)

        const c = PlotBoard.palette()
        const f = x => Math.pow(a + x, n)
        const g = () => 1
        const h = x => f(x) - g(x)

        const curveF = PlotBoard.curve(this.board, f, c.primary)
        const curveG = PlotBoard.curve(this.board, g, c.secondary)
        const curveH = PlotBoard.curve(this.board, h, c.tertiary)
        const line   = this.board.create('line', [[-(a + 1), 0], [-(a + 1), 1]], {
            straightFirst: true, straightLast: true, strokeColor: c.muted, dash: 2, highlight: false, fixed: true,
        })
        // Seed spots near where each curve reads best (f flattens out near
        // the top, h near the bottom); PlotBoard.label nudges away from
        // there if f, g, h or the dashed guide line is in the way.
        const obstacles = [f, g, h, { x: -(a + 1) }]
        const labelF = PlotBoard.label(this.board, -2.9, 0.7, `f(x)=(${a}+x)^{${n}}`, c.primary, obstacles)
        const labelH = PlotBoard.label(this.board, -2.9, -9, `h(x)=f(x)-g(x)`, c.tertiary, obstacles)

        this.plot = [curveF, curveG, curveH, line, labelF, labelH]
        this.board.unsuspendUpdate()
    }

    currentExponent() {
        const n = parseInt(this.i1.value) || 0
        return this.cb1.checked ? n * 2 + 1 : n
    }

    executeBoard() {
        const a = parseFloat(this.i2.value)
        this.draw(this.currentExponent(), a)
    }

    start() {
        this.i1.value = this.i1.value.replace(/[^0-9.-]/g, '')
        this.board = PlotBoard.create("p10PlotContainer", [-3, 1, 1, -10])
        this.executeBoard()
    }

    main() {
        this.i1.addEventListener("input", () => this.executeBoard())
        this.i2.addEventListener("input", () => this.executeBoard())
        this.cb1.addEventListener("change", () => this.executeBoard())
        this.start()
    }
}

export default Bernoulli
