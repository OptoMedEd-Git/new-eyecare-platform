"use client";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

/** Matches admin destructive buttons (e.g. FlashcardForm delete). */
export function PracticeEndButton({ onClick, disabled = false, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-base bg-bg-danger-softer px-4 py-2 text-sm font-medium text-text-fg-danger transition-colors hover:bg-bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].join(" ")}
    >
      End practice
    </button>
  );
}
