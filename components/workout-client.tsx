"use client";

import { act, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { DayTabs } from "@/components/day-tabs";
import { ExerciseList } from "@/components/exercise-list";
import { getProgramDay, type ActiveProgram } from "@/lib/program";

interface WorkoutClientProps {
  program: ActiveProgram;
  defaultDay: string;
}

export function WorkoutClient({ program, defaultDay }: WorkoutClientProps) {
  const [activeDay, setActiveDay] = useState(defaultDay);
  const day = getProgramDay(program, activeDay) ?? program.days[0] ?? null;

  if (!day) {
    return null;
  }

  return (
    <>
      <AppHeader dayType={day.day_type} />
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden mb-12">
        <Nav />
        <div className="p-4 sm:p-6">
          <DayTabs
            days={program.days}
            activeDay={activeDay}
            onSelect={setActiveDay}
          />
          <ExerciseList day={day} />
          <div className="mt-4 rounded-xl border-0 border-[#5a3900] border-l-[2px] border-l-[#f59e0b] bg-[#3d240050] px-4 py-3 text-sm leading-6 text-[#f2d6a0] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="mb-1 text-[14px] font-medium text-[#f0a500]">
              Progressive overload reminder
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Each week, try to add{" "}
              <span className="font-medium text-white">1 rep or 2.5 kg</span> to
              each exercise. Log your weights to track this.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
