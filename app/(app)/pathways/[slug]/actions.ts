"use server";

import { revalidatePath } from "next/cache";

import { usesManualPathwayCompletion } from "@/lib/pathways/manual-completion";
import { createClient } from "@/lib/supabase/server";
import type { PathwayModuleType } from "@/lib/pathways/types";

export type ModuleActionResult = { success: true } | { success: false; error: string };

export async function markModuleComplete(pathwaySlug: string, moduleId: string): Promise<ModuleActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const { data: pathwayRow, error: pwErr } = await supabase
    .from("pathways")
    .select("id")
    .eq("slug", pathwaySlug)
    .eq("status", "published")
    .maybeSingle();

  if (pwErr || !pathwayRow) {
    return { success: false, error: "Pathway not found." };
  }

  const pathwayId = String(pathwayRow.id);

  const { data: row, error: fetchErr } = await supabase
    .from("pathway_modules")
    .select("id, module_type")
    .eq("id", moduleId)
    .eq("pathway_id", pathwayId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { success: false, error: "Module not found." };
  }

  const moduleType = row.module_type as PathwayModuleType;
  if (!usesManualPathwayCompletion(moduleType)) {
    return { success: false, error: "This module type cannot be marked complete manually." };
  }

  const { error: insertErr } = await supabase.from("pathway_module_completions").insert({
    user_id: user.id,
    pathway_id: pathwayId,
    module_id: moduleId,
  });

  if (insertErr) {
    if (insertErr.code === "23505") {
      revalidatePath(`/pathways/${pathwaySlug}`);
      return { success: true };
    }
    return { success: false, error: insertErr.message || "Could not save completion." };
  }

  revalidatePath(`/pathways/${pathwaySlug}`);
  return { success: true };
}

export async function unmarkModuleComplete(pathwaySlug: string, moduleId: string): Promise<ModuleActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const { data: pathwayRow, error: pwErr } = await supabase
    .from("pathways")
    .select("id")
    .eq("slug", pathwaySlug)
    .eq("status", "published")
    .maybeSingle();

  if (pwErr || !pathwayRow) {
    return { success: false, error: "Pathway not found." };
  }

  const pathwayId = String(pathwayRow.id);

  const { data: row, error: fetchErr } = await supabase
    .from("pathway_modules")
    .select("id, module_type")
    .eq("id", moduleId)
    .eq("pathway_id", pathwayId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { success: false, error: "Module not found." };
  }

  const moduleType = row.module_type as PathwayModuleType;
  if (!usesManualPathwayCompletion(moduleType)) {
    return { success: false, error: "This module type cannot be unmarked manually." };
  }

  const { error: delErr } = await supabase.from("pathway_module_completions").delete().eq("user_id", user.id).eq("module_id", moduleId);

  if (delErr) {
    return { success: false, error: delErr.message || "Could not remove completion." };
  }

  revalidatePath(`/pathways/${pathwaySlug}`);
  return { success: true };
}
