import type { LucideIcon } from "lucide-react";
import { BookOpen, Brain, Eye, Microscope } from "lucide-react";

export type CourseCategory =
  | "Glaucoma"
  | "Anterior Segment"
  | "Posterior Segment"
  | "Diagnostic Imaging"
  | "Pediatric Optometry"
  | "Neuro-ophthalmology"
  | "Career & Education";

export type CourseAudience = "student" | "resident" | "practicing" | "all";

export const COURSE_CATEGORY_ICONS: Record<CourseCategory, LucideIcon> = {
  Glaucoma: Eye,
  "Anterior Segment": Microscope,
  "Posterior Segment": Eye,
  "Diagnostic Imaging": Microscope,
  "Pediatric Optometry": Eye,
  "Neuro-ophthalmology": Brain,
  "Career & Education": BookOpen,
};

export type LessonStatus = "completed" | "not_started";

export type SampleLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  content: unknown;
  status: LessonStatus;
};

export type SampleCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CourseCategory;
  audience: CourseAudience;
  coverImageUrl?: string;
  totalDurationMinutes: number;
  publishedAt: string;
  lessons: SampleLesson[];
  progressPercent?: number;
};


export const SAMPLE_COURSES: SampleCourse[] = [
  {
    "id": "c1",
    "slug": "glaucoma-fundamentals",
    "title": "Glaucoma fundamentals: structure, function, and risk",
    "description": "Build a working understanding of aqueous dynamics, IOP, optic nerve damage, and the risk factors that shape every clinical decision in glaucoma care.",
    "category": "Glaucoma",
    "audience": "resident",
    "totalDurationMinutes": 180,
    "publishedAt": "2026-04-15",
    "progressPercent": 33,
    "lessons": [
      {
        "id": "c1-l1",
        "slug": "anatomy-and-aqueous-dynamics",
        "title": "Anatomy and aqueous dynamics",
        "description": "Review aqueous humor production, conventional and uveoscleral outflow, and the pressure gradient that maintains intraocular pressure.",
        "estimatedMinutes": 25,
        "status": "completed",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Understanding glaucoma starts with the plumbing. Aqueous humor is produced continuously by the ciliary body's nonpigmented epithelium at roughly 2.5 microliters per minute. From the posterior chamber it flows through the pupil into the anterior chamber, where it must exit at the same rate to maintain stable intraocular pressure (IOP)."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "The two outflow pathways"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Aqueous leaves the eye through two distinct pathways. The conventional or trabecular pathway accounts for roughly 80 to 85 percent of outflow in younger eyes. Aqueous passes through the trabecular meshwork into Schlemm's canal, then drains via collector channels into the episcleral venous system. Resistance in this pathway is dynamic and responds to medication."
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The uveoscleral or unconventional pathway handles the remaining 15 to 20 percent. Aqueous passes through the ciliary body face and into the suprachoroidal space, eventually reaching the orbital vasculature. This pathway is largely pressure-independent and is the primary target of prostaglandin analogs."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Pressure as a clinical signal"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Normal IOP follows a roughly Gaussian distribution centered around 15 to 16 mmHg with two standard deviations placing the upper limit near 21 mmHg. But the population definition of normal is not a clinical threshold. Roughly half of patients with primary open-angle glaucoma have IOP measurements below 21 mmHg at presentation."
                }
              ]
            },
            {
              "type": "blockquote",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "The clinical question is never \"is the pressure high\" but \"is this pressure causing damage in this optic nerve.\""
                    }
                  ]
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Why this matters at the slit lamp"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The mechanism shapes the exam. Looking at the angle on gonioscopy tells you whether outflow is anatomically obstructed. Examining the disc tells you whether the current pressure is causing damage. Visual fields tell you whether that damage has reached functional significance. Each measurement answers a different question, and all three matter."
                }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Aqueous is produced at ~2.5 µL/min and must exit at the same rate"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Trabecular outflow handles 80 to 85 percent in younger eyes"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Uveoscleral outflow is pressure-independent and prostaglandin-sensitive"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Population normal IOP is not a clinical threshold for damage"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c1-l2",
        "slug": "iop-measurement-techniques",
        "title": "IOP measurement: techniques and pitfalls",
        "description": "Compare Goldmann applanation, rebound tonometry, and contour tonometry. Understand corneal effects on measured pressure.",
        "estimatedMinutes": 30,
        "status": "completed",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Goldmann applanation tonometry remains the clinical reference standard, but it is not the only technique a clinician will use, and it has known sources of error that change clinical interpretation."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Goldmann applanation"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The technique flattens a 3.06 mm diameter circle of cornea against a fluorescein-stained tear film. The Imbert-Fick principle states that for an ideal thin-walled sphere, the force needed to flatten a fixed area equals the internal pressure. The 3.06 mm diameter was chosen because it minimizes errors from corneal rigidity and tear film capillary attraction at average central corneal thickness of 520 micrometers."
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "In practice, several factors degrade accuracy. Thicker corneas overestimate IOP; thinner corneas underestimate it. Astigmatism greater than 3 diopters causes elliptical mires that introduce error. Pulse variation can shift readings by 1 to 3 mmHg between heartbeats — read at the midpoint of the pulse oscillation."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Rebound tonometry (iCare)"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Rebound tonometers measure deceleration of a small probe striking the cornea. They require no anesthetic, no fluorescein, and minimal training, making them invaluable in pediatric and uncooperative patients. They tend to overestimate IOP slightly compared to Goldmann, particularly at higher pressures."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Dynamic contour tonometry (Pascal)"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Contour tonometry uses a tip with a concave surface designed to match the cornea's natural shape. It is theoretically less affected by corneal thickness and biomechanical properties. The tradeoff is sensitivity to lid pressure and patient cooperation. In clinical practice it is most useful in eyes with abnormal corneas — post-LASIK, keratoconus, or marked astigmatism."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "The corneal correction question"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Pachymetry measurements often prompt the question: should I correct the IOP for corneal thickness? The honest answer is that correction formulas are approximations and clinical judgment usually outperforms them. Document the actual measurement, note the central corneal thickness, and let the disc and field tell you whether the pressure is causing damage. Treat the patient, not the formula."
                }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Goldmann remains the clinical standard despite known errors"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Thicker corneas overestimate; thinner corneas underestimate IOP"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Rebound tonometry is invaluable for uncooperative patients"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Contour tonometry is most useful for abnormal corneas"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Document the measurement; let the disc and field guide treatment decisions"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c1-l3",
        "slug": "optic-nerve-evaluation",
        "title": "Optic nerve evaluation",
        "description": "Systematically assess disc size, rim, cupping, and disc hemorrhages. Pattern recognition for glaucomatous damage.",
        "estimatedMinutes": 35,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Glaucoma is, fundamentally, a disease of the optic nerve. Pressure is a risk factor and a treatment lever, but the question every visit asks is whether the optic nerve is changing. A systematic disc exam is the most sensitive clinical tool for detecting that change in community practice when imaging is unavailable or equivocal."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Start with disc size"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "A larger optic disc has a larger physiologic cup. Reading a 0.7 cup-to-disc ratio in a small disc raises immediate concern; the same ratio in a large disc may be entirely normal. Estimate disc diameter using the slit beam — a 1.5 mm to 1.7 mm vertical beam approximates average disc size. Document the disc as small, average, or large at every glaucoma visit."
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "When you document size, you also set expectations for how much cupping can be physiologic. It is a common error to over-interpret cupping in a large disc or under-interpret early loss in a small, crowded disc with little visible cup."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Examine the rim using ISNT"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The neuroretinal rim follows a predictable pattern in healthy eyes: thickest Inferior, then Superior, then Nasal, then Temporal. Violation of the ISNT rule — where one expected-thicker quadrant becomes thinner than its expected-thinner neighbor — is one of the earliest signs of glaucomatous loss."
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Inferior rim thinning is the most common early finding. Look for focal notching at the inferior pole, which often precedes superior arcuate field defects. Compare quadrants to each other, not to a population chart."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Disc hemorrhages: the Drance hemorrhage"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "A small flame-shaped hemorrhage at the disc margin, typically inferotemporal, signals active glaucomatous progression. They resolve in 4 to 8 weeks but mark a substantially increased risk of visual field loss in the year following. Always note disc hemorrhages — they shift management toward more aggressive IOP lowering."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Beta-zone parapapillary atrophy"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Beta-zone PPA — the area of bare sclera and visible large choroidal vessels adjacent to the disc — is associated with glaucomatous damage. Asymmetric or progressive beta-zone PPA accompanies progression and should be tracked with stereo photography when possible."
                }
              ]
            },
            {
              "type": "blockquote",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "If you see something on the disc that bothers you, document it. The disc photo you take today is the comparison standard for every visit going forward."
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c1-l4",
        "slug": "visual-field-interpretation",
        "title": "Visual field interpretation",
        "description": "Read SITA fields confidently. Recognize patterns of glaucomatous damage and distinguish from artifact.",
        "estimatedMinutes": 30,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "A perimetry printout is dense with information. Approached systematically, it answers three questions in order: is the test reliable, is there a defect, and is it a glaucomatous pattern."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Reliability indices first"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Before interpreting the field, check the reliability indices. Fixation losses above 20 percent, false positives above 15 percent, or false negatives above 33 percent should prompt skepticism. A field with high false positives can show an apparent improvement that is purely a testing artifact."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "The Glaucoma Hemifield Test"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The GHT compares paired sectors above and below the horizontal midline. \"Outside normal limits\" is meaningful — glaucoma respects the horizontal midline because nasal and temporal axons enter the disc separately. Crossing the midline suggests a non-glaucomatous cause."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Pattern recognition"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Classic glaucomatous patterns include arcuate scotomas arching from the blind spot, nasal steps respecting the horizontal midline, paracentral scotomas, and altitudinal defects. Generalized depression alone is rarely glaucomatous — look for localized pattern within the depression."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Artifact patterns to recognize"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Lid-related artifacts produce superior depression that improves when the lid is taped. Lens-related ring scotomas map to rim artifacts. Learning effects improve fields over the first several tests. Fatigue causes progressive loss within a single sitting. Cataract causes diffuse depression without focal arcuate structure."
                }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Lid-related: superior depression that lifts when lid is taped"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Lens-related: ring scotomas from a trial lens rim"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Learning effect: improvement across early repeat tests"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Fatigue: progressive loss within a single long session"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Cataract: diffuse depression without focal pattern"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c1-l5",
        "slug": "risk-factors-for-progression",
        "title": "Risk factors for progression",
        "description": "Identify patients at higher risk of progression and tailor follow-up frequency accordingly.",
        "estimatedMinutes": 30,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Treatment intensity should match progression risk. Major studies — OHTS, EMGT, AGIS — have identified factors that shift baseline risk meaningfully across populations."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Strongly evidenced risk factors"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Higher baseline IOP, larger vertical cup-to-disc ratio at baseline, thinner central corneal thickness as an independent risk factor, older age, pseudoexfoliation, and disc hemorrhages all shift expectations toward progression."
                }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Higher baseline IOP"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Vertically larger cup-to-disc ratio"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Thinner central corneal thickness"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Older age"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Pseudoexfoliation"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Disc hemorrhages"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Family history and ancestry"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "First-degree relatives of POAG patients have substantially higher risk. African ancestry confers higher risk and earlier onset in population data. Angle closure risk patterns differ by ancestry; do not assume all glaucoma risk is uniform across groups."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Translating risk into follow-up"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "A young patient with thin corneas, family history, and disc hemorrhage warrants closer follow-up and more decisive IOP reduction. An elderly patient with long-standing stability and reliable fields may be monitored at longer intervals if clinical judgment supports it."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "The OHTS prediction model"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The OHTS model predicts conversion risk from ocular hypertension to glaucoma using IOP, age, CCT, vertical CDR, and PSD. Use it as a framework, not a substitute for examining the nerve and field in front of you."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c1-l6",
        "slug": "establishing-baseline-and-targets",
        "title": "Establishing baseline and treatment targets",
        "description": "Set a clinically meaningful target IOP and measure progression against it.",
        "estimatedMinutes": 30,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Target IOP is one of the most important numbers you set in glaucoma management — and it must be revisited as evidence accumulates."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "What target IOP is, and is not"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Target IOP is the pressure below which you believe a specific patient's optic nerve will not progress. It is patient-specific, not disease-specific. A target of 18 mmHg might be appropriate for a stable elderly patient with mild damage; the same patient at progression risk may need a target of 12."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Setting an initial target"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "A reasonable starting point is often 25 to 30 percent reduction from untreated baseline IOP in ocular hypertension with mild risk. Adjust downward if damage is advanced, progression is documented, or risk factors are concerning."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Reassess targets at each visit"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "If the patient is at target and stable: the target was reasonable. If at target and progressing: lower the target. If above target and stable: reassess adherence and measurement conditions. If above target and progressing: escalate promptly."
                }
              ]
            },
            {
              "type": "blockquote",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Target IOP is a hypothesis, not a destination. Reassess at every visit."
                    }
                  ]
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Documenting the target"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Write the current target in the chart with rationale. Future clinicians — including you — should not have to infer intent from medication lists alone."
                }
              ]
            }
          ]
        }
      }
    ]
  },
  {
    "id": "c2",
    "slug": "reading-oct-systematically",
    "title": "Reading OCT scans systematically",
    "description": "A structured approach to interpreting macular and optic nerve OCT, with emphasis on artifact recognition and clinical correlation.",
    "category": "Diagnostic Imaging",
    "audience": "resident",
    "totalDurationMinutes": 130,
    "publishedAt": "2026-04-22",
    "lessons": [
      {
        "id": "c2-l1",
        "slug": "oct-physics-and-acquisition",
        "title": "OCT physics and acquisition",
        "description": "Understand low-coherence interferometry, axial resolution, scan density, and why signal strength matters.",
        "estimatedMinutes": 22,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Spectral-domain OCT builds cross-sectional images by measuring echo time delays of reflected light. Unlike ultrasound, it requires no contact and achieves micron-scale axial resolution, which revolutionized how clinicians visualize retinal layers."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Interferometry in plain terms"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The system splits light into reference and sample arms and detects interference when optical path lengths match within the coherence length of the source. Shorter coherence length yields finer axial resolution. Modern SD-OCT commonly achieves axial resolutions near 5–7 microns in tissue, though displayed scales vary by device."
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Lateral resolution depends on the optics of the delivery system and scan length. A wide-field macular cube trades lateral sampling density for coverage — always check what protocol was acquired before interpreting a single B-scan."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Signal strength and quality"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Manufacturers report signal strength or quality metrics that correlate with opacity and alignment. Low signal invites segmentation error and speckle noise. Repeat scans after optimizing fixation, focusing, and tear film often clarify ambiguous findings."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "What acquisition choices change clinically"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Line scans emphasize detail along one meridian; cubes enable thickness maps; wider RNFL circles sample more of the peripapillary ring. Mismatch between baseline and follow-up protocol can mimic progression or improvement artifactually."
                }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Confirm scan type matches prior visits before comparing thickness"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Repeat low–signal strength scans when segmentation fails"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Document pupil size and media clarity when images are borderline"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c2-l2",
        "slug": "normal-retinal-anatomy-on-oct",
        "title": "Normal retinal anatomy on OCT",
        "description": "Identify ILM, RNFL, GCL, IPL, INL, OPL, photoreceptors, RPE, and choroidal boundaries on cross-sections.",
        "estimatedMinutes": 24,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Reading OCT begins with naming the laminae you expect to see in a healthy macula. Consistency matters more than memorizing vendor-specific color tables."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Outer retina landmarks"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The external limiting membrane, ellipsoid zone (formerly IS/OS), interdigitation zone, and RPE peak form a stack that should appear crisp in good scans. Blurring of the ellipsoid zone localizes pathology to photoreceptors or subretinal fluid."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Inner retina and ganglion cells"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The nerve fiber layer is thick near the disc and thins toward the fovea where the ganglion cell layer dominates parafoveal thickness. Macular cube interpretation requires remembering this thickness redistribution — a normal fovea can look paradoxically “thin” in global averages if you average the wrong ETDRS subfields."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Comparing eyes"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Always compare fellow eyes for symmetry. Many artifacts present unilaterally; many diseases begin asymmetrically. A side-by-side scroll through equivalent B-scans trains pattern recognition faster than reading summary metrics alone."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c2-l3",
        "slug": "rnfl-and-ganglion-cell-analysis",
        "title": "RNFL and ganglion cell analysis",
        "description": "Interpret peripapillary RNFL thickness maps, macular GCL/IPL metrics, and progression algorithms.",
        "estimatedMinutes": 26,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Glaucoma imaging trades structural surrogates for functional tests — RNFL thickness and macular ganglion cell metrics estimate optic nerve health earlier than fields in some cases, but they are not interchangeable."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "RNFL maps"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The inferotemporal and superotemporal bundles typically peak thickest. Focal wedge defects appear as localized thinning against normative bands. Global averages can hide focal loss — inspect the clock-hours or deviation maps, not only the summary number."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "GCL/IPL macular analysis"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Central ganglion cell complex thinning can precede circumpapillary RNFL change in some patients. This is especially relevant when the disc is tilted or peripapillary anatomy confounds RNFL measurements."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Progression display pitfalls"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Event analyses flag crossing a threshold; trend analyses fit slopes over time. Either can be perturbed by segmentation shifts or protocol drift. Use structural progression as one line of evidence alongside fields and the optic disc."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c2-l4",
        "slug": "macular-oct-pathology-patterns",
        "title": "Macular OCT pathology patterns",
        "description": "Recognize fluid compartments, drusen, holes, traction, and pigment epithelial detachments on macular scans.",
        "estimatedMinutes": 23,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Macular OCT pattern recognition accelerates referral decisions. First localize pathology to compartments — vitreous, retina, subretinal space, RPE, choroid."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Fluid signals"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Intraretinal cystic spaces suggest edema from vascular leakage or traction. Subretinal fluid elevates the neurosensory retina with a dark optically empty cavity. Double-check whether fluid is center-involving when counseling prognosis."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Vitrectomy interface disorders"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Epiretinal membrane appears as a hyperreflective layer above the ILM with inner retinal distortion. Vitreomacular traction shows an elevated posterior hyaloid applying anterior-posterior forces. Full-thickness holes display complete tissue absence across layers."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Choroidal processes"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Thickening with overlying subretinal fluid raises choroidal neovascularization in the differential. Drusenoid pigment epithelial detachments appear smooth-domed with heterogeneous internal reflectivity. Correlate with age, laterality, and fundus exam."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c2-l5",
        "slug": "oct-artifacts-and-quality-traps",
        "title": "OCT artifacts and quality traps",
        "description": "Detect segmentation failure, motion lines, wrong eye laterality, and decentered scans.",
        "estimatedMinutes": 20,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Artifact can masquerade as disease when clinicians trust color maps without inspecting source B-scans."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Segmentation failures"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The algorithm may snap the ILM to a vessel shadow or miss the true RPE peak in tilted nerves or staphylomas. Any abrupt discontinuity in thickness along an arc should prompt a manual scroll review."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Motion and vignetting"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Motion creates serrated edges and stair-stepping. Vignetting reduces peripheral signal and can artifactually thin RNFL in some sectors. Rescan before concluding progression."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Protocol mismatches"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Switching devices or changing scan circle diameter shifts nominal thickness values. Maintain longitudinal continuity when tracking progression; document equipment changes explicitly."
                }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Scroll raw B-scans for every suspicious map pixel"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Repeat scans with improved centration before labeling progression"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "Track device model and software version in longitudinal records"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c2-l6",
        "slug": "integrating-oct-with-the-clinical-exam",
        "title": "Integrating OCT with the clinical exam",
        "description": "Combine structural imaging with ophthalmoscopy, visual fields, and history for coherent decisions.",
        "estimatedMinutes": 15,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "OCT never replaces clinical synthesis — it accelerates it when used as an adjunct with explicit questions."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Ask what OCT answers"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Is structural thickness consistent with my optic nerve appearance? Is macular anatomy explaining symptoms? Is fluid present under the retina today? If the scan contradicts the exam, reconcile before treating aggressively."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Document the integration"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Chart notes should cite what imaging confirmed or refuted, not merely that imaging was obtained. This protects patients during handoffs and clarifies why you escalated or deferred referral."
                }
              ]
            }
          ]
        }
      }
    ]
  },
  {
    "id": "c3",
    "slug": "anterior-segment-exam-fundamentals",
    "title": "Anterior segment exam fundamentals",
    "description": "Build a confident, systematic anterior segment exam — slit lamp technique, gonioscopy basics, and what to document at every visit.",
    "category": "Anterior Segment",
    "audience": "student",
    "totalDurationMinutes": 110,
    "publishedAt": "2026-03-30",
    "progressPercent": 60,
    "lessons": [
      {
        "id": "c3-l1",
        "slug": "slit-lamp-setup-and-beams",
        "title": "Slit lamp setup and beam configurations",
        "description": "Optimize magnification, illumination angles, and beam width for different anterior segment tasks.",
        "estimatedMinutes": 20,
        "status": "completed",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The slit lamp is the primary instrument of anterior segment diagnosis. Competence is less about expensive ancillary tests and more about disciplined use of illumination geometry."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Magnification and alignment"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Start at low magnification for orientation, then increase for detail. Ensure the patient’s lateral canthus aligns with the marking on the chin rest so comparability across visits holds. Adjust pupil distance knobs so both eyes see a single fused image comfortably."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Diffuse vs narrow beam"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Diffuse illumination surveys lids and lashes; a narrow optical section reveals corneal depth and endothelial clues cell-by-cell through indirect retroillumination pairings. Practice alternating quickly — experts constantly toggle rather than staring at one setting."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Parallelepiped and optic section"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "A broad parallelepiped highlights epithelial edema and superficial defects; a thin optic section localizes opacities to epithelium, stroma, or endothelium. State explicitly in notes which layer holds pathology — your future self depends on it."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c3-l2",
        "slug": "lid-and-conjunctiva-exam",
        "title": "Lid and conjunctiva exam",
        "description": "Differentiate blepharitis subtypes, papillary vs follicular responses, and staining patterns.",
        "estimatedMinutes": 18,
        "status": "completed",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Lids and conjunctiva often carry the diagnosis in dry eye and allergy presentations before the cornea shows dramatic changes."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Meibomian inspection"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Express meibomian glands gently along the lid margin and note expressibility and lipid quality. Foam along lashes suggests blepharitis-related instability even when tear break-up time is only mildly abnormal."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Papillary vs follicular"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Papillae imply chronic mechanical irritation or allergic disease with cobblestone morphology. Follicles suggest viral or chronic antigenic stimulation — interpret in context of lymphadenopathy and laterality."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Bulbar hyperemia patterns"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Sectoral injection raises episcleritis; circumlimbal injection raises inflammation inside the eye in children. Photograph unusual presentations when safe — longitudinal comparison beats memory."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c3-l3",
        "slug": "cornea-evaluation",
        "title": "Cornea evaluation",
        "description": "Use staining maps, tear break-up, and optical sectioning to localize epithelial and stromal disease.",
        "estimatedMinutes": 22,
        "status": "completed",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The cornea is a layered structure — force yourself to assign pathology to epithelium, Bowman’s layer, stroma, Descemet’s membrane, or endothelium whenever possible."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Fluorescein and lissamine pairing"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Fluorescein highlights epithelial compromise; lissamine green highlights dead or devitalized epithelium and conjunctival staining that fluorescein can miss. Use both in moderate-to-severe dry eye evaluations."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Pattern recognition"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Inferior staining suggests exposure or lid wiper epitheliopathy; interpalpebral staging suggests evaporative dry eye; ring patterns suggest tear meniscus abnormalities or foreign bodies."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Endothelium"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Specular reflection at high magnification reveals guttae and polymegathism. When view is limited, note what prevented grading — opacity matters as much as the endothelium itself."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c3-l4",
        "slug": "anterior-chamber-and-angle",
        "title": "Anterior chamber and angle",
        "description": "Grade cell and flare, estimate depth, and position gonioscopy in management decisions.",
        "estimatedMinutes": 24,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "The anterior chamber is a dynamic space — depth, inflammation, and pigment liberation tell different chapters of the same uveitis or glaucoma story."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Cell and flare grading"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Use standardized fields and beam settings when possible so \"+2 cell\" means something comparable across visits. Remember flare reflects protein and often lingers after cells fall."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Van Herick estimation"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "At the temporal limbus, compare peripheral anterior chamber depth to corneal thickness. It screens for narrow angles when gonioscopy is deferred, but it is not a substitute when closure risk is high."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Pigment and synechiae clues"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Circumferential pigment on the endothelium may indicate prior pigment liberation from the iris or pseudoexfoliation. Posterior synechiae suggest prior inflammation — document extent because dilation plans change."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c3-l5",
        "slug": "lens-and-iris-documentation",
        "title": "Lens and iris documentation",
        "description": "Characterize cataract type, iris transillumination defects, and pupillary abnormalities systematically.",
        "estimatedMinutes": 26,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Lens and iris findings anchor surgical planning and explain unexplained visual phenomena when the macula appears intact."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Cataract morphology"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Classify by layer — nuclear sclerosis shifts refractive index; cortical spokes scatter light most at night; posterior subcapsular plaques glare under bright reading tasks. Patients experience different cataracts differently."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Iris texture"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Transillumination defects localize iris pigment loss from trauma, inflammation, or surgical trauma. Sectoral defects differ from pseudoexfoliation patterns — integrate with angle findings."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Pupils"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Document shape, symmetry, and reaction before dilation. A sluggish pupil with vitritis raises syphilis and viral entities; irregular pupils raise trauma or surgery history."
                }
              ]
            }
          ]
        }
      }
    ]
  },
  {
    "id": "c4",
    "slug": "pediatric-vision-screening",
    "title": "Pediatric vision screening fundamentals",
    "description": "Age-appropriate vision testing techniques and red flags that warrant referral — from newborns through school-age children.",
    "category": "Pediatric Optometry",
    "audience": "student",
    "totalDurationMinutes": 150,
    "publishedAt": "2026-04-08",
    "lessons": [
      {
        "id": "c4-l1",
        "slug": "visual-development-overview",
        "title": "Visual development overview",
        "description": "Summarize critical periods, emmetropization drivers, and why timing of screening matters.",
        "estimatedMinutes": 22,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Pediatric eye care is developmental — normal anatomy at birth differs from school age, and screening intervals track vulnerability windows for amblyopia treatment."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Critical periods in brief"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Amblyopia therapy efficacy declines as cortical plasticity wanes, but useful improvement remains possible into early adolescence for some patients. Earlier detection preserves more binocularity and stereopsis."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Emmetropization"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Axial length growth interacts with corneal and lenticular power to steer refractive error toward plano in typically sighted children. Large hyperopia or myopia shifts early warrant cycloplegic clarification rather than passive observation."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c4-l2",
        "slug": "newborn-and-infant-assessment",
        "title": "Newborn and infant assessment",
        "description": "Use red reflex testing, BRUCKNER, fixation preference, and milestones to risk-stratify infants.",
        "estimatedMinutes": 24,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Infants cannot report symptoms — structural exams and behavioral surrogates dominate detection."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Red reflex and referrals"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Asymmetric or dull reflex raises cataract, tumor, or high refractive error in the differential. Document what technique produced the reflex — undilated versus ophthalmoscopic views differ."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Fixation and following"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Central steady maintained fixation emerges on a predictable timeline. Pure eccentric fixation after mid-infancy prompts investigation for amblyogenic risk factors even before readable acuity exists."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c4-l3",
        "slug": "toddler-vision-screening",
        "title": "Toddler vision screening",
        "description": "Select age-appropriate matching charts, crowd bars, and distraction-reduced techniques.",
        "estimatedMinutes": 20,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Toddlers cooperate unevenly — success depends more on environment than on chart sophistication."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Matching paradigms"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "LEA symbols and HOTV matching reduce verbal demands. Keep lighting bright enough for pupil constriction but avoid glare that biases acuity."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Crowding"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Amblyopic eyes often degrade more with crowded optotypes than isolated letters — test both paradigms when clinical suspicion is high despite “acceptable” single-letter performance."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c4-l4",
        "slug": "preschool-screening-protocols",
        "title": "Preschool screening protocols",
        "description": "Compare photoscreening instruments and community protocols with evidence-based follow-up thresholds.",
        "estimatedMinutes": 21,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Photoscreening scales access but generates referrals — know what positives mean before counseling families."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Instrument outputs"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Devices estimate refractive risk factors and alignment surrogates from eccentric photographs. High specificity depends on capture quality — dirty lids or eccentric fixation elevates false positives."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Follow-up discipline"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Positive screens deserve timely comprehensive exams; negative screens do not eliminate pathology — degenerative or progressive conditions still require symptom surveillance."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c4-l5",
        "slug": "school-age-refraction",
        "title": "School-age refraction considerations",
        "description": "Interpret cycloplegic findings, myopia progression signals, and binocular vision overlays.",
        "estimatedMinutes": 23,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "School-age exams blend refraction with classroom performance complaints — separate optical blur from accommodative insufficiency and convergence issues."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Cycloplegia indications"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Hyperopic latent components and accommodative esotropia risk warrant cycloplegic refinement even when autorefraction appears mild. Document which agent and recovery guidance you provided."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Myopia progression"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Track axial length when possible — refractive shift alone confounds lenticular changes. Discuss outdoor time and evidence-based interventions proportional to progression velocity."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c4-l6",
        "slug": "red-flags-and-referral-thresholds",
        "title": "Red flags and referral thresholds",
        "description": "Recognize leukocoria, forced head postures, nystagmus onset timing, and urgent escalation triggers.",
        "estimatedMinutes": 25,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Certain pediatric presentations should bias toward rapid referral regardless of single-metric normality."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Leukocoria and media opacity"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Any white pupil reflex warrants urgent evaluation for retinoblastoma, cataract, Coats-like disease, or persistent fetal vasculature depending on age and associated findings."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Strabismus onset"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Acquired esotropia after stereopsis was established differs developmentally from intermittent infantile esotropia patterns — onset history matters as much as prism measurement."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "c4-l7",
        "slug": "parent-counseling-and-documentation",
        "title": "Parent counseling and documentation",
        "description": "Translate measurements into expectations, follow-up windows, and school accommodations clearly.",
        "estimatedMinutes": 15,
        "status": "not_started",
        "content": {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Families anchor trust on clarity — explain what you measured, what you are watching, and what symptoms should trigger earlier return."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Plain-language targets"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Instead of “binocular vision,” describe depth perception goals relevant to sports and classroom board work. Instead of “anti-suppression,” describe why patching timing matters for homework stamina."
                }
              ]
            },
            {
              "type": "heading",
              "attrs": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Documentation that travels"
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "School nurses and pediatricians read your letters — specify refractive error in plain units, patch hours per day, and whether cycloplegic refraction is pending."
                }
              ]
            }
          ]
        }
      }
    ]
  }
];

export function getCourseBySlug(slug: string): SampleCourse | null {
  return SAMPLE_COURSES.find((c) => c.slug === slug) ?? null;
}

export function getLessonBySlug(courseSlug: string, lessonSlug: string): SampleLesson | null {
  const course = getCourseBySlug(courseSlug);
  if (!course) return null;
  return course.lessons.find((l) => l.slug === lessonSlug) ?? null;
}

export function getLessonNeighbors(
  courseSlug: string,
  lessonSlug: string,
): {
  previous: SampleLesson | null;
  next: SampleLesson | null;
  index: number;
  total: number;
} {
  const course = getCourseBySlug(courseSlug);
  if (!course) return { previous: null, next: null, index: -1, total: 0 };
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  return {
    previous: index > 0 ? course.lessons[index - 1]! : null,
    next: index >= 0 && index < course.lessons.length - 1 ? course.lessons[index + 1]! : null,
    index,
    total: course.lessons.length,
  };
}
