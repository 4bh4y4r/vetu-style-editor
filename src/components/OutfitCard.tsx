import { useState } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { OutfitCard as OutfitCardType } from '@/data/fashion';
import SaveToBoardModal from './SaveToBoardModal';

const heightMap = {
  tall: 'h-72',
  medium: 'h-56',
  short: 'h-44',
};

interface OutfitCardProps {
  card: OutfitCardType;
  index?: number;
}

const OutfitCard = ({ card, index = 0 }: OutfitCardProps) => {
  const [liked, setLiked] = useState(card.liked);
  const [showSave, setShowSave] = useState(false);

  return (
    <>
      <div
        className="masonry-item animate-fade-in rounded-xl overflow-hidden bg-card shadow-sm border border-border/50"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className={`${heightMap[card.height]} w-full overflow-hidden`}>
          <img
            src={card.imageUrl}
            alt={`Outfit by ${card.username}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex items-center justify-between px-2.5 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={card.avatarUrl}
              alt={card.username}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-border"
            />
            <span className="text-xs font-body text-muted-foreground truncate">{card.username}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSave(true)}
              className="flex-shrink-0 p-1"
              aria-label="Save to board"
            >
              <Bookmark size={16} className="text-muted-foreground hover:text-primary transition" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="flex-shrink-0 p-1"
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Heart
                size={16}
                className={liked ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary transition'}
              />
            </button>
          </div>
        </div>
      </div>

      <SaveToBoardModal
        open={showSave}
        imageUrl={card.imageUrl}
        title={`Outfit by ${card.username}`}
        onClose={() => setShowSave(false)}
      />
    </>
  );
};

export default OutfitCard;
