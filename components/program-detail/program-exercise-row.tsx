"use client";

import { Pencil, Trash2, GripHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { SickButton } from "@/components/ui/sick-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ProgramExercise } from "@/lib/actions/programs";
import { cn } from "@/lib/utils";
import { getMuscleClass } from "@/lib/muscle-utils";

interface ProgramExerciseRowProps {
  item: ProgramExercise;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  isPending: boolean;
}

export function ProgramExerciseRow({
  item,
  index,
  onEdit,
  onRemove,
  isPending,
}: ProgramExerciseRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(item.id), disabled: isPending });

  const name = item.exercise.name || "Custom Exercise";
  const muscle = item.exercise.muscle_group || "General";
  const equipment = item.exercise.equipment || "Bodyweight";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 bg-app2 border border-app rounded-lg p-4 sm:px-5 sm:py-4 transition-all hover:border-app2 select-none group",
        isDragging && "opacity-60 z-10 shadow-lg border-accent/40",
      )}
    >
      <div className="flex items-center flex-1 min-w-0 w-full">
        <button
          type="button"
          className={cn(
            "text-muted pr-3 sm:pr-4 touch-none",
            isPending ? "cursor-not-allowed opacity-30" : "cursor-grab active:cursor-grabbing opacity-50 hover:opacity-80",
          )}
          disabled={isPending}
          aria-label={`Reorder ${name}`}
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="w-[18px] h-[18px]" />
        </button>

        <div className="font-mono text-xs text-muted font-semibold w-6 sm:w-7 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>

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

      <div className="flex items-center justify-between w-full sm:w-auto border-t sm:border-t-0 border-app pt-3.5 sm:pt-0">
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <SickButton
                variant="danger"
                icon={<Trash2 className="w-[14px] h-[14px]" />}
                disabled={isPending}
                title="Remove Exercise"
              >
                {""}
              </SickButton>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-app border border-app2 text-app">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-play uppercase">
                  Remove Exercise?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted">
                  Remove{" "}
                  <span className="text-app font-semibold capitalize">
                    &ldquo;{name}&rdquo;
                  </span>{" "}
                  from this training day? You can always add it back later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="border-app bg-app3/50">
                <AlertDialogCancel className="border-app2 bg-transparent hover:bg-app2">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onRemove}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
