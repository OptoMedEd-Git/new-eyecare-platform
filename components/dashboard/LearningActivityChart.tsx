"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyActivity } from "@/lib/dashboard/sample-data";

const CHART_COLORS = {
  brand: "#155dfc", // --color-bg-brand
  brandSofter: "#eef6ff", // --color-bg-brand-softer
  grid: "#e5e7eb", // --color-border-default
  muted: "#6a7282", // --color-text-muted
} as const;

type Props = {
  data: DailyActivity[];
};

export function LearningActivityChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.questions, 0);

  return (
    <div className="flex h-full flex-col rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-base font-bold text-text-heading">Learning activity</h2>
          <p className="mt-1 text-sm text-text-body">Questions answered this week</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text-heading">{total}</div>
          <div className="text-xs text-text-muted">total this week</div>
        </div>
      </div>

      <div className="mt-6 min-h-[240px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS.brand} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="day" stroke={CHART_COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={CHART_COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: `1px solid ${CHART_COLORS.grid}`,
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="questions"
              stroke={CHART_COLORS.brand}
              strokeWidth={2}
              fill="url(#activityGradient)"
              dot={{ fill: CHART_COLORS.brand, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

