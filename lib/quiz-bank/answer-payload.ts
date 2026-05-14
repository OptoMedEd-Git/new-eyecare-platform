import type { QuestionAnswerPayload, SingleBestAnswerPayload } from "./types";

const SINGLE_BEST = "single_best_answer" as const;

/** Build JSONB payload for a single-best-answer submission (stored in question_responses.answer_payload). */
export function buildSingleBestAnswerPayload(choiceId: string): SingleBestAnswerPayload {
  return {
    type: SINGLE_BEST,
    version: 1,
    selectedChoiceId: choiceId,
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
  }
  if (fallbackChoiceId) {
    return buildSingleBestAnswerPayload(fallbackChoiceId);
  }
  return null;
}
