import { redirect } from "next/navigation";

import { AppNav } from "@/components/layout/AppNav";
import { Footer } from "@/components/layout/Footer";
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
    <>
      <AppNav user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
