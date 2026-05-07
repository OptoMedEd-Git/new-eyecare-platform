"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#155dfc", // --color-bg-brand
  "#1447e6", // --color-bg-brand-medium
  "#1c398e", // --color-bg-brand-strong
  "#bedbff", // --color-border-brand-subtle
  "#dbeafe", // --color-bg-brand-soft
] as const;

type Props = {
  data: readonly { name: string; value: number }[];
};

export function SkillMasteryChart({ data }: Props) {
  const avg = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length) : 0;

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div>
        <h2 className="text-base font-bold text-text-heading">Skill mastery</h2>
        <p className="mt-1 text-sm text-text-body">By specialty area</p>
      </div>

      <div className="relative mt-4 h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const v = typeof value === "number" ? value : Number(value ?? 0);
                return [`${v}%`, "Mastery"];
              }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-text-heading">{avg}%</div>
          <div className="text-xs text-text-muted">average</div>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {data.map((item, i) => (
          <li key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} aria-hidden />
              <span className="text-text-body">{item.name}</span>
            </div>
            <span className="font-medium text-text-heading">{item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

