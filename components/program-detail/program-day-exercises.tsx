"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SickButton } from "@/components/ui/sick-button";
import {
  reorderDayExercises,
  type ProgramDay,
  type ProgramExercise,
} from "@/lib/actions/programs";
import { ProgramExerciseRow } from "./program-exercise-row";

interface ProgramDayExercisesProps {
  userId: string;
  selectedDay: ProgramDay | null;
  exercises: ProgramExercise[];
  isPending: boolean;
  onAddExercise: () => void;
  onRenameDay: (day: ProgramDay) => void;
  onEditExercise: (exercise: ProgramExercise) => void;
  onRemoveExercise: (exerciseRowId: number) => void;
  onReordered: () => void;
}

export function ProgramDayExercises({
  userId,
  selectedDay,
  exercises,
  isPending,
  onAddExercise,
  onRenameDay,
  onEditExercise,
  onRemoveExercise,
  onReordered,
}: ProgramDayExercisesProps) {
  const [orderedExercises, setOrderedExercises] =
    useState<ProgramExercise[]>(exercises);
  const [isReordering, setIsReordering] = useState(false);

  const serverOrderKey = exercises
    .map((item) => `${item.id}:${item.position}`)
    .join(",");

  useEffect(() => {
    setOrderedExercises(exercises);
  }, [selectedDay?.id, serverOrderKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (isReordering || isPending) return;
    if (!over || active.id === over.id || !selectedDay) return;

    const oldIndex = orderedExercises.findIndex(
      (item) => String(item.id) === active.id,
    );
    const newIndex = orderedExercises.findIndex(
      (item) => String(item.id) === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const previousOrder = orderedExercises;
    const nextOrder = arrayMove(orderedExercises, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        position: index + 1,
      }),
    );
    setOrderedExercises(nextOrder);
    setIsReordering(true);

    const saveOrder = reorderDayExercises(
      userId,
      selectedDay.id,
      nextOrder.map((item) => item.id),
    ).then((result) => {
      if (!result.success) {
        throw new Error(result.error ?? "Could not reorder exercises.");
      }
      return result;
    });

    void toast.promise(saveOrder, {
      loading: "Saving order...",
      success: "Exercise order saved",
      error: (err) =>
        err instanceof Error ? err.message : "Could not reorder exercises.",
    });

    void saveOrder
      .then(() => {
        onReordered();
      })
      .catch(() => {
        setOrderedExercises(previousOrder);
      })
      .finally(() => {
        setIsReordering(false);
      });
  };

  const dragDisabled = isPending || isReordering;

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
      <div className="max-sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-app">
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
            Day {selectedDay.day_order} · {orderedExercises.length}{" "}
            {orderedExercises.length === 1 ? "exercise" : "exercises"}
          </p>
        </div>
        <Button
          onClick={onAddExercise}
          disabled={dragDisabled}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Exercise
        </Button>
      </div>

      {orderedExercises.length === 0 ? (
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedExercises.map((item) => String(item.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {orderedExercises.map((item, index) => (
                <ProgramExerciseRow
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={() => onEditExercise(item)}
                  onRemove={() => onRemoveExercise(item.id)}
                  isPending={isPending}
                  dragDisabled={dragDisabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
