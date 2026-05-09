import type { LucideIcon } from "lucide-react";
import { BookOpen, Brain, Eye, Microscope } from "lucide-react";

/**
 * Maps blog category names (shared with courses) to icons for empty-state / placeholder art.
 * Unknown names fall back to BookOpen.
 */
export const CATEGORY_ICON_BY_NAME: Partial<Record<string, LucideIcon>> = {
  Glaucoma: Eye,
  "Anterior Segment": Microscope,
  "Posterior Segment": Eye,
  "Diagnostic Imaging": Microscope,
  "Pediatric Optometry": Eye,
  "Neuro-ophthalmology": Brain,
  "Career & Education": BookOpen,
};

export function getCourseCategoryIcon(categoryName: string | null | undefined): LucideIcon {
  if (!categoryName) return BookOpen;
  return CATEGORY_ICON_BY_NAME[categoryName] ?? BookOpen;
}
