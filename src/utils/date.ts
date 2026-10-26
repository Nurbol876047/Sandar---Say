import type { Lang } from '../types'

const KK_MONTHS = [
  'қаңтар',
  'ақпан',
  'наурыз',
  'сәуір',
  'мамыр',
  'маусым',
  'шілде',
  'тамыз',
  'қыркүйек',
  'қазан',
  'қараша',
  'желтоқсан',
]

/** `toLocaleDateString('kk-KZ', ...)` falls back to "2026 M10" in many environments — the ICU month data for kk is incomplete — so kk is formatted by hand. */
export function formatMonthYear(date: Date, lang: Lang): string {
  if (lang === 'kk') return `${KK_MONTHS[date.getMonth()]} ${date.getFullYear()}`
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}

export function formatFullDate(date: Date, lang: Lang): string {
  if (lang === 'kk') return `${date.getDate()} ${KK_MONTHS[date.getMonth()]} ${date.getFullYear()}`
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Consecutive days of activity ending today (or yesterday, so the streak survives until the day is over). */
export function computeStreak(dates: string[]): number {
  const set = new Set(dates)
  const cursor = new Date()
  if (!set.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (set.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
