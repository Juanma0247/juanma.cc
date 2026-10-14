const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`games.tictactoe.${key}`, fallback) : fallback

const fill = (text, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), text)

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]
const CORNERS = [0, 2, 6, 8]
const DIFFICULTIES = ['easy', 'medium', 'impossible']
const SCORE_KEY = 'ttt-score-v1'
const SETTINGS_KEY = 'ttt-settings-v1'
const PC_DELAY = 420

const other = mark => (mark === 'X' ? 'O' : 'X')
const emptyCells = board => board.reduce((acc, c, i) => (c ? acc : [...acc, i]), [])
const pick = list => list[Math.floor(Math.random() * list.length)]

const findWin = board => {
  for (const line of LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { mark: board[a], line }
  }
  return null
}

const completingMove = (board, mark) => {
  for (const [a, b, c] of LINES) {
    const marks = [board[a], board[b], board[c]]
    if (marks.filter(m => m === mark).length === 2 && marks.includes(null)) return [a, b, c][marks.indexOf(null)]
  }
  return -1
}

const solved = new Map()

// Negamax value for `player` to move: 10 - n means a win n plies from now, n - 10 a loss, 0 a draw.
const solve = (board, player) => {
  const key = board.map(c => c || '-').join('') + player
  if (solved.has(key)) return solved.get(key)
  let best = -Infinity
  for (const i of emptyCells(board)) {
    best = Math.max(best, moveValue(board, player, i))
    if (best === 9) break
  }
  solved.set(key, best)
  return best
}

const moveValue = (board, player, i) => {
  board[i] = player
  let value
  if (findWin(board)) value = 9
  else if (!board.includes(null)) value = 0
  else {
    value = -solve(board, other(player))
    value += value > 0 ? -1 : value < 0 ? 1 : 0
  }
  board[i] = null
  return value
}

const moveValues = (board, player) => emptyCells(board).map(i => ({ i, value: moveValue(board, player, i) }))

const losingReplies = (board, player, i) => {
  board[i] = player
  const count = moveValues(board, other(player)).filter(m => m.value < 0).length
  board[i] = null
  return count
}

const perfectMove = (board, player) => {
  const values = moveValues(board, player)
  const best = Math.max(...values.map(m => m.value))
  const optimal = values.filter(m => m.value === best)
  if (best !== 0 || optimal.length === 1) return pick(optimal).i
  const traps = optimal.map(m => ({ i: m.i, traps: losingReplies(board, player, m.i) }))
  const most = Math.max(...traps.map(m => m.traps))
  return pick(traps.filter(m => m.traps === most)).i
}

const mediumMove = (board, player) => {
  const win = completingMove(board, player)
  if (win >= 0) return win
  const block = completingMove(board, other(player))
  if (block >= 0) return block
  if (!board[4]) return 4
  const corners = CORNERS.filter(i => !board[i])
  return corners.length ? pick(corners) : pick(emptyCells(board))
}

const easyMove = (board, player) => {
  const win = completingMove(board, player)
  if (win >= 0 && Math.random() < 0.6) return win
  return pick(emptyCells(board))
}

const STRATEGIES = { easy: easyMove, medium: mediumMove, impossible: perfectMove }

const readJSON = key => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}
const writeJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const freshScore = () => ({
  pc: Object.fromEntries(DIFFICULTIES.map(d => [d, { win: 0, draw: 0, loss: 0 }])),
  pvp: { X: 0, O: 0, draw: 0 },
})

const loadScore = () => {
  const score = freshScore()
  const saved = readJSON(SCORE_KEY)
  if (!saved || typeof saved !== 'object') return score
  const count = v => (Number.isInteger(v) && v > 0 ? v : 0)
  DIFFICULTIES.forEach(d => {
    Object.keys(score.pc[d]).forEach(k => { score.pc[d][k] = count(saved.pc?.[d]?.[k]) })
  })
  Object.keys(score.pvp).forEach(k => { score.pvp[k] = count(saved.pvp?.[k]) })
  return score
}

const SVG_MARKS = {
  X: '<svg viewBox="0 0 100 100" aria-hidden="true"><path class="ttt-stroke" pathLength="1" d="M24 24 L76 76" /><path class="ttt-stroke ttt-stroke--late" pathLength="1" d="M76 24 L24 76" /></svg>',
  O: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ttt-stroke" pathLength="1" cx="50" cy="50" r="27" transform="rotate(-90 50 50)" /></svg>',
}

class TicTacToe {
  constructor() {
    this.root = document.getElementById('tttRoot')
    this.boardEl = document.getElementById('tttBoard')
    this.cells = [...this.boardEl.querySelectorAll('.ttt-cell')]
    this.winLine = document.getElementById('tttWinLine')
    this.statusEl = document.getElementById('tttStatus')
    this.noteEl = document.getElementById('tttNote')
    this.evalEl = document.getElementById('tttEval')
    this.newBtn = document.getElementById('tttNew')
    this.undoBtn = document.getElementById('tttUndo')
    this.hintBtn = document.getElementById('tttHint')
    this.analysisInput = document.getElementById('tttAnalysis')
    this.scoreCtx = document.getElementById('tttScoreCtx')
    this.scoreTiles = [...document.querySelectorAll('.ttt-score-tile')]
    this.resetScoreBtn = document.getElementById('tttResetScore')

    const saved = readJSON(SETTINGS_KEY) || {}
    this.settings = {
      mode: ['pc', 'pvp'].includes(saved.mode) ? saved.mode : 'pc',
      difficulty: DIFFICULTIES.includes(saved.difficulty) ? saved.difficulty : 'impossible',
      human: ['X', 'O'].includes(saved.human) ? saved.human : 'X',
      starter: ['human', 'pc'].includes(saved.starter) ? saved.starter : 'human',
      pvpStarter: ['X', 'O'].includes(saved.pvpStarter) ? saved.pvpStarter : 'X',
      analysis: saved.analysis === true,
    }
    this.score = loadScore()
    this.pcTimer = null
    this.hintIndex = -1
  }

  get firstMark() {
    const s = this.settings
    if (s.mode === 'pvp') return s.pvpStarter
    return s.starter === 'human' ? s.human : other(s.human)
  }

  get current() {
    return this.history.length % 2 === 0 ? this.firstMark : other(this.firstMark)
  }

  get pcMark() {
    return other(this.settings.human)
  }

  isPcTurn() {
    return this.settings.mode === 'pc' && !this.over && this.current === this.pcMark
  }

  newGame() {
    clearTimeout(this.pcTimer)
    this.board = Array(9).fill(null)
    this.history = []
    this.over = false
    this.result = null
    this.lastMove = -1
    this.hintIndex = -1
    this.render()
    this.queuePcMove()
  }

  play(i) {
    if (this.over || this.board[i]) return
    this.board[i] = this.current
    this.history.push(i)
    this.lastMove = i
    this.hintIndex = -1
    const win = findWin(this.board)
    if (win) this.finish(win.mark, win.line)
    else if (!this.board.includes(null)) this.finish('draw')
    this.render()
    this.queuePcMove()
  }

  humanPlay(i) {
    if (this.isPcTurn() || this.pcTimer) return
    this.play(i)
  }

  queuePcMove() {
    clearTimeout(this.pcTimer)
    this.pcTimer = null
    if (!this.isPcTurn()) return
    this.pcTimer = setTimeout(() => {
      this.pcTimer = null
      const strategy = STRATEGIES[this.settings.difficulty]
      this.play(strategy([...this.board], this.pcMark))
    }, PC_DELAY)
  }

  finish(result, line = null) {
    this.over = true
    this.result = result
    this.winningLine = line
    this.tally(1)
  }

  tally(delta) {
    const s = this.settings
    if (s.mode === 'pvp') {
      this.score.pvp[this.result] = Math.max(0, this.score.pvp[this.result] + delta)
    } else {
      const key = this.result === 'draw' ? 'draw' : this.result === s.human ? 'win' : 'loss'
      const row = this.score.pc[s.difficulty]
      row[key] = Math.max(0, row[key] + delta)
    }
    writeJSON(SCORE_KEY, this.score)
  }

  canUndo() {
    if (this.settings.mode === 'pvp') return this.history.length > 0
    return this.history.some(i => this.board[i] === this.settings.human)
  }

  undo() {
    if (!this.canUndo()) return
    clearTimeout(this.pcTimer)
    this.pcTimer = null
    if (this.over) this.tally(-1)
    this.over = false
    this.result = null
    this.winningLine = null
    const human = this.settings.mode === 'pc' ? this.settings.human : null
    for (;;) {
      const i = this.history.pop()
      const mark = this.board[i]
      this.board[i] = null
      if (!human || mark === human) break
    }
    this.lastMove = -1
    this.hintIndex = -1
    this.render()
  }

  hint() {
    if (this.over || this.isPcTurn()) return
    this.hintIndex = perfectMove([...this.board], this.current)
    this.render()
    this.cells[this.hintIndex].focus()
  }

  setSetting(name, value) {
    if (name === 'analysis') {
      this.settings.analysis = value
      writeJSON(SETTINGS_KEY, this.settings)
      this.render()
      return
    }
    if (this.settings[name] === value) return
    this.settings[name] = value
    writeJSON(SETTINGS_KEY, this.settings)
    this.syncControls()
    this.newGame()
  }

  syncControls() {
    this.root.dataset.mode = this.settings.mode
    this.root.querySelectorAll('.seg-ctrl[data-setting]').forEach(group => {
      const value = this.settings[group.dataset.setting]
      group.querySelectorAll('.seg-opt').forEach(btn => {
        const active = btn.dataset.value === value
        btn.classList.toggle('is-active', active)
        btn.setAttribute('aria-pressed', String(active))
      })
    })
    this.analysisInput.checked = this.settings.analysis
  }

  statusText() {
    const pc = this.settings.mode === 'pc'
    if (this.over) {
      if (this.result === 'draw') return t('draw', 'Draw!')
      if (pc) return this.result === this.settings.human ? t('youWin', 'You win!') : t('pcWins', 'The machine wins!')
      return this.result === 'X' ? t('xWins', 'X wins!') : t('oWins', 'O wins!')
    }
    if (pc && this.current === this.pcMark) return t('pcThinking', 'The machine is thinking…')
    if (pc) return fill(t('yourTurn', 'Your turn ({mark})'), { mark: this.current })
    return fill(t('turnOf', '{mark} to move'), { mark: this.current })
  }

  noteText() {
    if (!this.over || this.settings.mode !== 'pc') return ''
    const d = this.settings.difficulty
    if (this.result === 'draw' && d === 'impossible') return t('noteDraw', 'Perfect play from both sides always ends like this.')
    if (this.result === this.pcMark && d === 'impossible') return t('noteLoss', 'Use Undo and try the analysis to see where the game slipped away.')
    if (this.result === this.settings.human && d !== 'impossible') return t('noteWin', 'Ready for the next level? Try Impossible.')
    return ''
  }

  evaluation(value) {
    if (value === 0) return { kind: 'draw', label: t('evalDraw', 'Draw') }
    const plies = 10 - Math.abs(value)
    const moves = Math.ceil(plies / 2)
    if (value > 0) {
      return { kind: 'win', label: t('evalWin', 'Win'), title: fill(t('evalWinIn', 'Wins in {n} move(s)'), { n: moves }) }
    }
    return { kind: 'loss', label: t('evalLoss', 'Loss'), title: fill(t('evalLossIn', 'Loses in {n} move(s)'), { n: moves }) }
  }

  render() {
    const showAnalysis = this.settings.analysis && !this.over && !this.isPcTurn()
    const values = showAnalysis ? new Map(moveValues([...this.board], this.current).map(m => [m.i, m.value])) : null
    const thinking = this.isPcTurn()
    const winners = new Set(this.over && this.winningLine ? this.winningLine : [])

    this.cells.forEach((cell, i) => {
      const mark = this.board[i]
      if (cell.dataset.mark !== (mark || '')) {
        cell.dataset.mark = mark || ''
        cell.innerHTML = mark ? SVG_MARKS[mark] : ''
        cell.classList.toggle('is-new', i === this.lastMove)
      }
      cell.classList.toggle('is-win', winners.has(i))
      cell.classList.toggle('is-hint', i === this.hintIndex)
      cell.setAttribute('aria-disabled', String(Boolean(mark) || this.over || thinking))
      cell.querySelector('.ttt-badge')?.remove()
      let label = `${t('square', 'Square')} ${i + 1}`
      if (mark) label += `: ${mark}`
      if (values?.has(i)) {
        const ev = this.evaluation(values.get(i))
        const badge = document.createElement('span')
        badge.className = `ttt-badge is-${ev.kind}`
        badge.textContent = ev.label
        cell.appendChild(badge)
        cell.title = ev.title || ev.label
        label += `, ${ev.label}`
      } else {
        cell.removeAttribute('title')
      }
      cell.setAttribute('aria-label', label)
    })

    this.boardEl.classList.toggle('is-over', this.over)
    this.boardEl.classList.toggle('is-draw', this.result === 'draw')
    this.boardEl.setAttribute('aria-busy', String(thinking))
    if (this.over || thinking) delete this.boardEl.dataset.turn
    else this.boardEl.dataset.turn = this.current
    this.drawWinLine()

    this.statusEl.textContent = this.statusText()
    this.statusEl.dataset.state = this.over ? (this.result === 'draw' ? 'draw' : 'win') : thinking ? 'thinking' : 'turn'
    this.noteEl.textContent = this.noteText()

    if (this.settings.analysis && !this.over) {
      const value = solve([...this.board], this.current)
      this.evalEl.textContent = value > 0
        ? fill(t('evalLineWin', '{mark} can force a win from here.'), { mark: this.current })
        : value < 0
          ? fill(t('evalLineWin', '{mark} can force a win from here.'), { mark: other(this.current) })
          : t('evalLineDraw', 'With perfect play from here, the game is a draw.')
    } else {
      this.evalEl.textContent = ''
    }

    this.undoBtn.disabled = !this.canUndo()
    this.hintBtn.disabled = this.over || thinking
    this.renderScore()
  }

  drawWinLine() {
    const line = this.over ? this.winningLine : null
    this.winLine.classList.toggle('is-visible', Boolean(line))
    if (!line) return
    const center = i => [(i % 3) + 0.5, Math.floor(i / 3) + 0.5]
    const [x1, y1] = center(line[0])
    const [x2, y2] = center(line[2])
    const dx = (x2 - x1) * 0.14
    const dy = (y2 - y1) * 0.14
    const path = this.winLine.querySelector('line')
    path.setAttribute('x1', x1 - dx)
    path.setAttribute('y1', y1 - dy)
    path.setAttribute('x2', x2 + dx)
    path.setAttribute('y2', y2 + dy)
    this.winLine.classList.toggle('is-o', this.result === 'O')
  }

  renderScore() {
    const s = this.settings
    let tiles
    if (s.mode === 'pvp') {
      const row = this.score.pvp
      this.scoreCtx.textContent = t('modePvp', '2 players')
      tiles = [['X', row.X], [t('scoreDraws', 'Draws'), row.draw], ['O', row.O]]
    } else {
      const row = this.score.pc[s.difficulty]
      this.scoreCtx.textContent = `${t('modePc', 'vs machine')} · ${t(s.difficulty, s.difficulty)}`
      tiles = [[t('scoreYou', 'You'), row.win], [t('scoreDraws', 'Draws'), row.draw], [t('scorePc', 'Machine'), row.loss]]
    }
    this.scoreTiles.forEach((tile, i) => {
      tile.querySelector('.ttt-score-label').textContent = tiles[i][0]
      tile.querySelector('.ttt-score-value').textContent = tiles[i][1]
    })
  }

  resetScore() {
    const s = this.settings
    if (s.mode === 'pvp') this.score.pvp = freshScore().pvp
    else this.score.pc[s.difficulty] = { win: 0, draw: 0, loss: 0 }
    writeJSON(SCORE_KEY, this.score)
    this.renderScore()
  }

  moveFocus(from, key) {
    const row = Math.floor(from / 3)
    const col = from % 3
    const deltas = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    const [dr, dc] = deltas[key]
    const next = ((row + dr + 3) % 3) * 3 + ((col + dc + 3) % 3)
    this.cells[next].focus()
  }

  bindEvents() {
    this.cells.forEach((cell, i) => {
      cell.addEventListener('click', () => this.humanPlay(i))
      cell.addEventListener('keydown', e => {
        if (!e.key.startsWith('Arrow')) return
        e.preventDefault()
        this.moveFocus(i, e.key)
      })
    })
    this.newBtn.addEventListener('click', () => this.newGame())
    this.undoBtn.addEventListener('click', () => this.undo())
    this.hintBtn.addEventListener('click', () => this.hint())
    this.resetScoreBtn.addEventListener('click', () => this.resetScore())
    this.analysisInput.addEventListener('change', () => this.setSetting('analysis', this.analysisInput.checked))
    this.root.querySelectorAll('.seg-ctrl[data-setting]').forEach(group => {
      group.addEventListener('click', e => {
        const btn = e.target.closest('.seg-opt')
        if (btn) this.setSetting(group.dataset.setting, btn.dataset.value)
      })
    })

    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return
      const key = e.key.toLowerCase()
      if (/^[1-9]$/.test(key)) {
        const i = Number(key) - 1
        if (this.board[i] || this.over) return
        this.humanPlay(i)
        this.cells[i].focus()
      } else if (key === 'n') this.newGame()
      else if (key === 'u') this.undo()
      else if (key === 'h') this.hint()
    })

    window.addEventListener('langchanged', () => this.render())
  }

  main() {
    this.syncControls()
    this.bindEvents()
    this.newGame()
  }
}

export default TicTacToe
