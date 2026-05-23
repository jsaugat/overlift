export type ActivityLevel = 1.375 | 1.55 | 1.725

export interface MacroTargets {
  calories: number
  maintenance: number
  protein: number
  carbs: number
  fat: number
  proteinPct: number
  carbsPct: number
  fatPct: number
}

/**
 * Mifflin-St Jeor BMR for a 70 kg, 175 cm, 20 yo male.
 * Hardcoded to match the original app's assumptions.
 */
export function calcMacros(activityLevel: ActivityLevel, surplus: number): MacroTargets {
  const bmr = Math.round(88.36 + 13.4 * 70 + 4.8 * 175 - 5.7 * 20)
  const maintenance = Math.round(bmr * activityLevel)
  const calories = maintenance + surplus

  const protein = 112 // 1.6 g/kg × 70 kg
  const proteinCal = protein * 4
  const fat = Math.round((calories * 0.25) / 9)
  const fatCal = fat * 9
  const carbs = Math.round((calories - proteinCal - fatCal) / 4)

  return {
    calories,
    maintenance,
    protein,
    carbs,
    fat,
    proteinPct: Math.round((proteinCal / calories) * 100),
    carbsPct: Math.round((carbs * 4 / calories) * 100),
    fatPct: Math.round((fatCal / calories) * 100),
  }
}
