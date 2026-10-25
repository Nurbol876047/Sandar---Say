import FollowAlongExercise from './FollowAlongExercise'
import { BREATHING_MOVES } from '../data/speechContent'
import type { ExerciseResult } from '../types'

export default function BreathingExercise({
  onFinish,
  onBack,
}: {
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}) {
  return <FollowAlongExercise moves={BREATHING_MOVES} titleKey="ex.breathing.title" onFinish={onFinish} onBack={onBack} />
}
