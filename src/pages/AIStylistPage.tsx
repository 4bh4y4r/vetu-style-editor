import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AIStylistChat from '@/components/AIStylistChat';
import type { WardrobeItem } from '@/types';

const AIStylistPage = () => {
  const { user } = useAuth();
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setWardrobeItems(data);
      });
  }, [user]);

  return (
    <div className="pb-20">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-display font-bold text-foreground">AI Stylist</h1>
        <p className="text-xs font-body text-muted-foreground mt-0.5">
          Your personal fashion assistant
        </p>
      </div>
      <AIStylistChat wardrobeItems={wardrobeItems} />
    </div>
  );
};

export default AIStylistPage;
