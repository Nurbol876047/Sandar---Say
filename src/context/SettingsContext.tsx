import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AnimationSpeed, Lang, Settings } from '../types'
import { loadJSON, saveJSON } from '../utils/storage'
import { translate, type TranslationKey } from '../data/translations'

const DEFAULT_SETTINGS: Settings = {
  language: 'kk',
  sound: true,
  animations: true,
  animationSpeed: 'normal',
}

interface SettingsContextValue extends Settings {
  setLanguage: (lang: Lang) => void
  setSound: (enabled: boolean) => void
  setAnimations: (enabled: boolean) => void
  setAnimationSpeed: (speed: AnimationSpeed) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadJSON('settings', DEFAULT_SETTINGS))

  useEffect(() => {
    saveJSON('settings', settings)
  }, [settings])

  useEffect(() => {
    document.documentElement.lang = settings.language
    document.documentElement.classList.toggle('reduce-motion', !settings.animations)
    document.documentElement.classList.toggle('slow-motion', settings.animationSpeed === 'slow')
  }, [settings.language, settings.animations, settings.animationSpeed])

  const setLanguage = useCallback((language: Lang) => setSettings((s) => ({ ...s, language })), [])
  const setSound = useCallback((sound: boolean) => setSettings((s) => ({ ...s, sound })), [])
  const setAnimations = useCallback((animations: boolean) => setSettings((s) => ({ ...s, animations })), [])
  const setAnimationSpeed = useCallback((animationSpeed: AnimationSpeed) => setSettings((s) => ({ ...s, animationSpeed })), [])

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(key, settings.language, vars),
    [settings.language],
  )

  const value = useMemo<SettingsContextValue>(
    () => ({ ...settings, setLanguage, setSound, setAnimations, setAnimationSpeed, t }),
    [settings, setLanguage, setSound, setAnimations, setAnimationSpeed, t],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
