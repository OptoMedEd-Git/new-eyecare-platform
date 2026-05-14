/**
 * @deprecated as of pathways P1 (migration 021).
 * Public list and detail pages now use real queries from `@/lib/pathways/queries`.
 * CurriculumStepper and CATEGORY_ICONS still consume this file until P3 wires up real module rendering.
 * Remove sample pathway arrays after P3 lands; keep shared types/helpers used by CurriculumStepper until then.
 */
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Briefcase,
  Brain,
  Eye,
  ScanLine,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export type PathwayCategory =
  | "Glaucoma"
  | "Retina"
  | "Cornea"
  | "Neuro-ophthalmology"
  | "Pediatrics"
  | "Oculoplastics"
  | "Professional development";

export type PathwayAudience = "student" | "resident" | "practicing" | "all";

export type CurriculumItemType = "Course" | "Case" | "Quiz" | "Flashcards";

export type ModuleStatus = "completed" | "in_progress" | "not_started" | "locked";

export type PathwayModule = {
  id: string;
  slug: string;
  title: string;
  type: CurriculumItemType;
  durationMinutes: number;
  description: string;
  learningObjectives: string[];
  status: ModuleStatus;
};

export type SamplePathway = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: PathwayCategory;
  audience: PathwayAudience;
  estimated_minutes: number;
  lessons_count: number;
  curriculum: PathwayModule[];
  cover_image_url?: string | null;
  modules_preview?: string[];
  /** 0–100. Presence implies “in progress” on index cards. */
  progress_percent?: number;
};

export const CATEGORY_ICONS: Record<PathwayCategory, LucideIcon> = {
  Glaucoma: Eye,
  Retina: ScanLine,
  Cornea: ShieldAlert,
  "Neuro-ophthalmology": Brain,
  Pediatrics: Baby,
  Oculoplastics: Sparkles,
  "Professional development": Briefcase,
};

type ModDef = {
  title: string;
  type: CurriculumItemType;
  durationMinutes: number;
  description: string;
  learningObjectives: string[];
};

function computeStatuses(moduleCount: number, progressPercent?: number): ModuleStatus[] {
  if (progressPercent === undefined || progressPercent <= 0) {
    return Array.from({ length: moduleCount }, (_, i) => (i === 0 ? "not_started" : "locked"));
  }
  if (progressPercent >= 100) {
    return Array.from({ length: moduleCount }, () => "completed");
  }
  const completedCount = Math.floor((progressPercent / 100) * moduleCount);
  return Array.from({ length: moduleCount }, (_, i) => {
    if (i < completedCount) return "completed";
    if (i === completedCount) return "in_progress";
    return "locked";
  });
}

function buildPathway(params: {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: PathwayCategory;
  audience: PathwayAudience;
  modules: ModDef[];
  progressPercent?: number;
  cover_image_url?: string | null;
}): SamplePathway {
  const statuses = computeStatuses(params.modules.length, params.progressPercent);
  const curriculum: PathwayModule[] = params.modules.map((m, i) => ({
    id: `${params.id}-m${i + 1}`,
    slug: `${params.slug}-module-${i + 1}`,
    title: m.title,
    type: m.type,
    durationMinutes: m.durationMinutes,
    description: m.description,
    learningObjectives: m.learningObjectives,
    status: statuses[i],
  }));

  const estimated_minutes = curriculum.reduce((s, x) => s + x.durationMinutes, 0);

  return {
    id: params.id,
    slug: params.slug,
    title: params.title,
    description: params.description,
    category: params.category,
    audience: params.audience,
    estimated_minutes,
    lessons_count: curriculum.length,
    curriculum,
    modules_preview: curriculum.slice(0, 3).map((c) => c.title),
    progress_percent: params.progressPercent,
    cover_image_url: params.cover_image_url ?? null,
  };
}

/** Pathway 1 — 12 modules, 65% progress (~7 completed, 8th in progress). */
const P1_MODULES: ModDef[] = [
  {
    title: "Glaucoma fundamentals: structure, function, and risk",
    type: "Course",
    durationMinutes: 35,
    description:
      "Review aqueous outflow anatomy, intraocular pressure dynamics, and risk factors that guide screening and diagnosis.",
    learningObjectives: [
      "Describe conventional and uveoscleral outflow pathways",
      "Identify modifiable and non-modifiable glaucoma risk factors",
      "Explain how IOP relates to optic nerve damage in POAG",
    ],
  },
  {
    title: "Tonometry, pachymetry, and corneal thickness corrections",
    type: "Course",
    durationMinutes: 28,
    description:
      "Interpret Goldmann, rebound, and contour tonometry; apply CCT-based adjustments to IOP estimates.",
    learningObjectives: [
      "Compare measurement biases across tonometry technologies",
      "Apply correction frameworks when CCT is unusually thin or thick",
      "Recognize artifacts from tight lids and breath holding",
    ],
  },
  {
    title: "Optic nerve examination and RNFL assessment",
    type: "Course",
    durationMinutes: 40,
    description:
      "Systematically evaluate the optic disc, rim, notch, and RNFL for signs of early glaucomatous damage.",
    learningObjectives: [
      "Grade rim thickness using ISNT principles",
      "Identify focal rim notch and bayonet vessel patterns",
      "Correlate slit-lamp findings with imaging artifacts",
    ],
  },
  {
    title: "Visual fields: reliability checks and early defects",
    type: "Course",
    durationMinutes: 42,
    description:
      "Improve reliability indices interpretation and recognize nasal steps, arcuate defects, and generalized depression.",
    learningObjectives: [
      "Triage fixation losses and false-positive spikes",
      "Map arcuate patterns to corresponding RNFL bundles",
      "Decide when to repeat versus change testing strategy",
    ],
  },
  {
    title: "Pressure-lowering medications: mechanisms and sequencing",
    type: "Course",
    durationMinutes: 38,
    description:
      "Match prostaglandins, beta-blockers, carbonic anhydrase inhibitors, and rho-kinase inhibitors to typical POAG phenotypes.",
    learningObjectives: [
      "Assign each major class to mechanism of action",
      "Flag systemic contraindications before prescribing beta-blockers",
      "Outline escalation rules after inadequate IOP reduction",
    ],
  },
  {
    title: "Laser trabeculoplasty: indications and counselling points",
    type: "Course",
    durationMinutes: 30,
    description:
      "Choose between ALT, SLT, and micropulse variants and prepare patients for realistic outcomes.",
    learningObjectives: [
      "Identify optimal timing relative to medication burden",
      "Explain durability ranges and repeat treatment criteria",
      "Manage inflammatory spikes after laser",
    ],
  },
  {
    title: "Case: progressive VF loss with stable IOP",
    type: "Case",
    durationMinutes: 35,
    description:
      "Walk through a POAG patient whose fields worsen despite target IOP—differentiate compliance, target drift, and secondary causes.",
    learningObjectives: [
      "Order adjunct imaging when clinical suspicion exceeds IOP story",
      "Reconcile OCT RNFL with VF progression vectors",
      "Plan interdisciplinary referral triggers",
    ],
  },
  {
    title: "MIGS overview and patient selection",
    type: "Course",
    durationMinutes: 36,
    description:
      "Survey minimally invasive glaucoma surgeries and align candidacy with angle anatomy and medication intolerance.",
    learningObjectives: [
      "Match angle-based versus canal-based devices to anatomy",
      "Discuss cataract-combined versus standalone indications",
      "Anticipate hypotony and bleb-related risks",
    ],
  },
  {
    title: "Quiz: staging therapy across NTG and HTG phenotypes",
    type: "Quiz",
    durationMinutes: 22,
    description:
      "Rapid-fire questions on tailoring medication classes and procedural timing across normal-tension and high-tension profiles.",
    learningObjectives: [
      "Apply IOP-independent progression triggers",
      "Choose adjunct imaging cadence by phenotype",
      "Prioritize neuroprotection counseling gaps honestly",
    ],
  },
  {
    title: "Flashcards: key trials and landmark IOP targets",
    type: "Flashcards",
    durationMinutes: 18,
    description:
      "Spaced repetition cards linking landmark trials to everyday management pearls.",
    learningObjectives: [
      "Recall headline efficacy numerators from major RCTs",
      "Translate trial IOP targets to individualized goals",
      "Avoid overstating neuroprotection claims beyond evidence",
    ],
  },
  {
    title: "Advanced imaging: OCT RNFL and ganglion cell layers",
    type: "Course",
    durationMinutes: 44,
    description:
      "Interpret RNFL thickness maps, progression analyses, and macular GCIPL slabs without overcalling artifact.",
    learningObjectives: [
      "Differentiate artifact from true focal thinning",
      "Use guided progression analysis responsibly",
      "Integrate structure-function correlations",
    ],
  },
  {
    title: "Integrative plan: building long-term follow-up",
    type: "Course",
    durationMinutes: 32,
    description:
      "Assemble visit cadence, escalation thresholds, and patient education scripts for lifelong POAG management.",
    learningObjectives: [
      "Define relapse triggers for referral to fellowship-trained surgeons",
      "Document informed consent talking points for trabeculectomy",
      "Coordinate comorbidity meds that affect IOP",
    ],
  },
];

/** Pathway 2 — 6 modules, 30% (~1 completed, 2nd in progress). */
const P2_MODULES: ModDef[] = [
  {
    title: "OCT primer: layers, segmentation, and scan protocols",
    type: "Course",
    durationMinutes: 38,
    description:
      "Establish orientation to macular cube, radial, and wide-field scans plus segmentation overlays.",
    learningObjectives: [
      "Label inner retina layers relevant to macular disease",
      "Choose cube versus radial acquisitions per symptom acuity",
      "Spot segmentation dropout artifacts early",
    ],
  },
  {
    title: "Reading fluid: IRF, SRF, PED patterns",
    type: "Course",
    durationMinutes: 40,
    description:
      "Differentiate intraretinal fluid pockets from subretinal fluid and pigment epithelial detachments on OCT.",
    learningObjectives: [
      "Use reflectivity cues to confirm fluid compartments",
      "Correlate leakage mechanism with systemic staging urgency",
      "Avoid confusing shadowing with fluid pockets",
    ],
  },
  {
    title: "Geographic atrophy vs neovascular AMD on multimodal imaging",
    type: "Course",
    durationMinutes: 36,
    description:
      "Combine OCT, OCT-A, and FA clues for AMD subtype classification at the slit lamp.",
    learningObjectives: [
      "Describe OCT-A flow void patterns suggestive of CNV",
      "Map GA edges with subsidence indicators",
      "Triage anti-VEGF candidacy with practical checklists",
    ],
  },
  {
    title: "Case: cystoid macular edema masqueraders",
    type: "Case",
    durationMinutes: 34,
    description:
      "Work through post-surgical CME versus inflammatory versus traction causes using OCT signatures.",
    learningObjectives: [
      "Differentiate vitreomacular traction from epiretinal membrane drag",
      "Select steroid versus NSAID escalation pathways",
      "Know when macular hole formation prompts urgent referral",
    ],
  },
  {
    title: "Diabetic macular edema cube interpretation",
    type: "Course",
    durationMinutes: 33,
    description:
      "Quantify central subfield thickening trends and interpret anti-VEGF response curves.",
    learningObjectives: [
      "Track CST against ETDRS thickness grids",
      "Identify diffuse versus cystoid DME phenotypes",
      "Place focal/grid laser remnants in modern sequencing",
    ],
  },
  {
    title: "Quiz: rapid OCT pattern recognition",
    type: "Quiz",
    durationMinutes: 25,
    description:
      "Timed quiz matching pathology snapshots to brief management choices.",
    learningObjectives: [
      "Increase speed without sacrificing safety cues",
      "Flag referral emergencies within seconds",
      "Document brief rationale suitable for charting",
    ],
  },
];

const P3_MODULES: ModDef[] = [
  {
    title: "Diabetes epidemiology and screening intervals",
    type: "Course",
    durationMinutes: 30,
    description:
      "Align ADA-aligned eye exam timing with primary care cadence and tele-retina workflows.",
    learningObjectives: [
      "State evidence-based screening onset by diabetes type",
      "Explain why pregnancy resets surveillance intensity",
      "Route telehealth positives to dilated confirmation",
    ],
  },
  {
    title: "Fundus photography grading essentials",
    type: "Course",
    durationMinutes: 32,
    description:
      "Translate ETDRS-style fields into actionable microaneurysm and hemorrhage counts.",
    learningObjectives: [
      "Differentiate mild NPDR from moderate without widefield bias",
      "Recognize IRMA versus cotton-wool overlap pitfalls",
      "Document findings suitable for primary care feedback loops",
    ],
  },
  {
    title: "Wide-field imaging for peripheral ischemia",
    type: "Course",
    durationMinutes: 35,
    description:
      "Capture peripheral neovascularization clues that central fields miss.",
    learningObjectives: [
      "Justify ultra-widefield when symptoms exceed central findings",
      "Correlate perfusion defects with neovascular risk",
      "Explain lighting artifacts versus true peripheral leakage",
    ],
  },
  {
    title: "Anti-VEGF coordination with systemic health",
    type: "Course",
    durationMinutes: 37,
    description:
      "Balance cardiovascular risk discussions when scheduling intravitreal therapy.",
    learningObjectives: [
      "Sequence injections around pregnancy planning",
      "Coordinate anticoagulation holds with cardiology guidance",
      "Document infection mitigation counseling",
    ],
  },
  {
    title: "Case: vision-stable patient with worsening DR grade",
    type: "Case",
    durationMinutes: 36,
    description:
      "Decide when to advance from observation despite stable Snellen acuity.",
    learningObjectives: [
      "Weight structural worsening on OCT against symptoms",
      "Engage endocrinology when glycemic control stalls",
      "Plan laser adjuncts when anti-VEGF access is limited",
    ],
  },
  {
    title: "Diabetic papillopathy versus optic neuropathy",
    type: "Course",
    durationMinutes: 28,
    description:
      "Differentiate disc hyperemia patterns that mimic urgent optic nerve disease.",
    learningObjectives: [
      "Use VF and OCT RNFL to separate mimickers",
      "Avoid unnecessary neuro workups when classic",
      "Know neuro-oph referral triggers",
    ],
  },
  {
    title: "Pediatric type 1 diabetes screening nuances",
    type: "Course",
    durationMinutes: 26,
    description:
      "Adjust examination approaches for younger patients and caregivers.",
    learningObjectives: [
      "Apply modified dilation counseling for anxious families",
      "Capture reliable acuity with age-appropriate charts",
      "Involve school nurses in follow-up compliance",
    ],
  },
  {
    title: "Flashcards: DR severity descriptors",
    type: "Flashcards",
    durationMinutes: 16,
    description:
      "High-yield cards linking photographic descriptors to referral urgency.",
    learningObjectives: [
      "Memorize severity thresholds tied to treatment pathways",
      "Speak plainly with patients about progression odds",
      "Prepare dictation snippets for efficient charts",
    ],
  },
  {
    title: "Quality metrics and closing the loop with PCPs",
    type: "Course",
    durationMinutes: 29,
    description:
      "Document bidirectional communication that satisfies HEDIS-style eye exam metrics.",
    learningObjectives: [
      "Craft referral-back letters with hemoglobin A1c prompts",
      "Track internal no-show mitigation tactics",
      "Measure improvement with simple dashboard metrics",
    ],
  },
];

const P4_MODULES: ModDef[] = [
  {
    title: "Red eye triage: infected versus sterile urgency",
    type: "Course",
    durationMinutes: 34,
    description:
      "Sort microbial keratitis, contact lens acute events, and sterile ulcers within minutes.",
    learningObjectives: [
      "Choose staining combinations that reveal infiltrate depth",
      "Know same-day culture thresholds",
      "Avoid steroid-first traps in infectious keratitis",
    ],
  },
  {
    title: "Contact lens–related keratitis decision tree",
    type: "Course",
    durationMinutes: 32,
    description:
      "Escalate from empiric antibiotics to fortified therapy using risk clues.",
    learningObjectives: [
      "Stratify pseudomonas risk by lens modality",
      "Pair topical agents to spectrum coverage",
      "Define referral timing to cornea specialists",
    ],
  },
  {
    title: "Case: sterile infiltrate versus early microbial ulcer",
    type: "Case",
    durationMinutes: 38,
    description:
      "Use presentation timeline and pain scores to avoid undertreatment.",
    learningObjectives: [
      "Contrast epithelial defect margins in sterile versus infectious pictures",
      "Decide when to add oral therapy",
      "Plan daily monitoring cadence for borderline cases",
    ],
  },
  {
    title: "Chemical injury first-hour protocol",
    type: "Course",
    durationMinutes: 36,
    description:
      "Coordinate irrigation, pH checks, and systemic stabilization for alkali burns.",
    learningObjectives: [
      "Prioritize copious irrigation before detailed exam",
      "Stage limbal ischemia using standardized grading",
      "Trigger burn-center collaboration when indicated",
    ],
  },
  {
    title: "Quiz: anterior chamber reactions and hypopyon",
    type: "Quiz",
    durationMinutes: 22,
    description:
      "Rapid scenarios distinguishing infectious endophthalmitis masquerading as anterior segment inflammation.",
    learningObjectives: [
      "Differentiate fungal from bacterial hypopyon morphology",
      "Know vitreous tap triggers",
      "Align antibiotic routes with severity scores",
    ],
  },
];

const P5_MODULES: ModDef[] = [
  {
    title: "Developmental milestones relevant to vision screening",
    type: "Course",
    durationMinutes: 28,
    description:
      "Translate fixation preference and stereo cues across preschool ages.",
    learningObjectives: [
      "Match screening tools to developmental stages",
      "Explain why photo-screeners occasionally miss strabismus",
      "Coordinate school readiness referrals",
    ],
  },
  {
    title: "Amblyopia diagnosis without subjective fields",
    type: "Course",
    durationMinutes: 33,
    description:
      "Use occlusion trial logic and cycloplegic refraction for preverbal patients.",
    learningObjectives: [
      "Plan patching trials with measurable targets",
      "Explain atropine penalization pros and cons",
      "Involve orthoptists when available",
    ],
  },
  {
    title: "Pediatric red eye: viral conjunctivitis versus preseptal cellulitis",
    type: "Course",
    durationMinutes: 31,
    description:
      "Differentiate low-risk conjunctivitis from orbital emergencies in children.",
    learningObjectives: [
      "Use pain-with-extraocular-motion clues responsibly",
      "Pick imaging when orbital involvement suspected",
      "Counsel return precautions for parents",
    ],
  },
  {
    title: "Case: leukocoria in a toddler",
    type: "Case",
    durationMinutes: 40,
    description:
      "Prioritize retinoblastoma rule-out while calming caregivers.",
    learningObjectives: [
      "Sequence ultrasound versus MRI decisions",
      "Know urgent oncology referral lines",
      "Communicate uncertainty without alarmism",
    ],
  },
  {
    title: "Myopia control counseling scripts",
    type: "Course",
    durationMinutes: 29,
    description:
      "Summarize outdoor time, low-dose atropine, and optical strategies with balanced evidence.",
    learningObjectives: [
      "Set realistic expectations for axial length slowing",
      "Document informed consent for off-label therapies",
      "Coordinate school ergonomics advice",
    ],
  },
  {
    title: "Flashcards: pediatric dosage pearls",
    type: "Flashcards",
    durationMinutes: 17,
    description:
      "Weight-based drops schedules and systemic absorption cautions.",
    learningObjectives: [
      "Recall pediatric-specific contraindications",
      "Avoid adult dosing copy-paste errors",
      "Plan caregiver teaching checkpoints",
    ],
  },
];

const P6_MODULES: ModDef[] = [
  {
    title: "Pupil examination and pharmacologic confirmation",
    type: "Course",
    durationMinutes: 34,
    description:
      "Differentiate physiologic anisocoria from Horner and tonic pupil patterns.",
    learningObjectives: [
      "Perform alternating-light testing systematically",
      "Choose apraclonidine versus cocaine scenarios responsibly",
      "Document neuro imaging triggers",
    ],
  },
  {
    title: "Optic disc pallor: arteritic versus non-arteritic workup",
    type: "Course",
    durationMinutes: 38,
    description:
      "Fast-track GCA evaluation without missing mimics.",
    learningObjectives: [
      "Correlate jaw claudication questions with testing urgency",
      "Interpret ESR/CRP pitfalls",
      "Coordinate temporal artery biopsy logistics",
    ],
  },
  {
    title: "Diplopia: restrictive versus neurogenic pathways",
    type: "Course",
    durationMinutes: 36,
    description:
      "Use Parks-Bielschowsky hints plus imaging cues for cranial neuropathy.",
    learningObjectives: [
      "Differentiate thyroid orbitopathy from CN palsy before MRI",
      "Know pediatric sixth-nerve benign recurrence reassurance limits",
      "Plan urgent neuro imaging windows",
    ],
  },
  {
    title: "Case: swollen optic nerve head without pain",
    type: "Case",
    durationMinutes: 39,
    description:
      "Balance papilledema workup against benign optic disc drusen mimics.",
    learningObjectives: [
      "Deploy OCT RNFL to support pseudopapilledema suspicion",
      "Coordinate lumbar puncture timing with neurology",
      "Educate patients about visual prognosis variability",
    ],
  },
  {
    title: "Homonymous field defects and stroke localization",
    type: "Course",
    durationMinutes: 35,
    description:
      "Map VF patterns to contralateral cortex pathways for neurology handoffs.",
    learningObjectives: [
      "Contrast optic tract versus radiation defects",
      "Explain macular sparing narratives succinctly",
      "Align OCT timing when occipital stroke suspected",
    ],
  },
  {
    title: "Anisocoria under dim illumination pearls",
    type: "Course",
    durationMinutes: 27,
    description:
      "Fine-tune Adie versus physiologic versus pharmacologic dilation stories.",
    learningObjectives: [
      "Stage pilocarpine testing thoughtfully",
      "Avoid unnecessary imaging when benign patterns fit",
      "Know sympathetic lesion referral urgency",
    ],
  },
  {
    title: "Quiz: giant cell arteritis scenarios",
    type: "Quiz",
    durationMinutes: 24,
    description:
      "Interactive vignettes reinforcing steroid dosing urgency.",
    learningObjectives: [
      "Pick pulse steroid triggers",
      "Navigate biopsy timing relative to steroids",
      "Coordinate rheumatology follow-up",
    ],
  },
  {
    title: "Neuro-imaging appropriateness checklist",
    type: "Course",
    durationMinutes: 30,
    description:
      "Choose MRI sequences and contrast indications for optic pathway disease.",
    learningObjectives: [
      "Avoid blanket MRI orders without symptom anchors",
      "Explain gadolinium considerations for renal patients",
      "Summarize finance-friendly imaging escalation pathways",
    ],
  },
];

const P7_MODULES: ModDef[] = [
  {
    title: "Scheduling templates that protect cognitive bandwidth",
    type: "Course",
    durationMinutes: 28,
    description:
      "Design clinic blocks that balance productivity with documentation sanity.",
    learningObjectives: [
      "Batch administrative tasks between patient waves",
      "Protect teaching moments without blowing throughput",
      "Measure burnout proxies quarterly",
    ],
  },
  {
    title: "Informed consent scripts that satisfy audits",
    type: "Course",
    durationMinutes: 31,
    description:
      "Translate procedure risks into plain language without omitting material facts.",
    learningObjectives: [
      "Document shared decision-making phrases succinctly",
      "Capture translator-assisted consent nuances",
      "Align EMR macros with malpractice guidance",
    ],
  },
  {
    title: "Billing fundamentals for ophthalmic procedures",
    type: "Course",
    durationMinutes: 36,
    description:
      "Outline coding hygiene that survives payer audits while staying ethical.",
    learningObjectives: [
      "Differentiate global periods across common surgeries",
      "Pick modifiers that reflect medical necessity",
      "Escalate questionable payer policies ethically",
    ],
  },
  {
    title: "Case: conflict between productivity metrics and quality care",
    type: "Case",
    durationMinutes: 33,
    description:
      "Navigate administrative pressure while advocating for patient safety.",
    learningObjectives: [
      "Escalate concerns through compliant channels",
      "Document clinical objections objectively",
      "Balance RVU expectations with teaching missions",
    ],
  },
  {
    title: "Building referral networks and community reputation",
    type: "Course",
    durationMinutes: 29,
    description:
      "Intentional networking without compromising evidence-based practice.",
    learningObjectives: [
      "Craft concise specialist-to-specialist updates",
      "Participate in hospital committees strategically",
      "Measure patient satisfaction without gaming surveys",
    ],
  },
];

const P8_MODULES: ModDef[] = [
  {
    title: "RNFL progression maps: signal versus noise",
    type: "Course",
    durationMinutes: 41,
    description:
      "Interpret guided progression analysis with attention to artifact and physiologic drift.",
    learningObjectives: [
      "Decide when rescan beats trend interpretation",
      "Align VF corroboration thresholds",
      "Communicate uncertainty to patients honestly",
    ],
  },
  {
    title: "OCT-A disc perfusion in glaucoma suspects",
    type: "Course",
    durationMinutes: 37,
    description:
      "Evaluate capillary dropout metrics alongside structural OCT.",
    learningObjectives: [
      "Avoid overcalling projection artifacts",
      "Compare OCT-A metrics across vendors responsibly",
      "Integrate structure-function storytelling",
    ],
  },
  {
    title: "Bruch's membrane opening—based diagnostics",
    type: "Course",
    durationMinutes: 35,
    description:
      "Use BMO-MRW and lamina cribrosa imaging for advanced glaucoma phenotypes.",
    learningObjectives: [
      "Contrast global rim metrics with sectoral trends",
      "Explain when lamina imaging changes referral urgency",
      "Document chartable phrases payers accept",
    ],
  },
  {
    title: "Case: rapidly progressing VF with quiet OCT",
    type: "Case",
    durationMinutes: 42,
    description:
      "Reconcile structure-function discordance and escalate surgical planning.",
    learningObjectives: [
      "Repeat VF testing strategies before declaring progression",
      "Order ancillary psychophysical tests when indicated",
      "Coordinate trabeculectomy counseling timelines",
    ],
  },
  {
    title: "Angle imaging with OCT: interpretation pitfalls",
    type: "Course",
    durationMinutes: 34,
    description:
      "Segment angle anatomy for plateau iris suspects versus pupillary block.",
    learningObjectives: [
      "Differentiate peripheral iris roll from trabecular pigment",
      "Place LPI counseling within OCT context",
      "Avoid relying on a single cross-sectional slice",
    ],
  },
  {
    title: "Quiz: imaging escalation pathways",
    type: "Quiz",
    durationMinutes: 23,
    description:
      "Match imaging modality to scenario when funds are constrained.",
    learningObjectives: [
      "Prioritize highest yield tests per dollar",
      "Know charity-care referral routes",
      "Document shared decision conversations",
    ],
  },
  {
    title: "Flashcards: artifact recognition toolkit",
    type: "Flashcards",
    durationMinutes: 18,
    description:
      "Micro-cards for blink lines, motion artifact, and segmentation skips.",
    learningObjectives: [
      "Rapidly classify artifact families",
      "Teach technicians corrective capture habits",
      "Reduce false-positive progression flags",
    ],
  },
  {
    title: "Synthesizing multimodal data for surgical consultation",
    type: "Course",
    durationMinutes: 38,
    description:
      "Package OCT, VF, and clinical metrics into concise referral packets.",
    learningObjectives: [
      "Summarize surgical triggers without burying lede",
      "Anticipate surgeon questions about compliance",
      "Close loop postoperative expectations",
    ],
  },
];

export const SAMPLE_PATHWAYS: readonly SamplePathway[] = [
  buildPathway({
    id: "p1",
    slug: "glaucoma-management-mastery",
    title: "Glaucoma management mastery",
    description:
      "Build a sequenced approach spanning diagnostics, medical therapy, laser, and surgical escalation with realistic case integration.",
    category: "Glaucoma",
    audience: "all",
    modules: P1_MODULES,
    progressPercent: 65,
  }),
  buildPathway({
    id: "p2",
    slug: "reading-oct-systematically",
    title: "Reading OCT scans systematically",
    description:
      "Translate cross-sectional cubes into staging decisions for AMD, DME, and macular traction disorders.",
    category: "Retina",
    audience: "resident",
    modules: P2_MODULES,
    progressPercent: 30,
  }),
  buildPathway({
    id: "p3",
    slug: "diabetic-eye-disease-screening",
    title: "Diabetic eye disease screening",
    description:
      "Operationalize high-volume diabetic retinopathy screening with photography, risk stratification, and primary-care feedback loops.",
    category: "Retina",
    audience: "all",
    modules: P3_MODULES,
  }),
  buildPathway({
    id: "p4",
    slug: "anterior-segment-emergencies",
    title: "Anterior segment emergencies",
    description:
      "Triage microbe-heavy ulcers, chemical injuries, and acute inflammation with escalation triggers.",
    category: "Cornea",
    audience: "resident",
    modules: P4_MODULES,
  }),
  buildPathway({
    id: "p5",
    slug: "pediatric-vision-fundamentals",
    title: "Pediatric vision fundamentals",
    description:
      "Cover screening milestones, amblyopia pathways, and urgent pediatric presentations without overwhelming families.",
    category: "Pediatrics",
    audience: "student",
    modules: P5_MODULES,
  }),
  buildPathway({
    id: "p6",
    slug: "neuro-ophthalmology-essentials",
    title: "Neuro-ophthalmology essentials",
    description:
      "Solidify pupil testing, optic neuropathy workups, and neuro-imaging appropriateness for busy comprehensive clinics.",
    category: "Neuro-ophthalmology",
    audience: "practicing",
    modules: P6_MODULES,
  }),
  buildPathway({
    id: "p7",
    slug: "starting-your-clinical-practice",
    title: "Starting your clinical practice",
    description:
      "Blend operational templates, consent excellence, and ethical billing foundations for early-career attendings.",
    category: "Professional development",
    audience: "practicing",
    modules: P7_MODULES,
  }),
  buildPathway({
    id: "p8",
    slug: "advanced-glaucoma-imaging-interpretation",
    title: "Advanced glaucoma imaging interpretation",
    description:
      "Deep dive OCT RNFL, OCT-A perfusion, and angle anatomy to adjudicate progression with confidence.",
    category: "Glaucoma",
    audience: "practicing",
    modules: P8_MODULES,
  }),
] as const;

export const SAMPLE_IN_PROGRESS_PATHWAYS: readonly SamplePathway[] = SAMPLE_PATHWAYS.filter(
  (p) => typeof p.progress_percent === "number",
).slice(0, 2);
