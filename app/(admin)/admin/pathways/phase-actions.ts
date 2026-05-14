"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type PhaseActionResult = { success: true } | { success: false; error: string };

const TEMP_POSITION = 999_999;

function revalidatePathwayEdit(pathwayId: string) {
  revalidatePath(`/admin/pathways/${pathwayId}/edit`);
}

async function assertPathwayAuthor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pathwayId: string,
  userId: string,
): Promise<{ ok: true; pathwayId: string } | { ok: false; error: string }> {
  const { data: pathway } = await supabase.from("pathways").select("id, author_id").eq("id", pathwayId).maybeSingle();
  if (!pathway) return { ok: false, error: "Pathway not found" };
  if (pathway.author_id !== userId) return { ok: false, error: "Not authorized" };
  return { ok: true, pathwayId: pathway.id };
}

export async function addPhase(
  pathwayId: string,
  title: string,
  description: string | null,
): Promise<PhaseActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const auth = await assertPathwayAuthor(supabase, pathwayId, user.id);
  if (!auth.ok) return { success: false, error: auth.error };

  const trimmedTitle = title.trim();
  if (!trimmedTitle) return { success: false, error: "Phase title is required" };

  const { data: lastRow } = await supabase
    .from("pathway_phases")
    .select("position")
    .eq("pathway_id", pathwayId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastRow?.position ?? -1) + 1;

  const { error } = await supabase.from("pathway_phases").insert({
    pathway_id: pathwayId,
    position: nextPosition,
    title: trimmedTitle,
    description: description?.trim() || null,
  });

  if (error) {
    console.error("addPhase error:", error);
    return { success: false, error: "Could not add phase" };
  }

  revalidatePathwayEdit(pathwayId);
  return { success: true };
}

export async function removePhase(phaseId: string): Promise<PhaseActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: phase, error: phErr } = await supabase
    .from("pathway_phases")
    .select("id, pathway_id, position")
    .eq("id", phaseId)
    .maybeSingle();

  if (phErr || !phase) return { success: false, error: "Phase not found" };

  const auth = await assertPathwayAuthor(supabase, phase.pathway_id, user.id);
  if (!auth.ok) return { success: false, error: auth.error };

  const { data: anyModule } = await supabase.from("pathway_modules").select("id").eq("phase_id", phaseId).limit(1).maybeSingle();

  if (anyModule) {
    return {
      success: false,
      error: "Remove or move this phase's modules before deleting it.",
    };
  }

  const { error: delErr } = await supabase.from("pathway_phases").delete().eq("id", phaseId);
  if (delErr) return { success: false, error: "Could not delete phase" };

  const { data: toUpdate } = await supabase
    .from("pathway_phases")
    .select("id, position")
    .eq("pathway_id", phase.pathway_id)
    .gt("position", phase.position)
    .order("position", { ascending: true });

  for (const p of toUpdate ?? []) {
    const { error: uErr } = await supabase.from("pathway_phases").update({ position: p.position - 1 }).eq("id", p.id);
    if (uErr) return { success: false, error: "Could not compact phase order" };
  }

  revalidatePathwayEdit(phase.pathway_id);
  return { success: true };
}

export async function reorderPhase(phaseId: string, direction: -1 | 1): Promise<PhaseActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: srcPhase, error: srcErr } = await supabase
    .from("pathway_phases")
    .select("id, pathway_id, position")
    .eq("id", phaseId)
    .maybeSingle();

  if (srcErr || !srcPhase) return { success: false, error: "Phase not found" };

  const auth = await assertPathwayAuthor(supabase, srcPhase.pathway_id, user.id);
  if (!auth.ok) return { success: false, error: auth.error };

  const fromPosition = srcPhase.position;
  const toPosition = fromPosition + direction;

  const { data: tgtPhase } = await supabase
    .from("pathway_phases")
    .select("id")
    .eq("pathway_id", srcPhase.pathway_id)
    .eq("position", toPosition)
    .maybeSingle();

  if (!tgtPhase) {
    return { success: false, error: "Cannot reorder — no adjacent phase in that direction." };
  }

  const sourceId = srcPhase.id;

  let err = (await supabase.from("pathway_phases").update({ position: TEMP_POSITION }).eq("id", sourceId)).error;
  if (err) return { success: false, error: "Reorder step 1 failed" };

  if (fromPosition < toPosition) {
    const { data: between } = await supabase
      .from("pathway_phases")
      .select("id, position")
      .eq("pathway_id", srcPhase.pathway_id)
      .gt("position", fromPosition)
      .lte("position", toPosition)
      .order("position", { ascending: true });

    for (const row of between ?? []) {
      err = (await supabase.from("pathway_phases").update({ position: row.position - 1 }).eq("id", row.id)).error;
      if (err) return { success: false, error: "Reorder step 2 failed" };
    }
  } else {
    const { data: between } = await supabase
      .from("pathway_phases")
      .select("id, position")
      .eq("pathway_id", srcPhase.pathway_id)
      .gte("position", toPosition)
      .lt("position", fromPosition)
      .order("position", { ascending: false });

    for (const row of between ?? []) {
      err = (await supabase.from("pathway_phases").update({ position: row.position + 1 }).eq("id", row.id)).error;
      if (err) return { success: false, error: "Reorder step 2 failed" };
    }
  }

  err = (await supabase.from("pathway_phases").update({ position: toPosition }).eq("id", sourceId)).error;
  if (err) return { success: false, error: "Reorder step 3 failed" };

  revalidatePathwayEdit(srcPhase.pathway_id);
  return { success: true };
}

export async function updatePhase(phaseId: string, title: string, description: string | null): Promise<PhaseActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: phase, error: phErr } = await supabase.from("pathway_phases").select("id, pathway_id").eq("id", phaseId).maybeSingle();

  if (phErr || !phase) return { success: false, error: "Phase not found" };

  const auth = await assertPathwayAuthor(supabase, phase.pathway_id, user.id);
  if (!auth.ok) return { success: false, error: auth.error };

  const trimmedTitle = title.trim();
  if (!trimmedTitle) return { success: false, error: "Phase title is required" };

  const { error } = await supabase
    .from("pathway_phases")
    .update({
      title: trimmedTitle,
      description: description?.trim() || null,
    })
    .eq("id", phaseId);

  if (error) return { success: false, error: "Could not update phase" };

  revalidatePathwayEdit(phase.pathway_id);
  return { success: true };
}
