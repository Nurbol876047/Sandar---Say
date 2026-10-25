import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useSpeech } from '../hooks/useSpeech'
import { playClick } from '../utils/sound'
import FeedbackBanner, { type FeedbackStatus } from './FeedbackBanner'
import type { TranslationKey } from '../data/translations'
import AppBackground from './AppBackground'

interface ExerciseShellProps {
  titleKey: TranslationKey
  stepCurrent: number
  stepTotal: number
  instruction: string
  onBack: () => void
  feedback?: { status: FeedbackStatus; message: string }
  children: ReactNode
  actions?: ReactNode
  /** Hide the instruction's browser-TTS listen button — for exercises that already play real recorded audio of their own. */
  hideListenButton?: boolean
}

export default function ExerciseShell({
  titleKey,
  stepCurrent,
  stepTotal,
  instruction,
  onBack,
  feedback,
  children,
  actions,
  hideListenButton,
}: ExerciseShellProps) {
  const { t, language, sound } = useSettings()
  const { supported, hasVoice, speak } = useSpeech(language)

  const progressPct = Math.min(100, Math.round((stepCurrent / Math.max(stepTotal, 1)) * 100))

  return (
    <div className="relative min-h-screen">
      <AppBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-10 pt-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              playClick(sound)
              onBack()
            }}
            className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-brand-navy shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('shell.back')}
          </button>
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-brand-navy/70 sm:text-sm">
            {stepCurrent} / {stepTotal}
          </span>
        </div>

        <h1 className="mt-4 text-center text-2xl font-extrabold text-brand-navy sm:text-3xl">{t(titleKey)}</h1>

        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/60">
          <motion.div
            className="h-full rounded-full bg-brand-navy"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/85 p-4 shadow-sm sm:p-5">
          <p className="flex-1 text-sm font-semibold text-brand-navy sm:text-base">{instruction}</p>
          {!hideListenButton && (
            <button
              onClick={() => speak(instruction)}
              disabled={!supported}
              aria-label={t('shell.listen')}
              title={supported ? t('shell.listen') : t('speech.unavailable')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-skylight text-brand-navy transition-transform hover:scale-110 active:scale-95 disabled:opacity-40"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          )}
        </div>
        {!hideListenButton && supported && !hasVoice && (
          <p className="mt-1 text-center text-[11px] text-brand-navy/40">{t('speech.unavailable')}</p>
        )}

        <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-3xl bg-white/70 p-5 shadow-inner sm:p-8">
          {children}
        </div>

        <div className="mt-5 min-h-[4rem]">
          {feedback && <FeedbackBanner status={feedback.status} message={feedback.message} />}
        </div>

        {actions && <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
