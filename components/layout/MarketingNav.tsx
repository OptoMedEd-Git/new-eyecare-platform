import { MarketingNavClient } from "@/components/layout/MarketingNavClient";
import { getNavUser } from "@/lib/auth/nav-user";

export async function MarketingNav() {
  const user = await getNavUser();
  return <MarketingNavClient user={user} />;
}
