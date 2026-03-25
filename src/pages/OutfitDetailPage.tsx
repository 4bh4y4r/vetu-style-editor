import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { outfitCards, trendingCards, OutfitCard as OutfitCardType } from '@/data/fashion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SaveToBoardModal from '@/components/SaveToBoardModal';
import MasonryGrid from '@/components/MasonryGrid';

const heights: Array<'tall' | 'medium' | 'short'> = ['tall', 'medium', 'short'];

const OutfitDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [card, setCard] = useState<OutfitCardType | null>(null);
  const [similarCards, setSimilarCards] = useState<OutfitCardType[]>([]);

  // ─── Find the card ─────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });

    const allStatic = [...outfitCards, ...trendingCards];
    const found = allStatic.find((c) => c.id === id);

    if (found) {
      setCard(found);
      setLiked(found.liked);
      buildSimilar(found, allStatic);
    } else {
      // Try fetching from DB (public outfit post)
      fetchFromDB();
    }
  }, [id]);

  const fetchFromDB = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('outfit_posts')
      .select('id, image_url, user_id, created_at')
      .eq('id', id)
      .single();

    if (data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', data.user_id)
        .single();

      const dbCard: OutfitCardType = {
        id: data.id,
        imageUrl: data.image_url,
        username: profile?.username || 'user',
        avatarUrl: profile?.avatar_url || `https://i.pravatar.cc/40?u=${data.user_id}`,
        liked: false,
        height: 'tall',
        category: 'All',
      };
      setCard(dbCard);
      buildSimilar(dbCard, [...outfitCards, ...trendingCards]);
    }
  };

  const buildSimilar = (current: OutfitCardType, allCards: OutfitCardType[]) => {
    // Same category first, then others, excluding current
    const sameCategory = allCards.filter(
      (c) => c.id !== current.id && c.category === current.category
    );
    const others = allCards.filter(
      (c) => c.id !== current.id && c.category !== current.category
    );
    // Shuffle others for variety
    const shuffled = others.sort(() => Math.random() - 0.5);
    const combined = [...sameCategory, ...shuffled].slice(0, 12).map((c, i) => ({
      ...c,
      height: heights[i % 3],
    }));
    setSimilarCards(combined);
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="pb-20 bg-background min-h-screen">
      {/* ─── Back button (floating) ───────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-background transition"
      >
        <ArrowLeft size={20} />
      </button>

      {/* ─── Main image ───────────────────────────────────────── */}
      <div className="w-full max-w-lg mx-auto">
        <div className="w-full overflow-hidden rounded-b-3xl">
          <img
            src={card.imageUrl}
            alt={`Outfit by ${card.username}`}
            className="w-full object-cover max-h-[70vh]"
          />
        </div>

        {/* ─── Actions bar ──────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiked(!liked)}
              className="p-2 rounded-full hover:bg-secondary transition"
            >
              <Heart
                size={24}
                className={liked ? 'fill-primary text-primary' : 'text-foreground'}
              />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition">
              <Share2 size={22} className="text-foreground" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-secondary transition">
                  <MoreHorizontal size={22} className="text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md">
                <DropdownMenuItem onClick={() => toast.success('Image downloaded')}>
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success('Followed ' + card.username)}>
                  Follow Creator
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success('Post reported')} className="text-destructive focus:text-destructive">
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <button
            onClick={() => setShowSave(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition shadow-sm"
          >
            <Bookmark size={16} />
            Save
          </button>
        </div>

        {/* ─── User info ────────────────────────────────────────── */}
        <button 
          onClick={() => navigate(`/user/${card.username}`)}
          className="w-full px-4 pb-4 flex items-center gap-3 text-left hover:opacity-80 transition cursor-pointer"
        >
          <img
            src={card.avatarUrl}
            alt={card.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div>
            <p className="text-sm font-body font-semibold text-foreground">{card.username}</p>
            <p className="text-xs font-body text-muted-foreground">{card.category}</p>
          </div>
        </button>

        {/* ─── Divider ──────────────────────────────────────────── */}
        <div className="mx-4 border-t border-border" />

        {/* ─── More like this ───────────────────────────────────── */}
        <div className="pt-4">
          <h3 className="text-base font-display font-bold text-foreground px-4 mb-3">
            More like this
          </h3>
          <MasonryGrid cards={similarCards} />
        </div>
      </div>

      {/* ─── Save modal ─────────────────────────────────────────── */}
      <SaveToBoardModal
        open={showSave}
        imageUrl={card.imageUrl}
        title={`Outfit by ${card.username}`}
        onClose={() => setShowSave(false)}
      />
    </div>
  );
};

export default OutfitDetailPage;
