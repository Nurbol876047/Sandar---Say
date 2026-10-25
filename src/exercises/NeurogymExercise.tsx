import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, CameraOff, Loader2 } from 'lucide-react'
import ExerciseShell from '../components/ExerciseShell'
import InfinityPath, { INFINITY_POINT_COUNT, infinityPointsNormalized } from '../components/InfinityPath'
import { useSettings } from '../context/SettingsContext'
import { useHandTracking } from '../hooks/useHandTracking'
import { useNeurogymReps, NEUROGYM_REP_TARGET } from '../hooks/useNeurogymReps'
import { playClick, playCorrect, playTry } from '../utils/sound'
import { NEUROGYM_MOVES } from '../data/speechContent'
import type { ExerciseResult } from '../types'

type Phase = 'ready' | 'running' | 'done'

const TIMER_SECONDS = 10 // fallback hold-time when the camera is off
const CAMERA_TIMEOUT_SECONDS = 25 // don't trap a child forever if detection is struggling
const INFINITY_REACH_THRESHOLD = 0.14
const INFINITY_REACH_FRAMES = 4

export default function NeurogymExercise({ onFinish, onBack }: { onFinish: (r: ExerciseResult) => void; onBack: () => void }) {
  const { t, sound } = useSettings()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [cameraMode, setCameraMode] = useState(false)
  const [remaining, setRemaining] = useState(TIMER_SECONDS)
  const [correctCount, setCorrectCount] = useState(0)
  const [infinityIndex, setInfinityIndex] = useState(0)
  const [timedOut, setTimedOut] = useState(false)

  const demoVideoRef = useRef<HTMLVideoElement>(null)

  const move = NEUROGYM_MOVES[index]
  const isInfinity = move.id === 'infinity8'
  const target = isInfinity ? INFINITY_POINT_COUNT : (NEUROGYM_REP_TARGET[move.id] ?? 3)

  const tracking = useHandTracking()
  const reps = useNeurogymReps(move.id, cameraMode && phase === 'running' && !isInfinity, tracking.hands)
  const reachFramesRef = useRef(0)
  const infinityTargets = infinityPointsNormalized()

  const success = isInfinity ? infinityIndex >= INFINITY_POINT_COUNT : reps >= target

  useEffect(() => {
    setPhase('ready')
    setRemaining(TIMER_SECONDS)
    setInfinityIndex(0)
    setTimedOut(false)
  }, [move])

  useEffect(() => {
    if (cameraMode && (tracking.status === 'denied' || tracking.status === 'error' || tracking.status === 'unsupported')) {
      setCameraMode(false)
    }
  }, [cameraMode, tracking.status])

  // Camera off: original behaviour — a plain hold-timer that always finishes as "done", and the
  // demo video plays alongside it (same fix as the articulation/breathing player: start the
  // play() call synchronously inside the click handler, not only from an effect).
  useEffect(() => {
    if (phase !== 'running' || cameraMode) return
    if (remaining <= 0) {
      setPhase('done')
      playCorrect(sound)
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, remaining, cameraMode, sound])

  useEffect(() => {
    const el = demoVideoRef.current
    if (!el || cameraMode) return
    if (phase === 'running') {
      el.currentTime = 0
      el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [phase, cameraMode, move])

  // Camera on, rep-counted moves: finish as soon as the target is reached.
  useEffect(() => {
    if (!cameraMode || phase !== 'running' || isInfinity) return
    if (reps >= target) {
      setPhase('done')
      playCorrect(sound)
    }
  }, [reps, target, cameraMode, phase, isInfinity, sound])

  // Camera on, infinity8: reuse the same point-reaching logic as the counting exercise's figure-eight.
  useEffect(() => {
    if (!cameraMode || phase !== 'running' || !isInfinity || !tracking.indexTip) {
      reachFramesRef.current = 0
      return
    }
    const targetPoint = infinityTargets[infinityIndex]
    if (!targetPoint) return
    const dx = tracking.indexTip.x - targetPoint.x
    const dy = tracking.indexTip.y - targetPoint.y
    if (Math.hypot(dx, dy) < INFINITY_REACH_THRESHOLD) {
      reachFramesRef.current += 1
      if (reachFramesRef.current >= INFINITY_REACH_FRAMES) {
        reachFramesRef.current = 0
        playCorrect(sound)
        const nextPoint = infinityIndex + 1
        setInfinityIndex(nextPoint)
        if (nextPoint >= INFINITY_POINT_COUNT) setPhase('done')
      }
    } else {
      reachFramesRef.current = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking.indexTip, cameraMode, phase, isInfinity, infinityIndex])

  // Camera on: don't trap the child if the camera/lighting isn't cooperating.
  useEffect(() => {
    if (!cameraMode || phase !== 'running') return
    const timeout = setTimeout(() => {
      setTimedOut(true)
      setPhase('done')
      playTry(sound)
    }, CAMERA_TIMEOUT_SECONDS * 1000)
    return () => clearTimeout(timeout)
  }, [cameraMode, phase, move, sound])

  const start = () => {
    playClick(sound)
    setTimedOut(false)
    if (!cameraMode) {
      const el = demoVideoRef.current
      if (el) {
        el.currentTime = 0
        el.play().catch(() => {})
      }
    }
    setPhase('running')
  }

  const retry = () => {
    playClick(sound)
    setRemaining(TIMER_SECONDS)
    setInfinityIndex(0)
    setTimedOut(false)
    setPhase('running')
  }

  const next = () => {
    const wasSuccess = !cameraMode || success
    if (wasSuccess) setCorrectCount((c) => c + 1)
    if (index + 1 >= NEUROGYM_MOVES.length) {
      tracking.disable()
      onFinish({ correct: correctCount + (wasSuccess ? 1 : 0), total: NEUROGYM_MOVES.length })
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

  const pct = cameraMode ? Math.min(1, (isInfinity ? infinityIndex : reps) / target) : (TIMER_SECONDS - remaining) / TIMER_SECONDS

  const feedback =
    phase === 'done'
      ? timedOut
        ? { status: 'retry' as const, message: t('neurogym.tryAgain') }
        : { status: 'correct' as const, message: t('followalong.moveDone') }
      : undefined

  return (
    <ExerciseShell
      titleKey="ex.neurogym.title"
      stepCurrent={index + 1}
      stepTotal={NEUROGYM_MOVES.length}
      instruction={t('followalong.instruction')}
      onBack={onBack}
      feedback={feedback}
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
                onClick={retry}
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
      <div className="mb-3 flex w-full items-center justify-end">
        {tracking.supported && phase !== 'running' && (
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

      <div className="flex w-full flex-col items-center">
        {cameraMode && (
          // Kept outside the per-move `key`-animated block below: remounting this on every move
          // change would tear down the <video> the live MediaStream is attached to, leaving the
          // camera feed blank and detection stuck on a freshly-mounted, stream-less element.
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-navy shadow-lg">
            {/* Mounted as soon as camera mode turns on (not only once 'running') so the ref is ready
                the instant the stream resolves — see useHandTracking's enable() race otherwise. */}
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
                {isInfinity ? (
                  <>
                    <div className="absolute inset-0">
                      <InfinityPath activeIndex={infinityIndex} reachedCount={infinityIndex} markerT={null} interactivePoints={false} />
                    </div>
                    <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-extrabold text-brand-navy shadow-sm">
                      {t('neurogym.repsOf', { current: infinityIndex, total: INFINITY_POINT_COUNT })}
                    </span>
                  </>
                ) : (
                  <>
                    {tracking.hands.map((h, i) => (
                      <span
                        key={i}
                        className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-pink ring-2 ring-white"
                        style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
                      />
                    ))}
                    <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-extrabold text-brand-navy shadow-sm">
                      {t('neurogym.repsOf', { current: Math.min(reps, target), total: target })}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}

        <motion.div
          key={move.id}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex w-full flex-col items-center"
        >
          {!cameraMode &&
            (move.video ? (
              <video
                ref={demoVideoRef}
                src={move.video}
                muted
                loop
                playsInline
                preload="auto"
                autoPlay={phase === 'running'}
                className="h-48 w-48 rounded-3xl object-cover shadow-lg sm:h-60 sm:w-60"
              />
            ) : (
              <span className="text-8xl sm:text-9xl">{move.emoji}</span>
            ))}

          <h3 className="mt-5 text-xl font-extrabold text-brand-navy sm:text-2xl">{t(move.nameKey)}</h3>
          <p className="mt-2 max-w-sm text-center text-sm font-semibold text-brand-navy/70 sm:text-base">{t(move.descKey)}</p>

          {phase === 'running' && !cameraMode && (
            <div className="relative mt-6 flex h-24 w-24 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e8f4ff" strokeWidth="8" />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#ff5fa8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - pct) }}
                  transition={{ duration: 0.4, ease: 'linear' }}
                />
              </svg>
              <span className="text-2xl font-extrabold text-brand-navy">{remaining}</span>
            </div>
          )}

          {cameraMode && <p className="mt-4 text-center text-xs text-brand-navy/40">{t('neurogym.cameraInstruction')}</p>}
        </motion.div>
      </div>
    </ExerciseShell>
  )
}
