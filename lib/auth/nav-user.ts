import { createClient } from "@/lib/supabase/server";
import type { AdminViewMode } from "@/lib/nav/view-mode";
import { getCurrentViewMode } from "@/lib/nav/view-mode-server";

export type NavUserRole = "admin" | "contributor" | "member";

function normalizeRole(value: unknown): NavUserRole {
  if (value === "admin" || value === "contributor" || value === "member") {
    return value;
  }
  return "member";
}

/** Serializable user context for marketing/app navigation (Server Component → client nav). */
export type NavUser = {
  email: string;
  firstName: string;
  lastName: string;
  profession: string | null;
  role: NavUserRole;
  /** Effective sidebar / preview mode for nav filtering (cookie for admins). */
  viewMode: AdminViewMode;
  /** Small "Admin" pill in AppNav — only when role is admin and preview is Admin view. */
  showAdminBadge: boolean;
};

export async function getNavUser(): Promise<NavUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, profession, role")
    .eq("id", user.id)
    .maybeSingle();

  const metaFirst = (user.user_metadata?.first_name as string | undefined)?.trim() ?? "";
  const metaLast = (user.user_metadata?.last_name as string | undefined)?.trim() ?? "";

  const role = normalizeRole(profile?.role);
  const cookieMode = await getCurrentViewMode();

  let viewMode: AdminViewMode;
  if (role === "admin") {
    viewMode = cookieMode;
  } else if (role === "contributor") {
    viewMode = "contributor";
  } else {
    viewMode = "user";
  }

  const showAdminBadge = role === "admin" && viewMode === "admin";

  return {
    email: user.email,
    firstName: profile?.first_name?.trim() ?? metaFirst,
    lastName: profile?.last_name?.trim() ?? metaLast,
    profession: profile?.profession ?? null,
    role,
    viewMode,
    showAdminBadge,
  };
}
