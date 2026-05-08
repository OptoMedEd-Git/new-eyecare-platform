import { headers } from "next/headers";

import { MarketingShell } from "@/components/layout/MarketingShell";

/**
 * Blog routes use `app/(marketing)/blog/layout.tsx` to choose AppShell vs MarketingShell.
 * Avoid wrapping `/blog` here so we don't nest MarketingShell twice for logged-out visitors.
 */
export default async function MarketingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return <>{children}</>;
  }
  return <MarketingShell>{children}</MarketingShell>;
}
