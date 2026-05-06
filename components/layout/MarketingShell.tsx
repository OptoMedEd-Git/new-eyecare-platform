import { Footer } from "@/components/layout/Footer";
import { MarketingNav } from "@/components/layout/MarketingNav";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary-soft">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

