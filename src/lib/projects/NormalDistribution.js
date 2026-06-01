import ExtText from '../core/ExtText.js'

class NormalDistribution {
    constructor() {
        this.i1 = document.getElementById("p7i1")
        this.i2 = document.getElementById("p7i2")
        this.i3 = document.getElementById("p7i3")
    }

    erf(x) {
        const a1 = 0.254829592
        const a2 = -0.284496736
        const a3 = 1.421413741
        const a4 = -1.453152027
        const a5 = 1.061405429
        const p  = 0.3275911
        const sign = x >= 0 ? 1 : -1
        const absX = Math.abs(x)
        const t = 1 / (1 + p * absX)
        const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX)
        return sign * y
    }

    normalCDF(x) {
        return 0.5 * (1 + this.erf(x / Math.SQRT2))
    }

    normalInverseCDF(p) {
        const a = [-3.969683028665376e+01, 2.209460984245205e+02,
                -2.759285104469687e+02, 1.383577518672690e+02,
                -3.066479806614716e+01, 2.506628277459239e+00]
        const b = [-5.447609879822406e+01, 1.615858368580409e+02,
                -1.556989798598866e+02, 6.680131188771972e+01,
                -1.328068155288572e+01]
        const c = [-7.784894002430293e-03, -3.223964580411365e-01,
                -2.400758277161838e+00, -2.549732539343734e+00,
                    4.374664141464968e+00, 2.938163982698783e+00]
        const d = [7.784695709041462e-03, 3.224671290700398e-01,
                2.445134137142996e+00, 3.754408661907416e+00]
        const plow = 0.02425
        const phigh = 1 - plow
        let q, r
        if (p < plow) {
            q = Math.sqrt(-2 * Math.log(p))
            return (((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
                ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1)
        } else if (phigh < p) {
            q = Math.sqrt(-2 * Math.log(1 - p))
            return -(((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
                    ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1)
        } else {
            q = p - 0.5
            r = q * q
            return (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5]) * q /
                (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1)
        }
    }

    normalCDFGeneral(x, mu, sigma) {
        return this.normalCDF((x - mu) / sigma)
    }

    normalInverseCDFGeneral(x, mu, sigma) {
        return mu + sigma * this.normalInverseCDF(x)
    }

    graficOfnormalCDF(x, mu, sigma) {
        this.ggb.evalCommand(`f(x)=(1/(${sigma} sqrt(2 pi))) e^(-((1)/(2)) (((x-${mu})/(${sigma})))^2)`)
        this.ggb.evalCommand(`F(x) = 0.5 * (1 + erf((x - ${mu}) / (${sigma} * sqrt(2))))`)
        this.ggb.evalCommand(`P = Vector((${x}, 0),(${x}, ${this.normalCDFGeneral(x, mu, sigma)}))`)
        this.ggb.evalCommand(`SetCaption[P, "$\\Phi(${x})$"]`)
        this.ggb.setColor("P", 180, 180, 180)
        this.ggb.evalCommand(`PI = Vector((0, ${x}),(${this.normalInverseCDFGeneral(x, mu, sigma)}, ${x}))`)
        this.ggb.evalCommand(`SetCaption[PI, "$\\Phi^{-1}(${x})$"]`)
        this.ggb.setColor("PI", 180, 180, 180)
    }

    clean() {
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
        const x = parseFloat(this.i1.value)
        const mu = parseFloat(this.i2.value)
        const sigma = parseFloat(this.i3.value)
        this.graficOfnormalCDF(x, mu, sigma)
        this.ggb.setPerspective("G")
        this.ggb.setCoordSystem(mu - sigma - Math.E, mu + sigma + Math.E, -0.1, 1.1)
    }

    action(input) {
        this.i1.value = this.i1.value.replace(/[^0-9.-]/g, '')
        const val = this.i1.value
        ExtText.tex(`\\Phi(${val}) = ${this.normalCDF(val)}`, "p7Res1")
        try {
            ExtText.tex(`\\Phi^{-1}(${val}) = ${this.normalInverseCDF(val)}`, "p7Res2")
        } catch (_) {}

        const this_ = this
        const dfltLenght = !window.typeOfUser ? window.innerHeight - 6 : window.innerWidth - 3
        var applet = new GGBApplet({
            appName: "graphing",
            width: dfltLenght,
            height: dfltLenght,
            showToolbar: false,
            showAlgebraInput: false,
            showMenuBar: false,
            showAlgebraView: false,
            enableLabelDrags: false,
            enableShiftDragZoom: true,
            enableRightClick: true,
            useBrowserForJS: false,
        }, true)

        applet.inject("p7ggbContainer")

        let tryToLoad = () => {
            setTimeout(function() {
                this_.ggb = applet.getAppletObject()
                if (this_.ggb) {
                    try {
                        this_.clean()
                    } catch (_) {}
                    this_.executeGGB()
                } else {
                    tryToLoad()
                }
            }, 10)
        }
        tryToLoad()
    }

    main() {
        this.i1.value = "0.99"
        this.i2.value = "0"
        this.i3.value = "1"
        this.i1.focus()
        this.i1.addEventListener("input", () => {
            this.action(this.i1)
        })
        this.i2.addEventListener("input", () => {
            this.action(this.i2)
        })
        this.i3.addEventListener("input", () => {
            this.action(this.i3)
        })
        this.action(this.i1)
    }
}

export default NormalDistribution
