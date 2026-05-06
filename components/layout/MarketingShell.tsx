import { Footer } from "@/components/layout/Footer";
import { MarketingNav } from "@/components/layout/MarketingNav";
import type { NavUser } from "@/lib/auth/nav-user";

export function MarketingShell({
  initialUser,
  children,
}: {
  initialUser: NavUser | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary-soft">
      <MarketingNav key={initialUser ? `u:${initialUser.email}` : "out"} initialUser={initialUser} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

