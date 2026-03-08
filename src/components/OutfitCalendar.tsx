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
      {/* Month nav — editorial style */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-display font-bold tracking-wide text-foreground">
            {format(currentMonth, 'MMMM')}
          </h2>
          <p className="text-[10px] font-body text-muted-foreground tracking-widest uppercase">
            {format(currentMonth, 'yyyy')}
          </p>
        </div>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-body font-semibold text-primary/50 tracking-wider uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid — tall rectangles */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-[2/3]" />
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
              className={`aspect-[2/3] rounded-xl overflow-hidden relative flex flex-col items-center justify-end transition-all
                ${selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                ${future ? 'opacity-20 cursor-not-allowed' : 'hover:ring-1 hover:ring-primary/40'}
                ${hasOutfits ? 'shadow-md' : 'bg-card/60 border border-border/50'}
              `}
            >
              {hasOutfits ? (
                <>
                  <img
                    src={dayOutfits[0].image_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Date number */}
                  <div className="relative w-full px-1 pb-1 flex items-end justify-between">
                    <span className="text-white font-display font-bold text-[11px] drop-shadow-lg">
                      {format(day, 'd')}
                    </span>
                    {dayOutfits.length > 1 && (
                      <span className="bg-gold text-background text-[7px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                        +{dayOutfits.length - 1}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <span className={`text-[11px] font-body ${today ? 'text-gold font-bold' : 'text-muted-foreground/60'}`}>
                    {format(day, 'd')}
                  </span>
                  {today && (
                    <div className="w-1 h-1 rounded-full bg-gold mt-0.5" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail panel */}
      {selectedDay && (
        <div className="mt-5 rounded-2xl bg-card border border-border/60 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <div>
              <p className="text-sm font-display font-bold text-foreground">
                {format(selectedDay, 'EEEE')}
              </p>
              <p className="text-[10px] font-body text-muted-foreground">
                {format(selectedDay, 'MMMM d, yyyy')}
              </p>
            </div>
            {!isFuture(selectedDay) && (
              <button
                onClick={() => onAddOutfit(selectedDay)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold text-background text-xs font-body font-semibold hover:brightness-110 transition shadow-sm"
              >
                <Plus size={13} /> Add
              </button>
            )}
          </div>

          {/* Outfit gallery */}
          {selectedDayOutfits.length > 0 ? (
            <div className="p-3 space-y-3">
              {selectedDayOutfits.map(outfit => (
                <div key={outfit.id} className="rounded-xl overflow-hidden bg-background/50 border border-border/30 animate-fade-in">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img src={outfit.image_url} alt="Outfit" className="w-full h-full object-cover" />
                    {/* Visibility badge on image */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold backdrop-blur-md ${
                        outfit.is_public
                          ? 'bg-feroza/20 text-white border border-feroza/30'
                          : 'bg-black/30 text-white/70 border border-white/10'
                      }`}>
                        {outfit.is_public ? <Eye size={9} /> : <EyeOff size={9} />}
                        {outfit.is_public ? 'Public' : 'Only you'}
                      </span>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleVisibility(outfit)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body font-semibold transition ${
                        outfit.is_public
                          ? 'bg-feroza/15 text-feroza hover:bg-feroza/25'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {outfit.is_public ? (
                        <><EyeOff size={12} /> Make Private</>
                      ) : (
                        <><Eye size={12} /> Share Publicly</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(outfit.id)}
                      className="p-2 rounded-full hover:bg-rani/10 transition text-muted-foreground hover:text-rani"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {outfit.notes && (
                    <p className="px-3 pb-2.5 text-[11px] font-body text-muted-foreground italic">"{outfit.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs font-body text-muted-foreground">No outfits logged</p>
              <p className="text-[10px] font-body text-muted-foreground/60 mt-0.5">Tap "Add" to capture today's look</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OutfitCalendar;
