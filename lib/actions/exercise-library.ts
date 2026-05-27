"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const EXERCISE_DB_URL = "https://oss.exercisedb.dev/api/v1/exercises";
const BATCH_SIZE = 100;

type ExerciseDbItem = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
};

type ExerciseInsert = {
  name: string;
  muscle_group: string | null;
  equipment: string;
  day_type: string | null;
  source: string;
  user_id: string | null;
  instructions: string;
  difficulty: string | null;
  safety_info: string | null;
};

/**
 * Split an array into fixed-size chunks to keep insert payloads small.
 */
function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Map ExerciseDB payload fields into the local exercises schema shape.
 */
function toExerciseInsert(item: ExerciseDbItem): ExerciseInsert {
  const name = item.name.trim().toLowerCase();
  const muscle = item.targetMuscles?.[0] ?? item.bodyParts?.[0] ?? null;
  const equipment = item.equipments?.[0] ?? "bodyweight";
  const instructions = (item.instructions ?? []).join(" ").trim();

  return {
    name,
    muscle_group: muscle,
    equipment,
    day_type: null,
    source: "exercisedb",
    user_id: null,
    instructions,
    difficulty: null,
    safety_info: null,
  };
}

/**
 * Fetch the ExerciseDB catalog and upsert it into the shared exercises table.
 * Uses name as a unique key and ignores duplicates on conflict.
 */
export async function seedExerciseLibrary(): Promise<{
  inserted: number;
  skipped: number;
}> {
  const response = await fetch(EXERCISE_DB_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.status}`);
  }

  const payload = (await response.json()) as ExerciseDbItem[];
  const rows = payload.map(toExerciseInsert);
  const chunks = chunkArray(rows, BATCH_SIZE);

  const supabase = await createSupabaseServerClient();

  let inserted = 0;
  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from("exercises")
      .upsert(chunk, {
        onConflict: "name",
        ignoreDuplicates: true,
      })
      .select("id");

    if (error) {
      throw error;
    }

    inserted += data?.length ?? 0;
  }

  return { inserted, skipped: rows.length - inserted };
}

/**
 * Check if any ExerciseDB records exist in the exercises table.
 */
export async function isExerciseLibrarySeeded(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("exercises")
    .select("id", { count: "exact", head: true })
    .eq("source", "exercisedb");

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
}

/**
 * Search exercises by name or muscle group, scoping results to
 * shared rows or the current user when authenticated.
 */
export async function searchExercises(query: string): Promise<
  {
    id: number;
    name: string;
    muscle_group: string | null;
    equipment: string | null;
    source: string | null;
    instructions: string | null;
  }[]
> {
  const term = query.trim();
  if (!term) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let exerciseQuery = supabase
    .from("exercises")
    .select("id, name, muscle_group, equipment, source, instructions")
    .or(`name.ilike.%${term}%,muscle_group.ilike.%${term}%`)
    .limit(20);

  if (user?.id) {
    exerciseQuery = exerciseQuery.or(`user_id.is.null,user_id.eq.${user.id}`);
  } else {
    exerciseQuery = exerciseQuery.is("user_id", null);
  }

  const { data, error } = await exerciseQuery;
  if (error) {
    throw error;
  }

  return data ?? [];
}
