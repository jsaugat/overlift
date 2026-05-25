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
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden mb-12">
        <Nav />
        <div className="p-4 sm:p-6">
          <DayTabs activeDay={activeDay} onSelect={setActiveDay} />
          <ExerciseList day={day} />
        </div>
      </div>
    </>
  )
}
