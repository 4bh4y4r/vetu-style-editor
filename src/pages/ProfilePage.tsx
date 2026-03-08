import { useState, useEffect } from 'react';
import { Plus, Image, Shirt, LayoutGrid, Search, Settings, FolderPlus, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { outfitCards } from '@/data/fashion';
import MasonryGrid from '@/components/MasonryGrid';
import UploadWardrobeModal from '@/components/UploadWardrobeModal';
import CreateBoardModal from '@/components/CreateBoardModal';
import BoardDetail from '@/components/BoardDetail';
import OutfitCalendar from '@/components/OutfitCalendar';
import UploadOutfitModal from '@/components/UploadOutfitModal';

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

interface Board {
  id: string;
  name: string;
  pins: { image_url: string }[];
}

const TABS = [
  { key: 'outfits' as const, label: 'Calendar', icon: CalendarDays },
  { key: 'closet' as const, label: 'Closet', icon: Shirt },
  { key: 'boards' as const, label: 'Boards', icon: LayoutGrid },
];

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<'outfits' | 'closet' | 'boards'>('outfits');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [closetFilter, setClosetFilter] = useState('All');
  const [closetSearch, setClosetSearch] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
    fetchWardrobe();
    fetchBoards();
  }, [user]);

  const fetchWardrobe = async () => {
    if (!user) return;
    const { data } = await supabase.from('wardrobe_items')
      .select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setWardrobeItems(data);
  };

  const fetchBoards = async () => {
    if (!user) return;
    const { data: boardsData } = await supabase
      .from('boards')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!boardsData) return;

    const boardsWithPins: Board[] = await Promise.all(
      boardsData.map(async (b) => {
        const { data: pins } = await supabase
          .from('board_pins')
          .select('image_url')
          .eq('board_id', b.id)
          .order('created_at', { ascending: false })
          .limit(4);
        return { ...b, pins: pins || [] };
      })
    );
    setBoards(boardsWithPins);
  };

  const handleCreateBoard = async (name: string) => {
    if (!user) return;
    await supabase.from('boards').insert({ user_id: user.id, name });
    fetchBoards();
  };

  const handleDeleteBoard = async (boardId: string) => {
    await supabase.from('boards').delete().eq('id', boardId);
    setSelectedBoard(null);
    fetchBoards();
  };

  const displayName = profile?.username || user?.email?.split('@')[0] || 'user';

  const categories = ['All', ...new Set(wardrobeItems.map(i => i.category))];
  const filteredCloset = wardrobeItems.filter(item => {
    const matchCat = closetFilter === 'All' || item.category === closetFilter;
    const matchSearch = !closetSearch || item.name?.toLowerCase().includes(closetSearch.toLowerCase()) || item.category.toLowerCase().includes(closetSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  if (selectedBoard) {
    return (
      <div className="pb-20">
        <BoardDetail
          boardId={selectedBoard.id}
          boardName={selectedBoard.name}
          onBack={() => { setSelectedBoard(null); fetchBoards(); }}
          onDeleteBoard={() => handleDeleteBoard(selectedBoard.id)}
        />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Profile Header - Instagram Style */}
      <div className="flex items-center justify-between px-4 pt-5 mb-4">
        <h1 className="text-lg font-display font-bold text-foreground">@{displayName}</h1>
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

      <div className="flex items-center gap-5 px-4 mb-2">
        {/* Avatar with + button */}
        <div className="relative flex-shrink-0">
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=1A1A1A&color=D4A843`}
            alt="Profile avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-gold"
          />
          <button
            onClick={() => setShowUpload(true)}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-feroza text-white flex items-center justify-center border-2 border-background text-xs font-bold"
            aria-label="Add content"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-1 justify-around">
          <div className="text-center">
            <p className="text-lg font-display font-bold text-foreground">{outfitCards.slice(0, 6).length}</p>
            <p className="text-xs font-body text-muted-foreground">posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-display font-bold text-foreground">{wardrobeItems.length}</p>
            <p className="text-xs font-body text-muted-foreground">items</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-display font-bold text-foreground">{boards.length}</p>
            <p className="text-xs font-body text-muted-foreground">boards</p>
          </div>
        </div>
      </div>

      {/* Name, bio, badge */}
      <div className="px-4 mb-4">
        <p className="text-sm font-body font-semibold text-foreground">{profile?.display_name || displayName}</p>
        <p className="text-xs font-body text-muted-foreground mt-0.5">{profile?.bio || 'Fashion lover ✨'}</p>
        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-marigold/15 text-marigold text-[10px] font-body font-semibold">
          ★ Style Explorer
        </span>
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
                  ? 'text-gold border-b-2 border-gold'
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
          <div className="flex items-center gap-2 px-4 mb-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={closetSearch}
                onChange={e => setClosetSearch(e.target.value)}
                placeholder="Search closet..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-gold transition"
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
        <div className="px-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search boards..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-gold transition"
              />
            </div>
            <button
              onClick={() => setShowCreateBoard(true)}
              className="p-2 rounded-lg bg-secondary text-gold hover:bg-muted transition"
            >
              <FolderPlus size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {boards.map(board => (
              <button
                key={board.id}
                onClick={() => setSelectedBoard(board)}
                className="rounded-xl overflow-hidden bg-card border border-border text-left hover:border-gold/40 transition"
              >
                <div className="grid grid-cols-2 gap-0.5 aspect-square">
                  {board.pins.slice(0, 4).map((pin, i) => (
                    <div key={i} className="overflow-hidden bg-secondary">
                      <img src={pin.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - board.pins.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-secondary" />
                  ))}
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-sm font-body font-semibold text-foreground truncate">{board.name}</p>
                  <p className="text-xs font-body text-muted-foreground">{board.pins.length} Pins</p>
                </div>
              </button>
            ))}
          </div>

          {boards.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <LayoutGrid size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-body font-medium text-foreground">No boards yet</p>
              <p className="text-xs font-body text-muted-foreground mt-1">Create a board to start pinning your interests</p>
            </div>
          )}

          <CreateBoardModal
            open={showCreateBoard}
            onClose={() => setShowCreateBoard(false)}
            onCreated={handleCreateBoard}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
