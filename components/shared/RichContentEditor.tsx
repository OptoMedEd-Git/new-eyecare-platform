"use client";

import { blogExtensions } from "@/lib/blog/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import { forwardRef, useImperativeHandle } from "react";

import { EditorToolbar } from "@/components/admin/EditorToolbar";

export type RichContentEditorHandle = {
  getJSON: () => unknown;
  focus: () => void;
};

export type RichContentEditorProps = {
  /** Initial content as JSON-stringified ProseMirror doc, or empty string for new docs. */
  initialContent: string;
  /** Called whenever the editor's content changes. Use to flag the form as dirty. */
  onUpdate?: () => void;
  /** Disabled state — pass through to the editor. */
  disabled?: boolean;
};

export const RichContentEditor = forwardRef<RichContentEditorHandle, RichContentEditorProps>(
  function RichContentEditor({ initialContent, onUpdate, disabled = false }, ref) {
    const initialContentValue = (() => {
      if (!initialContent || initialContent.trim() === "") return "";
      try {
        return JSON.parse(initialContent) as unknown;
      } catch {
        return {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: initialContent }],
            },
          ],
        };
      }
    })();

    const editor = useEditor({
      extensions: blogExtensions,
      content: initialContentValue as never,
      editable: !disabled,
      onUpdate: () => {
        onUpdate?.();
      },
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "prose-editor min-h-[400px] w-full px-4 py-3 outline-none focus:outline-none",
        },
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getJSON: () => editor?.getJSON() ?? { type: "doc", content: [] },
        focus: () => editor?.commands.focus(),
      }),
      [editor],
    );

    if (!editor) {
      return (
        <div className="rounded-base border border-border-default bg-bg-secondary-soft">
          <div className="h-[52px] border-b border-border-default p-2" />
          <div className="min-h-[400px] p-4" />
        </div>
      );
    }

    return (
      <div className="rounded-base border border-border-default bg-bg-primary-soft transition-colors focus-within:border-border-brand focus-within:ring-4 focus-within:ring-ring-brand">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    );
  },
);
