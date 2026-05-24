import ExtText from '../core/ExtText.js'

class HillCipher {
  constructor() {
    this.i1  = document.getElementById('p1i1')
    this.i2  = document.getElementById('p1i2')
    this.i3  = document.getElementById('p1i3')
    this.r1  = document.getElementById('p1r1')
    this.r2  = document.getElementById('p1r2')
    this.e1  = document.getElementById('p1e1')
  }

  multiplicarMatrices(mA, mB) {
    try {
      if (mA[0].length !== mB.length) return 0
      const filas = mA.length, cols = mB[0].length
      const res = Array.from({ length: filas }, () => new Array(cols).fill(0))
      for (let i = 0; i < filas; i++)
        for (let j = 0; j < cols; j++)
          for (let k = 0; k < filas; k++)
            res[i][j] += mA[i][k] * mB[k][j]
      return res
    } catch { return 0 }
  }

  multiplicarMCporMatrices(mc, matrices) {
    return matrices.map(m => this.multiplicarMatrices(mc, m))
  }

  crearMatrizMC(chars, text, size, rows) {
    try {
      const all = Array.from({ length: size }, (_, i) => chars.indexOf(text[i]))
      const mat = []
      for (let i = 0; i < all.length; i += rows) mat.push(all.slice(i, i + rows))
      return mat
    } catch { return 0 }
  }

  crearMatrices(chars, text, size, rows) {
    try {
      const all = Array.from({ length: size }, (_, i) => chars.indexOf(text[i]))
      const mat = []
      for (let i = 0; i < all.length; i += rows) {
        const sub = all.slice(i, i + rows).map(v => [v])
        mat.push(sub)
      }
      const last = mat[mat.length - 1]
      if (last[rows - 1] >= 0) return mat
      for (let i = 0; i < rows - last.length + 1; i++) last.push([chars.length - 1])
      return mat
    } catch { return 0 }
  }

  modularMatrices(matrices, mod) {
    return matrices.map(m =>
      m.map(row => row.map(v => v % mod))
    )
  }

  matricesAMensaje(matrices, chars) {
    let res = ''
    for (const m of matrices)
      for (const row of m)
        for (const v of row) res += chars[v]
    return res
  }

  determinanteSarrus(mat) {
    const n = mat.length
    if (n === 1) return mat[0][0]
    if (n === 2) return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0]
    const ex = mat.map(r => [...r, ...r.slice(0, n - 1)])
    let s = 0, r = 0
    for (let i = 0; i < n; i++) {
      let pm = 1, rm = 1
      for (let j = 0; j < n; j++) { pm *= ex[j][j + i]; rm *= ex[n - j - 1][j + i] }
      s += pm; r -= rm
    }
    return s + r
  }

  matrizInversa(_mat) {
    const mat = _mat, n = mat.length
    const res = this.crearIdentidad(n)
    for (let i = 0; i < n; i++) {
      if (mat[i][i] === 0)
        for (let j = i + 1; j < n; j++)
          if (mat[j][i] !== 0) { this.intercambiarFilas(mat, i, j); this.intercambiarFilas(res, i, j); break }
      const pivot = mat[i][i]
      for (let j = 0; j < n; j++) { mat[i][j] /= pivot; res[i][j] /= pivot }
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const f = mat[j][i]
          for (let k = 0; k < n; k++) { mat[j][k] -= f * mat[i][k]; res[j][k] -= f * res[i][k] }
        }
      }
    }
    return res
  }

  intercambiarFilas(mat, f1, f2) { const t = mat[f1]; mat[f1] = mat[f2]; mat[f2] = t; return mat }

  crearIdentidad(n) {
    return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0))
  }

  matizAFraciones(mat) {
    return mat.map(row => row.map(v => { const f = math.fraction(v); return `${f.s * f.n}/${f.d}` }))
  }

  modularFraccion(frac, mod) {
    const [num, den] = frac.split('/').map(Number)
    const nMod = num < 0 ? mod - ((-num) % mod) : num % mod
    const dMod = this.encontrarInversoModular(den % mod, mod)
    return (nMod * dMod) % mod
  }

  inversaModulada(mi, mod) {
    return mi.map(row => row.map(v => this.modularFraccion(v, mod)))
  }

  encontrarInversoModular(n, mod) {
    for (let x = 1; x < mod; x++) if (((n % mod) * (x % mod)) % mod === 1) return x
    return 1
  }

  crearLtxTablaCaracteres(chars) {
    let res = ''
    for (let i = 0; i < chars.length / 10; i++) {
      let c = '', car = '', pos = ''
      for (let j = 0; j < 10; j++) {
        if (chars[10 * i + j]) { c += 'c'; car += `${chars[10 * i + j]}&`; pos += `${10 * i + j}&` }
      }
      res += `\\begin{array}{${c}}${car.slice(0, -1)} \\\\ ${pos.slice(0, -1)} \\\\ \\end{array}\\\\`
    }
    ExtText.tex(res, 'p1TablaDeCaracteres')
  }

  crearLtxMC(mc, text, n) {
    let r1 = '', r2 = ''
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) { r1 += `${text[n * i + j]}&`; r2 += `${mc[i][j]} &` }
      r1 = r1.slice(0, -1) + '\\\\'
      r2 = r2.slice(0, -1) + '\\\\'
    }
    ExtText.tex(`\\begin{matrix}${r1}\\end{matrix} = \\begin{bmatrix}${r2}\\end{bmatrix}`, 'p1MatrizDeCifrado')
  }

  crearLtxMatrices(matrices) {
    let res = '', cont = 0
    for (const m of matrices) {
      res += `\\begin{bmatrix}${m.map(r => `${r[0]} \\\\`).join('')}\\end{bmatrix}, \\,`
      if (++cont > 7) { res += '\\\\'; cont = 0 }
    }
    ExtText.tex(res.slice(0, -4), 'p1Matries')
  }

  crearLtxMCPorMatrices(mc, mats, mpm, mpmMod, n, mod) {
    let res = ''
    for (let f = 0; f < mats.length; f++) {
      let r1 = '', r2 = '', r3 = '', r4 = ''
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) r1 += `${mc[i][j]} &`
        r1 = r1.slice(0, -1) + '\\\\'
        r2 += `${mats[f][i][0]} \\\\`
        r3 += `${mpm[f][i][0]}\\,\\, mod(${mod})\\\\`
        r4 += `${mpmMod[f][i][0]} \\\\`
      }
      res += `\\begin{bmatrix}${r1}\\end{bmatrix} \\times \\begin{bmatrix}${r2}\\end{bmatrix}= \\begin{bmatrix}${r3}\\end{bmatrix} = \\begin{bmatrix}${r4}\\end{bmatrix}\\\\`
    }
    ExtText.tex(res, 'p1MCPorMatrices')
  }

  crearLtxMCInversa(mc, inv, invMod, n, mod) {
    let r1 = '', r2 = '', r3 = ''
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const [d, dn] = inv[i][j].split('/')
        r1 += `${mc[i][j]}&`
        r2 += `\\frac{${d}}{${dn}} \\,\\, mod(${mod}) &`
        r3 += `${invMod[i][j]} &`
      }
      r1 = r1.slice(0, -1) + '\\\\'
      r2 = r2.slice(0, -1) + '\\\\\\\\'
      r3 = r3.slice(0, -1) + '\\\\'
    }
    ExtText.tex(`=\\begin{bmatrix}${r1}\\end{bmatrix}^{-1} \\\\ = \\begin{bmatrix}${r2}\\end{bmatrix}\\\\ = \\begin{bmatrix}${r3}\\end{bmatrix}`, 'p1MCInversa')
  }

  crearLtxMCIPorMatrices(mci, mats, mpm, mpmMod, n, mod) {
    let res = ''
    for (let f = 0; f < mats.length; f++) {
      let r1 = '', r2 = '', r3 = '', r4 = ''
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) r1 += `${mci[i][j]} &`
        r1 = r1.slice(0, -1) + '\\\\'
        r2 += `${mats[f][i][0]} \\\\`
        r3 += `${mpm[f][i][0]}\\,\\, mod(${mod})\\\\`
        r4 += `${mpmMod[f][i][0]} \\\\`
      }
      res += `\\begin{bmatrix}${r1}\\end{bmatrix} \\times \\begin{bmatrix}${r2}\\end{bmatrix}= \\begin{bmatrix}${r3}\\end{bmatrix} = \\begin{bmatrix}${r4}\\end{bmatrix}\\\\`
    }
    ExtText.tex(res, 'p1MCIPorMatrices')
  }

  contextSeters() {
    const options  = ['p1Process', 'p1Introduction', 'p1Instructions'].map(id => document.getElementById(id))
    const contents = ['p1ContProcess', 'p1ContIntroduction', 'p1ContInstructions'].map(id => document.getElementById(id))
    options.forEach((opt, i) => {
      opt?.addEventListener('click', () => {
        options.forEach((o, j) => {
          const active = j === i
          o?.classList.toggle('p1OptionActive', active)
          if (contents[j]) contents[j].style.display = active && !o?.classList.contains('p1OptionActive') ? 'none' : active ? 'block' : 'none'
        })
      })
    })
  }

  starter() {
    this.i1.value = 'abcdefghijklmnopqrstuvwxyz1234567890 '
    this.i2.value = '2024'
    this.i3.value = ''
    ;[this.i1, this.i2, this.i3].forEach(el => el.addEventListener('input', () => {
      this.main()
      const regex = new RegExp(`[^${this.i1.value}\\s]`)
      this.i2.value = this.i2.value.replace(regex, '')
      this.i3.value = this.i3.value.replace(regex, '')
    }))
  }

  main() {
    this.contextSeters()
    document.getElementById('p1ContProcess')?.click()
    this.e1.style.display = 'none'
    if (this.i2.value.length <= 3) return

    const chars = this.i1.value
    const keyText = this.i2.value
    const text = this.i3.value
    const n = Math.floor(Math.sqrt(keyText.length))
    const tMC = n * n
    const mod = chars.length

    const mc    = this.crearMatrizMC(chars, keyText, tMC, n)
    const auxMC = this.crearMatrizMC(chars, keyText, tMC, n)
    const aux2  = this.crearMatrizMC(chars, keyText, tMC, n)
    const mats  = this.crearMatrices(chars, text, text.length, n)
    const mpm   = this.multiplicarMCporMatrices(aux2, mats)
    const mpmM  = this.modularMatrices(mpm, mod)
    const cipher = this.matricesAMensaje(mpmM, chars)
    const det   = this.determinanteSarrus(auxMC)

    if (det === 0) { this.e1.style.display = 'block'; this.e1.textContent = 'Determinant = 0'; return }

    const inv = this.matrizInversa(auxMC)
    const invFrac = this.matizAFraciones(inv)
    const invMod  = this.inversaModulada(invFrac, mod)

    const cipherMats = this.crearMatrices(chars, cipher, cipher.length, n)
    const mpmCI  = this.multiplicarMCporMatrices(invMod, cipherMats)
    const mpmCIM = this.modularMatrices(mpmCI, mod)
    const decrypted = this.matricesAMensaje(mpmCIM, chars)

    const check = this.matricesAMensaje(this.modularMatrices(this.multiplicarMCporMatrices(this.inversaModulada(this.matizAFraciones(this.matrizInversa(this.crearMatrizMC(chars, keyText, tMC, n))), mod), this.crearMatrices(chars, text, text.length, n)), mod), chars)

    if (text.slice(0, Math.floor(text.length / 2)) === check.slice(0, Math.floor(text.length / 2))) {
      this.r1.value = cipher
      this.r2.value = decrypted
      this.crearLtxTablaCaracteres(chars)
      this.crearLtxMC(mc, keyText, n)
      this.crearLtxMatrices(cipherMats)
      this.crearLtxMCPorMatrices(mc, mats, mpm, mpmM, n, mod)
      this.crearLtxMCInversa(mc, invFrac, invMod, n, mod)
      this.crearLtxMCIPorMatrices(invMod, cipherMats, mpmCI, mpmCIM, n, mod)
    } else {
      this.e1.style.display = 'block'
      this.e1.textContent = 'No modular inverse'
    }
  }
}

export default HillCipher