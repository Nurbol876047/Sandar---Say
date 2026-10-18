import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, Eye, Hand as HandCursorIcon, Loader2 } from 'lucide-react'
import ExerciseShell from '../components/ExerciseShell'
import InfinityPath, { INFINITY_POINT_COUNT, infinityPointsNormalized } from '../components/InfinityPath'
import { useSettings } from '../context/SettingsContext'
import { useHandTracking } from '../hooks/useHandTracking'
import { playClick, playCorrect, playTry } from '../utils/sound'
import type { ExerciseResult } from '../types'

type Phase = 'watch' | 'do'

const WATCH_DURATION = 6500
const REACH_THRESHOLD = 0.14
const REACH_FRAMES = 4

export default function InfinityExercise({ onFinish, onBack }: { onFinish: (r: ExerciseResult) => void; onBack: () => void }) {
  const { t, sound, animations, animationSpeed } = useSettings()
  const [phase, setPhase] = useState<Phase>('watch')

  const [watchKey, setWatchKey] = useState(0)
  const [watchT, setWatchT] = useState(0)
  const [watchPlaying, setWatchPlaying] = useState(true)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (phase !== 'watch' || !watchPlaying) return
    const duration = animations ? (animationSpeed === 'slow' ? WATCH_DURATION * 1.8 : WATCH_DURATION) : 400
    startRef.current = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const t = Math.min(1, elapsed / duration)
      setWatchT(t)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setWatchPlaying(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase, watchKey, watchPlaying, animations, animationSpeed])

  const replay = () => {
    setWatchT(0)
    setWatchPlaying(true)
    setWatchKey((k) => k + 1)
  }

  const [activeIndex, setActiveIndex] = useState(0)
  const [hadMistake, setHadMistake] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [hint, setHint] = useState(false)
  const [cameraMode, setCameraMode] = useState(false)

  const tracking = useHandTracking()
  const reachFrames = useRef(0)
  const targetPoints = infinityPointsNormalized()

  useEffect(() => {
    if (!cameraMode || tracking.status !== 'running' || !tracking.indexTip || activeIndex >= INFINITY_POINT_COUNT) {
      reachFrames.current = 0
      return
    }
    const target = targetPoints[activeIndex]
    const dx = tracking.indexTip.x - target.x
    const dy = tracking.indexTip.y - target.y
    const dist = Math.hypot(dx, dy)
    if (dist < REACH_THRESHOLD) {
      reachFrames.current += 1
      if (reachFrames.current >= REACH_FRAMES) {
        reachFrames.current = 0
        handleReach(activeIndex)
      }
    } else {
      reachFrames.current = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking.indexTip, cameraMode, tracking.status, activeIndex])

  useEffect(() => {
    if (cameraMode && (tracking.status === 'denied' || tracking.status === 'error' || tracking.status === 'unsupported')) {
      setCameraMode(false)
    }
  }, [cameraMode, tracking.status])

  const handleReach = (i: number) => {
    if (i !== activeIndex) {
      setHadMistake(true)
      setHint(true)
      playTry(sound)
      window.setTimeout(() => setHint(false), 1200)
      return
    }
    if (!hadMistake) setCorrectCount((c) => c + 1)
    playCorrect(sound)
    setHadMistake(false)
    const nextIndex = activeIndex + 1
    if (nextIndex >= INFINITY_POINT_COUNT) {
      tracking.disable()
      window.setTimeout(() => onFinish({ correct: correctCount + (hadMistake ? 0 : 1), total: INFINITY_POINT_COUNT }), 500)
      setActiveIndex(nextIndex)
    } else {
      setActiveIndex(nextIndex)
    }
  }

  const startDoPhase = () => {
    playClick(sound)
    setPhase('do')
    setActiveIndex(0)
    setHadMistake(false)
    setCorrectCount(0)
  }

  if (phase === 'watch') {
    return (
      <ExerciseShell
        titleKey="ex.infinity.title"
        stepCurrent={1}
        stepTotal={2}
        instruction={t('ex6.instruction')}
        onBack={onBack}
        actions={
          <>
            <button
              onClick={replay}
              className="flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 text-sm font-bold text-brand-navy shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Eye className="h-4 w-4" />
              {t('ex6.watchBtn')}
            </button>
            <button
              onClick={startDoPhase}
              className="flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <HandCursorIcon className="h-4 w-4" />
              {t('ex6.startDoBtn')}
            </button>
          </>
        }
      >
        <p className="mb-2 text-sm font-bold text-brand-navy/60">{t('ex6.modeWatch')}</p>
        <InfinityPath activeIndex={-1} reachedCount={Math.floor(watchT * INFINITY_POINT_COUNT)} markerT={watchT} interactivePoints={false} />
        <p className="mt-4 max-w-sm text-center text-xs leading-relaxed text-brand-navy/50">{t('ex6.note')}</p>
      </ExerciseShell>
    )
  }

  const done = activeIndex >= INFINITY_POINT_COUNT

  return (
    <ExerciseShell
      titleKey="ex.infinity.title"
      stepCurrent={2}
      stepTotal={2}
      instruction={t('ex6.instruction')}
      onBack={onBack}
      feedback={
        done
          ? { status: 'correct', message: t('ex6.finishMsg') }
          : hint
            ? { status: 'retry', message: t('ex6.mistake') }
            : undefined
      }
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-brand-navy shadow-sm">
          {t('ex6.pointOf', { current: Math.min(activeIndex + 1, INFINITY_POINT_COUNT), total: INFINITY_POINT_COUNT })}
        </span>
        {tracking.supported && (
          <button
            onClick={() => {
              if (cameraMode) {
                tracking.disable()
                setCameraMode(false)
              } else {
                setCameraMode(true)
                tracking.enable()
              }
            }}
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

      {cameraMode ? (
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
          {(tracking.status === 'denied' || tracking.status === 'error') && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs font-semibold text-white">
              {t('camera.denied')}
            </div>
          )}
          {tracking.status === 'running' && (
            <>
              <div className="absolute inset-0">
                <InfinityPath activeIndex={activeIndex} reachedCount={activeIndex} markerT={null} interactivePoints={false} />
              </div>
              {tracking.indexTip && (
                <span
                  className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-pink ring-2 ring-white"
                  style={{ left: `${tracking.indexTip.x * 100}%`, top: `${tracking.indexTip.y * 100}%` }}
                />
              )}
            </>
          )}
        </div>
      ) : (
        <InfinityPath activeIndex={activeIndex} reachedCount={activeIndex} markerT={null} onPointClick={handleReach} />
      )}

      <p className="mt-4 text-xs text-brand-navy/40">{t('ex6.cameraInstruction')}</p>
    </ExerciseShell>
  )
}
