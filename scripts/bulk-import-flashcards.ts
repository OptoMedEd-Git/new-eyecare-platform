/**
 * Bulk-import flashcards from JSON into Supabase (draft by default).
 *
 * Usage:
 *   npx tsx scripts/bulk-import-flashcards.ts <path-to-json> [--publish] [--dry-run]
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BULK_IMPORT_AUTHOR_ID
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUTHOR_USER_ID = process.env.BULK_IMPORT_AUTHOR_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!AUTHOR_USER_ID) {
  console.error("Missing BULK_IMPORT_AUTHOR_ID in .env.local");
  console.error("Set this to the UUID of the user who should own these flashcards.");
  console.error("Find it in Supabase Studio: Auth > Users > [your user] > UID");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const args = process.argv.slice(2);
const filePath = args.find((a) => !a.startsWith("--"));
const publish = args.includes("--publish");
const dryRun = args.includes("--dry-run");

if (!filePath) {
  console.error("Usage: npx tsx scripts/bulk-import-flashcards.ts <path-to-json> [--publish] [--dry-run]");
  process.exit(1);
}

const jsonInputPath: string = filePath;

type InputFlashcard = {
  front: string;
  back: string;
  category: string;
  audience: string;
  difficulty: string;
  image_url?: string | null;
  image_attribution?: string | null;
};

const VALID_AUDIENCES = ["student", "resident", "practicing", "all"] as const;
const VALID_DIFFICULTIES = ["foundational", "intermediate", "advanced"] as const;

function validateCard(c: unknown, index: number): string | null {
  if (typeof c !== "object" || c === null) return `Card ${index + 1}: not an object`;
  const o = c as Record<string, unknown>;
  if (typeof o.front !== "string" || !o.front.trim()) {
    return `Card ${index + 1}: missing front`;
  }
  if (typeof o.back !== "string" || !o.back.trim()) {
    return `Card ${index + 1}: missing back`;
  }
  if (o.front.length > 500) return `Card ${index + 1}: front exceeds 500 characters`;
  if (o.back.length > 1000) return `Card ${index + 1}: back exceeds 1000 characters`;
  if (typeof o.category !== "string" || !o.category.trim()) {
    return `Card ${index + 1}: missing category`;
  }
  if (!VALID_AUDIENCES.includes(o.audience as (typeof VALID_AUDIENCES)[number])) {
    return `Card ${index + 1}: invalid audience '${String(o.audience)}' (must be ${VALID_AUDIENCES.join(", ")})`;
  }
  if (!VALID_DIFFICULTIES.includes(o.difficulty as (typeof VALID_DIFFICULTIES)[number])) {
    return `Card ${index + 1}: invalid difficulty '${String(o.difficulty)}' (must be ${VALID_DIFFICULTIES.join(", ")})`;
  }

  if (o.image_url !== undefined && o.image_url !== null && typeof o.image_url !== "string") {
    return `Card ${index + 1}: image_url must be string or null`;
  }
  const imageUrlStr = typeof o.image_url === "string" ? o.image_url.trim() : "";
  if (imageUrlStr && !/^(https?:\/\/|\/)/.test(imageUrlStr)) {
    return `Card ${index + 1}: image_url must be a valid HTTP(S) URL or relative path`;
  }

  if (o.image_attribution !== undefined && o.image_attribution !== null && typeof o.image_attribution !== "string") {
    return `Card ${index + 1}: image_attribution must be string or null`;
  }
  const attrStr = typeof o.image_attribution === "string" ? o.image_attribution.trim() : "";
  if (attrStr.length > 500) {
    return `Card ${index + 1}: image_attribution exceeds 500 characters`;
  }

  return null;
}

async function buildCategoryMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("blog_categories").select("id, name");
  if (error || !data) {
    console.error("Failed to fetch blog_categories:", error);
    process.exit(1);
  }
  const map = new Map<string, string>();
  for (const row of data as { id: string; name: string }[]) {
    map.set(row.name.trim(), row.id);
  }
  return map;
}

async function main() {
  const fullPath = resolve(process.cwd(), jsonInputPath);
  console.log(`Reading from: ${fullPath}`);

  let raw: string;
  try {
    raw = readFileSync(fullPath, "utf8");
  } catch (e) {
    console.error(`Could not read file: ${e}`);
    process.exit(1);
  }

  let cards: InputFlashcard[];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error("Top-level JSON must be an array of flashcards");
      process.exit(1);
    }
    cards = parsed as InputFlashcard[];
  } catch (e) {
    console.error(`Invalid JSON: ${e}`);
    process.exit(1);
  }

  console.log(`Found ${cards.length} flashcards to import`);
  if (dryRun) console.log("Mode: DRY RUN (no DB writes)");
  if (publish) console.log("Mode: will publish immediately");
  else console.log("Mode: will create as draft");

  const errors: string[] = [];
  for (let i = 0; i < cards.length; i++) {
    const err = validateCard(cards[i], i);
    if (err) errors.push(err);
  }
  if (errors.length > 0) {
    console.error(`\nValidation errors found:\n${errors.join("\n")}`);
    process.exit(1);
  }
  console.log("All flashcards validated successfully\n");

  const categoryMap = await buildCategoryMap();
  const missingCategories = new Set<string>();
  for (const c of cards) {
    const key = c.category.trim();
    if (!categoryMap.has(key)) missingCategories.add(c.category.trim());
  }
  if (missingCategories.size > 0) {
    console.error(`Unknown categories: ${Array.from(missingCategories).join(", ")}`);
    console.error(`Known categories (exact name): ${Array.from(categoryMap.keys()).sort().join(", ")}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log("Dry run complete — no changes made");
    return;
  }

  const status = publish ? "published" : "draft";
  const publishedAt = publish ? new Date().toISOString() : null;

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const categoryId = categoryMap.get(c.category.trim())!;
    const imageUrl = typeof c.image_url === "string" && c.image_url.trim() ? c.image_url.trim() : null;
    const imageAttribution =
      typeof c.image_attribution === "string" && c.image_attribution.trim() ? c.image_attribution.trim() : null;

    const { error: insErr } = await supabase.from("flashcards").insert({
      front: c.front.trim(),
      back: c.back.trim(),
      category_id: categoryId,
      target_audience: c.audience,
      difficulty: c.difficulty,
      status,
      published_at: publishedAt,
      author_id: AUTHOR_USER_ID,
      image_url: imageUrl,
      image_attribution: imageAttribution,
    });

    if (insErr) {
      console.error(`  Card ${i + 1}: failed to insert — ${insErr.message}`);
      failCount += 1;
      continue;
    }

    console.log(`  ✓ Card ${i + 1} imported`);
    successCount += 1;
  }

  console.log(`\nImport complete: ${successCount} succeeded, ${failCount} failed`);
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
