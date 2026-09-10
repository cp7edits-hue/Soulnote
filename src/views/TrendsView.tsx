import React, { useState, useMemo } from 'react';
import { EmotionEntry, PrimaryEmotion } from '../types';
import { EMOTIONS_LIST, getEmotionMeta } from '../data/emotions';
import { BarChart3, Activity, Calendar, Plus, Info, Clock } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface TrendsViewProps {
  entries: EmotionEntry[];
  onOpenCheckIn: () => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({
  entries,
  onOpenCheckIn,
}) => {
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  // Filter entries according to chosen time range
  const filteredEntries = useMemo(() => {
    const now = Date.now();
    if (period === '7d') {
      return entries.filter((e) => e.createdAt >= now - 7 * 24 * 60 * 60 * 1000);
    }
    if (period === '30d') {
      return entries.filter((e) => e.createdAt >= now - 30 * 24 * 60 * 60 * 1000);
    }
    return entries;
  }, [entries, period]);

  // Calculations (100% deterministic)
  const stats = useMemo(() => {
    if (filteredEntries.length === 0) return null;

    // Emotion frequencies
    const freqMap: Record<string, number> = {};
    let totalIntensity = 0;
    const daysSet = new Set<string>();
    const timeOfDayCounts: Record<string, number> = {
      Morning: 0, // 05:00 - 11:59
      Afternoon: 0, // 12:00 - 16:59
      Evening: 0, // 17:00 - 21:59
      Night: 0, // 22:00 - 04:59
    };
    const tagCounts: Record<string, number> = {};

    filteredEntries.forEach((e) => {
      freqMap[e.emotion] = (freqMap[e.emotion] || 0) + 1;
      totalIntensity += e.intensity;
      daysSet.add(e.dateKey);

      // Time of day
      const hour = new Date(e.createdAt).getHours();
      if (hour >= 5 && hour < 12) timeOfDayCounts.Morning++;
      else if (hour >= 12 && hour < 17) timeOfDayCounts.Afternoon++;
      else if (hour >= 17 && hour < 22) timeOfDayCounts.Evening++;
      else timeOfDayCounts.Night++;

      // Context tags
      e.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const sortedEmotions = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
    const avgIntensity = (totalIntensity / filteredEntries.length).toFixed(1);
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    return {
      totalCheckins: filteredEntries.length,
      distinctDays: daysSet.size,
      avgIntensity,
      sortedEmotions,
      timeOfDayCounts,
      sortedTags,
      topEmotion: sortedEmotions[0] || null,
    };
  }, [filteredEntries]);

  // Prepare points for Daily Intensity Trend SVG Chart
  const chartData = useMemo(() => {
    if (filteredEntries.length === 0) return [];
    // Sort oldest to newest
    const chronological = [...filteredEntries].sort((a, b) => a.createdAt - b.createdAt);

    // Group by date to get daily average intensity
    const dailyMap: Record<string, { total: number; count: number; dateKey: string; timestamp: number }> = {};
    chronological.forEach((e) => {
      if (!dailyMap[e.dateKey]) {
        dailyMap[e.dateKey] = { total: 0, count: 0, dateKey: e.dateKey, timestamp: e.createdAt };
      }
      dailyMap[e.dateKey].total += e.intensity;
      dailyMap[e.dateKey].count += 1;
    });

    return Object.values(dailyMap).map((d) => ({
      dateKey: d.dateKey,
      label: new Date(d.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
      avg: Number((d.total / d.count).toFixed(1)),
      count: d.count,
    }));
  }, [filteredEntries]);

  const periodLabel =
    period === '7d' ? 'last 7 days' : period === '30d' ? 'last 30 days' : 'all recorded time';

  return (
    <div id="soulnote-trends-view" className="space-y-6 pb-16 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
            Patterns & Trends
          </h1>
          <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85] mt-1">
            Objective statistical calculations from your private check-ins
          </p>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex p-1 rounded-2xl bg-[#F0EEE8] dark:bg-[#1A1A18] border border-[#E4E2D8] dark:border-[#282824] max-w-xs">
        {(['7d', '30d', 'all'] as const).map((p) => {
          const isActive = period === p;
          const label = p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time';
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                Haptics.selection();
                setPeriod(p);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#2A2A26] text-[#1E1E1C] dark:text-[#EDEDEB] shadow-xs'
                  : 'text-[#6F6D67] hover:text-[#1E1E1C] dark:text-[#9A9890] dark:hover:text-[#EDEDEB]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {entries.length === 0 || !stats ? (
        <div className="p-12 rounded-3xl bg-[#F5F4F0] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#262622] text-center space-y-4 my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#ECEAE3] dark:bg-[#242421] border border-[#E0DDD3] dark:border-[#2E2E2A] flex items-center justify-center mx-auto text-[#6F6D67] dark:text-[#9A9890]">
            <BarChart3 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
              “Record a few check-ins to start seeing your patterns.”
            </h3>
            <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85] max-w-sm mx-auto">
              Once you log emotions across days, this screen will calculate frequencies, average intensities, and distribution.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                Haptics.success();
                onOpenCheckIn();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-white text-[#FBFBFA] dark:text-[#121211] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>Check in now</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Objective Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622]">
              <span className="text-[11px] font-medium text-[#7C7A75] dark:text-[#8E8C85] block">
                Total Check-ins
              </span>
              <span className="font-serif text-2xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB] mt-0.5 block">
                {stats.totalCheckins}
              </span>
              <span className="text-[10px] text-[#8E8C85] dark:text-[#7A7872] block mt-0.5">
                Across {stats.distinctDays} distinct day{stats.distinctDays > 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622]">
              <span className="text-[11px] font-medium text-[#7C7A75] dark:text-[#8E8C85] block">
                Average Intensity
              </span>
              <span className="font-serif text-2xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB] mt-0.5 block">
                {stats.avgIntensity} <span className="text-sm font-sans font-normal opacity-70">/ 5</span>
              </span>
              <span className="text-[10px] text-[#8E8C85] dark:text-[#7A7872] block mt-0.5">
                Over {periodLabel}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622]">
              <span className="text-[11px] font-medium text-[#7C7A75] dark:text-[#8E8C85] block">
                Most Recorded
              </span>
              <span className="font-serif text-2xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB] mt-0.5 block truncate">
                {stats.topEmotion ? stats.topEmotion[0] : '—'}
              </span>
              <span className="text-[10px] text-[#8E8C85] dark:text-[#7A7872] block mt-0.5">
                Recorded {stats.topEmotion ? stats.topEmotion[1] : 0} time{stats.topEmotion && stats.topEmotion[1] > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Objective Statement Callout */}
          <div className="p-4 rounded-2xl bg-[#F5F4F0] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#262622]">
            <p className="text-xs text-[#44423D] dark:text-[#C5C3BC] leading-relaxed">
              {stats.topEmotion && (
                <>
                  You recorded <strong className="font-semibold text-[#1E1E1C] dark:text-[#EDEDEB]">{stats.topEmotion[0]}</strong> {stats.topEmotion[1]} time{stats.topEmotion[1] > 1 ? 's' : ''} during the {periodLabel}. Your average recorded intensity was <strong className="font-semibold text-[#1E1E1C] dark:text-[#EDEDEB]">{stats.avgIntensity}</strong>.
                </>
              )}
            </p>
          </div>

          {/* 1. Emotion Frequency List / Bar Representation */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                Emotion Frequency
              </h3>
              <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85]">
                How often each emotion was chosen in the {periodLabel}
              </p>
            </div>

            <div className="space-y-3">
              {stats.sortedEmotions.map(([emotionName, count]) => {
                const meta = getEmotionMeta(emotionName as PrimaryEmotion);
                const percent = Math.round((count / stats.totalCheckins) * 100);

                return (
                  <div key={emotionName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[#7C7A75] dark:text-[#8E8C85]">
                          {meta.symbol}
                        </span>
                        <span className="font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                          {emotionName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#7C7A75] dark:text-[#8E8C85]">
                        <span>{count} time{count > 1 ? 's' : ''}</span>
                        <span className="text-[10px] opacity-75">({percent}%)</span>
                      </div>
                    </div>

                    {/* Clean proportion bar */}
                    <div className="w-full h-2 rounded-full bg-[#F0EEE8] dark:bg-[#252522] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1E1E1C] dark:bg-[#EDEDEB] transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Intensity Over Time (Deterministic Visual Trend) */}
          {chartData.length > 1 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                  Intensity Trend
                </h3>
                <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85]">
                  Average daily recorded intensity (Scale 1 to 5)
                </p>
              </div>

              {/* Clean SVG Area/Line Chart */}
              <div className="pt-2">
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                    {/* Horizontal reference lines for 1, 2, 3, 4, 5 */}
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const y = 140 - ((lvl - 1) / 4) * 120;
                      return (
                        <g key={lvl}>
                          <line
                            x1="0"
                            y1={y}
                            x2="500"
                            y2={y}
                            stroke="currentColor"
                            strokeDasharray="3 3"
                            className="text-[#E8E6DF] dark:text-[#282824]"
                            strokeWidth="1"
                          />
                        </g>
                      );
                    })}

                    {/* Generate path coordinates */}
                    {(() => {
                      const points = chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * 480 + 10;
                        const y = 140 - ((d.avg - 1) / 4) * 120;
                        return { x, y, data: d };
                      });

                      const pathD = points
                        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ');

                      const areaD = `${pathD} L ${points[points.length - 1].x} 140 L ${points[0].x} 140 Z`;

                      return (
                        <>
                          {/* Subtle fill under line */}
                          <path
                            d={areaD}
                            fill="currentColor"
                            className="text-[#EFECE6]/60 dark:text-[#282824]/40"
                          />
                          {/* Main trajectory stroke */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="currentColor"
                            className="text-[#1E1E1C] dark:text-[#EDEDEB]"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Data points */}
                          {points.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r="3.5"
                              fill="currentColor"
                              className="text-[#1E1E1C] dark:text-[#EDEDEB]"
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* X-axis date labels */}
                <div className="flex items-center justify-between text-[10px] text-[#8E8C85] dark:text-[#7A7872] mt-2 px-1">
                  <span>{chartData[0].label}</span>
                  {chartData.length > 2 && (
                    <span>{chartData[Math.floor(chartData.length / 2)].label}</span>
                  )}
                  <span>{chartData[chartData.length - 1].label}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Time of Day & Context Consistency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Time of Day */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[#7C7A75] dark:text-[#8E8C85]">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-semibold uppercase text-[10px]">Time of Check-in</span>
              </div>
              <div className="space-y-2">
                {Object.entries(stats.timeOfDayCounts).map(([periodOfDay, countVal]) => {
                  const count = countVal as number;
                  const pct = Math.round((count / stats.totalCheckins) * 100) || 0;
                  return (
                    <div key={periodOfDay} className="flex items-center justify-between text-xs">
                      <span className="text-[#55534E] dark:text-[#A8A69F]">{periodOfDay}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">{count}</span>
                        <span className="text-[10px] text-[#8E8C85]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Context Distribution */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[#7C7A75] dark:text-[#8E8C85]">
                <Activity className="w-3.5 h-3.5" />
                <span className="font-semibold uppercase text-[10px]">Frequent Contexts</span>
              </div>
              {stats.sortedTags.length === 0 ? (
                <p className="text-xs text-[#8E8C85] dark:text-[#6C6A64] italic">
                  No context tags recorded in this period.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.sortedTags.slice(0, 4).map(([tag, count]) => (
                    <div key={tag} className="flex items-center justify-between text-xs">
                      <span className="text-[#55534E] dark:text-[#A8A69F]">{tag}</span>
                      <span className="font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                        {count} time{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Safety & Non-Judgmental Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#F0EEE8] dark:bg-[#181816] border border-[#E4E2D8] dark:border-[#282824] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-[#5F5D57] dark:text-[#A6A49D]">
              <strong>Objective Self-Reflection:</strong> SoulNote presents deterministic frequencies of your recordings. It does not provide psychological diagnosis, medical evaluation, or emotional judgment. Every emotion is valid information for you to reflect upon.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
