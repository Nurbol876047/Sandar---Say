import FollowAlongExercise from './FollowAlongExercise'
import { SOUND_LU_MOVES } from '../data/speechContent'
import type { ExerciseResult } from '../types'

export default function SoundLuExercise({
  onFinish,
  onBack,
}: {
  onFinish: (result: ExerciseResult) => void
  onBack: () => void
}) {
  return <FollowAlongExercise moves={SOUND_LU_MOVES} titleKey="ex.soundLu.title" onFinish={onFinish} onBack={onBack} />
}
