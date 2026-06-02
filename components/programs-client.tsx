"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle04Icon, ViewIcon } from "@hugeicons/core-free-icons";
import {
  createUserProgram,
  deleteUserProgram,
  setActiveProgram,
  type UserProgramSummary,
} from "@/lib/actions/programs";
import { cn } from "@/lib/utils";

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
      refreshAfterAction();
    } catch {
      setError("Could not delete program. Please try again.");
    }
  };

  const handleCreateProgram = async () => {
    setError(null);

    const trimmedName = programName.trim();
    if (!trimmedName) {
      setError("Program name is required.");
      return;
    }

    try {
      await createUserProgram(
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
      setShowForm(false);
      setProgramName("");
      setDays([{ id: crypto.randomUUID(), name: "Push" }]);
      refreshAfterAction();
    } catch {
      setError("Could not create program. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="sm:flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium tracking-[0.04em] uppercase text-app">
            Programs
          </h2>
          <p className="text-muted mb-4">
            Create and manage your training programs.
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setShowForm((prev) => !prev);
          }}
          className="w-full md:w-fit px-3 py-1.5 rounded-lg border border-app2 text-app hover:bg-app2 transition-colors cursor-pointer"
        >
          + New Program
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-app border border-app rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1">
              Program name
            </label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="My Program"
              className="w-full px-3 py-2 text-sm rounded-lg border border-app2 bg-app2 text-app"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted uppercase">
                Days ({days.length}/7)
              </p>
              <button
                onClick={addDay}
                disabled={days.length >= 7}
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-md border border-app2 text-app hover:bg-app2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add day
              </button>
            </div>

            {days.map((day, index) => (
              <div
                key={day.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-start"
              >
                <div className="flex-1 flex flex-col gap-1.5">
                  <input
                    type="text"
                    value={day.name}
                    onChange={(e) => updateDay(index, e.target.value)}
                    placeholder="Day Name (e.g. Chest + Triceps)"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-app2 bg-app2 text-app"
                  />
                  {!day.name.trim() && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
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
                <div className="flex justify-end sm:mt-1">
                  <button
                    onClick={() => removeDay(index)}
                    disabled={days.length <= 1}
                    className="flex items-center gap-1.5 px-2 py-1 text-[11px] border border-neutral-900/30 text-neutral-500/80 hover:text-neutral-500 hover:bg-neutral-500/10 hover:border-neutral-900/50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove Day
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1 ml-auto w-fit">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 text-sm rounded-lg border border-app2 text-muted hover:bg-app2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProgram}
              disabled={isPending}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-accent text-[#0a0a0a] hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? "Saving..." : "Create Program"}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {programs.map((program) => {
          const isActive = program.id === activeProgramId;

          return (
            <div
              key={program.id}
              className={cn(
                "group relative border rounded-xl p-4 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                isActive
                  ? "bg-accent/5 border-accent/40 shadow-[0_0_20px_-5px_rgba(200,255,0,0.1)]"
                  : "bg-app border-app",
              )}
            >
              {/* {isActive && (
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              )} */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-medium text-app leading-tight">
                    {program.name}
                  </h3>
                  {program.is_active && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-accent/20 bg-accent/10 text-accent">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1">
                  {program.days.length} day
                  {program.days.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {!program.is_active && (
                  <button
                    onClick={() => handleSetActive(program.id)}
                    disabled={isPending}
                    className="px-3 py-1.5 flex items-center gap-1 text-xs rounded-lg font-medium border border-app2 text-accent hover:bg-app2 transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={CheckmarkCircle04Icon}
                      size={14}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    Set Active
                  </button>
                )}

                <Link
                  href={`/programs/${program.id}`}
                  className="px-3 py-1.5 flex items-center gap-1 text-xs rounded-lg border border-app2 text-app hover:bg-app2 transition-colors"
                >
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={14}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  View / Edit
                </Link>

                {!program.is_active && !onlyOneProgram && (
                  <button
                    onClick={() => handleDelete(program.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-2 py-1 text-[11px] border border-red-900/30 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 hover:border-red-900/50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
