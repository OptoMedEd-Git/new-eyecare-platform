import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";

/**
 * Shared TipTap extension bundle for SSR (`@tiptap/html/server`) and the future editor (Session 4).
 * StarterKit’s built-in `link` is disabled so we can configure Link once (avoids duplicate extension warnings).
 */
export const blogExtensions = [
  StarterKit.configure({
    link: false,
    heading: { levels: [2, 3] },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class:
        "text-text-fg-brand underline decoration-text-fg-brand/40 underline-offset-2 transition-colors hover:text-text-fg-brand-strong hover:decoration-text-fg-brand-strong",
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
    protocols: ["http", "https", "mailto"],
    autolink: true,
  }),
  Image.configure({
    allowBase64: false,
    HTMLAttributes: {
      class:
        "blog-content-image rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10 max-w-full h-auto my-6",
    },
  }),
] satisfies Extensions;

/** Backwards-compat alias (older components import this name). */
export const tiptapExtensions = blogExtensions;
