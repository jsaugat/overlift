-- ============================================================
--  Overlift — PostgreSQL schema for Supabase (auth + RLS)
--  Run this in Supabase → SQL Editor → New query
-- ============================================================


-- ── 1. EXERCISES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exercises (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    muscle_group VARCHAR(50)  NOT NULL,
    equipment    VARCHAR(50),
    day_type     VARCHAR(20)
);


-- ── 2. WORKOUT SESSIONS ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_sessions (
    id           SERIAL PRIMARY KEY,
    user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE         NOT NULL DEFAULT CURRENT_DATE,
    day_name     VARCHAR(100) NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, session_date, day_name)
);


-- ── 3. SET LOGS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS set_logs (
    id           SERIAL PRIMARY KEY,
    user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id   INT          NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id  INT          NOT NULL REFERENCES exercises(id),
    set_number   INT          NOT NULL CHECK (set_number > 0),
    weight_kg    NUMERIC(5,1) NOT NULL CHECK (weight_kg >= 0),
    reps         INT          NOT NULL CHECK (reps > 0),
    rest_seconds INT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ── 4. WEIGHT LOGS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weight_logs (
    id         SERIAL PRIMARY KEY,
    user_id    UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date   DATE         NOT NULL DEFAULT CURRENT_DATE,
    weight_kg  NUMERIC(4,1) NOT NULL CHECK (weight_kg > 0),
    notes      TEXT,
    UNIQUE (user_id, log_date)
);


-- ── 5. NUTRITION LOGS ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS nutrition_logs (
    id         SERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    calories   INT  NOT NULL,
    protein_g  INT  NOT NULL,
    carbs_g    INT,
    fat_g      INT,
    UNIQUE (user_id, log_date)
);


-- ── INDEXES ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sessions_user_date  ON workout_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_set_logs_user       ON set_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_session    ON set_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise   ON set_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user    ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date    ON weight_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user ON nutrition_logs(user_id);


-- ── RLS (Row-Level Security) ───────────────────────────────

ALTER TABLE exercises        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs   ENABLE ROW LEVEL SECURITY;

-- Exercises are shared reference data for signed-in users.
CREATE POLICY "authenticated_read_exercises"
  ON exercises FOR SELECT TO authenticated
  USING (true);

-- workout_sessions policies
CREATE POLICY "owner_select_sessions"
  ON workout_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_insert_sessions"
  ON workout_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_sessions"
  ON workout_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_delete_sessions"
  ON workout_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- set_logs policies
CREATE POLICY "owner_select_set_logs"
  ON set_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_insert_set_logs"
  ON set_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_set_logs"
  ON set_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_delete_set_logs"
  ON set_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- weight_logs policies
CREATE POLICY "owner_select_weight_logs"
  ON weight_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_insert_weight_logs"
  ON weight_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_weight_logs"
  ON weight_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_delete_weight_logs"
  ON weight_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- nutrition_logs policies
CREATE POLICY "owner_select_nutrition_logs"
  ON nutrition_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_insert_nutrition_logs"
  ON nutrition_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_nutrition_logs"
  ON nutrition_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_delete_nutrition_logs"
  ON nutrition_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
--  SEED DATA — workout program reference list
-- ============================================================

INSERT INTO exercises (name, muscle_group, equipment, day_type) VALUES
  -- Push
  ('Smith machine incline press',    'chest',     'smith machine', 'push'),
  ('Iso-lateral incline chest press','chest',     'machine',       'push'),
  ('Pec deck fly',                   'chest',     'machine',       'push'),
  ('Smith machine OHP seated',       'shoulders', 'smith machine', 'push'),
  ('Dumbbell lateral raises',        'shoulders', 'dumbbell',      'push'),
  ('Cable lateral raises',           'shoulders', 'cable',         'push'),
  ('Cable tricep pushdown',          'triceps',   'cable',         'push'),
  ('Overhead dumbbell extension',    'triceps',   'dumbbell',      'push'),

  -- Pull
  ('Lat pulldown wide grip',         'back',      'machine',       'pull'),
  ('Lat pulldown close grip',        'back',      'machine',       'pull'),
  ('Machine row',                    'back',      'machine',       'pull'),
  ('Cable seated row wide',          'back',      'cable',         'pull'),
  ('Face pulls',                     'shoulders', 'cable',         'pull'),
  ('Dumbbell bicep curl',            'biceps',    'dumbbell',      'pull'),
  ('Hammer curl',                    'biceps',    'dumbbell',      'pull'),

  -- Legs
  ('Leg press',                      'quads',     'machine',       'legs'),
  ('Smith machine squat',            'quads',     'smith machine', 'legs'),
  ('Leg extension',                  'quads',     'machine',       'legs'),
  ('Leg curl',                       'hamstrings','machine',       'legs'),
  ('Adductor machine',               'adductors', 'machine',       'legs'),
  ('Abductor machine',               'abductors', 'machine',       'legs'),
  ('Calf raise machine',             'calves',    'machine',       'legs'),
  ('Incline sit-up',                 'core',      'machine',       'legs'),

  -- Upper
  ('Smith machine flat bench press', 'chest',     'smith machine', 'upper'),
  ('Incline dumbbell press',         'chest',     'dumbbell',      'upper'),
  ('Rear delt fly',                  'shoulders', 'cable',         'upper'),

  -- Lower
  ('Romanian deadlift DB',           'hamstrings','dumbbell',      'lower'),
  ('Cable crunch',                   'core',      'cable',         'lower')

ON CONFLICT (name) DO NOTHING;


-- ============================================================
--  USEFUL VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_latest_weights AS
SELECT
    sl.user_id,
    e.name          AS exercise,
    e.muscle_group,
    sl.weight_kg,
    sl.reps,
    ws.session_date
FROM set_logs sl
JOIN exercises e          ON e.id  = sl.exercise_id
JOIN workout_sessions ws  ON ws.id = sl.session_id
WHERE (sl.user_id, sl.exercise_id, ws.session_date) IN (
    SELECT sl2.user_id, sl2.exercise_id, MAX(ws2.session_date)
    FROM set_logs sl2
    JOIN workout_sessions ws2 ON ws2.id = sl2.session_id
    GROUP BY sl2.user_id, sl2.exercise_id
)
ORDER BY e.muscle_group, e.name;
