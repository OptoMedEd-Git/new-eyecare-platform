/**
 * Hex literals for Recharts (avoid CSS variables in chart SVGs).
 * Brand `#155dfc` matches `--color-bg-brand` in `app/globals.css`.
 */
export const QUIZ_BANK_CHART_COLORS = {
  brand: "#155dfc",
  brandStrong: "#1c398e",
  brandSoft: "#dbeafe",
  grid: "#e5e7eb",
  muted: "#6a7282",
  axis: "#94a3b8",
  surface: "#ffffff",
} as const;

/** Recharts fills for answer-outcome donut (aligned to `app/globals.css` semantic hex). */
export const ANSWER_BREAKDOWN_CHART_COLORS = {
  correct: "#007a55",
  incorrect: "#e7000b",
  flagged: "#d08700",
  notAttempted: "#94a3b8",
} as const;
