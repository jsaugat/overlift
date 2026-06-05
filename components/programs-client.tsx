"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle04Icon } from "@hugeicons/core-free-icons";
import {
  createUserProgram,
  deleteUserProgram,
  setActiveProgram,
  type UserProgramSummary,
} from "@/lib/actions/programs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SickButton } from "./ui/sick-button";

interface ProgramsClientProps {
  userId: string;
  programs: UserProgramSummary[];
}

const SUGGESTIONS = [
  "Push",
  "Pull",
  "Legs",
  "Upper",
  "Lower",
  "Full Body",
  "Rest",
  "Chest",
  "Back",
  "Arms",
  "Shoulders",
];

interface DayBuilderItem {
  id: string; // for stable keys during reordering
  name: string;
}

export function ProgramsClient({ userId, programs }: ProgramsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [programName, setProgramName] = useState("");
  const [days, setDays] = useState<DayBuilderItem[]>([
    { id: crypto.randomUUID(), name: "Push" },
    { id: crypto.randomUUID(), name: "Pull" },
    { id: crypto.randomUUID(), name: "Legs" },
  ]);

  const onlyOneProgram = programs.length === 1;
  const activeProgramId = useMemo(() => {
    return programs.find((program) => program.is_active)?.id ?? null;
  }, [programs]);

  const addDay = () => {
    if (days.length >= 7) return;
    setDays((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
      },
    ]);
  };

  const removeDay = (index: number) => {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDay = (index: number, value: string) => {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== index) return day;
        return { ...day, name: value };
      }),
    );
  };

  const refreshAfterAction = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleSetActive = async (programId: number) => {
    setError(null);
    try {
      await setActiveProgram(userId, programId);
      toast.success("Active program updated successfully");
      refreshAfterAction();
    } catch {
      setError("Could not set program as active. Please try again.");
    }
  };

  const handleDelete = async (programId: number) => {
    setError(null);
    try {
      const result = await deleteUserProgram(userId, programId);
      if (!result.success) {
        setError(result.error ?? "Could not delete program.");
        return;
      }
      toast.success("Program deleted successfully");
      refreshAfterAction();
    } catch {
      setError("Could not delete program. Please try again.");
    }
  };

  // Create new program handler
  const handleCreateProgram = async () => {
    setError(null);

    // Validate program name
    const trimmedName = programName.trim();
    if (!trimmedName) {
      setError("Program name is required.");
      return;
    }

    try {
      const newProgramId = await createUserProgram(
        userId,
        trimmedName,
        days.map((day, index) => {
          const finalName = day.name.trim() || `Day ${index + 1}`;

          return {
            day_order: index + 1,
            name: finalName,
          };
        }),
      );
      toast.success(`Program "${trimmedName}" created successfully`);
      setShowForm(false);
      setProgramName("");
      setDays([
        { id: crypto.randomUUID(), name: "Push" },
        { id: crypto.randomUUID(), name: "Pull" },
        { id: crypto.randomUUID(), name: "Legs" },
      ]);
      router.push(`/programs/${newProgramId}`);
    } catch {
      setError("Could not create program. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h2 className="uppercase font-play tracking-wide leading-none">
            Training Programs
          </h2>
          <p className="text-muted text-[13px] sm:text-sm mt-1.5">
            Select an ongoing structure or assemble a custom iteration scheme
          </p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Program
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Program Creator Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="md:min-w-md max-w-lvh bg-app border border-app2 rounded-xl p-6 text-app">
          <DialogHeader>
            <DialogTitle className="font-play uppercase">
              Initialize New Program
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Map your schedule macrocycles and create individual active days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="block mb-1.5 text-[11px] uppercase tracking-wider font-bold text-muted">
                Program name
              </label>
              <Input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="e.g. Push Pull Legs, Upper Lower Split"
                className="w-full bg-app2 border border-app2 text-app placeholder:text-muted/50 focus-visible:ring-1 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-muted">
                  Days ({days.length}/7)
                </label>
              </div>

              <div className="max-h-80 md:max-h-90 overflow-y-auto space-y-2 pr-1">
                {days.map((day, index) => (
                  <div key={day.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3 bg-app2 border border-app2 rounded-md px-3 py-2 pr-1.5">
                      <span className="text-[10px] font-mono text-muted uppercase shrink-0 w-10">
                        Day {String(index + 1).padStart(2, "0")}
                      </span>
                      <Input
                        type="text"
                        value={day.name}
                        onChange={(e) => updateDay(index, e.target.value)}
                        placeholder="Day Name (e.g. Chest + Triceps)"
                        className="flex-1 border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted/50 focus:bg-black rounded px-2 -mx-1 transition-colors"
                      />
                      <SickButton
                        onClick={() => removeDay(index)}
                        disabled={days.length <= 1}
                        className="text-muted-foreground shrink-0 p-1 h-auto"
                      >
                        <Trash2 size={14} />
                      </SickButton>
                    </div>

                    {/* Suggestions */}
                    {!day.name.trim() && (
                      <div className="flex flex-wrap gap-1">
                        {SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => updateDay(index, suggestion)}
                            className="px-2 py-0.5 text-xs rounded-full border border-app2 text-muted hover:text-white hover:bg-app2 transition-colors cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDay}
              disabled={days.length >= 7}
              className="w-full border-dashed border-app2 hover:bg-app2 mt-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Training Day
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-app">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="border-app2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateProgram}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Create & Configure"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-app rounded-lg bg-[rgba(255,255,255,0.002)]">
          <p className="text-sm text-muted mb-5">
            No training programs discovered inside your library profile.
          </p>
          <Button onClick={() => setShowForm(true)}>Create a Program</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
          {programs.map((program) => {
            const isActive = program.id === activeProgramId;
            const dayStrings = program.days.map((d) => d.name).join(" • ");

            return (
              <div
                key={program.id}
                className={cn(
                  "group relative border rounded-xl p-5 sm:p-6 transition-all duration-200 overflow-hidden flex flex-col justify-between min-h-[160px] sm:min-h-[180px] cursor-pointer",
                  isActive
                    ? "bg-accent/[0.03] border-accent/30 shadow-[0_0_24px_-6px_rgba(200,255,0,0.1)]"
                    : "bg-app2 border",
                )}
                onClick={() => router.push(`/programs/${program.id}`)}
              >
                {/* Active accent bar */}
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-accent" />
                )}

                {/* Body */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg sm:text-xl font-medium text-app leading-tight group-hover:text-accent transition-colors font-play">
                      {program.name}
                    </h3>
                    {isActive && (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border-accent/20 bg-accent/10 text-accent h-auto flex items-center"
                      >
                        <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-[13px] text-muted mt-2 leading-relaxed line-clamp-2">
                    {dayStrings || "No day tracks configured yet."}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-3 border-app/50 text-[11px] font-mono text-muted uppercase group-hover:text-muted">
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!program.is_active && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetActive(program.id);
                        }}
                        disabled={isPending}
                        size={"sm"}
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle04Icon}
                          size={11}
                          color="currentColor"
                          strokeWidth={2.5}
                        />
                        Set Active
                      </Button>
                    )}
                    {/* <ChevronRight className="w-5 h-5 text-muted group-hover:translate-x-1 transition-transform ml-1" /> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
