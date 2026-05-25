"use client";

import { getDayName, getTodayKey, getProgramDay } from "@/lib/program";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const todayKey = getTodayKey();
  const day = getProgramDay(todayKey);
  const dayName = getDayName();

  return (
    <div className="mb-12">
      <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-[6px]">
        OVERLIFT // SYSTEM v2.0
      </div>
      <h1 className="font-bebas text-[clamp(52px,12vw,110px)] leading-[0.88] tracking-[0.02em]">
        PROJECT <span className="text-accent block">OVERLIFT</span>
      </h1>

      <div className="flex gap-[20px] mt-[20px] flex-wrap">
        <div className="flex items-center gap-[7px] text-[11px] text-muted font-mono">
          <div className="w-[6px] h-[6px] rounded-full bg-accent shrink-0"></div>
          TODAY: {dayName.toUpperCase()}
        </div>
        <div className="flex items-center gap-[7px] text-[11px] text-muted font-mono">
          <div className="w-[6px] h-[6px] rounded-full bg-accent shrink-0"></div>
          {day.type.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
