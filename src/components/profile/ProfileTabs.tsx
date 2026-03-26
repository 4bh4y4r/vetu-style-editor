import { Grid, LayoutGrid, Shirt } from 'lucide-react';

type TabKey = 'created' | 'saved' | 'closet';

const TABS = [
  { key: 'created', label: 'Created', icon: Grid },
  { key: 'saved', label: 'Boards', icon: LayoutGrid },
  { key: 'closet', label: 'Closet', icon: Shirt },
] as const;

interface ProfileTabsProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

const ProfileTabs = ({ activeTab, onChangeTab }: ProfileTabsProps) => (
  <div className="flex justify-center gap-10 border-b border-border/40 mx-4 mb-6 pt-2">
    {TABS.map((t) => {
      const Icon = t.icon;
      return (
        <button
          key={t.key}
          onClick={() => onChangeTab(t.key)}
          className={`pb-3 flex items-center gap-1.5 text-[15px] font-semibold transition-colors relative ${
            activeTab === t.key
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          <Icon size={16} />
          {t.label}
          {activeTab === t.key && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
          )}
        </button>
      );
    })}
  </div>
);

export default ProfileTabs;
export type { TabKey };
