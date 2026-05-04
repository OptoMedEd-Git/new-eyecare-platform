"use server";

import { createClient } from "@/lib/supabase/server";

export type LoginResult = { success: true } | { error: string };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function login(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!password) {
    return { error: "Please enter your password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (msg.includes("email not confirmed") || msg.includes("confirm your email")) {
      return {
        error:
          "Please confirm your email before logging in. Check your inbox for the confirmation link.",
      };
    }
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}

