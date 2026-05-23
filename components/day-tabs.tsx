'use client'

import { PROGRAM, type DayKey } from '@/lib/program'
import { cn } from '@/lib/utils'

interface DayTabsProps {
  activeDay: DayKey
  onSelect: (key: DayKey) => void
}

export function DayTabs({ activeDay, onSelect }: DayTabsProps) {
  return (
    <div className="flex gap-1 flex-wrap mb-4">
      {PROGRAM.map((day) => {
        const isActive = day.key === activeDay
        const isRest = day.type === 'Rest' || day.type === 'Closed'
        return (
          <button
            key={day.key}
            onClick={() => onSelect(day.key)}
            className={cn(
              'px-3 py-1 rounded-lg border text-[12px] transition-colors cursor-pointer',
              isActive
                ? isRest
                  ? 'bg-[rgb(var(--amber-bg))] border-[rgb(var(--amber))] text-[rgb(var(--amber))]'
                  : 'bg-[rgb(var(--blue-bg))] border-[rgb(var(--blue))] text-[rgb(var(--blue))] font-medium'
                : 'bg-transparent border-[rgb(var(--border))] text-muted hover:bg-app2'
            )}
          >
            {day.label} · {day.type}
          </button>
        )
      })}
    </div>
  )
}
