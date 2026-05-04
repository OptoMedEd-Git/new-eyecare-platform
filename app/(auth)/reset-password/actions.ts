"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData): Promise<void> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!newPassword || !confirmPassword) {
    redirect("/reset-password?error=" + encodeURIComponent("Please fill in both password fields."));
  }
  if (newPassword.length < 8) {
    redirect(
      "/reset-password?error=" +
        encodeURIComponent("Password must be at least 8 characters."),
    );
  }
  if (newPassword !== confirmPassword) {
    redirect("/reset-password?error=" + encodeURIComponent("Passwords do not match."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/forgot-password?error=" +
        encodeURIComponent(
          "Your reset session expired or is invalid. Please request a new reset link.",
        ),
    );
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect("/reset-password?error=" + encodeURIComponent(error.message));
  }

  redirect("/reset-password/success");
}
