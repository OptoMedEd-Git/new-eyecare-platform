import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Compass, Stethoscope } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ContinueLearningCard } from "@/components/dashboard/ContinueLearningCard";
import { RecommendedItem } from "@/components/dashboard/RecommendedItem";
import { LearningActivityChart } from "@/components/dashboard/LearningActivityChart";
import { SkillMasteryChart } from "@/components/dashboard/SkillMasteryChart";
import { MonthlyProgressChart } from "@/components/dashboard/MonthlyProgressChart";
import { AchievementsCard } from "@/components/dashboard/AchievementsCard";
import { HomeBlogPostCard } from "@/components/blog/HomeBlogPostCard";

import { getFeaturedPosts } from "@/lib/blog/queries";
import {
  SAMPLE_CONTINUE_LEARNING,
  SAMPLE_BADGES,
  SAMPLE_MONTHLY_PROGRESS,
  SAMPLE_RECOMMENDATIONS,
  SAMPLE_SKILL_MASTERY,
  SAMPLE_STATS,
  SAMPLE_WEEKLY_ACTIVITY,
} from "@/lib/dashboard/sample-data";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Layout already gates access; defense in depth.
  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", authUser.id)
    .maybeSingle<{ first_name: string | null }>();

  const metaFirst = (authUser.user_metadata?.first_name as string | undefined)?.trim();
  const firstName = profile?.first_name?.trim() ?? metaFirst ?? "there";

  // REAL data: most recent published posts (3).
  const blogPosts = await getFeaturedPosts(3);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      {/* Page header */}
      <DashboardHeader firstName={firstName} />

      {/* SAMPLE: high-level stats (placeholder until real progress tracking exists). */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Compass}
          label="Pathways in progress"
          value={SAMPLE_STATS.pathwaysInProgress.value}
          context={`out of ${SAMPLE_STATS.pathwaysInProgress.total} enrolled`}
          trendDelta={SAMPLE_STATS.pathwaysInProgress.trendDelta}
        />
        <StatCard
          icon={ClipboardList}
          label="Questions answered"
          value={SAMPLE_STATS.questionsAnswered.value}
          context="all time"
          trendDelta={SAMPLE_STATS.questionsAnswered.weeklyDelta}
        />
        <StatCard
          icon={Stethoscope}
          label="Cases reviewed"
          value={SAMPLE_STATS.casesReviewed.value}
          context="all time"
          trendDelta={SAMPLE_STATS.casesReviewed.weeklyDelta}
        />
      </div>

      {/* Main split: Continue Learning + Recommended for You */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-text-heading">Continue learning</h2>
            <Link href="#" className="text-sm font-medium text-text-fg-brand-strong hover:underline">
              View all
            </Link>
          </div>
          {SAMPLE_CONTINUE_LEARNING.map((course) => (
            <ContinueLearningCard key={course.id} course={course} />
          ))}
        </div>

        <aside className="rounded-base border border-border-default bg-bg-primary-soft p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Recommended for you
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {SAMPLE_RECOMMENDATIONS.map((item) => (
              <RecommendedItem key={item.id} item={item} />
            ))}
          </div>
        </aside>
      </div>

      {/* Charts row: Learning Activity (2/3) + Skill mastery (1/3) */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LearningActivityChart data={SAMPLE_WEEKLY_ACTIVITY} />
        </div>
        <div>
          <SkillMasteryChart data={SAMPLE_SKILL_MASTERY} />
        </div>
      </div>

      {/* Monthly progress chart — SAMPLE */}
      <div className="mt-6">
        <MonthlyProgressChart data={SAMPLE_MONTHLY_PROGRESS} />
      </div>

      {/* Achievements / badges — SAMPLE placeholder */}
      <div className="mt-6">
        <AchievementsCard badges={SAMPLE_BADGES} />
      </div>

      {/* Latest from the blog — REAL data */}
      {blogPosts.length > 0 ? (
        <div className="mt-12">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-text-heading">Latest from the blog</h2>
              <p className="mt-1 text-sm text-text-body">Practical clinical reading, fresh off the press.</p>
            </div>
            <Link href="/blog" className="text-sm font-medium text-text-fg-brand-strong hover:underline">
              View all posts
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <HomeBlogPostCard
                key={post.id}
                post={{
                  slug: post.slug,
                  title: post.title,
                  description: post.description,
                  published_at: post.published_at ?? "",
                  category: { name: post.category.name, slug: post.category.slug },
                  author: post.author,
                  read_time_minutes: post.reading_time_minutes ?? undefined,
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
