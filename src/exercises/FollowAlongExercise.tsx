import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import ExerciseShell from '../components/ExerciseShell'
import { useSettings } from '../context/SettingsContext'
import { playClick, playCorrect } from '../utils/sound'
import type { ExerciseResult } from '../types'
import type { FollowMove } from '../data/speechContent'
import type { TranslationKey } from '../data/translations'

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface FollowAlongExerciseProps {
  moves: FollowMove[]
  titleKey: TranslationKey
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}

export default function FollowAlongExercise({ moves, titleKey, onFinish, onBack }: FollowAlongExerciseProps) {
  const { t, sound } = useSettings()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready')
  const [remaining, setRemaining] = useState(moves[0].seconds)
  const [videoBlocked, setVideoBlocked] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const move = moves[index]

  useEffect(() => {
    setRemaining(move.seconds)
    setPhase('ready')
    setVideoBlocked(false)
  }, [move])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (phase === 'running') {
      el.currentTime = 0
      el.play().catch(() => setVideoBlocked(true))
    } else {
      el.pause()
    }
  }, [phase, move])

  useEffect(() => {
    if (phase !== 'running') return
    if (remaining <= 0) {
      setPhase('done')
      playCorrect(sound)
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, remaining, sound])

  const start = () => {
    playClick(sound)
    const el = videoRef.current
    if (el) {
      el.currentTime = 0
      el.play().then(() => setVideoBlocked(false)).catch(() => setVideoBlocked(true))
    }
    setPhase('running')
  }

  const retryVideo = () => {
    const el = videoRef.current
    if (!el) return
    el.play().then(() => setVideoBlocked(false)).catch(() => setVideoBlocked(true))
  }

  const next = () => {
    if (index + 1 >= moves.length) {
      onFinish({ correct: moves.length, total: moves.length })
      return
    }
    setIndex((i) => i + 1)
  }

  const pct = (move.seconds - remaining) / move.seconds

  return (
    <ExerciseShell
      titleKey={titleKey}
      stepCurrent={index + 1}
      stepTotal={moves.length}
      instruction={t('followalong.instruction')}
      onBack={onBack}
      feedback={phase === 'done' ? { status: 'correct', message: t('followalong.moveDone') } : undefined}
      actions={
        phase === 'ready' ? (
          <button
            onClick={start}
            className="rounded-full bg-gradient-to-r from-brand-coral to-brand-magenta px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 sm:text-base"
          >
            {t('followalong.startBtn')}
          </button>
        ) : phase === 'done' ? (
          <button
            onClick={next}
            className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('shell.next')}
          </button>
        ) : (
          <span className="text-sm font-bold text-brand-navy/60">{t('followalong.holding')}</span>
        )
      }
    >
      <motion.div
        key={move.id}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center"
      >
        {move.video ? (
          <div className="relative h-48 w-48 sm:h-60 sm:w-60">
            <video
              ref={videoRef}
              src={move.video}
              muted
              loop
              playsInline
              preload="auto"
              autoPlay={phase === 'running'}
              className="h-full w-full rounded-3xl object-cover shadow-lg"
            />
            {phase === 'running' && videoBlocked && (
              <button
                onClick={retryVideo}
                className="absolute inset-0 flex items-center justify-center rounded-3xl bg-brand-navy/30"
                aria-label={t('followalong.startBtn')}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
                  <Play className="h-7 w-7 translate-x-0.5 fill-brand-navy text-brand-navy" />
                </span>
              </button>
            )}
          </div>
        ) : (
          <motion.div
            animate={phase === 'running' ? { rotate: [0, -10, 10, -10, 0] } : { y: [0, -6, 0] }}
            transition={{ duration: phase === 'running' ? 0.9 : 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-8xl sm:text-9xl"
          >
            {move.emoji}
          </motion.div>
        )}
        <h3 className="mt-5 text-xl font-extrabold text-brand-navy sm:text-2xl">{t(move.nameKey)}</h3>
        <p className="mt-2 max-w-sm text-center text-sm font-semibold text-brand-navy/70 sm:text-base">{t(move.descKey)}</p>

        {phase === 'running' && (
          <div className="relative mt-6 flex h-24 w-24 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r={RADIUS} fill="none" stroke="#e8f4ff" strokeWidth="8" />
              <motion.circle
                cx="48"
                cy="48"
                r={RADIUS}
                fill="none"
                stroke="#ff5fa8"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - pct) }}
                transition={{ duration: 0.4, ease: 'linear' }}
              />
            </svg>
            <span className="text-2xl font-extrabold text-brand-navy">{remaining}</span>
          </div>
        )}
      </motion.div>
    </ExerciseShell>
  )
}
