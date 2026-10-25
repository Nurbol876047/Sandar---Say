import { useCallback, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'

const MAX_NUMBER = 10

function isVoiceable(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= MAX_NUMBER
}

/**
 * Plays pre-recorded Kazakh number words (0–10, synthesized with Edge TTS's
 * kk-KZ-AigulNeural voice — see scripts/generate-kk-audio-edge-tts.py) so every
 * number a child needs to find has a reliable spoken form — unlike the browser's
 * speechSynthesis, which rarely ships a Kazakh voice at all.
 */
export function useNumberVoice() {
  const { sound } = useSettings()
  const currentRef = useRef<HTMLAudioElement | null>(null)
  const sequenceRef = useRef(0)

  const speakNumber = useCallback(
    (n: number) => {
      if (!sound || !isVoiceable(n)) return
      currentRef.current?.pause()
      const audio = new Audio(`/audio/numbers-kk/${n}.mp3`)
      currentRef.current = audio
      void audio.play().catch(() => {
        /* blocked by autoplay policy or interrupted — not critical */
      })
    },
    [sound],
  )

  const speakSequence = useCallback(
    (numbers: number[], gapMs = 180) => {
      if (!sound) return
      const mySeq = ++sequenceRef.current
      let i = 0
      const playNext = () => {
        if (sequenceRef.current !== mySeq) return // superseded by a newer call
        if (i >= numbers.length) return
        const n = numbers[i++]
        if (!isVoiceable(n)) {
          playNext()
          return
        }
        const audio = new Audio(`/audio/numbers-kk/${n}.mp3`)
        currentRef.current = audio
        audio.onended = () => window.setTimeout(playNext, gapMs)
        audio.play().catch(playNext)
      }
      playNext()
    },
    [sound],
  )

  return { speakNumber, speakSequence }
}
