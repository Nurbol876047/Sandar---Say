import { useState } from 'react'
import { motion } from 'framer-motion'
import ExerciseShell from '../components/ExerciseShell'
import BallScene, { Ball } from '../components/BallScene'
import { useSettings } from '../context/SettingsContext'
import { buildChoices, generateMathProblem, type MathProblem } from '../utils/math'
import { playClick, playCorrect, playTry } from '../utils/sound'
import type { ExerciseResult } from '../types'

type Level = 'easy' | 'medium'
type Phase = 'level' | 'quiz'

interface Problem extends MathProblem {
  choices: number[]
}

function buildProblems(level: Level): Problem[] {
  return Array.from({ length: 5 }, () => {
    const p = generateMathProblem(level)
    return { ...p, choices: buildChoices(p.answer, 3, 0, level === 'easy' ? 5 : 10) }
  })
}

export default function MathExercise({ onFinish, onBack }: { onFinish: (r: ExerciseResult) => void; onBack: () => void }) {
  const { t, sound } = useSettings()
  const [phase, setPhase] = useState<Phase>('level')
  const [level, setLevel] = useState<Level>('easy')
  const [problems, setProblems] = useState<Problem[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [bounce, setBounce] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const start = (lvl: Level) => {
    setLevel(lvl)
    setProblems(buildProblems(lvl))
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setCorrectCount(0)
    setPhase('quiz')
  }

  const problem = problems[index]

  const throwAndCheck = () => {
    if (selected === null || checked) return
    playClick(sound)
    setBounce((b) => b + 1)
    setChecked(true)
    if (selected === problem.answer) {
      setCorrectCount((c) => c + 1)
      playCorrect(sound)
    } else {
      playTry(sound)
    }
  }

  const next = () => {
    if (index + 1 >= problems.length) {
      onFinish({ correct: correctCount, total: problems.length })
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setChecked(false)
  }

  if (phase === 'level') {
    return (
      <ExerciseShell titleKey="ex.math.title" stepCurrent={0} stepTotal={1} instruction={t('ex3.instruction')} onBack={onBack}>
        <p className="mb-5 text-lg font-bold text-brand-navy">{t('ex3.chooseLevel')}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => start('easy')}
            className="rounded-full bg-brand-green px-7 py-3.5 text-base font-bold text-emerald-900 shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('ex3.levelEasy')}
          </button>
          <button
            onClick={() => start('medium')}
            className="rounded-full bg-brand-yellow px-7 py-3.5 text-base font-bold text-amber-900 shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('ex3.levelMedium')}
          </button>
        </div>
      </ExerciseShell>
    )
  }

  const isCorrect = checked && selected === problem.answer

  return (
    <ExerciseShell
      titleKey="ex.math.title"
      stepCurrent={index + 1}
      stepTotal={problems.length}
      instruction={t('ex3.instruction')}
      onBack={onBack}
      feedback={
        checked
          ? {
              status: isCorrect ? 'correct' : 'retry',
              message: isCorrect
                ? t(problem.op === '+' ? 'ex3.explainAdd' : 'ex3.explainSub', { a: problem.a, b: problem.b, answer: problem.answer })
                : t('feedback.tryAgain2'),
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
            onClick={throwAndCheck}
            disabled={selected === null}
            className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            {t('ex3.throwBtn')}
          </button>
        )
      }
    >
      <span className="mb-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brand-navy/60">
        {t(level === 'easy' ? 'ex3.levelEasy' : 'ex3.levelMedium')}
      </span>
      <p className="text-5xl font-extrabold text-brand-navy sm:text-6xl">
        {problem.a} {problem.op} {problem.b} = ?
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: problem.op === '+' ? problem.a : problem.a }, (_, i) => {
          const removed = problem.op === '-' && i >= problem.a - problem.b
          return (
            <motion.div key={i} animate={{ opacity: checked && removed ? 0.25 : 1 }}>
              <Ball size={34} />
            </motion.div>
          )
        })}
        {problem.op === '+' && (
          <>
            <span className="mx-1 text-2xl font-extrabold text-brand-navy/50">+</span>
            {Array.from({ length: problem.b }, (_, i) => (
              <Ball key={`b-${i}`} size={34} />
            ))}
          </>
        )}
      </div>

      {checked && (
        <div className="mt-2">
          <BallScene bounce={bounce} size={70} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {problem.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => !checked && setSelected(choice)}
            disabled={checked}
            className={`flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-extrabold shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100 sm:h-24 sm:w-24 ${
              selected === choice ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy'
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
    </ExerciseShell>
  )
}
