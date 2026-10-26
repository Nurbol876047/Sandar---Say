import { useEffect, useRef, useState } from 'react'

/**
 * Per-move camera check, built on MediaPipe's ARKit-style face blendshapes. Mouth exercises mostly
 * move the tongue, which blendshapes don't see directly, so each move is mapped to the closest
 * visible proxy on the lips/jaw rather than graded with full precision:
 * - 'hold': the shape must stay above `threshold` continuously for `holdMs`.
 * - 'activity': counts open/close (or out/in) cycles of one shape, for moves with no sustained
 *   target shape — a rough "is the child moving their mouth at all" signal rather than a precise one.
 */
type CheckConfig =
  | { mode: 'hold'; shapes: string[]; threshold: number; holdMs: number }
  | { mode: 'activity'; shapes: string[]; onThreshold: number; offThreshold: number; targetReps: number }

export const ARTICULATION_CHECKS: Record<string, CheckConfig> = {
  clock: { mode: 'activity', shapes: ['jawOpen'], onThreshold: 0.35, offThreshold: 0.15, targetReps: 3 },
  horse: { mode: 'activity', shapes: ['jawOpen'], onThreshold: 0.35, offThreshold: 0.15, targetReps: 3 },
  jam: { mode: 'activity', shapes: ['tongueOut'], onThreshold: 0.4, offThreshold: 0.15, targetReps: 3 },
  mushroom: { mode: 'hold', shapes: ['jawOpen'], threshold: 0.35, holdMs: 1200 },
  bubbles: { mode: 'hold', shapes: ['mouthFunnel', 'mouthPucker'], threshold: 0.3, holdMs: 1000 },
  candle: { mode: 'hold', shapes: ['mouthFunnel', 'mouthPucker'], threshold: 0.3, holdMs: 1000 },
  balloon: { mode: 'hold', shapes: ['mouthFunnel', 'mouthPucker'], threshold: 0.3, holdMs: 1000 },
  steamship: { mode: 'hold', shapes: ['mouthSmileLeft', 'mouthSmileRight'], threshold: 0.25, holdMs: 1200 },
  wolfhowl: { mode: 'hold', shapes: ['mouthFunnel', 'mouthPucker'], threshold: 0.3, holdMs: 1200 },
}

function shapeValue(blendshapes: Record<string, number>, shapes: string[]): number {
  return Math.max(0, ...shapes.map((s) => blendshapes[s] ?? 0))
}

export interface ArticulationCheckResult {
  /** 0-1, how close the current attempt is to counting as done. */
  progress: number
  done: boolean
}

export function useArticulationCheck(moveId: string, active: boolean, blendshapes: Record<string, number>): ArticulationCheckResult {
  const config = ARTICULATION_CHECKS[moveId]
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const holdStartRef = useRef<number | null>(null)
  const phaseRef = useRef<'low' | 'high'>('low')
  const repsRef = useRef(0)

  useEffect(() => {
    setProgress(0)
    setDone(false)
    holdStartRef.current = null
    phaseRef.current = 'low'
    repsRef.current = 0
  }, [moveId, active])

  useEffect(() => {
    if (!active || !config || done) return
    const value = shapeValue(blendshapes, config.shapes)

    if (config.mode === 'hold') {
      if (value >= config.threshold) {
        if (holdStartRef.current === null) holdStartRef.current = performance.now()
        const elapsed = performance.now() - holdStartRef.current
        const next = Math.min(1, elapsed / config.holdMs)
        setProgress(next)
        if (next >= 1) setDone(true)
      } else {
        holdStartRef.current = null
        setProgress(0)
      }
      return
    }

    // activity: count value crossing from below offThreshold up past onThreshold and back down
    if (phaseRef.current === 'low' && value >= config.onThreshold) {
      phaseRef.current = 'high'
    } else if (phaseRef.current === 'high' && value <= config.offThreshold) {
      phaseRef.current = 'low'
      repsRef.current += 1
      const next = Math.min(1, repsRef.current / config.targetReps)
      setProgress(next)
      if (repsRef.current >= config.targetReps) setDone(true)
    }
  }, [blendshapes, active, config, done])

  return { progress, done }
}
