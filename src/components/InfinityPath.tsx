import { useMemo } from 'react'

export const INFINITY_POINT_COUNT = 8

const CX = 200
const CY = 120
const A = 165
const B = 92

export function infinityPoint(t: number): { x: number; y: number } {
  const denom = 1 + Math.sin(t) ** 2
  return {
    x: CX + (A * Math.cos(t)) / denom,
    y: CY + (B * Math.sin(t) * Math.cos(t)) / denom,
  }
}

// Sampling exactly at i/N*2π puts two of the 8 points (at t=π/2 and t=3π/2) on top of each
// other, both landing exactly on the lemniscate's self-crossing at the path's center. A
// half-step offset keeps all points evenly spaced along the curve while avoiding that crossing.
function pointAngle(i: number): number {
  return ((i + 0.5) / INFINITY_POINT_COUNT) * Math.PI * 2
}

export function infinityPointsNormalized(): { x: number; y: number }[] {
  return Array.from({ length: INFINITY_POINT_COUNT }, (_, i) => {
    const p = infinityPoint(pointAngle(i))
    return { x: p.x / 400, y: p.y / 240 }
  })
}

interface InfinityPathProps {
  activeIndex: number
  reachedCount: number
  markerT: number | null
  onPointClick?: (index: number) => void
  interactivePoints?: boolean
}

export default function InfinityPath({ activeIndex, reachedCount, markerT, onPointClick, interactivePoints = true }: InfinityPathProps) {
  const pathD = useMemo(() => {
    const steps = 120
    let d = ''
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2
      const p = infinityPoint(t)
      d += `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)} `
    }
    return d + 'Z'
  }, [])

  const points = useMemo(() => Array.from({ length: INFINITY_POINT_COUNT }, (_, i) => infinityPoint(pointAngle(i))), [])

  const marker = markerT !== null ? infinityPoint(markerT * Math.PI * 2) : null

  return (
    <svg viewBox="0 0 400 240" className="h-56 w-full max-w-md sm:h-64">
      <path d={pathD} fill="none" stroke="#8fd3ff" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
      <path d={pathD} fill="none" stroke="#203a87" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" opacity="0.4" />

      {points.map((p, i) => {
        const done = i < reachedCount
        const isActive = i === activeIndex
        return (
          <g key={i} onClick={() => interactivePoints && onPointClick?.(i)} style={{ cursor: interactivePoints ? 'pointer' : 'default' }}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isActive ? 18 : 15}
              fill={done ? '#cff5d5' : isActive ? '#fff0b8' : '#ffffff'}
              stroke={done ? '#34a764' : isActive ? '#e8a900' : '#8fd3ff'}
              strokeWidth={isActive ? 4 : 3}
              className={isActive ? 'animate-pulse' : ''}
            />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#203a87">
              {i + 1}
            </text>
          </g>
        )
      })}

      {marker && (
        <circle cx={marker.x} cy={marker.y} r="10" fill="#ff8a5c" stroke="#ffffff" strokeWidth="3" />
      )}
    </svg>
  )
}
