import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/forgot-password?error=" +
        encodeURIComponent(
          "Open the reset link from your email first, or request a new password reset.",
        ),
    );
  }

  return <ResetPasswordForm />;
}
