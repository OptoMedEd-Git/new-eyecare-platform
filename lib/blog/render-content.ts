import { generateHTML } from "@tiptap/html/server";

import { tiptapExtensions } from "./extensions";

export function renderTiptapContent(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  try {
    return generateHTML(content as Parameters<typeof generateHTML>[0], tiptapExtensions);
  } catch (error) {
    console.error("Error rendering TipTap content:", error);
    return "";
  }
}
