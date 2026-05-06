import { MarketingShell } from "@/components/layout/MarketingShell";

export default async function MarketingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MarketingShell>{children}</MarketingShell>;
}
