export const PROFESSION_OPTIONS = [
  { value: "optometrist_od", label: "Optometrist (OD)" },
  { value: "ophthalmologist", label: "Ophthalmologist (MD/DO)" },
  { value: "optometry_student", label: "Optometry student" },
  { value: "medical_student", label: "Medical student" },
  { value: "optometry_resident", label: "Optometry resident" },
  { value: "ophthalmology_resident", label: "Ophthalmology resident" },
  { value: "optometric_technician", label: "Optometric technician" },
  { value: "ophthalmic_technician", label: "Ophthalmic technician" },
  { value: "optician", label: "Optician" },
  { value: "vision_scientist", label: "Vision scientist / researcher" },
  { value: "other", label: "Other" },
] as const;

export type ProfessionValue = (typeof PROFESSION_OPTIONS)[number]["value"];
