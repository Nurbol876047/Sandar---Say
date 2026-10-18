import { Info, Languages, Sparkles, Volume2, Gauge } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { playClick } from '../utils/sound'

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-skylight text-brand-navy">{icon}</div>
        <span className="text-base font-bold text-brand-navy">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-navy' : 'bg-brand-skylight'}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const {
    t,
    language,
    setLanguage,
    sound,
    setSound,
    animations,
    setAnimations,
    animationSpeed,
    setAnimationSpeed,
  } = useSettings()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-center text-3xl font-extrabold text-brand-navy sm:text-4xl">{t('settings.title')}</h1>

      <div className="mt-8 flex flex-col gap-4">
        <Row icon={<Languages className="h-5 w-5" />} label={t('settings.language')}>
          <div className="flex items-center rounded-full bg-brand-skylight p-1 text-sm font-bold">
            <button
              onClick={() => setLanguage('kk')}
              className={`rounded-full px-4 py-2 transition-colors ${language === 'kk' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'}`}
            >
              {t('lang.kk')}
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`rounded-full px-4 py-2 transition-colors ${language === 'ru' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'}`}
            >
              {t('lang.ru')}
            </button>
          </div>
        </Row>

        <Row icon={<Volume2 className="h-5 w-5" />} label={t('settings.sound')}>
          <Toggle
            checked={sound}
            onChange={(v) => {
              setSound(v)
              playClick(v)
            }}
          />
        </Row>

        <Row icon={<Sparkles className="h-5 w-5" />} label={t('settings.animations')}>
          <Toggle checked={animations} onChange={setAnimations} />
        </Row>

        <Row icon={<Gauge className="h-5 w-5" />} label={t('settings.animationSpeed')}>
          <div className="flex items-center rounded-full bg-brand-skylight p-1 text-sm font-bold">
            <button
              onClick={() => setAnimationSpeed('normal')}
              disabled={!animations}
              className={`rounded-full px-4 py-2 transition-colors disabled:opacity-40 ${
                animationSpeed === 'normal' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'
              }`}
            >
              {t('settings.speed.normal')}
            </button>
            <button
              onClick={() => setAnimationSpeed('slow')}
              disabled={!animations}
              className={`rounded-full px-4 py-2 transition-colors disabled:opacity-40 ${
                animationSpeed === 'slow' ? 'bg-brand-navy text-white' : 'text-brand-navy/60'
              }`}
            >
              {t('settings.speed.slow')}
            </button>
          </div>
        </Row>

        <div className="flex items-start gap-3 rounded-3xl bg-white/60 p-5 text-sm text-brand-navy/70">
          <Info className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold text-brand-navy">{t('settings.about')}</p>
            <p className="mt-1 leading-relaxed">{t('settings.aboutText')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
