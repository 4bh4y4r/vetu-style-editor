import { useState, useEffect } from 'react';
import { LogOut, Plus, Image, Shirt, Sparkles, Search, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { outfitCards } from '@/data/fashion';
import MasonryGrid from '@/components/MasonryGrid';
import UploadWardrobeModal from '@/components/UploadWardrobeModal';
import AIStylistChat from '@/components/AIStylistChat';

interface WardrobeItem {
  id: string;
  image_url: string;
  category: string;
  name: string | null;
}

interface Profile {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

const TABS = [
  { key: 'outfits' as const, label: 'Outfits', icon: Image },
  { key: 'closet' as const, label: 'Closet', icon: Shirt },
  { key: 'ai' as const, label: 'AI Stylist', icon: Sparkles },
];

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<'outfits' | 'closet' | 'ai'>('outfits');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [closetFilter, setClosetFilter] = useState('All');
  const [closetSearch, setClosetSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
    fetchWardrobe();
  }, [user]);

  const fetchWardrobe = async () => {
    if (!user) return;
    const { data } = await supabase.from('wardrobe_items')
      .select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setWardrobeItems(data);
  };

  const displayName = profile?.username || user?.email?.split('@')[0] || 'user';

  const categories = ['All', ...new Set(wardrobeItems.map(i => i.category))];
  const filteredCloset = wardrobeItems.filter(item => {
    const matchCat = closetFilter === 'All' || item.category === closetFilter;
    const matchSearch = !closetSearch || item.name?.toLowerCase().includes(closetSearch.toLowerCase()) || item.category.toLowerCase().includes(closetSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="flex items-start justify-between px-4 pt-5">
        <div>
          <h1 className="text-lg font-display font-bold text-foreground">@{displayName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 mt-3 mb-4">
        <img
          src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=3B0918&color=FAF8F4`}
          alt="Profile avatar"
          className="w-14 h-14 rounded-full object-cover border-2 border-primary"
        />
        <div>
          <p className="text-sm font-body font-medium text-foreground">{profile?.display_name || displayName}</p>
          <p className="text-xs font-body text-muted-foreground">{profile?.bio || 'Fashion lover ✨'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mx-4 mb-4">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 pb-2.5 text-sm font-body font-medium transition-colors ${
                tab === t.key
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'outfits' ? (
        <>
          <MasonryGrid cards={outfitCards.slice(0, 6)} />
          <button
            onClick={() => setShowUpload(true)}
            className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-40 hover:scale-105 transition-transform"
            aria-label="Add outfit"
          >
            <Plus size={24} />
          </button>
        </>
      ) : tab === 'closet' ? (
        <>
          {/* Search & Filter */}
          <div className="flex items-center gap-2 px-4 mb-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={closetSearch}
                onChange={e => setClosetSearch(e.target.value)}
                placeholder="Search closet..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
            <select
              value={closetFilter}
              onChange={e => setClosetFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body outline-none border-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4">
            {filteredCloset.map(item => (
              <div key={item.id} className="rounded-lg overflow-hidden bg-card animate-fade-in">
                <div className="aspect-square overflow-hidden">
                  <img src={item.image_url} alt={item.category} className="w-full h-full object-cover" loading="lazy" />
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
            {filteredCloset.length === 0 && (
              <div className="col-span-2 py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Shirt size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-body font-medium text-foreground">Empty closet</p>
                <p className="text-xs font-body text-muted-foreground mt-1">There are no items in your closet</p>
              </div>
            )}
          </div>

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
            onUploaded={fetchWardrobe}
          />
        </>
      ) : (
        <AIStylistChat wardrobeItems={wardrobeItems} />
      )}
    </div>
  );
};

export default ProfilePage;
