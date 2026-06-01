import ExtText from '/js/core/ExtText.js'

class CantorSets {
    constructor() {
        this.ggb = null
        this.i1 = document.getElementById("p3i1")
        this.i2 = document.getElementById("p3i2")
        this.b1 = document.getElementById("p3b1")
    }

    cantorParing(p, q) {
        let n = (q_) => {
            return q >= 0 ? 2 * q : -1 * 2 * 1 - 1
        }
        return ((n(q) + p - 1) * (n(q) + p) / 2) * (p - 1)
    }

    CPTG(p, q) {
        return (((parseInt(p) + parseInt(q)) * (parseInt(p) + parseInt(q) + 1)) / 2) + parseInt(q)
    }

    cantorParingSequence(p, q, res) {
        let dot = (c1_, c2_, name) => {
            this.ggb.evalCommand(`P${c1_}Y${c2_} = (${c1_}, ${c2_})`)
            this.ggb.evalCommand(`SetCaption[P${c1_}Y${c2_}, "${name}"]`)
            this.ggb.setColor(`P${c1_}Y${c2_}`, 0, 128, 128)
            if (name == res) {
                this.ggb.evalCommand(`SetCaption[P${c1_}Y${c2_}, "${name}"]`)
                this.ggb.setColor(`P${c1_}Y${c2_}`, 255, 0, 0)
            }
        }

        let arrow = (c11_, c12_, c21_, c22_) => {
            this.ggb.evalCommand(`V${c11_}Y${c12_}Y${c21_}Y${c22_} = Vector(P${c11_}Y${c12_},P${c21_}Y${c22_})`)
            this.ggb.evalCommand(`SetCaption[V${c11_}Y${c12_}Y${c21_}Y${c22_}, "​"]`)
        }

        var direction = 1
        var c1 = 1
        var c2 = 0
        var cont = 0
        dot(0, 0, 0)
        this.ggb.evalCommand(`VC = Vector((0,0),(1,0))`)
        this.ggb.evalCommand(`SetCaption[VC, "​"]`)
        while (c1 < p || c2 < q) {
            const c1_ = c1
            const c2_ = c2
            if (direction) {
                direction = 0
                c1 = c2 + 1
                c2 = 0
                cont++
                dot(c1, c2, cont)
                arrow(c1_, c2_, c1, c2)
            } else {
                if (c1 != 0) {
                    c2++
                    c1--
                    cont++
                    dot(c1, c2, cont)
                    arrow(c1_, c2_, c1, c2)
                } else {
                    direction = 1
                }
            }
        }
        return cont
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

    makeProcces(x, y) {
        const p2 = document.getElementById("p3Prosessp2")
        const p4 = document.getElementById("p3Prosessp4")
        ExtText.tex(`f(p,q)=\\frac{(p+q)(p+q+1)}{2} + q`, p2)
        ExtText.tex(`f(${x},${y})=\\frac{(${x}+${y})(${x}+${y}+1)}{2} + ${y} = \\frac{${(parseInt(x) + parseInt(y)) * (parseInt(x) + parseInt(y) + 1)}}{2} + ${y} = \\textcolor{red}{\\text{${this.CPTG(x, y)}}}`, p4)
        document.getElementById("p3Prosessp5").innerHTML = `Therefore, the position for point ${x} and ${y} will be <a style="color: red">${this.CPTG(x, y)}.</a>`
    }

    execute(x, y) {
        const res = this.cantorParingSequence(x, y, this.CPTG(x, y))
        this.ggb.setPerspective("G")
        const x_ = parseInt(x) - 5
        const x__ = parseInt(x) + 5
        const y_ = parseInt(y) - 5
        const y__ = parseInt(y) + 5
        this.ggb.setCoordSystem(x_, x__, y_, y__)
        this.makeProcces(x, y, res)
    }

    main() {
        const this_ = this
        const dfltLenght = !window.typeOfUser ? window.innerHeight - 6 : window.innerWidth - 3
        var applet = new GGBApplet({
            appName: "graphing",
            width: dfltLenght,
            height: dfltLenght,
            showToolbar: false,
            showAlgebraInput: false,
            showMenuBar: false,
            showAlgebraView: false
        }, false)

        applet.inject("p3ggbContainer")

        var tried = 0
        let tryPerSecond = (x, y) => {
            setTimeout(function() {
                tried++
                this_.ggb = applet.getAppletObject()
                if (this_.ggb) {
                    try {
                        this_.clean()
                    } catch (_) {}
                    this_.execute(x, y)
                } else {
                    tryPerSecond(x, y)
                }
            }, 1000)
        }

        setTimeout(function() {
            tryPerSecond(this_.i1.value, this_.i2.value)
        }, 2000)

        this.b1.addEventListener("click", () => {
            tryPerSecond(this.i1.value, this.i2.value)
        })

        if (window.typeOfUser) {
            document.getElementById("p3CalcContainer").style.width = "100%"
        }
    }
}

export default CantorSets
