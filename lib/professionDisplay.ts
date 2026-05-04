import { PROFESSION_OPTIONS } from "@/app/(auth)/signup/professions";

/** Maps stored `profession` values to plural audience copy for marketing-style sentences. */
const PROFESSION_TO_AUDIENCE_PLURAL: Record<string, string> = {
  optometrist_od: "optometrists",
  ophthalmologist: "ophthalmologists",
  optometry_student: "optometry students",
  medical_student: "medical students",
  optometry_resident: "optometry residents",
  ophthalmology_resident: "ophthalmology residents",
  optometric_technician: "optometric technicians",
  ophthalmic_technician: "ophthalmic technicians",
  optician: "opticians",
  vision_scientist: "vision scientists",
  other: "eye care professionals",
};

export function getProfessionAudiencePlural(
  profession: string | null | undefined,
): string {
  if (!profession) return "eye care professionals";
  return PROFESSION_TO_AUDIENCE_PLURAL[profession] ?? "eye care professionals";
}

/** Human-readable profession label aligned with signup options. */
export function getProfessionProfileLabel(
  profession: string | null | undefined,
): string {
  if (!profession) return "—";
  const match = PROFESSION_OPTIONS.find((p) => p.value === profession);
  return match?.label ?? profession;
}
