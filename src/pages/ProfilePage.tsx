import { useState, useEffect } from 'react';
import { useProfileData } from '@/hooks/useProfileData';
import { useStreak } from '@/hooks/useStreak';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { type TabKey } from '@/components/profile/ProfileTabs';
import StreakWidget from '@/components/profile/StreakWidget';
import ClosetTab from '@/components/profile/ClosetTab';
import BoardsTab from '@/components/profile/BoardsTab';
import BoardDetail from '@/components/BoardDetail';
import CreatedTab from '@/components/profile/CreatedTab';
import UploadOutfitModal from '@/components/UploadOutfitModal';
import EditProfileModal from '@/components/profile/EditProfileModal';
import SettingsModal from '@/components/profile/SettingsModal';
import FollowListModal from '@/components/profile/FollowListModal';
import type { Board } from '@/types';

const ProfilePage = () => {
  const {
    user,
    profile,
    displayName,
    wardrobeItems,
    boards,
    followersCount,
    followingCount,
    fetchWardrobe,
    fetchBoards,
    createBoard,
    deleteBoard,
    updateProfile,
  } = useProfileData();

  const { streak, recordActivity } = useStreak();

  const [tab, setTab] = useState<TabKey>('created');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showOutfitUpload, setShowOutfitUpload] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  // New Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [followListType, setFollowListType] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    const handleOutfitUploaded = () => {
      setCalendarKey((k) => k + 1);
      recordActivity();
    };
    
    const handleWardrobeUploaded = () => {
      fetchWardrobe();
    };
    
    window.addEventListener('outfit_uploaded', handleOutfitUploaded);
    window.addEventListener('wardrobe_uploaded', handleWardrobeUploaded);
    
    return () => {
      window.removeEventListener('outfit_uploaded', handleOutfitUploaded);
      window.removeEventListener('wardrobe_uploaded', handleWardrobeUploaded);
    };
  }, [recordActivity, fetchWardrobe]);

  // ─── Board detail view ──────────────────────────────────────
  if (selectedBoard) {
    return (
      <div className="pb-20">
        <BoardDetail
          boardId={selectedBoard.id}
          boardName={selectedBoard.name}
          onBack={() => {
            setSelectedBoard(null);
            fetchBoards();
          }}
          onDeleteBoard={() => {
            deleteBoard(selectedBoard.id);
            setSelectedBoard(null);
          }}
        />
      </div>
    );
  }

  // ─── Main profile view ─────────────────────────────────────
  return (
    <div className="pb-20 lg:pb-12 max-w-screen-xl lg:mx-0">
      <div className="lg:flex lg:gap-12 px-0 md:px-4 lg:px-12 pt-0 lg:pt-6">
        {/* Left column: profile info + streak */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <ProfileHeader
            profile={profile}
            displayName={displayName}
            wardrobeCount={wardrobeItems.length}
            followersCount={followersCount}
            followingCount={followingCount}
            onAddContent={() => setShowOutfitUpload(true)}
            onOpenSettings={() => setShowSettings(true)}
            onEditProfile={() => setShowEditProfile(true)}
            onOpenFollows={(type) => setFollowListType(type)}
          />
          <StreakWidget
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
            recentDays={streak.recentDays}
            todayDone={streak.todayDone}
          />
        </div>

        {/* Right column: tabs + content */}
        <div className="lg:flex-1 lg:min-w-0">
          <ProfileTabs activeTab={tab} onChangeTab={setTab} />

          {tab === 'created' && (
            <>
              <CreatedTab
                key={calendarKey}
                onAddOutfit={() => setShowOutfitUpload(true)}
              />
              <UploadOutfitModal
                open={showOutfitUpload}
                date={new Date()}
                onClose={() => setShowOutfitUpload(false)}
                onUploaded={() => {
                  setShowOutfitUpload(false);
                  setCalendarKey((k) => k + 1);
                  recordActivity();
                }}
              />
            </>
          )}

          {tab === 'closet' && (
            <ClosetTab wardrobeItems={wardrobeItems} onRefresh={fetchWardrobe} />
          )}

          {tab === 'saved' && (
            <BoardsTab
              boards={boards}
              onSelectBoard={setSelectedBoard}
              onCreateBoard={createBoard}
            />
          )}
        </div>
      </div>

      {/* Profile Modals */}
      <EditProfileModal
        open={showEditProfile}
        profile={profile}
        onClose={() => setShowEditProfile(false)}
        onUpdate={updateProfile}
      />
      <SettingsModal
        open={showSettings}
        profile={profile}
        onClose={() => setShowSettings(false)}
        onUpdate={updateProfile}
      />
      <FollowListModal
        open={!!followListType}
        type={followListType}
        userId={user?.id || ''}
        onClose={() => setFollowListType(null)}
      />
    </div>
  );
};

export default ProfilePage;
