"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { isCurrentUserAdmin } from "@/lib/auth/is-admin";
import { type AdminViewMode, VIEW_MODE_COOKIE, isValidViewMode } from "@/lib/nav/view-mode";

type ActionResult = { success: true } | { success: false; error: string };

export async function setViewMode(mode: AdminViewMode): Promise<ActionResult> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  if (!isValidViewMode(mode)) return { success: false, error: "Invalid view mode" };

  const cookieStore = await cookies();
  cookieStore.set(VIEW_MODE_COOKIE, mode, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  revalidatePath("/", "layout");
  return { success: true };
}
