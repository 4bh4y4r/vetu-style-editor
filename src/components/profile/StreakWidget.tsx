import { Flame } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  recentDays: boolean[];
  todayDone: boolean;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const StreakWidget = ({ currentStreak, longestStreak, recentDays, todayDone }: StreakWidgetProps) => {
  const today = new Date();

  return (
    <div className="mx-4 md:mx-0 mb-4 rounded-2xl border border-border bg-secondary/40 p-4">
      {/* Top row: flame + streak count */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStreak > 0 ? 'bg-orange-500/15' : 'bg-muted'
            }`}
          >
            <Flame
              size={22}
              className={currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}
              fill={currentStreak > 0 ? 'currentColor' : 'none'}
            />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground leading-none">
              {currentStreak}
            </p>
            <p className="text-[10px] font-body text-muted-foreground mt-0.5">
              day streak
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-body font-semibold text-muted-foreground">Best</p>
          <p className="text-sm font-display font-bold text-foreground">{longestStreak} days</p>
        </div>
      </div>

      {/* Weekly dots */}
      <div className="flex items-center justify-between gap-1">
        {recentDays.map((active, i) => {
          const dayDate = subDays(today, 6 - i);
          const isToday = i === 6;
          const dayLabel = DAY_LABELS[dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1];

          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[9px] font-body text-muted-foreground">{dayLabel}</span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-body font-bold transition-all ${
                  active
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : isToday
                    ? 'border-2 border-dashed border-orange-500/40 text-muted-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {active ? '🔥' : format(dayDate, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA if today not done */}
      {!todayDone && (
        <div className="mt-3 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-xs font-body font-medium text-orange-600 dark:text-orange-400 text-center">
            📸 Upload today's outfit to keep your streak alive!
          </p>
        </div>
      )}
    </div>
  );
};

export default StreakWidget;
