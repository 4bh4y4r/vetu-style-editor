import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { outfitCards, categories, OutfitCard as OutfitCardType } from '@/data/fashion';
import MasonryGrid from '@/components/MasonryGrid';
import { supabase } from '@/integrations/supabase/client';

const heights: Array<'tall' | 'medium' | 'short'> = ['tall', 'medium', 'short'];

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const [publicPosts, setPublicPosts] = useState<OutfitCardType[]>([]);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      const { data } = await supabase
        .from('outfit_posts')
        .select('id, image_url, user_id, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        // Fetch profile info for these users
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const cards: OutfitCardType[] = data.map((post, i) => {
          const profile = profileMap.get(post.user_id);
          return {
            id: post.id,
            imageUrl: post.image_url,
            username: profile?.username || 'user',
            avatarUrl: profile?.avatar_url || `https://i.pravatar.cc/40?u=${post.user_id}`,
            liked: false,
            height: heights[i % 3],
            category: 'All',
          };
        });
        setPublicPosts(cards);
      }
    };
    fetchPublicPosts();
  }, []);

  // Combine real posts with demo data as fallback
  const allCards = publicPosts.length > 0 ? [...publicPosts, ...outfitCards] : outfitCards;

  const filtered = activeCategory === 'All'
    ? allCards
    : allCards.filter(c => c.category === activeCategory);

  return (
    <div className="pb-20 lg:pb-4">
      {/* Sticky header — mobile only; desktop uses side nav for logo + bell */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 lg:hidden">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 pt-4 pb-3">
          <h1 className="text-2xl font-display font-bold tracking-tight text-primary">DRIP</h1>
          <button onClick={() => navigate('/inbox')} className="p-2 text-foreground hover:bg-secondary rounded-full transition" aria-label="Notifications">
            <Bell size={22} strokeWidth={1.6} />
          </button>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto">

        <div className="flex gap-2.5 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-body font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <MasonryGrid cards={filtered} />
    </div>
  );
};

export default HomePage;
