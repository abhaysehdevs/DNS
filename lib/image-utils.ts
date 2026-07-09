/**
 * Converts any image file (PNG, JPG, etc.) to WebP format on the client side.
 * Reduces asset payload size and optimizes performance.
 */
export async function convertToWebP(file: File, quality = 0.85): Promise<File> {
  // If the file is already WebP, return it directly
  if (file.type === 'image/webp') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to acquire canvas 2D rendering context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas serialization returned null blob'));
              return;
            }

            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image element for canvas mapping'));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('FileReader encountered file system parse error'));
    };
    reader.readAsDataURL(file);
  });
}
