import { redirect } from "next/navigation";

import { AppMain } from "@/components/layout/AppMain";
import { AppNav } from "@/components/layout/AppNav";
import { Footer } from "@/components/layout/Footer";
import { getNavUser } from "@/lib/auth/nav-user";
import { SideNavProvider } from "@/lib/contexts/SideNavContext";

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
    <SideNavProvider>
      <AppNav user={user} />
      <AppMain>
        <main className="min-h-0 flex-1 bg-gray-50 dark:bg-gray-950/40">{children}</main>
        <Footer />
      </AppMain>
    </SideNavProvider>
  );
}
