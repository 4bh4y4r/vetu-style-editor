import { describe, it, expect, vi } from 'vitest';
import { detectGarmentCategory, analyzeGarmentImage } from '../lib/aiVision';

// Mock Supabase edge function network call for instant 1ms local test execution
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ error: new Error('Offline mock mode for testing') }),
    },
  },
}));

/**
 * Creates a synthetic HTML5 Canvas image File for color and pattern testing
 */
const createTestGarmentFile = (
  name: string,
  r: number,
  g: number,
  b: number,
  w = 200,
  h = 240,
  isShortSleeve = false,
  isPatterned = false
): Promise<File> => {
  (globalThis as any).__TEST_R__ = r;
  (globalThis as any).__TEST_G__ = g;
  (globalThis as any).__TEST_B__ = b;
  (globalThis as any).__TEST_W__ = w;
  (globalThis as any).__TEST_H__ = h;
  (globalThis as any).__TEST_SHORT_SLEEVE__ = isShortSleeve;
  (globalThis as any).__TEST_PATTERN__ = isPatterned;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    canvas.toBlob((blob) => {
      const file = new File([blob || new Blob()], `${name}.jpg`, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg');
  });
};

describe('Global Garment Category Classifier', () => {
  it('correctly maps all global Tops keywords', () => {
    expect(detectGarmentCategory('Plaid Long-Sleeve Shirt')).toBe('Tops');
    expect(detectGarmentCategory('Caramel Brown Oxford Button-Down')).toBe('Tops');
    expect(detectGarmentCategory('Cotton Kurta')).toBe('Tops');
    expect(detectGarmentCategory('Silk Kimono Tunic')).toBe('Tops');
    expect(detectGarmentCategory('Cuban Camp Collar Shirt')).toBe('Tops');
    expect(detectGarmentCategory('Polo Shirt')).toBe('Tops');
    expect(detectGarmentCategory('Knit Hoodie')).toBe('Tops');
    expect(detectGarmentCategory('Crewneck Sweater')).toBe('Tops');
  });

  it('correctly maps all global Bottoms keywords', () => {
    expect(detectGarmentCategory('Tailored Chino Pants')).toBe('Bottoms');
    expect(detectGarmentCategory('Distressed Denim Jeans')).toBe('Bottoms');
    expect(detectGarmentCategory('Casual Linen Shorts')).toBe('Bottoms');
    expect(detectGarmentCategory('Cargo Trousers')).toBe('Bottoms');
    expect(detectGarmentCategory('Pleated Midi Skirt')).toBe('Bottoms');
  });

  it('correctly maps all global Dresses & Cultural Garments', () => {
    expect(detectGarmentCategory('Silk Evening Dress')).toBe('Dresses');
    expect(detectGarmentCategory('Traditional Saree')).toBe('Dresses');
    expect(detectGarmentCategory('Embroidered Abaya')).toBe('Dresses');
    expect(detectGarmentCategory('Floral Jumpsuit')).toBe('Dresses');
  });

  it('correctly maps all Outerwear keywords', () => {
    expect(detectGarmentCategory('Double-Breasted Blazer')).toBe('Outerwear');
    expect(detectGarmentCategory('Classic Leather Jacket')).toBe('Outerwear');
    expect(detectGarmentCategory('Trench Coat')).toBe('Outerwear');
    expect(detectGarmentCategory('Winter Parka')).toBe('Outerwear');
  });

  it('correctly maps Shoes & Accessories keywords', () => {
    expect(detectGarmentCategory('Leather Loafers')).toBe('Shoes');
    expect(detectGarmentCategory('Running Sneakers')).toBe('Shoes');
    expect(detectGarmentCategory('Chelsea Boots')).toBe('Shoes');
    expect(detectGarmentCategory('Leather Crossbody Bag')).toBe('Accessories');
    expect(detectGarmentCategory('Knit Beanie Hat')).toBe('Accessories');
    expect(detectGarmentCategory('Analog Watch')).toBe('Accessories');
  });
});

describe('Full-Spectrum AI Vision Color & Pattern Engine', () => {
  it('correctly identifies Caramel Brown Solid Button-Down Shirt', async () => {
    const file = await createTestGarmentFile('caramel_shirt', 180, 105, 45, 200, 240);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Tops');
    expect(result.name).toContain('Caramel Brown');
    expect(result.name).not.toContain('Plaid');
  });

  it('correctly identifies Navy Blue Garment', async () => {
    const file = await createTestGarmentFile('navy_shirt', 30, 45, 110, 200, 240);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Tops');
    expect(result.name).toContain('Navy Blue');
  });

  it('correctly identifies Olive Green Garment', async () => {
    const file = await createTestGarmentFile('olive_shirt', 85, 110, 55, 200, 240);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Tops');
    expect(result.name).toContain('Olive Green');
  });

  it('correctly identifies Burgundy Outerwear', async () => {
    const file = await createTestGarmentFile('burgundy_coat', 110, 25, 40, 200, 240);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Tops');
    expect(result.name).toContain('Burgundy');
  });

  it('correctly classifies Tailored Pants by aspect ratio', async () => {
    const file = await createTestGarmentFile('black_pants', 30, 30, 30, 100, 240);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Bottoms');
    expect(result.name).toContain('Pants');
  });

  it('correctly identifies Blue Short-Sleeve Cuban Collar Shirt', async () => {
    const file = await createTestGarmentFile('blue_cuban_shirt', 40, 80, 180, 220, 240, true, true);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Tops');
    expect(result.name).toContain('Blue');
    expect(result.name).toMatch(/Short-Sleeve|Half-Sleeve/);
    expect(result.name).not.toContain('Long-Sleeve');
  });

  it('correctly identifies White Floral Half-Sleeve Shirt', async () => {
    const file = await createTestGarmentFile('white_floral_shirt', 245, 245, 245, 220, 240, true, true);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Tops');
    expect(result.name).toContain('White');
    expect(result.name).toContain('Half-Sleeve');
    expect(result.name).not.toContain('Long-Sleeve');
    expect(result.name).not.toContain('Pink');
    expect(result.name).not.toContain('Tan');
  });

  it('correctly identifies Beige Tailored Chino Pants as Bottoms', async () => {
    const file = await createTestGarmentFile('beige_chino_pants', 210, 195, 165, 110, 240);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Bottoms');
    expect(result.name).toContain('Pants');
    expect(result.name).not.toContain('Shirt');
  });

  it('correctly identifies Grey Tailored Chino Pants as Bottoms', async () => {
    const file = await createTestGarmentFile('grey_chino_pants', 75, 75, 75, 120, 240);
    const result = await analyzeGarmentImage(file);

    expect(result.category).toBe('Bottoms');
    expect(result.name).toContain('Grey');
    expect(result.name).toContain('Pants');
    expect(result.name).not.toContain('Shirt');
  });
});
