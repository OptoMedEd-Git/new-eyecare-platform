"use client";

import { useState } from "react";

type Props = {
  src: string | null | undefined;
  /** Shown when src is missing, load fails, or after error */
  alt: string;
  className?: string;
};

/**
 * Stimulus image for `image_stimulus` (and similar) — degrades gracefully on missing/broken URLs.
 */
export function QuestionStimulusImage({ src, alt, className }: Props) {
  const [broken, setBroken] = useState(false);
  const trimmed = (src ?? "").trim();

  if (!trimmed || broken) {
    return (
      <div
        className={
          "flex min-h-[160px] w-full max-w-2xl items-center justify-center rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-4 py-8 text-center text-sm text-text-muted " +
          (className ?? "")
        }
        role="img"
        aria-label={alt}
      >
        {trimmed && broken ? "Image could not be loaded." : "No clinical image available."}
      </div>
    );
  }

  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote URLs + onError handling */}
      <img
        src={trimmed}
        alt={alt}
        className="w-full max-w-2xl rounded-base border border-border-default"
        onError={() => setBroken(true)}
      />
    </figure>
  );
}
