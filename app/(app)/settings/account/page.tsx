import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { DeleteAccountCard } from "./DeleteAccountCard";
import { GeneralInfoCard } from "./GeneralInfoCard";
import { PasswordCard } from "./PasswordCard";

type AccountSearchParams = {
  success?: string;
  error?: string;
};

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<AccountSearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, profession")
    .eq("id", user.id)
    .maybeSingle();

  const successKey = typeof sp.success === "string" ? sp.success : null;
  const errorMessage = typeof sp.error === "string" ? sp.error : null;

  return (
    <div className="flex flex-col gap-8">
      <GeneralInfoCard
        email={user.email ?? ""}
        profile={profile}
        successKey={successKey}
        errorMessage={errorMessage}
      />
      <PasswordCard successKey={successKey} errorMessage={errorMessage} />
      <DeleteAccountCard />
    </div>
  );
}
