"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export type ResendResult = { success: true } | { error: string };

async function resolveSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

export async function resendVerification(email: string): Promise<ResendResult> {
  if (!email) {
    return { error: "No email address provided." };
  }

  const siteUrl = await resolveSiteUrl();
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      return { error: "Too many requests. Please wait a few minutes before trying again." };
    }
    return { error: "Could not resend verification email. Please try again." };
  }

  return { success: true };
}

