/**
 * Bulk-import quiz questions from JSON into Supabase (draft by default).
 *
 * Usage:
 *   npx tsx scripts/bulk-import-questions.ts <path-to-json> [--publish] [--dry-run]
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BULK_IMPORT_AUTHOR_ID
 *
 * Each array entry is either:
 *   - Multiple choice (default): { question_text, explanation, choices[4], category, audience, difficulty, ... }
 *   - True/False: { "question_type": "true_false", question_text, explanation, correct_answer: boolean, category, ... }
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
  console.error("Set this to the UUID of the user who should own these questions.");
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
  console.error("Usage: npx tsx scripts/bulk-import-questions.ts <path-to-json> [--publish] [--dry-run]");
  process.exit(1);
}

const jsonInputPath: string = filePath;

type InputChoice = {
  letter?: string;
  text: string;
  is_correct: boolean;
};

type InputQuestionMc = {
  question_type?: "single_best_answer";
  vignette?: string | null;
  question_text: string;
  choices: InputChoice[];
  explanation: string;
  category: string;
  audience: string;
  difficulty: string;
  image_suggestion?: string | null;
};

type InputQuestionTf = {
  question_type: "true_false";
  vignette?: string | null;
  question_text: string;
  explanation: string;
  correct_answer: boolean;
  category: string;
  audience: string;
  difficulty: string;
  image_suggestion?: string | null;
};

type InputQuestion = InputQuestionMc | InputQuestionTf;

const VALID_AUDIENCES = ["student", "resident", "practicing", "all"] as const;
const VALID_DIFFICULTIES = ["foundational", "intermediate", "advanced"] as const;

function isTrueFalseShape(o: Record<string, unknown>): boolean {
  return o.question_type === "true_false";
}

function validateCommon(o: Record<string, unknown>, index: number): string | null {
  if (typeof o.question_text !== "string" || !o.question_text.trim()) {
    return `Question ${index + 1}: missing question_text`;
  }
  if (typeof o.explanation !== "string" || !o.explanation.trim()) {
    return `Question ${index + 1}: missing explanation`;
  }
  if (typeof o.category !== "string" || !o.category.trim()) {
    return `Question ${index + 1}: missing category`;
  }
  if (!VALID_AUDIENCES.includes(o.audience as (typeof VALID_AUDIENCES)[number])) {
    return `Question ${index + 1}: invalid audience '${String(o.audience)}' (must be ${VALID_AUDIENCES.join(", ")})`;
  }
  if (!VALID_DIFFICULTIES.includes(o.difficulty as (typeof VALID_DIFFICULTIES)[number])) {
    return `Question ${index + 1}: invalid difficulty '${String(o.difficulty)}' (must be ${VALID_DIFFICULTIES.join(", ")})`;
  }
  if (o.vignette != null && typeof o.vignette !== "string") {
    return `Question ${index + 1}: vignette must be string or null`;
  }
  return null;
}

function validateQuestion(q: unknown, index: number): string | null {
  if (typeof q !== "object" || q === null) return `Question ${index + 1}: not an object`;
  const o = q as Record<string, unknown>;

  const common = validateCommon(o, index);
  if (common) return common;

  if (isTrueFalseShape(o)) {
    if (typeof o.correct_answer !== "boolean") {
      return `Question ${index + 1}: true_false requires boolean correct_answer`;
    }
    if (o.choices != null) {
      return `Question ${index + 1}: true_false entries must not include choices`;
    }
    return null;
  }

  if (!Array.isArray(o.choices) || o.choices.length !== 4) {
    return `Question ${index + 1}: choices must be an array of exactly 4`;
  }
  const correctCount = o.choices.filter((c: unknown) => {
    return typeof c === "object" && c !== null && (c as { is_correct?: boolean }).is_correct === true;
  }).length;
  if (correctCount !== 1) {
    return `Question ${index + 1}: must have exactly 1 correct choice (found ${correctCount})`;
  }
  for (let i = 0; i < o.choices.length; i++) {
    const c = o.choices[i];
    if (typeof c !== "object" || c === null) {
      return `Question ${index + 1}: choice ${i} invalid`;
    }
    const ch = c as Record<string, unknown>;
    if (typeof ch.text !== "string" || !ch.text.trim()) {
      return `Question ${index + 1}: choice ${i} missing text`;
    }
    if (typeof ch.is_correct !== "boolean") {
      return `Question ${index + 1}: choice ${i} is_correct must be boolean`;
    }
  }
  return null;
}

/** Categories live in `blog_categories` (shared with blog / courses). */
async function buildCategoryMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("blog_categories").select("id, name");
  if (error || !data) {
    console.error("Failed to fetch blog_categories:", error);
    process.exit(1);
  }
  const map = new Map<string, string>();
  for (const c of data as { id: string; name: string }[]) {
    map.set(c.name.trim(), c.id);
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

  let questions: InputQuestion[];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error("Top-level JSON must be an array of questions");
      process.exit(1);
    }
    questions = parsed as InputQuestion[];
  } catch (e) {
    console.error(`Invalid JSON: ${e}`);
    process.exit(1);
  }

  console.log(`Found ${questions.length} questions to import`);
  if (dryRun) console.log("Mode: DRY RUN (no DB writes)");
  if (publish) console.log("Mode: will publish immediately");
  else console.log("Mode: will create as draft");

  const errors: string[] = [];
  for (let i = 0; i < questions.length; i++) {
    const err = validateQuestion(questions[i], i);
    if (err) errors.push(err);
  }
  if (errors.length > 0) {
    console.error(`\nValidation errors found:\n${errors.join("\n")}`);
    process.exit(1);
  }
  console.log("All questions validated successfully\n");

  const categoryMap = await buildCategoryMap();
  const missingCategories = new Set<string>();
  for (const q of questions) {
    const key = q.category.trim();
    if (!categoryMap.has(key)) missingCategories.add(q.category.trim());
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

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const categoryId = categoryMap.get(q.category.trim())!;

    const isTf = "question_type" in q && q.question_type === "true_false";

    const { data: questionRow, error: qErr } = await supabase
      .from("quiz_questions")
      .insert({
        vignette: q.vignette != null && q.vignette !== "" ? q.vignette : null,
        question_text: q.question_text.trim(),
        explanation: q.explanation.trim(),
        image_url: null,
        image_attribution: null,
        question_type: isTf ? "true_false" : "single_best_answer",
        category_id: categoryId,
        target_audience: q.audience,
        difficulty: q.difficulty,
        status,
        published_at: publishedAt,
        author_id: AUTHOR_USER_ID,
      })
      .select("id")
      .single();

    if (qErr || !questionRow) {
      console.error(`  Question ${i + 1}: failed to insert — ${qErr?.message}`);
      failCount += 1;
      continue;
    }

    if (isTf) {
      const tf = q as InputQuestionTf;
      const { error: tfErr } = await supabase.from("quiz_question_true_false").insert({
        question_id: questionRow.id,
        correct_answer: tf.correct_answer,
      });

      if (tfErr) {
        console.error(`  Question ${i + 1}: question saved but true_false row failed — ${tfErr.message}`);
        await supabase.from("quiz_questions").delete().eq("id", questionRow.id);
        failCount += 1;
        continue;
      }
    } else {
      const mc = q as InputQuestionMc;
      const choicesToInsert = mc.choices.map((c, idx) => ({
        question_id: questionRow.id,
        position: idx,
        text: c.text.trim(),
        is_correct: c.is_correct,
      }));

      const { error: cErr } = await supabase.from("quiz_question_choices").insert(choicesToInsert);

      if (cErr) {
        console.error(`  Question ${i + 1}: question saved but choices failed — ${cErr.message}`);
        await supabase.from("quiz_questions").delete().eq("id", questionRow.id);
        failCount += 1;
        continue;
      }
    }

    console.log(`  ✓ Question ${i + 1} imported (${questionRow.id})`);
    successCount += 1;
  }

  console.log(`\nImport complete: ${successCount} succeeded, ${failCount} failed`);
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
