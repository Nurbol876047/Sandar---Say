import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import ExerciseShell from '../components/ExerciseShell'
import { Ball } from '../components/BallScene'
import { useSettings } from '../context/SettingsContext'
import { useNumberVoice } from '../hooks/useNumberVoice'
import { isEven, shuffle } from '../utils/math'
import { playCorrect, playTry } from '../utils/sound'
import type { ExerciseResult } from '../types'

function buildSequence(): number[] {
  return shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
}

export default function OddEvenExercise({ onFinish, onBack }: { onFinish: (r: ExerciseResult) => void; onBack: () => void }) {
  const { t, sound } = useSettings()
  const sequence = useMemo(buildSequence, [])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<'even' | 'odd' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const { speakNumber } = useNumberVoice()

  const n = sequence[index]
  const even = isEven(n)
  const pairs = Math.floor(n / 2)
  const hasOdd = n % 2 === 1

  useEffect(() => {
    speakNumber(n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const select = (choice: 'even' | 'odd') => {
    if (answer) return
    const correct = (choice === 'even') === even
    setAnswer(choice)
    if (correct) {
      setCorrectCount((c) => c + 1)
      playCorrect(sound)
    } else {
      playTry(sound)
    }
  }

  const next = () => {
    if (index + 1 >= sequence.length) {
      onFinish({ correct: correctCount, total: sequence.length })
      return
    }
    setIndex((i) => i + 1)
    setAnswer(null)
  }

  const feedback = answer
    ? {
        status: ((answer === 'even') === even ? 'correct' : 'retry') as 'correct' | 'retry',
        message:
          (answer === 'even') === even
            ? t(even ? 'ex2.explainEven' : 'ex2.explainOdd', { n })
            : t(even ? 'ex2.wrongEven' : 'ex2.wrongOdd', { n }),
      }
    : undefined

  return (
    <ExerciseShell
      titleKey="ex.oddeven.title"
      stepCurrent={index + 1}
      stepTotal={sequence.length}
      instruction={t('ex2.instruction')}
      onBack={onBack}
      feedback={feedback}
      actions={
        answer ? (
          <button
            onClick={next}
            className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('shell.next')}
          </button>
        ) : (
          <>
            <button
              onClick={() => select('even')}
              className="rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-emerald-900 shadow-md transition-transform hover:scale-105 active:scale-95 sm:text-base"
            >
              {t('ex2.even')}
            </button>
            <button
              onClick={() => select('odd')}
              className="rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-pink-900 shadow-md transition-transform hover:scale-105 active:scale-95 sm:text-base"
            >
              {t('ex2.odd')}
            </button>
          </>
        )
      }
    >
      <motion.p
        key={`num-${index}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-7xl font-extrabold text-brand-navy sm:text-8xl"
      >
        {n}
      </motion.p>

      <div className="mt-6 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {Array.from({ length: pairs }, (_, i) => (
          <div key={`pair-${i}`} className={`flex items-center gap-1 rounded-full p-1.5 ${answer ? 'bg-white/60 ring-2 ring-brand-navy/20' : ''}`}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Ball size={40} />
            </motion.div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 + 0.05 }}>
              <Ball size={40} />
            </motion.div>
          </div>
        ))}
        {hasOdd && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`rounded-full p-1.5 ${answer ? 'animate-wiggle ring-2 ring-amber-400' : ''}`}
          >
            <Ball size={40} />
          </motion.div>
        )}
      </div>
    </ExerciseShell>
  )
}
