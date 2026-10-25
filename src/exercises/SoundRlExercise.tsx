import SoundSortExercise from './SoundSortExercise'
import { SOUND_PAIRS } from '../data/speechContent'
import type { ExerciseResult } from '../types'

export default function SoundRlExercise({
  onFinish,
  onBack,
}: {
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}) {
  return <SoundSortExercise pair={SOUND_PAIRS.rl} onFinish={onFinish} onBack={onBack} />
}
