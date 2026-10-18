import { motion } from 'framer-motion'
import { Home, RotateCcw, Star, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { playComplete } from '../utils/sound'
import Confetti from './Confetti'
import AppBackground from './AppBackground'
import type { TranslationKey } from '../data/translations'

interface ResultScreenProps {
  titleKey: TranslationKey
  correct: number
  total: number
  stars: number
  onRetry: () => void
  onNext?: () => void
  onHome: () => void
}

export default function ResultScreen({ titleKey, correct, total, stars, onRetry, onNext, onHome }: ResultScreenProps) {
  const { t, sound } = useSettings()

  useEffect(() => {
    playComplete(sound)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative min-h-screen">
      <AppBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
        <div className="relative w-full rounded-[2rem] bg-white/90 px-6 py-10 shadow-xl sm:px-10">
          <Confetti />
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-yellow text-4xl"
          >
            🏆
          </motion.div>

          <h1 className="mt-5 text-2xl font-extrabold text-brand-navy sm:text-3xl">{t('result.title')}</h1>
          <p className="mt-2 text-sm font-medium text-brand-navy/60">{t(titleKey)}</p>

          <p className="mt-5 text-base font-bold text-brand-navy sm:text-lg">
            {t('result.summary', { correct, total })}
          </p>

          <div className="mt-5 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300, damping: 14 }}
              >
                <Star className={`h-10 w-10 ${i < stars ? 'fill-amber-400 text-amber-400' : 'fill-brand-skylight text-brand-skylight'}`} />
              </motion.div>
            ))}
          </div>

          {correct < total && <p className="mt-4 text-sm font-semibold text-brand-navy/60">{t('result.tryAgainPrompt')}</p>}

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={onRetry}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-skylight px-4 py-3 text-sm font-bold text-brand-navy shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                {t('result.retry')}
              </button>
              {onNext && (
                <button
                  onClick={onNext}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-navy px-4 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {t('result.nextExercise')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={onHome}
              className="flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold text-brand-navy/70 transition-colors hover:bg-brand-skylight/60"
            >
              <Home className="h-4 w-4" />
              {t('result.home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
