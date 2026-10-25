import FollowAlongExercise from './FollowAlongExercise'
import { ARTICULATION_MOVES } from '../data/speechContent'
import type { ExerciseResult } from '../types'

export default function ArticulationExercise({
  onFinish,
  onBack,
}: {
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}) {
  return <FollowAlongExercise moves={ARTICULATION_MOVES} titleKey="ex.articulation.title" onFinish={onFinish} onBack={onBack} />
}
