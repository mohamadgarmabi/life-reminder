// Synthesized blips: no audio files to download or cache.
let audio: AudioContext | null = null
let muted = false

const setMuted = (value: boolean) => {
  muted = value
}

const beep = (freq: number, ms = 70, type: OscillatorType = 'square', volume = 0.04) => {
  if (muted) return
  try {
    audio ??= new AudioContext()
    const t = audio.currentTime
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000)
    osc.connect(gain).connect(audio.destination)
    osc.start(t)
    osc.stop(t + ms / 1000)
  } catch {
    // No Web Audio: play silently.
  }
}

// Short haptic pulse where supported (Android); iOS Safari has no vibrate and ignores this.
const buzz = (ms: number) => !muted && navigator.vibrate?.(ms)

const sfx = {
  tap: () => beep(520, 40, 'triangle'),
  point: () => beep(880, 60),
  hit: () => {
    beep(220, 90, 'sawtooth')
    buzz(40)
  },
  win: () => [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 120, 'triangle', 0.05), i * 110)),
  lose: () => {
    buzz(120)
    ;[330, 247, 196].forEach((f, i) => setTimeout(() => beep(f, 140, 'triangle', 0.05), i * 120))
  },
}

/** Continuous engine note for driving games: `set(rev 0..1, on)` every frame or so; `stop()` when leaving. */
const createEngine = () => {
  const idle = { set: (_rev: number, _on: boolean) => {}, stop: () => {} }
  try {
    audio ??= new AudioContext()
  } catch {
    return idle
  }
  const ctx = audio
  const base = ctx.createOscillator()
  const sub = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  base.type = 'sawtooth'
  sub.type = 'square'
  filter.type = 'lowpass'
  filter.Q.value = 3
  gain.gain.value = 0
  base.connect(filter)
  sub.connect(filter)
  filter.connect(gain).connect(ctx.destination)
  base.start()
  sub.start()
  return {
    set: (rev: number, on: boolean) => {
      // Browsers start audio suspended until a tap; the game's start button is one.
      if (ctx.state === 'suspended') void ctx.resume()
      const t = ctx.currentTime
      base.frequency.setTargetAtTime(38 + rev * 110, t, 0.08)
      sub.frequency.setTargetAtTime(19 + rev * 55, t, 0.08)
      filter.frequency.setTargetAtTime(250 + rev * 1600, t, 0.1)
      gain.gain.setTargetAtTime(on && !muted ? 0.03 + rev * 0.025 : 0, t, 0.1)
    },
    stop: () => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
      base.stop(ctx.currentTime + 0.3)
      sub.stop(ctx.currentTime + 0.3)
    },
  }
}

export { sfx, setMuted, createEngine }
