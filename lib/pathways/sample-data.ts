export type PathwayCategory =
  | "Glaucoma"
  | "Retina"
  | "Cornea"
  | "Neuro-ophthalmology"
  | "Pediatrics"
  | "Oculoplastics";

export type PathwayAudience = "student" | "resident" | "practicing" | "all";

export type SamplePathway = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: PathwayCategory;
  audience: PathwayAudience;
  estimated_minutes: number;
  lessons_count: number;
  cover_image_url?: string | null;
  modules_preview?: string[];
  /** 0-100. Presence implies "in progress". */
  progress_percent?: number;
};

export const SAMPLE_PATHWAYS: readonly SamplePathway[] = [
  {
    id: "pw-1",
    slug: "primary-open-angle-glaucoma-foundations",
    title: "Primary Open-Angle Glaucoma: Foundations",
    description: "Build a systematic approach to diagnosis, staging, and first-line management.",
    category: "Glaucoma",
    audience: "all",
    estimated_minutes: 110,
    lessons_count: 9,
    modules_preview: ["Risk factors & workup", "Staging & progression", "First-line treatment"],
    progress_percent: 45,
  },
  {
    id: "pw-2",
    slug: "diabetic-retinopathy-clinical-pathway",
    title: "Diabetic Retinopathy: Clinical Pathway",
    description: "Recognize severity, interpret OCT, and triage referral vs treatment pathways.",
    category: "Retina",
    audience: "all",
    estimated_minutes: 95,
    lessons_count: 8,
    modules_preview: ["Severity grading", "OCT patterns", "Referral vs treatment"],
    progress_percent: 20,
  },
  {
    id: "pw-3",
    slug: "corneal-ulcer-rapid-response",
    title: "Corneal Ulcer: Rapid Response",
    description: "Initial workup, risk stratification, and empiric therapy decisions.",
    category: "Cornea",
    audience: "resident",
    estimated_minutes: 75,
    lessons_count: 6,
    modules_preview: ["History & red flags", "Exam & cultures", "Empiric therapy"],
  },
  {
    id: "pw-4",
    slug: "optic-neuritis-from-symptoms-to-next-steps",
    title: "Optic Neuritis: From Symptoms to Next Steps",
    description: "Key differentiators, imaging choices, and follow-up planning.",
    category: "Neuro-ophthalmology",
    audience: "practicing",
    estimated_minutes: 70,
    lessons_count: 6,
    modules_preview: ["Atypical features", "Imaging decisions", "Follow-up planning"],
  },
  {
    id: "pw-5",
    slug: "pediatric-red-eye-essentials",
    title: "Pediatric Red Eye: Essentials",
    description: "Age-specific differentials and safe initial management.",
    category: "Pediatrics",
    audience: "student",
    estimated_minutes: 60,
    lessons_count: 5,
    modules_preview: ["Differentials by age", "When to refer", "Safe initial management"],
  },
  {
    id: "pw-6",
    slug: "blepharoplasty-preop-to-postop",
    title: "Blepharoplasty: Pre-op to Post-op",
    description: "Patient selection, anatomy review, and complication prevention.",
    category: "Oculoplastics",
    audience: "practicing",
    estimated_minutes: 85,
    lessons_count: 7,
    modules_preview: ["Patient selection", "Anatomy review", "Complication prevention"],
  },
  {
    id: "pw-7",
    slug: "macular-degeneration-practical-guide",
    title: "Age-related Macular Degeneration: Practical Guide",
    description: "Dry vs wet AMD recognition, imaging patterns, and referral urgency.",
    category: "Retina",
    audience: "all",
    estimated_minutes: 90,
    lessons_count: 7,
    modules_preview: ["Dry vs wet AMD", "Imaging patterns", "Referral urgency"],
  },
  {
    id: "pw-8",
    slug: "angle-closure-urgent-assessment",
    title: "Angle Closure: Urgent Assessment",
    description: "Recognize red flags, assess gonioscopy findings, and choose next steps.",
    category: "Glaucoma",
    audience: "resident",
    estimated_minutes: 65,
    lessons_count: 5,
    modules_preview: ["Red flags", "Gonioscopy findings", "Next steps"],
  },
] as const;

export const SAMPLE_IN_PROGRESS_PATHWAYS: readonly SamplePathway[] = SAMPLE_PATHWAYS.filter(
  (p) => typeof p.progress_percent === "number"
).slice(0, 2);

