import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function SpeechBubble({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
      className={`relative rounded-3xl rounded-bl-none bg-white px-5 py-4 text-sm font-semibold text-brand-navy shadow-lg sm:text-base ${className}`}
    >
      {children}
      <span className="absolute -bottom-3 left-6 h-6 w-6 rotate-45 rounded-sm bg-white" />
    </motion.div>
  )
}
