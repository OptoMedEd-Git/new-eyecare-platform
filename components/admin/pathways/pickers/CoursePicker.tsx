"use client";

import { searchCoursesAction } from "@/app/(admin)/admin/pathways/picker-actions";

import { ContentPicker } from "./ContentPicker";

type Props = {
  pathwayId: string;
  onAdded: () => void;
};

export function CoursePicker({ pathwayId, onAdded }: Props) {
  return (
    <ContentPicker
      pathwayId={pathwayId}
      searchAction={searchCoursesAction}
      moduleType="course"
      placeholder="Search published courses…"
      onAdded={onAdded}
    />
  );
}
