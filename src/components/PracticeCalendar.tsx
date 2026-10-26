import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import type { Lang } from '../types'
import { dateKey, formatMonthYear } from '../utils/date'

const WEEKDAYS: Record<Lang, string[]> = {
  kk: ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
}

interface Cell {
  day: number
  key: string
  active: boolean
  isToday: boolean
}

export default function PracticeCalendar({
  activityDates,
  lang,
  title,
  streak,
  streakLabel,
}: {
  activityDates: string[]
  lang: Lang
  title: string
  streak: number
  streakLabel: string
}) {
  const activeSet = useMemo(() => new Set(activityDates), [activityDates])

  const { monthLabel, cells } = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const todayKey = dateKey(today)
    // getDay(): 0=Sun..6=Sat -> shift so the week starts on Monday
    const offset = (firstDay.getDay() + 6) % 7

    const cells: Array<Cell | null> = Array.from({ length: offset }, () => null)
    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateKey(new Date(year, month, day))
      cells.push({ day, key, active: activeSet.has(key), isToday: key === todayKey })
    }

    const monthLabel = formatMonthYear(firstDay, lang)
    return { monthLabel, cells }
  }, [activeSet, lang])

  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold text-brand-navy">{title}</h2>
        <span className="text-xs font-semibold capitalize text-brand-navy/50">{monthLabel}</span>
      </div>

      {streak > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-brand-coral">
          <Flame className="h-4 w-4 fill-brand-coral" />
          {streakLabel}
        </div>
      )}

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center sm:gap-2">
        {WEEKDAYS[lang].map((w) => (
          <span key={w} className="text-[10px] font-bold uppercase text-brand-navy/40 sm:text-xs">
            {w}
          </span>
        ))}
        {cells.map((cell, i) =>
          cell ? (
            <div
              key={cell.key}
              className={`flex aspect-square items-center justify-center rounded-full text-xs font-bold sm:text-sm ${
                cell.active
                  ? 'bg-gradient-to-br from-brand-turquoise to-brand-sky text-white shadow-sm'
                  : cell.isToday
                    ? 'text-brand-navy/70 ring-2 ring-brand-navy/30'
                    : 'text-brand-navy/40'
              }`}
            >
              {cell.day}
            </div>
          ) : (
            <div key={`empty-${i}`} />
          ),
        )}
      </div>
    </div>
  )
}
