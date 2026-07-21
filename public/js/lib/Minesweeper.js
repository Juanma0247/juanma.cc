import MinesweeperBoard from '/js/lib/MinesweeperBoard.js'
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { getFirestore, collection, getDocs, setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'

const DEFAULT_H = 10
const DEFAULT_W = 24

const t = (key, fallback) =>
  typeof window !== 'undefined' && window.i18nGet ? window.i18nGet(`games.minesweeper.${key}`, fallback) : fallback

async function setDocument(id, fields, col, db) {
  try {
    await setDoc(doc(collection(db, col), id), fields)
    return true
  } catch (e) {
    alert(`Error: ${e}`)
    return false
  }
}

async function getCollection(col, db) {
  try {
    const res = {}
    const snapshot = await getDocs(collection(db, col))
    snapshot.forEach(d => { res[d.id] = d.data() })
    return res
  } catch (e) {
    alert(`Error: ${e}`)
  }
}

class Minesweeper {
  constructor() {
    this.i1 = document.getElementById('j3i1')
    this.i2 = document.getElementById('j3i2')
    this.i3 = document.getElementById('j3i3')
    this.b1 = document.getElementById('j3b1')
    this.t1 = document.getElementById('j3t1')
    this.p3 = document.getElementById('j3p3')
    this.b2 = document.getElementById('j3b2')
    this.ngi1 = document.getElementById('j3ngi1')
    this.ngi2 = document.getElementById('j3ngi2')
    this.ngb1 = document.getElementById('j3ngb1')
    this.grid = document.querySelector('.j3Grid')
    this.options = document.querySelector('.j3Options')
    this.newGamer = document.querySelector('.j3NewGamer')
    this.statistics = document.querySelector('.j3Statistics')
    this.game = null
    this.id = null
    this.documents = null
  }

  createGame(h, w, data, seconds, score) {
    if (this.game) {
      this.game.deleteGame()
      this.game = null
    }
    if (data) {
      this.game = new MinesweeperBoard(h, w, data, seconds, score)
      this.game.restart()
      this.game.placeGame(data)
      this.game.setStatistics()
    } else {
      this.game = new MinesweeperBoard(h, w)
      this.game.restart()
      this.game.setMines()
      this.game.setValues()
      this.game.setGame()
      this.game.setStatistics()
    }
    this.i1.value = h
    this.i2.value = w
    return this.game
  }

  async addGamer(db) {
    if (!this.ngi1.value) { alert(t('msgEnterName', 'Please enter a name')); return }
    if (this.ngi2.value.length !== 4) { alert(t('msgCode4', 'Code must be exactly 4 digits')); return }
    const rnd = () => Math.floor(Math.random() * 10)
    const initials = this.ngi1.value.split(' ').map(n => n[0].toUpperCase()).join('')
    const password = initials + this.ngi2.value
    this.ngi2.value = `${rnd()}${rnd()}${rnd()}${rnd()}`
    if (this.documents[password]) {
      alert(t('msgUserExists', 'User already exists'))
      this.ngi2.value = `${rnd()}${rnd()}${rnd()}${rnd()}`
      return
    }
    const res = await setDocument(password, {
      password, name: this.ngi1.value, game: '', time: 0, score: 0,
    }, 'juanma_co_minesweeper_gamers', db)
    if (res) {
      alert(`${t('msgSavedId', 'Save your player ID:')} ${password}`)
      this.grid.style.display = 'block'
      this.options.style.display = 'block'
      this.statistics.style.display = 'block'
      this.newGamer.style.display = 'none'
      this.documents = await getCollection('juanma_co_minesweeper_gamers', db)
      this.loadMessage()
      this.i3.value = password
    }
  }

  loadMessage() {
    const fallback = [
      'You can do it, ', 'Go for victory, ', 'Believe in yourself, ',
      'Make history today, ', "It's your day, ", 'Have fun, ',
      'Make it count, ', 'Play with passion, ', 'Make it incredible, ',
      'Stay focused, ', 'Play for fun, ', "You'll surprise us, ",
      "You're unstoppable, ", "You're pure energy, ", 'Never give up, ',
      'Make it epic, ', "You'll achieve it, ", 'Break records, ',
      'Keep moving forward, ', 'Success awaits you, ',
    ]
    const messages = t('encouragements', fallback)
    const m = Math.floor(Math.random() * messages.length)
    this.t1.textContent = `${messages[m]}${this.documents[this.i3.value]['name'].split(' ')[0]}`
  }

  async main() {
    const db = getFirestore(initializeApp({
      apiKey: 'AIzaSyA-FjN6g5NSdmnmChCnGXiPJby4WwIZjRY',
      authDomain: 'my-page-76aa2.firebaseapp.com',
      projectId: 'my-page-76aa2',
      storageBucket: 'my-page-76aa2.firebasestorage.app',
      messagingSenderId: '794663582673',
      appId: '1:794663582673:web:830862e5d1d7a90bd03ef0',
      measurementId: 'G-PDJCCQTD82',
    }))

    this.documents = await getCollection('juanma_co_minesweeper_gamers', db)
    this.game = this.createGame(DEFAULT_H, DEFAULT_W)

    this.p3.addEventListener('click', () => {
      this.grid.style.display = 'none'
      this.options.style.display = 'none'
      this.statistics.style.display = 'none'
      this.newGamer.style.display = 'block'
      this.t1.textContent = t('register', 'Register')
    })

    this.ngb1.addEventListener('click', () => this.addGamer(db))

    // Track mode via a flag rather than the (translated) button label.
    this.b2.dataset.mode = 'load'
    this.b2.addEventListener('click', async () => {
      if (this.b2.dataset.mode === 'load') {
        if (!this.documents[this.i3.value]) { alert(t('msgUserNotFound', 'User not found')); return }
        try {
          const data = JSON.parse(this.documents[this.i3.value]['game'])
          const h = data.length
          const w = data[0].length
          this.id = this.i3.value
          this.b2.dataset.mode = 'save'
          this.b2.textContent = t('saveGame', 'SAVE GAME')
          this.loadMessage()
          this.game = this.createGame(h, w, data, this.documents[this.i3.value]['time'], this.documents[this.i3.value]['score'])
        } catch {
          this.id = this.i3.value
          this.b2.dataset.mode = 'save'
          this.b2.textContent = t('saveGame', 'SAVE GAME')
          this.game = this.createGame(DEFAULT_H, DEFAULT_W)
          this.loadMessage()
          alert(t('msgNoSavedGame', 'Player has no saved game'))
        }
      } else {
        const res = await setDocument(this.id, {
          game: JSON.stringify(this.game.data),
          time: this.game.seconds,
          score: this.documents[this.i3.value]['score'] + this.game.score,
          password: this.documents[this.i3.value]['password'],
          name: this.documents[this.i3.value]['name'],
        }, 'juanma_co_minesweeper_gamers', db)
        if (res) alert(t('msgGameSaved', 'Game saved successfully'))
      }
    })

    this.i3.addEventListener('input', () => { this.b2.dataset.mode = 'load'; this.b2.textContent = t('load', 'Load') })

    this.b1.addEventListener('click', () => {
      this.createGame(
        this.i1.value ? parseInt(this.i1.value) : DEFAULT_H,
        this.i2.value ? parseInt(this.i2.value) : DEFAULT_W
      )
      try { this.loadMessage() } catch { this.t1.textContent = t('subtitle', 'Minesweeper') }
    })
  }
}

export default Minesweeper
