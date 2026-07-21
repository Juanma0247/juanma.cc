import ExtText from '/js/core/ExtText.js'

const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`games.minesweeper.${key}`, fallback) : fallback

class MinesweeperBoard {
  constructor(heightBoard, widthBoard, data, seconds, score) {
    this.widthBoard = widthBoard
    this.heightBoard = heightBoard
    this.gridElement = document.querySelector('.j3Grid')
    this.t1 = document.getElementById('j3t1')
    this.grid = Array.from({ length: heightBoard }, () =>
      Array.from({ length: widthBoard }, () => 0)
    )
    this.numberOfMines = Math.floor((widthBoard * heightBoard * 20) / 100)
    this.sp1 = document.getElementById('j3Statisticsp1')
    this.sp2 = document.getElementById('j3Statisticsp2')
    this.sp3 = document.getElementById('j3Statisticsp3')
    this.sp4 = document.getElementById('j3Statisticsp4')
    this.data = data
      ? data
      : Array.from({ length: heightBoard }, () =>
          Array.from({ length: widthBoard }, () => 0)
        )
    this.seconds = seconds || 0
    this.score = score || 0
    this.loseGame = this.loseGame.bind(this)
    this.time = null
  }

  startTime() {
    if (this.time) clearInterval(this.time)
    this.time = setInterval(() => {
      this.seconds++
      this.setStatistics(this.seconds)
    }, 1000)
  }

  loseGame() {
    clearInterval(this.time)
    this.setStatistics(this.seconds)
    this.block(this.gridElement)
    this.gridElement.classList.add('j3GridLose')
    this.t1.textContent = t('kaboom', '¡Ka-Boom!')
    this.t1.style.color = '#ff3939'
    ;[this.sp1, this.sp2, this.sp3, this.sp4].forEach(s => (s.style.color = '#ff3939'))
    this.grid.forEach(i => {
      i.forEach(j => {
        this.removeFlag(j.parentElement)
        const mine = j.parentElement.querySelector('.j3ElementMine')
        if (mine) {
          mine.style.display = 'block'
          j.parentElement.style.backgroundColor = '#88000015'
        } else {
          j.parentElement.querySelector('p').style.display = 'block'
          j.parentElement.style.backgroundColor = '#88000015'
        }
      })
    })
  }

  winGame() {
    clearInterval(this.time)
    this.setStatistics(this.seconds)
    this.gridElement.classList.add('j3GridWin')
    this.t1.textContent = t('boardClear', 'Board clear!')
    this.t1.style.color = '#39ff39'
    ;[this.sp1, this.sp2, this.sp3, this.sp4].forEach(s => (s.style.color = '#39ff39'))
    this.grid.forEach(i => {
      i.forEach(j => {
        this.removeFlag(j.parentElement)
        const mine = j.parentElement.querySelector('.j3ElementMine')
        if (mine) {
          mine.style.display = 'block'
          j.parentElement.style.backgroundColor = '#00880015'
          ExtText.fillSVG(mine, '#39ff39', 'j3ElementMine')
        } else {
          j.parentElement.querySelector('p').style.display = 'block'
          j.parentElement.style.backgroundColor = '#00880015'
        }
      })
    })
  }

  dataIsNull() {
    return this.data.every(i => i.every(j => j === 0))
  }

  verifyWin() {
    return this.data.every(i => i.every(j => j > 8))
  }

  block(element) {
    const overlay = document.createElement('div')
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0',
      width: '100%', height: '100%',
      zIndex: '9999', cursor: 'default',
      background: 'rgba(0,0,0,0)',
    })
    element.appendChild(overlay)
  }

  setMines() {
    for (let i = 0; i < this.numberOfMines; i++) {
      const w_ = Math.abs(Math.floor(Math.random() * this.widthBoard))
      const h_ = Math.abs(Math.floor(Math.random() * this.heightBoard))
      if (this.data[h_][w_] === 0) {
        this.data[h_][w_] = 9
      } else {
        i--
      }
    }
  }

  get(i, j) {
    return i >= 0 && i < this.heightBoard && j >= 0 && j < this.widthBoard
      ? this.data[i][j]
      : -1
  }

  checkAndSetUp(i, j) {
    for (let i_ = -1; i_ < 2; i_++) {
      for (let j_ = -1; j_ < 2; j_++) {
        const v = this.get(i + i_, j + j_)
        if (v !== 9 && v >= 0) this.data[i + i_][j + j_]++
      }
    }
  }

  setValues() {
    for (let i = 0; i < this.heightBoard; i++) {
      for (let j = 0; j < this.widthBoard; j++) {
        if (this.data[i][j] === 9) this.checkAndSetUp(i, j)
      }
    }
  }

  removeFlag(element) {
    const flag = element.querySelector('.j3ElementFlag')
    if (flag) element.removeChild(flag)
  }

  checkAndSetCeroAux(i, j) {
    this.grid[i][j].style.display = 'block'
    this.grid[i][j].parentElement.style.backgroundColor = '#00888815'
    this.block(this.grid[i][j].parentElement)
    if (this.get(i, j) === 0) {
      this.data[i][j] = 10
      this.checkAndSetCero(i, j)
      this.removeFlag(this.grid[i][j].parentElement)
    } else if (this.data[i][j] < 9) {
      this.data[i][j] += 10
      this.removeFlag(this.grid[i][j].parentElement)
    }
  }

  checkAndSetCero(i, j) {
    if (this.get(i, j) === 0) {
      this.data[i][j] = 10
      this.grid[i][j].style.display = 'block'
      this.grid[i][j].parentElement.style.backgroundColor = '#00888815'
      this.removeFlag(this.grid[i][j].parentElement)
      this.block(this.grid[i][j].parentElement)
    }
    for (let i_ = -1; i_ < 2; i_++) {
      for (let j_ = -1; j_ < 2; j_++) {
        const v = this.get(i + i_, j + j_)
        if (v < 9 && v > -1) this.checkAndSetCeroAux(i + i_, j + j_)
      }
    }
  }

  verifyElement(i, j, element) {
    if (this.get(i, j) === 0) {
      this.checkAndSetCero(i, j)
    } else if (this.get(i, j) !== 9) {
      if (this.data[i][j] < 9) this.data[i][j] += 10
      this.grid[i][j].style.display = 'block'
      element.style.backgroundColor = '#00888815'
      this.block(element)
    } else {
      this.loseGame()
    }
    if (this.verifyWin()) this.winGame()
  }

  onClick(i, j, element) {
    let mousedownDetected = false
    let timer
    element.addEventListener('mousedown', () => {
      timer = setTimeout(() => {
        mousedownDetected = true
        if (!element.querySelector('.j3ElementFlag') && this.data[i][j] < 10) {
          const flag = ExtText.createElement('img', 'j3ElementFlag', element)
          flag.src = '/img/frag2.svg'
          element.querySelector('p').style.display = 'none'
          element.style.backgroundColor = '#00000000'
        } else {
          this.verifyElement(i, j, element)
          this.removeFlag(element)
        }
      }, 400)
    })
    element.addEventListener('mouseup', () => clearTimeout(timer))
    element.addEventListener('click', e => {
      if (mousedownDetected) {
        e.preventDefault()
        e.stopImmediatePropagation()
        mousedownDetected = false
      } else if (!element.querySelector('.j3ElementFlag')) {
        this.verifyElement(i, j, element)
      } else {
        element.querySelector('p').style.display = 'none'
      }
    })
  }

  placeGame(data) {
    this.startTime()
    for (let i = 0; i < this.heightBoard; i++) {
      const row = ExtText.createElement('div', 'j3Row', this.gridElement)
      for (let j = 0; j < this.widthBoard; j++) {
        const element = ExtText.createElement('div', 'j3Element', row)
        element.style.position = 'relative'
        let elementValue = ExtText.createElement('p', 'j3ElementValue', element)
        if (this.data[i][j] === 9) {
          elementValue = ExtText.createElement('img', 'j3ElementMine', element)
          elementValue.src = '/img/mine.svg'
          elementValue.style.display = 'none'
        } else if (this.data[i][j] > 9) {
          elementValue.textContent = this.data[i][j] - 10
          elementValue.style.display = 'block'
          element.style.backgroundColor = '#00888815'
          this.block(element)
        } else {
          elementValue.textContent = this.data[i][j]
          elementValue.style.display = 'none'
        }
        this.grid[i][j] = elementValue
        this.onClick(i, j, element)
      }
    }
  }

  setGame() {
    this.startTime()
    for (let i = 0; i < this.heightBoard; i++) {
      const row = ExtText.createElement('div', 'j3Row', this.gridElement)
      for (let j = 0; j < this.widthBoard; j++) {
        const element = ExtText.createElement('div', 'j3Element', row)
        element.style.position = 'relative'
        let elementValue = ExtText.createElement('p', 'j3ElementValue', element)
        if (this.data[i][j] === 9) {
          elementValue = ExtText.createElement('img', 'j3ElementMine', element)
          elementValue.src = '/img/mine.svg'
        } else {
          elementValue.textContent = this.data[i][j]
        }
        this.grid[i][j] = elementValue
        elementValue.style.display = 'none'
        this.onClick(i, j, element)
      }
    }
  }

  deleteGame() {
    clearInterval(this.time)
  }

  restart() {
    this.gridElement.innerHTML = ''
    this.gridElement.classList.remove('j3GridLose', 'j3GridWin')
    this.t1.style.color = 'var(--c1)'
    this.sp1.textContent = `${t('statTime', 'Time')}: 00s`
    this.sp2.textContent = `${t('statPercentage', 'Percentage')}: 0%`
    this.sp3.textContent = `${t('statMines', 'Mines')}: 0`
    this.sp4.textContent = `${t('statScore', 'Score')}: 0`
    ;[this.sp1, this.sp2, this.sp3, this.sp4].forEach(s => (s.style.color = 'var(--c1)'))
    this.deleteGame()
  }

  calcPercent() {
    let sum = 0
    this.data.forEach(i => i.forEach(j => { if (j > 9) sum++ }))
    return Math.floor((sum * 100) / (this.widthBoard * this.heightBoard - this.numberOfMines))
  }

  formTime(s) {
    let res = ''
    if (s > 3600) res += Math.floor(s / 3600).toString().padStart(2, '0') + 'h:'
    if (s > 60) res += Math.floor((s % 3600) / 60).toString().padStart(2, '0') + 'm:'
    res += (s % 60) + 's'
    return s ? res : '00s'
  }

  calcScore(s, p) {
    const r = Math.floor(this.widthBoard * this.heightBoard * p / 100) * 20 - s
    return r > 0 ? r : 0
  }

  setStatistics(seconds) {
    const p = this.calcPercent()
    this.sp1.textContent = `${t('statTime', 'Time')}: ${this.formTime(seconds)}`
    this.sp2.textContent = `${t('statPercentage', 'Percentage')}: ${p}%`
    this.sp3.textContent = `${t('statMines', 'Mines')}: ${this.numberOfMines}`
    this.sp4.textContent = `${t('statScore', 'Score')}: ${this.calcScore(seconds, p)}`
    this.score += this.calcScore(seconds, p)
  }

  getData() {
    return this.data
  }
}

export default MinesweeperBoard
