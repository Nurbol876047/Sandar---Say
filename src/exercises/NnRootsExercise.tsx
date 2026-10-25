import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import ExerciseShell from '../components/ExerciseShell'
import { useSettings } from '../context/SettingsContext'
import { playCorrect, playTry } from '../utils/sound'
import { shuffle } from '../utils/math'
import { NN_ROOT_GROUPS } from '../data/speechContent'
import type { ExerciseResult } from '../types'

interface Round {
  word: string
  root: string
}

const ROOTS = NN_ROOT_GROUPS.map((g) => g.root)

function buildRounds(): Round[] {
  const rounds = NN_ROOT_GROUPS.flatMap((group) => group.words.map((word) => ({ word, root: group.root })))
  return shuffle(rounds)
}

export default function NnRootsExercise({
  onFinish,
  onBack,
}: {
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}) {
  const { t, sound } = useSettings()
  const rounds = useMemo(() => buildRounds(), [])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const round = rounds[index]
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle button order each round, not on every render
  const options = useMemo(() => shuffle(ROOTS), [round])

  const select = (choice: string) => {
    if (answer) return
    setAnswer(choice)
    if (choice === round.root) {
      setCorrectCount((c) => c + 1)
      playCorrect(sound)
    } else {
      playTry(sound)
    }
  }

  const next = () => {
    if (index + 1 >= rounds.length) {
      onFinish({ correct: correctCount, total: rounds.length })
      return
    }
    setIndex((i) => i + 1)
    setAnswer(null)
  }

  const feedback = answer
    ? {
        status: (answer === round.root ? 'correct' : 'retry') as 'correct' | 'retry',
        message: t(answer === round.root ? 'nnroots.correct' : 'nnroots.wrong', { word: round.word, root: round.root }),
      }
    : undefined

  return (
    <ExerciseShell
      titleKey="ex.nnRoots.title"
      stepCurrent={index + 1}
      stepTotal={rounds.length}
      instruction={t('nnroots.instruction')}
      onBack={onBack}
      feedback={feedback}
      hideListenButton
      actions={
        answer ? (
          <button
            onClick={next}
            className="rounded-full bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('shell.next')}
          </button>
        ) : (
          options.map((root) => (
            <button
              key={root}
              onClick={() => select(root)}
              className="rounded-full bg-gradient-to-r from-brand-turquoise to-brand-sky px-6 py-3 text-xl font-extrabold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {root}
            </button>
          ))
        )
      }
    >
      <motion.div
        key={`word-${index}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <span className="rounded-2xl bg-white/80 px-8 py-5 text-4xl font-extrabold text-brand-navy shadow-sm sm:text-5xl">
          {round.word}
        </span>
        <p className="mt-2 text-sm font-semibold text-brand-navy/50">{t('nnroots.question')}</p>
      </motion.div>
    </ExerciseShell>
  )
}
