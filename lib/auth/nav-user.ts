import { createClient } from "@/lib/supabase/server";

/** Serializable user context for marketing/app navigation (Server Component → client nav). */
export type NavUser = {
  email: string;
  firstName: string;
  lastName: string;
  profession: string | null;
};

export async function getNavUser(): Promise<NavUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, profession")
    .eq("id", user.id)
    .maybeSingle();

  const metaFirst = (user.user_metadata?.first_name as string | undefined)?.trim() ?? "";
  const metaLast = (user.user_metadata?.last_name as string | undefined)?.trim() ?? "";

  return {
    email: user.email,
    firstName: profile?.first_name?.trim() ?? metaFirst,
    lastName: profile?.last_name?.trim() ?? metaLast,
    profession: profile?.profession ?? null,
  };
}
