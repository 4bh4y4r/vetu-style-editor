import { useState, useEffect } from 'react';
import { LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { outfitCards } from '@/data/fashion';
import MasonryGrid from '@/components/MasonryGrid';
import UploadWardrobeModal from '@/components/UploadWardrobeModal';

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

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<'outfits' | 'wardrobe'>('outfits');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);

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

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-6 pb-4 px-4">
        <div className="relative">
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=3B0918&color=FAF8F4`}
            alt="Profile avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-primary"
          />
        </div>
        <h1 className="mt-3 text-lg font-display font-bold text-foreground">@{displayName}</h1>
        <p className="text-xs font-body text-muted-foreground mt-0.5">
          {profile?.bio || 'Fashion lover ✨'}
        </p>

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

        <button
          onClick={signOut}
          className="mt-3 flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition"
        >
          <LogOut size={14} /> Sign out
        </button>
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
        <>
          <div className="grid grid-cols-2 gap-3 px-4">
            {wardrobeItems.map(item => (
              <div key={item.id} className="rounded-lg overflow-hidden bg-card animate-fade-in">
                <div className="aspect-square overflow-hidden">
                  <img src={item.image_url} alt={item.category} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="px-2.5 py-2">
                  <span className="text-xs font-body font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
            {wardrobeItems.length === 0 && (
              <div className="col-span-2 py-12 text-center text-sm text-muted-foreground font-body">
                No items yet. Tap + to add your first piece.
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
      )}
    </div>
  );
};

export default ProfilePage;
