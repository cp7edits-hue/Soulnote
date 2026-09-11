import React from 'react';
import { motion } from 'motion/react';
import { HardDrive, X, Download, Check } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface StorageNoticeBannerProps {
  onDismiss: () => void;
  onExportJson?: () => void;
}

export const StorageNoticeBanner: React.FC<StorageNoticeBannerProps> = ({
  onDismiss,
  onExportJson,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      role="region"
      aria-label="Local device storage notice"
      className="w-full mb-6 p-4 sm:p-5 rounded-2xl bg-[#F5F3EC] dark:bg-[#1C1C19] border border-[#E5E2D6] dark:border-[#2E2E28] shadow-xs relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <HardDrive className="w-5 h-5 stroke-[1.8]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-800 dark:text-amber-300">
              Notice
            </span>
            <span className="text-xs text-[#8E8C85] dark:text-[#7A7872]">•</span>
            <span className="text-xs font-medium text-[#5F5D57] dark:text-[#A6A49D]">
              Privacy & Storage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#1E1E1C] dark:text-[#EDEDEB] leading-relaxed font-normal">
            Your entries are stored only on this device in this browser. Export regularly if you want a backup.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {onExportJson && (
          <button
            type="button"
            onClick={() => {
              Haptics.selection();
              onExportJson();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#44423D] dark:text-[#B6B4AC] hover:bg-[#EAE6DA] dark:hover:bg-[#282823] transition-colors cursor-pointer min-h-[44px]"
            title="Download an offline JSON backup of your journal entries"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Backup</span>
          </button>
        )}

        <button
          type="button"
          id="dismiss-storage-notice-btn"
          onClick={() => {
            Haptics.success();
            onDismiss();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-white text-[#FBFBFA] dark:text-[#121211] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-95 min-h-[44px]"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Got it</span>
        </button>

        <button
          type="button"
          onClick={() => {
            Haptics.selection();
            onDismiss();
          }}
          aria-label="Dismiss storage notice"
          className="p-2 rounded-xl text-[#7A7872] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center sm:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
