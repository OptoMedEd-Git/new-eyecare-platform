import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function withConfirmedParam(nextPath: string) {
  const url = new URL(nextPath, "http://localhost");
  url.searchParams.set("confirmed", "true");
  return url.pathname + (url.search ? url.search : "");
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") ?? "/login";
  const nextPath = nextParam.startsWith("/") ? nextParam : "/login";

  if (!code) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set(
      "error",
      "Could not confirm email. Please try signing up again."
    );
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set(
      "error",
      "Could not confirm email. Please try signing up again."
    );
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = new URL(withConfirmedParam(nextPath), origin);
  return NextResponse.redirect(redirectUrl);
}

