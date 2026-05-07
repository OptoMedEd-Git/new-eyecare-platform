"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { useState } from "react";

import { EditorImageModal } from "./EditorImageModal";

type EditorToolbarProps = {
  editor: Editor;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const btnClass = (active: boolean, disabled = false) =>
    [
      "inline-flex size-8 items-center justify-center rounded-sm transition-colors",
      active
        ? "bg-bg-brand-softer text-text-fg-brand-strong"
        : "text-text-body hover:bg-bg-secondary-soft hover:text-text-heading",
      disabled ? "cursor-not-allowed opacity-50" : "",
    ].join(" ");

  function handleLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    // TODO: replace prompt flow with a styled popover.
    const url = window.prompt("Enter URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:)/.test(url)) {
      window.alert("URL must start with http://, https://, or mailto:");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function handleImageInsert(url: string) {
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: "" }).run();
    setImageModalOpen(false);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 border-b border-border-default p-2">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={btnClass(false, !editor.can().undo())}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={btnClass(false, !editor.can().redo())}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 className="size-4" aria-hidden />
          </button>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnClass(editor.isActive("bold"))}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
            aria-pressed={editor.isActive("bold")}
          >
            <Bold className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnClass(editor.isActive("italic"))}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
            aria-pressed={editor.isActive("italic")}
          >
            <Italic className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={btnClass(editor.isActive("underline"))}
            title="Underline (Ctrl+U)"
            aria-label="Underline"
            aria-pressed={editor.isActive("underline")}
          >
            <Underline className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btnClass(editor.isActive("strike"))}
            title="Strikethrough"
            aria-label="Strikethrough"
            aria-pressed={editor.isActive("strike")}
          >
            <Strikethrough className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={btnClass(editor.isActive("code"))}
            title="Inline code"
            aria-label="Inline code"
            aria-pressed={editor.isActive("code")}
          >
            <Code className="size-4" aria-hidden />
          </button>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={btnClass(editor.isActive("heading", { level: 2 }))}
            title="Heading 2"
            aria-label="Heading 2"
            aria-pressed={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={btnClass(editor.isActive("heading", { level: 3 }))}
            title="Heading 3"
            aria-label="Heading 3"
            aria-pressed={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="size-4" aria-hidden />
          </button>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnClass(editor.isActive("bulletList"))}
            title="Bullet list"
            aria-label="Bullet list"
            aria-pressed={editor.isActive("bulletList")}
          >
            <List className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnClass(editor.isActive("orderedList"))}
            title="Numbered list"
            aria-label="Numbered list"
            aria-pressed={editor.isActive("orderedList")}
          >
            <ListOrdered className="size-4" aria-hidden />
          </button>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={btnClass(editor.isActive("blockquote"))}
            title="Blockquote"
            aria-label="Blockquote"
            aria-pressed={editor.isActive("blockquote")}
          >
            <Quote className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={btnClass(editor.isActive("codeBlock"))}
            title="Code block"
            aria-label="Code block"
            aria-pressed={editor.isActive("codeBlock")}
          >
            <Code2 className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={btnClass(false)}
            title="Horizontal rule"
            aria-label="Horizontal rule"
          >
            <Minus className="size-4" aria-hidden />
          </button>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleLink}
            className={btnClass(editor.isActive("link"))}
            title="Insert link"
            aria-label="Insert link"
            aria-pressed={editor.isActive("link")}
          >
            <Link2 className="size-4" aria-hidden />
          </button>
          {editor.isActive("link") ? (
            <button
              type="button"
              onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
              className={btnClass(false)}
              title="Remove link"
              aria-label="Remove link"
            >
              <Link2Off className="size-4" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className={btnClass(false)}
            title="Insert image"
            aria-label="Insert image"
          >
            <ImageIcon className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <EditorImageModal
        key={imageModalOpen ? "open" : "closed"}
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsert={handleImageInsert}
      />
    </>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border-default" aria-hidden />;
}

