import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, WardrobeItem, Board } from '@/types';

/**
 * Hook to fetch and manage all profile-related data.
 * Keeps ProfilePage lean by encapsulating data-fetching logic.
 */
export const useProfileData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);

  // ─── Fetch profile ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
    fetchWardrobe();
    fetchBoards();
  }, [user]);

  // ─── Wardrobe ───────────────────────────────────────────────
  const fetchWardrobe = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setWardrobeItems(data);
  };

  // ─── Boards ─────────────────────────────────────────────────
  const fetchBoards = async () => {
    if (!user) return;
    const { data: boardsData } = await supabase
      .from('boards')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!boardsData) return;

    const boardsWithPins: Board[] = await Promise.all(
      boardsData.map(async (b) => {
        const { data: pins } = await supabase
          .from('board_pins')
          .select('image_url')
          .eq('board_id', b.id)
          .order('created_at', { ascending: false })
          .limit(4);
        return { ...b, pins: pins || [] };
      })
    );
    setBoards(boardsWithPins);
  };

  const createBoard = async (name: string) => {
    if (!user) return;
    await supabase.from('boards').insert({ user_id: user.id, name });
    fetchBoards();
  };

  const deleteBoard = async (boardId: string) => {
    await supabase.from('boards').delete().eq('id', boardId);
    fetchBoards();
  };

  const displayName = profile?.username || user?.email?.split('@')[0] || 'user';

  return {
    user,
    profile,
    displayName,
    wardrobeItems,
    boards,
    fetchWardrobe,
    fetchBoards,
    createBoard,
    deleteBoard,
  };
};
