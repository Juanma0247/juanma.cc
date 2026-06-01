import ExtText from '../core/ExtText.js'

class Ruffini {
    constructor() {
        this.i1 = document.getElementById("p6i1")
    }

    listToPol(values) {
        var aux = ""
        var cont = values.length - 1
        values.forEach(val => {
            if (val != 0) {
                var sign = val < 0 ? "-" : cont == values.length - 1 ? "" : "+"
                var xGrade = cont > 0 ? cont == 1 ? `x` : `x^{${cont}}` : ""
                var coefficient = val < 0 ? val * -1 : val
                coefficient = coefficient == 1 && cont != 0 ? "" : coefficient
                aux += `${sign}${coefficient}${xGrade}`
            }
            cont -= 1
        })
        return aux
    }

    showPreview(values) {
        ExtText.tex(`\\displaystyle ${this.listToPol(values)} = 0`, "p6Preview")
    }

    findDivisorsOf(n) {
        const aux = []
        const limit = Math.abs(n)
        for (let i = 1; i <= Math.sqrt(limit); i++) {
            if (limit % i === 0) {
                aux.push(i)
                if (i !== limit / i) {
                    aux.push(limit / i)
                }
            }
        }
        return aux.sort((i, j) => i - j)
    }

    findIntegerDivisors(values) {
        const a_n = this.findDivisorsOf(values[values.length - 1])
        const neg = a_n.map(val => -val)
        a_n.push(...neg)
        return a_n
    }

    findRuffiniTableValues(num, values) {
        const sum = [values[0]]
        const aux = []
        for (let i = 1; i < values.length; i++) {
            aux.push(sum[i - 1] * num)
            sum.push(values[i] + aux[i - 1])
        }
        const isExact = sum[sum.length - 1] == 0
        return { sum, aux, isExact }
    }

    exactdivisionValues(values) {
        var aux = []
        this.findIntegerDivisors(values).forEach(val => {
            if (this.findRuffiniTableValues(val, values).isExact) {
                aux.push(val)
            }
        })
        return aux
    }

    showRuffiniTable(num, values) {
        const tableValues = this.findRuffiniTableValues(num, values)
        ExtText.tex(`\\begin{array}{r||rrrr}
        ${num} & ${values.join("&")} \\\\
           &   & ${tableValues.aux.join("&")} \\\\
        \\hline
        \\hline
        & ${tableValues.sum.join("&")} \\\\
        \\end{array}
        `, "p6Process")
    }

    showRes(num, values) {
        const res = this.findRuffiniTableValues(num, values).sum.slice(0, -1)
        ExtText.tex(`(${this.listToPol(res)})(x${num > 0 ? num * -1 : "+" + (num * -1)}) = 0`, "p6Res")
    }

    action() {
        try {
            this.i1.value = this.i1.value.replace(/[^0-9\ -]/g, '').replace('  ', ' ')
        } catch (_) {}
        var values = this.i1.value.split(" ").map(val => parseInt(val))
        values = values.filter(val => Number.isInteger(val))
        const dividers = this.exactdivisionValues(values)
        if (dividers.length != 0) {
            this.showPreview(values)
            const minExactValue = dividers.at(0)
            this.showRuffiniTable(minExactValue, values)
            const secondPolinom = this.findRuffiniTableValues(dividers.at(0), values).sum.slice(0, -1)
            const secondDivisors = this.exactdivisionValues(secondPolinom)
            this.showRes(minExactValue, values)
        }
    }

    main() {
        this.i1.value = "1 -2 -11 12"
        this.i1.addEventListener("input", () => {
            this.action()
        })
        this.action()
    }
}

export default Ruffini
