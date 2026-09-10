import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EmotionEntry } from '../types';
import { getEmotionMeta, INTENSITY_LABELS } from '../data/emotions';
import { X, Trash2, Edit3, Calendar, Clock, Tag } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface EntryDetailModalProps {
  entry: EmotionEntry | null;
  onClose: () => void;
  onEdit: (entry: EmotionEntry) => void;
  onDelete: (id: string) => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  if (!entry) return null;

  const meta = getEmotionMeta(entry.emotion);
  const dateObj = new Date(entry.createdAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = () => {
    Haptics.vibrate([20, 50, 20]);
    onDelete(entry.id);
    onClose();
  };

  return (
    <div
      id="soulnote-entry-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#FBFBFA] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#282824] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E1] dark:border-[#22221F] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#7C7A75] dark:text-[#8E8C85]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedTime}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#EFECE5] dark:hover:bg-[#252522] text-[#6F6D67] dark:text-[#9A9890] transition-colors cursor-pointer"
            aria-label="Close entry details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Emotion Display Card */}
          <div className="p-5 rounded-2xl bg-[#F4F3EF] dark:bg-[#1E1E1B] border border-[#E8E6DF] dark:border-[#2A2A26] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A8881] dark:text-[#7A7871]">
                Felt Emotion
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-mono text-[#5A5852] dark:text-[#9F9D96]">
                  {meta.symbol}
                </span>
                <h3 className="font-serif text-2xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                  {entry.emotion}
                </h3>
              </div>
              <p className="text-xs text-[#7A7872] dark:text-[#8E8C85] italic">
                {meta.tagline}
              </p>
            </div>

            {/* Intensity Level Badge */}
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A8881] dark:text-[#7A7871] mb-1">
                Intensity
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#282824] border border-[#E0DED7] dark:border-[#353531]">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`w-2 h-2 rounded-full ${
                        lvl <= entry.intensity
                          ? 'bg-[#1E1E1C] dark:bg-[#EDEDEB]'
                          : 'bg-[#DCD9D0] dark:bg-[#3D3C38]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#1E1E1C] dark:text-[#EDEDEB] ml-1">
                  {entry.intensity}/5
                </span>
              </div>
              <span className="text-[10px] text-[#7A7872] dark:text-[#8E8C85] mt-1">
                {INTENSITY_LABELS[entry.intensity].label.split('— ')[1]}
              </span>
            </div>
          </div>

          {/* Context Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#7C7A75] dark:text-[#8E8C85] mb-2">
                <Tag className="w-3 h-3" />
                <span>Context</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#EAE8E1] dark:bg-[#252522] text-[#3D3C38] dark:text-[#C5C3BC] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Note content */}
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#7C7A75] dark:text-[#8E8C85] mb-2">
              Note
            </span>
            {entry.note ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C19] border border-[#E8E6DF] dark:border-[#282824] text-sm text-[#2D2C2A] dark:text-[#DFDDD7] leading-relaxed whitespace-pre-wrap">
                {entry.note}
              </div>
            ) : (
              <p className="text-xs text-[#8E8C85] dark:text-[#6C6A64] italic">
                No note attached to this check-in.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#F5F4F0] dark:bg-[#141412] border-t border-[#EAE8E1] dark:border-[#22221F]">
          {!confirmDelete ? (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 py-1.5 px-3 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(entry);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-white text-[#FBFBFA] dark:text-[#121211] text-xs font-medium transition-all shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Entry</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
              <span className="text-xs text-rose-800 dark:text-rose-200 font-medium pl-2">
                Permanently delete this check-in?
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1 text-xs text-[#5F5D57] dark:text-[#A6A49D] hover:text-[#1E1E1C] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
