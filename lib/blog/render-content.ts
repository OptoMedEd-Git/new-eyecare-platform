import { generateHTML } from "@tiptap/html";

import { blogExtensions } from "./extensions";

/**
 * Render a TipTap JSON document to an HTML string.
 *
 * Used server-side on /blog/[slug] to display published posts.
 * Returns empty string for null/undefined input or invalid JSON.
 *
 * Safety: Output is constrained by TipTap's schema. Do NOT pass arbitrary HTML
 * through here — this is for ProseMirror docs only.
 */
export function renderContent(content: unknown): string {
  if (content == null) return "";

  let doc: unknown = content;
  if (typeof doc === "string") {
    const raw = doc;
    if (doc.trim() === "") return "";
    try {
      doc = JSON.parse(raw);
    } catch {
      return `<p>${escapeHtml(raw)}</p>`;
    }
  }

  if (typeof doc !== "object" || doc === null) return "";

  try {
    return generateHTML(doc as Parameters<typeof generateHTML>[0], blogExtensions);
  } catch (error) {
    console.error("[blog] renderContent failed:", error);
    return "";
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Backwards-compat alias. */
export function renderTiptapContent(content: unknown): string {
  return (() => {
    // Prefer new renderer; keep old name for existing imports.
    return renderContent(content);
  })();
}
