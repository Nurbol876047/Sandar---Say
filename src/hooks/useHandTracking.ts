import { useCallback, useEffect, useRef, useState } from 'react'
import type { HandLandmarker as HandLandmarkerType } from '@mediapipe/tasks-vision'

export type CameraStatus = 'idle' | 'loading' | 'running' | 'denied' | 'unsupported' | 'error'

export interface Point {
  x: number
  y: number
}

export interface HandTrackingResult {
  status: CameraStatus
  supported: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  extendedFingers: number
  indexTip: Point | null
  fingerTips: (Point | null)[]
  gestureOpen: boolean
  /** Wrist position of every currently detected hand (0-2 entries), mirrored like the other points. */
  hands: Point[]
  enable: () => void
  disable: () => void
}

// Fileset + model are fetched once from CDN on first camera use (requires internet that one time),
// then reused for the rest of the session. All frame processing happens locally in the browser.
const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

let sharedLandmarker: Promise<HandLandmarkerType> | null = null

function getLandmarker(): Promise<HandLandmarkerType> {
  if (!sharedLandmarker) {
    sharedLandmarker = import('@mediapipe/tasks-vision').then(({ FilesetResolver, HandLandmarker }) =>
      FilesetResolver.forVisionTasks(WASM_BASE).then((fileset) =>
        HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numHands: 2,
        }),
      ),
    )
  }
  return sharedLandmarker
}

const TIP_IDS = [4, 8, 12, 16, 20]

// Per finger [base, joint, tip] landmark ids, and how straight (in degrees, at `joint`) the
// base->joint->tip chain must be to call the finger "extended". A folded finger bends sharply at
// this joint (small angle); a straight one keeps base/joint/tip nearly in line (angle near 180°).
// The thumb's resting geometry is never as straight as the other fingers even when fully open, so
// it gets a lower bar.
const FINGER_CHAINS: { base: number; joint: number; tip: number; threshold: number }[] = [
  { base: 2, joint: 3, tip: 4, threshold: 120 }, // thumb: MCP-IP-TIP (naturally never as straight as the other fingers)
  { base: 5, joint: 6, tip: 8, threshold: 150 }, // index: MCP-PIP-TIP
  { base: 9, joint: 10, tip: 12, threshold: 150 }, // middle
  { base: 13, joint: 14, tip: 16, threshold: 150 }, // ring
  { base: 17, joint: 18, tip: 20, threshold: 150 }, // pinky
]

function jointAngleDeg(base: { x: number; y: number }, joint: { x: number; y: number }, tip: { x: number; y: number }): number {
  const v1 = { x: base.x - joint.x, y: base.y - joint.y }
  const v2 = { x: tip.x - joint.x, y: tip.y - joint.y }
  const mag1 = Math.hypot(v1.x, v1.y)
  const mag2 = Math.hypot(v2.x, v2.y)
  if (mag1 === 0 || mag2 === 0) return 180
  const cos = (v1.x * v2.x + v1.y * v2.y) / (mag1 * mag2)
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI
}

export function useHandTracking(): HandTrackingResult {
  const supported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia

  const [status, setStatus] = useState<CameraStatus>('idle')
  const [extendedFingers, setExtendedFingers] = useState(0)
  const [indexTip, setIndexTip] = useState<Point | null>(null)
  const [fingerTips, setFingerTips] = useState<(Point | null)[]>([null, null, null, null, null])
  const [gestureOpen, setGestureOpen] = useState(false)
  const [hands, setHands] = useState<Point[]>([])

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const activeRef = useRef(false)
  const pendingCountRef = useRef<number | null>(null)
  const pendingStreakRef = useRef(0)

  const loop = useCallback(() => {
    if (!activeRef.current) return
    const video = videoRef.current
    if (video && video.readyState >= 2) {
      getLandmarker()
        .then((landmarker) => {
          if (!activeRef.current) return
          const result = landmarker.detectForVideo(video, performance.now())
          setHands((result.landmarks ?? []).map((h) => ({ x: 1 - h[0].x, y: h[0].y })))
          const hand = result.landmarks?.[0]
          if (hand && hand.length === 21) {
            const tips: (Point | null)[] = TIP_IDS.map((id) => ({ x: 1 - hand[id].x, y: hand[id].y }))
            let extended = 0
            FINGER_CHAINS.forEach(({ base, joint, tip, threshold }) => {
              const angle = jointAngleDeg(hand[base], hand[joint], hand[tip])
              if (angle >= threshold) extended++
            })
            setFingerTips(tips)
            setIndexTip(tips[1])
            // Debounce the reported count: a single noisy frame shouldn't flip the number the
            // child sees. Only commit a new value once it repeats on the next frame too.
            if (extended === pendingCountRef.current) {
              pendingStreakRef.current += 1
            } else {
              pendingCountRef.current = extended
              pendingStreakRef.current = 1
            }
            if (pendingStreakRef.current >= 2) {
              setExtendedFingers(extended)
              setGestureOpen(extended >= 4)
            }
          } else {
            pendingCountRef.current = null
            pendingStreakRef.current = 0
            setFingerTips([null, null, null, null, null])
            setIndexTip(null)
            setExtendedFingers(0)
            setGestureOpen(false)
          }
        })
        .catch(() => {
          /* transient detection error, retry next frame */
        })
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const disable = useCallback(() => {
    activeRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    pendingCountRef.current = null
    pendingStreakRef.current = 0
    setExtendedFingers(0)
    setIndexTip(null)
    setFingerTips([null, null, null, null, null])
    setGestureOpen(false)
    setHands([])
    setStatus('idle')
  }, [])

  const enable = useCallback(() => {
    if (!supported) {
      setStatus('unsupported')
      return
    }
    setStatus('loading')
    Promise.all([
      navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360, facingMode: 'user' }, audio: false }),
      getLandmarker(),
    ])
      .then(([stream]) => {
        streamRef.current = stream
        const video = videoRef.current
        if (!video) {
          stream.getTracks().forEach((t) => t.stop())
          throw new Error('video element not mounted')
        }
        video.srcObject = stream
        return video.play()
      })
      .then(() => {
        activeRef.current = true
        setStatus('running')
        rafRef.current = requestAnimationFrame(loop)
      })
      .catch((err: unknown) => {
        const name = err && typeof err === 'object' && 'name' in err ? (err as { name: string }).name : ''
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') setStatus('denied')
        else setStatus('error')
      })
  }, [supported, loop])

  useEffect(() => disable, [disable])

  return { status, supported, videoRef, extendedFingers, indexTip, fingerTips, gestureOpen, hands, enable, disable }
}
