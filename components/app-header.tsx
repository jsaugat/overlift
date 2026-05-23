'use client'

import { getDayName, getTodayKey, getProgramDay } from '@/lib/program'
import { Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const todayKey = getTodayKey()
  const day = getProgramDay(todayKey)
  const dayName = getDayName()

  return (
    <div className="bg-app border border-[rgb(var(--border))] rounded-xl flex items-center gap-3 px-4 py-3 mb-0">
      <Dumbbell className="text-[rgb(var(--text2))] shrink-0" size={22} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-app">Overlift</div>
        <div className="text-xs text-muted">
          {dayName} — {day.type}
        </div>
      </div>
      <span
        className={cn(
          'text-[11px] font-medium px-2.5 py-1 rounded-lg',
          day.badgeClass
        )}
      >
        {day.type}
      </span>
    </div>
  )
}
