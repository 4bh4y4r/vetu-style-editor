import { OutfitCard as OutfitCardType } from '@/data/fashion';
import OutfitCard from './OutfitCard';

interface MasonryGridProps {
  cards: OutfitCardType[];
}

const MasonryGrid = ({ cards }: MasonryGridProps) => {
  return (
    <div className="masonry-grid px-4">
      {cards.map((card, i) => (
        <OutfitCard key={card.id} card={card} index={i} />
      ))}
    </div>
  );
};

export default MasonryGrid;
