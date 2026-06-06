"use client";

import type { ReactNode } from "react";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  dragDisabled?: boolean;
}

function ActionButton({
  onClick,
  disabled,
  title,
  children,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center justify-center p-2 rounded-md border border-[#2c2c2e] bg-[#1c1c1e] text-muted transition-colors",
        "hover:text-app hover:border-app2 disabled:opacity-40 disabled:pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ProgramExerciseRow({
  item,
  index,
  onEdit,
  onRemove,
  isPending,
  dragDisabled = false,
}: ProgramExerciseRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(item.id), disabled: dragDisabled });

  const name = item.exercise.name || "Custom Exercise";
  const muscle = item.exercise.muscle_group || "General";
  const equipment = item.exercise.equipment || "Bodyweight";
  const positionLabel = String(index + 1).padStart(2, "0");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative overflow-hidden flex flex-col gap-4 rounded-xl border border-app bg-app2 p-[18px] select-none transition-all",
        "hover:border-app2",
        isDragging && "z-10 opacity-60 shadow-lg border-accent/40",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 -top-4 z-[1] font-sans text-[4.5rem] font-black leading-none text-white/[0.03] select-none"
      >
        {positionLabel}
      </span>

      <div className="relative z-[2] flex items-start gap-3">
        <button
          type="button"
          className={cn(
            "touch-none flex items-center pt-0.5 text-[#444]",
            dragDisabled
              ? "cursor-not-allowed opacity-30"
              : "cursor-grab active:cursor-grabbing hover:text-muted",
          )}
          disabled={dragDisabled}
          aria-label={`Reorder ${name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-[18px] w-[18px]" />
        </button>

        <div className="min-w-0 max-w-[85%] flex-1">
          <h3 className="mb-2 font-play text-[1.05rem] font-bold uppercase leading-snug tracking-wide text-app capitalize">
            {name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <span
              className={cn(
                "rounded px-2 py-[3px] text-[0.65rem] font-bold uppercase tracking-wide",
                getMuscleClass(muscle),
              )}
            >
              {muscle}
            </span>
            <span className="rounded bg-[#222222] px-2 py-[3px] text-[0.65rem] font-bold uppercase tracking-wide text-[#aaaaaa]">
              {equipment}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-[2] flex items-center justify-between border-t border-[#1f1f1f] pt-3.5">
        <div className="flex gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[1.1rem] font-semibold text-app">
              {item.sets ?? 3}
            </span>
            <span className="text-[0.65rem] uppercase text-muted">Sets</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[1.1rem] font-semibold text-app">
              {item.rep_min ?? 8} - {item.rep_max ?? 12}
            </span>
            <span className="text-[0.65rem] uppercase text-muted">Reps</span>
          </div>
        </div>

        <div className="flex gap-2">
          <ActionButton
            onClick={onEdit}
            disabled={isPending}
            title="Edit target ranges"
          >
            <Pencil className="h-3.5 w-3.5" />
          </ActionButton>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <ActionButton
                disabled={isPending}
                title="Remove exercise"
                className="hover:text-destructive hover:border-destructive/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </ActionButton>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-app border border-app2 text-app">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-play uppercase">
                  Remove Exercise?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted">
                  Remove{" "}
                  <span className="font-semibold capitalize text-app">
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
