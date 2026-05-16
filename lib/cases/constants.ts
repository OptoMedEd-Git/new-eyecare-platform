import type { CaseFindingType, CaseLaterality } from "./types";

export const CASE_LATERALITY_OPTIONS: { value: CaseLaterality; label: string }[] = [
  { value: "OD", label: "OD" },
  { value: "OS", label: "OS" },
  { value: "OU", label: "OU" },
  { value: "none", label: "None" },
];

export const FINDINGS_TABLE_CONFIG: Record<
  CaseFindingType,
  { title: string; subtitle: string }
> = {
  vision_refraction: {
    title: "Visual acuity & refraction",
    subtitle: "Measured using Snellen acuity chart",
  },
  preliminary: {
    title: "Preliminary testing",
    subtitle: "Pupils, motility, fields, and intraocular pressure",
  },
  anterior_segment: {
    title: "Anterior segment",
    subtitle: "Slit-lamp examination findings",
  },
  posterior_segment: {
    title: "Posterior segment",
    subtitle: "Dilated fundus examination findings",
  },
};
