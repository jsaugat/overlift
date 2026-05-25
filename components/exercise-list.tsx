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
  const [targetWeights, setTargetWeights] = useState<Record<string, number>>({});
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
      
      const [exRes, weightRes] = await Promise.all([
        supabase
          .from("exercises")
          .select("id,name,muscle_group,equipment,day_type")
          .eq("day_type", day.dbDayType)
          .order("name"),
        supabase.from("v_latest_weights").select("exercise, weight_kg")
      ]);

      if (!isMounted) return;
      
      if (exRes.error) {
        console.error("Failed to load exercises:", exRes.error);
        setDbExercises([]);
      } else {
        setDbExercises(exRes.data ?? []);
      }
      
      if (!weightRes.error && weightRes.data) {
        const weights: Record<string, number> = {};
        (weightRes.data as any[]).forEach((w) => {
          weights[w.exercise] = w.weight_kg;
        });
        setTargetWeights(weights);
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
    async (ex: ProgramExercise, idx: number, exerciseId?: number, setNumber: number = 1, setId?: string) => {
      const id = setId || `${day.key}-${idx}`;
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
            .insert({ session_date: today, day_type: day.dbDayType } as any)
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
          resolvedExerciseId = (exerciseRow as any).id;
        }

        // 3. Insert set
        await supabase.from("set_logs").insert({
          session_id: session!.id,
          exercise_id: resolvedExerciseId,
          set_number: setNumber,
          weight_kg: parseFloat(entry.weight),
          reps: parseInt(entry.reps),
        } as any);
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
      <div className="bg-app border border-app rounded-xl p-6 text-center">
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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-app flex-wrap gap-3">
        <div>
          <h2
            className="font-bebas text-[clamp(24px,4vw,32px)] tracking-[0.04em] uppercase"
            style={{ color: `var(--color-${day.type.toLowerCase()})` }}
          >
            {day.type} DAY
          </h2>
          <div className="flex items-center gap-[7px] text-[11px] text-muted font-mono mt-[8px]">
            <div
              className="w-[6px] h-[6px] rounded-full shrink-0"
              style={{
                backgroundColor: `var(--color-${day.type.toLowerCase()})`,
              }}
            ></div>
            {total} EXERCISES
          </div>
        </div>
        <div className="text-right">
          <div className="font-bebas text-[24px] text-accent">{pct}%</div>
          <div className="font-mono text-[10px] text-muted pb-[2px] uppercase">
            {loadingExercises ? "LOADING..." : "COMPLETED"}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-app2 -mt-[25px] mb-[24px] relative z-0">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: `var(--color-${day.type.toLowerCase()})`,
          }}
        />
      </div>

      {/* Exercises */}
      <div className="flex flex-col gap-4">
        {displayExercises.map((ex, i) => {
          const id = `${day.key}-${i}`;
          const isDone = !!checked[id];
          const entry = sets[id] ?? { weight: "", reps: "" };
          const isSaving = saving[id];

          return (
            <div
              key={id}
              className="bg-app2 border border-app px-6 py-6 flex gap-5 items-start"
            >
              {/* Check circle */}
              <button
                onClick={() => toggleChecked(id)}
                aria-checked={isDone}
                role="checkbox"
                className={cn(
                  "mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                  isDone ? "badge-pull border-pull" : "border-app2",
                )}
              >
                {isDone && (
                  <Check size={11} className="text-pull" strokeWidth={3} />
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

                {/* Interesting Sets Card */}
                {!isDone && (
                  <div className="mt-4 bg-[#141414] rounded-xl border border-app2 overflow-hidden">
                    {/* Table-like Header */}
                    <div className="flex items-center px-4 py-2 border-b border-app2 bg-[#181818]">
                      <div className="w-8 text-[10px] font-mono text-muted uppercase">Set</div>
                      <div className="flex-1 text-[10px] font-mono text-muted uppercase">Target</div>
                      <div className="w-14 text-[10px] font-mono text-muted uppercase text-center">kg</div>
                      <div className="w-14 text-[10px] font-mono text-muted uppercase text-center ml-2">Reps</div>
                      <div className="w-12 ml-2"></div>
                    </div>
                    
                    {/* Sets Rows */}
                    <div className="flex flex-col">
                      {Array.from({ length: parseInt(ex.sets) || 3 }).map((_, setIdx) => {
                        const setId = `${id}-${setIdx}`;
                        const setEntry = sets[setId] ?? { weight: "", reps: "" };
                        const isSetSaving = saving[setId];
                        const targetWeight = targetWeights[ex.name] ? `${targetWeights[ex.name]}kg` : '-';

                        return (
                          <div key={setId} className="flex items-center px-4 py-2.5 border-b border-app2/50 last:border-b-0">
                            <div className="w-8 text-xs font-mono text-app">{setIdx + 1}</div>
                            <div className="flex-1 flex flex-col text-[11px] text-muted">
                              <span>{ex.reps} reps</span>
                              <span className="text-[9px] text-faint">{targetWeight}</span>
                            </div>
                            <div className="w-14">
                              <input
                                type="number"
                                placeholder={targetWeights[ex.name]?.toString() ?? "-"}
                                value={setEntry.weight}
                                onChange={(e) => updateSet(setId, "weight", e.target.value)}
                                className="w-full text-center px-1 py-1.5 text-xs rounded-md border border-app2 bg-[#1a1a1a] text-app focus:outline-none focus:border-accent transition-colors"
                              />
                            </div>
                            <div className="w-14 ml-2">
                              <input
                                type="number"
                                placeholder={ex.reps.split("–")[0] ?? "-"}
                                value={setEntry.reps}
                                onChange={(e) => updateSet(setId, "reps", e.target.value)}
                                className="w-full text-center px-1 py-1.5 text-xs rounded-md border border-app2 bg-[#1a1a1a] text-app focus:outline-none focus:border-accent transition-colors"
                              />
                            </div>
                            <div className="w-12 ml-2 flex justify-end">
                              <button
                                onClick={() => saveToDb(ex, i, ex.id, setIdx + 1, setId)}
                                disabled={isSetSaving}
                                className={cn(
                                  "text-[10px] px-2 py-1.5 rounded transition-colors font-medium cursor-pointer w-full text-center disabled:opacity-50",
                                  isSetSaving 
                                    ? "bg-app2 text-faint" 
                                    : "bg-[#222] text-app hover:bg-[#333]"
                                )}
                              >
                                {isSetSaving ? "..." : "Log"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Rest Timer Button in footer */}
                    <div className="bg-[#181818] px-4 py-2.5 flex justify-end border-t border-app2">
                      <button
                         onClick={() => router.push("/timer")}
                        className="flex items-center gap-1.5 text-[11px] text-muted hover:text-app transition-colors"
                      >
                        <Timer size={12} />
                        Rest Timer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
