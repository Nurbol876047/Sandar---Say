import { useState } from 'react'
import { SettingsProvider } from './context/SettingsContext'
import { ProgressProvider } from './context/ProgressContext'
import { AuthProvider } from './context/AuthContext'
import AppShell, { type Page } from './components/AppShell'
import HomePage from './pages/HomePage'
import ExercisesPage from './pages/ExercisesPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import ExercisePage from './pages/ExercisePage'
import AuthPage from './pages/AuthPage'
import TherapistDashboardPage from './pages/TherapistDashboardPage'
import type { ExerciseId } from './types'

type Route = { page: Page } | { page: 'exercise'; id: ExerciseId }

function AppContent() {
  const [route, setRoute] = useState<Route>({ page: 'home' })

  const navigate = (page: Page) => {
    window.scrollTo({ top: 0 })
    setRoute({ page })
  }
  const startExercise = (id: string) => {
    window.scrollTo({ top: 0 })
    setRoute({ page: 'exercise', id: id as ExerciseId })
  }

  if (route.page === 'exercise') {
    return (
      <ExercisePage
        key={route.id}
        exerciseId={route.id}
        onBack={() => navigate('exercises')}
        onNavigateExercise={startExercise}
        onHome={() => navigate('home')}
      />
    )
  }

  return (
    <AppShell page={route.page} onNavigate={navigate}>
      {route.page === 'home' && <HomePage onStartExercise={startExercise} />}
      {route.page === 'exercises' && <ExercisesPage onStartExercise={startExercise} />}
      {route.page === 'progress' && <ProgressPage />}
      {route.page === 'settings' && <SettingsPage />}
      {route.page === 'auth' && <AuthPage onNavigateTherapist={() => navigate('therapist')} />}
      {route.page === 'therapist' && <TherapistDashboardPage />}
    </AppShell>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ProgressProvider>
          <AppContent />
        </ProgressProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}
