import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";

// TODO (future): for inline caption editing in the editor, build a custom
// NodeView that renders the figure + figcaption with the caption as a
// contentEditable element. Currently captions are only editable by re-clicking
// the image (which would need an "edit image" affordance — not yet built).
// Lightweight workaround: user deletes the image and re-inserts it via the
// modal to change the caption. Acceptable for v1.
const ImageWithCaption = Image.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      caption: {
        default: null,
        parseHTML: (element) => {
          if (element.tagName === "IMG") {
            const fig = element.closest("figure");
            const cap = fig?.querySelector("figcaption");
            return cap?.textContent ?? null;
          }
          return null;
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }, { tag: "figure.blog-content-figure img[src]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const imgAttrs = { ...HTMLAttributes } as Record<string, unknown>;
    delete imgAttrs.caption;

    if (node.attrs.caption) {
      return [
        "figure",
        { class: "blog-content-figure" },
        ["img", imgAttrs],
        ["figcaption", { class: "blog-content-caption" }, node.attrs.caption],
      ];
    }

    return ["img", imgAttrs];
  },
});

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
  ImageWithCaption.configure({
    allowBase64: false,
    HTMLAttributes: {
      class:
        "blog-content-image rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10 max-w-full h-auto my-6",
    },
  }),
] satisfies Extensions;

/** Backwards-compat alias (older components import this name). */
export const tiptapExtensions = blogExtensions;
