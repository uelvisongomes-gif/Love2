/**
 * Client-side image compression. Redimensiona pra max 400x400 e comprime pra ~30KB.
 * Retorna data URL (base64) pronta pra mandar ao backend.
 */
export async function compressImage(
  file: File,
  opts: { maxSize?: number; quality?: number; format?: 'image/jpeg' | 'image/webp' } = {},
): Promise<string> {
  const maxSize = opts.maxSize ?? 400;
  const quality = opts.quality ?? 0.75;
  const format = opts.format ?? 'image/jpeg';

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não consegui ler o arquivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.onload = () => {
        const { width, height } = img;
        const scale = Math.min(1, maxSize / Math.max(width, height));
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas indisponível'));
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const dataUrl = canvas.toDataURL(format, quality);
          resolve(dataUrl);
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
