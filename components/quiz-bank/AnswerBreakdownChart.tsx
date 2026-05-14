"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { QuizBankAnswerBreakdown } from "@/lib/quiz-bank/types";
import { ANSWER_BREAKDOWN_CHART_COLORS, QUIZ_BANK_CHART_COLORS } from "@/lib/quiz-bank/chart-colors";

type Props = {
  breakdown: QuizBankAnswerBreakdown;
};

type PieRow = {
  key: string;
  name: string;
  value: number;
  fill: string;
};

function buildPieRows(b: QuizBankAnswerBreakdown): PieRow[] {
  return [
    { key: "correct", name: "Correct", value: b.correctCount, fill: ANSWER_BREAKDOWN_CHART_COLORS.correct },
    { key: "incorrect", name: "Incorrect", value: b.incorrectCount, fill: ANSWER_BREAKDOWN_CHART_COLORS.incorrect },
    { key: "flagged", name: "Flagged", value: b.flaggedCount, fill: ANSWER_BREAKDOWN_CHART_COLORS.flagged },
    {
      key: "notAttempted",
      name: "Not attempted",
      value: b.notAttemptedCount,
      fill: ANSWER_BREAKDOWN_CHART_COLORS.notAttempted,
    },
  ];
}

export function AnswerBreakdownChart({ breakdown }: Props) {
  const { totalPublished, accuracyPercent } = breakdown;
  const displayData = useMemo(() => {
    const rows = buildPieRows(breakdown);
    const hasSlices = rows.some((d) => d.value > 0);
    if (hasSlices) return rows.filter((d) => d.value > 0);
    if (totalPublished > 0) {
      return [{ key: "empty", name: "Not attempted", value: 1, fill: ANSWER_BREAKDOWN_CHART_COLORS.notAttempted }];
    }
    return [];
  }, [breakdown, totalPublished]);

  const legendRows = buildPieRows(breakdown);

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-base border border-border-default bg-bg-primary-soft p-6 shadow-xs">
      <header className="shrink-0 text-center lg:text-left">
        <h2 className="text-base font-bold text-text-heading">Question outcomes</h2>
        <p className="mt-1 text-sm text-text-body">
          Published bank: practice + quiz responses. Flagged items are shown separately from correct/incorrect.
        </p>
      </header>

      {totalPublished === 0 ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 py-12 text-center">
          <p className="max-w-sm text-sm text-text-body">No published questions in the bank yet.</p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-6 h-[280px] w-full max-w-[280px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Pie
                  data={displayData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={displayData.length > 1 ? 2 : 0}
                  stroke={QUIZ_BANK_CHART_COLORS.surface}
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {displayData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const p = payload[0].payload as PieRow;
                    const total = totalPublished;
                    const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
                    return (
                      <div
                        className="rounded-base border border-border-default px-3 py-2 text-sm shadow-xs"
                        style={{ backgroundColor: QUIZ_BANK_CHART_COLORS.surface }}
                      >
                        <p className="font-semibold text-text-heading">{p.name}</p>
                        <p className="mt-0.5 text-text-body">
                          {p.value} ({pct}% of bank)
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-semibold leading-none tracking-tight text-text-heading">
                {accuracyPercent !== null ? `${accuracyPercent}%` : "—"}
              </p>
              <p className="mt-1.5 text-base text-text-body">Overall accuracy</p>
              <p className="mt-0.5 max-w-36 text-xs leading-snug text-text-muted">
                Among questions you&apos;ve answered (excluding flagged-only).
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:justify-start">
            {legendRows.map((row) => (
              <div key={row.key} className="flex min-w-[132px] items-center gap-1.5 text-sm">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.fill }} aria-hidden />
                <span className="text-text-body">
                  {row.name}: <span className="font-semibold text-text-heading">{row.value}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
