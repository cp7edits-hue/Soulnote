import { EmotionEntry } from '../types';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  hasLoggedToday: boolean;
  totalDaysLogged: number;
}

/**
 * Computes consecutive-day streaks strictly client-side from journal entry timestamps.
 * No backend required.
 */
export function calculateStreak(entries: EmotionEntry[]): StreakStats {
  if (!entries || entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasLoggedToday: false,
      totalDaysLogged: 0,
    };
  }

  // Build a set of unique local date strings (YYYY-MM-DD)
  const uniqueDateKeys = new Set<string>();
  for (const entry of entries) {
    if (entry.dateKey) {
      uniqueDateKeys.add(entry.dateKey);
    } else if (entry.createdAt) {
      const d = new Date(entry.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      uniqueDateKeys.add(key);
    }
  }

  const now = new Date();
  const formatDayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayKey = formatDayKey(now);
  const hasLoggedToday = uniqueDateKeys.has(todayKey);

  const getDayKeyOffset = (daysAgo: number) => {
    const target = new Date(now);
    target.setDate(target.getDate() - daysAgo);
    return formatDayKey(target);
  };

  // Calculate current active streak
  let currentStreak = 0;
  if (hasLoggedToday) {
    currentStreak = 1;
    let offset = 1;
    while (uniqueDateKeys.has(getDayKeyOffset(offset))) {
      currentStreak++;
      offset++;
    }
  } else {
    // If not logged today yet, check if logged yesterday (streak is still intact)
    const yesterdayKey = getDayKeyOffset(1);
    if (uniqueDateKeys.has(yesterdayKey)) {
      currentStreak = 1;
      let offset = 2;
      while (uniqueDateKeys.has(getDayKeyOffset(offset))) {
        currentStreak++;
        offset++;
      }
    } else {
      currentStreak = 0;
    }
  }

  // Calculate all-time longest streak
  const sortedDates = Array.from(uniqueDateKeys).sort();
  let longestStreak = 0;
  let running = 0;
  let prevTimestamp: number | null = null;

  for (const dateStr of sortedDates) {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Midnight timestamp in local time
    const thisTime = new Date(year, month - 1, day).getTime();

    if (prevTimestamp === null) {
      running = 1;
    } else {
      const dayDiff = Math.round((thisTime - prevTimestamp) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        running++;
      } else if (dayDiff > 1) {
        running = 1;
      }
    }
    prevTimestamp = thisTime;
    if (running > longestStreak) {
      longestStreak = running;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    hasLoggedToday,
    totalDaysLogged: uniqueDateKeys.size,
  };
}
