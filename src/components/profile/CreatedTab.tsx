import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { OutfitPost } from '@/types';

interface CreatedTabProps {
  onAddOutfit: () => void;
}

const CreatedTab = ({ onAddOutfit }: CreatedTabProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState<OutfitPost[]>([]);

  useEffect(() => {
    fetchOutfits();
  }, [user]);

  const fetchOutfits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('outfit_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setOutfits(data as OutfitPost[]);
  };

  const handleToggleVisibility = async (outfit: OutfitPost) => {
    const { error } = await supabase
      .from('outfit_posts')
      .update({ is_public: !outfit.is_public })
      .eq('id', outfit.id);
    if (!error) {
      toast.success(outfit.is_public ? 'Pin set to private' : 'Pin shared publicly!');
      fetchOutfits();
    }
  };

  const handleDelete = async (outfitId: string) => {
    const { error } = await supabase.from('outfit_posts').delete().eq('id', outfitId);
    if (!error) {
      toast.success('Pin removed');
      fetchOutfits();
    }
  };

  return (
    <div className="px-4 pb-8">
      {/* Removed old Add Pin button */}

      {outfits.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-foreground mb-2">Nothing to show...yet!</p>
          <p className="text-xs text-muted-foreground mb-6">Pins you create will live here.</p>
          <button 
            onClick={onAddOutfit}
            className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition shadow-sm"
          >
            Create Pin
          </button>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="relative rounded-2xl overflow-hidden group break-inside-avoid bg-secondary/30">
              <img 
                src={outfit.image_url} 
                alt="Created Post" 
                className="w-full h-auto cursor-pointer" 
                onClick={() => navigate(`/outfit/${outfit.id}`)}
              />
              
              <div className="absolute top-2 left-2 pointer-events-none">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold backdrop-blur-md ${outfit.is_public
                    ? 'bg-primary/20 text-white border border-primary/30'
                    : 'bg-black/30 text-white/70 border border-white/10'
                  }`}>
                  {outfit.is_public ? <Eye size={9} /> : <EyeOff size={9} />}
                  {outfit.is_public ? 'Public' : 'Only you'}
                </span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between pointer-events-none">
                <div className="text-white">
                   <p className="text-xs font-semibold drop-shadow-md">
                     {format(new Date(outfit.outfit_date), 'MMM d')}
                   </p>
                </div>
                <div className="flex gap-2 text-white pointer-events-auto">
                  <button onClick={() => handleToggleVisibility(outfit)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition">
                    {outfit.is_public ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => handleDelete(outfit.id)} className="p-1.5 rounded-full bg-destructive/80 hover:bg-destructive backdrop-blur-md transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatedTab;
