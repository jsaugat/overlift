"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateExerciseSettings } from "@/lib/actions/programs";

interface EditExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  exerciseRowId: number;
  exerciseName: string;
  initialSets: number;
  initialRepMin: number;
  initialRepMax: number;
  onSaved: () => void;
}

export function EditExerciseDialog({
  open,
  onOpenChange,
  userId,
  exerciseRowId,
  exerciseName,
  initialSets,
  initialRepMin,
  initialRepMax,
  onSaved,
}: EditExerciseDialogProps) {
  const [sets, setSets] = useState(initialSets);
  const [repMin, setRepMin] = useState(initialRepMin);
  const [repMax, setRepMax] = useState(initialRepMax);
  const [isPending, startTransition] = useTransition();

  // Sync when dialog opens with new values
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setSets(initialSets);
      setRepMin(initialRepMin);
      setRepMax(initialRepMax);
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateExerciseSettings(
        userId,
        exerciseRowId,
        sets || 3,
        repMin || 8,
        repMax || 12,
      );
      onSaved();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm bg-app border border-app2 rounded-xl p-0 text-app overflow-hidden">
        <DialogHeader className="px-5 pt-5 sm:px-7 sm:pt-6">
          <DialogTitle className="text-base font-bold text-app capitalize">
            {exerciseName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted">
            Configure target sets and rep ranges.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 sm:px-7 pb-2">
          <div className="grid grid-cols-3 gap-3 bg-[rgba(0,0,0,0.2)] p-4 rounded-lg border border-app">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                Sets
              </label>
              <Input
                type="number"
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value) || 0)}
                min={1}
                max={20}
                className="bg-app2 border-app2 text-app font-mono text-center text-base"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                Rep Min
              </label>
              <Input
                type="number"
                value={repMin}
                onChange={(e) => setRepMin(parseInt(e.target.value) || 0)}
                min={0}
                max={200}
                className="bg-app2 border-app2 text-app font-mono text-center text-base"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                Rep Max
              </label>
              <Input
                type="number"
                value={repMax}
                onChange={(e) => setRepMax(parseInt(e.target.value) || 0)}
                min={0}
                max={200}
                className="bg-app2 border-app2 text-app font-mono text-center text-base"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 py-4 sm:px-7 border-t border-app bg-[rgba(0,0,0,0.2)]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-app2"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
