import { useState } from 'react';
import { outfitCards, wardrobeItems } from '@/data/fashion';
import MasonryGrid from '@/components/MasonryGrid';

const ProfilePage = () => {
  const [tab, setTab] = useState<'outfits' | 'wardrobe'>('outfits');

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-6 pb-4 px-4">
        <img
          src="https://i.pravatar.cc/96?img=32"
          alt="Profile avatar"
          className="w-20 h-20 rounded-full object-cover border-2 border-primary"
        />
        <h1 className="mt-3 text-lg font-display font-bold text-foreground">@username</h1>
        <p className="text-xs font-body text-muted-foreground mt-0.5">Fashion lover. Minimal aesthetics. ✨</p>

        <div className="flex items-center gap-8 mt-4">
          {[
            { label: 'Outfits', value: '47' },
            { label: 'Followers', value: '1.2K' },
            { label: 'Following', value: '318' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-base font-display font-bold text-foreground">{s.value}</span>
              <span className="text-[10px] font-body text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mx-4 mb-4">
        {(['outfits', 'wardrobe'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 pb-2.5 text-sm font-body font-medium capitalize transition-colors ${
              tab === t
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            {t === 'outfits' ? 'My Outfits' : 'Wardrobe'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'outfits' ? (
        <MasonryGrid cards={outfitCards.slice(0, 6)} />
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4">
          {wardrobeItems.map(item => (
            <div key={item.id} className="rounded-lg overflow-hidden bg-card animate-fade-in">
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.tag}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-2.5 py-2">
                <span className="text-xs font-body font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
