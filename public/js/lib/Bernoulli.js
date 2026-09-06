class Bernoulli {
    constructor() {
        this.i1 = document.getElementById("p10i1")
        this.i2 = document.getElementById("p10i2")
        this.cb1 = document.getElementById("p10cb1")
        this.timeouts = []
    }

    graficOfBernoulli(n = 0) {
        this.ggb.evalCommand(`f(x) = (${this.i2.value} + x)^${n}`)
        this.ggb.evalCommand(`SetCaption[f, "(${this.i2.value} + x)^${n}"]`)
        this.ggb.evalCommand(`SetLabelMode[f, 1]`)
        this.ggb.evalCommand(`ShowLabel[f, true]`)
        this.ggb.setColor("f", 0, 0, 255)

        this.ggb.evalCommand(`g(x) = 1`)
        this.ggb.evalCommand(`SetCaption[g, "(${this.i2.value} + x)^${n}"]`)
        this.ggb.evalCommand(`SetLabelMode[g, 1]`)
        this.ggb.evalCommand(`ShowLabel[g, true]`)
        this.ggb.setColor("g", 255, 0, 0)

        this.ggb.evalCommand(`l2 : x = -(${this.i2.value} + 1)`)
        this.ggb.evalCommand(`ShowLabel[l2, false]`)
        this.ggb.setColor("l2", 128, 128, 128)

        this.ggb.evalCommand(`h(x) = f(x) - g(x)`)
        this.ggb.evalCommand(`SetCaption[h, "f(x) - g(x)"]`)
        this.ggb.evalCommand(`SetLabelMode[h, 1]`)
        this.ggb.evalCommand(`ShowLabel[h, true]`)
        this.ggb.setColor("h", 0, 255, 0)
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
        this.graficOfBernoulli()
        this.ggb.setPerspective("G")
        this.ggb.setCoordSystem(-3, 1, -10, 1)
        for (let i = 1; i < 1000; i++) {
            const id = setTimeout(() => {
                this.ggb.evalCommand(`l2 : x = -(${this.i2.value} + 1)`)
                if (this.cb1.checked) {
                    this.ggb.evalCommand(`f(x) = (${this.i2.value} + x)^${i * 2 + 1}`)
                    this.ggb.evalCommand(`g(x) = ${this.i2.value} + x${i * 2 + 1}`)
                } else {
                    this.ggb.evalCommand(`f(x) = (${this.i2.value} + x)^${i}`)
                    this.ggb.evalCommand(`g(x) = ${this.i2.value} + x${i}`)
                }
            }, (i * 300))
            this.timeouts.push(id)
        }
    }

    start() {
        this.i1.value = this.i1.value.replace(/[^0-9.-]/g, '')
        const this_ = this
        const dfltLenght = document.getElementById("p10ggbContainer").clientWidth || 320
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

        applet.inject("p10ggbContainer")

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
            }, 100)
        }
        tryToLoad()
    }

    action() {
        if (!this.ggb) return
        this.timeouts.forEach((id) => clearTimeout(id))
        this.timeouts = []
        const i = this.i1.value
        if (this.cb1.checked) {
            this.ggb.evalCommand(`f(x) = (${this.i2.value} + x)^${i * 2 + 1}`)
            this.ggb.evalCommand(`g(x) = ${this.i2.value} + x${i * 2 + 1}`)
        } else {
            this.ggb.evalCommand(`f(x) = (${this.i2.value} + x)^${i}`)
            this.ggb.evalCommand(`g(x) = ${this.i2.value} + x${i}`)
        }
    }

    main() {
        this.i1.addEventListener("input", () => {
            if (this.i1.value) {
                this.action()
            } else {
                this.executeGGB()
            }
        })

        this.i2.addEventListener("input", () => {
            if (this.i1.value) {
                this.action()
            } else {
                this.executeGGB()
            }
        })

        this.cb1.addEventListener("change", () => {
            if (this.i1.value) {
                this.action()
            }
        })

        this.start()
    }
}

export default Bernoulli
