"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, ImagePlus, Loader2 } from "lucide-react";

import {
  uploadBlogImage,
  uploadQuizQuestionStimulusImage,
  validateImageFile,
  type UploadError,
} from "@/lib/blog/upload-image";

type ImageUploadProps = {
  currentImageUrl?: string | null;
  currentImagePath?: string | null;
  onChange: (result: { url: string | null; path: string | null }) => void;
  disabled?: boolean;
  /** Default: blog post cover flow. `quiz_stimulus` uses question-stimuli path in the same bucket. */
  uploadTarget?: "blog" | "quiz_stimulus";
};

type Mode = "empty" | "drag_over" | "validation_error" | "uploading" | "uploaded" | "upload_error";

function messageFromUploadError(err: UploadError): string {
  switch (err.code) {
    case "invalid_format":
      return "File must be JPEG, PNG, or WebP.";
    case "file_too_large":
      return "File too large (5 MB max).";
    case "not_authenticated":
      return "You must be signed in to upload images.";
    case "upload_failed":
    default:
      return err.message || "Upload failed. Try again.";
  }
}

function toUploadError(err: unknown): UploadError {
  if (err && typeof err === "object" && "code" in err && "message" in err) {
    const code = (err as { code?: unknown }).code;
    const message = (err as { message?: unknown }).message;
    if (
      (code === "invalid_format" ||
        code === "file_too_large" ||
        code === "not_authenticated" ||
        code === "upload_failed") &&
      typeof message === "string"
    ) {
      return { code, message };
    }
  }
  return { code: "upload_failed", message: "Upload failed. Try again." };
}

export function ImageUpload({
  currentImageUrl,
  currentImagePath,
  onChange,
  disabled = false,
  uploadTarget = "blog",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const hasImage = !!currentImageUrl;

  const mode: Mode = useMemo(() => {
    if (hasImage) return "uploaded";
    if (isUploading) return "uploading";
    if (error) {
      return error.code === "invalid_format" || error.code === "file_too_large"
        ? "validation_error"
        : "upload_error";
    }
    if (isDragging) return "drag_over";
    return "empty";
  }, [error, hasImage, isDragging, isUploading]);

  useEffect(() => {
    if (!error) return;
    if (error.code !== "invalid_format" && error.code !== "file_too_large") return;
    const t = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(t);
  }, [error]);

  function openFilePicker() {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }

  function resetInputValue() {
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setError(null);
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      setIsDragging(false);
      resetInputValue();
      return;
    }

    setFileName(file.name);
    setIsDragging(false);
    setIsUploading(true);
    try {
      const result =
        uploadTarget === "quiz_stimulus" ? await uploadQuizQuestionStimulusImage(file) : await uploadBlogImage(file);
      onChange({ url: result.publicUrl, path: result.path });
    } catch (e) {
      setError(toUploadError(e));
    } finally {
      setIsUploading(false);
      resetInputValue();
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFile(file);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    void handleFile(file);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;
  }

  function onDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  const baseContainer =
    "w-full aspect-video rounded-base border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center";
  const interactive =
    "cursor-pointer hover:border-border-default-medium hover:bg-bg-secondary";
  const disabledClasses = "cursor-not-allowed opacity-60";

  const containerClassName = (() => {
    if (mode === "drag_over") return `${baseContainer} border-border-brand bg-bg-brand-softer`;
    if (mode === "validation_error" || mode === "upload_error")
      return `${baseContainer} border-border-danger-subtle bg-bg-danger-softer`;
    if (mode === "uploading") return `${baseContainer} border-border-default bg-bg-secondary-soft opacity-80 pointer-events-none`;
    return `${baseContainer} border-border-default bg-bg-secondary-soft ${disabled || isUploading ? disabledClasses : interactive}`;
  })();

  const headline = (() => {
    if (mode === "uploading") return "Uploading...";
    if (mode === "validation_error" || mode === "upload_error")
      return error ? messageFromUploadError(error) : "Upload failed. Try again.";
    return "Click to upload or drag and drop";
  })();

  const subtext = (() => {
    if (mode === "uploading") return fileName;
    if (mode === "validation_error" || mode === "upload_error") return "Click or drag a different file";
    return "JPEG, PNG, or WebP — max 5MB";
  })();

  const Icon = (() => {
    if (mode === "uploading") return Loader2;
    if (mode === "validation_error" || mode === "upload_error") return CircleAlert;
    return ImagePlus;
  })();

  const iconClassName = (() => {
    if (mode === "uploading") return "size-8 text-text-fg-brand animate-spin";
    if (mode === "validation_error" || mode === "upload_error") return "size-8 text-text-fg-danger-strong";
    return "size-8 text-text-muted";
  })();

  return (
    <>
      {/* Single file input — rendered once, used by both modes via inputRef.click() */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          setError(null);
          onInputChange(e);
        }}
      />

      {/* preserve parent tracking for deletion later; always mounted so value stays stable across mode switches */}
      <input type="hidden" value={currentImagePath ?? ""} readOnly hidden />

      {mode === "uploaded" && currentImageUrl ? (
        <div className="relative w-full aspect-video overflow-hidden rounded-base border border-border-default">
          <Image
            src={currentImageUrl}
            alt="Cover image preview"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />

          <div className="absolute right-0 top-0 flex gap-2 p-2">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={disabled}
              className="inline-flex items-center justify-center rounded-sm border border-border-default bg-bg-primary-soft px-2 py-1 text-xs font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange({ url: null, path: null })}
              disabled={disabled}
              className="inline-flex items-center justify-center rounded-sm border border-border-default bg-bg-primary-soft px-2 py-1 text-xs font-medium text-text-fg-danger-strong shadow-xs transition-colors hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={containerClassName}
          role="button"
          tabIndex={0}
          onClick={() => {
            setError(null);
            openFilePicker();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setError(null);
              openFilePicker();
            }
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          aria-disabled={disabled || isUploading}
        >
          <Icon className={iconClassName} aria-hidden />
          <p className="mt-2 text-sm font-medium text-text-body">{headline}</p>
          <p className="mt-1 text-xs text-text-muted">{subtext}</p>
        </div>
      )}
    </>
  );
}

export default ImageUpload;
