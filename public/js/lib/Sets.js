import ExtText from '/js/core/ExtText.js'

class Venn {
    constructor(a, b) {
        this.a = this.setToList(a)
        this.b = this.setToList(b)
    }

    setToTex(set) {
        var res = ""
        if (set instanceof Set) {
            if (set.size == 0) {
                res = "\\varnothing"
            } else {
                res += "\\{"
                for (let i of set) {
                    res += this.setToTex(i) + ","
                }
                res = res.slice(0, -1)
                res += "\\}"
            }
        } else {
            res += set + ""
        }
        return res
    }

    setToList(set) {
        var res = []
        for (let i of set) {
            res.push((i instanceof Set) ? JSON.stringify({...i}) : i)
        }
        return res
    }

    draw() {
        document.getElementById("p2VeenDiagram").innerHTML = ""
        new p5((p) => {
            p.setup = () => {
                p.createCanvas(300, 200)
                p.textAlign(p.CENTER, p.CENTER)
                p.dibujarDiagramaVenn()
            }

            p.dibujarDiagramaVenn = () => {
                p.background(0, 0, 0, 0)
                let centroA = { x: 100, y: 100 }
                let centroB = { x: 200, y: 100 }
                let radio = 60

                p.stroke(255, 255, 255)
                p.strokeWeight(2)
                p.fill(p.color(0, 128, 128))
                p.ellipse(centroA.x, centroA.y, radio * 2)

                p.fill(p.color(255, 255, 255, 100))
                p.ellipse(centroB.x, centroB.y, radio * 2)
                p.strokeWeight(0)

                p.textSize(18)
                p.fill(255, 255, 255)
                p.text("A", centroA.x, centroA.y - radio - 20)
                p.fill(255, 255, 255)
                p.text("B", centroB.x, centroB.y - radio - 20)

                let soloA = this.a.filter(e => !this.b.includes(e))
                let soloB = this.b.filter(e => !this.a.includes(e))
                let interseccion = this.a.filter(e => this.b.includes(e))

                p.fill(255, 255, 255)
                p.textSize(16)

                soloA.forEach((e, i) => p.text(e, centroA.x - 25, centroA.y - 25 + i * 20))
                soloB.forEach((e, i) => p.text(e, centroB.x + 25, centroB.y - 25 + i * 20))
                interseccion.forEach((e, i) => p.text(e, (centroA.x + centroB.x) / 2, centroA.y + i * 20))
            }
        }, 'p2VeenDiagram')
    }
}

class Sets {
    constructor() {
        this.i1 = document.getElementById("p2i1")
        this.i2 = document.getElementById("p2i2")
        this.ggb = null

        this.inputOnFocus = this.i1
        this.i1.addEventListener("focus", () => {
            this.inputOnFocus = this.i1
        })
        this.i2.addEventListener("focus", () => {
            this.inputOnFocus = this.i2
        })
    }

    isSet(str) {
        const srt_ = str.replace(/\s+/g, '')
        var res = this.isClosed(srt_)
        if (res) {
            for (let i of this.split(srt_)) {
                if (i.charAt(0) == "{" && i.slice(-1) == "}") {
                    res = this.isSet(i)
                } else {
                    res = !(i.includes("{") || i.includes("}"))
                }
            }
        }
        return res
    }

    isClosed(str) {
        var cont = 0
        for (let i of str) { (i == "{") ? cont++ : (i == "}") ? cont-- : cont }
        return cont == 0
    }

    split(str) {
        var res = []
        var aux = ""
        var cont = 0
        const str_ = (str.charAt(0) == "{" && str.slice(-1) == "}") ? str.slice(1, -1) : str
        for (let i of str_) {
            if (i != ",") {
                aux += i
            }
            if (cont != 0 && i == ",") {
                aux += ","
            }
            (i == "{") ? cont++ : (i == "}") ? cont-- : cont
            if (i == "," && cont == 0) {
                res.push(aux)
                aux = ""
            }
        }
        if (aux != "") {
            res.push(aux)
        }
        return res
    }

    strToSet(str) {
        var set = new Set()
        if (str == "{}") {
            return new Set()
        }
        var str_ = str.replace(/\s+/g, '')
        if (str_.charAt(0) == "{" && !str_.slice(1, -1).includes("{")) {
            str_ = str_.slice(1, -1)
        }
        for (let i of this.split(str_)) {
            if (i.charAt(0) == "{") {
                set.add(this.strToSet(i))
            } else {
                set.add(i)
            }
        }
        return set
    }

    setToTex(set) {
        var res = ""
        if (set instanceof Set) {
            if (set.size == 0) {
                res = "\\varnothing"
            } else {
                let set_ = [...set]
                if (set_.length == 2) {
                    if (set_[1] instanceof Set) {
                        res += `(${set_[0]},${(set_[1].size == 2) ? [...set_[1]][1] : set_[0]})`
                    } else {
                        res += "\\{"
                        for (let i of set) {
                            res += this.setToTex(i) + ","
                        }
                        res = res.slice(0, -1)
                        res += "\\}"
                    }
                } else {
                    res += "\\{"
                    for (let i of set) {
                        res += this.setToTex(i) + ","
                    }
                    res = res.slice(0, -1)
                    res += "\\}"
                }
            }
        } else {
            res += set + ""
        }
        return res
    }

    equality(a, b) {
        if (a.size !== b.size) {
            return false
        }
        for (let i of a) {
            if (!b.has(i)) {
                return false
            }
        }
        return true
    }

    containment(a, b) {
        if (!(b instanceof Set)) {
            if (a instanceof Set) {
                return false
            } else {
                return a == b
            }
        }
        if (b.size == 0) {
            return false
        }
        for (let i of a) {
            if (i instanceof Set) {
                let flag = false
                for (let j of b) {
                    if (j instanceof Set && j.size == i.size) {
                        if (this.containment(i, j)) {
                            flag = true
                            break
                        }
                    }
                }
                if (!flag) {
                    return false
                }
            } else {
                if (!b.has(i)) {
                    return false
                }
            }
        }
        return true
    }

    colapse(a) {
        const r_ = new Set()
        const res = new Set()
        for (let i of a) {
            if (i instanceof Set) {
                const r__ = Array.from(i).sort().join(',')
                if (!r_.has(r__)) {
                    r_.add(r__)
                    res.add(i)
                }
            } else {
                res.add(i)
            }
        }
        return res
    }

    belonging(a, b) {
        let aux = a
        return (b.has(aux)) ? true : false
    }

    union(a, b) {
        var res = a
        for (let j of b) {
            res.add(j)
        }
        if (res.size == 0) {
            return new Set()
        }
        return this.colapse(res)
    }

    intersection(a, b) {
        const aStr = new Set([...a].map(e => JSON.stringify(e)))
        const bStr = new Set([...b].map(e => JSON.stringify(e)))
        const interseccionStr = new Set([...aStr].filter(e => bStr.has(e)))
        return new Set([...interseccionStr].map(e => JSON.parse(e)))
    }

    difference(a, b) {
        var res = new Set()
        for (let i of a) {
            if (i instanceof Set) {
                let contain
                for (let j of b) {
                    contain = this.containment(j, i)
                    if (contain) {
                        break
                    }
                }
                if (!contain) {
                    res.add(i)
                }
            } else {
                if (!b.has(i)) {
                    res.add(i)
                }
            }
        }
        if (res.size == 0) {
            return new Set()
        }
        return res
    }

    symmetricDifference(a, b) {
        var res = new Set()
        for (let i of a) {
            if (!b.has(i)) {
                res.add(i)
            }
        }
        for (let i of b) {
            if (!a.has(i)) {
                res.add(i)
            }
        }
        if (res.size == 0) {
            return new Set()
        }
        return res
    }

    partsOf(set) {
        const aux = Array.from(set)
        const res = new Set()
        for (let i = 0; i < 2 ** aux.length; i++) {
            const e = new Set()
            for (let j = 0; j < aux.length; j++) {
                if (i & (1 << j)) {
                    e.add(aux[j])
                }
            }
            (e.size != 0) ? res.add(e) : res.add(new Set())
        }
        return this.colapse(res)
    }

    generalizedUnion(set) {
        const res = new Set()
        for (let i of set) {
            if (i instanceof Set) {
                for (let j of this.generalizedUnion(i)) {
                    res.add(j)
                }
            } else {
                res.add(i)
            }
        }
        return res
    }

    generalizedIntersection(set) {
        let sToL = [...set]
        for (let i of sToL) {
            if (!(i instanceof Set)) {
                return new Set()
            }
        }
        if (set.size === 0) return new Set()
        let res = new Set()
        for (let elem of set.values().next().value) {
            let belongsToAll = true
            for (let subset of set) {
                if (!subset.has(elem)) {
                    belongsToAll = false
                    break
                }
            }
            if (belongsToAll) {
                res.add(elem)
            }
        }
        return res
    }

    cartesianProduct(a, b) {
        let res = new Set()
        for (let i of a) {
            for (let j of b) {
                let aux = new Set()
                let aux2 = new Set()
                aux.add(i)
                aux2.add(i)
                aux2.add(j)
                aux.add(aux2)
                res.add(aux)
            }
        }
        return res
    }

    cardinal(a) {
        return a.size
    }

    differenceCardinal(a, b) {
        return this.difference(a, b).size
    }

    intersectionCardinal(a, b) {
        const aux = this.intersection(a, b)
        return (aux.size == 0) ? a.size + b.size : a.size + b.size - aux.size
    }

    unionCardinal(a, b) {
        return this.union(a, b).size
    }

    cartesianCardinal(a, b) {
        return a.size * b.size
    }

    numericRandomSet(n, a) {
        var res = new Set()
        for (let f = 0; f < n; f++) {
            res.add(Math.floor(Math.random() * a))
        }
        return res
    }

    alphabetRandomSet(n) {
        var res = new Set()
        let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        for (let i = 0; i < n; i++) {
            let randomIndex = Math.floor(Math.random() * alphabet.length)
            let randomLetter = alphabet[randomIndex]
            res.add(randomLetter)
        }
        return res
    }

    collectAlphabetic(a, b) {
        let res = new Set()
        while (res.size < a) {
            res.add(this.alphabetRandomSet(b))
        }
        return res
    }

    collectNumeric(t, n, a) {
        let res = new Set()
        while (res.size < t) {
            res.add(this.numericRandomSet(n, a))
        }
        return res
    }

    getA() {
        return this.strToSet(this.i1.value)
    }

    getB() {
        return this.strToSet(this.i2.value)
    }

    setResOnLong(key, set) {
        document.getElementById("p2Res").innerHTML = ""
        ExtText.addTexToElement(`${key}: \\{`, "p2Res", "p2LaTex0")
        let s = [...set]
        let sL = s.length - 1
        let sum = 0
        let str = ""
        let end = 0

        while (sL >= 0 || !end) {
            end = sL < 0
            if (sum < 50 && !end) {
                if (sL > 0) {
                    let sF = (!end) ? "," : ""
                    str += this.setToTex(s[sL]) + sF
                    sum += this.setToTex(s[sL]).length
                }
                sL--
            } else {
                str = (!end)
                    ? str
                    : (str.substring(0, str.length - 1)
                        + `${(str.includes(")")) ? "" : ", \\varnothing"}\\}`)
                ExtText.addTexToElement(str, "p2Res", `p2LaTex${sL}`)
                sum = 0
                str = ""
            }
        }
    }

    setRes(key, set) {
        let sTT = this.setToTex(set)
        if (sTT.length > 100) {
            this.setResOnLong(key, set)
        } else {
            ExtText.tex(`${key}:\\,\\,` + sTT, "p2Res")
        }
    }

    makeOption(val, f, optNum) {
        const o = ExtText.createElement("button", `p2Option`, document.getElementById(`p2Options${optNum}`))
        ExtText.tex(val, o)
        o.addEventListener("click", () => {
            this.setRes(val, f())
        })
    }

    makeTopOption(val, f, optNum, options) {
        const b = ExtText.createElement("button", `p2OptionTopButton`, document.getElementById(`p2Options${optNum}`))
        let inputsRes = []
        for (let i = 0; i < options.length; i++) {
            const input = ExtText.createElement("input", `p2InputOption`, document.getElementById(`p2Options${optNum}`))
            input.setAttribute('type', 'number')
            input.value = options[i]
            inputsRes.push(input)
        }
        ExtText.tex(val, b)
        b.addEventListener("click", () => {
            const inputValues = Array.from(inputsRes).map(input => parseInt(input.value))
            this.i1.value = ""
            this.i1.value = this.setToTex(f(...inputValues)).replaceAll(/\\/g, "")
        })
    }

    createOptions() {
        document.getElementById(`p2Options1`).innerHTML = ""
        document.getElementById(`p2Options2`).innerHTML = ""

        this.makeTopOption("\\text{Rndm Num}", (n, a) => {
            return this.numericRandomSet(n, a)
        }, 0, [6, 100])

        this.makeTopOption("\\text{\\{Rndm Num\\}}", (t, n, a) => {
            return this.collectNumeric(t, n, a)
        }, 0, [3, 3, 100])

        this.makeTopOption("\\text{Rndm Alpha}", (n) => {
            return this.alphabetRandomSet(n)
        }, 0, [6])

        this.makeTopOption("\\text{\\{Rndm Alpha\\}}", (n, a) => {
            return this.collectAlphabetic(n, a)
        }, 0, [2, 5])

        this.makeOption("A \\cup B", () => {
            return this.union(this.getA(), this.getB())
        }, 1)
        this.makeOption("A \\cap B", () => {
            return this.intersection(this.getA(), this.getB())
        }, 1)
        this.makeOption("A \\times B", () => {
            return this.cartesianProduct(this.getA(), this.getB())
        }, 1)
        this.makeOption("A \\setminus B", () => {
            return this.difference(this.getA(), this.getB())
        }, 1)
        this.makeOption("A \\bigtriangleup B", () => {
            return this.symmetricDifference(this.getA(), this.getB())
        }, 1)

        this.makeOption("|A|", () => {
            return this.cardinal(this.getA())
        }, 2)
        this.makeOption("|A \\cup B|", () => {
            return this.union(this.getA(), this.getB()).size
        }, 2)
        this.makeOption("|A \\cap B|", () => {
            return this.intersection(this.getA(), this.getB()).size
        }, 2)
        this.makeOption("|A \\times B|", () => {
            return this.cartesianProduct(this.getA(), this.getB()).size
        }, 2)
        this.makeOption("|A \\setminus B|", () => {
            return this.difference(this.getA(), this.getB()).size
        }, 2)
        this.makeOption("|A \\bigtriangleup B|", () => {
            return this.symmetricDifference(this.getA(), this.getB()).size
        }, 2)
        this.makeOption("|B|", () => {
            return this.cardinal(this.getB())
        }, 2)

        this.makeOption("\\bigcup A_i", () => {
            return this.generalizedUnion(this.getA())
        }, 3)
        this.makeOption("\\bigcap A_i", () => {
            return this.generalizedIntersection(this.getA())
        }, 3)
        this.makeOption("\\mathscr{P}(A)", () => {
            return this.partsOf(this.getA())
        }, 3)
        this.makeOption("\\bigcup B_i", () => {
            return this.generalizedUnion(this.getB())
        }, 3)
        this.makeOption("\\bigcap B_i", () => {
            return this.generalizedIntersection(this.getB())
        }, 3)
        this.makeOption("\\mathscr{P}(B)", () => {
            return this.partsOf(this.getB())
        }, 3)

        this.makeOption("\\text{Venn Diagram}", () => {
            const veen = new Venn(this.getA(), this.getB())
            veen.draw()
            return ""
        }, 4)
    }

    main() {
        const this_ = this
        this.i1.value = "{0,1,2,3,4}"
        this.i2.value = "{3,4,5,6,7}"
        this.createOptions()

        document.getElementById("p2bchange").addEventListener("click", () => {
            let a = this.i1.value
            this.i1.value = this.i2.value
            this.i2.value = a
        })

        let setKeys = () => {
            const pos1 = this.inputOnFocus.selectionStart
            const pos2 = this.inputOnFocus.selectionEnd
            this.inputOnFocus.focus()
            if (pos1 == pos2) {
                this.inputOnFocus.value = this.inputOnFocus.value.slice(0, pos1) + "{}" + this.inputOnFocus.value.slice(pos1)
                this.inputOnFocus.setSelectionRange(pos1 + 1, pos2 + 1)
            } else {
                this.inputOnFocus.value = this.inputOnFocus.value.slice(0, pos1)
                    + "{" + this.inputOnFocus.value.slice(pos1, pos2)
                    + "}" + this.inputOnFocus.value.slice(pos2)
                this.inputOnFocus.setSelectionRange(pos1 + 1, pos2 + 1)
            }
        }

        document.getElementById("p2bsetSet").addEventListener("click", () => {
            setKeys()
        })

        document.addEventListener('keydown', function(event) {
            if (event.key == 'quote') {
                setKeys()
                this_.i1.value = this_.i1.value.replaceAll("´", "").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
            }
        })
    }
}

export default Sets
