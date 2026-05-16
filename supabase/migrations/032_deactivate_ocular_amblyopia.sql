-- 032_deactivate_ocular_amblyopia.sql
-- Deactivate Amblyopia in the ocular history catalog (reversible; no hard delete).

UPDATE ocular_history_conditions
SET is_active = false, updated_at = now()
WHERE name = 'Amblyopia';
