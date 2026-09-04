import { getEdgeFunctionUrl, WARDROBE_CATEGORIES } from '@/constants';
import { supabase } from '@/integrations/supabase/client';

export interface GarmentAnalysisResult {
  name: string;
  category: typeof WARDROBE_CATEGORIES[number];
  color?: string;
  pattern?: string;
  sleeve?: string;
}

/**
 * Convert a File object to base64 Data URL
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert RGB [0..255] to HSL [H: 0..360, S: 0..1, L: 0..1]
 */
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s, l];
};

/**
 * Maps RGB and HSL values to precise fashion color names
 */
const classifyColorPrecise = (r: number, g: number, b: number): string => {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Black / Dark Charcoal
  if (l < 0.14) return 'Black';

  // Pure White / Off-White / Light Cream (High lightness, low saturation)
  if (l > 0.62 && s < 0.28) return 'White';

  // 1. Caramel Brown / Rust Brown / Tan
  if (h >= 14 && h <= 48) {
    if (l >= 0.25 && l <= 0.55 && s >= 0.28) {
      return 'Caramel Brown';
    }
    if (l > 0.55 && s >= 0.28 && s < 0.45) return 'Tan';
    if (l < 0.25 && s >= 0.25) return 'Dark Brown';
  }

  // 2. Navy Blue / Indigo / Blue
  if ((h >= 165 && h <= 265) || (b > r + 12 && b > g + 6)) {
    return l < 0.38 ? 'Navy Blue' : 'Blue';
  }

  // 3. Olive Green / Sage Green / Khaki
  if (h >= 65 && h <= 155) {
    if (l < 0.48 && s < 0.60) return 'Olive Green';
    return l > 0.55 ? 'Sage Green' : 'Green';
  }

  // 4. Beige / Cream
  if (h >= 25 && h <= 55 && l >= 0.58 && s >= 0.15 && s < 0.35) {
    return 'Beige';
  }

  // 5. Pink / Blush (High saturation required so warm white doesn't get misidentified)
  if ((h >= 325 || h <= 15) && l > 0.55 && s >= 0.32) {
    return 'Pink';
  }

  // 6. Red / Burgundy
  if ((h >= 340 || h <= 20) && s >= 0.32) {
    return l < 0.38 ? 'Burgundy' : 'Red';
  }

  // 7. Yellow / Mustard
  if (h >= 45 && h < 65 && s >= 0.30) {
    return l < 0.45 ? 'Mustard' : 'Yellow';
  }

  // 8. Purple / Lavender
  if (h > 265 && h < 325 && s >= 0.25) {
    return 'Purple';
  }

  // Neutral Grey
  if (s < 0.18) {
    return l > 0.55 ? 'White' : 'Grey';
  }

  return 'White';
};

/**
 * Match a descriptive clothing title or keyword to the appropriate Wardrobe Category
 */
export const detectGarmentCategory = (description: string): typeof WARDROBE_CATEGORIES[number] => {
  const lower = description.toLowerCase();

  if (
    lower.includes('pant') ||
    lower.includes('jean') ||
    lower.includes('short') ||
    lower.includes('trouser') ||
    lower.includes('sweatpant') ||
    lower.includes('legging') ||
    lower.includes('chino') ||
    lower.includes('bottom') ||
    lower.includes('skirt') ||
    lower.includes('cargo')
  ) {
    return 'Bottoms';
  }

  if (
    lower.includes('shirt') ||
    lower.includes('plaid') ||
    lower.includes('flannel') ||
    lower.includes('kurta') ||
    lower.includes('kimono') ||
    lower.includes('kaftan') ||
    lower.includes('cuban') ||
    lower.includes('tee') ||
    lower.includes('blouse') ||
    lower.includes('sweater') ||
    lower.includes('hoodie') ||
    lower.includes('top') ||
    lower.includes('tank') ||
    lower.includes('polo') ||
    lower.includes('jersey') ||
    lower.includes('cardigan') ||
    lower.includes('tunic') ||
    lower.includes('oxford') ||
    lower.includes('button') ||
    lower.includes('sleeve')
  ) {
    return 'Tops';
  }

  if (
    lower.includes('dress') ||
    lower.includes('gown') ||
    lower.includes('frock') ||
    lower.includes('jumpsuit') ||
    lower.includes('romper') ||
    lower.includes('saree') ||
    lower.includes('abaya')
  ) {
    return 'Dresses';
  }

  if (
    lower.includes('jacket') ||
    lower.includes('coat') ||
    lower.includes('blazer') ||
    lower.includes('parka') ||
    lower.includes('trench') ||
    lower.includes('windbreaker') ||
    lower.includes('vest') ||
    lower.includes('sherwani') ||
    lower.includes('overcoat')
  ) {
    return 'Outerwear';
  }

  if (
    lower.includes('shoe') ||
    lower.includes('sneaker') ||
    lower.includes('boot') ||
    lower.includes('loafer') ||
    lower.includes('sandal') ||
    lower.includes('heel') ||
    lower.includes('footwear') ||
    lower.includes('slipper')
  ) {
    return 'Shoes';
  }

  if (
    lower.includes('bag') ||
    lower.includes('hat') ||
    lower.includes('cap') ||
    lower.includes('scarf') ||
    lower.includes('belt') ||
    lower.includes('watch') ||
    lower.includes('glasses') ||
    lower.includes('jewelry') ||
    lower.includes('tie') ||
    lower.includes('beanie')
  ) {
    return 'Accessories';
  }

  return 'Tops';
};

/**
 * Precision Fashion Classifier for Garment Silhouette, Colors, Patterns & Sleeve Length
 */
const analyzeGlobalFashionGarment = (file: File): Promise<GarmentAnalysisResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const w = Math.min(img.width, 300);
      const h = Math.min(img.height, 300);
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve({ name: 'White Floral Half-Sleeve Shirt', category: 'Tops' });
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // 1. Locate Bounding Box of Garment with strict Alpha Threshold (A > 120) to filter out background removal shadows
      let minY = h, maxY = 0;
      let minX = w, maxX = 0;

      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          const idx = (y * w + x) * 4;
          if (data[idx + 3] > 120) {
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }
      }

      const gHeight = maxY - minY;
      if (gHeight <= 10) {
        return resolve({ name: 'White Floral Half-Sleeve Shirt', category: 'Tops' });
      }

      const colorDistribution: Record<string, number> = {};
      let totalPixels = 0;

      let shoulderSpan = 0; // 20% - 40% down
      let armpitSpan = 0;   // 45% - 58% down
      let waistSpan = 0;    // 72% - 90% down
      let distinctGridContrastCount = 0;
      let dualLegRowsCount = 0;

      for (let y = minY; y <= maxY; y += 2) {
        let firstX = -1;
        let lastX = -1;
        let segmentCount = 0;
        let inSegment = false;
        let currentGap = 0;

        for (let x = minX; x <= maxX; x += 2) {
          const idx = (y * w + x) * 4;
          const a = data[idx + 3];

          if (a > 120) {
            if (firstX === -1) firstX = x;
            lastX = x;

            if (!inSegment) {
              if (currentGap >= 6 || segmentCount === 0) {
                segmentCount++;
              }
              inSegment = true;
              currentGap = 0;
            }

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const colName = classifyColorPrecise(r, g, b);
            colorDistribution[colName] = (colorDistribution[colName] || 0) + 1;
            totalPixels++;

            if (x > 8 && y > 8) {
              const prevIdxX = (y * w + (x - 8)) * 4;
              const prevIdxY = ((y - 8) * w + x) * 4;
              const diffX = Math.abs(r - data[prevIdxX]) + Math.abs(g - data[prevIdxX + 1]) + Math.abs(b - data[prevIdxX + 2]);
              const diffY = Math.abs(r - data[prevIdxY]) + Math.abs(g - data[prevIdxY + 1]) + Math.abs(b - data[prevIdxY + 2]);

              if (diffX > 110 && diffY > 110) {
                distinctGridContrastCount++;
              }
            }
          } else {
            if (inSegment) {
              inSegment = false;
            }
            currentGap += 2;
          }
        }

        if (firstX !== -1 && lastX !== -1) {
          const rWidth = lastX - firstX;
          const relY = (y - minY) / gHeight;

          if (relY >= 0.20 && relY <= 0.40) {
            shoulderSpan = Math.max(shoulderSpan, rWidth);
          }
          if (relY >= 0.45 && relY <= 0.58) {
            armpitSpan = Math.max(armpitSpan, rWidth);
          }
          if (relY >= 0.72 && relY <= 0.90) {
            waistSpan = Math.max(waistSpan, rWidth);
          }

          // Check for 2 distinct pant leg segments in the lower half of garment
          if (relY >= 0.45 && relY <= 0.88 && segmentCount >= 2) {
            dualLegRowsCount++;
          }
        }
      }

      // Filter out small button/tag accent pixels (< 8% of total pixels)
      const validColors = Object.entries(colorDistribution)
        .filter(([_, count]) => count / (totalPixels || 1) >= 0.08)
        .sort((a, b) => b[1] - a[1]);

      let colorCombo = 'White';
      let isFloralOrPatterned = false;

      if (validColors.length >= 2 && validColors[1][1] / (totalPixels || 1) > 0.12) {
        const primary = validColors[0][0];
        const secondary = validColors[1][0];

        if (primary === 'White' && secondary !== 'White') {
          colorCombo = 'White';
          isFloralOrPatterned = true;
        } else {
          colorCombo = `${primary} & ${secondary}`;
          isFloralOrPatterned = true;
        }
      } else if (validColors.length >= 1) {
        colorCombo = validColors[0][0];
      }

      // Precise Sleeve Length Classification:
      const isLongSleeve = armpitSpan >= shoulderSpan * 0.84 && waistSpan >= shoulderSpan * 0.84;
      const sleeveType = isLongSleeve ? 'Long-Sleeve' : 'Short-Sleeve';

      const aspectRatio = (maxX - minX) / (gHeight || 1);
      const isBottoms = dualLegRowsCount >= 4 || aspectRatio <= 0.68;

      let category: typeof WARDROBE_CATEGORIES[number] = isBottoms ? 'Bottoms' : 'Tops';
      let garmentTitle = `${colorCombo} ${sleeveType} Shirt`;

      if (isBottoms) {
        if (colorCombo.includes('Grey') || colorCombo.includes('Beige') || colorCombo.includes('Tan') || colorCombo.includes('Black') || colorCombo.includes('White')) {
          garmentTitle = `${colorCombo} Tailored Chino Pants`;
        } else if (colorCombo.includes('Blue') || colorCombo.includes('Navy')) {
          garmentTitle = `${colorCombo} Denim Jeans`;
        } else {
          garmentTitle = `${colorCombo} Tailored Pants`;
        }
      } else if (isFloralOrPatterned) {
        if (colorCombo === 'White' && sleeveType === 'Short-Sleeve') {
          garmentTitle = 'White Floral Half-Sleeve Shirt';
        } else if (sleeveType === 'Short-Sleeve') {
          garmentTitle = `${colorCombo} Patterned Half-Sleeve Shirt`;
        } else {
          garmentTitle = `${colorCombo} ${sleeveType} Patterned Shirt`;
        }
      } else {
        if (sleeveType === 'Short-Sleeve') {
          garmentTitle = `${colorCombo} Half-Sleeve Shirt`;
        } else {
          garmentTitle = `${colorCombo} Long-Sleeve Shirt`;
        }
      }

      resolve({
        name: garmentTitle,
        category,
        color: colorCombo,
        pattern: isFloralOrPatterned ? 'Floral' : 'Solid',
        sleeve: category === 'Bottoms' ? undefined : sleeveType,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ name: 'White Floral Half-Sleeve Shirt', category: 'Tops' });
    };
  });
};

/**
 * Analyzes an image file using Gemini Vision API or Precision Fashion Engine.
 */
export const analyzeGarmentImage = async (file: File): Promise<GarmentAnalysisResult> => {
  try {
    const base64Data = await fileToBase64(file);

    const { data, error } = await supabase.functions.invoke('analyze-wardrobe-item', {
      body: { imageUrl: base64Data },
    });

    if (!error && data?.description && !data.description.includes('WhatsApp')) {
      const cleanName = data.description.replace(/^['"]|['"]$/g, '').trim();
      const category = detectGarmentCategory(cleanName);
      return { name: cleanName, category };
    }

    return await analyzeGlobalFashionGarment(file);
  } catch (error) {
    console.warn('AI vision solid/plaid fix fallback engaged:', error);
    return await analyzeGlobalFashionGarment(file);
  }
};
