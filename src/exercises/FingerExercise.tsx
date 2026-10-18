import { useEffect, useMemo, useState } from 'react'
import { MousePointerClick, Camera } from 'lucide-react'
import ExerciseShell from '../components/ExerciseShell'
import HandIllustration from '../components/HandIllustration'
import CameraPanel from '../components/CameraPanel'
import { useSettings } from '../context/SettingsContext'
import { useHandTracking } from '../hooks/useHandTracking'
import { useNumberVoice } from '../hooks/useNumberVoice'
import { playCorrect, playTry } from '../utils/sound'
import type { ExerciseResult } from '../types'

const TARGETS = [3, 5, 2, 4, 1]
type InputMode = 'click' | 'camera'

// How long the camera must hold a matching finger count before it auto-confirms — long enough to
// filter out a hand just passing through the right count on its way to somewhere else.
const AUTO_CONFIRM_HOLD_MS = 700
const AUTO_ADVANCE_DELAY = 1100

export default function FingerExercise({ onFinish, onBack }: { onFinish: (r: ExerciseResult) => void; onBack: () => void }) {
  const { t, sound } = useSettings()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<boolean[]>([false, false, false, false, false])
  const [checked, setChecked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [mode, setMode] = useState<InputMode>('click')

  const tracking = useHandTracking()
  const { speakNumber } = useNumberVoice()

  const target = TARGETS[index]
  const selectedCount = useMemo(() => selected.filter(Boolean).length, [selected])
  const liveCount = mode === 'camera' ? tracking.extendedFingers : selectedCount
  const isCorrect = checked && liveCount === target
  const cameraMatching = mode === 'camera' && !checked && tracking.status === 'running' && liveCount === target

  useEffect(() => {
    speakNumber(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const toggleFinger = (i: number) => {
    if (checked || mode !== 'click') return
    setSelected((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  const check = () => {
    if (checked) return
    setChecked(true)
    if (liveCount === target) {
      setCorrectCount((c) => c + 1)
      playCorrect(sound)
      speakNumber(target)
    } else {
      playTry(sound)
    }
  }

  const next = () => {
    if (index + 1 >= TARGETS.length) {
      onFinish({ correct: correctCount, total: TARGETS.length })
      return
    }
    setIndex((i) => i + 1)
    setSelected([false, false, false, false, false])
    setChecked(false)
  }

  // Camera mode: once the detected finger count holds steady on the target for a moment, confirm
  // automatically — no manual "check" click needed while the child's own hand is the answer. A
  // timer (not a frame counter) is what actually works here: `cameraMatching` only flips once when
  // the count first lands on target and then stays `true` while the hand holds still, so an effect
  // keyed on it fires once per hold, not once per frame — exactly what a "hold for N ms" debounce needs.
  useEffect(() => {
    if (!cameraMatching) return
    const id = window.setTimeout(() => {
      setChecked(true)
      setCorrectCount((c) => c + 1)
      playCorrect(sound)
      speakNumber(target)
    }, AUTO_CONFIRM_HOLD_MS)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMatching, sound])

  // Camera mode: move on by itself after a correct auto-confirm, same spirit as clicking "Келесі".
  useEffect(() => {
    if (mode !== 'camera' || !checked || !isCorrect) return
    const id = window.setTimeout(next, AUTO_ADVANCE_DELAY)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, checked, isCorrect])

  return (
    <ExerciseShell
      titleKey="ex.fingers.title"
      stepCurrent={index + 1}
      stepTotal={TARGETS.length}
      instruction={t('ex4.instruction')}
      onBack={onBack}
      feedback={
        checked
          ? {
              status: isCorrect ? 'correct' : 'retry',
              message: isCorrect ? t('ex4.correct', { n: target }) : t('ex4.wrong', { n: target }),
            }
          : undefined
      }
      actions={
        checked ? (
          <button
            onClick={next}
            className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('shell.next')}
          </button>
        ) : (
          <button
            onClick={check}
            className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('ex4.check')}
          </button>
        )
      }
    >
      <div className="mb-4 flex items-center gap-4">
        <div className="rounded-2xl bg-white/80 px-5 py-3 text-center shadow-sm">
          <p className="text-xs font-bold text-brand-navy/50">{t('ex4.target')}</p>
          <p className="text-4xl font-extrabold text-brand-navy">{target}</p>
        </div>
        <div
          className={`rounded-2xl px-5 py-3 text-center shadow-sm transition-colors ${
            cameraMatching ? 'bg-brand-green ring-2 ring-emerald-400' : 'bg-white/80'
          }`}
        >
          <p className="text-xs font-bold text-brand-navy/50">{t('ex4.selected')}</p>
          <p className="text-4xl font-extrabold text-brand-navy">{liveCount}</p>
        </div>
      </div>

      {tracking.supported && (
        <div className="mb-3 flex items-center rounded-full bg-white/70 p-1 text-xs font-bold">
          <button
            onClick={() => {
              setMode('click')
              tracking.disable()
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${mode === 'click' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'}`}
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            {t('camera.modeClick')}
          </button>
          <button
            onClick={() => setMode('camera')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${mode === 'camera' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'}`}
          >
            <Camera className="h-3.5 w-3.5" />
            {t('camera.modeCamera')}
          </button>
        </div>
      )}

      {mode === 'camera' ? (
        <CameraPanel tracking={tracking} instructionKey="ex4.cameraInstruction" />
      ) : (
        <HandIllustration selected={selected} onToggle={toggleFinger} interactive={!checked} />
      )}
    </ExerciseShell>
  )
}
