import React from 'react';
import { motion } from 'motion/react';
import { EmotionEntry, NavigationTab } from '../types';
import { getEmotionMeta, INTENSITY_LABELS } from '../data/emotions';
import { CURATED_REFLECTION_PROMPTS } from '../data/reflectionPrompts';
import { Plus, ArrowRight, Clock, Sparkles, Heart } from 'lucide-react';
import { Haptics } from '../services/haptics';
import { calculateStreak } from '../utils/streak';
import { StreakCard } from '../components/StreakCard';
import { MoodOverTimeChart } from '../components/MoodOverTimeChart';
import { EmptyStateJournal } from '../components/EmptyStateJournal';

interface HomeViewProps {
  entries: EmotionEntry[];
  onOpenCheckIn: () => void;
  onSelectEntry: (entry: EmotionEntry) => void;
  onNavigate: (tab: NavigationTab) => void;
  onSelectReflectionPrompt?: (prompt: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  entries,
  onOpenCheckIn,
  onSelectEntry,
  onNavigate,
  onSelectReflectionPrompt,
}) => {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const todayEntries = entries.filter((e) => e.dateKey === todayKey);
  const recentEntries = entries.slice(0, 3);

  // Pick prompt of the day deterministically based on day of year
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const dailyPrompt =
    CURATED_REFLECTION_PROMPTS[dayOfYear % CURATED_REFLECTION_PROMPTS.length];

  // 7-day summary calculations (purely deterministic)
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const last7DaysEntries = entries.filter((e) => e.createdAt >= sevenDaysAgo);

  const freqMap: Record<string, number> = {};
  let totalIntensity = 0;
  last7DaysEntries.forEach((e) => {
    freqMap[e.emotion] = (freqMap[e.emotion] || 0) + 1;
    totalIntensity += e.intensity;
  });

  const mostFrequentLast7d = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0];
  const avgIntensityLast7d =
    last7DaysEntries.length > 0
      ? (totalIntensity / last7DaysEntries.length).toFixed(1)
      : null;

  // Consecutive-day streak calculation (100% client-side from local entries)
  const streakStats = calculateStreak(entries);

  return (
    <div id="soulnote-home-view" className="space-y-7 pb-16 max-w-xl mx-auto">
      {/* 1. Date & Today's Status Header */}
      <header className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs text-[#7C7A75] dark:text-[#8E8C85]">
          <span className="font-medium tracking-wide uppercase">
            {now.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-[11px]">Private • Offline</span>
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
            Understand How You Feel
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#6F6D67] dark:text-[#9A9890]">
            How is your heart today?
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F2EFE9] dark:bg-[#1A1A18] border border-[#E6E4DC] dark:border-[#272723] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                todayEntries.length > 0
                  ? 'bg-emerald-500'
                  : 'bg-stone-400 dark:bg-stone-600'
              }`}
            />
            <p className="text-xs text-[#52504A] dark:text-[#A6A49D]">
              {todayEntries.length > 0
                ? `You've checked in ${todayEntries.length} time${
                    todayEntries.length > 1 ? 's' : ''
                  } today.`
                : 'No check-in recorded yet today.'}
            </p>
          </div>

          {todayEntries.length > 0 && (
            <span className="text-[11px] font-medium text-[#7A7871] dark:text-[#8E8C85]">
              Latest: {todayEntries[0].emotion}
            </span>
          )}
        </div>
      </header>

      {/* 2. Streak Counter (Lightweight, computed client-side) */}
      <section>
        <StreakCard streak={streakStats} onOpenCheckIn={onOpenCheckIn} />
      </section>

      {/* 3. Large Primary "Check in" CTA Action */}
      <section>
        <button
          type="button"
          id="home-primary-checkin-btn"
          onClick={() => {
            Haptics.success();
            onOpenCheckIn();
          }}
          className="w-full text-left p-6 sm:p-7 rounded-3xl bg-[#1E1E1C] hover:bg-[#2C2C28] dark:bg-[#EDEDEB] dark:hover:bg-[#FFFFFF] text-[#FBFBFA] dark:text-[#121211] shadow-md transition-all group cursor-pointer active:scale-[0.99] relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 max-w-[85%]">
              <span className="text-[11px] font-semibold tracking-wider uppercase opacity-75">
                Primary Action
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
                Record an Emotion
              </h2>
              <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-normal">
                Take 15 seconds to acknowledge your feeling. No pressure to write or analyze.
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center backdrop-blur-xs transition-transform group-hover:scale-110">
              <Plus className="w-6 h-6 stroke-[2]" />
            </div>
          </div>
        </button>
      </section>

      {/* 3. Recent Emotional Entries */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Recent Check-ins
          </h2>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => {
                Haptics.selection();
                onNavigate('timeline');
              }}
              className="text-xs text-[#7C7A75] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all ({entries.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {recentEntries.length === 0 ? (
          <EmptyStateJournal onOpenCheckIn={onOpenCheckIn} />
        ) : (
          <div className="space-y-2.5">
            {recentEntries.map((entry, index) => {
              const meta = getEmotionMeta(entry.emotion);
              const dateObj = new Date(entry.createdAt);
              const timeStr = dateObj.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const isToday = entry.dateKey === todayKey;

              return (
                <motion.button
                  key={entry.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.28,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => {
                    Haptics.selection();
                    onSelectEntry(entry);
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] hover:border-[#D5D2C7] dark:hover:border-[#383832] transition-all cursor-pointer shadow-2xs group flex items-start justify-between gap-3 min-h-[44px]"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8E8C85]">
                        {meta.symbol}
                      </span>
                      <span className="text-sm font-semibold text-[#1E1E1C] dark:text-[#EDEDEB]">
                        {entry.emotion}
                      </span>
                      <span className="text-xs text-[#7A7872] dark:text-[#8E8C85]">
                        • Intensity {entry.intensity}/5
                      </span>
                    </div>

                    {entry.note ? (
                      <p className="text-xs text-[#5F5D57] dark:text-[#A6A49D] line-clamp-1">
                        {entry.note}
                      </p>
                    ) : entry.tags.length > 0 ? (
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {entry.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#F0EEE8] dark:bg-[#22221F] text-[#55534D] dark:text-[#A8A69E]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#A2A098] dark:text-[#64635E] italic">
                        {meta.tagline}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-[#8E8C85] dark:text-[#7A7872] block">
                      {isToday ? timeStr : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-[#A2A098] dark:text-[#64635E] block mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Mood Over Time Chart (recharts, local entries) */}
      <section>
        <MoodOverTimeChart entries={entries} onOpenCheckIn={onOpenCheckIn} />
      </section>

      {/* 5. Small Useful Summary */}
      {entries.length > 0 && (
        <section className="p-5 rounded-3xl bg-[#F5F4F0] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#262622] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold tracking-wider uppercase text-[#7C7A75] dark:text-[#8E8C85]">
              Objective 7-Day Summary
            </h2>
            <button
              type="button"
              onClick={() => {
                Haptics.selection();
                onNavigate('trends');
              }}
              className="text-xs text-[#6F6D67] hover:text-[#1E1E1C] dark:text-[#9A9890] dark:hover:text-[#EDEDEB] flex items-center gap-1 cursor-pointer"
            >
              <span>Trends</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#EAE8E1] dark:border-[#2A2A26]">
              <span className="text-[11px] text-[#7C7A75] dark:text-[#8E8C85] block">
                Logged (Last 7d)
              </span>
              <span className="font-serif text-2xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                {last7DaysEntries.length}
              </span>
              <span className="text-[10px] text-[#8E8C85] dark:text-[#7A7872] block mt-0.5">
                {entries.length} total entries recorded
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#EAE8E1] dark:border-[#2A2A26]">
              <span className="text-[11px] text-[#7C7A75] dark:text-[#8E8C85] block">
                Avg. Intensity (7d)
              </span>
              <span className="font-serif text-2xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                {avgIntensityLast7d ? `${avgIntensityLast7d} / 5` : '—'}
              </span>
              <span className="text-[10px] text-[#8E8C85] dark:text-[#7A7872] block mt-0.5">
                {mostFrequentLast7d
                  ? `Most recorded: ${mostFrequentLast7d[0]}`
                  : 'Awaiting logs'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 6. Daily Human Reflection Prompt Callout */}
      <section className="p-5 rounded-3xl bg-[#FAF9F5] dark:bg-[#171715] border border-[#EAE8E1] dark:border-[#262622] flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#7A7872] dark:text-[#8E8C85]">
            <Sparkles className="w-3.5 h-3.5 text-[#88867F]" />
            <h2 className="font-medium tracking-wide uppercase text-[10px]">
              Daily Reflection Prompt
            </h2>
          </div>
          <p className="font-serif text-base text-[#1E1E1C] dark:text-[#EDEDEB] italic leading-snug">
            “{dailyPrompt}”
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              Haptics.selection();
              if (onSelectReflectionPrompt) {
                onSelectReflectionPrompt(dailyPrompt);
              }
              onNavigate('reflection');
            }}
            className="text-xs font-medium text-[#1E1E1C] dark:text-[#EDEDEB] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Write reflection</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>
    </div>
  );
};
