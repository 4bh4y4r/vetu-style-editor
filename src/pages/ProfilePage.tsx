import { useState } from 'react';
import { useProfileData } from '@/hooks/useProfileData';
import { useStreak } from '@/hooks/useStreak';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { type TabKey } from '@/components/profile/ProfileTabs';
import StreakWidget from '@/components/profile/StreakWidget';
import ClosetTab from '@/components/profile/ClosetTab';
import BoardsTab from '@/components/profile/BoardsTab';
import BoardDetail from '@/components/BoardDetail';
import OutfitCalendar from '@/components/OutfitCalendar';
import UploadOutfitModal from '@/components/UploadOutfitModal';
import type { Board } from '@/types';

const ProfilePage = () => {
  const {
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
  } = useProfileData();

  const { streak, recordActivity } = useStreak();

  const [tab, setTab] = useState<TabKey>('outfits');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [outfitDate, setOutfitDate] = useState<Date | null>(null);
  const [showOutfitUpload, setShowOutfitUpload] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

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
    <div className="pb-20">
      <ProfileHeader
        profile={profile}
        displayName={displayName}
        wardrobeCount={wardrobeItems.length}
        followersCount={followersCount}
        followingCount={followingCount}
        onAddContent={() => setShowUpload(true)}
      />

      {/* Streak widget */}
      <StreakWidget
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        recentDays={streak.recentDays}
        todayDone={streak.todayDone}
      />

      <ProfileTabs activeTab={tab} onChangeTab={setTab} />

      {/* Tab content */}
      {tab === 'outfits' && (
        <>
          <OutfitCalendar
            key={calendarKey}
            onAddOutfit={(date) => {
              setOutfitDate(date);
              setShowOutfitUpload(true);
            }}
          />
          <UploadOutfitModal
            open={showOutfitUpload}
            date={outfitDate || new Date()}
            onClose={() => setShowOutfitUpload(false)}
            onUploaded={() => {
              setShowOutfitUpload(false);
              setCalendarKey((k) => k + 1);
              recordActivity(); // Record streak!
            }}
          />
        </>
      )}

      {tab === 'closet' && (
        <ClosetTab wardrobeItems={wardrobeItems} onRefresh={fetchWardrobe} />
      )}

      {tab === 'boards' && (
        <BoardsTab
          boards={boards}
          onSelectBoard={setSelectedBoard}
          onCreateBoard={createBoard}
        />
      )}
    </div>
  );
};

export default ProfilePage;
