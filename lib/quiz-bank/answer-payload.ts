import type {
  QuestionAnswerPayload,
  SingleBestAnswerPayload,
  SubmittedQuestionAnswer,
  TrueFalsePayload,
} from "./types";

const SINGLE_BEST = "single_best_answer" as const;
const TRUE_FALSE = "true_false" as const;

/** Build JSONB payload for a single-best-answer submission (stored in question_responses.answer_payload). */
export function buildSingleBestAnswerPayload(choiceId: string): SingleBestAnswerPayload {
  return {
    type: SINGLE_BEST,
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

/** Normalize DB jsonb + legacy rows into a typed payload; falls back to choice_id when needed. */
export function parseQuestionAnswerPayload(
  raw: unknown,
  fallbackChoiceId: string | null,
): QuestionAnswerPayload | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const t = o.type;
    if (t === SINGLE_BEST && typeof o.selectedChoiceId === "string" && o.selectedChoiceId.length > 0) {
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
      return {
        type: SINGLE_BEST,
        version: typeof o.version === "number" ? o.version : 1,
        selectedChoiceId: o.selectedChoiceId,
        partialCredit,
      };
    }
    if (t === TRUE_FALSE && typeof o.answer === "boolean") {
      return {
        type: TRUE_FALSE,
        version: typeof o.version === "number" ? o.version : 1,
        answer: o.answer,
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
  return { type: "true_false", value: parsed.answer };
}
