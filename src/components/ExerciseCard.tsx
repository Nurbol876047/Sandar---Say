import { motion } from 'framer-motion'
import { Calculator, CircleDot, Ear, Hand, Infinity as InfinityIcon, LayoutGrid, Play, Smile, Sparkles, Split, Star, Wind } from 'lucide-react'
import type { ComponentType } from 'react'
import type { ExerciseMeta, ExerciseProgress } from '../types'
import { useSettings } from '../context/SettingsContext'

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'circle-dot': CircleDot,
  split: Split,
  calculator: Calculator,
  hand: Hand,
  'layout-grid': LayoutGrid,
  infinity: InfinityIcon,
  smile: Smile,
  sparkles: Sparkles,
  ear: Ear,
  wind: Wind,
}

interface ExerciseCardProps {
  meta: ExerciseMeta
  progress?: ExerciseProgress
  onStart: (id: string) => void
}

export default function ExerciseCard({ meta, progress, onStart }: ExerciseCardProps) {
  const { t } = useSettings()
  const Icon = ICONS[meta.icon] ?? CircleDot

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: meta.order * 0.04 }}
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl ${meta.theme.bg} p-5 shadow-[0_8px_24px_-8px_rgba(32,58,135,0.25)] ring-2 ring-white/80 transition-shadow hover:shadow-[0_18px_36px_-12px_rgba(32,58,135,0.4)] sm:p-6`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-sm"
        style={{ background: 'radial-gradient(circle, #ffffff, transparent 70%)' }}
      />
      <div className="flex items-start justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white shadow ${meta.theme.badge}`}>
          {meta.order}
        </span>
        {progress?.completed && (
          <span className="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-brand-navy shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {progress.stars}
          </span>
        )}
      </div>

      <div className="my-4 flex h-20 items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3">
          <Icon className="h-9 w-9 text-brand-navy" />
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-brand-navy sm:text-xl">{t(meta.titleKey)}</h3>
      <p className="mt-1.5 flex-1 text-sm text-brand-navy/70 sm:text-base">{t(meta.descKey)}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brand-navy/70">
          {t(meta.difficulty === 'easy' ? 'exercise.difficulty.easy' : 'exercise.difficulty.medium')}
        </span>
        <button
          onClick={() => onStart(meta.id)}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 sm:px-5"
        >
          <Play className="h-4 w-4 fill-white" />
          {progress?.completed ? t('exercise.restart') : t('exercise.start')}
        </button>
      </div>
    </motion.div>
  )
}
