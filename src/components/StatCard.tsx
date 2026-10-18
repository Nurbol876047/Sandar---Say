import type { ReactNode } from 'react'

export default function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 p-5 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-skylight text-brand-navy">{icon}</div>
      <span className="text-2xl font-extrabold text-brand-navy">{value}</span>
      <span className="text-xs font-semibold text-brand-navy/60">{label}</span>
    </div>
  )
}
