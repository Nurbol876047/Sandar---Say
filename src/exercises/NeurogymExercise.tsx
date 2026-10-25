import FollowAlongExercise from './FollowAlongExercise'
import { NEUROGYM_MOVES } from '../data/speechContent'
import type { ExerciseResult } from '../types'

export default function NeurogymExercise({
  onFinish,
  onBack,
}: {
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}) {
  return <FollowAlongExercise moves={NEUROGYM_MOVES} titleKey="ex.neurogym.title" onFinish={onFinish} onBack={onBack} />
}
