"use server";

import {
  searchBlogPostsForPicker,
  searchCoursesForPicker,
  searchFlashcardDecksForPicker,
  searchQuizzesForPicker,
} from "@/lib/pathways/picker-queries";

export async function searchCoursesAction(q: string) {
  return searchCoursesForPicker(q);
}

export async function searchQuizzesAction(q: string) {
  return searchQuizzesForPicker(q);
}

export async function searchFlashcardDecksAction(q: string) {
  return searchFlashcardDecksForPicker(q);
}

export async function searchBlogPostsAction(q: string) {
  return searchBlogPostsForPicker(q);
}
