import { useSettings } from '../context/SettingsContext'
import { useProgress } from '../context/ProgressContext'
import { EXERCISES } from '../data/exercises'
import ExerciseCard from '../components/ExerciseCard'

export default function ExercisesPage({ onStartExercise }: { onStartExercise: (id: string) => void }) {
  const { t } = useSettings()
  const { progress } = useProgress()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-center text-3xl font-extrabold text-brand-navy sm:text-4xl">{t('nav.exercises')}</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-brand-navy/60 sm:text-base">
        {t('home.hero.description')}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISES.map((meta) => (
          <ExerciseCard key={meta.id} meta={meta} progress={progress.exercises[meta.id]} onStart={onStartExercise} />
        ))}
      </div>
    </div>
  )
}
