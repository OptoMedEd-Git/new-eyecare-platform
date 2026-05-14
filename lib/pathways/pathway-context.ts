import { getPublicPathwayModules, getPublishedPathwayBySlug } from "./queries";
import type { PublicPathwayModuleRow } from "./types";

/** Normalize `?pathway=` from Next.js `searchParams` (string or string[]). */
export function parsePathwayQueryParam(search: Record<string, string | string[] | undefined> | undefined): string | undefined {
  if (!search) return undefined;
  const raw = search.pathway;
  if (typeof raw === "string") return raw.trim() || undefined;
  if (Array.isArray(raw) && raw[0]) return String(raw[0]).trim() || undefined;
  return undefined;
}

export type PathwayBannerContext = {
  pathwaySlug: string;
  pathwayTitle: string;
  /** 1-based module index within the pathway (matches curriculum step numbers). */
  currentPosition: number;
  /** Non-orphaned modules only (same denominator as pathway hero). */
  totalCount: number;
};

function moduleMatchesContent(
  m: PublicPathwayModuleRow,
  contentType: "course" | "quiz" | "flashcard_deck",
  contentId: string,
): boolean {
  if (m.is_orphaned) return false;
  if (contentType === "course") {
    return m.module_type === "course" && m.linked_course_id === contentId;
  }
  if (contentType === "quiz") {
    return m.module_type === "quiz" && m.linked_quiz_id === contentId;
  }
  return m.module_type === "flashcard_deck" && m.linked_flashcard_deck_id === contentId;
}

/**
 * Resolves pathway banner context for a piece of content viewed with ?pathway=.
 * Returns null when the param is missing, the pathway is missing/unpublished,
 * or this content is not a module in that pathway. Never throws.
 */
export async function getPathwayBannerContext(params: {
  pathwaySlug: string | undefined;
  contentType: "course" | "quiz" | "flashcard_deck";
  contentId: string;
}): Promise<PathwayBannerContext | null> {
  try {
    const slug = params.pathwaySlug?.trim();
    if (!slug) return null;

    const pathway = await getPublishedPathwayBySlug(slug);
    if (!pathway) return null;

    const modules = await getPublicPathwayModules(pathway.id);
    const match = modules.find((m) => moduleMatchesContent(m, params.contentType, params.contentId));
    if (!match) return null;

    const totalCount = modules.filter((m) => !m.is_orphaned).length;
    const currentPosition = match.position + 1;

    return {
      pathwaySlug: pathway.slug,
      pathwayTitle: pathway.title,
      currentPosition,
      totalCount,
    };
  } catch {
    return null;
  }
}
