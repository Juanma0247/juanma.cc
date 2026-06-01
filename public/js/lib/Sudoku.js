import ExtText from '/js/core/ExtText.js'

class Sudoku {
  constructor() {
    this.VALUES = Array.from({ length: 9 }, (_, i) => i + 1)
    this.gridContainer = document.getElementById('j4Grid')
    this.grid = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
          Array.from({ length: 3 }, () => 0)
        )
      )
    )
    this.data = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
          Array.from({ length: 3 }, () => 0)
        )
      )
    )
    this.dataPossible = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
          Array.from({ length: 3 }, () => [])
        )
      )
    )
  }

  rN(n) {
    return Math.floor(Math.random() * n)
  }

  getLocalValues(i, j) {
    const res = []
    this.data[i][j].forEach(f => f.forEach(c => { if (c !== 0) res.push(c) }))
    return res
  }

  getAssociatedValues(i, j, f, c) {
    const res = [...this.getLocalValues(i, j)]
    this.data[i].forEach(i_ => i_[f].forEach(f_ => { if (f_ !== 0 && !res.includes(f_)) res.push(f_) }))
    this.data.forEach(i_ => i_[j].forEach(f_ => { if (f_[c] !== 0 && !res.includes(f_[c])) res.push(f_[c]) }))
    return res
  }

  possibleValues(i, j, f, c) {
    return this.VALUES.filter(e => !this.getAssociatedValues(i, j, f, c).includes(e))
  }

  setFirstValues() {
    let cont = 1
    while (cont < 10) {
      const i = this.rN(3), j = this.rN(3), f = this.rN(3), c = this.rN(3)
      if (this.data[i][j][f][c] === 0) {
        this.data[i][j][f][c] = cont
        cont++
      }
    }
  }

  setAllValues() {
    this.VALUES.forEach(val => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const f_c = Array.from({ length: 9 }, (_, o) => o)
          while (!this.getLocalValues(i, j).includes(val)) {
            try {
              if (!f_c.length) break
              const idx = this.rN(f_c.length)
              const code = f_c.splice(idx, 1)[0]
              const c_ = code % 3
              const f_ = Math.floor(code / 3)
              if (this.data[i][j][f_][c_] === 0 && this.possibleValues(i, j, f_, c_).includes(val)) {
                this.data[i][j][f_][c_] = val
              }
            } catch {
              this.data[i][j][1][1] = -1
              break
            }
          }
        }
      }
    })
  }

  setInterface() {
    for (let i = 0; i < 3; i++) {
      const row = ExtText.createElement('div', 'j4Row', this.gridContainer)
      for (let j = 0; j < 3; j++) {
        const internalGrid = ExtText.createElement('div', 'j4InternalGrid', row)
        for (let f = 0; f < 3; f++) {
          const internalRow = ExtText.createElement('div', 'j4InternalRow', internalGrid)
          for (let c = 0; c < 3; c++) {
            const element = ExtText.createElement('div', 'j4Element', internalRow)
            element.textContent = this.data[i][j][f][c]
            this.grid[i][j][f][c] = element
          }
        }
      }
    }
  }

  main() {
    this.setFirstValues()
    this.setAllValues()
    this.setInterface()
  }
}

export default Sudoku
