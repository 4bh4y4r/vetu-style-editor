import { Plus, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types';

interface ProfileHeaderProps {
  profile: Profile | null;
  displayName: string;
  wardrobeCount: number;
  followersCount: number;
  followingCount: number;
  onAddContent: () => void;
}

const ProfileHeader = ({
  profile,
  displayName,
  wardrobeCount,
  followersCount,
  followingCount,
  onAddContent,
}: ProfileHeaderProps) => {
  const { signOut } = useAuth();

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 mb-4">
        <h1 className="text-lg font-display font-bold text-foreground">@{displayName}</h1>
        <button
          onClick={signOut}
          className="text-muted-foreground hover:text-foreground transition"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Avatar + stats */}
      <div className="flex items-center gap-5 px-4 mb-2">
        <div className="relative flex-shrink-0">
          <img
            src={
              profile?.avatar_url ||
              `https://ui-avatars.com/api/?name=${displayName}&background=F5E6F0&color=D4648A`
            }
            alt="Profile avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/30 shadow-sm"
          />
          <button
            onClick={onAddContent}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background text-xs font-bold shadow-sm"
            aria-label="Add content"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex flex-1 justify-around">
          <Stat count={wardrobeCount} label="items" />
          <Stat count={128} label="followers" />
          <Stat count={96} label="following" />
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 mb-4">
        <p className="text-sm font-body font-semibold text-foreground">
          {profile?.display_name || displayName}
        </p>
        <p className="text-xs font-body text-muted-foreground mt-0.5">
          {profile?.bio || 'Fashion lover ✨'}
        </p>
        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body font-semibold">
          ★ Style Explorer
        </span>
      </div>
    </>
  );
};

// ─── Small helper ────────────────────────────────────────────────
const Stat = ({ count, label }: { count: number; label: string }) => (
  <div className="text-center">
    <p className="text-lg font-display font-bold text-foreground">{count}</p>
    <p className="text-xs font-body text-muted-foreground">{label}</p>
  </div>
);

export default ProfileHeader;
