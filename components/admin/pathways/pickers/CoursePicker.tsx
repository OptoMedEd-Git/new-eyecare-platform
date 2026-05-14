"use client";

import { searchCoursesAction } from "@/app/(admin)/admin/pathways/picker-actions";

import { ContentPicker } from "./ContentPicker";

type Props = {
  phaseId: string;
  onAdded: () => void;
};

export function CoursePicker({ phaseId, onAdded }: Props) {
  return (
    <ContentPicker
      phaseId={phaseId}
      searchAction={searchCoursesAction}
      moduleType="course"
      placeholder="Search published courses…"
      onAdded={onAdded}
    />
  );
}
