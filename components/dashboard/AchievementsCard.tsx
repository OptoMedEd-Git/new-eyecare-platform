import {
  Award,
  Flame,
  Lock,
  Medal,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import type { SampleBadge } from "@/lib/dashboard/sample-data";

const ICON_MAP = {
  Trophy,
  Award,
  Medal,
  Target,
  Flame,
  Zap,
  Star,
  Sparkles,
} as const;

type Props = {
  badges: SampleBadge[];
};

export function AchievementsCard({ badges }: Props) {
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-base font-bold text-text-heading">Achievements</h2>
          <p className="mt-1 text-sm text-text-body">Earn badges as you progress through OptoMedEd</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text-heading">
            {unlockedCount}
            <span className="text-base font-medium text-text-muted">/{badges.length}</span>
          </div>
          <div className="text-xs text-text-muted">earned</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {badges.map((badge) => {
          const Icon = ICON_MAP[badge.icon];
          return (
            <div
              key={badge.id}
              className={[
                "flex flex-col items-center gap-2 rounded-base p-3 text-center",
                badge.unlocked ? "bg-bg-brand-softer" : "bg-bg-secondary-soft opacity-60",
              ].join(" ")}
              title={badge.description}
            >
              <div
                className={[
                  "flex size-12 items-center justify-center rounded-full",
                  badge.unlocked ? "bg-bg-brand text-text-on-brand shadow-xs" : "bg-bg-tertiary-medium text-text-muted",
                ].join(" ")}
              >
                {badge.unlocked ? <Icon className="size-5" aria-hidden /> : <Lock className="size-4" aria-hidden />}
              </div>
              <div className="text-xs font-semibold leading-tight text-text-heading">{badge.name}</div>
              <div className="text-[10px] leading-tight text-text-muted">{badge.description}</div>
            </div>
          );
        })}
      </div>

      {/* TODO (placeholder): Wire to a real gamification system.
          Award logic should hook into learning events (lesson completion, quiz scores, streaks).
          Badge definitions should live in the DB or a server config, not in `lib/dashboard/sample-data.ts`. */}
    </div>
  );
}

