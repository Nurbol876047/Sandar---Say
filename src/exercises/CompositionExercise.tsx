import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import ExerciseShell from '../components/ExerciseShell'
import { Ball } from '../components/BallScene'
import { useSettings } from '../context/SettingsContext'
import { useNumberVoice } from '../hooks/useNumberVoice'
import { playClick, playCorrect, playTry } from '../utils/sound'
import type { ExerciseResult } from '../types'

const TARGETS = [3, 4, 5, 6, 7]

function GroupBox({
  labelKey,
  value,
  max,
  onChange,
  disabled,
}: {
  labelKey: 'ex5.groupOne' | 'ex5.groupTwo'
  value: number
  max: number
  onChange: (v: number) => void
  disabled: boolean
}) {
  const { t, sound } = useSettings()
  return (
    <div className="flex w-36 flex-col items-center gap-2 rounded-3xl bg-white/85 p-4 shadow-sm sm:w-44">
      <p className="text-xs font-bold text-brand-navy/60">{t(labelKey)}</p>
      <div className="flex min-h-[2.75rem] flex-wrap items-center justify-center gap-1">
        {Array.from({ length: value }, (_, i) => (
          <Ball key={i} size={24} />
        ))}
      </div>
      <p className="text-3xl font-extrabold text-brand-navy">{value}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (value > 0) {
              onChange(value - 1)
              playClick(sound)
            }
          }}
          disabled={disabled || value <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-skylight text-brand-navy disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (value < max) {
              onChange(value + 1)
              playClick(sound)
            }
          }}
          disabled={disabled || value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-skylight text-brand-navy disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function CompositionExercise({ onFinish, onBack }: { onFinish: (r: ExerciseResult) => void; onBack: () => void }) {
  const { t, sound } = useSettings()
  const [index, setIndex] = useState(0)
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const { speakNumber, speakSequence } = useNumberVoice()

  const target = TARGETS[index]
  const sum = left + right

  useEffect(() => {
    speakNumber(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const check = () => {
    const correct = left > 0 && right > 0 && sum === target
    setChecked(true)
    setIsCorrect(correct)
    if (correct) {
      setCorrectCount((c) => c + 1)
      playCorrect(sound)
      speakSequence([left, right])
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
    setLeft(0)
    setRight(0)
    setChecked(false)
  }

  return (
    <ExerciseShell
      titleKey="ex.composition.title"
      stepCurrent={index + 1}
      stepTotal={TARGETS.length}
      instruction={t('ex5.instruction')}
      onBack={onBack}
      feedback={
        checked
          ? {
              status: isCorrect ? 'correct' : 'retry',
              message: isCorrect ? t('ex5.correct', { total: target, left, right }) : t('ex5.wrong', { total: target }),
            }
          : undefined
      }
      actions={
        checked && isCorrect ? (
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
            {t('shell.check')}
          </button>
        )
      }
    >
      <div className="rounded-2xl bg-white/80 px-6 py-3 text-center shadow-sm">
        <p className="text-xs font-bold text-brand-navy/50">{t('ex5.needed')}</p>
        <p className="text-4xl font-extrabold text-brand-navy">{target}</p>
      </div>

      <div className="mt-6 flex items-center gap-4 sm:gap-6">
        <GroupBox labelKey="ex5.groupOne" value={left} max={target} onChange={setLeft} disabled={checked && isCorrect} />
        <span className="text-3xl font-extrabold text-brand-navy/40">+</span>
        <GroupBox labelKey="ex5.groupTwo" value={right} max={target} onChange={setRight} disabled={checked && isCorrect} />
      </div>

      <motion.p
        key={sum}
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className={`mt-6 text-2xl font-extrabold sm:text-3xl ${sum === target ? 'text-emerald-600' : 'text-brand-navy'}`}
      >
        {left} + {right} = {sum}
      </motion.p>
    </ExerciseShell>
  )
}
