import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown01, ArrowUp01, Hand, RotateCcw } from 'lucide-react'
import ExerciseShell from '../components/ExerciseShell'
import BallScene from '../components/BallScene'
import CameraPanel from '../components/CameraPanel'
import { useSettings } from '../context/SettingsContext'
import { useHandTracking } from '../hooks/useHandTracking'
import { useNumberVoice } from '../hooks/useNumberVoice'
import { buildChoices, shuffle } from '../utils/math'
import { playClick, playCorrect, playTry } from '../utils/sound'
import type { ExerciseResult } from '../types'

type Mode = 'up' | 'down'
type Phase = 'intro' | 'throw' | 'quiz'

interface QuizQ {
  n: number
  answer: number
  choices: number[]
}

function buildQuiz(mode: Mode): QuizQ[] {
  const pool = mode === 'up' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [10, 9, 8, 7, 6, 5, 4, 3, 2]
  const picks = shuffle(pool).slice(0, 6)
  return picks.map((n) => {
    const answer = mode === 'up' ? n + 1 : n - 1
    return { n, answer, choices: buildChoices(answer, 3, 0, 10) }
  })
}

export default function CountingExercise({ onFinish, onBack }: { onFinish: (r: ExerciseResult) => void; onBack: () => void }) {
  const { t, sound } = useSettings()
  const [mode, setMode] = useState<Mode>('up')
  const [phase, setPhase] = useState<Phase>('intro')
  const [count, setCount] = useState(mode === 'up' ? 0 : 11)
  const [bounce, setBounce] = useState(0)
  const [throwDone, setThrowDone] = useState(false)

  const [quizSeed, setQuizSeed] = useState(0)
  const quiz = useMemo(() => buildQuiz(mode), [mode, quizSeed])
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'retry'; message: string } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const tracking = useHandTracking()
  const { speakNumber } = useNumberVoice()
  const wasOpen = useRef(false)
  const lastThrowAt = useRef(0)

  const target = mode === 'up' ? 10 : 1
  const start = mode === 'up' ? 0 : 11

  const handleThrow = () => {
    if (throwDone) return
    const now = Date.now()
    if (now - lastThrowAt.current < 700) return
    lastThrowAt.current = now
    playClick(sound)
    setBounce((b) => b + 1)
    const next = mode === 'up' ? count + 1 : count - 1
    setCount(next)
    speakNumber(next)
    if (next === target) setThrowDone(true)
  }

  useEffect(() => {
    if (tracking.status !== 'running') return
    if (tracking.gestureOpen && !wasOpen.current) handleThrow()
    wasOpen.current = tracking.gestureOpen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking.gestureOpen, tracking.status])

  const startThrowing = (m: Mode) => {
    setMode(m)
    setCount(m === 'up' ? 0 : 11)
    setThrowDone(false)
    setPhase('throw')
  }

  const restartThrowing = () => {
    setCount(mode === 'up' ? 0 : 11)
    setThrowDone(false)
    setBounce((b) => b + 1)
  }

  const goToQuiz = () => {
    setPhase('quiz')
    setQuizSeed((s) => s + 1)
    setQIndex(0)
    setSelected(null)
    setFeedback(null)
    setCorrectCount(0)
  }

  useEffect(() => {
    if (phase === 'quiz' && quiz[qIndex]) speakNumber(quiz[qIndex].n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex])

  const checkAnswer = () => {
    if (selected === null) return
    const q = quiz[qIndex]
    const isCorrect = selected === q.answer
    if (isCorrect) {
      setCorrectCount((c) => c + 1)
      setFeedback({ status: 'correct', message: t('feedback.correct1') })
      playCorrect(sound)
      speakNumber(q.answer)
    } else {
      setFeedback({ status: 'retry', message: t('feedback.tryAgain1') })
      playTry(sound)
    }
  }

  const nextQuestion = () => {
    if (qIndex + 1 >= quiz.length) {
      onFinish({ correct: correctCount, total: quiz.length })
      return
    }
    setQIndex((i) => i + 1)
    setSelected(null)
    setFeedback(null)
  }

  if (phase === 'intro') {
    return (
      <ExerciseShell
        titleKey="ex.counting.title"
        stepCurrent={0}
        stepTotal={1}
        instruction={t('ex1.instruction')}
        onBack={onBack}
      >
        <BallScene bounce={0} />
        <p className="mt-4 max-w-sm text-center text-xs text-brand-navy/50">{t('ex1.note')}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => startThrowing('up')}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowUp01 className="h-5 w-5" />
            {t('ex1.modeUp')}
          </button>
          <button
            onClick={() => startThrowing('down')}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-skylight px-6 py-3 text-sm font-bold text-brand-navy shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowDown01 className="h-5 w-5" />
            {t('ex1.modeDown')}
          </button>
        </div>
      </ExerciseShell>
    )
  }

  if (phase === 'throw') {
    return (
      <ExerciseShell
        titleKey="ex.counting.title"
        stepCurrent={Math.abs(count - start)}
        stepTotal={10}
        instruction={t('ex1.instruction')}
        onBack={onBack}
        feedback={
          throwDone
            ? { status: 'correct', message: t(mode === 'up' ? 'ex1.finishedUp' : 'ex1.finishedDown') }
            : undefined
        }
        actions={
          throwDone ? (
            <button
              onClick={goToQuiz}
              className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {t('shell.next')}
            </button>
          ) : (
            <>
              <button
                onClick={handleThrow}
                className="flex items-center gap-2 rounded-full bg-brand-navy px-7 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Hand className="h-5 w-5" />
                {t('ex1.throwBtn')}
              </button>
              <button
                onClick={restartThrowing}
                className="flex items-center gap-2 rounded-full bg-white/80 px-5 py-3 text-sm font-bold text-brand-navy shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                {t('ex1.restartBtn')}
              </button>
            </>
          )
        }
      >
        <CameraPanel tracking={tracking} instructionKey="ex1.cameraInstruction" showTips={false} />
        <BallScene bounce={bounce} />
        <motion.p
          key={count}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-2 text-6xl font-extrabold text-brand-navy sm:text-7xl"
        >
          {count === start ? '—' : count}
        </motion.p>
      </ExerciseShell>
    )
  }

  const q = quiz[qIndex]
  return (
    <ExerciseShell
      titleKey="ex.counting.title"
      stepCurrent={qIndex + 1}
      stepTotal={quiz.length}
      instruction={t('ex1.quizIntro')}
      onBack={onBack}
      feedback={feedback ?? undefined}
      actions={
        feedback ? (
          <button
            onClick={nextQuestion}
            className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('shell.next')}
          </button>
        ) : (
          <button
            onClick={checkAnswer}
            disabled={selected === null}
            className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            {t('shell.check')}
          </button>
        )
      }
    >
      <p className="text-center text-xl font-bold text-brand-navy sm:text-2xl">
        {t(mode === 'up' ? 'ex1.quizQuestionUp' : 'ex1.quizQuestionDown', { n: q.n })}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {q.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => !feedback && setSelected(choice)}
            disabled={!!feedback}
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
