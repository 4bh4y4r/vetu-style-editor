import { CalendarDays, Shirt, LayoutGrid } from 'lucide-react';

type TabKey = 'outfits' | 'closet' | 'boards';

const TABS: { key: TabKey; label: string; icon: typeof CalendarDays }[] = [
  { key: 'outfits', label: 'Calendar', icon: CalendarDays },
  { key: 'closet', label: 'Closet', icon: Shirt },
  { key: 'boards', label: 'Boards', icon: LayoutGrid },
];

interface ProfileTabsProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

const ProfileTabs = ({ activeTab, onChangeTab }: ProfileTabsProps) => (
  <div className="flex border-b border-border mx-4 mb-4">
    {TABS.map((t) => {
      const Icon = t.icon;
      return (
        <button
          key={t.key}
          onClick={() => onChangeTab(t.key)}
          className={`flex-1 flex items-center justify-center gap-1.5 pb-2.5 text-sm font-body font-medium transition-colors ${
            activeTab === t.key
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          <Icon size={16} />
          {t.label}
        </button>
      );
    })}
  </div>
);

export default ProfileTabs;
export type { TabKey };
