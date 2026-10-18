import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lang } from '../types'

const LANG_CODE: Record<Lang, string> = { kk: 'kk-KZ', ru: 'ru-RU' }

function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | null {
  const code = LANG_CODE[lang]
  const exact = voices.find((v) => v.lang === code)
  if (exact) return exact
  const prefix = code.split('-')[0]
  const partial = voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
  if (partial) return partial
  if (lang === 'kk') {
    // Kazakh voices are rare; Russian pronunciation is the closest fallback.
    return voices.find((v) => v.lang.toLowerCase().startsWith('ru')) ?? null
  }
  return null
}

export function useSpeech(lang: Lang) {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const lastText = useRef<string>('')

  useEffect(() => {
    if (!supported) return
    const update = () => setVoices(window.speechSynthesis.getVoices())
    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [supported])

  const hasVoice = supported && pickVoice(voices, lang) !== null

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      lastText.current = text
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      const voice = pickVoice(voices, lang)
      if (voice) utter.voice = voice
      utter.lang = voice?.lang ?? LANG_CODE[lang]
      utter.rate = 0.95
      utter.pitch = 1.1
      utter.onstart = () => setSpeaking(true)
      utter.onend = () => setSpeaking(false)
      utter.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utter)
    },
    [supported, voices, lang],
  )

  const repeat = useCallback(() => {
    if (lastText.current) speak(lastText.current)
  }, [speak])

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { supported: supported && true, hasVoice, speak, repeat, stop, speaking }
}
