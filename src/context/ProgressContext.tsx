import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ExerciseId, ExerciseProgress, ProgressState } from '../types'
import { loadJSON, removeJSON, saveJSON } from '../utils/storage'

const DEFAULT_PROGRESS: ProgressState = { exercises: {} }

function computeStars(correct: number, total: number): number {
  if (total <= 0) return 0
  const ratio = correct / total
  if (ratio >= 0.99) return 3
  if (ratio >= 0.6) return 2
  return 1
}

interface ProgressContextValue {
  progress: ProgressState
  recordResult: (id: ExerciseId, correct: number, total: number) => void
  clearProgress: () => void
  totalStars: number
  completedCount: number
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadJSON('progress', DEFAULT_PROGRESS))

  useEffect(() => {
    saveJSON('progress', progress)
  }, [progress])

  const recordResult = useCallback((id: ExerciseId, correct: number, total: number) => {
    setProgress((prev) => {
      const existing = prev.exercises[id]
      const stars = computeStars(correct, total)
      const ratio = total > 0 ? correct / total : 0
      const existingRatio = existing && existing.bestTotal > 0 ? existing.bestCorrect / existing.bestTotal : -1
      const keepNew = ratio >= existingRatio
      const updated: ExerciseProgress = {
        completed: true,
        bestCorrect: keepNew ? correct : existing!.bestCorrect,
        bestTotal: keepNew ? total : existing!.bestTotal,
        attempts: (existing?.attempts ?? 0) + 1,
        stars: Math.max(existing?.stars ?? 0, stars),
        lastCompletedAt: new Date().toISOString(),
      }
      return { ...prev, exercises: { ...prev.exercises, [id]: updated } }
    })
  }, [])

  const clearProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS)
    removeJSON('progress')
  }, [])

  const totalStars = useMemo(
    () => Object.values(progress.exercises).reduce((sum, e) => sum + (e?.stars ?? 0), 0),
    [progress],
  )
  const completedCount = useMemo(
    () => Object.values(progress.exercises).filter((e) => e?.completed).length,
    [progress],
  )

  const value = useMemo<ProgressContextValue>(
    () => ({ progress, recordResult, clearProgress, totalStars, completedCount }),
    [progress, recordResult, clearProgress, totalStars, completedCount],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
