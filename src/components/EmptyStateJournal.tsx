import React from 'react';
import { motion } from 'motion/react';
import { Feather, Plus, ShieldCheck, Sparkles, Smile, Sun, CloudRain } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface EmptyStateJournalProps {
  onOpenCheckIn: () => void;
  title?: string;
  description?: string;
}

export const EmptyStateJournal: React.FC<EmptyStateJournalProps> = ({
  onOpenCheckIn,
  title = 'Your quiet sanctuary begins here',
  description = 'SoulNote is a safe, gentle space to pause and check in with yourself. There are no right or wrong feelings, no streaks to maintain, and no eyes on your words.',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="p-8 sm:p-10 rounded-3xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#EAE8E0] dark:border-[#262622] text-center space-y-6 shadow-2xs my-4"
    >
      {/* Visual Composition using pure Lucide icons & refined shapes */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EFECE3] dark:bg-[#252420] border border-[#E2DFD4] dark:border-[#33322C] flex items-center justify-center text-[#55534D] dark:text-[#C5C3BB] shadow-inner">
          <Feather className="w-8 h-8 stroke-[1.6]" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="font-serif text-2xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#5F5D57] dark:text-[#A6A49D] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Suggested moods to jumpstart reflection */}
      <div className="pt-1 pb-1">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-[#88867F] dark:text-[#7E7C75] mb-2.5">
          How are you feeling right now?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mx-auto">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-white dark:bg-[#20201D] border border-[#E5E2D6] dark:border-[#2E2E2A] text-[#44423D] dark:text-[#BCBAB2]">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Calm</span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-white dark:bg-[#20201D] border border-[#E5E2D6] dark:border-[#2E2E2A] text-[#44423D] dark:text-[#BCBAB2]">
            <Smile className="w-3.5 h-3.5 text-emerald-500" />
            <span>Grateful</span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-white dark:bg-[#20201D] border border-[#E5E2D6] dark:border-[#2E2E2A] text-[#44423D] dark:text-[#BCBAB2]">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>Tired / Stressed</span>
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          id="empty-state-checkin-btn"
          onClick={() => {
            Haptics.success();
            onOpenCheckIn();
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-white text-[#FBFBFA] dark:text-[#121211] text-xs sm:text-sm font-medium tracking-wide transition-all shadow-sm cursor-pointer active:scale-95 min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Record your first check-in</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-[#7A7872] dark:text-[#8E8C85]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>100% private to your browser — nothing ever leaves your device.</span>
        </div>
      </div>
    </motion.div>
  );
};
