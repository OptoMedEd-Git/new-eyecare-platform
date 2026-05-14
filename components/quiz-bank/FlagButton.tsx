"use client";

import { flagQuestion, unflagQuestion } from "@/app/(app)/quiz-bank/flag-actions";
import { FlagButton as SharedFlagButton, type FlagActionResult } from "@/components/shared/FlagButton";

type Props = {
  questionId: string;
  initialFlagged: boolean;
  variant?: "icon" | "icon-label";
  onToggle?: (nowFlagged: boolean) => void;
};

function toFlagResult(result: Awaited<ReturnType<typeof flagQuestion>>): FlagActionResult {
  if (result.success) return { success: true };
  return { success: false, error: result.error };
}

export function FlagButton({ questionId, initialFlagged, variant = "icon-label", onToggle }: Props) {
  return (
    <SharedFlagButton
      initialFlagged={initialFlagged}
      variant={variant}
      onToggle={onToggle}
      flag={() => flagQuestion(questionId).then(toFlagResult)}
      unflag={() => unflagQuestion(questionId).then(toFlagResult)}
    />
  );
}
