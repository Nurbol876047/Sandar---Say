import { useCallback, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'

/**
 * Plays pre-recorded Kazakh word audio (public/audio/words-kk/*.mp3, synthesized with
 * Edge TTS's kk-KZ-AigulNeural voice — see scripts/generate-kk-audio-edge-tts.py) so
 * the sound-differentiation exercises are real listening tasks, not just reading
 * tasks. Same pattern as useNumberVoice.
 */
export function useWordVoice() {
  const { sound } = useSettings()
  const currentRef = useRef<HTMLAudioElement | null>(null)

  const speakWord = useCallback(
    (word: string) => {
      if (!sound) return
      currentRef.current?.pause()
      const audio = new Audio(`/audio/words-kk/${encodeURIComponent(word)}.mp3`)
      currentRef.current = audio
      void audio.play().catch(() => {
        /* blocked by autoplay policy or interrupted — not critical */
      })
    },
    [sound],
  )

  return { speakWord }
}
