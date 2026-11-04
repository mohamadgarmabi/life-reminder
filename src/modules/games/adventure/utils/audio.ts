// Every sound is synthesized with Web Audio: nothing to download, cache or license.
// Two buses: "music" (ambience + ending music) and "sfx". All calls are no-ops without Web Audio.

type Ambience = 'surf' | 'forest' | 'ruins' | 'cliff' | 'temple' | 'summit' | 'room'
type Sfx = 'step' | 'pickup' | 'right' | 'wrong' | 'stone' | 'water' | 'open' | 'page'

let ctx: AudioContext | null = null
let music: GainNode | null = null
let sfx: GainNode | null = null
let noise: AudioBuffer | null = null
let current: { name: Ambience; out: GainNode; stop: () => void } | null = null
const volumes = { music: 0.7, sfx: 0.8 }

const safe = (fn: () => void) => {
  try {
    fn()
  } catch {
    // No Web Audio (or a closed context): the game plays silently.
  }
}

/** Call from a tap handler: iOS only starts audio inside a user gesture. */
const unlockAudio = () =>
  safe(() => {
    if (!ctx) {
      ctx = new AudioContext()
      music = ctx.createGain()
      sfx = ctx.createGain()
      music.gain.value = volumes.music
      sfx.gain.value = volumes.sfx
      music.connect(ctx.destination)
      sfx.connect(ctx.destination)
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const data = noise.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    }
    void ctx.resume()
  })

const setVolumes = (v: { music: number; sfx: number }) => {
  volumes.music = v.music
  volumes.sfx = v.sfx
  safe(() => {
    music?.gain.setTargetAtTime(v.music, ctx!.currentTime, 0.05)
    sfx?.gain.setTargetAtTime(v.sfx, ctx!.currentTime, 0.05)
  })
}

const suspendAudio = () => safe(() => void ctx?.suspend())
const resumeAudio = () => safe(() => void ctx?.resume())

const noiseSource = (c: AudioContext) => {
  const src = c.createBufferSource()
  src.buffer = noise
  src.loop = true
  return src
}

const lfo = (c: AudioContext, rate: number, depth: number, target: AudioParam) => {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.frequency.value = rate
  gain.gain.value = depth
  osc.connect(gain).connect(target)
  osc.start()
  return osc
}

/** Builds one looping ambience bed; returns its stoppable nodes. */
const buildAmbience = (c: AudioContext, name: Ambience, out: GainNode) => {
  const nodes: AudioScheduledSourceNode[] = []
  const timers: number[] = []
  const bed = (type: BiquadFilterType, freq: number, q: number, level: number, swell = 0, swellRate = 0.1) => {
    const src = noiseSource(c)
    const filter = c.createBiquadFilter()
    const gain = c.createGain()
    filter.type = type
    filter.frequency.value = freq
    filter.Q.value = q
    gain.gain.value = level
    src.connect(filter).connect(gain).connect(out)
    src.start()
    nodes.push(src)
    if (swell) nodes.push(lfo(c, swellRate, swell, gain.gain))
    return filter
  }
  const drone = (freq: number, level: number) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = level
    osc.connect(gain).connect(out)
    osc.start()
    nodes.push(osc, lfo(c, 0.07, freq * 0.004, osc.frequency))
  }
  // Random short events (birds, drips), rescheduled until stopped.
  const sprinkle = (minMs: number, maxMs: number, play: () => void) => {
    const next = () => {
      timers.push(
        window.setTimeout(
          () => {
            safe(play)
            next()
          },
          minMs + Math.random() * (maxMs - minMs),
        ),
      )
    }
    next()
  }
  const blip = (from: number, to: number, ms: number, level: number) => {
    const t = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.frequency.setValueAtTime(from, t)
    osc.frequency.exponentialRampToValueAtTime(to, t + ms / 1000)
    gain.gain.setValueAtTime(level, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000)
    osc.connect(gain).connect(out)
    osc.start(t)
    osc.stop(t + ms / 1000)
  }

  switch (name) {
    case 'surf':
      bed('lowpass', 500, 0.7, 0.35, 0.25, 0.12)
      bed('bandpass', 2500, 0.5, 0.04, 0.03, 0.09)
      break
    case 'forest':
      bed('lowpass', 900, 0.5, 0.08, 0.04, 0.05)
      sprinkle(1500, 5000, () => {
        const base = 2200 + Math.random() * 1800
        blip(base, base * 1.4, 90, 0.03)
        window.setTimeout(() => safe(() => blip(base * 1.1, base * 1.5, 70, 0.025)), 130)
      })
      break
    case 'ruins':
      bed('lowpass', 300, 0.8, 0.12, 0.05, 0.04)
      sprinkle(700, 2600, () => blip(1400 + Math.random() * 900, 500, 120, 0.05))
      break
    case 'cliff':
      nodes.push(lfo(c, 0.06, 500, bed('bandpass', 700, 1.2, 0.3, 0.15, 0.08).frequency))
      bed('lowpass', 400, 0.7, 0.12, 0.08, 0.1)
      break
    case 'temple':
      drone(110, 0.05)
      drone(164.8, 0.03)
      bed('lowpass', 250, 0.5, 0.04)
      break
    case 'summit':
      nodes.push(lfo(c, 0.05, 300, bed('bandpass', 900, 1.5, 0.22, 0.12, 0.07).frequency))
      drone(220, 0.015)
      break
    case 'room':
      drone(98, 0.03)
      break
  }
  return () => {
    for (const t of timers) window.clearTimeout(t)
    for (const n of nodes) safe(() => n.stop())
  }
}

/** Cross-fades to an area's ambience over 1.5 s. */
const setAmbience = (name: Ambience) =>
  safe(() => {
    if (!ctx || !music || current?.name === name) return
    const c = ctx
    const t = c.currentTime
    const old = current
    if (old) {
      old.out.gain.setTargetAtTime(0, t, 0.5)
      window.setTimeout(() => old.stop(), 2500)
    }
    const out = c.createGain()
    out.gain.value = 0
    out.gain.setTargetAtTime(1, t, 0.5)
    out.connect(music)
    current = { name, out, stop: buildAmbience(c, name, out) }
  })

const tone = (freq: number, ms: number, level: number, type: OscillatorType = 'sine', at = 0) => {
  const c = ctx!
  const t = c.currentTime + at
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(level, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000)
  osc.connect(gain).connect(sfx!)
  osc.start(t)
  osc.stop(t + ms / 1000 + 0.05)
}

const burst = (freq: number, ms: number, level: number, type: BiquadFilterType = 'lowpass') => {
  const c = ctx!
  const t = c.currentTime
  const src = noiseSource(c)
  const filter = c.createBiquadFilter()
  const gain = c.createGain()
  filter.type = type
  filter.frequency.value = freq
  gain.gain.setValueAtTime(level, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000)
  src.connect(filter).connect(gain).connect(sfx!)
  src.start(t, Math.random())
  src.stop(t + ms / 1000)
}

const playSfx = (name: Sfx) =>
  safe(() => {
    if (!ctx || !sfx) return
    switch (name) {
      case 'step':
        return burst(500 + Math.random() * 300, 70, 0.08)
      case 'pickup':
        return [660, 880, 1320].forEach((f, i) => tone(f, 350, 0.08, 'triangle', i * 0.07))
      case 'page':
        return burst(3000, 180, 0.05, 'highpass')
      case 'right':
        return [523, 659, 784, 1046].forEach((f, i) => tone(f, 600, 0.07, 'sine', i * 0.1))
      case 'wrong':
        return [196, 147].forEach((f, i) => tone(f, 300, 0.07, 'sawtooth', i * 0.12))
      case 'stone':
        return burst(180, 450, 0.25)
      case 'water':
        return burst(900, 1200, 0.15, 'bandpass')
      case 'open':
        burst(120, 1200, 0.3)
        return tone(82, 1200, 0.08, 'sine')
    }
  })

/** A chime of the given pitch index (pentatonic scale). */
const playChime = (index: number) =>
  safe(() => {
    if (!ctx) return
    const f = [392, 440, 523.3, 587.3, 659.3][index % 5]
    tone(f, 2200, 0.12)
    tone(f * 2.76, 900, 0.03)
  })

/** Short ending theme: a rising pad progression on the music bus. */
const playEndingMusic = () =>
  safe(() => {
    if (!ctx || !music) return
    const c = ctx
    const chords = [
      [220, 261.6, 329.6],
      [174.6, 220, 261.6],
      [196, 246.9, 293.7],
      [220, 277.2, 329.6, 440],
    ]
    chords.forEach((chord, i) =>
      chord.forEach((f) => {
        const t = c.currentTime + i * 2.5
        const osc = c.createOscillator()
        const gain = c.createGain()
        osc.type = 'triangle'
        osc.frequency.value = f
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.05, t + 0.8)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (i === chords.length - 1 ? 7 : 3))
        osc.connect(gain).connect(music!)
        osc.start(t)
        osc.stop(t + 7.5)
      }),
    )
  })

/** Stops everything this module started; called when a game unmounts. */
const unloadAll = () =>
  safe(() => {
    current?.stop()
    current = null
    void ctx?.close()
    ctx = music = sfx = null
    noise = null
  })

export {
  unlockAudio,
  setVolumes,
  suspendAudio,
  resumeAudio,
  setAmbience,
  playSfx,
  playChime,
  playEndingMusic,
  unloadAll,
}
export type { Ambience, Sfx }
