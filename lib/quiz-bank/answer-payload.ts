import type {
  ImageStimulusPayload,
  MultiSelectPayload,
  QuestionAnswerPayload,
  SingleBestAnswerPayload,
  SubmittedQuestionAnswer,
  TrueFalsePayload,
} from "./types";

const SINGLE_BEST = "single_best_answer" as const;
const IMAGE_STIMULUS = "image_stimulus" as const;
const TRUE_FALSE = "true_false" as const;
const MULTI_SELECT = "multi_select" as const;

/** Normalize selected choice ids for stable storage and comparison. */
export function normalizeMultiSelectChoiceIds(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => id.length > 0))].sort();
}

/** Build JSONB payload for a single-best-answer submission (stored in question_responses.answer_payload). */
export function buildSingleBestAnswerPayload(choiceId: string): SingleBestAnswerPayload {
  return {
    type: SINGLE_BEST,
    version: 1,
    selectedChoiceId: choiceId,
  };
}

/** Build JSONB payload for image_stimulus (same shape as SBA; discriminated by `type`). */
export function buildImageStimulusPayload(choiceId: string): ImageStimulusPayload {
  return {
    type: IMAGE_STIMULUS,
    version: 1,
    selectedChoiceId: choiceId,
  };
}

/** Build JSONB payload for a true/false submission. */
export function buildTrueFalsePayload(value: boolean): TrueFalsePayload {
  return {
    type: TRUE_FALSE,
    version: 1,
    answer: value,
  };
}

/** Build JSONB payload for a multi-select submission (set of choice ids). */
export function buildMultiSelectPayload(selectedChoiceIds: string[]): MultiSelectPayload {
  return {
    type: MULTI_SELECT,
    version: 1,
    selectedChoiceIds: normalizeMultiSelectChoiceIds(selectedChoiceIds),
  };
}

function parseSingleBestLikePayload(
  o: Record<string, unknown>,
  discriminant: typeof SINGLE_BEST | typeof IMAGE_STIMULUS,
): SingleBestAnswerPayload | ImageStimulusPayload | null {
  if (typeof o.selectedChoiceId !== "string" || o.selectedChoiceId.length === 0) return null;
  const partial = o.partialCredit;
  let partialCredit: SingleBestAnswerPayload["partialCredit"];
  if (
    partial &&
    typeof partial === "object" &&
    !Array.isArray(partial) &&
    typeof (partial as Record<string, unknown>).earned === "number" &&
    typeof (partial as Record<string, unknown>).max === "number"
  ) {
    const p = partial as { earned: number; max: number };
    partialCredit = { earned: p.earned, max: p.max };
  }
  const version = typeof o.version === "number" ? o.version : 1;
  if (discriminant === IMAGE_STIMULUS) {
    return {
      type: IMAGE_STIMULUS,
      version,
      selectedChoiceId: o.selectedChoiceId,
      partialCredit,
    };
  }
  return {
    type: SINGLE_BEST,
    version,
    selectedChoiceId: o.selectedChoiceId,
    partialCredit,
  };
}

/** Normalize DB jsonb + legacy rows into a typed payload; falls back to choice_id when needed. */
export function parseQuestionAnswerPayload(
  raw: unknown,
  fallbackChoiceId: string | null,
): QuestionAnswerPayload | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const t = o.type;
    if (t === SINGLE_BEST) {
      const parsed = parseSingleBestLikePayload(o, SINGLE_BEST);
      if (parsed) return parsed;
    }
    if (t === IMAGE_STIMULUS) {
      const parsed = parseSingleBestLikePayload(o, IMAGE_STIMULUS);
      if (parsed) return parsed;
    }
    if (t === TRUE_FALSE && typeof o.answer === "boolean") {
      return {
        type: TRUE_FALSE,
        version: typeof o.version === "number" ? o.version : 1,
        answer: o.answer,
      };
    }
    if (t === MULTI_SELECT && Array.isArray(o.selectedChoiceIds)) {
      const ids = o.selectedChoiceIds.filter((x): x is string => typeof x === "string" && x.length > 0);
      const partial = o.partialCredit;
      let partialCredit: MultiSelectPayload["partialCredit"];
      if (
        partial &&
        typeof partial === "object" &&
        !Array.isArray(partial) &&
        typeof (partial as Record<string, unknown>).earned === "number" &&
        typeof (partial as Record<string, unknown>).max === "number"
      ) {
        const p = partial as { earned: number; max: number };
        partialCredit = { earned: p.earned, max: p.max };
      }
      return {
        type: MULTI_SELECT,
        version: typeof o.version === "number" ? o.version : 1,
        selectedChoiceIds: normalizeMultiSelectChoiceIds(ids),
        partialCredit,
      };
    }
  }
  if (fallbackChoiceId) {
    return buildSingleBestAnswerPayload(fallbackChoiceId);
  }
  return null;
}

/** Map stored payload (+ legacy choice_id) to the shape used by scoring and results. */
export function submittedAnswerFromPayload(
  parsed: QuestionAnswerPayload | null,
  fallbackChoiceId: string | null,
): SubmittedQuestionAnswer | null {
  if (!parsed && fallbackChoiceId) {
    return { type: "single_best_answer", selectedChoiceId: fallbackChoiceId };
  }
  if (!parsed) return null;
  if (parsed.type === "single_best_answer") {
    return { type: "single_best_answer", selectedChoiceId: parsed.selectedChoiceId };
  }
  if (parsed.type === "image_stimulus") {
    return { type: "image_stimulus", selectedChoiceId: parsed.selectedChoiceId };
  }
  if (parsed.type === "true_false") {
    return { type: "true_false", value: parsed.answer };
  }
  return { type: "multi_select", selectedChoiceIds: [...parsed.selectedChoiceIds] };
}
