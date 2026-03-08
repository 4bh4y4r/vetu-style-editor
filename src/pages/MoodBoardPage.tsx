import { Plus } from 'lucide-react';
import { outfitCards } from '@/data/fashion';
import MasonryGrid from '@/components/MasonryGrid';

const savedCards = outfitCards.filter(c => c.liked);

const MoodBoardPage = () => {
  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="px-4 pt-6 pb-5">
        <h1 className="text-3xl font-display font-bold text-foreground">My Mood Board</h1>
        <p className="text-sm font-body text-muted-foreground mt-1">Your saved inspirations</p>
      </div>

      {savedCards.length > 0 ? (
        <MasonryGrid cards={savedCards} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-muted-foreground font-body">No saved outfits yet.</p>
          <p className="text-xs text-muted-foreground font-body mt-1">Heart outfits to see them here.</p>
        </div>
      )}

      {/* FAB */}
      <button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-40 hover:scale-105 transition-transform"
        aria-label="Add new item"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default MoodBoardPage;
