let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(frequency: number, startTime: number, duration: number, audioCtx: AudioContext, gainPeak = 0.18) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

export function playCorrect(enabled: boolean): void {
  if (!enabled) return
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  tone(523.25, now, 0.14, audioCtx)
  tone(659.25, now + 0.1, 0.14, audioCtx)
  tone(783.99, now + 0.2, 0.22, audioCtx)
}

export function playTry(enabled: boolean): void {
  if (!enabled) return
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  tone(392, now, 0.16, audioCtx, 0.12)
  tone(349.23, now + 0.14, 0.2, audioCtx, 0.12)
}

export function playClick(enabled: boolean): void {
  if (!enabled) return
  const audioCtx = getCtx()
  if (!audioCtx) return
  tone(880, audioCtx.currentTime, 0.08, audioCtx, 0.1)
}

export function playComplete(enabled: boolean): void {
  if (!enabled) return
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, now + i * 0.12, 0.26, audioCtx, 0.16))
}
