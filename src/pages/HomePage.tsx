import { useState } from 'react';
import { Bell } from 'lucide-react';
import { outfitCards, categories } from '@/data/fashion';
import MasonryGrid from '@/components/MasonryGrid';

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? outfitCards
    : outfitCards.filter(c => c.category === activeCategory);

  return (
    <div className="pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h1 className="text-2xl font-display font-bold tracking-tight text-primary">DRIP</h1>
        <button className="p-2 text-foreground" aria-label="Notifications">
          <Bell size={22} strokeWidth={1.6} />
        </button>
      </div>

      {/* Category Pills */}
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

      {/* Feed */}
      <MasonryGrid cards={filtered} />
    </div>
  );
};

export default HomePage;
