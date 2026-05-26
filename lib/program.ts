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

const DOW_DAY_TYPE_MAP: string[] = [
  "push", // 0 = Sunday
  "pull", // 1 = Monday
  "legs", // 2 = Tuesday
  "rest", // 3 = Wednesday
  "upper", // 4 = Thursday
  "lower", // 5 = Friday
  "rest", // 6 = Saturday
];
export function getTodayKey(): string {
  return DOW_DAY_TYPE_MAP[new Date().getDay()] ?? "rest";
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
