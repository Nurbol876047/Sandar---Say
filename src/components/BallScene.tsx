import { motion } from 'framer-motion'
import { useSettings } from '../context/SettingsContext'

export default function BallScene({ bounce, size = 120 }: { bounce: number; size?: number }) {
  const { animations, animationSpeed } = useSettings()
  const duration = (animationSpeed === 'slow' ? 1.6 : 0.9) * (animations ? 1 : 0.001)

  return (
    <div className="flex h-56 items-end justify-center">
      <motion.div
        key={bounce}
        initial={{ y: 0, rotate: 0 }}
        animate={{ y: [0, -140, 0], rotate: [0, 160, 320] }}
        transition={{ duration, times: [0, 0.48, 1], ease: 'easeOut' }}
      >
        <Ball size={size} />
      </motion.div>
    </div>
  )
}

export function Ball({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
      <defs>
        <radialGradient id="ballShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="#ffffff" />
      <path d="M60 4 A56 56 0 0 1 60 116 Z" fill="#ff8a5c" />
      <path d="M60 4 A56 56 0 0 0 60 116 Z" fill="#ffdce8" />
      <path d="M60 4 A56 56 0 0 1 108 48 L60 60 Z" fill="#8fd3ff" />
      <path d="M60 4 A56 56 0 0 0 12 48 L60 60 Z" fill="#fff0b8" />
      <path d="M60 116 A56 56 0 0 1 12 72 L60 60 Z" fill="#cff5d5" />
      <circle cx="60" cy="60" r="56" fill="url(#ballShade)" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#203a87" strokeOpacity="0.15" strokeWidth="2" />
    </svg>
  )
}
