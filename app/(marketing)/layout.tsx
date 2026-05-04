import { Footer } from "@/components/layout/Footer";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { getNavUser } from "@/lib/auth/nav-user";

export default async function MarketingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getNavUser();

  return (
    <>
      <MarketingNav
        key={initialUser ? `u:${initialUser.email}` : "out"}
        initialUser={initialUser}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
