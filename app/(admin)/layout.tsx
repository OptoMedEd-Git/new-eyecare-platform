import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getNavUser } from "@/lib/auth/nav-user";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getNavUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "member") {
    redirect("/dashboard");
  }

  return (
    <AppShell user={user}>
      <main className="mx-auto w-full max-w-7xl flex-1 bg-gray-50 px-6 py-12 dark:bg-gray-950/40">
        {children}
      </main>
    </AppShell>
  );
}
