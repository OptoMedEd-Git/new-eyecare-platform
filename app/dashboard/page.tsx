import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { logout } from "./actions";

type Profile = {
  first_name: string | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const firstName =
    profile?.first_name ?? (user.user_metadata?.first_name as string | undefined) ?? "there";

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24">
      <div className="w-full max-w-3xl">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                  Welcome back, {firstName}!
                </h1>
                <p className="text-sm text-text-body">
                  You&apos;re signed in as <span className="font-medium">{user.email}</span>
                </p>
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-text-body shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <p className="text-base leading-6">
                Your dashboard is coming soon. We&apos;re building amazing learning tools just for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

