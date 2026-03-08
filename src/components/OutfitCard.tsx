import { useState } from 'react';
import { Heart } from 'lucide-react';
import { OutfitCard as OutfitCardType } from '@/data/fashion';

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

  return (
    <div
      className="masonry-item animate-fade-in rounded-lg overflow-hidden bg-card"
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
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
          <span className="text-xs font-body text-ink-light truncate">{card.username}</span>
        </div>
        <button
          onClick={() => setLiked(!liked)}
          className="flex-shrink-0 p-1"
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={16}
            className={liked ? 'fill-primary text-primary' : 'text-ink-light'}
          />
        </button>
      </div>
    </div>
  );
};

export default OutfitCard;
