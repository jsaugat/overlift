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
    const today = new Date().getDay(); // 0-6
    const startingDay = program.starting_day ?? 0;
    const offset = (today - startingDay + 7) % 7;
    const activeDayOrder = offset + 1; // because day_order starts at 1

    const todayDay = program.days.find((day) => day.day_order === activeDayOrder);
    return todayDay?.name ?? "Rest";
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
