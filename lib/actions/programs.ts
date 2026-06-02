// Good output. One issue to flag before moving on:
// The for loop inserts are sequential — it inserts each day one at a time, and each exercise one at a time. For a 5-day program with ~30 exercises that's 35+ round trips to Supabase. It works but it's slow. Not a blocker now, but note it for a future refactor using batch inserts.
// Everything else looks correct — types are clean, error handling is consistent, the logic flow is right.

"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface ProgramExercise {
  id: number;
  exercise_id: number;
  position: number;
  sets: number | null;
  rep_min: number | null;
  rep_max: number | null;
  exercise: {
    id: number;
    name: string;
    muscle_group: string;
    equipment: string | null;
  };
}

export interface ProgramDay {
  id: number;
  day_order: number;
  name: string;
  exercises: ProgramExercise[];
}

export interface ActiveProgram {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  starting_day: number;
  days: ProgramDay[];
}

export interface UserProgramDaySummary {
  id: number;
  day_order: number;
  name: string;
}

export interface UserProgramSummary {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  starting_day: number;
  days: UserProgramDaySummary[];
}

interface NewProgramDayInput {
  day_order: number;
  name: string;
}

interface TemplateExerciseRow {
  exercise_id: number;
  position: number;
  sets: number | null;
  rep_min: number | null;
  rep_max: number | null;
}

interface TemplateDayRow {
  id: number;
  day_order: number;
  name: string;
  template_exercises: TemplateExerciseRow[] | null;
}

interface TemplateRow {
  id: number;
  name: string;
  description: string | null;
  template_days: TemplateDayRow[] | null;
}

interface ActiveProgramQueryExercise {
  id: number;
  exercise_id: number;
  position: number;
  sets: number | null;
  rep_min: number | null;
  rep_max: number | null;
  exercises: {
    id: number;
    name: string;
    muscle_group: string;
    equipment: string | null;
  } | null;
}

interface ActiveProgramQueryDay {
  id: number;
  day_order: number;
  name: string;
  user_program_exercises: ActiveProgramQueryExercise[] | null;
}

interface ActiveProgramQueryRow {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  starting_day: number;
  user_program_days: ActiveProgramQueryDay[] | null;
}

interface UserProgramListQueryRow {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  starting_day: number;
  user_program_days: UserProgramDaySummary[] | null;
}

export async function importTemplateForUser(
  userId: string,
  templateName: string,
): Promise<number | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: existingProgram, error: existingError } = await supabase
      .from("user_programs")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error("Failed to check existing programs", existingError);
      return null;
    }

    if (existingProgram) {
      return null;
    }

    const { data: template, error: templateError } = await supabase
      .from("program_templates")
      .select(
        "id, name, description, template_days ( id, day_order, name, template_exercises ( exercise_id, position, sets, rep_min, rep_max ) )",
      )
      .eq("name", templateName)
      .maybeSingle();

    if (templateError || !template) {
      console.error("Failed to load template", templateError);
      return null;
    }

    const templateData = template as TemplateRow;
    const templateDays = (templateData.template_days ?? [])
      .slice()
      .sort((a, b) => {
        return a.day_order - b.day_order;
      });

    const { data: userProgram, error: programError } = await supabase
      .from("user_programs")
      .insert({
        user_id: userId,
        name: templateData.name,
        is_active: true,
      } as any)
      .select("id")
      .single();

    const createdProgram = userProgram as unknown as { id: number } | null;

    if (programError || !createdProgram) {
      console.error("Failed to create user program", programError);
      return null;
    }

    for (const day of templateDays) {
      const { data: userDay, error: dayError } = await supabase
        .from("user_program_days")
        .insert({
          user_program_id: createdProgram.id,
          user_id: userId,
          day_order: day.day_order,
          name: day.name,
        } as any)
        .select("id")
        .single();

      const createdDay = userDay as unknown as { id: number } | null;

      if (dayError || !createdDay) {
        console.error("Failed to create program day", dayError);
        return null;
      }

      const dayExercises = (day.template_exercises ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);

      for (const exercise of dayExercises) {
        const { error: exerciseError } = await supabase
          .from("user_program_exercises")
          .insert({
            user_program_day_id: createdDay.id,
            user_id: userId,
            exercise_id: exercise.exercise_id,
            position: exercise.position,
            sets: exercise.sets,
            rep_min: exercise.rep_min,
            rep_max: exercise.rep_max,
          } as any);

        if (exerciseError) {
          console.error("Failed to create program exercise", exerciseError);
          return null;
        }
      }
    }

    return createdProgram.id;
  } catch (error) {
    console.error("Unexpected error importing template", error);
    return null;
  }
}

export async function getActiveProgram(
  userId: string,
): Promise<ActiveProgram | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_programs")
      .select(
        "id, name, is_active, created_at, starting_day, user_program_days ( id, day_order, name, user_program_exercises ( id, exercise_id, position, sets, rep_min, rep_max, exercises ( id, name, muscle_group, equipment ) ) )",
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch active program", error);
      return null;
    }

    const programData = data as unknown as ActiveProgramQueryRow | null;

    if (!programData) {
      return null;
    }

    const orderedDays = (programData.user_program_days ?? [])
      .slice()
      .sort((a, b) => {
        return a.day_order - b.day_order;
      });

    const days: ProgramDay[] = orderedDays.map((day) => {
      const orderedExercises = (day.user_program_exercises ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);

      const exercises: ProgramExercise[] = orderedExercises.map((exercise) => {
        return {
          id: exercise.id,
          exercise_id: exercise.exercise_id,
          position: exercise.position,
          sets: exercise.sets,
          rep_min: exercise.rep_min,
          rep_max: exercise.rep_max,
          exercise: {
            id: exercise.exercises?.id ?? exercise.exercise_id,
            name: exercise.exercises?.name ?? "",
            muscle_group: exercise.exercises?.muscle_group ?? "",
            equipment: exercise.exercises?.equipment ?? null,
          },
        };
      });

      return {
        id: day.id,
        day_order: day.day_order,
        name: day.name,
        exercises,
      };
    });

    return {
      id: programData.id,
      name: programData.name,
      is_active: programData.is_active,
      created_at: programData.created_at,
      starting_day: programData.starting_day ?? 0,
      days,
    };
  } catch (error) {
    console.error("Unexpected error fetching active program", error);
    return null;
  }
}

export async function ensureUserHasProgram(
  userId: string,
): Promise<ActiveProgram | null> {
  const activeProgram = await getActiveProgram(userId);

  if (activeProgram) {
    return activeProgram;
  }

  try {
    await importTemplateForUser(userId, "Lean Bulk PPL + Upper/Lower");
  } catch (error) {
    console.error("Unexpected error ensuring program", error);
  }

  return await getActiveProgram(userId);
}

export async function getUserPrograms(
  userId: string,
): Promise<UserProgramSummary[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_programs")
    .select(
      "id, name, is_active, created_at, starting_day, user_program_days ( id, day_order, name )",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const programRows = (data ?? []) as unknown as UserProgramListQueryRow[];

  return programRows.map((program) => {
    const days = (program.user_program_days ?? [])
      .slice()
      .sort((a, b) => a.day_order - b.day_order)
      .map((day) => ({
        id: day.id,
        day_order: day.day_order,
        name: day.name,
      }));

    return {
      id: program.id,
      name: program.name,
      is_active: program.is_active,
      created_at: program.created_at,
      starting_day: program.starting_day ?? 0,
      days,
    };
  });
}

export async function setActiveProgram(
  userId: string,
  programId: number,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { error: resetError } = await (supabase.from("user_programs") as any)
    .update({ is_active: false })
    .eq("user_id", userId);

  if (resetError) {
    throw resetError;
  }

  const { data, error: activateError } = await (
    supabase.from("user_programs") as any
  )
    .update({ is_active: true })
    .eq("user_id", userId)
    .eq("id", programId)
    .select("id")
    .maybeSingle();

  if (activateError) {
    throw activateError;
  }

  return !!data;
}

export async function createUserProgram(
  userId: string,
  name: string,
  days: NewProgramDayInput[],
): Promise<number> {
  const supabase = await createSupabaseServerClient();

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Program name is required");
  }

  if (!days.length) {
    throw new Error("At least one day is required");
  }

  const { data: program, error: programError } = await supabase
    .from("user_programs")
    .insert({
      user_id: userId,
      name: trimmedName,
      is_active: false,
    } as any)
    .select("id")
    .single();

  const createdProgram = program as unknown as { id: number } | null;

  if (programError || !createdProgram) {
    throw programError ?? new Error("Failed to create program");
  }

  const dayRows = days.map((day) => ({
    user_program_id: createdProgram.id,
    user_id: userId,
    day_order: day.day_order,
    name: day.name,
  }));

  const { error: dayError } = await supabase
    .from("user_program_days")
    .insert(dayRows as any);

  if (dayError) {
    throw dayError;
  }

  return createdProgram.id;
}

export async function deleteUserProgram(
  userId: string,
  programId: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: programs, error: listError } = await supabase
    .from("user_programs")
    .select("id, is_active")
    .eq("user_id", userId);

  if (listError) {
    return { success: false, error: "Failed to check programs" };
  }

  const userPrograms = (programs ?? []) as Array<{
    id: number;
    is_active: boolean;
  }>;
  if (userPrograms.length <= 1) {
    return { success: false, error: "Cannot delete your only program" };
  }

  const target = userPrograms.find((program) => program.id === programId);
  if (!target) {
    return { success: false, error: "Program not found" };
  }

  if (target.is_active) {
    return { success: false, error: "Cannot delete active program" };
  }

  const { error: deleteError } = await supabase
    .from("user_programs")
    .delete()
    .eq("user_id", userId)
    .eq("id", programId);

  if (deleteError) {
    return { success: false, error: "Failed to delete program" };
  }

  return { success: true };
}

export async function getProgramWithExercises(
  userId: string,
  programId: number,
): Promise<ActiveProgram | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_programs")
      .select(
        "id, name, is_active, created_at, starting_day, user_program_days ( id, day_order, name, user_program_exercises ( id, exercise_id, position, sets, rep_min, rep_max, exercises ( id, name, muscle_group, equipment ) ) )",
      )
      .eq("user_id", userId)
      .eq("id", programId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch program", error);
      return null;
    }

    const programData = data as unknown as ActiveProgramQueryRow | null;

    if (!programData) {
      return null;
    }

    const orderedDays = (programData.user_program_days ?? [])
      .slice()
      .sort((a, b) => a.day_order - b.day_order);

    const days: ProgramDay[] = orderedDays.map((day) => {
      const orderedExercises = (day.user_program_exercises ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);

      const exercises: ProgramExercise[] = orderedExercises.map((exercise) => ({
        id: exercise.id,
        exercise_id: exercise.exercise_id,
        position: exercise.position,
        sets: exercise.sets,
        rep_min: exercise.rep_min,
        rep_max: exercise.rep_max,
        exercise: {
          id: exercise.exercises?.id ?? exercise.exercise_id,
          name: exercise.exercises?.name ?? "",
          muscle_group: exercise.exercises?.muscle_group ?? "",
          equipment: exercise.exercises?.equipment ?? null,
        },
      }));

      return {
        id: day.id,
        day_order: day.day_order,
        name: day.name,
        exercises,
      };
    });

    return {
      id: programData.id,
      name: programData.name,
      is_active: programData.is_active,
      created_at: programData.created_at,
      starting_day: programData.starting_day ?? 0,
      days,
    };
  } catch (error) {
    console.error("Unexpected error fetching program", error);
    return null;
  }
}

export async function addExerciseToDay(
  userId: string,
  dayId: number,
  exerciseId: number,
  sets: number = 3,
  repMin: number = 8,
  repMax: number = 12,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  // Get current max position for the day
  const { data: existing, error: fetchError } = await supabase
    .from("user_program_exercises")
    .select("position")
    .eq("user_program_day_id", dayId)
    .order("position", { ascending: false })
    .limit(1);

  if (fetchError) {
    return { success: false, error: "Failed to fetch exercises" };
  }

  const maxPosition =
    existing && existing.length > 0
      ? (existing[0] as { position: number }).position
      : 0;

  const { error: insertError } = await supabase
    .from("user_program_exercises")
    .insert({
      user_program_day_id: dayId,
      user_id: userId,
      exercise_id: exerciseId,
      position: maxPosition + 1,
      sets,
      rep_min: repMin,
      rep_max: repMax,
    } as any);

  if (insertError) {
    return { success: false, error: "Failed to add exercise" };
  }

  return { success: true };
}

export async function removeExerciseFromDay(
  userId: string,
  exerciseRowId: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("user_program_exercises")
    .delete()
    .eq("id", exerciseRowId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: "Failed to remove exercise" };
  }

  return { success: true };
}

export async function updateExerciseSettings(
  userId: string,
  exerciseRowId: number,
  sets: number,
  repMin: number,
  repMax: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await (supabase.from("user_program_exercises") as any)
    .update({ sets, rep_min: repMin, rep_max: repMax })
    .eq("id", exerciseRowId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: "Failed to update exercise" };
  }

  return { success: true };
}

export async function createCustomExercise(
  userId: string,
  name: string,
  muscleGroup: string,
  equipment: string,
): Promise<{ success: boolean; exerciseId?: number; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "Exercise name is required" };
  }

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      name: trimmedName.toLowerCase(),
      muscle_group: muscleGroup || null,
      equipment: equipment || "bodyweight",
      source: "custom",
      user_id: userId,
    } as any)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: "Failed to create exercise" };
  }

  const created = data as unknown as { id: number } | null;
  return { success: true, exerciseId: created?.id };
}
