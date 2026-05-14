"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { PathwayModuleType } from "@/lib/pathways/types";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export type AddModuleInput = {
  pathwayId: string;
  moduleType: PathwayModuleType;
  title: string;
  contextMarkdown?: string | null;
  courseId?: string | null;
  quizId?: string | null;
  flashcardDeckId?: string | null;
  blogPostId?: string | null;
  externalUrl?: string | null;
  externalLabel?: string | null;
};

const TEMP_POSITION = 999_999;

function revalidatePathwayEdit(pathwayId: string) {
  revalidatePath(`/admin/pathways/${pathwayId}/edit`);
}

export async function addPathwayModule(input: AddModuleInput): Promise<ActionResult<{ moduleId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: pathway } = await supabase
    .from("pathways")
    .select("id, author_id")
    .eq("id", input.pathwayId)
    .maybeSingle();

  if (!pathway) return { success: false, error: "Pathway not found" };
  if (pathway.author_id !== user.id) return { success: false, error: "Not authorized" };

  const title = input.title.trim();
  if (!title) return { success: false, error: "Module title is required" };
  if (title.length > 200) return { success: false, error: "Module title too long" };

  const t = input.moduleType;
  if (t === "external_resource") {
    const url = input.externalUrl?.trim() ?? "";
    if (!/^https?:\/\//i.test(url)) {
      return { success: false, error: "External URL must start with http:// or https://" };
    }
    const label = input.externalLabel?.trim() ?? "";
    if (!label) return { success: false, error: "External resource requires a label" };
  } else {
    const id =
      t === "course"
        ? input.courseId
        : t === "quiz"
          ? input.quizId
          : t === "flashcard_deck"
            ? input.flashcardDeckId
            : input.blogPostId;
    if (!id?.trim()) return { success: false, error: `${t} module requires a linked item` };
  }

  const { data: lastRow } = await supabase
    .from("pathway_modules")
    .select("position")
    .eq("pathway_id", input.pathwayId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastRow?.position ?? -1) + 1;

  const { data: moduleRow, error } = await supabase
    .from("pathway_modules")
    .insert({
      pathway_id: input.pathwayId,
      position: nextPosition,
      title,
      context_markdown: input.contextMarkdown?.trim() || null,
      module_type: t,
      course_id: t === "course" ? input.courseId : null,
      quiz_id: t === "quiz" ? input.quizId : null,
      flashcard_deck_id: t === "flashcard_deck" ? input.flashcardDeckId : null,
      blog_post_id: t === "blog_post" ? input.blogPostId : null,
      external_url: t === "external_resource" ? input.externalUrl?.trim() ?? null : null,
      external_label: t === "external_resource" ? input.externalLabel?.trim() ?? null : null,
    })
    .select("id")
    .maybeSingle();

  if (error || !moduleRow) {
    console.error("addPathwayModule error:", error);
    return { success: false, error: "Could not add module" };
  }

  revalidatePathwayEdit(input.pathwayId);
  return { success: true, data: { moduleId: moduleRow.id } };
}

export async function removePathwayModule(moduleId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: mod, error: modErr } = await supabase
    .from("pathway_modules")
    .select("id, pathway_id, position")
    .eq("id", moduleId)
    .maybeSingle();

  if (modErr || !mod) return { success: false, error: "Module not found" };

  const { data: pathway } = await supabase
    .from("pathways")
    .select("author_id")
    .eq("id", mod.pathway_id)
    .maybeSingle();

  if (!pathway || pathway.author_id !== user.id) return { success: false, error: "Not authorized" };

  const pathwayId = mod.pathway_id;
  const deletedPosition = mod.position;

  const { error: deleteError } = await supabase.from("pathway_modules").delete().eq("id", moduleId);

  if (deleteError) return { success: false, error: "Could not delete module" };

  const { data: toUpdate } = await supabase
    .from("pathway_modules")
    .select("id, position")
    .eq("pathway_id", pathwayId)
    .gt("position", deletedPosition)
    .order("position", { ascending: true });

  for (const m of toUpdate ?? []) {
    const { error: uErr } = await supabase
      .from("pathway_modules")
      .update({ position: m.position - 1 })
      .eq("id", m.id);
    if (uErr) return { success: false, error: "Could not compact module order" };
  }

  revalidatePathwayEdit(pathwayId);
  return { success: true };
}

export async function reorderPathwayModules(
  pathwayId: string,
  fromPosition: number,
  toPosition: number,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: pathway } = await supabase.from("pathways").select("author_id").eq("id", pathwayId).maybeSingle();
  if (!pathway || pathway.author_id !== user.id) return { success: false, error: "Not authorized" };

  if (fromPosition === toPosition) return { success: true };

  const { data: source, error: sErr } = await supabase
    .from("pathway_modules")
    .select("id")
    .eq("pathway_id", pathwayId)
    .eq("position", fromPosition)
    .maybeSingle();

  if (sErr || !source) return { success: false, error: "Source module not found" };

  let err = (await supabase.from("pathway_modules").update({ position: TEMP_POSITION }).eq("id", source.id)).error;
  if (err) return { success: false, error: "Reorder step 1 failed" };

  if (fromPosition < toPosition) {
    const { data: between } = await supabase
      .from("pathway_modules")
      .select("id, position")
      .eq("pathway_id", pathwayId)
      .gt("position", fromPosition)
      .lte("position", toPosition)
      .order("position", { ascending: true });

    for (const m of between ?? []) {
      err = (await supabase.from("pathway_modules").update({ position: m.position - 1 }).eq("id", m.id)).error;
      if (err) return { success: false, error: "Reorder step 2 failed" };
    }
  } else {
    const { data: between } = await supabase
      .from("pathway_modules")
      .select("id, position")
      .eq("pathway_id", pathwayId)
      .gte("position", toPosition)
      .lt("position", fromPosition)
      .order("position", { ascending: false });

    for (const m of between ?? []) {
      err = (await supabase.from("pathway_modules").update({ position: m.position + 1 }).eq("id", m.id)).error;
      if (err) return { success: false, error: "Reorder step 2 failed" };
    }
  }

  err = (await supabase.from("pathway_modules").update({ position: toPosition }).eq("id", source.id)).error;
  if (err) return { success: false, error: "Reorder step 3 failed" };

  revalidatePathwayEdit(pathwayId);
  return { success: true };
}

export async function updatePathwayModule(
  moduleId: string,
  updates: { title?: string; contextMarkdown?: string | null; externalUrl?: string; externalLabel?: string },
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: mod, error: modErr } = await supabase
    .from("pathway_modules")
    .select("id, pathway_id, module_type")
    .eq("id", moduleId)
    .maybeSingle();

  if (modErr || !mod) return { success: false, error: "Module not found" };

  const { data: pathway } = await supabase
    .from("pathways")
    .select("author_id")
    .eq("id", mod.pathway_id)
    .maybeSingle();

  if (!pathway || pathway.author_id !== user.id) return { success: false, error: "Not authorized" };

  const updateData: Record<string, string | null> = {};
  if (updates.title !== undefined) {
    const trimmed = updates.title.trim();
    if (!trimmed) return { success: false, error: "Title cannot be empty" };
    if (trimmed.length > 200) return { success: false, error: "Title too long" };
    updateData.title = trimmed;
  }
  if (updates.contextMarkdown !== undefined) {
    updateData.context_markdown = updates.contextMarkdown?.trim() || null;
  }
  if (mod.module_type === "external_resource") {
    if (updates.externalUrl !== undefined) {
      const u = updates.externalUrl.trim();
      if (!/^https?:\/\//i.test(u)) return { success: false, error: "URL must start with http:// or https://" };
      updateData.external_url = u;
    }
    if (updates.externalLabel !== undefined) {
      const lab = updates.externalLabel.trim();
      if (!lab) return { success: false, error: "Label cannot be empty" };
      updateData.external_label = lab;
    }
  }

  if (Object.keys(updateData).length === 0) return { success: true };

  const { error } = await supabase.from("pathway_modules").update(updateData).eq("id", moduleId);

  if (error) return { success: false, error: "Could not update module" };

  revalidatePathwayEdit(mod.pathway_id);
  return { success: true };
}
