import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const code = requestUrl.searchParams.get("code");

  if (!code) {
    const redirectUrl = new URL("/forgot-password", origin);
    redirectUrl.searchParams.set("error", "Invalid or expired link.");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const redirectUrl = new URL("/forgot-password", origin);
    redirectUrl.searchParams.set(
      "error",
      "Invalid or expired link. Please request a new password reset.",
    );
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = new URL("/reset-password", origin);
  return NextResponse.redirect(redirectUrl);
}
