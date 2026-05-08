import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getNavUser } from "@/lib/auth/nav-user";

export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getNavUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <main className="min-h-0 flex-1 bg-gray-50 dark:bg-gray-950/40">{children}</main>
    </AppShell>
  );
}
