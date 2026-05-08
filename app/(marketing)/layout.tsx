import { MarketingShell } from "@/components/layout/MarketingShell";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MarketingShell>{children}</MarketingShell>;
}
