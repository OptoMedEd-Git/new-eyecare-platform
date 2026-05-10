"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { QuizBankCategoryAccuracyRow } from "@/lib/quiz-bank/types";
import { QUIZ_BANK_CHART_COLORS } from "@/lib/quiz-bank/chart-colors";

type Props = {
  data: QuizBankCategoryAccuracyRow[];
};

export function CategoryAccuracyChart({ data }: Props) {
  const chartData = data.map((d) => ({
    category: d.category.length > 36 ? `${d.category.slice(0, 34)}…` : d.category,
    fullCategory: d.category,
    percentage: d.percentage,
    answered: d.total,
    correct: d.correct,
  }));

  const hasData = chartData.length > 0;

  const chartHeight = Math.min(520, Math.max(220, chartData.length * 40));

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div>
        <h2 className="text-base font-bold text-text-heading">Accuracy by category</h2>
        <p className="mt-1 text-sm text-text-body">Practice-mode performance across topics</p>
      </div>

      <div className="mt-6 min-h-[220px] w-full flex-1">
        {!hasData ? (
          <div className="flex h-[220px] flex-col items-center justify-center rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 text-center">
            <p className="max-w-sm text-sm text-text-body">
              Answer a few practice questions to see your accuracy by category.
            </p>
          </div>
        ) : (
          <div style={{ height: chartHeight }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
                barCategoryGap="18%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={QUIZ_BANK_CHART_COLORS.grid} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v) => `${v}%`}
                  stroke={QUIZ_BANK_CHART_COLORS.axis}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={124}
                  stroke={QUIZ_BANK_CHART_COLORS.muted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: QUIZ_BANK_CHART_COLORS.surface,
                    border: `1px solid ${QUIZ_BANK_CHART_COLORS.grid}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value, name, item) => {
                    if (name === "percentage") {
                      const payload = item?.payload as {
                        fullCategory?: string;
                        correct?: number;
                        answered?: number;
                      };
                      return [
                        `${value}% correct (${payload?.correct ?? 0}/${payload?.answered ?? 0})`,
                        payload?.fullCategory ?? "Category",
                      ];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="percentage" fill={QUIZ_BANK_CHART_COLORS.brand} radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="percentage"
                    position="right"
                    formatter={(v) => `${Number(v ?? 0)}%`}
                    fill={QUIZ_BANK_CHART_COLORS.brandStrong}
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
