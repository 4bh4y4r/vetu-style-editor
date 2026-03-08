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
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitPost | null>(null);

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
      .order('outfit_date', { ascending: true });
    if (data) setOutfits(data as OutfitPost[]);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Monday-based: getDay returns 0=Sun, so shift
  const firstDayOffset = (getDay(startOfMonth(currentMonth)) + 6) % 7;

  const getOutfitForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return outfits.find(o => o.outfit_date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    if (isFuture(date)) return;
    const outfit = getOutfitForDay(date);
    if (outfit) {
      setSelectedOutfit(outfit);
      setSelectedDay(date);
    } else {
      setSelectedDay(date);
      setSelectedOutfit(null);
    }
  };

  const handleToggleVisibility = async () => {
    if (!selectedOutfit) return;
    const { error } = await supabase
      .from('outfit_posts')
      .update({ is_public: !selectedOutfit.is_public })
      .eq('id', selectedOutfit.id);
    if (!error) {
      toast.success(selectedOutfit.is_public ? 'Outfit set to private' : 'Outfit set to public');
      setSelectedOutfit({ ...selectedOutfit, is_public: !selectedOutfit.is_public });
      fetchOutfits();
    }
  };

  const handleDelete = async () => {
    if (!selectedOutfit) return;
    const { error } = await supabase
      .from('outfit_posts')
      .delete()
      .eq('id', selectedOutfit.id);
    if (!error) {
      toast.success('Outfit removed');
      setSelectedOutfit(null);
      setSelectedDay(null);
      fetchOutfits();
    }
  };

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
          const outfit = getOutfitForDay(day);
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
                ${today && !outfit ? 'ring-1 ring-gold/50' : ''}
                ${future ? 'opacity-30 cursor-not-allowed' : 'hover:border-gold/30'}
                ${outfit ? '' : 'bg-secondary/50'}
              `}
            >
              {outfit ? (
                <>
                  <img src={outfit.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="relative text-white font-semibold text-[11px] drop-shadow">{format(day, 'd')}</span>
                  {!outfit.is_public && (
                    <EyeOff size={8} className="absolute top-0.5 right-0.5 text-white/70" />
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-body font-semibold text-foreground">
              {format(selectedDay, 'EEEE, MMM d')}
            </p>
            {!selectedOutfit && !isFuture(selectedDay) && (
              <button
                onClick={() => onAddOutfit(selectedDay)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold/15 text-gold text-xs font-body font-semibold hover:bg-gold/25 transition"
              >
                <Plus size={14} /> Add Outfit
              </button>
            )}
          </div>

          {selectedOutfit ? (
            <div>
              <div className="rounded-lg overflow-hidden aspect-[3/4] max-h-64 mb-2">
                <img src={selectedOutfit.image_url} alt="Outfit" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {selectedOutfit.is_public ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-feroza/15 text-feroza text-[10px] font-body font-semibold">
                      <Eye size={10} /> Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-body font-semibold">
                      <EyeOff size={10} /> Private
                    </span>
                  )}
                  {selectedOutfit.notes && (
                    <p className="text-xs font-body text-muted-foreground truncate max-w-[140px]">{selectedOutfit.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleToggleVisibility} className="p-1.5 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground">
                    {selectedOutfit.is_public ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-rani/10 transition text-muted-foreground hover:text-rani">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs font-body text-muted-foreground">No outfit logged for this day</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OutfitCalendar;
