type ProgressBarProps = {
  /** Current value (e.g., questions answered, lessons completed) */
  value: number;
  /** Total possible (e.g., total questions, total lessons) */
  max: number;
  /** When true, show the bar even at 0%. Default false (hide at 0). */
  showAtZero?: boolean;
  /** Accessible label describing what's being tracked (e.g., "lessons completed") */
  ariaLabel?: string;
  /** Visual size variant */
  size?: "sm" | "md";
  /** Optional className for the outer container (positioning, margin) */
  className?: string;
  /** Optional rounded-bottom-only mode (when bar sits flush at bottom of a card with rounded corners) */
  flushBottom?: boolean;
};

export function ProgressBar({
  value,
  max,
  showAtZero = false,
  ariaLabel,
  size = "md",
  className = "",
  flushBottom = false,
}: ProgressBarProps) {
  if (!showAtZero && value === 0) return null;
  if (max <= 0) return null;

  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClass = size === "sm" ? "h-1" : "h-1.5";
  const radiusClass = flushBottom ? "rounded-b-base" : "rounded-full";

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel ?? `${value} of ${max} complete`}
      className={`${heightClass} w-full overflow-hidden ${radiusClass} bg-bg-secondary-soft ${className}`}
    >
      <div
        className="h-full bg-bg-brand transition-all duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
