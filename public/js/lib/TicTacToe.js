class TicTacToe {
  constructor() {
    this.t1 = document.getElementById('j1t1')
    this.i1 = document.getElementById('j1i1')
    this.i2 = document.getElementById('j1i2')
    this.i3 = document.getElementById('j1i3')
    this.i4 = document.getElementById('j1i4')
    this.i5 = document.getElementById('j1i5')
    this.i6 = document.getElementById('j1i6')
    this.i7 = document.getElementById('j1i7')
    this.i8 = document.getElementById('j1i8')
    this.i9 = document.getElementById('j1i9')
    this.contButtons = document.getElementById('j1contButtons')
    this.label = document.createElement('label')
    this.checkbox = document.createElement('input')
    this.b1 = document.getElementById('j1b1')
    this.inputs = [
      [this.i1, this.i2, this.i3],
      [this.i4, this.i5, this.i6],
      [this.i7, this.i8, this.i9],
    ]
    this.auxTurn = document.getElementById('j1auxTurn')
  }

  tresEnLinea(data) {
    for (let i = 0; i < 3; i++) {
      if (data[i][0] != 0 || data[0][i] != 0) {
        if (data[i][0] == data[i][1] && data[i][0] == data[i][2]) return data[i][0]
        if (data[0][i] == data[1][i] && data[0][i] == data[2][i] && data[0][i] != 0) return data[0][i]
      }
    }
    if (data[0][0] == data[1][1] && data[1][1] == data[2][2] && data[1][1] != 0) return data[0][0]
    if (data[0][2] == data[1][1] && data[1][1] == data[2][0] && data[1][1] != 0) return data[1][1]
    return 0
  }

  generarData() {
    const dataInput = [
      [this.i1.value, this.i2.value, this.i3.value],
      [this.i4.value, this.i5.value, this.i6.value],
      [this.i7.value, this.i8.value, this.i9.value],
    ]
    return dataInput.map(row =>
      row.map(v => (v === 'O' ? 1 : v === 'X' ? 2 : 0))
    )
  }

  auxReplace(i, j) {
    const aux = this.inputs[i][j]
    aux.value = 'X'
    aux.click()
    return 0
  }

  contraAtaque(data) {
    if (data[1][1] == 0) return this.auxReplace(1, 1)
    for (let f = 2; f > 0; f--) {
      for (let i = 0; i < 3; i++) {
        if (data[i][1] == data[i][2] && data[i][1] == f && data[i][0] == 0) return this.auxReplace(i, 0)
        if (data[i][0] == data[i][2] && data[i][0] == f && data[i][1] == 0) return this.auxReplace(i, 1)
        if (data[i][0] == data[i][1] && data[i][0] == f && data[i][2] == 0) return this.auxReplace(i, 2)
        if (data[1][i] == data[2][i] && data[1][i] == f && data[0][i] == 0) return this.auxReplace(0, i)
        if (data[0][i] == data[2][i] && data[0][i] == f && data[1][i] == 0) return this.auxReplace(1, i)
        if (data[0][i] == data[1][i] && data[0][i] == f && data[2][i] == 0) return this.auxReplace(2, i)
      }
      if (data[0][0] == data[1][1] && data[1][1] == f && data[2][2] == 0) return this.auxReplace(2, 2)
      if (data[2][2] == data[1][1] && data[1][1] == f && data[0][0] == 0) return this.auxReplace(0, 0)
      if (data[0][2] == data[1][1] && data[1][1] == f && data[2][0] == 0) return this.auxReplace(2, 0)
      if (data[2][0] == data[1][1] && data[1][1] == f && data[0][2] == 0) return this.auxReplace(0, 2)
    }
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (data[i][j] == 0) {
          this.inputs[i][j].value = 'X'
          this.inputs[i][j].click()
          return 0
        }
      }
    }
  }

  inputListener(input) {
    input.autocomplete = 'off'
    input.readOnly = true
    input.addEventListener('click', () => {
      let winner = 0
      if (this.checkbox.checked) {
        if (input.value !== 'X') {
          input.value = 'O'
          winner = this.tresEnLinea(this.generarData())
          if (winner == 0) this.contraAtaque(this.generarData())
          winner = this.tresEnLinea(this.generarData())
        }
      } else {
        if (this.auxTurn.textContent == '0') {
          input.value = 'O'
          this.auxTurn.textContent = '1'
        } else {
          input.value = 'X'
          this.auxTurn.textContent = '0'
        }
        winner = this.tresEnLinea(this.generarData())
      }
      const data = this.generarData()
      const full = data.every(row => !row.includes(0))
      if (full && winner == 0) {
        this.t1.textContent = 'Draw!'
      } else if (winner != 0) {
        this.t1.textContent = winner == 1 ? 'O wins!' : 'X wins!'
      }
    })
  }

  main() {
    const div = document.createElement('div')
    div.classList.add('divElementCheck')
    this.label.classList.add('labelForElementCheck')
    this.label.textContent = 'vs PC'
    const checkboxContainer = document.createElement('label')
    checkboxContainer.classList.add('checkboxContainer')
    this.checkbox.setAttribute('type', 'checkbox')
    this.checkbox.checked = false
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 64 64')
    svg.innerHTML = `<path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" class="checkboxSvg"></path>`
    checkboxContainer.addEventListener('click', () => {
      this.checkbox.checked = !this.checkbox.checked
    })
    checkboxContainer.appendChild(this.checkbox)
    checkboxContainer.appendChild(svg)
    div.appendChild(checkboxContainer)
    div.appendChild(this.label)
    this.contButtons.appendChild(div)

    this.b1.addEventListener('click', () => {
      for (let i = 1; i <= 9; i++) document.getElementById(`j1i${i}`).value = ''
      this.t1.textContent = 'Tic-Tac-Toe'
      this.auxTurn.textContent = '0'
    })

    this.inputs.flat().forEach(i => this.inputListener(i))
    checkboxContainer.click()
  }
}

export default TicTacToe
