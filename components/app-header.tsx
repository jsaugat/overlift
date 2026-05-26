"use client";

import { getDayName, getTodayKey, getProgramDay } from "@/lib/program";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const todayKey = getTodayKey();
  const day = getProgramDay(todayKey);
  const dayName = getDayName();
  const pathname = usePathname();
  console.log(pathname);

  // if (pathname !== "/workout") return null;

  return (
    <div
      className={cn(
        "mb-12",
        pathname === "/workout" ? "block" : "hidden md:block",
      )}
    >
      <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-1.5">
        OVERLIFT // SYSTEM v2.0
      </div>
      <h1 className="font-bebas text-[clamp(52px,12vw,110px)] leading-[0.88] tracking-[0.02em]">
        PROJECT <span className="text-accent block">OVERLIFT</span>
      </h1>

      <div className="flex gap-5 mt-5 flex-wrap">
        <div className="flex items-center gap-1.75 text-[11px] text-muted font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
          TODAY: {dayName.toUpperCase()}
        </div>
        <div className="flex items-center gap-1.75 text-[11px] text-muted font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
          {day.type.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
