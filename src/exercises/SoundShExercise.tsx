import SoundSortExercise from './SoundSortExercise'
import { SOUND_PAIRS } from '../data/speechContent'
import type { ExerciseResult } from '../types'

export default function SoundShExercise({
  onFinish,
  onBack,
}: {
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}) {
  return <SoundSortExercise pair={SOUND_PAIRS.sh} onFinish={onFinish} onBack={onBack} />
}
