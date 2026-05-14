"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const DIFFICULTIES = ["foundational", "intermediate", "advanced"] as const;
const AUDIENCES = ["student", "resident", "practicing", "all"] as const;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseChoices(formData: FormData): Array<{ position: number; text: string; isCorrect: boolean }> {
  const raw = String(formData.get("correct_choice") ?? "-1");
  const correctIndex = Number.parseInt(raw, 10);
  const idx = Number.isNaN(correctIndex) ? -1 : correctIndex;
  return [0, 1, 2, 3].map((i) => ({
    position: i,
    text: String(formData.get(`choice_${i}`) ?? "").trim(),
    isCorrect: i === idx,
  }));
}

function validateQuestionFields(
  formData: FormData,
  choices: Array<{ text: string; isCorrect: boolean }>,
): string | null {
  const questionText = String(formData.get("question_text") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();

  if (!questionText) return "Question is required";
  if (!explanation) return "Explanation is required";
  if (choices.some((c) => !c.text)) return "All 4 choice texts are required";
  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) return "Exactly one choice must be marked correct";

  return null;
}

function parseCategoryId(formData: FormData): string | null {
  const raw = String(formData.get("category_id") ?? "").trim();
  if (!raw) return null;
  if (!isUuid(raw)) return null;
  return raw;
}

function parseAudience(formData: FormData): (typeof AUDIENCES)[number] | null {
  const raw = String(formData.get("target_audience") ?? "").trim();
  if (!raw) return null;
  return AUDIENCES.includes(raw as (typeof AUDIENCES)[number]) ? (raw as (typeof AUDIENCES)[number]) : null;
}

function parseDifficulty(formData: FormData): (typeof DIFFICULTIES)[number] {
  const raw = String(formData.get("difficulty") ?? "intermediate").trim();
  return DIFFICULTIES.includes(raw as (typeof DIFFICULTIES)[number])
    ? (raw as (typeof DIFFICULTIES)[number])
    : "intermediate";
}

function parseQuestionTypeForCreate(formData: FormData): "single_best_answer" | "true_false" {
  const raw = String(formData.get("question_type") ?? "single_best_answer").trim();
  return raw === "true_false" ? "true_false" : "single_best_answer";
}

function parseCorrectTrueFalse(formData: FormData): boolean | null {
  const raw = String(formData.get("correct_true_false") ?? "").trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

function validateTrueFalseCore(formData: FormData): string | null {
  const questionText = String(formData.get("question_text") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  if (!questionText) return "Question is required";
  if (!explanation) return "Explanation is required";
  if (parseCorrectTrueFalse(formData) == null) return "Select whether True or False is the correct answer";
  return null;
}

export async function createQuestion(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const questionType = parseQuestionTypeForCreate(formData);

  const vignetteRaw = String(formData.get("vignette") ?? "").trim();
  const vignette = vignetteRaw.length > 0 ? vignetteRaw : null;
  const questionText = String(formData.get("question_text") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const categoryId = parseCategoryId(formData);
  const targetAudience = parseAudience(formData);
  const difficulty = parseDifficulty(formData);
  const imageUrlRaw = String(formData.get("image_url") ?? "").trim();
  const imageAttributionRaw = String(formData.get("image_attribution") ?? "").trim();
  const imageUrl = imageUrlRaw.length > 0 ? imageUrlRaw : null;
  const imageAttribution = imageAttributionRaw.length > 0 ? imageAttributionRaw : null;

  if (questionType === "single_best_answer") {
    const choices = parseChoices(formData);
    const validationError = validateQuestionFields(formData, choices);
    if (validationError) return { success: false, error: validationError };

    const { data: question, error: qErr } = await supabase
      .from("quiz_questions")
      .insert({
        vignette,
        question_text: questionText,
        explanation,
        image_url: imageUrl,
        image_attribution: imageAttribution,
        question_type: "single_best_answer",
        category_id: categoryId,
        target_audience: targetAudience,
        difficulty,
        status: "draft",
        author_id: user.id,
        published_at: null,
      })
      .select("id")
      .maybeSingle();

    if (qErr || !question) {
      console.error("createQuestion error:", qErr);
      return { success: false, error: "Could not create question" };
    }

    const { error: cErr } = await supabase.from("quiz_question_choices").insert(
      choices.map((c) => ({
        question_id: question.id,
        position: c.position,
        text: c.text,
        is_correct: c.isCorrect,
      })),
    );

    if (cErr) {
      console.error("Failed to insert choices:", cErr);
      await supabase.from("quiz_questions").delete().eq("id", question.id);
      return { success: false, error: "Could not save choices" };
    }

    revalidatePath("/admin/quiz-bank");
    return { success: true, data: { id: question.id } };
  }

  const tfErr = validateTrueFalseCore(formData);
  if (tfErr) return { success: false, error: tfErr };
  const correctAnswer = parseCorrectTrueFalse(formData);
  if (correctAnswer == null) return { success: false, error: "Select whether True or False is the correct answer" };

  const { data: question, error: qErr } = await supabase
    .from("quiz_questions")
    .insert({
      vignette,
      question_text: questionText,
      explanation,
      image_url: imageUrl,
      image_attribution: imageAttribution,
      question_type: "true_false",
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      status: "draft",
      author_id: user.id,
      published_at: null,
    })
    .select("id")
    .maybeSingle();

  if (qErr || !question) {
    console.error("createQuestion (true_false) error:", qErr);
    return { success: false, error: "Could not create question" };
  }

  const { error: tfInsertErr } = await supabase.from("quiz_question_true_false").insert({
    question_id: question.id,
    correct_answer: correctAnswer,
  });

  if (tfInsertErr) {
    console.error("Failed to insert true_false row:", tfInsertErr);
    await supabase.from("quiz_questions").delete().eq("id", question.id);
    return { success: false, error: "Could not save true/false answer" };
  }

  revalidatePath("/admin/quiz-bank");
  return { success: true, data: { id: question.id } };
}

export async function updateQuestion(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: existing, error: exErr } = await supabase
    .from("quiz_questions")
    .select("question_type")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();

  if (exErr || !existing) return { success: false, error: "Question not found" };

  const existingType = existing.question_type as "single_best_answer" | "true_false";

  const vignetteRaw = String(formData.get("vignette") ?? "").trim();
  const vignette = vignetteRaw.length > 0 ? vignetteRaw : null;
  const questionText = String(formData.get("question_text") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const categoryId = parseCategoryId(formData);
  const targetAudience = parseAudience(formData);
  const difficulty = parseDifficulty(formData);
  const imageUrlRaw = String(formData.get("image_url") ?? "").trim();
  const imageAttributionRaw = String(formData.get("image_attribution") ?? "").trim();
  const imageUrl = imageUrlRaw.length > 0 ? imageUrlRaw : null;
  const imageAttribution = imageAttributionRaw.length > 0 ? imageAttributionRaw : null;

  if (existingType === "single_best_answer") {
    const choices = parseChoices(formData);
    const validationError = validateQuestionFields(formData, choices);
    if (validationError) return { success: false, error: validationError };
  } else {
    const validationError = validateTrueFalseCore(formData);
    if (validationError) return { success: false, error: validationError };
  }

  const { error: qErr } = await supabase
    .from("quiz_questions")
    .update({
      vignette,
      question_text: questionText,
      explanation,
      image_url: imageUrl,
      image_attribution: imageAttribution,
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
    })
    .eq("id", id)
    .eq("author_id", user.id);

  if (qErr) {
    console.error("updateQuestion error:", qErr);
    return { success: false, error: "Could not update question" };
  }

  if (existingType === "single_best_answer") {
    const choices = parseChoices(formData);

    const { error: delErr } = await supabase.from("quiz_question_choices").delete().eq("question_id", id);
    if (delErr) {
      console.error("delete choices:", delErr);
      return { success: false, error: "Could not update choices" };
    }

    const { error: cErr } = await supabase.from("quiz_question_choices").insert(
      choices.map((c) => ({
        question_id: id,
        position: c.position,
        text: c.text,
        is_correct: c.isCorrect,
      })),
    );

    if (cErr) {
      console.error("Failed to update choices:", cErr);
      return { success: false, error: "Could not update choices" };
    }
  } else {
    const correctAnswer = parseCorrectTrueFalse(formData);
    if (correctAnswer == null) return { success: false, error: "Select whether True or False is the correct answer" };

    const { error: tfErr } = await supabase.from("quiz_question_true_false").upsert(
      {
        question_id: id,
        correct_answer: correctAnswer,
      },
      { onConflict: "question_id" },
    );

    if (tfErr) {
      console.error("update true_false:", tfErr);
      return { success: false, error: "Could not update true/false answer" };
    }
  }

  revalidatePath("/admin/quiz-bank");
  revalidatePath(`/admin/quiz-bank/${id}/edit`);
  return { success: true };
}

export async function publishQuestion(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: q, error: qFetchErr } = await supabase
    .from("quiz_questions")
    .select(
      `
      image_url,
      image_attribution,
      question_type,
      choices:quiz_question_choices(id, is_correct),
      true_false:quiz_question_true_false(correct_answer)
    `,
    )
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();

  if (qFetchErr || !q) return { success: false, error: "Question not found" };

  const hasImage = typeof q.image_url === "string" && q.image_url.trim().length > 0;
  const hasAttr = typeof q.image_attribution === "string" && q.image_attribution.trim().length > 0;
  if (hasImage && !hasAttr) {
    return { success: false, error: "Image attribution is required to publish" };
  }

  const qType = q.question_type as string;
  if (qType === "single_best_answer") {
    const rawCh = q.choices as unknown;
    const ch = Array.isArray(rawCh) ? rawCh : [];
    if (ch.length !== 4) {
      return { success: false, error: "Multiple-choice questions need exactly four choices before publishing" };
    }
    const anyCorrect = ch.some((c: { is_correct?: boolean }) => c.is_correct === true);
    if (!anyCorrect) {
      return { success: false, error: "Mark one choice as correct before publishing" };
    }
  } else if (qType === "true_false") {
    const rawTf = q.true_false as unknown;
    const tfArr = Array.isArray(rawTf) ? rawTf : rawTf ? [rawTf] : [];
    const tf = tfArr[0] as { correct_answer?: boolean } | undefined;
    if (!tf || typeof tf.correct_answer !== "boolean") {
      return { success: false, error: "True/False questions need a correct answer before publishing" };
    }
  }

  const { error } = await supabase
    .from("quiz_questions")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not publish" };

  revalidatePath("/admin/quiz-bank");
  revalidatePath(`/admin/quiz-bank/${id}/edit`);
  return { success: true };
}

export async function publishQuestionWithChanges(id: string, formData: FormData): Promise<ActionResult> {
  const updateResult = await updateQuestion(id, formData);
  if (!updateResult.success) return updateResult;
  return publishQuestion(id);
}

export async function unpublishQuestion(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("quiz_questions")
    .update({ status: "draft", published_at: null })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not unpublish" };

  revalidatePath("/admin/quiz-bank");
  revalidatePath(`/admin/quiz-bank/${id}/edit`);
  return { success: true };
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("quiz_questions").delete().eq("id", id).eq("author_id", user.id);

  if (error) return { success: false, error: "Could not delete" };

  revalidatePath("/admin/quiz-bank");
  return { success: true };
}
