import type { TranslationKey } from './data/translations'

export type Lang = 'kk' | 'ru'

export type AnimationSpeed = 'normal' | 'slow'

export interface Settings {
  language: Lang
  sound: boolean
  animations: boolean
  animationSpeed: AnimationSpeed
}

export type ExerciseId =
  | 'counting'
  | 'odd-even'
  | 'math'
  | 'fingers'
  | 'composition'
  | 'infinity'
  | 'articulation'
  | 'breathing'
  | 'neurogym'
  | 'sound-rl'
  | 'sound-sh'
  | 'sound-nn'
  | 'sound-lu'
  | 'nn-roots'

export type Difficulty = 'easy' | 'medium'

export type ExerciseCategory = 'count' | 'speech' | 'sounds'

export interface ExerciseMeta {
  id: ExerciseId
  order: number
  category: ExerciseCategory
  titleKey: TranslationKey
  descKey: TranslationKey
  difficulty: Difficulty
  icon: string
  theme: {
    bg: string
    ring: string
    badge: string
  }
  badgeKey: TranslationKey
}

export interface ExerciseProgress {
  completed: boolean
  bestCorrect: number
  bestTotal: number
  attempts: number
  stars: number
  lastCompletedAt: string | null
}

export interface ProgressState {
  exercises: Partial<Record<ExerciseId, ExerciseProgress>>
}

/** Local-only log of calendar days (YYYY-MM-DD) the child did at least one exercise, for the practice calendar/streak. */
export interface ActivityState {
  dates: string[]
}

export interface ExerciseResult {
  correct: number
  total: number
}
