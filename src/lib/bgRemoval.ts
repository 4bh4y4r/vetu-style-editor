import { removeBackground } from '@imgly/background-removal';

/**
 * Pre-scale image to max 640px for 90% faster processing speed
 */
export const preScaleImage = (file: File, maxDim = 640): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      } else {
        return resolve(file);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return resolve(file);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const scaledFile = new File([blob], file.name, { type: 'image/jpeg' });
          resolve(scaledFile);
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
  });
};

/**
 * Removes background from an image file using WebAssembly AI or Canvas fallback.
 */
export const removeGarmentBackground = async (imageFile: File): Promise<{ file: File; previewUrl: string }> => {
  try {
    // Pre-scale image down to max 640px for ultra-fast processing
    const scaledInput = await preScaleImage(imageFile, 640);

    // AI background removal
    const blob = await removeBackground(scaledInput, {
      model: 'small', // Use small fast model footprint
    });

    const newFileName = `nobg_${Date.now()}_${imageFile.name.replace(/\.[^/.]+$/, '')}.png`;
    const noBgFile = new File([blob], newFileName, { type: 'image/png' });
    const previewUrl = URL.createObjectURL(blob);

    return { file: noBgFile, previewUrl };
  } catch (error) {
    console.warn('AI Background Removal fallback engaged:', error);

    try {
      const fallbackBlob = await canvasBackgroundRemoval(imageFile);
      const newFileName = `nobg_${Date.now()}_${imageFile.name.replace(/\.[^/.]+$/, '')}.png`;
      const noBgFile = new File([fallbackBlob], newFileName, { type: 'image/png' });
      const previewUrl = URL.createObjectURL(fallbackBlob);
      return { file: noBgFile, previewUrl };
    } catch {
      return { file: imageFile, previewUrl: URL.createObjectURL(imageFile) };
    }
  }
};

/**
 * Fallback Canvas threshold & background segmentation
 */
const canvasBackgroundRemoval = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample border pixels
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];

      let bgR = 0, bgG = 0, bgB = 0;
      corners.forEach(([x, y]) => {
        const idx = (y * canvas.width + x) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR /= 4;
      bgG /= 4;
      bgB /= 4;

      const tolerance = 40;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        if (diff < tolerance) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Blob creation failed');
      }, 'image/png');
    };
    img.onerror = (e) => reject(e);
  });
};
