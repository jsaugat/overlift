"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createUserProgram,
  deleteUserProgram,
  setActiveProgram,
  type UserProgramSummary,
} from "@/lib/actions/programs";
import { cn } from "@/lib/utils";

type DayType = "push" | "pull" | "legs" | "upper" | "lower" | "rest";

interface DayBuilderItem {
  name: string;
  day_type: DayType;
}

interface ProgramsClientProps {
  userId: string;
  programs: UserProgramSummary[];
}

const DAY_TYPE_OPTIONS: DayType[] = [
  "push",
  "pull",
  "legs",
  "upper",
  "lower",
  "rest",
];

function buildDayName(dayType: string): string {
  return dayType.charAt(0).toUpperCase() + dayType.slice(1);
}

export function ProgramsClient({ userId, programs }: ProgramsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [programName, setProgramName] = useState("");
  const [days, setDays] = useState<DayBuilderItem[]>([
    { name: buildDayName("push"), day_type: "push" },
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
        day_type: "push",
        name: buildDayName("push"),
      },
    ]);
  };

  const removeDay = (index: number) => {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDay = (
    index: number,
    field: keyof DayBuilderItem,
    value: string,
  ) => {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== index) return day;

        const updated = { ...day, [field]: value };

        if (field === "day_type") {
          updated.name = buildDayName(value);
        }

        return updated;
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
        days.map((day, index) => ({
          day_order: index + 1,
          day_type: day.day_type,
          name: buildDayName(day.day_type),
        })),
      );
      setShowForm(false);
      setProgramName("");
      setDays([{ name: buildDayName("push"), day_type: "push" }]);
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
          <p className="text-sm text-muted mb-4">
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
                className="px-2 py-1 text-[11px] rounded-md border border-app2 text-app hover:bg-app2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add day
              </button>
            </div>

            {days.map((day, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:items-center"
              >
                <div className="sm:col-span-5">
                  <select
                    value={day.day_type}
                    onChange={(e) =>
                      updateDay(index, "day_type", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-app2 bg-app2 text-app"
                  >
                    {DAY_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-5 px-2 py-1.5 text-sm rounded-lg border border-app2 bg-app2 text-muted">
                  {day.name}
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    onClick={() => removeDay(index)}
                    disabled={days.length <= 1}
                    className="px-2 py-1 text-[11px] rounded-md border border-app2 text-muted hover:text-app hover:bg-app2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCreateProgram}
              disabled={isPending}
              className="px-4 py-1.5 text-sm rounded-lg border border-app2 text-app hover:bg-app2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? "Saving..." : "Create Program"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 text-sm rounded-lg border border-app2 text-muted hover:text-app hover:bg-app2 transition-colors cursor-pointer"
            >
              Cancel
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
                "bg-app border rounded-xl p-4",
                isActive ? "border-accent" : "border-app",
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-medium text-app">
                    {program.name}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {program.days.length} day
                    {program.days.length === 1 ? "" : "s"}
                  </p>
                </div>
                {program.is_active && (
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-accent/50 text-accent">
                    Active
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSetActive(program.id)}
                  disabled={program.is_active || isPending}
                  className="px-3 py-1.5 text-xs rounded-lg border border-app2 text-app hover:bg-app2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Set Active
                </button>

                <Link
                  href={`/programs/${program.id}`}
                  className="px-3 py-1.5 text-xs rounded-lg border border-app2 text-app hover:bg-app2 transition-colors"
                >
                  View / Edit
                </Link>

                {!program.is_active && !onlyOneProgram && (
                  <button
                    onClick={() => handleDelete(program.id)}
                    disabled={isPending}
                    className="px-3 py-1.5 text-xs rounded-lg border border-app2 text-muted hover:text-app hover:bg-app2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
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
