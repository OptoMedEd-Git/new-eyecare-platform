"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryPerformance } from "@/lib/dashboard/sample-data";

const COLOR_FILL = "#1e40af"; // dark brand-blue (filled portion)
const COLOR_TRACK = "#dbeafe"; // soft brand-blue (remainder track)
const COLOR_AXIS = "#94a3b8"; // muted text color
const COLOR_GRID = "#e5e7eb"; // grid line color

const PERIODS = ["All time", "Last 30 days", "Last 7 days"] as const;
type Period = (typeof PERIODS)[number];

const COLLAPSED_COUNT = 5;

type Props = {
  data: CategoryPerformance[];
};

export function PerformanceBreakdownChart({ data }: Props) {
  const [period, setPeriod] = useState<Period>("Last 30 days");
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => [...data].sort((a, b) => b.percentage - a.percentage), [data]);
  const visible = expanded ? sorted : sorted.slice(0, COLLAPSED_COUNT);
  const hasMore = sorted.length > COLLAPSED_COUNT;

  const chartData = useMemo(
    () =>
      visible.map((d) => ({
        category: d.category,
        percentage: d.percentage,
        remainder: 100 - d.percentage,
      })),
    [visible],
  );

  return (
    <div className="flex h-full flex-col rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-heading">Performance breakdown by category</h2>
          <p className="mt-1 text-sm text-text-body">Your accuracy across specialty areas</p>
        </div>

        <div className="inline-flex items-center rounded-base border border-border-default p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={[
                "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                period === p
                  ? "bg-bg-brand-softer text-text-fg-brand-strong"
                  : "text-text-body hover:bg-bg-secondary-soft",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div
        className="mt-6 w-full flex-1"
        style={{ minHeight: `${Math.max(chartData.length * 44, 220)}px` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke={COLOR_AXIS}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="category"
              type="category"
              stroke={COLOR_AXIS}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value, name) => {
                if (name === "percentage") return [`${value}%`, "Correct"];
                return null;
              }}
            />

            <Bar dataKey="percentage" stackId="a" fill={COLOR_FILL} radius={[4, 0, 0, 4]} />
            <Bar dataKey="remainder" stackId="a" fill={COLOR_TRACK} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-4 inline-flex items-center justify-center gap-1 self-center text-sm font-medium text-text-fg-brand-strong hover:underline"
        >
          {expanded ? (
            <>
              See fewer categories
              <ChevronUp className="size-4" aria-hidden />
            </>
          ) : (
            <>
              See more categories
              <ChevronDown className="size-4" aria-hidden />
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}

