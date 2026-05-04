"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ResendPasswordResetResult = { success: true } | { error: string };

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=" + encodeURIComponent("Email is required."));
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/forgot-password?error=" + encodeURIComponent("Enter a valid email address."));
  }

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    redirect(
      "/forgot-password?error=" +
        encodeURIComponent(
          "Password reset is not configured (missing NEXT_PUBLIC_SITE_URL). Please contact support.",
        ),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-callback`,
  });

  if (error) {
    let message = error.message;
    const lower = message.toLowerCase();
    const status = (error as { status?: number }).status;
    if (
      status === 429 ||
      lower.includes("rate limit") ||
      lower.includes("too many requests")
    ) {
      message =
        "Too many reset requests. Please wait a few minutes before trying again.";
    }
    redirect("/forgot-password?error=" + encodeURIComponent(message));
  }

  redirect("/forgot-password/check-email?email=" + encodeURIComponent(email));
}

export async function resendPasswordResetEmail(
  email: string,
): Promise<ResendPasswordResetResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { error: "Enter a valid email address." };
  }

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return { error: "Password reset is not configured. Please contact support." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
    redirectTo: `${siteUrl}/auth/reset-callback`,
  });

  if (error) {
    let message = error.message;
    if (
      error.message.toLowerCase().includes("rate limit") ||
      (error as { status?: number }).status === 429
    ) {
      message =
        "Too many reset requests. Please wait a few minutes before trying again.";
    }
    return { error: message };
  }

  return { success: true };
}
