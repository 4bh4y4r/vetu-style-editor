import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  recentDays: boolean[]; // last 7 days, true = active
  todayDone: boolean;
}

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    recentDays: Array(7).fill(false),
    todayDone: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch or create streak record
    let { data: streakRow } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!streakRow) {
      const { data: newRow } = await supabase
        .from('user_streaks')
        .insert({ user_id: user.id, current_streak: 0, longest_streak: 0 })
        .select()
        .single();
      streakRow = newRow;
    }

    // Fetch last 7 days of activity
    const today = new Date();
    const sevenDaysAgo = format(subDays(today, 6), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');

    const { data: activities } = await supabase
      .from('streak_activities')
      .select('activity_date')
      .eq('user_id', user.id)
      .gte('activity_date', sevenDaysAgo)
      .lte('activity_date', todayStr);

    const activeDates = new Set((activities || []).map((a) => a.activity_date));

    const recentDays = Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(today, 6 - i), 'yyyy-MM-dd');
      return activeDates.has(d);
    });

    setStreak({
      currentStreak: streakRow?.current_streak || 0,
      longestStreak: streakRow?.longest_streak || 0,
      lastActivityDate: streakRow?.last_activity_date || null,
      recentDays,
      todayDone: activeDates.has(todayStr),
    });
    setLoading(false);
  }, [user]);

  // Record today's activity (called when user uploads outfit)
  const recordActivity = useCallback(async () => {
    if (!user) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Upsert activity for today
    const { error: actError } = await supabase
      .from('streak_activities')
      .upsert(
        { user_id: user.id, activity_date: todayStr, activity_type: 'outfit_upload' },
        { onConflict: 'user_id,activity_date' }
      );
    if (actError) {
      console.error('Activity insert error:', actError);
      return;
    }

    // Calculate new streak
    const { data: streakRow } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!streakRow) return;

    let newStreak = 1;
    const lastDate = streakRow.last_activity_date;

    if (lastDate) {
      const daysDiff = differenceInCalendarDays(new Date(), parseISO(lastDate));
      if (daysDiff === 0) {
        // Already recorded today
        newStreak = streakRow.current_streak;
      } else if (daysDiff === 1) {
        // Consecutive day
        newStreak = streakRow.current_streak + 1;
      }
      // else streak resets to 1
    }

    const newLongest = Math.max(newStreak, streakRow.longest_streak);

    await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: todayStr,
      })
      .eq('user_id', user.id);

    fetchStreak();
  }, [user, fetchStreak]);

  // Auto-check streak on login (record login activity)
  useEffect(() => {
    if (user) fetchStreak();
  }, [user, fetchStreak]);

  return { streak, loading, recordActivity, fetchStreak };
};
