import {
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardList,
  Compass,
  HelpCircle,
  Layers,
  MessageSquare,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { getProfessionAudiencePlural, getProfessionProfileLabel } from "@/lib/professionDisplay";
import { createClient } from "@/lib/supabase/server";

import { logout } from "./actions";

const cardClassName =
  "rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600";

const devCardClassName =
  "group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600";

const stayConnectedCardClassName =
  "flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600";

const signOutButtonClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 md:w-auto dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700";

const editProfileButtonClassName =
  "mt-6 inline-flex w-full min-h-10 items-center justify-center rounded-lg border border-gray-200 bg-secondary px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-100 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-auto dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-700";

const ctaButtonClassName =
  "inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-lg border border-gray-200 bg-secondary px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-100 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-auto dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-700";

const socialIconClassName =
  "text-gray-500 transition-colors duration-200 hover:text-brand dark:text-gray-400 dark:hover:text-brand";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  profession: string | null;
  marketing_opt_in: boolean | null;
  created_at: string | null;
};

function formatMemberSince(
  profileCreatedAt: string | null,
  userCreatedAt: string | undefined,
): string {
  const raw = profileCreatedAt ?? userCreatedAt;
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

type DevelopmentCard = {
  id: string;
  icon: typeof BookOpen;
  status: "in_development" | "coming_soon";
  title: string;
  description: string;
};

const DEVELOPMENT_CARDS: readonly DevelopmentCard[] = [
  {
    id: "glaucoma",
    icon: BookOpen,
    status: "in_development",
    title: "Glaucoma course series",
    description:
      "A multi-module deep dive into glaucoma diagnosis, treatment evolution, and long-term management. Built around real cases.",
  },
  {
    id: "anterior-quiz",
    icon: HelpCircle,
    status: "in_development",
    title: "Anterior segment quiz bank",
    description:
      "Hundreds of high-yield questions covering slit-lamp findings, common pathologies, and exam techniques.",
  },
  {
    id: "cases",
    icon: ClipboardList,
    status: "coming_soon",
    title: "Clinical case library",
    description:
      "Interactive patient cases that walk through history, exam, differential diagnosis, and management decisions.",
  },
  {
    id: "pharm-flash",
    icon: Layers,
    status: "coming_soon",
    title: "Pharmacology flashcards",
    description:
      "Spaced repetition flashcards for ophthalmic medications — mechanisms, indications, and adverse effects.",
  },
];

function StatusPill({ variant }: { variant: "in_development" | "coming_soon" | "neutral" }) {
  if (variant === "in_development") {
    return (
      <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
        In development
      </span>
    );
  }
  if (variant === "coming_soon") {
    return (
      <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700/80 dark:text-gray-200">
        Coming soon
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-600/60 dark:text-gray-200">
      Coming soon
    </span>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-100 py-3 last:border-b-0 last:pb-0 first:pt-0 dark:border-gray-700/80">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}

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
    .select("first_name, last_name, profession, marketing_opt_in, created_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const metaFirst = (user.user_metadata?.first_name as string | undefined)?.trim();
  const metaLast = (user.user_metadata?.last_name as string | undefined)?.trim();

  const firstName =
    profile?.first_name?.trim() ?? metaFirst ?? "there";

  const profileFirst = profile?.first_name?.trim() ?? metaFirst ?? "";
  const profileLast = profile?.last_name?.trim() ?? metaLast ?? "";
  const nameForSnapshot =
    [profileFirst, profileLast].filter(Boolean).join(" ").trim() || "—";

  const professionAudience = getProfessionAudiencePlural(profile?.profession);
  const professionLabel = getProfessionProfileLabel(profile?.profession);
  const memberSince = formatMemberSince(profile?.created_at ?? null, user.created_at);

  return (
    <div className="w-full bg-secondary pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome banner */}
        <section
          aria-labelledby="dashboard-welcome-heading"
          className="rounded-2xl border border-blue-100 bg-blue-50/90 p-6 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/35 md:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl space-y-3">
              <h1
                id="dashboard-welcome-heading"
                className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
              >
                Welcome back, {firstName}!
              </h1>
              <p className="text-base leading-relaxed text-text-body dark:text-gray-300">
                OptoMedEd is in early access. We&apos;re actively building content for{" "}
                {professionAudience}. Here&apos;s what&apos;s coming and how to stay in the loop.
              </p>
            </div>
            <form action={logout} className="shrink-0 md:self-center">
              <button type="submit" className={signOutButtonClassName}>
                Sign out
              </button>
            </form>
          </div>
        </section>

        {/* Checklist + profile */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <section aria-labelledby="getting-started-heading" className={cardClassName}>
            <h2
              id="getting-started-heading"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Getting started
            </h2>
            <p className="mt-2 text-sm text-text-body dark:text-gray-400">
              A few things to set up while we build out content.
            </p>
            <ul className="mt-8 flex flex-col gap-8">
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-500"
                  aria-hidden
                  strokeWidth={2}
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-500 line-through dark:text-gray-500">
                    Create your account
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Circle
                  className="mt-0.5 size-5 shrink-0 text-gray-400"
                  aria-hidden
                  strokeWidth={2}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Complete your profile
                    </span>
                    <StatusPill variant="neutral" />
                  </div>
                  <p className="text-sm text-text-body dark:text-gray-400">
                    Add details about your specialty and interests so we can recommend relevant
                    content.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Circle
                  className="mt-0.5 size-5 shrink-0 text-gray-400"
                  aria-hidden
                  strokeWidth={2}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Choose your learning interests
                    </span>
                    <StatusPill variant="neutral" />
                  </div>
                  <p className="text-sm text-text-body dark:text-gray-400">
                    Tell us which topics you want to focus on first.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 opacity-90">
                <Circle
                  className="mt-0.5 size-5 shrink-0 text-gray-400"
                  aria-hidden
                  strokeWidth={2}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-medium text-gray-500 dark:text-gray-400">
                    Get your first content recommendation
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Available when content launches.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section aria-labelledby="your-profile-heading" className={cardClassName}>
            <h2 id="your-profile-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
              Your profile
            </h2>
            <dl className="mt-6">
              <ProfileField label="Name" value={nameForSnapshot} />
              <ProfileField label="Profession" value={professionLabel} />
              <ProfileField label="Email" value={user.email ?? "—"} />
              <ProfileField label="Member since" value={memberSince} />
              <ProfileField
                label="Marketing emails"
                value={profile?.marketing_opt_in === true ? "Yes" : "No"}
              />
            </dl>
            <Link href="/settings" className={editProfileButtonClassName}>
              Edit profile
            </Link>
          </section>
        </div>

        {/* What we're building */}
        <section aria-labelledby="development-heading" className="space-y-6">
          <div className="max-w-3xl">
            <h2
              id="development-heading"
              className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
            >
              What we&apos;re building
            </h2>
            <p className="mt-3 text-base text-text-body dark:text-gray-400">
              Here&apos;s what&apos;s actively in development. Sign up for updates to know when each
              launches.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {DEVELOPMENT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <li key={card.id}>
                  <article className={devCardClassName}>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-300">
                        <Icon className="size-5" aria-hidden strokeWidth={2} />
                      </div>
                      <StatusPill variant={card.status} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-text-body dark:text-gray-400">
                      {card.description}
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Stay connected */}
        <section aria-labelledby="stay-connected-heading" className="space-y-6">
          <h2
            id="stay-connected-heading"
            className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
          >
            Stay connected
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className={stayConnectedCardClassName}>
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50">
                <Users className="size-5" aria-hidden strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Follow us</h3>
              <p className="mt-2 text-sm text-text-body dark:text-gray-400">
                Get updates on social media
              </p>
              <div className="mt-6 flex items-center gap-4">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn (opens in a new tab)"
                  className={socialIconClassName}
                >
                  <FaLinkedinIn size={20} aria-hidden />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (opens in a new tab)"
                  className={socialIconClassName}
                >
                  <FaXTwitter size={20} aria-hidden />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram (opens in a new tab)"
                  className={socialIconClassName}
                >
                  <FaInstagram size={20} aria-hidden />
                </a>
              </div>
            </article>

            <article className={stayConnectedCardClassName}>
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50">
                <MessageSquare className="size-5" aria-hidden strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send feedback</h3>
              <p className="mt-2 text-sm text-text-body dark:text-gray-400">
                Tell us what you&apos;d like to learn
              </p>
              <div className="mt-auto pt-6">
                <Link href="/contact" className={ctaButtonClassName}>
                  Get in touch
                </Link>
              </div>
            </article>

            <article className={stayConnectedCardClassName}>
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50">
                <Compass className="size-5" aria-hidden strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Explore the platform
              </h3>
              <p className="mt-2 text-sm text-text-body dark:text-gray-400">
                Learn more about what&apos;s coming
              </p>
              <div className="mt-auto pt-6">
                <Link href="/about" className={ctaButtonClassName}>
                  Learn more
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
