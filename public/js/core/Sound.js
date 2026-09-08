// Plucked-string sonification kit built on plain Web Audio.
//
// Voices are Karplus-Strong strings rendered offline into AudioBuffers. The
// usual node-graph version of that algorithm feeds a DelayNode back into
// itself, but a delay inside a cycle cannot go below one render quantum
// (128 samples), which caps the pitch near 340 Hz. Rendering the delay line
// in JS instead makes the tuning exact at any pitch and costs one pass at
// startup.
//
// Pitches are quantised to a pentatonic scale: it has no adjacent semitones
// and no tritone, so no two notes in it can clash. That is what keeps an
// arbitrary stream of values sounding musical rather than like a siren.

const SCALES = {
  major: [0, 2, 4, 7, 9],
  minor: [0, 3, 5, 7, 10]
}

const BASE_FREQ = 220      // a3
const OCTAVES = 3
const MAX_DECAY = 0.9      // seconds of string rendered per buffer
const ATTACK = 0.004       // short fade-in; without it the buffer starts on a click
const MIN_IOI = 28         // ms between onsets, i.e. ~35 notes/second ceiling
const MAX_VOICES = 12
const WET = 0.18

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// One noise burst circulating through a delay line with an averaging lowpass.
//
// Two corrections keep this in tune, and both matter more the higher the note
// gets, because n shrinks to ~30 samples at the top of the range:
//
//  1. The loop is not n samples long. Each pass writes back the average of a
//     sample and the one *after* it, which is a half-sample advance, so the
//     real period is n - 0.5 and the pitch comes out sharp of rate / n.
//  2. n still has to be a whole number of samples, leaving up to ~30 cents of
//     rounding on the top octave.
//
// So the caller gets the frequency actually produced and trims the rest with
// playbackRate, instead of accepting an audibly out-of-tune string.
function pluckBuffer(ctx, freq, seconds, damping = 0.996) {
  const rate = ctx.sampleRate
  const n = Math.max(2, Math.round(rate / freq + 0.5))
  const actual = rate / (n - 0.5)
  const total = Math.ceil(seconds * rate)
  const buffer = ctx.createBuffer(1, total, rate)
  const out = buffer.getChannelData(0)
  const line = new Float32Array(n)
  // A raw white-noise excitation sounds zingy; smoothing it first gives the
  // mellower kalimba-ish attack.
  let prev = 0
  for (let i = 0; i < n; i++) {
    prev = prev * 0.6 + (Math.random() * 2 - 1) * 0.4
    line[i] = prev
  }
  let p = 0
  for (let i = 0; i < total; i++) {
    const next = (p + 1) % n
    out[i] = line[p]
    line[p] = damping * 0.5 * (line[p] + line[next])
    p = next
  }
  return { buffer, actual }
}

// Exponentially decaying noise, decorrelated per channel. Synthesised rather
// than downloaded so the reverb costs no bytes.
function impulseBuffer(ctx, seconds, decay) {
  const rate = ctx.sampleRate
  const length = Math.ceil(seconds * rate)
  const buffer = ctx.createBuffer(2, length, rate)
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  return buffer
}

class Sound {
  constructor(scale = 'major') {
    this.ctx = null
    this.scaleName = SCALES[scale] ? scale : 'major'
    this.enabled = true
    this.buffers = []
    this.voices = new Set()
    this.pending = null
    this.lastOnset = 0
    this.drone = null
  }

  get scale() { return SCALES[this.scaleName] }
  get degrees() { return this.scale.length * OCTAVES }

  frequency(degree) {
    const scale = this.scale
    const semitones = scale[degree % scale.length] + 12 * Math.floor(degree / scale.length)
    return BASE_FREQ * Math.pow(2, semitones / 12)
  }

  // -- Lifecycle ----------------------------------------
  // Must be called from a user gesture: browsers refuse to start an
  // AudioContext otherwise.

  async start() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return false
      this.ctx = new Ctx()
      this.buildChain()
      this.renderBuffers()
    }
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume() } catch { return false }
    }
    return true
  }

  buildChain() {
    const ctx = this.ctx
    this.limiter = ctx.createDynamicsCompressor()
    this.limiter.threshold.value = -10
    this.limiter.knee.value = 12
    this.limiter.ratio.value = 12
    this.limiter.attack.value = 0.003
    this.limiter.release.value = 0.25

    this.master = ctx.createGain()
    this.master.gain.value = 0.9

    this.reverb = ctx.createConvolver()
    this.reverb.buffer = impulseBuffer(ctx, 1.8, 2.5)
    this.send = ctx.createGain()
    this.send.gain.value = WET

    this.master.connect(this.limiter)
    this.limiter.connect(ctx.destination)
    this.send.connect(this.reverb)
    this.reverb.connect(this.master)
  }

  renderBuffers() {
    if (!this.ctx) return
    this.buffers = []
    for (let d = 0; d < this.degrees; d++) {
      const target = this.frequency(d)
      const { buffer, actual } = pluckBuffer(this.ctx, target, MAX_DECAY)
      this.buffers.push({ buffer, ratio: target / actual })
    }
  }

  setScale(name) {
    if (!SCALES[name] || name === this.scaleName) return
    this.scaleName = name
    this.renderBuffers()
  }

  setEnabled(on) {
    this.enabled = !!on
    if (!on) this.reset()
  }

  reset() {
    this.pending = null
    this.stopDrone()
    this.voices.forEach(v => { try { v.stop() } catch {} })
    this.voices.clear()
  }

  // -- Voices -------------------------------------------

  track(source) {
    if (this.voices.size >= MAX_VOICES) {
      const oldest = this.voices.values().next().value
      if (oldest) { try { oldest.stop() } catch {} this.voices.delete(oldest) }
    }
    this.voices.add(source)
    source.addEventListener('ended', () => this.voices.delete(source), { once: true })
  }

  note({ degree, pan = 0, decay = 0.4, gain = 0.4, octave = 0, when = 0 }) {
    if (!this.enabled || !this.ctx || !this.buffers.length) return
    const ctx = this.ctx
    const t = ctx.currentTime + when
    const source = ctx.createBufferSource()
    const voice = this.buffers[clamp(Math.round(degree), 0, this.buffers.length - 1)]
    source.buffer = voice.buffer
    source.playbackRate.value = voice.ratio * Math.pow(2, octave)

    const env = ctx.createGain()
    // Exponential ramps cannot start from or reach exact zero.
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(Math.max(gain, 0.001), t + ATTACK)
    env.gain.exponentialRampToValueAtTime(0.0001, t + ATTACK + decay)

    const panner = ctx.createStereoPanner()
    panner.pan.value = clamp(pan, -1, 1)

    source.connect(env)
    env.connect(panner)
    panner.connect(this.master)
    panner.connect(this.send)
    source.start(t)
    source.stop(t + ATTACK + decay + 0.05)
    this.track(source)
  }

  // Low body knock layered under an accent so swaps read as hits, not pitches.
  thump(pan = 0, gain = 0.3) {
    if (!this.enabled || !this.ctx) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(170, t)
    osc.frequency.exponentialRampToValueAtTime(62, t + 0.12)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(gain, t + 0.006)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
    const panner = ctx.createStereoPanner()
    panner.pan.value = clamp(pan * 0.4, -1, 1)
    osc.connect(env)
    env.connect(panner)
    panner.connect(this.master)
    osc.start(t)
    osc.stop(t + 0.16)
  }

  // -- Progress pad -------------------------------------
  // Two detuned saws plus a fifth, under a lowpass that opens as the caller
  // reports progress. The run brightens as it resolves.

  startDrone() {
    if (!this.enabled || !this.ctx || this.drone) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 180
    filter.Q.value = 1.2
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.05, t + 1.2)
    const oscillators = [[0.5, -6], [0.5, 6], [0.75, 0]].map(([ratio, detune]) => {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = BASE_FREQ * ratio
      osc.detune.value = detune
      osc.connect(filter)
      osc.start(t)
      return osc
    })
    filter.connect(gain)
    gain.connect(this.master)
    gain.connect(this.send)
    this.drone = { oscillators, filter, gain }
  }

  setProgress(p) {
    if (!this.drone || !this.ctx) return
    // Squared so most of the brightening lands near the end, where it pays off.
    const value = clamp(p, 0, 1)
    const cutoff = 180 + value * value * 2200
    this.drone.filter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.3)
  }

  stopDrone() {
    if (!this.drone || !this.ctx) return
    const { oscillators, gain } = this.drone
    const t = this.ctx.currentTime
    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
    oscillators.forEach(o => { try { o.stop(t + 0.7) } catch {} })
    this.drone = null
  }

  // -- Event stream -------------------------------------
  // The caller can emit far more steps than any ear (or synth) can take: at
  // a 1 ms delay that is 1000 per second. Events inside the same slot are
  // coalesced rather than dropped blindly, keeping the accented one.

  step(event) {
    if (!this.enabled || !this.ctx) return
    if (event.accent || !this.pending) this.pending = event
    const now = performance.now()
    if (now - this.lastOnset < MIN_IOI) return
    this.lastOnset = now
    const pending = this.pending
    this.pending = null
    this.fire(pending)
  }

  fire(event) {
    const { value, max, pan = 0, tick = 50, accent = false, progress = null } = event
    const degree = Math.round((value - 1) / Math.max(1, max - 1) * (this.degrees - 1))
    const decay = clamp(tick / 1000 * 8, 0.12, MAX_DECAY)
    if (accent) {
      this.note({ degree, pan, decay: decay * 1.3, gain: 0.5, octave: -1 })
      this.thump(pan)
    } else {
      this.note({ degree, pan, decay, gain: 0.34 })
    }
    if (progress !== null) this.setProgress(progress)
  }

  // Rising run over the finished data. Because a sorted array ascends, this
  // is a pentatonic glissando for free.
  finale(data) {
    if (!this.enabled || !this.ctx || !data || !data.length) return
    const n = data.length
    const steps = Math.min(8, n)
    const span = Math.max(1, n - 1)
    for (let k = 0; k < steps; k++) {
      const index = Math.min(n - 1, Math.floor((k / steps) * n))
      const degree = Math.round((data[index] - 1) / span * (this.degrees - 1))
      this.note({
        degree,
        pan: (index / span) * 2 - 1,
        decay: MAX_DECAY,
        gain: 0.42,
        when: k * 0.07
      })
    }
    this.setProgress(1)
    setTimeout(() => this.stopDrone(), steps * 70 + 700)
  }
}

export default Sound
export { SCALES }
