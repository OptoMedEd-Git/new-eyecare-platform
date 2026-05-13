import { cookies } from "next/headers";

import { type AdminViewMode, DEFAULT_VIEW_MODE, VIEW_MODE_COOKIE, isValidViewMode } from "./view-mode";

/**
 * Read the current view mode from the cookie. Returns DEFAULT_VIEW_MODE if unset/invalid.
 * Callers must still enforce role (only admins should use non-default modes for preview UI).
 */
export async function getCurrentViewMode(): Promise<AdminViewMode> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(VIEW_MODE_COOKIE)?.value;
  if (isValidViewMode(raw)) return raw;
  return DEFAULT_VIEW_MODE;
}
