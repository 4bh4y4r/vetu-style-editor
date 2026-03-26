import { Plus, Settings, Edit3 } from 'lucide-react';
import type { Profile } from '@/types';

interface ProfileHeaderProps {
  profile: Profile | null;
  displayName: string;
  wardrobeCount: number;
  followersCount: number;
  followingCount: number;
  onAddContent: () => void;
  onOpenSettings: () => void;
  onEditProfile: () => void;
  onOpenFollows: (type: 'followers' | 'following') => void;
}

const ProfileHeader = ({
  profile,
  displayName,
  wardrobeCount,
  followersCount,
  followingCount,
  onAddContent,
  onOpenSettings,
  onEditProfile,
  onOpenFollows,
}: ProfileHeaderProps) => {

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 mb-4">
        <h1 className="text-lg font-display font-bold text-foreground">@{displayName}</h1>
        <button
          onClick={onOpenSettings}
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
            onClick={onEditProfile}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background text-xs font-bold shadow-sm"
            aria-label="Edit Profile Picture"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex flex-1 justify-around">
          <div className="text-center">
            <p className="text-lg font-display font-bold text-foreground">{wardrobeCount}</p>
            <p className="text-xs font-body text-muted-foreground">items</p>
          </div>
          <button onClick={() => onOpenFollows('followers')} className="text-center hover:opacity-75 transition">
            <p className="text-lg font-display font-bold text-foreground">{followersCount}</p>
            <p className="text-xs font-body text-muted-foreground">followers</p>
          </button>
          <button onClick={() => onOpenFollows('following')} className="text-center hover:opacity-75 transition">
            <p className="text-lg font-display font-bold text-foreground">{followingCount}</p>
            <p className="text-xs font-body text-muted-foreground">following</p>
          </button>
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 mb-4 relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-body font-semibold text-foreground">
              {profile?.display_name || displayName}
            </p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">
              {profile?.bio || 'Fashion lover ✨'}
            </p>
          </div>
          <button 
            onClick={onEditProfile}
            className="px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition flex items-center gap-1.5"
          >
            <Edit3 size={12} /> Edit
          </button>
        </div>
        <span className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body font-semibold">
          ★ Style Explorer
        </span>
      </div>
    </>
  );
};

export default ProfileHeader;
