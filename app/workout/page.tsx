'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { Nav } from '@/components/nav'
import { DayTabs } from '@/components/day-tabs'
import { ExerciseList } from '@/components/exercise-list'
import { getTodayKey, getProgramDay, type DayKey } from '@/lib/program'

export default function WorkoutPage() {
  const [activeDay, setActiveDay] = useState<DayKey>(getTodayKey())
  const day = getProgramDay(activeDay)

  return (
    <>
      <AppHeader />
      <div className="bg-app border border-[rgb(var(--border))] rounded-xl mt-2 overflow-hidden">
        <Nav />
        <div className="p-4">
          <DayTabs activeDay={activeDay} onSelect={setActiveDay} />
          <ExerciseList day={day} />
        </div>
      </div>
    </>
  )
}
