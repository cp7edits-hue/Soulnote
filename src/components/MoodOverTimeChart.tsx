import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { EmotionEntry, PrimaryEmotion } from '../types';
import { getEmotionMeta } from '../data/emotions';
import { TrendingUp, Activity, Sparkles } from 'lucide-react';

interface MoodOverTimeChartProps {
  entries: EmotionEntry[];
  onOpenCheckIn?: () => void;
}

// Map emotion to an objective valence score (1 to 5 scale)
const EMOTION_VALENCE: Record<PrimaryEmotion, number> = {
  Happy: 4.8,
  Grateful: 4.6,
  Excited: 4.7,
  Calm: 4.2,
  Neutral: 3.0,
  Confused: 2.7,
  Tired: 2.4,
  Anxious: 2.1,
  Stressed: 2.0,
  Sad: 1.8,
  Lonely: 1.8,
  Angry: 1.6,
};

export const MoodOverTimeChart: React.FC<MoodOverTimeChartProps> = ({
  entries,
  onOpenCheckIn,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | 'all'>('7d');

  // Prepare chronological chart data
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const now = Date.now();
    let cutoff = 0;
    if (timeframe === '7d') {
      cutoff = now - 7 * 24 * 60 * 60 * 1000;
    } else if (timeframe === '14d') {
      cutoff = now - 14 * 24 * 60 * 60 * 1000;
    }

    const filtered = entries
      .filter((e) => e.createdAt >= cutoff)
      .sort((a, b) => a.createdAt - b.createdAt); // chronological order

    return filtered.map((entry) => {
      const meta = getEmotionMeta(entry.emotion);
      const d = new Date(entry.createdAt);
      const shortDate = d.toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
      });
      const timeStr = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const baseValence = EMOTION_VALENCE[entry.emotion] || 3.0;

      return {
        id: entry.id,
        timestamp: entry.createdAt,
        label: shortDate,
        fullTime: `${shortDate}, ${timeStr}`,
        emotion: entry.emotion,
        symbol: meta.symbol,
        intensity: entry.intensity,
        tags: entry.tags || [],
        note: entry.note || '',
        valence: Number(baseValence.toFixed(1)),
      };
    });
  }, [entries, timeframe]);

  if (entries.length < 2) {
    return (
      <div className="p-5 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85]" />
            <h3 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
              Mood Over Time
            </h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F2EFE9] dark:bg-[#252521] text-[#7A7871] dark:text-[#9A9890]">
            Requires 2+ check-ins
          </span>
        </div>

        <div className="py-6 text-center space-y-2 border border-dashed border-[#E5E3DB] dark:border-[#2C2C28] rounded-2xl bg-[#FAF9F6] dark:bg-[#141412]">
          <TrendingUp className="w-6 h-6 text-[#9A9891] dark:text-[#7A7871] mx-auto stroke-[1.5]" />
          <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] max-w-xs mx-auto">
            {entries.length === 0
              ? 'Log your first emotional check-ins to track your mood changes over time.'
              : 'Add one more check-in to begin rendering your chronological mood curve.'}
          </p>
          {onOpenCheckIn && (
            <button
              type="button"
              onClick={onOpenCheckIn}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E1E1C] dark:bg-[#EDEDEB] text-[#FBFBFA] dark:text-[#121211] text-xs font-medium cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Record Check-in</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85]" />
          <h3 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Mood Over Time
          </h3>
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto bg-[#F4F2EC] dark:bg-[#22221E] p-1 rounded-xl border border-[#E8E6DF] dark:border-[#2D2D29]">
          {(['7d', '14d', 'all'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                timeframe === t
                  ? 'bg-white dark:bg-[#2E2E2A] text-[#1E1E1C] dark:text-[#EDEDEB] shadow-2xs'
                  : 'text-[#6F6D67] dark:text-[#9A9890] hover:text-[#1E1E1C] dark:hover:text-[#EDEDEB]'
              }`}
            >
              {t === '7d' ? '7 Days' : t === '14d' ? '14 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-44 w-full -ml-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7A7871" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7A7871" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E8E6DF"
              className="dark:opacity-15"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#8E8C85' }}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: '#8E8C85' }}
              tickFormatter={(v) => {
                if (v >= 4) return 'Up';
                if (v === 3) return 'Mid';
                return 'Low';
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#20201D] border border-[#E0DED7] dark:border-[#33332D] shadow-xl text-xs space-y-1.5 max-w-[220px]">
                    <div className="flex items-center justify-between text-[#8E8C85] dark:text-[#7A7872] text-[10px]">
                      <span>{data.fullTime}</span>
                      <span>Intensity: {data.intensity}/5</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                      <span className="font-mono text-sm">{data.symbol}</span>
                      <span className="text-sm font-semibold">{data.emotion}</span>
                    </div>

                    {data.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {data.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[#F2EFE9] dark:bg-[#2C2C28] text-[#55534E] dark:text-[#A8A69F]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {data.note && (
                      <p className="text-[11px] text-[#6F6D67] dark:text-[#9A9890] italic line-clamp-2 pt-0.5">
                        “{data.note}”
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="valence"
              stroke="#3A3935"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#moodGradient)"
              dot={{ r: 3, fill: '#3A3935', strokeWidth: 1, stroke: '#FFFFFF' }}
              activeDot={{ r: 5, fill: '#1E1E1C', strokeWidth: 2, stroke: '#FFFFFF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#7C7A75] dark:text-[#8E8C85] pt-1 border-t border-[#EFECE5] dark:border-[#262622]">
        <span>Showing {chartData.length} entries in view</span>
        <span className="text-[10px]">Calculated from local journal logs</span>
      </div>
    </section>
  );
};
