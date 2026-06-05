"use client";

import { useState, useTransition, type ReactNode } from "react";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  type ActiveProgram,
  type ProgramExercise,
  removeExerciseFromDay,
  deleteUserProgram,
  renameProgram,
  renameProgramDay,
  type ProgramDay,
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(program.name);
  const [renameDayOpen, setRenameDayOpen] = useState(false);
  const [renameDayTarget, setRenameDayTarget] = useState<ProgramDay | null>(
    null,
  );
  const [renameDayValue, setRenameDayValue] = useState("");

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

  const handleDeleteProgram = async () => {
    const result = await deleteUserProgram(userId, program.id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete program.");
      return;
    }
    toast.success(`Program "${program.name}" deleted.`);
    router.push("/programs");
  };

  const handleRenameOpenChange = (open: boolean) => {
    if (open) setRenameValue(program.name);
    setRenameOpen(open);
  };

  const handleRenameProgram = () => {
    startTransition(async () => {
      const result = await renameProgram(userId, program.id, renameValue);
      if (!result.success) {
        toast.error(result.error ?? "Could not rename program.");
        return;
      }
      toast.success("Program renamed.");
      setRenameOpen(false);
      refreshPage();
    });
  };

  const openRenameDay = (day: ProgramDay) => {
    setRenameDayTarget(day);
    setRenameDayValue(day.name);
    setRenameDayOpen(true);
  };

  const handleRenameDayOpenChange = (open: boolean) => {
    if (!open) setRenameDayTarget(null);
    setRenameDayOpen(open);
  };

  const handleRenameDay = () => {
    if (!renameDayTarget) return;
    startTransition(async () => {
      const result = await renameProgramDay(
        userId,
        renameDayTarget.id,
        renameDayValue,
      );
      if (!result.success) {
        toast.error(result.error ?? "Could not rename day.");
        return;
      }
      toast.success("Day renamed.");
      setRenameDayOpen(false);
      setRenameDayTarget(null);
      refreshPage();
    });
  };

  const deleteProgramDialog = (trigger: ReactNode) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-app border border-app2 text-app">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-play uppercase">
            Delete Program?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted">
            This will permanently delete{" "}
            <span className="text-app font-semibold">
              &ldquo;{program.name}&rdquo;
            </span>{" "}
            and all its days and exercises. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-app bg-app3/50">
          <AlertDialogCancel className="border-app2 bg-transparent hover:bg-app2">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDeleteProgram}
          >
            Delete Program
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="space-y-3">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Link href="/programs">
          <Button variant={"outline"} size={"sm"}>
            <ChevronLeft className="w-3.5 h-3.5" />
            All programs
          </Button>
        </Link>
      </div>

      {/* Program Title — full width */}
      <div className="flex items-center gap-2.5 text-xl sm:text-3xl font-play leading-tight py-4 min-w-0">
        <div className="flex-1 flex items-center gap-2">
          <Dumbbell
            className="min-h-4 sm:min-h-5 min-w-4 sm:min-w-5 shrink-0"
            size={24}
            />
          <h1 className="min-w-0 truncate bg-gradient-to-r from-primary to-primary via-white bg-clip-text text-transparent w-fit" title={program.name}>
            {program.name}
          </h1>
        </div>
        <SickButton
          variant="text"
          icon={<Pencil className="w-[14px] h-[14px]" />}
          onClick={() => handleRenameOpenChange(true)}
          disabled={isPending}
          title="Rename Program"
        >
          {""}
        </SickButton>
      </div>

      {/* Mobile day picker — outside sidebar so delete isn't stacked at top */}
      <div className="lg:hidden flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
            Training Day
          </div>
          <Select
            value={selectedDayId ? String(selectedDayId) : ""}
            onValueChange={(val) => setSelectedDayId(Number(val))}
          >
            <SelectTrigger className="w-full bg-app2 border-app font-play h-11 text-left text-sm">
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
        {selectedDay && (
          <SickButton
            variant="text"
            icon={<Pencil className="w-[14px] h-[14px]" />}
            onClick={() => openRenameDay(selectedDay)}
            disabled={isPending}
            title="Rename Day"
            className="mb-0.5 shrink-0"
          >
            {""}
          </SickButton>
        )}
      </div>

      {/* Builder Layout: Sidebar + Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-5 lg:gap-8 items-start">
        {/* LEFT: Sidebar (desktop only) */}
        <div className="hidden lg:flex bg-muted/40 border border-app rounded-xl p-4 sm:p-5 lg:sticky lg:top-4 flex-col gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
              Program Architecture
            </div>
            <div className="flex flex-col gap-2">
              {program.days.map((day) => {
                const isActive = day.id === selectedDayId;
                const exerciseCount = day.exercises.length;

                return (
                  <div
                    key={day.id}
                    className={cn(
                      "flex items-center gap-1 rounded-lg border transition-all",
                      isActive
                        ? "border-primary/50 bg-primary/3"
                        : "border-app",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDayId(day.id)}
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
                      onClick={() => openRenameDay(day)}
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
            {deleteProgramDialog(
              <SickButton
                variant="danger"
                className="w-full"
                disabled={isPending}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete Program
              </SickButton>,
            )}
          </div>
        </div>

        {/* RIGHT: Day Workspace Canvas */}
        <div className="min-w-0">
          {selectedDay ? (
            <>
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-app">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-2xl font-play leading-tight tracking-tight truncate">
                      {selectedDay.name} Track
                    </h2>
                    <SickButton
                      variant="text"
                      icon={<Pencil className="w-[14px] h-[14px]" />}
                      onClick={() => openRenameDay(selectedDay)}
                      disabled={isPending}
                      title="Rename Day"
                      className="shrink-0"
                    >
                      {""}
                    </SickButton>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    Day {selectedDay.day_order} · {exercises.length}{" "}
                    {exercises.length === 1 ? "exercise" : "exercises"}
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

      {/* Mobile: delete at bottom, de-emphasized */}
      <div className="lg:hidden pt-8 mt-2 border-t border-app/40">
        <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground mb-3">
          Program Settings
        </p>
        {deleteProgramDialog(
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-0 h-auto font-normal"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete program
          </Button>,
        )}
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

      {/* Rename Day Dialog */}
      <Dialog open={renameDayOpen} onOpenChange={handleRenameDayOpenChange}>
        <DialogContent className="max-w-sm bg-app border border-app2 rounded-xl p-0">
          <DialogHeader className="px-5 pt-5 sm:px-7 sm:pt-6 gap-0">
            <DialogTitle className="text-lg font-play uppercase">
              Rename Day
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              {renameDayTarget
                ? `Update the name for Day ${renameDayTarget.day_order}.`
                : "Update the display name for this training day."}
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 sm:px-7 pb-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
              Day name
            </label>
            <Input
              type="text"
              value={renameDayValue}
              onChange={(e) => setRenameDayValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRenameDay();
                }
              }}
              placeholder="e.g. Push, Pull, Legs"
              className="bg-app2 border-app2 text-app font-play"
              autoFocus
            />
          </div>

          <DialogFooter className="m-0 border-t border-app bg-[rgba(0,0,0,0.2)]">
            <Button
              variant="outline"
              onClick={() => setRenameDayOpen(false)}
              className="border-app2"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameDay}
              disabled={isPending || !renameDayValue.trim()}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Program Dialog */}
      <Dialog open={renameOpen} onOpenChange={handleRenameOpenChange}>
        <DialogContent className="max-w-sm bg-app border border-app2 rounded-xl p-0">
          <DialogHeader className="px-5 pt-5 sm:px-7 sm:pt-6 gap-0">
            <DialogTitle className="text-lg font-play uppercase">
              Rename Program
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Update the display name for this program.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 sm:px-7 pb-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
              Program name
            </label>
            <Input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRenameProgram();
                }
              }}
              placeholder="e.g. Push Pull Legs"
              className="bg-app2 border-app2 text-app font-play"
              autoFocus
            />
          </div>

          <DialogFooter className="m-0 border-t border-app bg-[rgba(0,0,0,0.2)]">
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              className="border-app2"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameProgram}
              disabled={isPending || !renameValue.trim()}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

          {/* Delete Exercise — with confirmation */}
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
