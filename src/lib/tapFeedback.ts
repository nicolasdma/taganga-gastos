let audioCtx: AudioContext | null = null

function shortTick() {
  try {
    audioCtx ??= new AudioContext()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    const now = audioCtx.currentTime
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025)
    osc.start(now)
    osc.stop(now + 0.03)
  } catch {
    // Web Audio unavailable
  }
}

/** Micro-feedback on key press — vibrate on Android, short tick on iOS Safari PWA. */
export function keyTapFeedback() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(8)
    return
  }

  shortTick()
}
