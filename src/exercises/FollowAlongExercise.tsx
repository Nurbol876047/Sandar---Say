import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, CameraOff, Loader2, Play } from 'lucide-react'
import ExerciseShell from '../components/ExerciseShell'
import MouthDiagram from '../components/MouthDiagram'
import { useSettings } from '../context/SettingsContext'
import { useFaceTracking } from '../hooks/useFaceTracking'
import { ARTICULATION_CHECKS, useArticulationCheck } from '../hooks/useArticulationCheck'
import { playClick, playCorrect, playTry } from '../utils/sound'
import type { ExerciseResult } from '../types'
import { SOUND_MOUTH_PRESETS, type FollowMove } from '../data/speechContent'
import type { TranslationKey } from '../data/translations'

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CAMERA_TIMEOUT_SECONDS = 25 // don't trap a child forever if detection is struggling

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
  const [cameraMode, setCameraMode] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const move = moves[index]
  const hasCheck = !!ARTICULATION_CHECKS[move.id]

  const tracking = useFaceTracking()
  const check = useArticulationCheck(move.id, cameraMode && hasCheck && phase === 'running', tracking.blendshapes)

  useEffect(() => {
    setRemaining(move.seconds)
    setPhase('ready')
    setVideoBlocked(false)
    setTimedOut(false)
  }, [move])

  useEffect(() => {
    if (cameraMode && (tracking.status === 'denied' || tracking.status === 'error' || tracking.status === 'unsupported')) {
      setCameraMode(false)
    }
  }, [cameraMode, tracking.status])

  useEffect(() => {
    const el = videoRef.current
    if (!el || cameraMode) return
    if (phase === 'running') {
      el.currentTime = 0
      el.play().catch(() => setVideoBlocked(true))
    } else {
      el.pause()
    }
  }, [phase, move, cameraMode])

  // Camera off (or this move has no camera check): the original plain hold-timer.
  useEffect(() => {
    if (phase !== 'running' || (cameraMode && hasCheck)) return
    if (remaining <= 0) {
      setPhase('done')
      playCorrect(sound)
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, remaining, cameraMode, hasCheck, sound])

  // Camera on: finish as soon as the move's check reports done.
  useEffect(() => {
    if (!cameraMode || !hasCheck || phase !== 'running') return
    if (check.done) {
      setPhase('done')
      playCorrect(sound)
    }
  }, [check.done, cameraMode, hasCheck, phase, sound])

  // Camera on: don't trap the child if the camera/lighting isn't cooperating.
  useEffect(() => {
    if (!cameraMode || !hasCheck || phase !== 'running') return
    const timeout = setTimeout(() => {
      setTimedOut(true)
      setPhase('done')
      playTry(sound)
    }, CAMERA_TIMEOUT_SECONDS * 1000)
    return () => clearTimeout(timeout)
  }, [cameraMode, hasCheck, phase, sound])

  const start = () => {
    playClick(sound)
    setTimedOut(false)
    if (!cameraMode) {
      const el = videoRef.current
      if (el) {
        el.currentTime = 0
        el.play().then(() => setVideoBlocked(false)).catch(() => setVideoBlocked(true))
      }
    }
    setPhase('running')
  }

  const retryVideo = () => {
    const el = videoRef.current
    if (!el) return
    el.play().then(() => setVideoBlocked(false)).catch(() => setVideoBlocked(true))
  }

  const retryCamera = () => {
    playClick(sound)
    setTimedOut(false)
    setPhase('running')
  }

  const next = () => {
    const wasSuccess = !(cameraMode && hasCheck) || check.done
    if (wasSuccess) setCorrectCount((c) => c + 1)
    if (index + 1 >= moves.length) {
      tracking.disable()
      onFinish({ correct: correctCount + (wasSuccess ? 1 : 0), total: moves.length })
      return
    }
    setIndex((i) => i + 1)
  }

  const toggleCamera = () => {
    if (cameraMode) {
      tracking.disable()
      setCameraMode(false)
    } else {
      setCameraMode(true)
      tracking.enable()
    }
  }

  const pct = (move.seconds - remaining) / move.seconds
  const soundPreset = move.soundLetter ? SOUND_MOUTH_PRESETS[move.soundLetter] : undefined

  return (
    <ExerciseShell
      titleKey={titleKey}
      stepCurrent={index + 1}
      stepTotal={moves.length}
      instruction={t('followalong.instruction')}
      onBack={onBack}
      feedback={phase === 'done' ? { status: timedOut ? 'retry' : 'correct', message: t(timedOut ? 'neurogym.tryAgain' : 'followalong.moveDone') } : undefined}
      actions={
        phase === 'ready' ? (
          <button
            onClick={start}
            className="rounded-full bg-gradient-to-r from-brand-coral to-brand-magenta px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 sm:text-base"
          >
            {t('followalong.startBtn')}
          </button>
        ) : phase === 'done' ? (
          timedOut ? (
            <>
              <button
                onClick={retryCamera}
                className="rounded-full bg-gradient-to-r from-brand-coral to-brand-magenta px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                {t('neurogym.retryBtn')}
              </button>
              <button onClick={next} className="text-xs font-bold text-brand-navy/50 underline underline-offset-2">
                {t('neurogym.skipBtn')}
              </button>
            </>
          ) : (
            <button
              onClick={next}
              className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {t('shell.next')}
            </button>
          )
        ) : (
          <span className="text-sm font-bold text-brand-navy/60">{t('followalong.holding')}</span>
        )
      }
    >
      <div className="flex w-full flex-col items-center">
        <div className="mb-3 flex w-full items-center justify-end">
          {tracking.supported && hasCheck && phase !== 'running' && (
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${
                cameraMode ? 'bg-brand-navy text-white' : 'bg-white/80 text-brand-navy'
              }`}
            >
              {tracking.status === 'loading' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : cameraMode ? (
                <CameraOff className="h-3.5 w-3.5" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              {t(cameraMode ? 'camera.disable' : 'camera.enable')}
            </button>
          )}
        </div>

        {cameraMode && hasCheck && (
          // Kept outside the per-move `key`-animated block below so changing moves never tears
          // down the <video> the live MediaStream is attached to (same fix as NeurogymExercise).
          <div className="relative mb-3 w-full max-w-md overflow-hidden rounded-2xl bg-brand-navy shadow-lg">
            <video
              ref={tracking.videoRef}
              muted
              playsInline
              className={`aspect-[5/3] w-full scale-x-[-1] object-cover transition-opacity duration-300 ${
                tracking.status === 'running' ? 'opacity-80' : 'opacity-0'
              }`}
            />
            {tracking.status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-white/80" />
                <p className="text-xs font-semibold text-white/80">{t('camera.loading')}</p>
              </div>
            )}
            {tracking.status === 'running' && phase === 'running' && (
              <>
                <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-extrabold text-brand-navy shadow-sm">
                  {t('followalong.cameraInstruction')}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-2.5 bg-white/20">
                  <div className="h-full bg-brand-pink transition-all duration-150" style={{ width: `${check.progress * 100}%` }} />
                </div>
              </>
            )}
          </div>
        )}

        <motion.div key={move.id} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
          {!cameraMode &&
            (move.video ? (
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
            ))}
          <h3 className="mt-5 text-xl font-extrabold text-brand-navy sm:text-2xl">{t(move.nameKey)}</h3>
          <p className="mt-2 max-w-sm text-center text-sm font-semibold text-brand-navy/70 sm:text-base">{t(move.descKey)}</p>

          {soundPreset && (
            <div className="mt-3 flex flex-col items-center gap-0.5 rounded-2xl bg-white/70 px-4 py-2 shadow-sm">
              <MouthDiagram tongue={soundPreset.tongue} lips={soundPreset.lips} label={move.soundLetter} className="h-14 w-14" />
              <span className="text-sm font-extrabold text-brand-navy">{move.soundLetter}</span>
            </div>
          )}

          {phase === 'running' && !cameraMode && (
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
      </div>
    </ExerciseShell>
  )
}
