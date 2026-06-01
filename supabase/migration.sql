-- ============================================================
-- Overlift — Programs & Exercises schema upgrade (idempotent)
-- ============================================================

-- 1) Alter exercises table
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS source       VARCHAR(20) NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS instructions TEXT,
  ADD COLUMN IF NOT EXISTS difficulty   VARCHAR(20),
  ADD COLUMN IF NOT EXISTS safety_info  TEXT;

-- 2) New tables

CREATE TABLE IF NOT EXISTS program_templates (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_days (
  id           SERIAL PRIMARY KEY,
  template_id  INT NOT NULL REFERENCES program_templates(id) ON DELETE CASCADE,
  day_order    INT NOT NULL,
  name         VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS template_exercises (
  id              SERIAL PRIMARY KEY,
  template_day_id INT NOT NULL REFERENCES template_days(id) ON DELETE CASCADE,
  exercise_id     INT NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  position        INT NOT NULL,
  sets            INT,
  rep_min         INT,
  rep_max         INT
);

CREATE TABLE IF NOT EXISTS user_programs (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_program_days (
  id               SERIAL PRIMARY KEY,
  user_program_id  INT NOT NULL REFERENCES user_programs(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_order        INT NOT NULL,
  name             VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_program_exercises (
  id                  SERIAL PRIMARY KEY,
  user_program_day_id INT NOT NULL REFERENCES user_program_days(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id         INT NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  position            INT NOT NULL,
  sets                INT,
  rep_min             INT,
  rep_max             INT
);

-- Enforce only one active program per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_programs_one_active
  ON user_programs(user_id)
  WHERE is_active = true;

-- 3) RLS updates on exercises
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_read_exercises ON exercises;

DO $$
BEGIN
  CREATE POLICY "exercises_select_owned_or_global"
    ON exercises FOR SELECT TO authenticated
    USING (user_id IS NULL OR user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "exercises_insert_owner"
    ON exercises FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "exercises_update_owner"
    ON exercises FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "exercises_delete_owner"
    ON exercises FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4) RLS on new tables
ALTER TABLE program_templates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_days          ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_programs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_program_days      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_program_exercises ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "program_templates_select"
    ON program_templates FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "template_days_select"
    ON template_days FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "template_exercises_select"
    ON template_exercises FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_programs_select"
    ON user_programs FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_programs_insert"
    ON user_programs FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_programs_update"
    ON user_programs FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_programs_delete"
    ON user_programs FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_program_days_select"
    ON user_program_days FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_program_days_insert"
    ON user_program_days FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_program_days_update"
    ON user_program_days FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_program_days_delete"
    ON user_program_days FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_program_exercises_select"
    ON user_program_exercises FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_program_exercises_insert"
    ON user_program_exercises FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_program_exercises_update"
    ON user_program_exercises FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "user_program_exercises_delete"
    ON user_program_exercises FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_user_programs_user_id
  ON user_programs(user_id);

CREATE INDEX IF NOT EXISTS idx_user_program_days_program_id
  ON user_program_days(user_program_id);

CREATE INDEX IF NOT EXISTS idx_user_program_exercises_day_id
  ON user_program_exercises(user_program_day_id);

CREATE INDEX IF NOT EXISTS idx_user_program_exercises_user_id
  ON user_program_exercises(user_id);

CREATE INDEX IF NOT EXISTS idx_exercises_user_id
  ON exercises(user_id);


  