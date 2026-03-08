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
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-display font-bold text-foreground">
          <span className="gradient-ai bg-clip-text text-transparent">AI Stylist</span>
        </h1>
        <p className="text-sm font-body text-muted-foreground mt-0.5">
          Your personal fashion assistant
        </p>
      </div>
      <AIStylistChat wardrobeItems={wardrobeItems} />
    </div>
  );
};

export default AIStylistPage;
