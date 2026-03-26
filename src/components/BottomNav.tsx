import { Home, Search, Sparkles, User, Plus, Pin, Shirt, LayoutDashboard, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Drawer } from 'vaul';
import { useState } from 'react';
import UploadOutfitModal from './UploadOutfitModal';
import UploadWardrobeModal from './UploadWardrobeModal';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/ai-stylist', icon: Sparkles, label: 'Stylist' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showUploadOutfit, setShowUploadOutfit] = useState(false);
  const [showUploadWardrobe, setShowUploadWardrobe] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 pb-safe">
          {tabs.slice(0, 2).map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
                aria-label={label}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
                <span className="text-[10px] font-body font-medium">{label}</span>
              </button>
            );
          })}
          
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Create"
          >
            <Plus size={26} strokeWidth={2} />
          </button>

          {tabs.slice(2).map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
                aria-label={label}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
                <span className="text-[10px] font-body font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
          <Drawer.Content className="bg-card flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[70] outline-none mt-auto h-auto max-h-[90vh] mx-auto w-full max-w-lg">
            <div className="p-4 pb-10">
              <div className="mx-auto w-10 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 mb-4" />
              <div className="flex items-center justify-between px-2 mb-6">
                 <div></div>
                 <h3 className="font-body font-bold text-base">Start creating now</h3>
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
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="w-[72px] h-[72px] rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition">
                    <Pin size={24} className="text-foreground" />
                  </div>
                  <span className="text-xs font-semibold">Pin</span>
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setShowUploadWardrobe(true);
                  }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="w-[72px] h-[72px] rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition">
                    <Shirt size={24} className="text-foreground" />
                  </div>
                  <span className="text-xs font-semibold">Closet</span>
                </button>
                <button className="flex flex-col items-center gap-2 flex-1 opacity-50 cursor-not-allowed">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-secondary flex items-center justify-center">
                    <LayoutDashboard size={24} className="text-foreground" />
                  </div>
                  <span className="text-xs font-semibold">Board</span>
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
