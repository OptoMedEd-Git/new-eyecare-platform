"use client";

import { searchQuizzesAction } from "@/app/(admin)/admin/pathways/picker-actions";

import { ContentPicker } from "./ContentPicker";

type Props = {
  phaseId: string;
  onAdded: () => void;
};

export function QuizPicker({ phaseId, onAdded }: Props) {
  return (
    <ContentPicker
      phaseId={phaseId}
      searchAction={searchQuizzesAction}
      moduleType="quiz"
      placeholder="Search curated quizzes…"
      onAdded={onAdded}
    />
  );
}
