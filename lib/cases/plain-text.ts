/**
 * Normalizes case history columns that may be legacy TipTap JSON or plain text.
 */
export function historyFieldToPlainText(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) return trimmed;

  try {
    const doc = JSON.parse(trimmed) as { content?: unknown };
    const parts: string[] = [];

    function walk(node: unknown) {
      if (node == null) return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node !== "object") return;
      const n = node as { text?: string; content?: unknown[] };
      if (typeof n.text === "string" && n.text.trim()) {
        parts.push(n.text.trim());
      }
      if (n.content) walk(n.content);
    }

    walk(doc);
    return parts.join(" ").trim();
  } catch {
    return "";
  }
}
