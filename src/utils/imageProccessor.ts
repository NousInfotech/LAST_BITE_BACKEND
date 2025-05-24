import sharp from "sharp";

/**
 * Optimizes an image buffer using sharp:
 * - Resize to max width 720px (preserves aspect ratio)
 * - Convert to WebP format
 * - Set quality to 75 (good for mobile/web)
 *
 * @param buffer - The original image buffer
 * @returns The optimized image buffer
 */
export const processImageBuffer = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    .resize({ width: 720, fit: "inside" }) // maintains aspect ratio
    .webp({ quality: 75 }) // webp: better compression + quality
    .toBuffer();
};
