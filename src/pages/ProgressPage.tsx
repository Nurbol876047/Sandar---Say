import { useState } from 'react'
import { Award, CheckCircle2, Percent, Star, Trash2 } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useProgress } from '../context/ProgressContext'
import { EXERCISES } from '../data/exercises'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import PracticeCalendar from '../components/PracticeCalendar'
import { formatFullDate } from '../utils/date'
import type { ExerciseProgress } from '../types'

function formatDate(iso: string | null, lang: 'kk' | 'ru'): string {
  if (!iso) return '—'
  return formatFullDate(new Date(iso), lang)
}

export default function ProgressPage() {
  const { t, language } = useSettings()
  const { progress, totalStars, completedCount, activityDates, streak, clearProgress, synced } = useProgress()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const entries = Object.values(progress.exercises).filter((e): e is ExerciseProgress => !!e)
  const sumCorrect = entries.reduce((s, e) => s + e.bestCorrect, 0)
  const sumTotal = entries.reduce((s, e) => s + e.bestTotal, 0)
  const successRate = sumTotal > 0 ? Math.round((sumCorrect / sumTotal) * 100) : 0

  const hasAny = completedCount > 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-center text-3xl font-extrabold text-brand-navy sm:text-4xl">{t('progress.title')}</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label={t('progress.completedCount')} value={`${completedCount}/${EXERCISES.length}`} />
        <StatCard icon={<Star className="h-6 w-6" />} label={t('progress.correctAnswers')} value={sumCorrect} />
        <StatCard icon={<Percent className="h-6 w-6" />} label={t('progress.successRate')} value={`${successRate}%`} />
        <StatCard icon={<Award className="h-6 w-6" />} label={t('progress.totalStars')} value={totalStars} />
      </div>

      <div className="mt-6">
        <PracticeCalendar
          activityDates={activityDates}
          lang={language}
          title={t('progress.calendar.title')}
          streak={streak}
          streakLabel={t('progress.calendar.streak', { count: streak })}
        />
      </div>

      {!hasAny ? (
        <div className="mt-10 rounded-3xl bg-white/80 p-8 text-center text-sm font-semibold text-brand-navy/60 sm:text-base">
          {t('progress.empty')}
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-3xl bg-white/80 shadow-sm">
          <h2 className="px-5 pt-5 text-lg font-extrabold text-brand-navy">{t('progress.exerciseList')}</h2>
          <ul className="divide-y divide-brand-skylight/60 px-2 pb-2 pt-3 sm:px-4">
            {EXERCISES.map((meta) => {
              const e = progress.exercises[meta.id]
              return (
                <li key={meta.id} className="flex items-center justify-between gap-3 px-3 py-3">
                  <div>
                    <p className="text-sm font-bold text-brand-navy sm:text-base">{t(meta.titleKey)}</p>
                    <p className="text-xs text-brand-navy/50">
                      {e ? `${t('progress.lastDate')}: ${formatDate(e.lastCompletedAt, language)}` : t('exercise.status.new')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-brand-navy">
                    {[0, 1, 2].map((i) => (
                      <Star key={i} className={`h-4 w-4 ${e && i < e.stars ? 'fill-amber-400 text-amber-400' : 'fill-brand-skylight text-brand-skylight'}`} />
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <h2 className="mb-4 mt-10 text-center text-xl font-extrabold text-brand-navy sm:text-2xl">{t('progress.achievements')}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {EXERCISES.map((meta) => {
          const earned = !!progress.exercises[meta.id]?.completed
          return (
            <div
              key={meta.id}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center shadow-sm transition-opacity ${
                earned ? meta.theme.bg : 'bg-white/60 opacity-60 grayscale'
              }`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${earned ? meta.theme.badge : 'bg-brand-skylight'}`}>
                🏅
              </div>
              <p className="text-xs font-bold leading-tight text-brand-navy">{t(meta.badgeKey)}</p>
              {!earned && <p className="text-[10px] text-brand-navy/40">{t('progress.notEarned')}</p>}
            </div>
          )
        })}
      </div>

      {!synced && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!hasAny}
            className="flex items-center gap-2 rounded-full bg-white/80 px-5 py-3 text-sm font-bold text-brand-navy/70 shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4" />
            {t('progress.clearBtn')}
          </button>
        </div>
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3 className="text-lg font-extrabold text-brand-navy">{t('progress.clearConfirm.title')}</h3>
        <p className="mt-2 text-sm text-brand-navy/70">{t('progress.clearConfirm.body')}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            className="flex-1 rounded-full bg-brand-skylight px-4 py-3 text-sm font-bold text-brand-navy"
          >
            {t('progress.clearConfirm.cancel')}
          </button>
          <button
            onClick={() => {
              clearProgress()
              setConfirmOpen(false)
            }}
            className="flex-1 rounded-full bg-red-400 px-4 py-3 text-sm font-bold text-white"
          >
            {t('progress.clearConfirm.confirm')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
