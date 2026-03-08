import { Search } from 'lucide-react';
import { trendingCards, trendingTags } from '@/data/fashion';
import MasonryGrid from '@/components/MasonryGrid';

const SearchPage = () => {
  return (
    <div className="pb-20">
      {/* Search Bar */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5">
          <Search size={18} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search styles, users, trends..."
            className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Trending Tags */}
      <div className="px-4 pb-2">
        <h2 className="text-sm font-display font-semibold text-foreground mb-2.5">Trending Now</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
          {trendingTags.map(tag => (
            <span
              key={tag}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-secondary text-xs font-body font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Trending Grid */}
      <MasonryGrid cards={trendingCards} />
    </div>
  );
};

export default SearchPage;
