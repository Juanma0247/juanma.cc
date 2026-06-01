import ExtText from '/js/core/ExtText.js'
import jStat from 'https://cdn.jsdelivr.net/npm/jstat@1.9.6/+esm'

class ChiSquared {
    constructor() {
        this.i1  = document.getElementById("p9i1")
        this.i2  = document.getElementById("p9i2")
        this.ggb = null
    }

    chiSquaredCDF(x, df) { return jStat.chisquare.cdf(x, df) }
    chiSquaredInv(p, df)  { return jStat.chisquare.inv(p, df) }

    graficOfChiSquaredCDF(x, df) {
        this.ggb.evalCommand(`f(x) = (1 / (2^(${df}/2) * gamma(${df}/2))) * x^(${df}/2 - 1) * exp(-x/2)`)
        this.ggb.evalCommand(`P = Vector((${x}, 0),(${x}, f(${x})))`)
        this.ggb.evalCommand(`SetCaption[P, "$\\chi^2_{${df}}(${x})$"]`)
        this.ggb.setColor("P", 180, 180, 180)
    }

    clean() {
        if (!this.ggb) return
        let objectCount = this.ggb.getObjectNumber()
        for (let i = objectCount - 1; i >= 0; i--) {
            let objectName = this.ggb.getObjectName(i)
            let objectType = this.ggb.getObjectType(objectName)
            if (objectType === "point" || objectType === "vector") {
                this.ggb.deleteObject(objectName)
            }
        }
    }

    executeGGB() {
        const x  = parseFloat(this.i1.value)
        const df = parseInt(this.i2.value)
        this.clean()
        this.graficOfChiSquaredCDF(x, df)
        this.ggb.setPerspective("G")
        this.ggb.setCoordSystem(-0.5, df * 3, -0.1, 0.4)
    }

    action() {
        this.i1.value = this.i1.value.replace(/[^0-9.-]/g, '')
        const val = parseFloat(this.i1.value)
        const df  = parseInt(this.i2.value)
        const p   = this.chiSquaredCDF(val, df)
        const x   = this.chiSquaredInv(val, df)
        ExtText.tex(`(\\chi^2)_{${df}}(${val}) = ${p}`, "p9Res1")
        ExtText.tex(`(\\chi^2)_{${df}}^{-1}(${val}) = ${x}`, "p9Res2")
        if (this.ggb) this.executeGGB()
    }

    start() {
        const this_      = this
        const dfltLenght = !window.typeOfUser ? window.innerHeight - 6 : window.innerWidth - 3
        const applet     = new GGBApplet({
            appName:             "graphing",
            width:               dfltLenght,
            height:              dfltLenght,
            showToolbar:         false,
            showAlgebraInput:    false,
            showMenuBar:         false,
            showAlgebraView:     false,
            enableLabelDrags:    false,
            enableShiftDragZoom: true,
            enableRightClick:    true,
            useBrowserForJS:     false,
        }, true)

        applet.inject("p9ggbContainer")

        const tryToLoad = () => {
            setTimeout(() => {
                this_.ggb = applet.getAppletObject()
                if (this_.ggb) {
                    this_.executeGGB()
                } else {
                    tryToLoad()
                }
            }, 100)
        }
        tryToLoad()
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
