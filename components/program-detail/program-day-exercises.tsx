"use client";

import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SickButton } from "@/components/ui/sick-button";
import type { ProgramDay, ProgramExercise } from "@/lib/actions/programs";
import { ProgramExerciseRow } from "./program-exercise-row";

interface ProgramDayExercisesProps {
  selectedDay: ProgramDay | null;
  exercises: ProgramExercise[];
  isPending: boolean;
  onAddExercise: () => void;
  onRenameDay: (day: ProgramDay) => void;
  onEditExercise: (exercise: ProgramExercise) => void;
  onRemoveExercise: (exerciseRowId: number) => void;
}

export function ProgramDayExercises({
  selectedDay,
  exercises,
  isPending,
  onAddExercise,
  onRenameDay,
  onEditExercise,
  onRemoveExercise,
}: ProgramDayExercisesProps) {
  if (!selectedDay) {
    return (
      <div className="min-w-0">
        <div className="text-center py-20 border border-dashed border-app rounded-lg">
          <p className="text-sm text-muted">
            Select a day from the sidebar to configure exercises.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-app">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-2xl font-play leading-tight tracking-tight truncate">
              {selectedDay.name} Day
            </h2>
            <SickButton
              variant="text"
              icon={<Pencil className="w-[14px] h-[14px]" />}
              onClick={() => onRenameDay(selectedDay)}
              disabled={isPending}
              title="Rename Day"
              className="shrink-0 sm:hidden"
            >
              {""}
            </SickButton>
          </div>
          <p className="text-sm text-muted mt-1">
            Day {selectedDay.day_order} · {exercises.length}{" "}
            {exercises.length === 1 ? "exercise" : "exercises"}
          </p>
        </div>
        <Button onClick={onAddExercise} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Exercise
        </Button>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-app rounded-lg bg-[rgba(255,255,255,0.002)]">
          <p className="text-sm text-muted mb-5">
            No exercises configured for this training day yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddExercise}
            className="border-app2"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Exercise
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {exercises.map((item, index) => (
            <ProgramExerciseRow
              key={item.id}
              item={item}
              index={index}
              onEdit={() => onEditExercise(item)}
              onRemove={() => onRemoveExercise(item.id)}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
