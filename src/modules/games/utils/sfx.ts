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

export { sfx, setMuted }
