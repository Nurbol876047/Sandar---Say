import { useEffect, useRef, useState } from 'react'
import type { Point } from './useHandTracking'

// Normalized camera-frame thresholds (0-1, mirrored selfie view). Tuned for a laptop/tablet
// webcam framing the child from roughly the waist up — may need adjusting for very different
// camera distances/angles once tested against a real child on a real device.
const HEAD_Y = 0.45
const DOWN_Y = 0.62
const MID_LEFT_X = 0.42
const MID_RIGHT_X = 0.58
const TOGETHER_X = 0.2
const APART_X = 0.36
const CHEST_Y_MIN = 0.3
const CHEST_Y_MAX = 0.95

export const NEUROGYM_REP_TARGET: Record<string, number> = {
  crosscrawl: 6, // counts midline crossings (~3 round trips)
  earnose: 3,
  butterfly: 3,
}

/**
 * Counts repetitions of a neurogym move from live hand-wrist positions.
 * Each move id has its own cycle-detection rule; everything else is ignored.
 */
export function useNeurogymReps(moveId: string, active: boolean, hands: Point[]): number {
  const [reps, setReps] = useState(0)
  const sideRef = useRef<'left' | 'right' | null>(null)
  const phaseRef = useRef<'down' | 'up'>('down')
  const togetherRef = useRef(false)

  useEffect(() => {
    setReps(0)
    sideRef.current = null
    phaseRef.current = 'down'
    togetherRef.current = false
  }, [moveId, active])

  useEffect(() => {
    if (!active || hands.length === 0) return

    if (moveId === 'crosscrawl') {
      const hand = hands[0]
      if (hand.x < MID_LEFT_X) {
        if (sideRef.current === 'right') setReps((r) => r + 1)
        sideRef.current = 'left'
      } else if (hand.x > MID_RIGHT_X) {
        if (sideRef.current === 'left') setReps((r) => r + 1)
        sideRef.current = 'right'
      }
      return
    }

    if (moveId === 'earnose') {
      const up = hands.every((h) => h.y < HEAD_Y)
      const down = hands.every((h) => h.y > DOWN_Y)
      if (phaseRef.current === 'down' && up) {
        phaseRef.current = 'up'
      } else if (phaseRef.current === 'up' && down) {
        phaseRef.current = 'down'
        setReps((r) => r + 1)
      }
      return
    }

    if (moveId === 'butterfly') {
      if (hands.length < 2) return
      const [a, b] = hands
      const dx = Math.abs(a.x - b.x)
      const inChest = [a, b].every((h) => h.y > CHEST_Y_MIN && h.y < CHEST_Y_MAX)
      if (!togetherRef.current && dx < TOGETHER_X && inChest) {
        togetherRef.current = true
      } else if (togetherRef.current && dx > APART_X) {
        togetherRef.current = false
        setReps((r) => r + 1)
      }
    }
  }, [hands, active, moveId])

  return reps
}
