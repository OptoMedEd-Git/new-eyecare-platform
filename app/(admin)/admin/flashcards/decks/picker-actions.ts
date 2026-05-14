"use server";

import { searchAdminFlashcardsForPicker } from "@/lib/flashcards/admin-queries";

export async function searchFlashcardsForPickerAction(searchQuery: string, excludeIds: string[]) {
  return searchAdminFlashcardsForPicker(searchQuery, excludeIds);
}
