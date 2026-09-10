import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PrimaryEmotion,
  IntensityLevel,
  ContextTag,
  EmotionEntry,
} from '../types';
import {
  EMOTIONS_LIST,
  INTENSITY_LABELS,
  CONTEXT_TAGS,
  getEmotionMeta,
} from '../data/emotions';
import { X, Check, ArrowLeft } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    emotion: PrimaryEmotion;
    intensity: IntensityLevel;
    tags: ContextTag[];
    note?: string;
  }) => void;
  initialData?: EmotionEntry | null;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<PrimaryEmotion | null>(
    initialData?.emotion || null
  );
  const [intensity, setIntensity] = useState<IntensityLevel>(
    initialData?.intensity || 3
  );
  const [selectedTags, setSelectedTags] = useState<ContextTag[]>(
    initialData?.tags || []
  );
  const [note, setNote] = useState<string>(initialData?.note || '');
  const [showOptionalDetails, setShowOptionalDetails] = useState<boolean>(
    Boolean(initialData?.tags?.length || initialData?.note)
  );

  if (!isOpen) return null;

  const handleSelectEmotion = (emotion: PrimaryEmotion) => {
    Haptics.selection();
    setSelectedEmotion(emotion);
  };

  const handleSelectIntensity = (level: IntensityLevel) => {
    Haptics.selection();
    setIntensity(level);
  };

  const toggleTag = (tag: ContextTag) => {
    Haptics.subtle();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    if (!selectedEmotion) return;
    Haptics.success();
    onSave({
      emotion: selectedEmotion,
      intensity,
      tags: selectedTags,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const selectedMeta = selectedEmotion ? getEmotionMeta(selectedEmotion) : null;

  return (
    <div
      id="soulnote-checkin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/40 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-[#FBFBFA] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#282824] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E1] dark:border-[#22221F] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium tracking-wide uppercase text-[#88867F] dark:text-[#7E7C75]">
              {initialData ? 'Edit Entry' : 'Quick Check-In'}
            </span>
            <h2 className="font-serif text-xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
              {selectedEmotion ? `Feeling ${selectedEmotion}` : 'How are you feeling?'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EFECE5] dark:hover:bg-[#252522] text-[#6F6D67] dark:text-[#9A9890] transition-colors cursor-pointer"
            aria-label="Close check-in modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Emotion Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold tracking-wide text-[#595751] dark:text-[#9A9890]">
                1. SELECT EMOTION
              </label>
              {selectedMeta && (
                <span className="text-xs text-[#7A7872] dark:text-[#8E8C85] italic">
                  {selectedMeta.tagline}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {EMOTIONS_LIST.map((em) => {
                const isSelected = selectedEmotion === em.name;
                return (
                  <button
                    key={em.name}
                    id={`emotion-btn-${em.name.toLowerCase()}`}
                    type="button"
                    onClick={() => handleSelectEmotion(em.name)}
                    className={`group relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E1E1C] border-[#1E1E1C] text-white dark:bg-[#EDEDEB] dark:border-[#EDEDEB] dark:text-[#121211] shadow-sm scale-[1.02]'
                        : 'bg-[#F5F4F0] dark:bg-[#1E1E1C] border-[#E8E6DF] dark:border-[#2C2C28] text-[#1E1E1C] dark:text-[#EDEDEB] hover:border-[#CCC8BE] dark:hover:border-[#3E3E3A]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`text-xs font-mono ${
                          isSelected ? 'opacity-90' : 'text-[#8E8C85]'
                        }`}
                      >
                        {em.symbol}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-medium tracking-tight">
                      {em.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Intensity Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold tracking-wide text-[#595751] dark:text-[#9A9890]">
                2. INTENSITY
              </label>
              <span className="text-xs text-[#6F6D67] dark:text-[#A09E95] font-medium">
                {INTENSITY_LABELS[intensity].desc}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as IntensityLevel[]).map((level) => {
                const isSelected = intensity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    id={`intensity-btn-${level}`}
                    onClick={() => handleSelectIntensity(level)}
                    className={`py-3 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E1E1C] border-[#1E1E1C] text-white dark:bg-[#EDEDEB] dark:border-[#EDEDEB] dark:text-[#121211] shadow-xs'
                        : 'bg-[#F5F4F0] dark:bg-[#1E1E1C] border-[#E8E6DF] dark:border-[#2C2C28] text-[#4A4843] dark:text-[#BBB9B2] hover:border-[#CCC8BE] dark:hover:border-[#3E3E3A]'
                    }`}
                  >
                    <span className="text-sm font-semibold">{level}</span>
                    <span className="text-[10px] tracking-tight mt-0.5 opacity-80">
                      {level === 1
                        ? 'V. Low'
                        : level === 2
                        ? 'Low'
                        : level === 3
                        ? 'Mod'
                        : level === 4
                        ? 'High'
                        : 'V. High'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Expansion Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptionalDetails(!showOptionalDetails)}
              className="text-xs font-medium text-[#7C7A75] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              <span>{showOptionalDetails ? '− Hide context & note' : '+ Add optional context or note'}</span>
            </button>
          </div>

          {/* Step 3 & 4: Optional Context Tags & Note */}
          {showOptionalDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-2 border-t border-[#EAE8E1] dark:border-[#22221F]"
            >
              {/* Context Tags */}
              <div>
                <label className="block text-xs font-semibold tracking-wide text-[#595751] dark:text-[#9A9890] mb-2">
                  CONTEXT TAGS (OPTIONAL)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CONTEXT_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs py-1.5 px-3 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E1E1C] text-white border-[#1E1E1C] dark:bg-[#EDEDEB] dark:text-[#121211] dark:border-[#EDEDEB]'
                            : 'bg-white dark:bg-[#1E1E1C] border-[#E8E6DF] dark:border-[#2C2C28] text-[#5F5D57] dark:text-[#A6A49D] hover:border-[#CCC8BE]'
                        }`}
                      >
                        {isSelected && <span className="mr-1">✓</span>}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note Textarea */}
              <div>
                <label className="block text-xs font-semibold tracking-wide text-[#595751] dark:text-[#9A9890] mb-2">
                  PERSONAL NOTE (OPTIONAL)
                </label>
                <textarea
                  id="checkin-note-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What is on your mind? What led to this feeling? (No pressure to write)"
                  rows={3}
                  className="w-full text-sm p-3.5 rounded-2xl bg-white dark:bg-[#1C1C19] border border-[#E4E2D8] dark:border-[#2A2A26] text-[#1E1E1C] dark:text-[#EDEDEB] placeholder:text-[#9D9B94] dark:placeholder:text-[#64635E] focus:outline-hidden focus:ring-1 focus:ring-[#1E1E1C] dark:focus:ring-[#EDEDEB] transition-all resize-none"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#F5F4F0] dark:bg-[#141412] border-t border-[#EAE8E1] dark:border-[#22221F] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#6F6D67] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="save-checkin-btn"
            disabled={!selectedEmotion}
            onClick={handleSave}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-xs tracking-wide transition-all shadow-xs cursor-pointer ${
              selectedEmotion
                ? 'bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-[#FFFFFF] text-[#FBFBFA] dark:text-[#121211] active:scale-98'
                : 'bg-[#E0DED7] dark:bg-[#252522] text-[#9E9C95] dark:text-[#686660] cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{initialData ? 'Save Changes' : 'Save Check-in'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
