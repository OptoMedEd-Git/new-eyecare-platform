import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";

/**
 * Shared TipTap extension bundle for SSR (`@tiptap/html/server`) and the future editor (Session 4).
 * StarterKit’s built-in `link` is disabled so we can configure Link once (avoids duplicate extension warnings).
 */
export const tiptapExtensions = [
  StarterKit.configure({
    link: false,
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class:
        "text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-brand",
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class:
        "rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10 max-w-full h-auto my-6",
    },
  }),
] satisfies Extensions;
