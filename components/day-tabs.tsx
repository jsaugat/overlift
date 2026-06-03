"use client";

import type { ProgramDay } from "@/lib/program";
import { cn } from "@/lib/utils";

interface DayTabsProps {
  days: ProgramDay[];
  activeDayOrder: number;
  onSelect: (dayOrder: number) => void;
  startingDay?: number;
}

const workoutColors = [
  "var(--color-day-1)",
  "var(--color-day-2)",
  "var(--color-day-3)",
  "var(--color-day-4)",
  "var(--color-day-5)",
];

function getDayColor(day: { name: string; day_order: number }) {
  const nameLower = day.name.toLowerCase();
  if (nameLower === "rest" || nameLower === "closed") {
    return "var(--color-day-rest)";
  }
  const order = Number.isInteger(day.day_order) ? day.day_order : 1;
  const index = Math.max(0, order - 1) % workoutColors.length;
  return workoutColors[index];
}

function toTitleCase(value: string) {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
}

function getDayLabel(day: ProgramDay) {
  if (Number.isInteger(day.day_order)) {
    return `D${day.day_order}`;
  }

  return toTitleCase(day.name).slice(0, 3);
}

export function DayTabs({
  days,
  activeDayOrder,
  onSelect,
  startingDay,
}: DayTabsProps) {
  const today = new Date().getDay(); // 0-6
  const offset = startingDay !== undefined ? (today - startingDay + 7) % 7 : -1;
  const todayDayOrder = offset !== -1 ? offset + 1 : -1;

  return (
    <div className="grid grid-cols-4 gap-[2px] mb-10">
      {days.map((day) => {
        const isActive = day.day_order === activeDayOrder;
        const isToday = day.day_order === todayDayOrder;
        const dayLabel = toTitleCase(day.name);
        const dayColor = getDayColor(day);
        const isRest = day.name.toLowerCase() === "rest";
        const shortLabel = getDayLabel(day);

        return (
          <button
            key={`${day.name}-${day.id}`}
            onClick={() => onSelect(day.day_order)}
            className={cn(
              "pt-[10px] pb-[10px] px-[4px] text-center cursor-pointer md:rounded-t-[4px] transition-colors relative",
              "active:bg-app3 md:hover:bg-app3",
              isRest ? "opacity-60" : "",
              isActive
                ? "bg-app2 after:bg-[var(--day-color)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]"
                : "after:bg-transparent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors",
            )}
            style={
              {
                "--day-color": dayColor,
              } as React.CSSProperties
            }
          >
            <div
              className={cn(
                "font-mono text-[10px] tracking-[0.12em] uppercase mb-[3px] flex items-center justify-center gap-1",
                isActive ? "text-app" : "text-muted",
              )}
            >
              {shortLabel}
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </div>
            <div
              className="font-play uppercase text-[clamp(16px,4.2vw,18px)] font-medium"
              style={{
                color: isActive
                  ? "var(--day-color)"
                  : "var(--color-text-faint)",
              }}
            >
              {dayLabel}
            </div>
          </button>
        );
      })}
    </div>
  );
}
