import { generateText } from "@tiptap/react";

import { tiptapExtensions } from "./extensions";

const MS_DAY = 86_400_000;

export function formatPostDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(iso: string | null | undefined): string {
  const full = formatPostDate(iso);
  if (!iso || !full) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return full;
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return full;
  const days = Math.floor(diffMs / MS_DAY);
  if (days >= 7) return full;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (days >= 1) {
    return rtf.format(-days, "day");
  }

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours >= 1) {
    return rtf.format(-hours, "hour");
  }

  const minutes = Math.max(1, Math.floor(diffMs / 60_000));
  return rtf.format(-minutes, "minute");
}

export function authorDisplayName(author: { first_name: string | null; last_name: string | null } | null): string {
  if (!author) return "OptoMedEd";
  const first = author.first_name?.trim() ?? "";
  const last = author.last_name?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  return full || "OptoMedEd";
}

export function authorInitials(author: { first_name: string | null; last_name: string | null } | null): string {
  if (!author) return "OE";
  const first = author.first_name?.trim().charAt(0) ?? "";
  const last = author.last_name?.trim().charAt(0) ?? "";
  const both = `${first}${last}`.toUpperCase();
  if (both.length >= 2) return both.slice(0, 2);
  if (first) return `${first}`.toUpperCase().slice(0, 2);
  return "OE";
}

export function calculateReadTime(
  content: unknown,
  storedMinutes: number | null | undefined,
): number {
  if (typeof storedMinutes === "number" && storedMinutes > 0) {
    return Math.max(1, Math.round(storedMinutes));
  }
  if (!content || typeof content !== "object") return 1;
  try {
    const text = generateText(content as Parameters<typeof generateText>[0], tiptapExtensions, {
      blockSeparator: "\n",
    });
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(words / 200);
    return Math.max(1, minutes);
  } catch {
    return 1;
  }
}

const WORDS_PER_MINUTE = 200;

/**
 * Compute estimated reading time in minutes from a TipTap JSON document.
 * Returns at least 1 minute even for very short content.
 */
export function getReadingTime(content: unknown): number {
  const wordCount = countWords(content);
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

/**
 * Count words in a TipTap JSON document by rendering it to text.
 */
export function countWords(content: unknown): number {
  if (!content || typeof content !== "object") return 0;
  try {
    const text = generateText(content as Parameters<typeof generateText>[0], tiptapExtensions, {
      blockSeparator: "\n",
    });
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  } catch {
    return 0;
  }
}

export function truncateLabel(text: string, max = 52): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
