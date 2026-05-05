import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  first_name: string | null;
  role: "admin" | "contributor" | "member";
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (!profile || profile.role === "member") {
    redirect("/dashboard");
  }

  const metaFirst = (user.user_metadata?.first_name as string | undefined)?.trim() ?? "";
  const firstName = profile.first_name?.trim() ?? metaFirst ?? "—";

  return (
    <div className="flex min-h-screen flex-col bg-bg-secondary">
      <AdminHeader user={{ firstName, role: profile.role }} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">{children}</main>
    </div>
  );
}

