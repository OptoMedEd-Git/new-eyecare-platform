"use client";

import { searchQuizzesAction } from "@/app/(admin)/admin/pathways/picker-actions";

import { ContentPicker } from "./ContentPicker";

type Props = {
  pathwayId: string;
  onAdded: () => void;
};

export function QuizPicker({ pathwayId, onAdded }: Props) {
  return (
    <ContentPicker
      pathwayId={pathwayId}
      searchAction={searchQuizzesAction}
      moduleType="quiz"
      placeholder="Search curated quizzes…"
      onAdded={onAdded}
    />
  );
}
