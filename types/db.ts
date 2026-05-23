export interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string | null
  day_type: string | null
}

export interface WorkoutSession {
  id: number
  session_date: string
  day_type: string
  notes: string | null
  created_at: string
}

export interface SetLog {
  id: number
  session_id: number
  exercise_id: number
  set_number: number
  weight_kg: number
  reps: number
  rest_seconds: number | null
  created_at: string
  // joined
  exercise?: Exercise
  session?: WorkoutSession
}

export interface WeightLog {
  id: number
  log_date: string
  weight_kg: number
  notes: string | null
}

export interface NutritionLog {
  id: number
  log_date: string
  calories: number
  protein_g: number
  carbs_g: number | null
  fat_g: number | null
}

// Supabase Database type helper
export type Database = {
  public: {
    Tables: {
      exercises: { Row: Exercise; Insert: Omit<Exercise, 'id'>; Update: Partial<Exercise> }
      workout_sessions: { Row: WorkoutSession; Insert: Omit<WorkoutSession, 'id' | 'created_at'>; Update: Partial<WorkoutSession> }
      set_logs: { Row: SetLog; Insert: Omit<SetLog, 'id' | 'created_at'>; Update: Partial<SetLog> }
      weight_logs: { Row: WeightLog; Insert: Omit<WeightLog, 'id'>; Update: Partial<WeightLog> }
      nutrition_logs: { Row: NutritionLog; Insert: Omit<NutritionLog, 'id'>; Update: Partial<NutritionLog> }
    }
    Views: {
      v_latest_weights: {
        Row: {
          exercise: string
          muscle_group: string
          weight_kg: number
          reps: number
          session_date: string
        }
      }
    }
  }
}
