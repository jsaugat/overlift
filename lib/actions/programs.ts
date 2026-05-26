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
  day_type: string;
  name: string | null;
  exercises: ProgramExercise[];
}

export interface ActiveProgram {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  days: ProgramDay[];
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
  day_type: string;
  name: string | null;
  template_exercises: TemplateExerciseRow[] | null;
}

interface TemplateRow {
  id: number;
  name: string;
  description: string | null;
  template_days: TemplateDayRow[] | null;
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
        "id, name, description, template_days ( id, day_order, day_type, name, template_exercises ( exercise_id, position, sets, rep_min, rep_max ) )",
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
      })
      .select("id")
      .single();

    if (programError || !userProgram) {
      console.error("Failed to create user program", programError);
      return null;
    }

    for (const day of templateDays) {
      const { data: userDay, error: dayError } = await supabase
        .from("user_program_days")
        .insert({
          user_program_id: userProgram.id,
          user_id: userId,
          day_order: day.day_order,
          day_type: day.day_type,
          name: day.name,
        })
        .select("id")
        .single();

      if (dayError || !userDay) {
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
            user_program_day_id: userDay.id,
            user_id: userId,
            exercise_id: exercise.exercise_id,
            position: exercise.position,
            sets: exercise.sets,
            rep_min: exercise.rep_min,
            rep_max: exercise.rep_max,
          });

        if (exerciseError) {
          console.error("Failed to create program exercise", exerciseError);
          return null;
        }
      }
    }

    return userProgram.id;
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
        "id, name, is_active, created_at, user_program_days ( id, day_order, day_type, name, user_program_exercises ( id, exercise_id, position, sets, rep_min, rep_max, exercises ( id, name, muscle_group, equipment ) ) )",
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch active program", error);
      return null;
    }

    if (!data) {
      return null;
    }

    const orderedDays = (data.user_program_days ?? []).slice().sort((a, b) => {
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
        day_type: day.day_type,
        name: day.name,
        exercises,
      };
    });

    return {
      id: data.id,
      name: data.name,
      is_active: data.is_active,
      created_at: data.created_at,
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
