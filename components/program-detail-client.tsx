"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  GripHorizontal,
  Dumbbell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SickButton } from "@/components/ui/sick-button";
import {
  type ActiveProgram,
  type ProgramDay,
  type ProgramExercise,
  removeExerciseFromDay,
} from "@/lib/actions/programs";
import type { ExerciseLibraryItem } from "@/lib/actions/exercise-library";
import { AddExerciseDialog } from "@/components/add-exercise-dialog";
import { EditExerciseDialog } from "@/components/edit-exercise-dialog";
import { cn } from "@/lib/utils";
import { getMuscleClass } from "@/lib/muscle-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProgramDetailClientProps {
  userId: string;
  program: ActiveProgram;
  exerciseLibrary: ExerciseLibraryItem[];
}

export function ProgramDetailClient({
  userId,
  program,
  exerciseLibrary,
}: ProgramDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDayId, setSelectedDayId] = useState<number | null>(
    program.days.length > 0 ? program.days[0].id : null,
  );
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProgramExercise | null>(null);

  const selectedDay = program.days.find((d) => d.id === selectedDayId) ?? null;
  const exercises = selectedDay
    ? selectedDay.exercises.slice().sort((a, b) => a.position - b.position)
    : [];

  const refreshPage = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleRemoveExercise = async (exerciseRowId: number) => {
    await removeExerciseFromDay(userId, exerciseRowId);
    refreshPage();
  };

  return (
    <div className="space-y-5">
      {/* Back button + Program Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/programs"
          // className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-app2 text-muted hover:text-app hover:bg-app2 transition-colors"
        >
          <Button variant={"outline"} size={"sm"}>
            <ChevronLeft className="w-3.5 h-3.5" />
            Programs
          </Button>
        </Link>
      </div>

      {/* Builder Layout: Sidebar + Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-5 lg:gap-8 items-start">
        {/* LEFT: Sidebar */}
        <div className="bg-muted/40 border border-app rounded-xl p-4 sm:p-5 lg:sticky lg:top-4">
          {/* Program Name Header */}
          <div className="mb-5">
            {/* <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1">
              Active Matrix
            </div> */}
            <div className="text-xl flex items-center gap-2 font-play sm:text-2xl font-medium text-primary leading-tight uppercase">
              <Dumbbell
                className="min-h-4 sm:min-h-5 min-w-4 sm:min-w-5"
                size={20}
              />
              <p className="truncate" title={program.name}>
                {program.name} RANDOM NAMES OF THE SPOITLS LFSJADKLF
              </p>
            </div>
          </div>

          {/* Days List - Desktop */}
          <div className="hidden lg:block">
            <div className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
              Program Architecture
            </div>
            <div className="flex flex-col gap-2">
              {program.days.map((day) => {
                const isActive = day.id === selectedDayId;
                const exerciseCount = day.exercises.length;

                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={cn(
                      "w-full font-play text-left rounded-lg border px-3.5 py-3 flex items-center justify-between transition-all cursor-pointer text-sm",
                      isActive
                        ? "border-primary/50 bg-primary/3 hover:border-primary/80"
                        : "border-app text-muted hover:bg-muted",
                    )}
                  >
                    <span>
                      Day {day.day_order} – {day.name}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] rounded px-1.5 py-0.5",
                        isActive
                          ? "bg-accent text-black font-bold"
                          : "bg-app3 text-muted",
                      )}
                    >
                      {exerciseCount} {exerciseCount === 1 ? "Ex" : "Exs"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days List - Mobile Select */}
          <div className="block lg:hidden mt-3">
            <div className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
              Select Training Day
            </div>
            <Select
              value={selectedDayId ? String(selectedDayId) : ""}
              onValueChange={(val) => setSelectedDayId(Number(val))}
            >
              <SelectTrigger className="w-full bg-app2 border-app font-play py-5 h-10 text-left text-sm flex items-center justify-between">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent className="bg-app border border-app2">
                {program.days.map((day) => {
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

        {/* RIGHT: Day Workspace Canvas */}
        <div className="min-w-0">
          {selectedDay ? (
            <>
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-app">
                <div>
                  <h2 className="text-2xl sm:text-[32px] font-play leading-tight tracking-tight">
                    {selectedDay.name} Track
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    {exercises.length}{" "}
                    {exercises.length === 1 ? "exercise" : "exercises"} total
                  </p>
                </div>
                <Button
                  onClick={() => setAddExerciseOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Exercise
                </Button>
              </div>

              {/* Exercise List */}
              {exercises.length === 0 ? (
                <div className="text-center py-16 sm:py-20 border border-dashed border-app rounded-lg bg-[rgba(255,255,255,0.002)]">
                  <p className="text-sm text-muted mb-5">
                    No exercises configured for this training day yet.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddExerciseOpen(true)}
                    className="border-app2"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Exercise
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {exercises.map((item, index) => (
                    <ExerciseRow
                      key={item.id}
                      item={item}
                      index={index}
                      onEdit={() => setEditTarget(item)}
                      onRemove={() => handleRemoveExercise(item.id)}
                      isPending={isPending}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 border border-dashed border-app rounded-lg">
              <p className="text-sm text-muted">
                Select a day from the sidebar to configure exercises.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Exercise Dialog */}
      {selectedDayId && (
        <AddExerciseDialog
          open={addExerciseOpen}
          onOpenChange={setAddExerciseOpen}
          userId={userId}
          dayId={selectedDayId}
          exercises={exerciseLibrary}
          onExerciseAdded={refreshPage}
        />
      )}

      {/* Edit Exercise Dialog */}
      {editTarget && (
        <EditExerciseDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          userId={userId}
          exerciseRowId={editTarget.id}
          exerciseName={editTarget.exercise.name}
          initialSets={editTarget.sets ?? 3}
          initialRepMin={editTarget.rep_min ?? 8}
          initialRepMax={editTarget.rep_max ?? 12}
          onSaved={refreshPage}
        />
      )}
    </div>
  );
}

/* =========================================================
 * Exercise Row Component
 * ========================================================= */
interface ExerciseRowProps {
  item: ProgramExercise;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  isPending: boolean;
}

function ExerciseRow({
  item,
  index,
  onEdit,
  onRemove,
  isPending,
}: ExerciseRowProps) {
  const name = item.exercise.name || "Custom Exercise";
  const muscle = item.exercise.muscle_group || "General";
  const equipment = item.exercise.equipment || "Bodyweight";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 bg-app2 border border-app rounded-lg p-4 sm:px-5 sm:py-4 transition-all hover:border-app2 select-none group">
      {/* Left: Drag handle + position + exercise info */}
      <div className="flex items-center flex-1 min-w-0 w-full">
        {/* Drag handle (visual only, deferred) */}
        <div className="text-muted pr-3 sm:pr-4 cursor-grab opacity-30">
          <GripHorizontal className="w-[18px] h-[18px]" />
        </div>

        {/* Position index */}
        <div className="font-mono text-xs text-muted font-semibold w-6 sm:w-7 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Exercise name + tags */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="uppercase text-[15px] sm:text-base font-play truncate mb-1.5 capitalize">
            {name}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0 h-[18px] border-0",
                getMuscleClass(muscle),
              )}
            >
              {muscle}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0 h-[18px] border-0 badge-generic"
            >
              {equipment}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right: Metrics + Actions */}
      <div className="flex items-center justify-between w-full sm:w-auto border-t sm:border-t-0 border-app pt-3.5 sm:pt-0">
        {/* Settings Metrics */}
        <div className="flex items-center gap-5 sm:gap-7 sm:mr-6">
          <div className="text-center">
            <div className="font-mono text-[15px] sm:text-base text-app">
              {item.sets ?? 3}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted uppercase tracking-wide mt-0.5">
              Sets
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-[15px] sm:text-base">
              {item.rep_min ?? 8} - {item.rep_max ?? 12}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted uppercase tracking-wide mt-0.5">
              Reps
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:border-l sm:border-app sm:pl-4">
          <SickButton
            variant="text"
            icon={<Pencil className="w-[14px] h-[14px]" />}
            onClick={onEdit}
            disabled={isPending}
            title="Edit Target Ranges"
          >
            {""}
          </SickButton>
          <SickButton
            variant="danger"
            icon={<Trash2 className="w-[14px] h-[14px]" />}
            onClick={onRemove}
            disabled={isPending}
            title="Remove Exercise"
          >
            {""}
          </SickButton>
        </div>
      </div>
    </div>
  );
}
