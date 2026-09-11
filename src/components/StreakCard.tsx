import React from 'react';
import { Flame, Award, Calendar, Check } from 'lucide-react';
import { StreakStats } from '../utils/streak';

interface StreakCardProps {
  streak: StreakStats;
  onOpenCheckIn?: () => void;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streak,
  onOpenCheckIn,
}) => {
  const { currentStreak, longestStreak, hasLoggedToday, totalDaysLogged } = streak;

  return (
    <div
      id="soulnote-streak-card"
      className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
    >
      <div className="flex items-center gap-3.5">
        {/* Streak Badge Icon */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            currentStreak > 0
              ? 'bg-[#F9F3EA] dark:bg-[#2A241C] text-[#C27838] dark:text-[#E49E5D]'
              : 'bg-[#F2EFE9] dark:bg-[#22221E] text-[#8E8C85]'
          }`}
        >
          <Flame
            className={`w-6 h-6 stroke-[2] ${
              currentStreak > 0 ? 'fill-current animate-pulse' : 'opacity-60'
            }`}
          />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-[#7C7A75] dark:text-[#8E8C85]">
              Streak
            </span>

            {hasLoggedToday && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                Logged Today
              </span>
            )}
          </div>

          <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
            {hasLoggedToday
              ? 'Streak safely recorded for today. Well done.'
              : currentStreak > 0
              ? 'Keep your streak alive — take 15s to check in today.'
              : 'Check in today to begin your consecutive-day streak.'}
          </p>
        </div>
      </div>

      {/* Secondary Metrics / Quick Status */}
      <div className="flex items-center gap-3 self-end sm:self-auto border-t sm:border-t-0 border-[#F0ECE4] dark:border-[#262622] pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1 sm:gap-0">
          <div className="flex items-center gap-1 text-[11px] text-[#7C7A75] dark:text-[#8E8C85]">
            <Award className="w-3 h-3 text-[#A8A69F]" />
            <span>Best: {longestStreak}d</span>
            <span className="mx-1">•</span>
            <Calendar className="w-3 h-3 text-[#A8A69F]" />
            <span>{totalDaysLogged} total days</span>
          </div>

          {!hasLoggedToday && onOpenCheckIn && (
            <button
              type="button"
              onClick={onOpenCheckIn}
              className="text-xs font-semibold text-[#1E1E1C] dark:text-[#EDEDEB] hover:underline cursor-pointer"
            >
              Check in now →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
