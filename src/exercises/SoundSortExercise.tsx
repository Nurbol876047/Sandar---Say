import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Volume2 } from 'lucide-react'
import ExerciseShell from '../components/ExerciseShell'
import { useSettings } from '../context/SettingsContext'
import { useWordVoice } from '../hooks/useWordVoice'
import { playCorrect, playTry } from '../utils/sound'
import { shuffle } from '../utils/math'
import type { ExerciseResult } from '../types'
import type { SoundOption, SoundPair } from '../data/speechContent'

export default function SoundSortExercise({
  pair,
  onFinish,
  onBack,
}: {
  pair: SoundPair
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}) {
  const { t, sound } = useSettings()
  const { speakWord } = useWordVoice()
  const words = useMemo(() => shuffle(pair.words), [pair])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<SoundOption | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const word = words[index]

  useEffect(() => {
    speakWord(word.text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const select = (choice: SoundOption) => {
    if (answer) return
    setAnswer(choice)
    if (choice === word.correct) {
      setCorrectCount((c) => c + 1)
      playCorrect(sound)
    } else {
      playTry(sound)
    }
  }

  const next = () => {
    if (index + 1 >= words.length) {
      onFinish({ correct: correctCount, total: words.length })
      return
    }
    setIndex((i) => i + 1)
    setAnswer(null)
  }

  const correctLabel = word.correct === 'A' ? pair.labelA : pair.labelB
  const feedback = answer
    ? {
        status: (answer === word.correct ? 'correct' : 'retry') as 'correct' | 'retry',
        message: t(answer === word.correct ? 'soundsort.correct' : 'soundsort.wrong', { word: word.text, sound: correctLabel }),
      }
    : undefined

  return (
    <ExerciseShell
      titleKey={pair.titleKey}
      stepCurrent={index + 1}
      stepTotal={words.length}
      instruction={t('soundsort.instruction')}
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
          <>
            <button
              onClick={() => select('A')}
              className="rounded-full bg-gradient-to-r from-brand-turquoise to-brand-sky px-7 py-4 text-2xl font-extrabold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {pair.labelA}
            </button>
            <button
              onClick={() => select('B')}
              className="rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-7 py-4 text-2xl font-extrabold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {pair.labelB}
            </button>
          </>
        )
      }
    >
      <motion.div
        key={`word-${index}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <span className="text-7xl">{word.emoji}</span>
        <button
          onClick={() => speakWord(word.text)}
          className="flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-3xl font-extrabold text-brand-navy shadow-sm transition-transform hover:scale-105 active:scale-95 sm:text-4xl"
        >
          {word.text}
          <Volume2 className="h-6 w-6 shrink-0 text-brand-navy/40 sm:h-7 sm:w-7" />
        </button>
        <p className="text-sm font-semibold text-brand-navy/50">{t('soundsort.question')}</p>
        {pair.hintKey && (
          <div className="mt-1 flex max-w-sm items-start gap-2 rounded-2xl bg-brand-sun/20 px-4 py-3 text-left text-xs font-semibold text-brand-navy/80 sm:text-sm">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>{t(pair.hintKey)}</span>
          </div>
        )}
      </motion.div>
    </ExerciseShell>
  )
}
