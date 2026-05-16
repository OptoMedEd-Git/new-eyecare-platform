-- 030_cases_history_conditions_trim.sql
-- Deactivate catalog rows not used in case authoring (reversible; no hard deletes).

-- Ocular: keep 7 active conditions for authoring UI
UPDATE ocular_history_conditions
SET is_active = false, updated_at = now()
WHERE name IN (
  'Pterygium surgery',
  'Glaucoma surgery',
  'Retinal detachment / repair',
  'Strabismus',
  'Corneal scar / dystrophy'
);

-- Medical: keep 6 active conditions for authoring UI
UPDATE medical_history_conditions
SET is_active = false, updated_at = now()
WHERE name IN (
  'Coronary artery disease',
  'Stroke / TIA',
  'Cancer (active or history)',
  'Pregnancy (current)'
);
