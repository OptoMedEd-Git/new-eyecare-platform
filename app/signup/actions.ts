"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PROFESSION_OPTIONS } from "./professions";

const ALLOWED_PROFESSIONS = new Set<string>(
  PROFESSION_OPTIONS.map((o) => o.value)
);

export type SignupResult = { success: true } | { error: string };

function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  return "";
}

async function resolveSiteUrl(): Promise<string> {
  const configured = getSiteUrl();
  if (configured) return configured;

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}

export async function signup(formData: FormData): Promise<SignupResult> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const profession = String(formData.get("profession") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = phoneRaw.length > 0 ? phoneRaw : null;
  const termsAccepted = formData.get("termsAccepted") === "true";
  const marketingOptIn = formData.get("marketingOptIn") === "true";

  if (!firstName || !lastName) {
    return { error: "Please enter your first and last name." };
  }
  if (!email || !isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!isStrongPassword(password)) {
    return {
      error: "Password must be at least 8 characters with at least one number.",
    };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (!profession || !ALLOWED_PROFESSIONS.has(profession)) {
    return { error: "Please select a professional designation." };
  }
  if (!termsAccepted) {
    return { error: "You must accept the Terms of Use and Privacy Policy." };
  }

  const siteUrl = await resolveSiteUrl();
  const emailRedirectTo = `${siteUrl.replace(/\/$/, "")}/auth/callback`;

  const supabase = await createClient();

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        first_name: firstName,
        last_name: lastName,
        profession,
        phone,
        marketing_opt_in: marketingOptIn,
      },
    },
  });

  if (signUpError) {
    const msg = signUpError.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already been registered") ||
      signUpError.message.includes("User already registered")
    ) {
      return {
        error:
          "An account with this email already exists. Try logging in instead.",
      };
    }
    if (
      msg.includes("password") &&
      (msg.includes("weak") || msg.includes("least") || msg.includes("short"))
    ) {
      return {
        error:
          "Password must be at least 8 characters with at least one number.",
      };
    }
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}
