import { useSettings } from '../context/SettingsContext'
import { useProgress } from '../context/ProgressContext'
import { EXERCISES } from '../data/exercises'
import HeroSection from '../components/HeroSection'
import ExerciseCard from '../components/ExerciseCard'

export default function HomePage({ onStartExercise }: { onStartExercise: (id: string) => void }) {
  const { t } = useSettings()
  const { progress } = useProgress()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <HeroSection onStart={() => onStartExercise(EXERCISES[0].id)} />

      <h2 className="mb-5 mt-12 text-center text-2xl font-extrabold text-brand-navy sm:text-3xl">
        {t('home.exercises.heading')}
      </h2>

      <h3 className="mb-4 text-lg font-extrabold text-brand-navy/80">{t('category.count')}</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISES.filter((e) => e.category === 'count').map((meta) => (
          <ExerciseCard key={meta.id} meta={meta} progress={progress.exercises[meta.id]} onStart={onStartExercise} />
        ))}
      </div>

      <h3 className="mb-4 mt-8 text-lg font-extrabold text-brand-navy/80">{t('category.speech')}</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISES.filter((e) => e.category === 'speech').map((meta) => (
          <ExerciseCard key={meta.id} meta={meta} progress={progress.exercises[meta.id]} onStart={onStartExercise} />
        ))}
      </div>

      <p className="mt-12 flex items-center justify-center gap-2 text-center text-sm font-semibold text-brand-navy/50">
        ⭐ {t('app.tagline')}
      </p>
    </div>
  )
}
