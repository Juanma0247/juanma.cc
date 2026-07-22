class ExtText {
  static tex(res, id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id
    katex.render(res, el, { throwOnError: false })
  }

  static addTexToElement(res, contId) {
    const dv = document.createElement('div')
    katex.render(res, dv, { throwOnError: false })
    document.getElementById(contId).append(dv)
  }

  static createElement(type, styleClass, to) {
    const el = document.createElement(type)
    if (styleClass) el.classList.add(styleClass)
    if (to) to.appendChild(el)
    return el
  }

  static fillSVG(img, color, styleClass) {
    const parent = img.parentElement
    const div = this.createElement('div', styleClass, '')
    fetch(img.src)
      .then(r => r.text())
      .then(svgText => {
        div.innerHTML = svgText
        div.querySelector('svg').querySelectorAll('path').forEach(p => { p.style.fill = color })
      })
    parent.replaceChild(div, img)
  }

  static block(element, id) {
    const overlay = document.createElement('div')
    if (id) overlay.id = id
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0',
      width: '100%', height: '100%',
      zIndex: '9999', cursor: 'default', background: 'rgba(0,0,0,0)'
    })
    element.appendChild(overlay)
  }

  static restrictNI(input, start, end, set, f = null, g = null) {
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' && input.value.trim() === '') {
        input.value = end
        e.preventDefault()
      }
    })
    input.addEventListener('input', () => {
      let value = input.value.trim()
      if (!/^-?\d*\.?\d*$/.test(value)) { input.value = value.slice(0, -1); return }
      if (value === '' || value === '-' || value === '.') return
      let num = Number(value)
      if (set === 'N' && (!Number.isInteger(num) || num < 0)) { input.value = ''; return }
      if (set === 'Z' && !Number.isInteger(num)) { input.value = ''; return }
      if (set === 'Q' && isNaN(num)) { input.value = ''; return }
      if (num < start || num > end) { input.value = ''; return }
      if (f && !f(num)) { input.value = num ? g(num) : 0 }
    })
  }

  static botonContent(button, content) {
    content.style.display = 'none'
    button.addEventListener('click', () => {
      content.style.display = content.style.display === 'block' ? 'none' : 'block'
    })
  }

  static linkButton(button, url) {
    button.addEventListener('click', () => { window.open(url, '_blank', 'noopener') })
  }
}

export default ExtText