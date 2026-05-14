"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { markModuleComplete, unmarkModuleComplete, type ModuleActionResult } from "@/app/(app)/pathways/[slug]/actions";

type Props = {
  pathwaySlug: string;
  moduleId: string;
  initialComplete: boolean;
};

export function ModuleCompleteToggle({ pathwaySlug, moduleId, initialComplete }: Props) {
  const router = useRouter();
  const [complete, setComplete] = useState(initialComplete);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    const next = !complete;
    setComplete(next);

    startTransition(async () => {
      const result: ModuleActionResult = next
        ? await markModuleComplete(pathwaySlug, moduleId)
        : await unmarkModuleComplete(pathwaySlug, moduleId);

      if (!result.success) {
        setComplete(!next);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end justify-center gap-1 border-l border-border-default px-3 py-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-base border border-border-default bg-bg-primary-soft px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:opacity-50"
      >
        {complete ? "Unmark" : "Mark complete"}
      </button>
      {error ? (
        <p className="max-w-40 text-right text-xs text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
