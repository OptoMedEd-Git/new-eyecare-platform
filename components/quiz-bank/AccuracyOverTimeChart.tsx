"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { QuizBankDailyAccuracyRow } from "@/lib/quiz-bank/types";
import { QUIZ_BANK_CHART_COLORS } from "@/lib/quiz-bank/chart-colors";

type Props = {
  data: QuizBankDailyAccuracyRow[];
};

export function AccuracyOverTimeChart({ data }: Props) {
  const chartRows = data.map((d) => ({ ...d }));
  const enoughDays = chartRows.length >= 2;

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div>
        <h2 className="text-base font-bold text-text-heading">Accuracy over time</h2>
        <p className="mt-1 text-sm text-text-body">Daily accuracy from practice answers</p>
      </div>

      <div className="mt-6 min-h-[220px] w-full flex-1">
        {!enoughDays ? (
          <div className="flex h-[240px] flex-col items-center justify-center rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 text-center">
            <p className="max-w-sm text-sm text-text-body">
              Practice on at least two different days to see how your accuracy changes over time.
            </p>
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={QUIZ_BANK_CHART_COLORS.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={QUIZ_BANK_CHART_COLORS.muted}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v) => `${v}%`}
                  stroke={QUIZ_BANK_CHART_COLORS.muted}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: QUIZ_BANK_CHART_COLORS.surface,
                    border: `1px solid ${QUIZ_BANK_CHART_COLORS.grid}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value ?? 0}%`, "Accuracy"]}
                />
                <Line
                  type="monotone"
                  dataKey="accuracyPct"
                  stroke={QUIZ_BANK_CHART_COLORS.brand}
                  strokeWidth={2}
                  dot={{ fill: QUIZ_BANK_CHART_COLORS.brand, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
