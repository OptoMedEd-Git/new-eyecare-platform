import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookMarked, ClipboardList, FileText, GraduationCap, Map } from "lucide-react";

import { PostStatusPill } from "@/components/admin/PostStatusPill";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { StatCard } from "@/components/dashboard/StatCard";
import { getNavUser } from "@/lib/auth/nav-user";
import { formatRelativeTime } from "@/lib/blog/utils";
import { getAdminDashboardCounts, getAdminDashboardRecentActivity } from "@/lib/admin/dashboard-data";

export const metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const user = await getNavUser();
  if (!user) redirect("/login");

  if (!(user.role === "admin" && user.viewMode === "admin")) {
    if (user.role === "admin" && user.viewMode === "user") {
      redirect("/dashboard");
    }
    redirect("/admin/blog");
  }

  const firstName = user.firstName?.trim() || user.email.split("@")[0] || "there";

  const [counts, recent] = await Promise.all([getAdminDashboardCounts(), getAdminDashboardRecentActivity()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Admin dashboard" }]} />
        <div className="mt-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-heading lg:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-base leading-7 text-text-body">
            Here&apos;s a snapshot of published content and drafts across the platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Blog posts"
          value={counts.posts.published}
          context={`${counts.posts.draft} draft`}
        />
        <StatCard
          icon={GraduationCap}
          label="Courses"
          value={counts.courses.published}
          context={`${counts.courses.draft} draft`}
        />
        <StatCard
          icon={ClipboardList}
          label="Quizzes"
          value={counts.quizzes.published}
          context={`${counts.quizzes.draft} draft`}
        />
        <StatCard
          icon={BookMarked}
          label="Flashcard decks"
          value={counts.decks.published}
          context={`${counts.decks.draft} draft`}
        />
        <StatCard
          icon={Map}
          label="Pathways"
          value={counts.pathways.published}
          context={`${counts.pathways.draft} draft`}
        />
      </div>

      <section>
        <h2 className="text-xl font-bold text-text-heading">Recently updated</h2>
        <p className="mt-1 text-sm text-text-body">Latest edits across posts, courses, quizzes, decks, and pathways.</p>

        {recent.length === 0 ? (
          <div className="mt-6 rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-12 text-center">
            <p className="text-base font-medium text-text-heading">No content yet</p>
            <p className="mt-1 text-sm text-text-body">Create content from the sidebar to see activity here.</p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {recent.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <Link
                  href={item.href}
                  className="group flex flex-col gap-2 rounded-base border border-border-default bg-bg-primary-soft p-5 transition-colors hover:border-border-brand-subtle hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-text-fg-brand-strong">{item.typeLabel}</span>
                      <PostStatusPill status={item.status} />
                    </div>
                    <h3 className="mt-1 text-base font-bold text-text-heading group-hover:text-text-fg-brand-strong">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">Updated {formatRelativeTime(item.updatedAt)}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-text-fg-brand-strong">
                    Open
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
