import { useCallback, useEffect, useRef, useState } from 'react'
import type { FaceLandmarker as FaceLandmarkerType } from '@mediapipe/tasks-vision'
import type { CameraStatus } from './useHandTracking'

export interface FaceTrackingResult {
  status: CameraStatus
  supported: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** ARKit-style blendshape scores (0-1), e.g. blendshapes.jawOpen, blendshapes.mouthPucker. Empty when no face is seen. */
  blendshapes: Record<string, number>
  faceVisible: boolean
  enable: () => void
  disable: () => void
}

// Same CDN pattern as useHandTracking: fetched once on first use, then reused for the session.
const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

let sharedLandmarker: Promise<FaceLandmarkerType> | null = null

function getLandmarker(): Promise<FaceLandmarkerType> {
  if (!sharedLandmarker) {
    sharedLandmarker = import('@mediapipe/tasks-vision').then(({ FilesetResolver, FaceLandmarker }) =>
      FilesetResolver.forVisionTasks(WASM_BASE).then((fileset) =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        }),
      ),
    )
  }
  return sharedLandmarker
}

export function useFaceTracking(): FaceTrackingResult {
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia

  const [status, setStatus] = useState<CameraStatus>('idle')
  const [blendshapes, setBlendshapes] = useState<Record<string, number>>({})
  const [faceVisible, setFaceVisible] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const activeRef = useRef(false)

  const loop = useCallback(() => {
    if (!activeRef.current) return
    const video = videoRef.current
    if (video && video.readyState >= 2) {
      getLandmarker()
        .then((landmarker) => {
          if (!activeRef.current) return
          const result = landmarker.detectForVideo(video, performance.now())
          const categories = result.faceBlendshapes?.[0]?.categories
          if (categories && categories.length > 0) {
            const next: Record<string, number> = {}
            for (const c of categories) next[c.categoryName] = c.score
            setBlendshapes(next)
            setFaceVisible(true)
          } else {
            setBlendshapes({})
            setFaceVisible(false)
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
    setBlendshapes({})
    setFaceVisible(false)
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

  return { status, supported, videoRef, blendshapes, faceVisible, enable, disable }
}
