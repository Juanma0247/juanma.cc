class MinecraftCoords {
  constructor() {
    this.i1 = document.getElementById('h2i1')
    this.r1 = document.getElementById('h2r1')
    this.r2 = document.getElementById('h2r2')
    this.b1 = document.getElementById('h2b1')
    this.b2 = document.getElementById('h2b2')
  }

  getCoords(text) {
    const parts = text.split(' ')
    let res1 = ''
    let res2 = ''
    for (const part of parts) {
      const n = parseInt(part)
      if (!isNaN(n) && n !== 0) {
        res1 += `${parseInt(n * 8)} `
        res2 += `${parseInt(n / 8)} `
      }
    }
    return [res1.trim(), res2.trim()]
  }

  main() {
    this.i1.addEventListener('input', () => {
      const [r1, r2] = this.getCoords(this.i1.value)
      this.r1.value = r1
      this.r2.value = r2
    })
    this.b1.addEventListener('click', () => navigator.clipboard.writeText(this.r1.value))
    this.b2.addEventListener('click', () => navigator.clipboard.writeText(this.r2.value))
  }
}

export default MinecraftCoords
