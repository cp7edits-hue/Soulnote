import React, { useState, useMemo } from 'react';
import { EmotionEntry, PrimaryEmotion, ContextTag } from '../types';
import { EMOTIONS_LIST, CONTEXT_TAGS, getEmotionMeta, INTENSITY_LABELS } from '../data/emotions';
import { Filter, Calendar, Tag, ChevronDown, Plus, RotateCcw } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface TimelineViewProps {
  entries: EmotionEntry[];
  onOpenCheckIn: () => void;
  onSelectEntry: (entry: EmotionEntry) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  entries,
  onOpenCheckIn,
  onSelectEntry,
}) => {
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<PrimaryEmotion | 'ALL'>('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState<ContextTag | 'ALL'>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | '7d' | '30d'>('all');

  // Filter entries
  const filteredEntries = useMemo(() => {
    const now = Date.now();
    return entries.filter((entry) => {
      // Emotion match
      if (selectedEmotionFilter !== 'ALL' && entry.emotion !== selectedEmotionFilter) {
        return false;
      }
      // Tag match
      if (selectedTagFilter !== 'ALL' && !entry.tags.includes(selectedTagFilter)) {
        return false;
      }
      // Date range match
      if (dateRangeFilter === '7d' && entry.createdAt < now - 7 * 24 * 60 * 60 * 1000) {
        return false;
      }
      if (dateRangeFilter === '30d' && entry.createdAt < now - 30 * 24 * 60 * 60 * 1000) {
        return false;
      }
      return true;
    });
  }, [entries, selectedEmotionFilter, selectedTagFilter, dateRangeFilter]);

  // Group by date
  const groupedEntries = useMemo<Record<string, EmotionEntry[]>>(() => {
    const groups: Record<string, EmotionEntry[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    filteredEntries.forEach((entry) => {
      const d = new Date(entry.createdAt);
      const entryDateString = d.toDateString();
      let label = entryDateString;

      if (entryDateString === today) {
        label = 'Today';
      } else if (entryDateString === yesterday) {
        label = 'Yesterday';
      } else {
        label = d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        });
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(entry);
    });

    return groups;
  }, [filteredEntries]);

  const hasActiveFilters =
    selectedEmotionFilter !== 'ALL' ||
    selectedTagFilter !== 'ALL' ||
    dateRangeFilter !== 'all';

  const resetFilters = () => {
    Haptics.selection();
    setSelectedEmotionFilter('ALL');
    setSelectedTagFilter('ALL');
    setDateRangeFilter('all');
  };

  return (
    <div id="soulnote-timeline-view" className="space-y-6 pb-16 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
            Emotional Timeline
          </h1>
          <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85] mt-1">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in your private history
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            Haptics.success();
            onOpenCheckIn();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E1E1C] dark:bg-[#EDEDEB] text-[#FBFBFA] dark:text-[#121211] text-xs font-medium cursor-pointer shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      {entries.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#F5F4F0] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#262622] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7C7A75] dark:text-[#8E8C85] flex items-center gap-1.5">
              <Filter className="w-3 h-3" />
              <span>Filters</span>
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-[#7C7A75] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Emotion Filter */}
            <div className="relative">
              <select
                value={selectedEmotionFilter}
                onChange={(e) => {
                  Haptics.selection();
                  setSelectedEmotionFilter(e.target.value as PrimaryEmotion | 'ALL');
                }}
                className="text-xs py-1.5 pl-2.5 pr-6 rounded-xl bg-white dark:bg-[#20201D] border border-[#E0DDD3] dark:border-[#2E2E2A] text-[#2D2C2A] dark:text-[#DFDDD7] appearance-none focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Emotions</option>
                {EMOTIONS_LIST.map((e) => (
                  <option key={e.name} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 pointer-events-none text-[#8E8C85]" />
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <select
                value={dateRangeFilter}
                onChange={(e) => {
                  Haptics.selection();
                  setDateRangeFilter(e.target.value as 'all' | '7d' | '30d');
                }}
                className="text-xs py-1.5 pl-2.5 pr-6 rounded-xl bg-white dark:bg-[#20201D] border border-[#E0DDD3] dark:border-[#2E2E2A] text-[#2D2C2A] dark:text-[#DFDDD7] appearance-none focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 pointer-events-none text-[#8E8C85]" />
            </div>

            {/* Context Tag Filter */}
            <div className="relative">
              <select
                value={selectedTagFilter}
                onChange={(e) => {
                  Haptics.selection();
                  setSelectedTagFilter(e.target.value as ContextTag | 'ALL');
                }}
                className="text-xs py-1.5 pl-2.5 pr-6 rounded-xl bg-white dark:bg-[#20201D] border border-[#E0DDD3] dark:border-[#2E2E2A] text-[#2D2C2A] dark:text-[#DFDDD7] appearance-none focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Contexts</option>
                {CONTEXT_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 pointer-events-none text-[#8E8C85]" />
            </div>
          </div>
        </div>
      )}

      {/* Main List */}
      {entries.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-[#F5F4F0] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#262622] text-center space-y-4 my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#ECEAE3] dark:bg-[#242421] border border-[#E0DDD3] dark:border-[#2E2E2A] flex items-center justify-center mx-auto text-[#6F6D67] dark:text-[#9A9890]">
            <Calendar className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
              “Your emotional story starts here.”
            </h3>
            <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85] max-w-sm mx-auto">
              Whenever you feel something, take a few seconds to record it. Over time, honest reflection brings calm perspective.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              id="timeline-empty-checkin-btn"
              onClick={() => {
                Haptics.success();
                onOpenCheckIn();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-white text-[#FBFBFA] dark:text-[#121211] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>Check in</span>
            </button>
          </div>
        </div>
      ) : filteredEntries.length === 0 ? (
        /* Filter matched nothing */
        <div className="p-8 rounded-3xl bg-[#F5F4F0] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#262622] text-center space-y-3">
          <p className="text-sm text-[#5F5D57] dark:text-[#A6A49D]">
            No check-ins match the selected filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-[#1E1E1C] dark:text-[#EDEDEB] font-medium underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Grouped timeline entries */
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([dateLabel, dayEntries]) => (
            <div key={dateLabel} className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#7C7A75] dark:text-[#8E8C85]">
                  {dateLabel}
                </span>
                <span className="h-px bg-[#EAE8E1] dark:bg-[#252521] flex-1" />
              </div>

              <div className="space-y-2.5">
                {(dayEntries as EmotionEntry[]).map((entry) => {
                  const meta = getEmotionMeta(entry.emotion);
                  const timeStr = new Date(entry.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        Haptics.selection();
                        onSelectEntry(entry);
                      }}
                      className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] hover:border-[#D5D2C7] dark:hover:border-[#383832] transition-all cursor-pointer shadow-2xs group flex flex-col space-y-2"
                    >
                      {/* Top row: Emotion, intensity, time */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#7C7A75] dark:text-[#8E8C85]">
                            {meta.symbol}
                          </span>
                          <span className="text-sm font-semibold text-[#1E1E1C] dark:text-[#EDEDEB]">
                            {entry.emotion}
                          </span>
                          <div className="flex items-center gap-1 pl-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <div
                                key={lvl}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  lvl <= entry.intensity
                                    ? 'bg-[#1E1E1C] dark:bg-[#EDEDEB]'
                                    : 'bg-[#DCD9D0] dark:bg-[#383733]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <span className="text-[11px] text-[#8E8C85] dark:text-[#7A7872]">
                          {timeStr}
                        </span>
                      </div>

                      {/* Note preview if available */}
                      {entry.note && (
                        <p className="text-xs text-[#52504A] dark:text-[#B5B3AB] leading-relaxed line-clamp-2">
                          {entry.note}
                        </p>
                      )}

                      {/* Context tags if available */}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {entry.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#F0EEE8] dark:bg-[#22221F] text-[#55534D] dark:text-[#A8A69E]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
