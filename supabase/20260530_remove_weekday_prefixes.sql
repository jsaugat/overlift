-- Remove weekday prefixes from stored program and template day names.

UPDATE template_days
SET name = regexp_replace(
  name,
  '^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s*[-—]\s*',
  '',
  'i'
)
WHERE name ~* '^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s*[-—]\s*';

UPDATE user_program_days
SET name = regexp_replace(
  name,
  '^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s*[-—]\s*',
  '',
  'i'
)
WHERE name ~* '^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s*[-—]\s*';
