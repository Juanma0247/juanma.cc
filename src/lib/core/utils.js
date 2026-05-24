export function ajustarTituloContenido(nombre) {
  const button = document.getElementById(nombre)
  const content = document.getElementById(`c${nombre}`)
  if (!button || !content) return
  content.style.display = 'none'
  button.addEventListener('click', () => {
    content.style.display = content.style.display === 'block' ? 'none' : 'block'
  })
}

export function ajustarHover(element, img, imgHV) {
  const cont = document.querySelector(`.${element}A`)
  const imagen = document.querySelector(`.${element}`)
  cont?.addEventListener('mouseleave', () => { imagen.src = img })
  cont?.addEventListener('mouseenter', () => { imagen.src = imgHV })
}