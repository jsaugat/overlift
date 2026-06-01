export type {
  ActiveProgram,
  ProgramDay,
  ProgramExercise,
} from "@/lib/actions/programs";
import type {
  ActiveProgram,
  ProgramDay,
  ProgramExercise,
} from "@/lib/actions/programs";

export function getTodayKey(program?: ActiveProgram): string {
  if (program && program.days && program.days.length) {
    const orderedDays = program.days
      .slice()
      .sort((a, b) => a.day_order - b.day_order);

    return orderedDays[0]?.name ?? "Rest";
  }

  return "Rest";
}

export function getProgramDay(
  program: ActiveProgram,
  dayName: string,
): ProgramDay | null {
  return program.days.find((day) => day.name === dayName) ?? null;
}

export function getExercisesForDay(
  program: ActiveProgram,
  dayName: string,
): ProgramExercise[] {
  const day = getProgramDay(program, dayName);

  if (!day) {
    return [];
  }

  return day.exercises.slice().sort((a, b) => a.position - b.position);
}
