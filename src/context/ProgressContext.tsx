import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ExerciseId, ExerciseProgress, ProgressState } from '../types'
import { loadJSON, removeJSON, saveJSON } from '../utils/storage'
import { useAuth } from './AuthContext'
import { api, type ApiProgress } from '../lib/api'

const DEFAULT_PROGRESS: ProgressState = { exercises: {} }

function computeStars(correct: number, total: number): number {
  if (total <= 0) return 0
  const ratio = correct / total
  if (ratio >= 0.99) return 3
  if (ratio >= 0.6) return 2
  return 1
}

function fromApi(rows: ApiProgress[]): ProgressState {
  const exercises: ProgressState['exercises'] = {}
  for (const row of rows) {
    exercises[row.exerciseId as ExerciseId] = {
      completed: row.completed,
      bestCorrect: row.bestCorrect,
      bestTotal: row.bestTotal,
      attempts: row.attempts,
      stars: row.stars,
      lastCompletedAt: row.lastCompletedAt,
    }
  }
  return { exercises }
}

interface ProgressContextValue {
  progress: ProgressState
  recordResult: (id: ExerciseId, correct: number, total: number) => void
  clearProgress: () => void
  totalStars: number
  completedCount: number
  /** true when progress is synced to the backend for a logged-in parent's active child (not the anonymous local copy) */
  synced: boolean
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { token, activeChildId, user } = useAuth()
  const synced = Boolean(token && activeChildId && user?.role === 'parent')

  const [localProgress, setLocalProgress] = useState<ProgressState>(() => loadJSON('progress', DEFAULT_PROGRESS))
  const [serverProgress, setServerProgress] = useState<ProgressState>(DEFAULT_PROGRESS)

  useEffect(() => {
    saveJSON('progress', localProgress)
  }, [localProgress])

  useEffect(() => {
    if (!synced || !token || !activeChildId) return
    let cancelled = false
    api
      .getProgress(token, activeChildId)
      .then((res) => {
        if (!cancelled) setServerProgress(fromApi(res.progress))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [synced, token, activeChildId])

  const recordResult = useCallback(
    (id: ExerciseId, correct: number, total: number) => {
      if (synced && token && activeChildId) {
        api
          .postProgress(token, { childId: activeChildId, exerciseId: id, correct, total })
          .then((res) => {
            setServerProgress((prev) => ({
              ...prev,
              exercises: { ...prev.exercises, [id]: fromApi([res.progress]).exercises[id]! },
            }))
          })
          .catch(() => {})
        return
      }
      setLocalProgress((prev) => {
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
    },
    [synced, token, activeChildId],
  )

  const clearProgress = useCallback(() => {
    setLocalProgress(DEFAULT_PROGRESS)
    removeJSON('progress')
  }, [])

  const active = synced ? serverProgress : localProgress

  const totalStars = useMemo(() => Object.values(active.exercises).reduce((sum, e) => sum + (e?.stars ?? 0), 0), [active])
  const completedCount = useMemo(() => Object.values(active.exercises).filter((e) => e?.completed).length, [active])

  const value = useMemo<ProgressContextValue>(
    () => ({ progress: active, recordResult, clearProgress, totalStars, completedCount, synced }),
    [active, recordResult, clearProgress, totalStars, completedCount, synced],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
