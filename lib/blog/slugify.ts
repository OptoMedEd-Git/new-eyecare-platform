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

