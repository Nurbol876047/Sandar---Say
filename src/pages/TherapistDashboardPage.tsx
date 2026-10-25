import { useEffect, useState } from 'react'
import { Download, Star } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { api, type TherapistOverviewRow } from '../lib/api'
import { EXERCISES } from '../data/exercises'

export default function TherapistDashboardPage() {
  const { t, language } = useSettings()
  const { token } = useAuth()
  const [rows, setRows] = useState<TherapistOverviewRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!token) return
    api
      .therapistOverview(token)
      .then((res) => setRows(res.overview))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [token])

  const exportCsv = async () => {
    if (!token) return
    setExporting(true)
    try {
      const res = await fetch(api.exportCsvUrl(), { headers: { Authorization: `Bearer ${token}` } })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sandar-soyleydi-progress-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-center text-3xl font-extrabold text-brand-navy sm:text-4xl">{t('nav.therapist')}</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-brand-navy/60">{t('therapist.subtitle')}</p>

      <div className="mt-5 flex justify-center">
        <button
          onClick={exportCsv}
          disabled={exporting || !rows || rows.length === 0}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-mint to-brand-turquoise px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          {t('therapist.exportCsv')}
        </button>
      </div>

      {error && <p className="mt-6 text-center text-sm font-bold text-red-500">{error}</p>}
      {!rows && !error && <p className="mt-10 text-center text-sm text-brand-navy/50">{t('therapist.loading')}</p>}
      {rows && rows.length === 0 && (
        <div className="mt-10 rounded-3xl bg-white/80 p-8 text-center text-sm font-semibold text-brand-navy/60">
          {t('therapist.empty')}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-5">
        {rows?.map((row) => {
          const byExercise = Object.fromEntries(row.progress.map((p) => [p.exerciseId, p]))
          return (
            <div key={row.child.id} className="overflow-hidden rounded-3xl bg-white/85 p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold text-brand-navy">{row.child.name}</h3>
                <span className="text-xs font-bold text-brand-navy/50">{row.parentName || row.parentEmail}</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase text-brand-navy/40">
                      <th className="pb-2">{t('therapist.exercise')}</th>
                      <th className="pb-2">{t('therapist.attempts')}</th>
                      <th className="pb-2">{t('therapist.best')}</th>
                      <th className="pb-2">{t('therapist.stars')}</th>
                      <th className="pb-2">{t('therapist.lastDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXERCISES.map((meta) => {
                      const p = byExercise[meta.id]
                      return (
                        <tr key={meta.id} className="border-t border-brand-skylight/60">
                          <td className="py-2 font-bold text-brand-navy">{t(meta.titleKey)}</td>
                          <td className="py-2 text-brand-navy/70">{p?.attempts ?? '—'}</td>
                          <td className="py-2 text-brand-navy/70">{p ? `${p.bestCorrect}/${p.bestTotal}` : '—'}</td>
                          <td className="py-2">
                            <div className="flex items-center gap-0.5">
                              {[0, 1, 2].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${p && i < p.stars ? 'fill-amber-400 text-amber-400' : 'fill-brand-skylight text-brand-skylight'}`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-2 text-xs text-brand-navy/50">
                            {p?.lastCompletedAt ? new Date(p.lastCompletedAt).toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU') : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
