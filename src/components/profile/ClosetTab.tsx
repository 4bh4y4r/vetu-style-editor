import { Search, Shirt, Plus } from 'lucide-react';
import { useState } from 'react';
import type { WardrobeItem } from '@/types';
import UploadWardrobeModal from '@/components/UploadWardrobeModal';

interface ClosetTabProps {
  wardrobeItems: WardrobeItem[];
  onRefresh: () => void;
}

const ClosetTab = ({ wardrobeItems, onRefresh }: ClosetTabProps) => {
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...new Set(wardrobeItems.map((i) => i.category))];

  const filtered = wardrobeItems.filter((item) => {
    const matchCat = filter === 'All' || item.category === filter;
    const matchSearch =
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Search + filter */}
      <div className="flex items-center gap-2 px-4 mb-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search closet..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-gold transition"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body outline-none border-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden bg-card animate-fade-in">
            <div className="aspect-square overflow-hidden">
              <img
                src={item.image_url}
                alt={item.category}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="px-2.5 py-2">
              <span className="text-xs font-body font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {item.category}
              </span>
              {item.name && (
                <p className="text-xs font-body text-foreground mt-1 truncate">{item.name}</p>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <Shirt size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-body font-medium text-foreground">Empty closet</p>
            <p className="text-xs font-body text-muted-foreground mt-1">
              There are no items in your closet
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-40 hover:scale-105 transition-transform"
        aria-label="Add wardrobe item"
      >
        <Plus size={24} />
      </button>

      <UploadWardrobeModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploaded={() => {
          onRefresh();
          setShowUpload(false);
        }}
      />
    </>
  );
};

export default ClosetTab;
