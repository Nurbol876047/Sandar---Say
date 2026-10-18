import { motion } from 'framer-motion'

interface FingerSpec {
  key: string
  // finger rect geometry
  x: number
  top: number
  bottom: number
  width: number
  rotate?: number
}

const FINGERS: FingerSpec[] = [
  { key: 'thumb', x: 48, top: 150, bottom: 225, width: 40, rotate: -38 },
  { key: 'index', x: 96, top: 55, bottom: 205, width: 36 },
  { key: 'middle', x: 138, top: 25, bottom: 205, width: 38 },
  { key: 'ring', x: 182, top: 48, bottom: 205, width: 36 },
  { key: 'pinky', x: 222, top: 90, bottom: 205, width: 32 },
]

interface HandIllustrationProps {
  selected: boolean[]
  onToggle?: (index: number) => void
  interactive?: boolean
  highlightCount?: number
}

export default function HandIllustration({ selected, onToggle, interactive = true, highlightCount }: HandIllustrationProps) {
  return (
    <svg viewBox="0 0 300 320" className="h-64 w-64 sm:h-72 sm:w-72">
      <rect x="55" y="190" width="200" height="120" rx="55" fill="#ffe3c2" />
      {FINGERS.map((f, i) => {
        const isOn = highlightCount !== undefined ? i < highlightCount : selected[i]
        const height = f.bottom - f.top
        return (
          <motion.g
            key={f.key}
            style={{ transformOrigin: `${f.x + f.width / 2}px ${f.bottom}px`, cursor: interactive ? 'pointer' : 'default' }}
            animate={{ rotate: f.rotate ?? 0 }}
            whileTap={interactive ? { scale: 0.93 } : undefined}
            onClick={() => interactive && onToggle?.(i)}
          >
            <rect
              x={f.x}
              y={f.top}
              width={f.width}
              height={height}
              rx={f.width / 2}
              fill={isOn ? '#8fd3ff' : '#ffe3c2'}
              stroke={isOn ? '#203a87' : '#e3b78c'}
              strokeWidth="3"
            />
            <circle cx={f.x + f.width / 2} cy={f.top + f.width / 2} r={f.width / 2 - 4} fill={isOn ? '#e8f4ff' : '#fff4e6'} opacity="0.7" />
          </motion.g>
        )
      })}
      <rect x="55" y="190" width="200" height="120" rx="55" fill="none" stroke="#e3b78c" strokeWidth="3" />
    </svg>
  )
}
