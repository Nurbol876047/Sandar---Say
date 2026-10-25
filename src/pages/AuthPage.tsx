import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, LogOut, Plus, Star, UserRound } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useAuth, ApiError } from '../context/AuthContext'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold text-brand-navy">
      {label}
      {children}
    </label>
  )
}

const inputClass =
  'rounded-2xl border-2 border-white bg-white/90 px-4 py-2.5 text-sm font-semibold text-brand-navy shadow-sm outline-none transition-colors focus:border-brand-purple'

function AccountView({ onNavigateTherapist }: { onNavigateTherapist: () => void }) {
  const { t } = useSettings()
  const { user, children, activeChildId, setActiveChildId, addChild, logout } = useAuth()
  const [newChildName, setNewChildName] = useState('')
  const [busy, setBusy] = useState(false)

  const submitChild = async (e: FormEvent) => {
    e.preventDefault()
    if (!newChildName.trim()) return
    setBusy(true)
    try {
      await addChild(newChildName.trim())
      setNewChildName('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="rounded-[2rem] bg-white/85 p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-brand-navy">{user!.name || user!.email}</p>
            <p className="text-xs font-bold text-brand-navy/50">
              {user!.role === 'therapist' ? t('auth.roleTherapist') : t('auth.roleParent')}
            </p>
          </div>
        </div>

        {user!.role === 'therapist' && (
          <button
            onClick={onNavigateTherapist}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-brand-turquoise to-brand-sky px-5 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('nav.therapist')}
          </button>
        )}

        {user!.role === 'parent' && (
          <div className="mt-6">
            <p className="text-sm font-extrabold text-brand-navy">{t('auth.myChildren')}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {children.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveChildId(c.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                      activeChildId === c.id ? 'bg-brand-navy text-white' : 'bg-brand-skylight text-brand-navy'
                    }`}
                  >
                    {c.name}
                    {activeChildId === c.id && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                </li>
              ))}
              {children.length === 0 && <p className="text-xs text-brand-navy/50">{t('auth.noChildren')}</p>}
            </ul>

            <form onSubmit={submitChild} className="mt-3 flex gap-2">
              <input
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder={t('auth.childNamePlaceholder')}
                className={`${inputClass} flex-1`}
              />
              <button
                type="submit"
                disabled={busy || !newChildName.trim()}
                className="flex items-center gap-1 rounded-2xl bg-brand-purple px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => logout()}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand-skylight px-5 py-3 text-sm font-bold text-brand-navy/70 transition-colors hover:bg-brand-pink/40"
        >
          <LogOut className="h-4 w-4" />
          {t('auth.logout')}
        </button>
      </div>
    </div>
  )
}

export default function AuthPage({ onNavigateTherapist }: { onNavigateTherapist: () => void }) {
  const { t } = useSettings()
  const { user, login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [childName, setChildName] = useState('')
  const [isTherapist, setIsTherapist] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [waking, setWaking] = useState(false)

  if (user) return <AccountView onNavigateTherapist={onNavigateTherapist} />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const wakeTimer = window.setTimeout(() => setWaking(true), 2500)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name, isTherapist ? '' : childName, isTherapist ? 'therapist' : 'parent')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.networkError'))
    } finally {
      window.clearTimeout(wakeTimer)
      setWaking(false)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-white/85 p-6 shadow-xl sm:p-8"
      >
        <div className="mx-auto mb-6 flex w-full max-w-xs items-center rounded-full bg-brand-skylight p-1 text-sm font-bold">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 rounded-full px-4 py-2 transition-colors ${mode === 'login' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'}`}
          >
            {t('auth.loginTab')}
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 rounded-full px-4 py-2 transition-colors ${mode === 'register' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'}`}
          >
            {t('auth.registerTab')}
          </button>
        </div>

        <p className="mb-5 flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-brand-navy/60">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {t('auth.subtitle')}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          {mode === 'register' && (
            <Field label={t('auth.parentName')}>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </Field>
          )}
          <Field label={t('auth.email')}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </Field>
          <Field label={t('auth.password')}>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </Field>
          {mode === 'register' && !isTherapist && (
            <Field label={t('auth.childName')}>
              <input value={childName} onChange={(e) => setChildName(e.target.value)} className={inputClass} />
            </Field>
          )}

          {mode === 'register' && (
            <label className="flex items-center gap-2 text-xs font-bold text-brand-navy/70">
              <input
                type="checkbox"
                checked={isTherapist}
                onChange={(e) => setIsTherapist(e.target.checked)}
                className="h-4 w-4 rounded border-2 border-brand-navy/30"
              />
              {t('auth.iAmTherapist')}
            </label>
          )}

          {waking && !error && (
            <p className="rounded-xl bg-brand-skylight px-3 py-2 text-xs font-bold text-brand-navy/70">{t('auth.waking')}</p>
          )}
          {error && <p className="rounded-xl bg-brand-pink/60 px-3 py-2 text-xs font-bold text-pink-900">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full bg-gradient-to-r from-brand-coral via-brand-magenta to-brand-purple px-5 py-3 text-sm font-extrabold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-brand-navy/45">{t('auth.note')}</p>
      </motion.div>
    </div>
  )
}
