"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SickButton } from "@/components/ui/sick-button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DeleteProgramDialog } from "./delete-program-dialog";
import { ProgramDetailHeader } from "./program-detail-header";
import {
  ProgramDetailDaySidebar,
  ProgramDetailMobileDaySelect,
  ProgramDetailMobileDeleteSection,
} from "./program-detail-day-nav";
import { ProgramDayExercises } from "./program-day-exercises";

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

  const sidebarDeleteTrigger = (
    <DeleteProgramDialog
      programName={program.name}
      onConfirm={handleDeleteProgram}
      trigger={
        <SickButton variant="danger" className="w-full" disabled={isPending}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Delete Program
        </SickButton>
      }
    />
  );

  const mobileDeleteTrigger = (
    <DeleteProgramDialog
      programName={program.name}
      onConfirm={handleDeleteProgram}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-0 h-auto font-normal"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Delete program
        </Button>
      }
    />
  );

  return (
    <div className="space-y-3">
      <ProgramDetailHeader
        programName={program.name}
        onRenameClick={() => handleRenameOpenChange(true)}
      />

      <ProgramDetailMobileDaySelect
        days={program.days}
        selectedDayId={selectedDayId}
        onSelectDay={setSelectedDayId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-5 lg:gap-8 items-start">
        <ProgramDetailDaySidebar
          days={program.days}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
          onRenameDay={openRenameDay}
          isPending={isPending}
          deleteProgramTrigger={sidebarDeleteTrigger}
        />

        {/* Program Day Exercises */}
        <ProgramDayExercises
          userId={userId}
          selectedDay={selectedDay}
          exercises={exercises}
          isPending={isPending}
          onAddExercise={() => setAddExerciseOpen(true)}
          onRenameDay={openRenameDay}
          onEditExercise={setEditTarget}
          onRemoveExercise={handleRemoveExercise}
          onReordered={refreshPage}
        />
      </div>

      <ProgramDetailMobileDeleteSection
        deleteProgramTrigger={mobileDeleteTrigger}
      />

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
