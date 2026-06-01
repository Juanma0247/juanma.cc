class StringTool {
  constructor() {
    this.i1 = document.getElementById('h1i1')
    this.i2 = document.getElementById('h1i2')
    this.i3 = document.getElementById('h1i3')
    this.i4 = document.getElementById('h1i4')
    this.i5 = document.getElementById('h1i5')
    this.i6 = document.getElementById('h1i6')
    this.i7 = document.getElementById('h1i7')
    this.i8 = document.getElementById('h1i8')
    this.i9 = document.getElementById('h1i9')
    this.ta1 = document.getElementById('h1ta1')
    this.p1 = document.getElementById('h1p1')
  }

  transform() {
    try {
      const src = this.i1.value.toString()
      if (src.includes(this.i8.value) && this.i8.value !== '') {
        const words = src.split(this.i8.value)
        this.ta1.value = words.filter(t => t !== this.i8.value).join(this.i9.value)
        this.p1.textContent = src.length
        return
      }
      let result = ''
      for (const ch of src) result += `${this.i4.value}${ch}${this.i5.value}`
      result = `${this.i2.value}${result}${this.i3.value}`
      if (this.i6.value) result = result.repeat(Number(this.i6.value))
      if (this.i7.value) result = result.substring(0, result.length / Number(this.i7.value))
      this.ta1.value = result
      this.p1.textContent = src.length
    } catch (error) {
      alert(error)
    }
  }

  main() {
    const watched = [this.i1, this.i2, this.i3, this.i4, this.i5, this.i6, this.i7, this.i8, this.i9]
    watched.forEach(input => input.addEventListener('input', () => this.transform()))
  }
}

export default StringTool
