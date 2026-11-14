import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/**
 * Downscale a photo in the browser so phone pictures (often 4–10 MB) upload
 * and load quickly. Returns the original file if it can't be decoded.
 */
const resizeImage = async (file: File, maxSize: number, quality = 0.85): Promise<Blob> => {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
};

/**
 * Upload an image to the public product-images bucket under `folder/`
 * and return its public URL. Throws an Error with a readable message.
 */
export const uploadImage = async (file: File, folder: "hero" | "reviews", maxSize = 1920): Promise<string> => {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (JPG, PNG or WebP).");
  if (file.size > MAX_INPUT_BYTES) throw new Error("Image is too large (max 15 MB).");

  const blob = await resizeImage(file, maxSize);
  const isJpeg = blob !== file || file.type === "image/jpeg";
  const ext = isJpeg ? "jpg" : (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: isJpeg ? "image/jpeg" : file.type,
    cacheControl: "31536000",
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};

/** Best-effort removal of an image we uploaded (ignores external URLs). */
export const deleteUploadedImage = async (url: string) => {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  await supabase.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + marker.length))]);
};
