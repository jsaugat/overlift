"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { DayTabs } from "@/components/day-tabs";
import { ExerciseList } from "@/components/exercise-list";
import { getTodayKey, getProgramDay, type DayKey } from "@/lib/program";

export default function WorkoutPage() {
  const [activeDay, setActiveDay] = useState<DayKey>(getTodayKey());
  const day = getProgramDay(activeDay);

  return (
    <>
      <AppHeader />
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden mb-12">
        <Nav />
        <div className="p-4 sm:p-6">
          <DayTabs activeDay={activeDay} onSelect={setActiveDay} />
          <ExerciseList day={day} />
          <div className="mt-6 rounded-2xl border-0 border-[#5a3900] border-l-[2px] border-l-[#f59e0b] bg-[#3d240050] px-4 py-3 text-sm leading-6 text-[#f2d6a0] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="mb-1 text-[14px] font-medium text-[#f0a500]">
              Progressive overload reminder
            </div>
            <p>
              Each week, try to add{" "}
              <span className="font-semibold text-[#fff4d1]">
                1 rep or 2.5 kg
              </span>{" "}
              to each exercise. Log your weights in the Workout tab to track
              this.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
