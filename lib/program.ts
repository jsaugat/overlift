export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type DayType =
  | "Push"
  | "Pull"
  | "Legs"
  | "Upper"
  | "Lower"
  | "Rest"
  | "Closed";

export interface ProgramExercise {
  name: string;
  sets: string;
  reps: string;
  muscle: string;
  tip?: string;
}

export interface ProgramDay {
  key: DayKey;
  label: string;
  type: DayType;
  badgeClass: string;
  dbDayType: string; // matches exercises.day_type
  exercises: ProgramExercise[];
}

export const PROGRAM: ProgramDay[] = [
  {
    key: "sun",
    label: "Sun",
    type: "Push",
    badgeClass: "badge-push",
    dbDayType: "push",
    exercises: [
      {
        name: "Smith machine incline press",
        sets: "4",
        reps: "8–10",
        muscle: "Upper chest, front delt",
        tip: "Control the eccentric, 2s down",
      },
      {
        name: "Iso-lateral incline chest press",
        sets: "3",
        reps: "10–12",
        muscle: "Upper chest",
      },
      {
        name: "Pec deck fly",
        sets: "3",
        reps: "12–15",
        muscle: "Inner chest, chest peak",
      },
      {
        name: "Smith machine OHP (seated)",
        sets: "4",
        reps: "8–10",
        muscle: "Front & mid delt, traps",
        tip: "Key for shoulder width",
      },
      {
        name: "Dumbbell lateral raises",
        sets: "4",
        reps: "15–20",
        muscle: "Mid delt — width builder",
        tip: "Priority #1 for V-taper",
      },
      {
        name: "Cable lateral raises",
        sets: "3",
        reps: "15–20",
        muscle: "Mid delt (constant tension)",
      },
      {
        name: "Cable tricep pushdown",
        sets: "3",
        reps: "12–15",
        muscle: "Triceps",
      },
      {
        name: "Overhead dumbbell extension",
        sets: "3",
        reps: "12–15",
        muscle: "Long head tricep",
      },
    ],
  },
  {
    key: "mon",
    label: "Mon",
    type: "Pull",
    badgeClass: "badge-pull",
    dbDayType: "pull",
    exercises: [
      {
        name: "Lat pulldown (wide grip)",
        sets: "4",
        reps: "8–10",
        muscle: "Lat width — priority",
        tip: "Lead with elbows, not hands",
      },
      {
        name: "Lat pulldown (close/neutral)",
        sets: "3",
        reps: "10–12",
        muscle: "Lat thickness",
      },
      {
        name: "Machine row",
        sets: "4",
        reps: "10–12",
        muscle: "Mid back, rhomboids",
      },
      {
        name: "Cable seated row (wide)",
        sets: "3",
        reps: "12–15",
        muscle: "Upper back, rear delt",
      },
      {
        name: "Face pulls (cable)",
        sets: "3",
        reps: "15–20",
        muscle: "Rear delt, external rotation",
        tip: "Crucial for shoulder health",
      },
      {
        name: "Dumbbell bicep curl",
        sets: "3",
        reps: "10–12",
        muscle: "Biceps",
      },
      {
        name: "Hammer curl",
        sets: "3",
        reps: "10–12",
        muscle: "Brachialis, forearms",
      },
    ],
  },
  {
    key: "tue",
    label: "Tue",
    type: "Legs",
    badgeClass: "badge-legs",
    dbDayType: "legs",
    exercises: [
      {
        name: "Leg press",
        sets: "4",
        reps: "10–12",
        muscle: "Quads, glutes",
        tip: "Feet shoulder-width, full ROM",
      },
      {
        name: "Smith machine squat",
        sets: "4",
        reps: "8–10",
        muscle: "Quads, glutes, core",
      },
      {
        name: "Leg extension",
        sets: "3",
        reps: "12–15",
        muscle: "Quad isolation",
      },
      {
        name: "Leg curl (lying/seated)",
        sets: "3",
        reps: "12–15",
        muscle: "Hamstrings",
      },
      {
        name: "Adductor machine",
        sets: "3",
        reps: "15–20",
        muscle: "Inner thigh",
      },
      {
        name: "Abductor machine",
        sets: "3",
        reps: "15–20",
        muscle: "Glute med, outer thigh",
      },
      {
        name: "Calf raise machine",
        sets: "4",
        reps: "15–20",
        muscle: "Gastrocnemius, soleus",
        tip: "Full stretch at bottom",
      },
      { name: "Incline sit-up", sets: "3", reps: "15–20", muscle: "Core, abs" },
    ],
  },
  {
    key: "wed",
    label: "Wed",
    type: "Rest",
    badgeClass: "badge-rest",
    dbDayType: "rest",
    exercises: [],
  },
  {
    key: "thu",
    label: "Thu",
    type: "Upper",
    badgeClass: "badge-upper",
    dbDayType: "upper",
    exercises: [
      {
        name: "Smith machine flat bench press",
        sets: "4",
        reps: "8–10",
        muscle: "Chest, front delt, tricep",
      },
      {
        name: "Incline dumbbell press",
        sets: "3",
        reps: "10–12",
        muscle: "Upper chest",
      },
      { name: "Lat pulldown", sets: "4", reps: "10–12", muscle: "Lats" },
      { name: "Dumbbell row", sets: "3", reps: "10–12", muscle: "Mid back" },
      {
        name: "Dumbbell lateral raises",
        sets: "4",
        reps: "15–20",
        muscle: "Mid delt",
        tip: "Never skip — V-taper builder",
      },
      {
        name: "Rear delt fly (cable or DB)",
        sets: "3",
        reps: "15",
        muscle: "Rear delt",
      },
      { name: "EZ-bar or DB curl", sets: "3", reps: "10–12", muscle: "Biceps" },
      { name: "Tricep pushdown", sets: "3", reps: "12–15", muscle: "Triceps" },
    ],
  },
  {
    key: "fri",
    label: "Fri",
    type: "Lower",
    badgeClass: "badge-lower",
    dbDayType: "lower",
    exercises: [
      {
        name: "Leg press (heavier)",
        sets: "4",
        reps: "10–12",
        muscle: "Quads, glutes",
      },
      {
        name: "Romanian deadlift (DB)",
        sets: "4",
        reps: "10–12",
        muscle: "Hamstrings, glutes",
        tip: "Hinge at hips, soft knees",
      },
      { name: "Leg extension", sets: "3", reps: "12–15", muscle: "Quads" },
      { name: "Leg curl", sets: "3", reps: "12–15", muscle: "Hamstrings" },
      { name: "Calf raise", sets: "4", reps: "15–20", muscle: "Calves" },
      { name: "Incline sit-up", sets: "3", reps: "20", muscle: "Core" },
      {
        name: "Cable crunch or plank",
        sets: "3",
        reps: "15–20",
        muscle: "Core",
      },
    ],
  },
  {
    key: "sat",
    label: "Sat",
    type: "Rest",
    badgeClass: "badge-rest",
    dbDayType: "rest",
    exercises: [],
  },
];

const DOW_MAP: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function getTodayKey(): DayKey {
  return DOW_MAP[new Date().getDay()];
}

export function getDayName(): string {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][new Date().getDay()];
}

export function getProgramDay(key: DayKey): ProgramDay {
  return PROGRAM.find((d) => d.key === key) ?? PROGRAM[0];
}
