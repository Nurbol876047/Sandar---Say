import type { ExerciseMeta } from '../types'

export const EXERCISES: ExerciseMeta[] = [
  {
    id: 'counting',
    order: 1,
    titleKey: 'ex.counting.title',
    descKey: 'ex.counting.desc',
    difficulty: 'easy',
    icon: 'circle-dot',
    theme: { bg: 'bg-brand-skylight', ring: 'ring-sky-300', badge: 'bg-sky-400' },
    badgeKey: 'badge.counting',
  },
  {
    id: 'odd-even',
    order: 2,
    titleKey: 'ex.oddeven.title',
    descKey: 'ex.oddeven.desc',
    difficulty: 'easy',
    icon: 'split',
    theme: { bg: 'bg-brand-green', ring: 'ring-emerald-300', badge: 'bg-emerald-400' },
    badgeKey: 'badge.odd-even',
  },
  {
    id: 'math',
    order: 3,
    titleKey: 'ex.math.title',
    descKey: 'ex.math.desc',
    difficulty: 'medium',
    icon: 'calculator',
    theme: { bg: 'bg-brand-yellow', ring: 'ring-amber-300', badge: 'bg-amber-400' },
    badgeKey: 'badge.math',
  },
  {
    id: 'fingers',
    order: 4,
    titleKey: 'ex.fingers.title',
    descKey: 'ex.fingers.desc',
    difficulty: 'easy',
    icon: 'hand',
    theme: { bg: 'bg-brand-lavender', ring: 'ring-violet-300', badge: 'bg-violet-400' },
    badgeKey: 'badge.fingers',
  },
  {
    id: 'composition',
    order: 5,
    titleKey: 'ex.composition.title',
    descKey: 'ex.composition.desc',
    difficulty: 'medium',
    icon: 'layout-grid',
    theme: { bg: 'bg-brand-pink', ring: 'ring-pink-300', badge: 'bg-pink-400' },
    badgeKey: 'badge.composition',
  },
  {
    id: 'infinity',
    order: 6,
    titleKey: 'ex.infinity.title',
    descKey: 'ex.infinity.desc',
    difficulty: 'medium',
    icon: 'infinity',
    theme: { bg: 'bg-brand-skylight', ring: 'ring-cyan-300', badge: 'bg-cyan-400' },
    badgeKey: 'badge.infinity',
  },
]

export function getExerciseMeta(id: string): ExerciseMeta | undefined {
  return EXERCISES.find((e) => e.id === id)
}

export function nextExerciseId(id: string): string | null {
  const idx = EXERCISES.findIndex((e) => e.id === id)
  if (idx === -1 || idx === EXERCISES.length - 1) return null
  return EXERCISES[idx + 1].id
}
