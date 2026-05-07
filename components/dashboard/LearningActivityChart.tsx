import type { DailyActivity } from "@/lib/dashboard/sample-data";

type Props = {
  data: DailyActivity[];
};

export function LearningActivityChart({ data }: Props) {
  const maxValue = Math.max(...data.map((d) => d.questions), 1);
  const total = data.reduce((sum, d) => sum + d.questions, 0);

  const height = 200;
  const padding = { top: 20, bottom: 30 };
  const chartHeight = height - padding.top - padding.bottom;

  const barCount = data.length;
  const barWidth = 8; // viewBox units (0-100)
  const barGap = (100 - barCount * barWidth) / (barCount + 1);

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-base font-bold text-text-heading">Learning activity</h2>
          <p className="mt-1 text-sm text-text-body">Questions answered this week</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text-heading">{total}</div>
          <div className="text-xs text-text-muted">total this week</div>
        </div>
      </div>

      <div className="mt-6">
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: `${height}px` }}
          role="img"
          aria-label={`Bar chart showing questions answered per day this week. Total: ${total}`}
        >
          {data.map((d, i) => {
            const barHeight = (d.questions / maxValue) * chartHeight;
            const x = barGap + i * (barWidth + barGap);
            const y = padding.top + (chartHeight - barHeight);

            return (
              <g key={d.day}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--color-bg-brand)"
                  rx={1}
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--color-text-muted)"
                >
                  {d.day}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill="var(--color-text-heading)"
                >
                  {d.questions}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

