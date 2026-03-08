/**
 * Shared TypeScript types used across the application.
 * These are app-level types (not database types — those are auto-generated).
 */

// ─── User & Profile ─────────────────────────────────────────────
export interface Profile {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

// ─── Wardrobe ────────────────────────────────────────────────────
export interface WardrobeItem {
  id: string;
  image_url: string;
  category: string;
  name: string | null;
}

// ─── Boards & Pins ───────────────────────────────────────────────
export interface Board {
  id: string;
  name: string;
  pins: BoardPin[];
}

export interface BoardPin {
  id?: string;
  image_url: string;
  title?: string | null;
}

// ─── Outfit Posts ────────────────────────────────────────────────
export interface OutfitPost {
  id: string;
  image_url: string;
  outfit_date: string;
  is_public: boolean;
  notes: string | null;
}

// ─── AI Chat ─────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}
