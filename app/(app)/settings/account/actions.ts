"use server";

import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ACCOUNT_PROFESSION_OPTIONS } from "./professionOptions";

const ALLOWED_PROFESSION_VALUES = new Set<string>(
  ACCOUNT_PROFESSION_OPTIONS.map((o) => o.value),
);

/** Server-only admin client. Not exported — do not import from client components. */
function createAdminClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function passwordMeetsPolicy(password: string): {
  ok: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (!/[a-z]/.test(password)) {
    return { ok: false, error: "Password must include at least one lowercase letter." };
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, error: "Password must include at least one uppercase letter." };
  }
  if (!/[\d\W_]/.test(password)) {
    return {
      ok: false,
      error: "Password must include at least one number or special character.",
    };
  }
  return { ok: true };
}

export async function updateProfile(formData: FormData): Promise<void> {
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const profession = String(formData.get("profession") ?? "").trim();

  if (!firstName || !lastName) {
    redirect(
      "/settings/account?error=" + encodeURIComponent("First name and last name are required."),
    );
  }
  if (!profession || !ALLOWED_PROFESSION_VALUES.has(profession)) {
    redirect(
      "/settings/account?error=" + encodeURIComponent("Please select a valid profession."),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      profession,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect("/settings/account?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/settings/account");
  revalidatePath("/dashboard");
  redirect("/settings/account?success=profile-updated");
}

export async function updatePassword(formData: FormData): Promise<void> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect(
      "/settings/account?error=" + encodeURIComponent("Please fill in all password fields."),
    );
  }
  if (newPassword !== confirmPassword) {
    redirect("/settings/account?error=" + encodeURIComponent("New passwords do not match."));
  }

  const policy = passwordMeetsPolicy(newPassword);
  if (!policy.ok && policy.error) {
    redirect("/settings/account?error=" + encodeURIComponent(policy.error));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    redirect(
      "/settings/account?error=" + encodeURIComponent("Current password is incorrect."),
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    redirect("/settings/account?error=" + encodeURIComponent(updateError.message));
  }

  revalidatePath("/settings/account");
  revalidatePath("/dashboard");
  redirect("/settings/account?success=password-updated");
}

export async function deleteAccount(
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "DELETE") {
    return { error: 'Please type DELETE exactly to confirm.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error: "Account deletion is not configured (missing service role key).",
    };
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  await supabase.auth.signOut();
  redirect("/?deleted=true");
}
