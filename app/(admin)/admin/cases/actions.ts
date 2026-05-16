"use server";

import { revalidatePath } from "next/cache";

import type { FindingsFormState } from "@/lib/cases/findings-form";
import {
  medicalFormRowsToPayload,
  ocularFormRowsToPayload,
  type MedicalConditionFormRow,
  type OcularConditionFormRow,
} from "@/lib/cases/history-form";
import type { CaseFindingType, CaseLaterality } from "@/lib/cases/types";
import { CASE_FINDING_TYPES } from "@/lib/cases/types";
import { ensureUniqueSlug, slugifyShort } from "@/lib/blog/slugify";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type AuthoringRole = "admin" | "contributor";

const DIFFICULTIES = ["foundational", "intermediate", "advanced"] as const;
const AUDIENCES = ["student", "resident", "practicing", "all"] as const;
const SEX_VALUES = ["M", "F", "Other", "Unspecified"] as const;
const LATERALITY_VALUES = ["OD", "OS", "OU", "none"] as const;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getNullableString(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getRichText(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '{"type":"doc","content":[]}') return null;
  return trimmed;
}

function parseDifficulty(formData: FormData): (typeof DIFFICULTIES)[number] | null {
  const raw = String(formData.get("difficulty") ?? "").trim();
  return DIFFICULTIES.includes(raw as (typeof DIFFICULTIES)[number])
    ? (raw as (typeof DIFFICULTIES)[number])
    : null;
}

function parseAudience(formData: FormData): (typeof AUDIENCES)[number] | null {
  const raw = String(formData.get("target_audience") ?? "").trim();
  return AUDIENCES.includes(raw as (typeof AUDIENCES)[number])
    ? (raw as (typeof AUDIENCES)[number])
    : null;
}

function parsePatientSex(formData: FormData): (typeof SEX_VALUES)[number] | null {
  const raw = String(formData.get("patient_sex") ?? "").trim();
  if (!raw) return null;
  return SEX_VALUES.includes(raw as (typeof SEX_VALUES)[number])
    ? (raw as (typeof SEX_VALUES)[number])
    : null;
}

function parsePatientAge(formData: FormData): number | null {
  const raw = String(formData.get("patient_age") ?? "").trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0 || n > 150) return null;
  return n;
}

function parseFindingsState(raw: string): FindingsFormState | null {
  try {
    const parsed = JSON.parse(raw) as FindingsFormState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

type HistorySelectionsPayload = {
  ocular: OcularConditionFormRow[];
  medical: MedicalConditionFormRow[];
};

function parseLaterality(value: unknown): CaseLaterality {
  if (typeof value === "string" && LATERALITY_VALUES.includes(value as CaseLaterality)) {
    return value as CaseLaterality;
  }
  return "OU";
}

function parseHistorySelections(raw: string): HistorySelectionsPayload | null {
  try {
    const parsed = JSON.parse(raw) as HistorySelectionsPayload;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.ocular) || !Array.isArray(parsed.medical)) return null;
    return {
      ocular: parsed.ocular.map((row) => ({
        conditionId: String(row.conditionId),
        checked: Boolean(row.checked),
        laterality: parseLaterality(row.laterality),
      })),
      medical: parsed.medical.map((row) => ({
        conditionId: String(row.conditionId),
        checked: Boolean(row.checked),
      })),
    };
  } catch {
    return null;
  }
}

async function getAuthedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: "admin" | "contributor" | "member" }>();

  if (error || !profile) throw new Error("Profile not found");
  if (profile.role !== "admin" && profile.role !== "contributor") {
    throw new Error("Insufficient permissions");
  }

  return { user, role: profile.role as AuthoringRole, supabase };
}

async function authorizeCaseWrite(
  ctx: Awaited<ReturnType<typeof getAuthedContext>>,
  caseId: string,
): Promise<{ id: string; author_id: string | null; slug: string }> {
  const { data: row, error } = await ctx.supabase
    .from("cases")
    .select("id, author_id, slug")
    .eq("id", caseId)
    .maybeSingle<{ id: string; author_id: string | null; slug: string }>();

  if (error || !row) throw new Error("Case not found");
  if (ctx.role !== "admin" && row.author_id !== ctx.user.id) {
    throw new Error("You can only manage cases you created.");
  }
  return row;
}

function casePayloadFromForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const difficulty = parseDifficulty(formData);
  const audience = parseAudience(formData);
  const statusRaw = String(formData.get("status") ?? "draft").trim();
  const status = statusRaw === "published" ? "published" : "draft";

  return {
    title,
    slugInput,
    categoryId,
    difficulty,
    audience,
    status,
    chiefComplaint: getNullableString(formData, "chief_complaint"),
    hpi: getRichText(formData, "hpi"),
    patientAge: parsePatientAge(formData),
    patientSex: parsePatientSex(formData),
    patientEthnicity: getNullableString(formData, "patient_ethnicity"),
    pastOcularHistory: getNullableString(formData, "past_ocular_history"),
    pastMedicalHistory: getNullableString(formData, "past_medical_history"),
    medications: getNullableString(formData, "medications"),
    allergies: getNullableString(formData, "allergies"),
    learningObjectives: getRichText(formData, "learning_objectives"),
  };
}

function validateCasePayload(payload: ReturnType<typeof casePayloadFromForm>): string | null {
  if (!payload.title) return "Title is required";
  if (!payload.categoryId || !isUuid(payload.categoryId)) return "Category is required";
  if (!payload.difficulty) return "Difficulty is required";
  if (!payload.audience) return "Audience is required";
  return null;
}

function revalidateCasePaths(slug?: string | null) {
  revalidatePath("/admin/cases");
  if (slug) {
    revalidatePath(`/cases/${slug}`);
  }
}

export async function createCase(formData: FormData): Promise<ActionResult<{ caseId: string }>> {
  try {
    const ctx = await getAuthedContext();
    const payload = casePayloadFromForm(formData);
    const validationError = validateCasePayload(payload);
    if (validationError) return { ok: false, error: validationError };

    const baseSlug = payload.slugInput ? slugifyShort(payload.slugInput) : slugifyShort(payload.title);
    if (!baseSlug) return { ok: false, error: "Could not derive a URL slug from the title" };

    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const { data } = await ctx.supabase.from("cases").select("id").eq("slug", s).maybeSingle();
      return Boolean(data);
    });

    const publishedAt = payload.status === "published" ? new Date().toISOString() : null;

    const { data, error } = await ctx.supabase
      .from("cases")
      .insert({
        title: payload.title,
        slug,
        chief_complaint: payload.chiefComplaint,
        hpi: payload.hpi,
        patient_age: payload.patientAge,
        patient_sex: payload.patientSex,
        patient_ethnicity: payload.patientEthnicity,
        past_ocular_history: payload.pastOcularHistory,
        past_medical_history: payload.pastMedicalHistory,
        medications: payload.medications,
        allergies: payload.allergies,
        category_id: payload.categoryId,
        difficulty: payload.difficulty,
        target_audience: payload.audience,
        status: payload.status,
        author_id: ctx.user.id,
        learning_objectives: payload.learningObjectives,
        published_at: publishedAt,
      })
      .select("id, slug")
      .maybeSingle();

    if (error || !data) {
      console.error("[cases] createCase", error);
      return { ok: false, error: "Could not create case" };
    }

    revalidateCasePaths(data.slug);
    return { ok: true, data: { caseId: data.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create case" };
  }
}

export async function updateCase(caseId: string, formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await getAuthedContext();
    await authorizeCaseWrite(ctx, caseId);

    const payload = casePayloadFromForm(formData);
    const validationError = validateCasePayload(payload);
    if (validationError) return { ok: false, error: validationError };

    const slugFinal = payload.slugInput ? slugifyShort(payload.slugInput) : slugifyShort(payload.title);
    if (!slugFinal) return { ok: false, error: "Slug is required" };

    const { data: dup } = await ctx.supabase
      .from("cases")
      .select("id")
      .eq("slug", slugFinal)
      .neq("id", caseId)
      .maybeSingle();

    if (dup) return { ok: false, error: "Slug is already in use" };

    const { data: prev } = await ctx.supabase
      .from("cases")
      .select("status, published_at, slug")
      .eq("id", caseId)
      .maybeSingle<{ status: string; published_at: string | null; slug: string }>();

    let publishedAt = prev?.published_at ?? null;
    if (payload.status === "published" && !publishedAt) {
      publishedAt = new Date().toISOString();
    }
    if (payload.status === "draft") {
      publishedAt = null;
    }

    const { error } = await ctx.supabase
      .from("cases")
      .update({
        title: payload.title,
        slug: slugFinal,
        chief_complaint: payload.chiefComplaint,
        hpi: payload.hpi,
        patient_age: payload.patientAge,
        patient_sex: payload.patientSex,
        patient_ethnicity: payload.patientEthnicity,
        past_ocular_history: payload.pastOcularHistory,
        past_medical_history: payload.pastMedicalHistory,
        medications: payload.medications,
        allergies: payload.allergies,
        category_id: payload.categoryId,
        difficulty: payload.difficulty,
        target_audience: payload.audience,
        status: payload.status,
        learning_objectives: payload.learningObjectives,
        published_at: publishedAt,
      })
      .eq("id", caseId);

    if (error) {
      console.error("[cases] updateCase", error);
      return { ok: false, error: "Could not update case" };
    }

    revalidateCasePaths(slugFinal);
    if (prev?.slug && prev.slug !== slugFinal) {
      revalidateCasePaths(prev.slug);
    }
    revalidatePath(`/admin/cases/${caseId}/edit`);

    const findingsJson = formData.get("findings_json");
    if (typeof findingsJson === "string" && findingsJson.trim()) {
      const findingsResult = await updateCaseFindings(caseId, findingsJson);
      if (!findingsResult.ok) return findingsResult;
    }

    const historyJson = formData.get("history_selections");
    if (typeof historyJson === "string" && historyJson.trim()) {
      const historyResult = await updateCaseHistorySelections(caseId, historyJson);
      if (!historyResult.ok) return historyResult;
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update case" };
  }
}

/** Alias for spec naming; persists delete-and-recreate history selections. */
export const updateCaseHistory = updateCaseHistorySelections;

export async function updateCaseFindings(
  caseId: string,
  findingsJson: string,
): Promise<ActionResult> {
  try {
    const ctx = await getAuthedContext();
    await authorizeCaseWrite(ctx, caseId);

    const state = parseFindingsState(findingsJson);
    if (!state) return { ok: false, error: "Invalid findings data" };

    const { data: catalogRows, error: catalogError } = await ctx.supabase
      .from("finding_row_catalog")
      .select("finding_type, row_key, position");

    if (catalogError || !catalogRows) {
      return { ok: false, error: "Could not load findings catalog" };
    }

    const positionByKey = new Map<string, number>();
    for (const row of catalogRows as Array<{
      finding_type: CaseFindingType;
      row_key: string;
      position: number;
    }>) {
      positionByKey.set(`${row.finding_type}:${row.row_key}`, row.position);
    }

    for (const findingType of CASE_FINDING_TYPES) {
      const tableRows = state[findingType];

      if (tableRows === null) {
        const { error: delError } = await ctx.supabase
          .from("case_findings_rows")
          .delete()
          .eq("case_id", caseId)
          .eq("finding_type", findingType);

        if (delError) {
          console.error("[cases] delete findings", delError);
          return { ok: false, error: "Could not update findings" };
        }
        continue;
      }

      const catalogForType = (catalogRows as Array<{
        finding_type: CaseFindingType;
        row_key: string;
        position: number;
      }>).filter((r) => r.finding_type === findingType);

      const upsertPayload = catalogForType.map((cat) => {
        const formRow = tableRows.find((r) => r.rowKey === cat.row_key);
        const od = formRow?.odValue?.trim() ?? "";
        const os = formRow?.osValue?.trim() ?? "";
        return {
          case_id: caseId,
          finding_type: findingType,
          row_key: cat.row_key,
          od_value: od.length > 0 ? od : null,
          os_value: os.length > 0 ? os : null,
          position: positionByKey.get(`${findingType}:${cat.row_key}`) ?? cat.position,
        };
      });

      const { error: upsertError } = await ctx.supabase
        .from("case_findings_rows")
        .upsert(upsertPayload, { onConflict: "case_id,finding_type,row_key" });

      if (upsertError) {
        console.error("[cases] upsert findings", upsertError);
        return { ok: false, error: "Could not save findings" };
      }
    }

    revalidatePath(`/admin/cases/${caseId}/edit`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update findings" };
  }
}

export async function updateCaseHistorySelections(
  caseId: string,
  historyJson: string,
): Promise<ActionResult> {
  try {
    const ctx = await getAuthedContext();
    await authorizeCaseWrite(ctx, caseId);

    const state = parseHistorySelections(historyJson);
    if (!state) return { ok: false, error: "Invalid history selections" };

    const { error: delOcularError } = await ctx.supabase
      .from("case_ocular_history")
      .delete()
      .eq("case_id", caseId);

    if (delOcularError) {
      console.error("[cases] delete ocular history", delOcularError);
      return { ok: false, error: "Could not update ocular history" };
    }

    const ocularPayload = ocularFormRowsToPayload(state.ocular);
    if (ocularPayload.length > 0) {
      const { error: insertOcularError } = await ctx.supabase.from("case_ocular_history").insert(
        ocularPayload.map((row) => ({
          case_id: caseId,
          condition_id: row.conditionId,
          laterality: row.laterality,
        })),
      );

      if (insertOcularError) {
        console.error("[cases] insert ocular history", insertOcularError);
        return { ok: false, error: "Could not save ocular history" };
      }
    }

    const { error: delMedicalError } = await ctx.supabase
      .from("case_medical_history")
      .delete()
      .eq("case_id", caseId);

    if (delMedicalError) {
      console.error("[cases] delete medical history", delMedicalError);
      return { ok: false, error: "Could not update medical history" };
    }

    const medicalPayload = medicalFormRowsToPayload(state.medical);
    if (medicalPayload.length > 0) {
      const { error: insertMedicalError } = await ctx.supabase.from("case_medical_history").insert(
        medicalPayload.map((row) => ({
          case_id: caseId,
          condition_id: row.conditionId,
        })),
      );

      if (insertMedicalError) {
        console.error("[cases] insert medical history", insertMedicalError);
        return { ok: false, error: "Could not save medical history" };
      }
    }

    revalidatePath(`/admin/cases/${caseId}/edit`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not update history selections",
    };
  }
}
