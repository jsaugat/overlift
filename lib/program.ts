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

    return orderedDays[0]?.day_type ?? "rest";
  }

  return "rest";
}

export function getProgramDay(
  program: ActiveProgram,
  dayType: string,
): ProgramDay | null {
  return program.days.find((day) => day.day_type === dayType) ?? null;
}

export function getExercisesForDay(
  program: ActiveProgram,
  dayType: string,
): ProgramExercise[] {
  const day = getProgramDay(program, dayType);

  if (!day) {
    return [];
  }

  return day.exercises.slice().sort((a, b) => a.position - b.position);
}
