import { createClient } from "@/lib/supabase/server";

export type AdminDashboardCounts = {
  posts: { published: number; draft: number };
  courses: { published: number; draft: number };
  quizzes: { published: number; draft: number };
  decks: { published: number; draft: number };
  pathways: { published: number; draft: number };
};

export type AdminRecentItemKind = "post" | "course" | "quiz" | "deck" | "pathway";

export type AdminRecentItem = {
  kind: AdminRecentItemKind;
  id: string;
  title: string;
  status: "draft" | "published";
  updatedAt: string;
  href: string;
  typeLabel: string;
};

function normalizeStatus(raw: string | null | undefined): "draft" | "published" {
  return raw === "published" ? "published" : "draft";
}

async function headCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "blog_posts" | "courses" | "quizzes" | "flashcard_decks" | "pathways",
  filters: Record<string, string>,
): Promise<number> {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [col, val] of Object.entries(filters)) {
    q = q.eq(col, val);
  }
  const { count, error } = await q;
  if (error) {
    console.error(`[admin dashboard] count ${table}`, error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Platform-wide draft/published counts for the admin dashboard.
 * Intended for full admins only (caller should gate role + view mode).
 */
export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const supabase = await createClient();

  const [
    postsPublished,
    postsDraft,
    coursesPublished,
    coursesDraft,
    quizzesPublished,
    quizzesDraft,
    decksPublished,
    decksDraft,
    pathwaysPublished,
    pathwaysDraft,
  ] = await Promise.all([
    headCount(supabase, "blog_posts", { status: "published" }),
    headCount(supabase, "blog_posts", { status: "draft" }),
    headCount(supabase, "courses", { status: "published" }),
    headCount(supabase, "courses", { status: "draft" }),
    headCount(supabase, "quizzes", { status: "published", kind: "curated" }),
    headCount(supabase, "quizzes", { status: "draft", kind: "curated" }),
    headCount(supabase, "flashcard_decks", { status: "published" }),
    headCount(supabase, "flashcard_decks", { status: "draft" }),
    headCount(supabase, "pathways", { status: "published" }),
    headCount(supabase, "pathways", { status: "draft" }),
  ]);

  return {
    posts: { published: postsPublished, draft: postsDraft },
    courses: { published: coursesPublished, draft: coursesDraft },
    quizzes: { published: quizzesPublished, draft: quizzesDraft },
    decks: { published: decksPublished, draft: decksDraft },
    pathways: { published: pathwaysPublished, draft: pathwaysDraft },
  };
}

const RECENT_PER_TABLE = 5;
const RECENT_MERGED_MAX = 10;

function postHref(id: string): string {
  return `/admin/blog/${id}/edit`;
}

function courseHref(id: string): string {
  return `/admin/courses/${id}/edit`;
}

function quizHref(id: string): string {
  return `/admin/quiz-bank/quizzes/${id}/edit`;
}

function deckHref(id: string): string {
  return `/admin/flashcards/decks/${id}/edit`;
}

function pathwayHref(id: string): string {
  return `/admin/pathways/${id}/edit`;
}

function safeTitle(raw: string | null | undefined): string {
  const t = raw?.trim();
  return t && t.length > 0 ? t : "Untitled";
}

/**
 * Recent updates across CMS tables (newest first), for admin dashboard only.
 */
export async function getAdminDashboardRecentActivity(): Promise<AdminRecentItem[]> {
  const supabase = await createClient();

  const [postsRes, coursesRes, quizzesRes, decksRes, pathwaysRes] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(RECENT_PER_TABLE),
    supabase
      .from("courses")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(RECENT_PER_TABLE),
    supabase
      .from("quizzes")
      .select("id, title, status, updated_at")
      .eq("kind", "curated")
      .order("updated_at", { ascending: false })
      .limit(RECENT_PER_TABLE),
    supabase
      .from("flashcard_decks")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(RECENT_PER_TABLE),
    supabase
      .from("pathways")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(RECENT_PER_TABLE),
  ]);

  const errors = [postsRes.error, coursesRes.error, quizzesRes.error, decksRes.error, pathwaysRes.error].filter(
    Boolean,
  );
  for (const err of errors) {
    console.error("[admin dashboard] recent activity", err?.message);
  }

  const merged: AdminRecentItem[] = [];

  for (const row of postsRes.data ?? []) {
    merged.push({
      kind: "post",
      id: String(row.id),
      title: safeTitle(row.title),
      status: normalizeStatus(row.status),
      updatedAt: String(row.updated_at),
      href: postHref(String(row.id)),
      typeLabel: "Blog post",
    });
  }
  for (const row of coursesRes.data ?? []) {
    merged.push({
      kind: "course",
      id: String(row.id),
      title: safeTitle(row.title),
      status: normalizeStatus(row.status),
      updatedAt: String(row.updated_at),
      href: courseHref(String(row.id)),
      typeLabel: "Course",
    });
  }
  for (const row of quizzesRes.data ?? []) {
    merged.push({
      kind: "quiz",
      id: String(row.id),
      title: safeTitle(row.title),
      status: normalizeStatus(row.status),
      updatedAt: String(row.updated_at),
      href: quizHref(String(row.id)),
      typeLabel: "Quiz",
    });
  }
  for (const row of decksRes.data ?? []) {
    merged.push({
      kind: "deck",
      id: String(row.id),
      title: safeTitle(row.title),
      status: normalizeStatus(row.status),
      updatedAt: String(row.updated_at),
      href: deckHref(String(row.id)),
      typeLabel: "Flashcard deck",
    });
  }
  for (const row of pathwaysRes.data ?? []) {
    merged.push({
      kind: "pathway",
      id: String(row.id),
      title: safeTitle(row.title),
      status: normalizeStatus(row.status),
      updatedAt: String(row.updated_at),
      href: pathwayHref(String(row.id)),
      typeLabel: "Pathway",
    });
  }

  merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return merged.slice(0, RECENT_MERGED_MAX);
}
