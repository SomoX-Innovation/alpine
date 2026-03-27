import sharp from "sharp";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function convertUploadToWebp(file: File): Promise<{ buffer?: Buffer; error?: string }> {
  if (!file || file.size === 0) {
    return { error: "No file provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Please upload an image file." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Image is too large. Maximum size is 10MB." };
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input, { animated: true, failOn: "none" })
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    return { buffer: output };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[image-upload] webp conversion failed:", message);
    return { error: "Failed to convert image to WebP. Please upload JPG, PNG, or WebP." };
  }
}
