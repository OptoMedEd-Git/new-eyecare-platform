/**
 * Levenshtein distance between two strings.
 * Used to detect typos and minor spelling variations.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Normalize a tag name to its canonical form.
 * Lowercase, trim, collapse internal whitespace.
 */
export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export type SimilarityMatch = {
  tag: { id: string; name: string; name_lower: string };
  reason: "typo" | "stem" | "exact";
  distance: number;
};

/**
 * Find tags similar to the given input.
 * Returns matches that are likely typos, plurals, or stems of the input.
 *
 * Match criteria (any one):
 * - Exact match (after normalization) — distance 0
 * - Levenshtein distance <= 2 (catches typos, plurals like imaging/images)
 * - One name contains the other AND length difference <= 4 (catches stems like "imag" / "imaging")
 */
export function findSimilarTags(
  input: string,
  existingTags: Array<{ id: string; name: string; name_lower: string }>
): SimilarityMatch[] {
  const normalized = normalizeTagName(input);
  if (!normalized) return [];

  const matches: SimilarityMatch[] = [];

  for (const tag of existingTags) {
    if (tag.name_lower === normalized) {
      matches.push({ tag, reason: "exact", distance: 0 });
      continue;
    }

    const distance = levenshtein(normalized, tag.name_lower);

    // Typo / minor variant
    if (distance <= 2 && distance > 0) {
      matches.push({ tag, reason: "typo", distance });
      continue;
    }

    // Stem match (one is a substring of the other, with limited length difference)
    const lengthDiff = Math.abs(normalized.length - tag.name_lower.length);
    if (lengthDiff <= 4 && lengthDiff > 0) {
      const isStem = tag.name_lower.includes(normalized) || normalized.includes(tag.name_lower);
      if (isStem) {
        matches.push({ tag, reason: "stem", distance });
      }
    }
  }

  // Sort by distance ascending (best matches first)
  matches.sort((a, b) => a.distance - b.distance);

  // Limit to 3 matches to avoid overwhelming the user
  return matches.slice(0, 3);
}

