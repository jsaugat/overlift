-- ============================================================
--  Overlift — Seed program template: Lean Bulk PPL + Upper/Lower
--  Idempotent inserts (safe to re-run)
-- ============================================================

WITH template AS (
  INSERT INTO program_templates (name, description)
  SELECT
    'Lean Bulk PPL + Upper/Lower',
    '5-day Push/Pull/Legs + Upper/Lower split for lean bulking'
  WHERE NOT EXISTS (
    SELECT 1
    FROM program_templates
    WHERE name = 'Lean Bulk PPL + Upper/Lower'
  )
  RETURNING id
),
selected_template AS (
  SELECT id FROM template
  UNION ALL
  SELECT id
  FROM program_templates
  WHERE name = 'Lean Bulk PPL + Upper/Lower'
  LIMIT 1
),
seed_days AS (
  SELECT * FROM (VALUES
    (1, 'push',  'Sunday — Push'),
    (2, 'pull',  'Monday — Pull'),
    (3, 'legs',  'Tuesday — Legs'),
    (4, 'rest',  'Wednesday — Rest'),
    (5, 'upper', 'Thursday — Upper'),
    (6, 'lower', 'Friday — Lower'),
    (7, 'rest',  'Saturday — Rest')
  ) AS v(day_order, day_type, name)
),
inserted_days AS (
  INSERT INTO template_days (template_id, day_order, day_type, name)
  SELECT t.id, d.day_order, d.day_type, d.name
  FROM selected_template t
  CROSS JOIN seed_days d
  WHERE NOT EXISTS (
    SELECT 1
    FROM template_days td
    WHERE td.template_id = t.id
      AND td.day_order = d.day_order
  )
  RETURNING id, template_id, day_order
),
all_days AS (
  SELECT id, template_id, day_order FROM inserted_days
  UNION ALL
  SELECT td.id, td.template_id, td.day_order
  FROM template_days td
  JOIN selected_template t ON t.id = td.template_id
),
seed_exercises AS (
  SELECT 1 AS day_order, 1 AS position,
    (SELECT id FROM exercises WHERE name = 'Smith machine incline press' AND user_id IS NULL) AS exercise_id,
    3 AS sets, 8 AS rep_min, 12 AS rep_max
  UNION ALL SELECT 1, 2,
    (SELECT id FROM exercises WHERE name = 'Iso-lateral incline chest press' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 1, 3,
    (SELECT id FROM exercises WHERE name = 'Pec deck fly' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 1, 4,
    (SELECT id FROM exercises WHERE name = 'Smith machine OHP seated' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 1, 5,
    (SELECT id FROM exercises WHERE name = 'Dumbbell lateral raises' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 1, 6,
    (SELECT id FROM exercises WHERE name = 'Cable lateral raises' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 1, 7,
    (SELECT id FROM exercises WHERE name = 'Cable tricep pushdown' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 1, 8,
    (SELECT id FROM exercises WHERE name = 'Overhead dumbbell extension' AND user_id IS NULL),
    3, 8, 12

  UNION ALL SELECT 2, 1,
    (SELECT id FROM exercises WHERE name = 'Lat pulldown wide grip' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 2, 2,
    (SELECT id FROM exercises WHERE name = 'Lat pulldown close grip' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 2, 3,
    (SELECT id FROM exercises WHERE name = 'Machine row' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 2, 4,
    (SELECT id FROM exercises WHERE name = 'Cable seated row wide' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 2, 5,
    (SELECT id FROM exercises WHERE name = 'Face pulls' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 2, 6,
    (SELECT id FROM exercises WHERE name = 'Dumbbell bicep curl' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 2, 7,
    (SELECT id FROM exercises WHERE name = 'Hammer curl' AND user_id IS NULL),
    3, 8, 12

  UNION ALL SELECT 3, 1,
    (SELECT id FROM exercises WHERE name = 'Leg press' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 3, 2,
    (SELECT id FROM exercises WHERE name = 'Smith machine squat' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 3, 3,
    (SELECT id FROM exercises WHERE name = 'Leg extension' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 3, 4,
    (SELECT id FROM exercises WHERE name = 'Leg curl' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 3, 5,
    (SELECT id FROM exercises WHERE name = 'Adductor machine' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 3, 6,
    (SELECT id FROM exercises WHERE name = 'Abductor machine' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 3, 7,
    (SELECT id FROM exercises WHERE name = 'Calf raise machine' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 3, 8,
    (SELECT id FROM exercises WHERE name = 'Incline sit-up' AND user_id IS NULL),
    3, 8, 12

  UNION ALL SELECT 5, 1,
    (SELECT id FROM exercises WHERE name = 'Smith machine flat bench press' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 5, 2,
    (SELECT id FROM exercises WHERE name = 'Incline dumbbell press' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 5, 3,
    (SELECT id FROM exercises WHERE name = 'Rear delt fly' AND user_id IS NULL),
    3, 8, 12

  UNION ALL SELECT 6, 1,
    (SELECT id FROM exercises WHERE name = 'Romanian deadlift DB' AND user_id IS NULL),
    3, 8, 12
  UNION ALL SELECT 6, 2,
    (SELECT id FROM exercises WHERE name = 'Cable crunch' AND user_id IS NULL),
    3, 8, 12
)
INSERT INTO template_exercises (
  template_day_id,
  exercise_id,
  position,
  sets,
  rep_min,
  rep_max
)
SELECT d.id, e.exercise_id, e.position, e.sets, e.rep_min, e.rep_max
FROM seed_exercises e
JOIN all_days d ON d.day_order = e.day_order
WHERE e.exercise_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM template_exercises te
    WHERE te.template_day_id = d.id
      AND te.exercise_id = e.exercise_id
  );
