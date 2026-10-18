import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'

export type FeedbackStatus = 'correct' | 'retry' | null

export default function FeedbackBanner({ status, message }: { status: FeedbackStatus; message: string }) {
  return (
    <AnimatePresence mode="wait">
      {status && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 14, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          role="status"
          className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-base font-bold shadow-md sm:text-lg ${
            status === 'correct' ? 'bg-brand-green text-emerald-900' : 'bg-brand-yellow text-amber-900'
          }`}
        >
          {status === 'correct' ? (
            <CheckCircle2 className="h-7 w-7 shrink-0" />
          ) : (
            <Sparkles className="h-7 w-7 shrink-0" />
          )}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
