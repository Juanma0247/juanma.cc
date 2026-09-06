import ExtText from '/js/core/ExtText.js'
import jStat from 'https://cdn.jsdelivr.net/npm/jstat@1.9.6/+esm'

class TStudent {
    constructor() {
        this.i1  = document.getElementById("p8i1")
        this.i2  = document.getElementById("p8i2")
        this.ggb = null
    }

    tStudentCDF(x, df) { return jStat.studentt.cdf(x, df) }
    tStudentInv(p, df)  { return jStat.studentt.inv(p, df) }

    graficOfTCDF(x, df) {
        this.ggb.evalCommand(`f(x) = (gamma((${df}+1)/2))/(sqrt(${df} * pi) * gamma(${df}/2)) * (1 + x^2/${df})^(-(${df}+1)/2)`)
        this.ggb.evalCommand(`P = Vector((${x}, 0),(${x}, f(${x})))`)
        this.ggb.evalCommand(`SetCaption[P, "$T_{${df}}(${x})$"]`)
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
        this.graficOfTCDF(x, df)
        this.ggb.setPerspective("G")
        this.ggb.setCoordSystem(-4, 4, -0.1, 1.1)
    }

    action() {
        this.i1.value = this.i1.value.replace(/[^0-9.-]/g, '')
        const val = parseFloat(this.i1.value)
        const df  = parseInt(this.i2.value)

        const p = this.tStudentCDF(val, df).toFixed(10)
        const x = this.tStudentInv(val, df).toFixed(10)
        ExtText.tex(`T_{${df}}(${val}) = ${p}`, "p8Res1")
        ExtText.tex(`T_{${df}}^{-1}(${val}) = ${x}`, "p8Res2")

        if (this.ggb) this.executeGGB()
    }

    start() {
        const this_      = this
        const dfltLenght = document.getElementById("p8ggbContainer").clientWidth || 320
        const applet     = new GGBApplet({
            appName:            "graphing",
            width:              dfltLenght,
            height:             dfltLenght,
            showToolbar:        false,
            showAlgebraInput:   false,
            showMenuBar:        false,
            showAlgebraView:    false,
            enableLabelDrags:   false,
            enableShiftDragZoom: true,
            enableRightClick:   true,
            useBrowserForJS:    false,
        }, true)

        applet.inject("p8ggbContainer")

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
        this.i1.value = "0.6"
        this.i2.value = "10"
        this.i1.addEventListener("input", () => this.action())
        this.i2.addEventListener("input", () => this.action())
        this.start()
    }
}

export default TStudent
