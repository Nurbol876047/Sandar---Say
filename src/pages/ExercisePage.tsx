import { useState } from 'react'
import type { ExerciseId, ExerciseResult } from '../types'
import { getExerciseMeta, nextExerciseId } from '../data/exercises'
import { useProgress } from '../context/ProgressContext'
import ResultScreen from '../components/ResultScreen'
import CountingExercise from '../exercises/CountingExercise'
import OddEvenExercise from '../exercises/OddEvenExercise'
import MathExercise from '../exercises/MathExercise'
import FingerExercise from '../exercises/FingerExercise'
import CompositionExercise from '../exercises/CompositionExercise'
import InfinityExercise from '../exercises/InfinityExercise'
import ArticulationExercise from '../exercises/ArticulationExercise'
import BreathingExercise from '../exercises/BreathingExercise'
import NeurogymExercise from '../exercises/NeurogymExercise'
import SoundRlExercise from '../exercises/SoundRlExercise'
import SoundShExercise from '../exercises/SoundShExercise'
import SoundNnExercise from '../exercises/SoundNnExercise'
import SoundLuExercise from '../exercises/SoundLuExercise'
import NnRootsExercise from '../exercises/NnRootsExercise'

const COMPONENTS: Record<ExerciseId, React.ComponentType<{ onFinish: (result: ExerciseResult) => void; onBack: () => void }>> = {
  counting: CountingExercise,
  'odd-even': OddEvenExercise,
  math: MathExercise,
  fingers: FingerExercise,
  composition: CompositionExercise,
  infinity: InfinityExercise,
  articulation: ArticulationExercise,
  breathing: BreathingExercise,
  neurogym: NeurogymExercise,
  'sound-rl': SoundRlExercise,
  'sound-sh': SoundShExercise,
  'sound-nn': SoundNnExercise,
  'sound-lu': SoundLuExercise,
  'nn-roots': NnRootsExercise,
}

interface ExercisePageProps {
  exerciseId: ExerciseId
  onBack: () => void
  onNavigateExercise: (id: string) => void
  onHome: () => void
}

export default function ExercisePage({ exerciseId, onBack, onNavigateExercise, onHome }: ExercisePageProps) {
  const meta = getExerciseMeta(exerciseId)!
  const { recordResult } = useProgress()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<ExerciseResult | null>(null)

  const Component = COMPONENTS[exerciseId]
  const nextId = nextExerciseId(exerciseId)

  if (result) {
    const stars = result.total > 0 ? (result.correct === result.total ? 3 : result.correct / result.total >= 0.6 ? 2 : 1) : 0
    return (
      <ResultScreen
        titleKey={meta.titleKey}
        correct={result.correct}
        total={result.total}
        stars={stars}
        onRetry={() => {
          setResult(null)
          setAttempt((a) => a + 1)
        }}
        onNext={nextId ? () => onNavigateExercise(nextId) : undefined}
        onHome={onHome}
      />
    )
  }

  return (
    <Component
      key={attempt}
      onBack={onBack}
      onFinish={(res) => {
        recordResult(exerciseId, res.correct, res.total)
        setResult(res)
      }}
    />
  )
}
