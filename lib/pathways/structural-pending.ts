import { createClient } from "@/lib/supabase/server";

/**
 * True when a published pathway's live phases/modules were touched after the last publish
 * (metadata-only saves do not bump `published_at`).
 */
export async function pathwayHasStructuralPendingChanges(
  pathwayId: string,
  publishedAt: string | null,
  status: string,
): Promise<boolean> {
  if (status !== "published" || !publishedAt) return false;

  const supabase = await createClient();
  const pubMs = new Date(publishedAt).getTime();

  const { data: mod } = await supabase
    .from("pathway_modules")
    .select("updated_at")
    .eq("pathway_id", pathwayId)
    .is("removed_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: ph } = await supabase
    .from("pathway_phases")
    .select("updated_at")
    .eq("pathway_id", pathwayId)
    .is("removed_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const mTime = mod?.updated_at ? new Date(String(mod.updated_at)).getTime() : 0;
  const pTime = ph?.updated_at ? new Date(String(ph.updated_at)).getTime() : 0;
  return Math.max(mTime, pTime) > pubMs;
}
