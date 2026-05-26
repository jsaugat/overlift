"use client";

import { PROGRAM, type DayKey } from "@/lib/program";
import { cn } from "@/lib/utils";

interface DayTabsProps {
  activeDay: DayKey;
  onSelect: (key: DayKey) => void;
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

export function DayTabs({ activeDay, onSelect }: DayTabsProps) {
  return (
    <div className="grid grid-cols-4 gap-[2px] mb-10">
      {PROGRAM.map((day) => {
        const isActive = day.key === activeDay;
        const dayColor = colorMap[day.type] || "var(--color-text-dim)";

        return (
          <button
            key={day.key}
            onClick={() => onSelect(day.key)}
            className={cn(
              "pt-[10px] pb-[10px] px-[4px] text-center cursor-pointer md:rounded-t-[4px] transition-colors relative",
              "active:bg-app3 md:hover:bg-app3",
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
              {day.label}
            </div>
            <div
              className="font-bebas text-[clamp(18px,4.2vw,20px)] tracking-[0.04em]"
              style={{
                color: isActive
                  ? "var(--day-color)"
                  : "var(--color-text-faint)",
              }}
            >
              {day.type === "Closed" ? "Rest" : day.type}
            </div>
          </button>
        );
      })}
    </div>
  );
}
