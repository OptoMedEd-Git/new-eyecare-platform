"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";

type HelpTooltipProps = {
  content: string;
  label?: string;
  placement?: "top" | "bottom";
};

/**
 * Small circled question mark icon that displays a tooltip with descriptive content.
 *
 * Interaction model:
 * - Hover: tooltip appears; disappears when mouse leaves
 * - Click: tooltip pins (stays open) until clicked again or clicked outside
 * - Keyboard: tooltip appears on focus, hides on blur (unless pinned via click)
 */
export function HelpTooltip({ content, label = "More information", placement = "top" }: HelpTooltipProps) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const isOpen = hovered || pinned || focused;

  // Click outside to unpin
  useEffect(() => {
    if (!pinned) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPinned(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pinned]);

  // Escape key to unpin
  useEffect(() => {
    if (!pinned) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setPinned(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [pinned]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPinned((p) => !p);
  }

  return (
    <span ref={containerRef} className="relative inline-flex items-center align-middle">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={pinned}
        className="inline-flex size-4 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-fg-brand-strong focus:text-text-fg-brand-strong focus:outline-none"
      >
        <HelpCircle className="size-4" aria-hidden />
      </button>

      {isOpen ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            "absolute left-1/2 z-50 w-64 -translate-x-1/2 rounded-base border border-border-default bg-bg-inverse px-3 py-2 text-xs leading-relaxed text-text-inverse shadow-lg",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
          ].join(" ")}
        >
          {content}
          <span
            className={[
              "absolute left-1/2 size-2 -translate-x-1/2 rotate-45 bg-bg-inverse border-border-default",
              placement === "top" ? "top-full -mt-1 border-r border-b" : "bottom-full -mb-1 border-l border-t",
            ].join(" ")}
            aria-hidden
          />
        </span>
      ) : null}
    </span>
  );
}

