import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, isFuture } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OutfitPost {
  id: string;
  image_url: string;
  outfit_date: string;
  is_public: boolean;
  notes: string | null;
}

interface OutfitCalendarProps {
  onAddOutfit: (date: Date) => void;
}

const WEEKDAYS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

const OutfitCalendar = ({ onAddOutfit }: OutfitCalendarProps) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [outfits, setOutfits] = useState<OutfitPost[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    fetchOutfits();
  }, [user, currentMonth]);

  const fetchOutfits = async () => {
    if (!user) return;
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('outfit_posts')
      .select('*')
      .eq('user_id', user.id)
      .gte('outfit_date', start)
      .lte('outfit_date', end)
      .order('created_at', { ascending: false });
    if (data) setOutfits(data as OutfitPost[]);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOffset = (getDay(startOfMonth(currentMonth)) + 6) % 7;

  const getOutfitsForDay = (date: Date): OutfitPost[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return outfits.filter(o => o.outfit_date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    if (isFuture(date)) return;
    setSelectedDay(selectedDay && isSameDay(selectedDay, date) ? null : date);
  };

  const handleToggleVisibility = async (outfit: OutfitPost) => {
    const { error } = await supabase
      .from('outfit_posts')
      .update({ is_public: !outfit.is_public })
      .eq('id', outfit.id);
    if (!error) {
      toast.success(outfit.is_public ? 'Set to private' : 'Shared publicly!');
      fetchOutfits();
    }
  };

  const handleDelete = async (outfitId: string) => {
    const { error } = await supabase
      .from('outfit_posts')
      .delete()
      .eq('id', outfitId);
    if (!error) {
      toast.success('Outfit removed');
      fetchOutfits();
    }
  };

  const selectedDayOutfits = selectedDay ? getOutfitsForDay(selectedDay) : [];

  return (
    <div className="px-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-display font-bold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs font-body font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const dayOutfits = getOutfitsForDay(day);
          const hasOutfits = dayOutfits.length > 0;
          const today = isToday(day);
          const future = isFuture(day);
          const selected = selectedDay && isSameDay(day, selectedDay);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              disabled={future}
              className={`aspect-square rounded-lg overflow-hidden relative flex items-center justify-center text-xs font-body transition-all border-2
                ${selected ? 'border-gold' : 'border-transparent'}
                ${today && !hasOutfits ? 'ring-1 ring-gold/50' : ''}
                ${future ? 'opacity-30 cursor-not-allowed' : 'hover:border-gold/30'}
                ${hasOutfits ? '' : 'bg-secondary/50'}
              `}
            >
              {hasOutfits ? (
                <>
                  <img src={dayOutfits[0].image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/25" />
                  <span className="relative text-white font-semibold text-[11px] drop-shadow">{format(day, 'd')}</span>
                  {dayOutfits.length > 1 && (
                    <span className="absolute top-0.5 right-0.5 bg-gold text-background text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {dayOutfits.length}
                    </span>
                  )}
                </>
              ) : (
                <span className={`${today ? 'text-gold font-bold' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="mt-4 rounded-xl bg-card border border-border p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-body font-semibold text-foreground">
              {format(selectedDay, 'EEEE, MMM d')}
            </p>
            {!isFuture(selectedDay) && (
              <button
                onClick={() => onAddOutfit(selectedDay)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold/15 text-gold text-xs font-body font-semibold hover:bg-gold/25 transition"
              >
                <Plus size={14} /> Add Photo
              </button>
            )}
          </div>

          {selectedDayOutfits.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {selectedDayOutfits.map(outfit => (
                <div key={outfit.id} className="rounded-lg overflow-hidden bg-secondary/30 animate-fade-in">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img src={outfit.image_url} alt="Outfit" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleVisibility(outfit)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body font-semibold transition ${
                        outfit.is_public
                          ? 'bg-feroza/15 text-feroza'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {outfit.is_public ? <Eye size={10} /> : <EyeOff size={10} />}
                      {outfit.is_public ? 'Public' : 'Private'}
                    </button>
                    <button
                      onClick={() => handleDelete(outfit.id)}
                      className="p-1 rounded-lg hover:bg-rani/10 transition text-muted-foreground hover:text-rani"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {outfit.notes && (
                    <p className="px-2 pb-2 text-[10px] font-body text-muted-foreground truncate">{outfit.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-body text-muted-foreground">No outfits logged. Tap "Add Photo" to get started.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OutfitCalendar;
