"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = {
  // Monochromatic brand-blue palette (dark → light) for visual consistency with SkillMasteryChart
  questions: "#1e3a8a", // brand-blue dark (primary activity)
  cases: "#3b82f6", // brand-blue mid (secondary activity)
  flashcards: "#93c5fd", // brand-blue light (tertiary activity)
  grid: "#e5e7eb", // --color-border-default
  muted: "#6a7282", // --color-text-muted
} as const;

type Props = {
  data: readonly { week: string; questions: number; cases: number; flashcards: number }[];
};

export function MonthlyProgressChart({ data }: Props) {
  const totalActivities = data.reduce((sum, d) => sum + d.questions + d.cases + d.flashcards, 0);

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-base font-bold text-text-heading">Monthly progress</h2>
          <p className="mt-1 text-sm text-text-body">Activities completed over the past 4 weeks</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text-heading">{totalActivities}</div>
          <div className="text-xs text-text-muted">total activities</div>
        </div>
      </div>

      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="week" stroke={CHART_COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={CHART_COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: `1px solid ${CHART_COLORS.grid}`,
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} iconType="circle" iconSize={8} />
            <Bar dataKey="questions" stackId="a" fill={CHART_COLORS.questions} name="Questions" />
            <Bar dataKey="cases" stackId="a" fill={CHART_COLORS.cases} name="Cases" />
            <Bar dataKey="flashcards" stackId="a" fill={CHART_COLORS.flashcards} name="Flashcards" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

