import { User, Plus, Sparkles, Pin, Shirt, LayoutDashboard, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Drawer } from 'vaul';
import { useState } from 'react';
import UploadOutfitModal from './UploadOutfitModal';
import UploadWardrobeModal from './UploadWardrobeModal';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showUploadOutfit, setShowUploadOutfit] = useState(false);
  const [showUploadWardrobe, setShowUploadWardrobe] = useState(false);

  const isProfileActive = location.pathname === '/profile' || location.pathname === '/';
  const isStylistActive = location.pathname === '/ai-stylist';

  return (
    <>
      {/* ─── 3-Section Navigation Bar (Profile | Add | Stylist) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/80 shadow-lg">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-6 pb-safe">
          {/* 1. Profile (Left) */}
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-5 rounded-2xl transition-all ${
              isProfileActive 
                ? 'text-primary font-bold scale-105' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Profile"
          >
            <User size={22} strokeWidth={isProfileActive ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium tracking-wide">Profile</span>
          </button>

          {/* 2. Add (Middle) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 active:scale-95 transition-all duration-200 -mt-3 ring-4 ring-background"
            aria-label="Add"
            title="Add Item or Outfit"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>

          {/* 3. Stylist (Right) */}
          <button
            onClick={() => navigate('/ai-stylist')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-5 rounded-2xl transition-all ${
              isStylistActive 
                ? 'text-primary font-bold scale-105' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Stylist"
          >
            <Sparkles size={22} strokeWidth={isStylistActive ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium tracking-wide">Stylist</span>
          </button>
        </div>
      </nav>

      {/* ─── Add Drawer ─── */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
          <Drawer.Content className="bg-card flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[70] outline-none mt-auto h-auto max-h-[90vh] mx-auto w-full max-w-lg">
            <div className="p-5 pb-10">
              <div className="mx-auto w-10 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 mb-4" />
              <div className="flex items-center justify-between px-2 mb-6">
                <h3 className="font-body font-bold text-base">Create & Add</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="flex justify-center gap-6 px-4">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setShowUploadOutfit(true);
                  }}
                  className="flex flex-col items-center gap-2 flex-1 group"
                >
                  <div className="w-[72px] h-[72px] rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Pin size={24} />
                  </div>
                  <span className="text-xs font-semibold">Upload Outfit</span>
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setShowUploadWardrobe(true);
                  }}
                  className="flex flex-col items-center gap-2 flex-1 group"
                >
                  <div className="w-[72px] h-[72px] rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Shirt size={24} />
                  </div>
                  <span className="text-xs font-semibold">Closet Item</span>
                </button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <UploadOutfitModal 
        open={showUploadOutfit} 
        date={new Date()} 
        onClose={() => setShowUploadOutfit(false)} 
        onUploaded={() => {
          setShowUploadOutfit(false);
          window.dispatchEvent(new Event('outfit_uploaded'));
        }} 
      />

      <UploadWardrobeModal 
        open={showUploadWardrobe} 
        onClose={() => setShowUploadWardrobe(false)} 
        onUploaded={() => {
          setShowUploadWardrobe(false);
          window.dispatchEvent(new Event('wardrobe_uploaded'));
        }} 
      />
    </>
  );
};

export default BottomNav;


