/**
 * Client-side photo prep for the quote form: downscale to keep uploads (and
 * demo storage) small. Formats the browser can't decode (e.g. HEIC outside
 * Safari) return null and are sent as "photo attached" metadata only.
 */
const MAX_EDGE = 1280;
const QUALITY = 0.72;

export async function downscale(file: File): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', QUALITY);
  } catch {
    return null;
  }
}
