"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { ProgramDay, ProgramExercise } from "@/lib/program";
import { Moon } from "lucide-react";
import { useRouter } from "next/navigation";

interface SetEntry {
  weight: string;
  reps: string;
}

interface DbExercise {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string | null;
  day_type: string | null;
}

interface ExerciseListProps {
  day: ProgramDay;
}

type CheckedMap = Record<string, boolean>;
type SetsMap = Record<string, SetEntry>;

const LS_CHECKED = "overlift_checked";
const LS_SETS = "overlift_sets";

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function ExerciseList({ day }: ExerciseListProps) {
  const router = useRouter();
  const [checked, setChecked] = useState<CheckedMap>({});
  const [sets, setSets] = useState<SetsMap>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setChecked(loadLS(LS_CHECKED, {}));
    setSets(loadLS(LS_SETS, {}));
  }, []);

  // Load exercises from DB for the selected day
  useEffect(() => {
    let isMounted = true;
    async function loadExercises() {
      if (!day.dbDayType) return;
      setLoadingExercises(true);
      const { data, error } = await supabase
        .from("exercises")
        .select("id,name,muscle_group,equipment,day_type")
        .eq("day_type", day.dbDayType)
        .order("name");

      if (!isMounted) return;
      if (error) {
        console.error("Failed to load exercises:", error);
        setDbExercises([]);
      } else {
        setDbExercises(data ?? []);
      }
      setLoadingExercises(false);
    }

    loadExercises();
    return () => {
      isMounted = false;
    };
  }, [day.dbDayType]);

  const toggleChecked = useCallback((id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(LS_CHECKED, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateSet = useCallback(
    (id: string, field: "weight" | "reps", value: string) => {
      setSets((prev) => {
        const next = { ...prev, [id]: { ...prev[id], [field]: value } };
        localStorage.setItem(LS_SETS, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  /**
   * Persist a single set to Supabase.
   * Creates a workout_session for today if one doesn't exist, then upserts the set_log.
   */
  const saveToDb = useCallback(
    async (ex: ProgramExercise, idx: number, exerciseId?: number) => {
      const id = `${day.key}-${idx}`;
      const entry = sets[id];
      if (!entry?.weight || !entry?.reps) return;

      setSaving((p) => ({ ...p, [id]: true }));
      try {
        const today = new Date().toISOString().split("T")[0];

        // 1. Get or create today's session
        let { data: session } = await supabase
          .from("workout_sessions")
          .select("id")
          .eq("session_date", today)
          .eq("day_type", day.dbDayType)
          .maybeSingle();

        if (!session) {
          const { data: newSession, error } = await supabase
            .from("workout_sessions")
            .insert({ session_date: today, day_type: day.dbDayType })
            .select("id")
            .single();
          if (error) throw error;
          session = newSession;
        }

        // 2. Resolve exercise id when it was not provided by the DB list
        let resolvedExerciseId = exerciseId;
        if (!resolvedExerciseId) {
          const { data: exerciseRow } = await supabase
            .from("exercises")
            .select("id")
            .eq("name", ex.name)
            .maybeSingle();

          if (!exerciseRow) {
            console.warn("Exercise not found in DB:", ex.name);
            return;
          }
          resolvedExerciseId = exerciseRow.id;
        }

        // 3. Insert set (set_number = 1 per log entry from UI; a future enhancement could track multiple sets)
        await supabase.from("set_logs").insert({
          session_id: session.id,
          exercise_id: resolvedExerciseId,
          set_number: 1,
          weight_kg: parseFloat(entry.weight),
          reps: parseInt(entry.reps),
        });
      } catch (err) {
        console.error("Failed to save set:", err);
      } finally {
        setSaving((p) => ({ ...p, [id]: false }));
      }
    },
    [day, sets],
  );

  const programByName = useMemo(() => {
    return new Map(day.exercises.map((ex) => [ex.name.toLowerCase(), ex]));
  }, [day.exercises]);

  const displayExercises: Array<ProgramExercise & { id?: number }> =
    useMemo(() => {
      if (!dbExercises.length) return day.exercises;
      return dbExercises.map((dbEx) => {
        const match = programByName.get(dbEx.name.toLowerCase());
        return {
          id: dbEx.id,
          name: dbEx.name,
          sets: match?.sets ?? "3",
          reps: match?.reps ?? "10–12",
          muscle: match?.muscle ?? dbEx.muscle_group,
          tip: match?.tip,
        };
      });
    }, [dbExercises, day.exercises, programByName]);

  if (day.type === "Rest" || day.type === "Closed") {
    const msg =
      day.type === "Closed"
        ? "Gym closed on Saturdays. Rest, recover, and hit your protein target."
        : "Rest day — prioritise sleep, light walking, and your protein.";
    return (
      <div className="bg-app border border-[rgb(var(--border))] rounded-xl p-6 text-center">
        <Moon className="mx-auto mb-2 text-muted" size={28} />
        <p className="text-sm text-muted">{msg}</p>
      </div>
    );
  }

  const total = displayExercises.length;
  const done = displayExercises.filter(
    (_, i) => checked[`${day.key}-${i}`],
  ).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-app border border-[rgb(var(--border))] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))]">
        <span
          className={cn(
            "text-[11px] font-medium px-2.5 py-1 rounded-lg",
            day.badgeClass,
          )}
        >
          {day.type} day
        </span>
        <span className="text-xs text-muted">
          {loadingExercises ? "Loading…" : `${done}/${total} done · ${pct}%`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-app3">
        <div
          className="h-full bg-[rgb(var(--blue))] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Exercises */}
      <div className="divide-y divide-[rgb(var(--border))]">
        {displayExercises.map((ex, i) => {
          const id = `${day.key}-${i}`;
          const isDone = !!checked[id];
          const entry = sets[id] ?? { weight: "", reps: "" };
          const isSaving = saving[id];

          return (
            <div key={id} className="flex gap-3 px-4 py-3 items-start">
              {/* Check circle */}
              <button
                onClick={() => toggleChecked(id)}
                aria-checked={isDone}
                role="checkbox"
                className={cn(
                  "mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                  isDone
                    ? "bg-[rgb(var(--green-bg))] border-[rgb(var(--green))]"
                    : "border-[rgb(var(--border2))]",
                )}
              >
                {isDone && (
                  <Check
                    size={11}
                    className="text-[rgb(var(--green))]"
                    strokeWidth={3}
                  />
                )}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm font-medium text-app",
                    isDone && "line-through text-faint",
                  )}
                >
                  {ex.name}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {ex.sets} sets · {ex.reps} reps
                </div>
                <div className="text-[11px] text-faint mt-0.5 italic">
                  {ex.muscle}
                  {ex.tip && ` · ${ex.tip}`}
                </div>

                {/* Inline log inputs */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <label className="text-[11px] text-muted">Weight</label>
                  <input
                    type="number"
                    placeholder="kg"
                    value={entry.weight}
                    onChange={(e) => updateSet(id, "weight", e.target.value)}
                    className="w-16 px-2 py-1 text-xs rounded-lg border border-[rgb(var(--border2))] bg-app2 text-app"
                  />
                  <label className="text-[11px] text-muted">Reps</label>
                  <input
                    type="number"
                    placeholder={ex.reps.split("–")[0] ?? "10"}
                    value={entry.reps}
                    onChange={(e) => updateSet(id, "reps", e.target.value)}
                    className="w-16 px-2 py-1 text-xs rounded-lg border border-[rgb(var(--border2))] bg-app2 text-app"
                  />
                  <button
                    onClick={() => saveToDb(ex, i, ex.id)}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg border border-[rgb(var(--border))] text-muted hover:bg-app2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : "Log"}
                  </button>
                  <button
                    onClick={() => router.push("/timer")}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg border border-[rgb(var(--border))] text-muted hover:bg-app2 transition-colors cursor-pointer"
                  >
                    <Timer size={11} />
                    Rest
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
