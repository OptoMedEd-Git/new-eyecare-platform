import { createClient } from "@/lib/supabase/client";

export type UploadResult = {
  path: string; // "user-id/uuid.jpg"
  publicUrl: string; // Full public URL
};

export type UploadError = {
  code: "invalid_format" | "file_too_large" | "not_authenticated" | "upload_failed";
  message: string;
};

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function extFromMime(mime: string): "jpg" | "png" | "webp" {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function toUploadError(err: unknown, fallback: UploadError): UploadError {
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
  return fallback;
}

function throwUploadError(uploadError: UploadError): never {
  const e = Object.assign(new Error(uploadError.message), uploadError);
  throw e;
}

export function validateImageFile(file: File): UploadError | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      code: "invalid_format",
      message: "File must be JPEG, PNG, or WebP.",
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      code: "file_too_large",
      message: "File too large (5 MB max).",
    };
  }
  return null;
}

export async function uploadBlogImage(file: File): Promise<UploadResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throwUploadError(validationError);
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throwUploadError({
      code: "not_authenticated",
      message: "You must be signed in to upload images.",
    });
  }

  const ext = extFromMime(file.type);
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throwUploadError({
      code: "upload_failed",
      message: "Upload failed. Try again.",
    });
  }

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  if (!data?.publicUrl) {
    throwUploadError({
      code: "upload_failed",
      message: "Upload failed. Try again.",
    });
  }

  return { path, publicUrl: data.publicUrl };
}

export async function deleteBlogImage(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from("blog-images").remove([path]);
  if (error) {
    throwUploadError({
      code: "upload_failed",
      message: "Delete failed. Try again.",
    });
  }
}

export function isUploadError(err: unknown): err is UploadError {
  const parsed = toUploadError(err, { code: "upload_failed", message: "" });
  return parsed.message !== "";
}

