/** Public pathway taxonomy (shared with courses / quiz bank). */
export type PathwayAudience = "student" | "resident" | "practicing" | "all";

export type PathwayDifficulty = "foundational" | "intermediate" | "advanced";

export type PathwayStatus = "draft" | "published";

export type PathwayModuleType = "course" | "quiz" | "flashcard_deck" | "blog_post" | "external_resource";

/** One row in `pathway_modules` (named PathwayModuleRecord to avoid clashing with sample-data PathwayModule for CurriculumStepper). */
export type PathwayModuleRecord = {
  id: string;
  pathwayId: string;
  position: number;
  title: string;
  contextMarkdown: string | null;
  moduleType: PathwayModuleType;
  courseId: string | null;
  quizId: string | null;
  flashcardDeckId: string | null;
  blogPostId: string | null;
  externalUrl: string | null;
  externalLabel: string | null;
  linkedContent?: {
    title: string;
    href: string | null;
  };
};

export type PathwayListing = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: { id: string; name: string } | null;
  audience: PathwayAudience | null;
  difficulty: PathwayDifficulty | null;
  estimatedDurationText: string | null;
  isFeatured: boolean;
  status: PathwayStatus;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  moduleCount: number;
};

export type PathwayWithModules = PathwayListing & {
  modules: PathwayModuleRecord[];
};

/** Props for PathwayHero when driven by DB pathways (no sample curriculum). */
export type PathwayHeroModel = {
  title: string;
  description: string;
  categoryLabel: string;
  audience: PathwayAudience | null;
  moduleCount: number;
  durationLabel: string;
  progress_percent?: number;
  cover_image_url?: string | null;
  nextModuleTitle?: string | null;
};

export function pathwayWithModulesToHero(pathway: PathwayWithModules): PathwayHeroModel {
  const categoryLabel = pathway.category?.name ?? "Pathway";
  const durationLabel =
    pathway.estimatedDurationText?.trim() ||
    (pathway.moduleCount > 0 ? `${pathway.moduleCount} module${pathway.moduleCount === 1 ? "" : "s"}` : "—");
  return {
    title: pathway.title,
    description: pathway.description ?? "",
    categoryLabel,
    audience: pathway.audience,
    moduleCount: pathway.moduleCount,
    durationLabel,
    cover_image_url: null,
    nextModuleTitle: null,
  };
}
