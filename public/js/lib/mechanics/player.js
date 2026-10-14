// Playback bar for the simulations: play/pause, restart, a time slider and a
// speed selector. Time runs from 0 to `duration` seconds of simulated motion.

import { h, t, fmt } from './core.js'

const SPEEDS = [0.25, 0.5, 1, 2, 4]

export class Player {
  constructor(container, onTime) {
    this.onTime = onTime
    this.duration = 1
    this.time = 0
    this.speed = 1
    this.playing = false
    this.last = 0

    this.btnPlay = h('button', { class: 'mxPlayBtn is-icon', type: 'button', 'aria-label': 'Play' })
    this.btnReset = h('button', { class: 'mxPlayBtn is-icon', type: 'button', 'aria-label': 'Restart' })
    this.btnReset.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>'
    this.slider = h('input', { type: 'range', min: '0', max: '1000', step: '1', value: '0', class: 'mxPlaySlider', 'aria-label': 'Time' })
    this.readout = h('span', { class: 'mxPlayTime' })
    this.speedSel = h('select', { class: 'mxPlaySpeed', 'aria-label': 'Speed' },
      ...SPEEDS.map(s => h('option', { value: String(s), selected: s === 1 }, `${s}×`)))
    container.append(this.btnPlay, this.btnReset, this.slider, this.readout, this.speedSel)
    this.renderPlayIcon()

    this.btnPlay.addEventListener('click', () => (this.playing ? this.pause() : this.play()))
    this.btnReset.addEventListener('click', () => { this.seek(0); this.play() })
    this.slider.addEventListener('input', () => {
      this.pause()
      this.seek(Number(this.slider.value) / 1000 * this.duration)
    })
    this.speedSel.addEventListener('change', () => { this.speed = Number(this.speedSel.value) })
    this.tick = this.tick.bind(this)
  }

  renderPlayIcon() {
    this.btnPlay.innerHTML = this.playing
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>'
    this.btnPlay.setAttribute('aria-label', this.playing ? t('common.player.pause', 'Pause') : t('common.player.play', 'Play'))
  }

  setDuration(d, keepTime = false) {
    this.duration = Math.max(1e-6, d)
    if (!keepTime) this.time = Math.min(this.time, this.duration)
    this.sync()
  }

  seek(tt) {
    this.time = Math.max(0, Math.min(this.duration, tt))
    this.sync()
    this.onTime(this.time)
  }

  sync() {
    this.slider.value = String(Math.round(this.time / this.duration * 1000))
    this.readout.textContent = `t = ${fmt(this.time, 3)} s`
  }

  play() {
    if (this.time >= this.duration - 1e-9) this.time = 0
    this.playing = true
    this.last = performance.now()
    this.renderPlayIcon()
    requestAnimationFrame(this.tick)
  }

  pause() {
    this.playing = false
    this.renderPlayIcon()
  }

  tick(now) {
    if (!this.playing) return
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    // Long motions (a 5000 s tortoise race) are compressed to about 8 s of
    // screen time so the default speed is always watchable.
    const scale = Math.max(1, this.duration / 8)
    this.time += dt * this.speed * scale
    if (this.time >= this.duration) {
      this.time = this.duration
      this.playing = false
      this.renderPlayIcon()
    }
    this.sync()
    this.onTime(this.time)
    if (this.playing) requestAnimationFrame(this.tick)
  }
}
