/**
 * Center-crops any selected album image into a crisp 160x160 square portrait
 * and compresses it below 50 KB so it persists smoothly across WebSocket rooms,
 * Express profiles, and Firestore documents.
 */
export async function processAlbumImageFile(file: File): Promise<string> {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('invalid_image_type');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('decode_failed'));
    image.src = dataUrl;
  });

  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas_unavailable');
  }

  const minSide = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const sx = Math.max(0, Math.floor(((img.naturalWidth || img.width) - minSide) / 2));
  const sy = Math.max(0, Math.floor(((img.naturalHeight || img.height) - minSide) / 2));

  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

  const mimeTypes = ['image/webp', 'image/jpeg'];
  const qualities = [0.82, 0.7, 0.56, 0.42];

  for (const mime of mimeTypes) {
    for (const quality of qualities) {
      const encoded = canvas.toDataURL(mime, quality);
      if (encoded.startsWith(`data:${mime}`) && encoded.length <= 52000) {
        return encoded;
      }
    }
  }

  return canvas.toDataURL('image/jpeg', 0.35);
}
