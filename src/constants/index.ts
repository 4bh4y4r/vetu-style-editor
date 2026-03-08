/**
 * Application-wide constants.
 * Centralised so they're easy to find and update.
 */

// ─── Wardrobe categories ─────────────────────────────────────────
export const WARDROBE_CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Shoes',
  'Accessories',
  'Outerwear',
  'Other',
] as const;

// ─── Feed categories ─────────────────────────────────────────────
export const FEED_CATEGORIES = [
  'All',
  'Casual',
  'Formal',
  'Streetwear',
  'Minimal',
  'Boho',
] as const;

// ─── Calendar ────────────────────────────────────────────────────
export const WEEKDAYS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'] as const;

// ─── AI Stylist ──────────────────────────────────────────────────
export const AI_QUICK_PROMPTS = [
  'Suggest an outfit for a date night',
  'What goes well together from my closet?',
  'Help me dress for a job interview',
  'Create a weekend casual look',
] as const;

export const AI_IMAGE_PROMPTS = [
  '🎨 Generate a casual streetwear outfit',
  '🎨 Generate an elegant evening look',
  '🎨 Generate a boho summer outfit',
] as const;

// ─── API endpoints (derived from env) ────────────────────────────
export const getEdgeFunctionUrl = (name: string) =>
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`;
