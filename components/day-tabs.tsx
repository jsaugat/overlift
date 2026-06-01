"use client";

import type { ProgramDay } from "@/lib/program";
import { cn } from "@/lib/utils";

interface DayTabsProps {
  days: ProgramDay[];
  activeDay: string;
  onSelect: (dayName: string) => void;
}

const colorMap: Record<string, string> = {
  Push: "var(--color-push)",
  Pull: "var(--color-pull)",
  Legs: "var(--color-legs)",
  Upper: "var(--color-upper)",
  Lower: "var(--color-lower)",
  Rest: "var(--color-rest)",
  Closed: "var(--color-rest)",
};

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

export function DayTabs({ days, activeDay, onSelect }: DayTabsProps) {
  return (
    <div className="grid grid-cols-4 gap-[2px] mb-10">
      {days.map((day) => {
        const isActive = day.name === activeDay;
        const dayLabel = toTitleCase(day.name);
        const dayColor = colorMap[dayLabel] || "var(--color-text-dim)";
        const isRest = day.name.toLowerCase() === "rest";
        const shortLabel = getDayLabel(day);

        return (
          <button
            key={`${day.name}-${day.id}`}
            onClick={() => onSelect(day.name)}
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
                "font-mono text-[9px] tracking-[0.12em] uppercase mb-[3px]",
                isActive ? "text-app" : "text-muted",
              )}
            >
              {shortLabel}
            </div>
            <div
              className="font-bebas text-[clamp(18px,4.2vw,20px)] tracking-[0.04em]"
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
