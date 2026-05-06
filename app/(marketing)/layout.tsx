import { AppShell } from "@/components/layout/AppShell";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { getNavUser } from "@/lib/auth/nav-user";

export default async function MarketingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getNavUser();

  if (!initialUser) {
    return <MarketingShell initialUser={null}>{children}</MarketingShell>;
  }

  return <AppShell user={initialUser}>{children}</AppShell>;
}
