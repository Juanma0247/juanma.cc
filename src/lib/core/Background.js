class Background {
  static main() {
    const svg = document.getElementById('ocean')
    let width = window.innerWidth
    let height = window.innerHeight
    let animationId = null

    const randomShade = () => {
      const g = Math.floor(Math.random() * 100) + 100
      const b = Math.floor(Math.random() * 200) + 55
      const a = Math.random() * 0.1 + 0.3
      return `rgba(0,${g},${b},${a})`
    }

    const createWave = (y, amp, freq, phase, color, bAmp, bFreq, bPhase) => {
      const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      wave.setAttribute('fill', color)
      svg.appendChild(wave)
      return { wave, y, amp, freq, phase, color, bAmp, bFreq, bPhase }
    }

    const waves = Array.from({ length: 10 }, () =>
      createWave(
        Math.random() * height,
        Math.random() * 40 + 30,
        Math.random() * 250 + 150,
        Math.random() * Math.PI * 2,
        randomShade(),
        Math.random() * 35 + 25,
        Math.random() * 280 + 180,
        Math.random() * Math.PI * 2
      )
    )

    const updateWave = (w, time) => {
      let path = ''
      for (let x = 0; x <= width; x += 30) {
        const oy = w.amp * Math.sin(x / w.freq + w.phase + time)
        path += x === 0 ? `M ${x} ${w.y + oy}` : ` L ${x} ${w.y + oy}`
      }
      for (let x = width; x >= 0; x -= 30) {
        const oy = w.bAmp * Math.sin(x / w.bFreq + w.bPhase + time * 0.8)
        path += ` L ${x} ${w.y + 120 + oy}`
      }
      path += ' Z'
      w.wave.setAttribute('d', path)
    }

    const animate = () => {
      width = window.innerWidth
      height = window.innerHeight
      const time = Date.now() * 0.001
      waves.forEach(w => {
        updateWave(w, time)
        w.phase += 0.005
        w.bPhase += 0.003
      })
      animationId = requestAnimationFrame(animate)
    }

    const reset = () => {
      cancelAnimationFrame(animationId)
      width = window.innerWidth
      height = window.innerHeight
      svg.innerHTML = ''
      waves.length = 0
      waves.push(
        ...Array.from({ length: 10 }, () =>
          createWave(
            Math.random() * height * 0.6 + height * 0.2,
            Math.random() * 40 + 30,
            Math.random() * 250 + 150,
            Math.random() * Math.PI * 2,
            randomShade(),
            Math.random() * 35 + 25,
            Math.random() * 280 + 180,
            Math.random() * Math.PI * 2
          )
        )
      )
      animate()
    }

    window.addEventListener('resize', reset)
    animate()
  }
}

export default Background