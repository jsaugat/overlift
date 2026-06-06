"use client";

import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SickButton } from "@/components/ui/sick-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ProgramDay } from "@/lib/actions/programs";

interface ProgramDetailDayNavProps {
  days: ProgramDay[];
  selectedDayId: number | null;
  onSelectDay: (dayId: number) => void;
  onRenameDay: (day: ProgramDay) => void;
  isPending: boolean;
  deleteProgramTrigger: ReactNode;
}

export function ProgramDetailMobileDaySelect({
  days,
  selectedDayId,
  onSelectDay,
}: Pick<
  ProgramDetailDayNavProps,
  "days" | "selectedDayId" | "onSelectDay"
>) {
  return (
    <div className="lg:hidden flex items-end gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
          Training Day
        </div>
        <Select
          value={selectedDayId ? String(selectedDayId) : ""}
          onValueChange={(val) => onSelectDay(Number(val))}
        >
          <SelectTrigger className="w-full bg-app2 border-app font-play h-11 text-left text-sm">
            <SelectValue placeholder="Select a day" />
          </SelectTrigger>
          <SelectContent className="bg-app border border-app2">
            {days.map((day) => {
              const exerciseCount = day.exercises.length;
              return (
                <SelectItem
                  key={day.id}
                  value={String(day.id)}
                  className="font-play text-sm text-app hover:bg-app2"
                >
                  Day {day.day_order} – {day.name} ({exerciseCount}{" "}
                  {exerciseCount === 1 ? "Ex" : "Exs"})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function ProgramDetailDaySidebar({
  days,
  selectedDayId,
  onSelectDay,
  onRenameDay,
  isPending,
  deleteProgramTrigger,
}: ProgramDetailDayNavProps) {
  return (
    <div className="hidden lg:flex bg-muted/40 border border-app rounded-xl p-4 sm:p-5 lg:sticky lg:top-4 flex-col gap-4">
      <div>
        <div className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
          Program Architecture
        </div>
        <div className="flex flex-col gap-2">
          {days.map((day) => {
            const isActive = day.id === selectedDayId;
            const exerciseCount = day.exercises.length;

            return (
              <div
                key={day.id}
                className={cn(
                  "flex items-center gap-1 rounded-lg border transition-all",
                  isActive ? "border-primary/50 bg-primary/3" : "border-app",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(day.id)}
                  className={cn(
                    "flex-1 min-w-0 font-play text-left px-3.5 py-3 flex items-center justify-between cursor-pointer text-sm transition-colors",
                    isActive
                      ? "hover:border-primary/80"
                      : "text-muted hover:bg-muted rounded-lg",
                  )}
                >
                  <span className="truncate pr-2">
                    Day {day.day_order} – {day.name}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] rounded px-1.5 py-0.5 shrink-0",
                      isActive
                        ? "bg-accent text-black font-bold"
                        : "bg-app3 text-muted",
                    )}
                  >
                    {exerciseCount} {exerciseCount === 1 ? "Ex" : "Exs"}
                  </span>
                </button>
                <SickButton
                  variant="text"
                  icon={<Pencil className="w-[13px] h-[13px]" />}
                  onClick={() => onRenameDay(day)}
                  disabled={isPending}
                  title="Rename Day"
                  className="shrink-0 mr-1"
                >
                  {""}
                </SickButton>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-app/60 mt-auto">
        {deleteProgramTrigger}
      </div>
    </div>
  );
}

export function ProgramDetailMobileDeleteSection({
  deleteProgramTrigger,
}: {
  deleteProgramTrigger: ReactNode;
}) {
  return (
    <div className="lg:hidden pt-8 mt-2 border-t border-app/40">
      <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground mb-3">
        Program Settings
      </p>
      {deleteProgramTrigger}
    </div>
  );
}
