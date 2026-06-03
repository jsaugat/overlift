"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Plus, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addExerciseToDay, createCustomExercise } from "@/lib/actions/programs";
import type { ExerciseLibraryItem } from "@/lib/actions/exercise-library";
import { cn } from "@/lib/utils";
import { getMuscleClass } from "@/lib/muscle-utils";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  dayId: number;
  exercises: ExerciseLibraryItem[];
  onExerciseAdded: () => void;
}

const MUSCLE_GROUPS = [
  "Shoulders",
  "Chest",
  "Back",
  "Biceps",
  "Triceps",
  "Forearms",
  "Core",
  "Glutes",
  "Quads",
  "Hamstrings",
  "Calves",
];

const EQUIPMENT_OPTIONS = [
  "Machine",
  "Dumbbell",
  "Barbell",
  "Cable",
  "Bodyweight",
];

export function AddExerciseDialog({
  open,
  onOpenChange,
  userId,
  dayId,
  exercises,
  onExerciseAdded,
}: AddExerciseDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMuscle, setFilterMuscle] = useState<string>("All");
  const [filterEquipment, setFilterEquipment] = useState<string>("All");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState("Chest");
  const [customEquipment, setCustomEquipment] = useState("Machine");
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setFilterMuscle("All");
      setFilterEquipment("All");
      setShowCustomForm(false);
      setCustomName("");
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  // Group exercises by muscle_group
  const grouped = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = exercises;

    if (query) {
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          (ex.muscle_group?.toLowerCase() ?? "").includes(query) ||
          (ex.equipment?.toLowerCase() ?? "").includes(query),
      );
    }

    if (filterMuscle !== "All") {
      filtered = filtered.filter(
        (ex) => (ex.muscle_group || "Other").toLowerCase() === filterMuscle.toLowerCase()
      );
    }

    if (filterEquipment !== "All") {
      filtered = filtered.filter(
        (ex) => (ex.equipment || "Bodyweight").toLowerCase() === filterEquipment.toLowerCase()
      );
    }

    const map: Record<string, ExerciseLibraryItem[]> = {};
    for (const ex of filtered) {
      const group = ex.muscle_group ?? "Other";
      if (!map[group]) map[group] = [];
      map[group].push(ex);
    }

    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [exercises, searchQuery, filterMuscle, filterEquipment]);

  const handleSelectExercise = (exerciseId: number) => {
    startTransition(async () => {
      await addExerciseToDay(userId, dayId, exerciseId);
      onExerciseAdded();
      onOpenChange(false);
    });
  };

  const handleCreateCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await createCustomExercise(
        userId,
        trimmed,
        customMuscle,
        customEquipment,
      );
      if (result.success && result.exerciseId) {
        await addExerciseToDay(userId, dayId, result.exerciseId);
        onExerciseAdded();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg h-auto max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col bg-app border border-app2 rounded-xl p-0 text-app overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0 sm:px-7 sm:pt-6 shrink-0">
          <DialogTitle className="text-lg font-play uppercase">
            Add Exercise
          </DialogTitle>
          <DialogDescription className="text-xs text-muted">
            Search the exercise library or create a custom one.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 sm:px-7 shrink-0 flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="pl-10 bg-app2 border-app2 text-app placeholder:text-muted/50"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filterMuscle} onValueChange={setFilterMuscle}>
              <SelectTrigger className="flex-1 bg-app2 border-app2 text-app h-8 text-xs">
                <SelectValue placeholder="Muscle Group" />
              </SelectTrigger>
              <SelectContent className="bg-app2 border-app2">
                <SelectItem value="All">All Muscles</SelectItem>
                {MUSCLE_GROUPS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEquipment} onValueChange={setFilterEquipment}>
              <SelectTrigger className="flex-1 bg-app2 border-app2 text-app h-8 text-xs">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent className="bg-app2 border-app2">
                <SelectItem value="All">All Equipment</SelectItem>
                {EQUIPMENT_OPTIONS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exercise Library Scroll Zone */}
        <ScrollArea className="mx-5 sm:mx-7 h-[360px] sm:h-[480px] flex-grow min-h-[150px] rounded-lg border border-app bg-[rgba(0,0,0,0.15)]">
          {grouped.length === 0 ? (
            <div className="flex items-center justify-center h-full p-10 text-sm text-muted">
              No matching exercises found
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group}>
                {/* Section Header */}
                <div className="sticky top-0 z-10 bg-app2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-muted border-b border-app">
                  {group}
                </div>
                {/* Exercise Rows */}
                {items.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExercise(ex.id)}
                    disabled={isPending}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.01)] transition-colors hover:bg-app3 disabled:opacity-50 cursor-pointer text-left group"
                  >
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <span className="text-sm font-semibold text-app truncate capitalize">
                        {ex.name}
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0 h-[18px] border-0",
                            getMuscleClass(ex.muscle_group),
                          )}
                        >
                          {ex.muscle_group ?? "General"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0 h-[18px] border-0 badge-generic"
                        >
                          {ex.equipment ?? "Bodyweight"}
                        </Badge>
                        {ex.source === "custom" && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0 h-[18px] badge-custom"
                          >
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-muted group-hover:text-app transition-colors shrink-0 ml-3" />
                  </button>
                ))}
              </div>
            ))
          )}
        </ScrollArea>

        {/* Custom Exercise Section */}
        <div className="px-5 pb-5 sm:px-7 sm:pb-6 shrink-0">
          {!showCustomForm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
              <p className="text-xs text-muted">
                Can&apos;t find your exercise?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomForm(true)}
                className="border-app2 hover:bg-app2 w-full sm:w-auto"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Custom
              </Button>
            </div>
          ) : (
            <div className="mt-2 p-4 rounded-lg bg-[rgba(0,0,0,0.4)] border border-app space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-accent">
                Create Custom Exercise
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Exercise Name
                </label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., My Gym Special Row"
                  className="bg-app2 border-app2 text-app placeholder:text-muted/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Muscle Group (Top-to-Bottom)
                </label>
                <Select value={customMuscle} onValueChange={setCustomMuscle}>
                  <SelectTrigger className="bg-app2 border-app2 text-app w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-app2 border-app2">
                    {MUSCLE_GROUPS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Equipment
                </label>
                <Select
                  value={customEquipment}
                  onValueChange={setCustomEquipment}
                >
                  <SelectTrigger className="bg-app2 border-app2 text-app w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-app2 border-app2">
                    {EQUIPMENT_OPTIONS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomName("");
                  }}
                  className="border-app2"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateCustom}
                  disabled={isPending || !customName.trim()}
                >
                  {isPending ? "Saving..." : "Save Exercise"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
