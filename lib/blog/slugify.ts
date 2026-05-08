/**
 * Convert a string to a URL-safe slug.
 * Examples:
 *   "Hello World" → "hello-world"
 *   "Glaucoma: A Practical Framework" → "glaucoma-a-practical-framework"
 *   "OCT scans 101" → "oct-scans-101"
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const STOPWORDS = new Set([
  // Articles
  "a",
  "an",
  "the",
  // Conjunctions
  "and",
  "or",
  "but",
  "nor",
  "so",
  "yet",
  // Common prepositions
  "of",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "by",
  "from",
  "as",
  "into",
  "onto",
  "over",
  "under",
  // Be / aux verbs
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "am",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "will",
  "would",
  "shall",
  "should",
  "can",
  "could",
  "may",
  "might",
  "must",
  // Pronouns and common interrogatives often used in headlines
  "i",
  "we",
  "you",
  "they",
  "he",
  "she",
  "it",
  "my",
  "our",
  "your",
  "their",
  "his",
  "her",
  "its",
  "this",
  "that",
  "these",
  "those",
  "how",
  "what",
  "why",
  "when",
  "where",
  "who",
  "which",
]);

const MAX_SLUG_LENGTH = 60;

/**
 * Like slugify(), but produces a shorter, cleaner slug for editorial use:
 * 1. Strips common English stopwords ("a", "the", "is", "how", etc.)
 * 2. Caps the result at MAX_SLUG_LENGTH characters, cutting at a word boundary
 *
 * If stopword removal produces an empty result (e.g., title was all stopwords like "How are you"),
 * falls back to slugify() to ensure we always produce SOMETHING.
 */
export function slugifyShort(input: string): string {
  if (!input) return "";

  const stripped = input
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => {
      const clean = word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
      if (clean === "") return false;
      return !STOPWORDS.has(clean);
    })
    .join(" ");

  if (stripped.trim().length === 0) {
    return slugify(input);
  }

  let slug = slugify(stripped);

  if (slug.length > MAX_SLUG_LENGTH) {
    const truncated = slug.slice(0, MAX_SLUG_LENGTH);
    const lastHyphen = truncated.lastIndexOf("-");

    if (lastHyphen >= 30) {
      slug = truncated.slice(0, lastHyphen);
    } else {
      slug = truncated;
    }

    slug = slug.replace(/-+$/, "");
  }

  return slug;
}

/**
 * Generate a unique slug by querying the database and appending a numeric suffix if needed.
 * If "hello-world" exists, returns "hello-world-2", then "hello-world-3", etc.
 */
export async function ensureUniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let candidate = base;
  let suffix = 2;
  while (await checkExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix++;
    if (suffix > 100) throw new Error("Could not generate unique slug after 100 attempts");
  }
  return candidate;
}

