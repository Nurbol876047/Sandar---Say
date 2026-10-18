import type { ReactNode } from 'react'
import { ClipboardList, Home as HomeIcon, Settings as SettingsIcon, Star, Trophy } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useProgress } from '../context/ProgressContext'
import AppBackground from './AppBackground'

export type Page = 'home' | 'exercises' | 'progress' | 'settings'

interface NavItem {
  page: Page
  icon: typeof HomeIcon
  labelKey: Parameters<ReturnType<typeof useSettings>['t']>[0]
}

const NAV_ITEMS: NavItem[] = [
  { page: 'home', icon: HomeIcon, labelKey: 'nav.home' },
  { page: 'exercises', icon: ClipboardList, labelKey: 'nav.exercises' },
  { page: 'progress', icon: Trophy, labelKey: 'nav.progress' },
  { page: 'settings', icon: SettingsIcon, labelKey: 'nav.settings' },
]

export default function AppShell({
  page,
  onNavigate,
  children,
}: {
  page: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}) {
  const { t, language, setLanguage } = useSettings()
  const { totalStars } = useProgress()

  return (
    <div className="relative min-h-screen">
      <AppBackground />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/60 bg-white/70 p-5 backdrop-blur-md md:flex">
        <button onClick={() => onNavigate('home')} className="mb-6 flex items-center gap-2 text-left">
          <span className="text-2xl">☀️</span>
          <span className="text-lg font-extrabold leading-tight text-brand-navy">{t('app.name')}</span>
        </button>

        <nav className="flex flex-1 flex-col gap-2">
          {NAV_ITEMS.map(({ page: p, icon: Icon, labelKey }) => (
            <button
              key={p}
              onClick={() => onNavigate(p)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                page === p ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/80 hover:bg-brand-skylight'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {t(labelKey)}
            </button>
          ))}
        </nav>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-yellow/60 px-3 py-2 text-sm font-bold text-brand-navy">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {totalStars}
          </span>
          <LangSwitch language={language} setLanguage={setLanguage} compact />
        </div>
        <p className="mt-4 text-center text-xs leading-snug text-brand-navy/50">{t('nav.footer')}</p>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/60 bg-white/80 px-4 py-3 backdrop-blur-md md:hidden">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5">
          <span className="text-xl">☀️</span>
          <span className="text-sm font-extrabold text-brand-navy">{t('app.name')}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-brand-yellow/70 px-2.5 py-1 text-xs font-bold text-brand-navy">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {totalStars}
          </span>
          <LangSwitch language={language} setLanguage={setLanguage} compact />
          <button
            onClick={() => onNavigate('settings')}
            aria-label={t('nav.settings')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-skylight text-brand-navy"
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 min-h-screen pb-24 md:ml-64 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/60 bg-white/90 py-2 backdrop-blur-md md:hidden">
        {NAV_ITEMS.map(({ page: p, icon: Icon, labelKey }) => (
          <button
            key={p}
            onClick={() => onNavigate(p)}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-bold ${
              page === p ? 'text-brand-navy' : 'text-brand-navy/45'
            }`}
          >
            <Icon className={`h-5 w-5 ${page === p ? 'fill-brand-skylight' : ''}`} />
            {t(labelKey)}
          </button>
        ))}
      </nav>
    </div>
  )
}

function LangSwitch({
  language,
  setLanguage,
  compact,
}: {
  language: 'kk' | 'ru'
  setLanguage: (l: 'kk' | 'ru') => void
  compact?: boolean
}) {
  return (
    <div className={`flex items-center rounded-full bg-white/70 p-0.5 text-xs font-bold ${compact ? '' : 'text-sm'}`}>
      <button
        onClick={() => setLanguage('kk')}
        className={`rounded-full px-2.5 py-1 transition-colors ${language === 'kk' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'}`}
      >
        ҚАЗ
      </button>
      <button
        onClick={() => setLanguage('ru')}
        className={`rounded-full px-2.5 py-1 transition-colors ${language === 'ru' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'}`}
      >
        РУС
      </button>
    </div>
  )
}
