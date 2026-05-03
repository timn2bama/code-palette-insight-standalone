/**
 * Lightweight client-side image compressor.
 * - Resizes longest edge to `maxSize` if larger
 * - Produces WebP and JPEG, returns the smaller resulting file
 */
export async function compressImage(file: File, maxSize = 1280, webpQuality = 0.8, jpegQuality = 0.75): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const img = await loadImage(URL.createObjectURL(file));
  let { width, height } = img;

  if (width > maxSize || height > maxSize) {
    if (width > height) {
      height = Math.round((height * maxSize) / width);
      width = maxSize;
    } else {
      width = Math.round((width * maxSize) / height);
      height = maxSize;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0, width, height);

  const blobs = await Promise.all([
    blobFromCanvas(canvas, 'image/webp', webpQuality),
    blobFromCanvas(canvas, 'image/jpeg', jpegQuality),
  ]);

  // Choose smallest non-null blob
  const candidates = blobs.filter(Boolean) as Blob[];
  if (candidates.length === 0) return file;
  let chosen = candidates[0];
  for (const b of candidates) if (b.size < chosen.size) chosen = b;

  const ext = chosen.type === 'image/webp' ? 'webp' : 'jpg';
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
  return new File([chosen], `${nameWithoutExt}.${ext}`, { type: chosen.type, lastModified: Date.now() });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function blobFromCanvas(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    } catch (e) {
      resolve(null);
    }
  });
}
