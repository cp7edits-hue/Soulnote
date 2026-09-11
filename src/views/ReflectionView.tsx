import React, { useState } from 'react';
import { ReflectionEntry } from '../types';
import { CURATED_REFLECTION_PROMPTS, PROMPT_CATEGORIES } from '../data/reflectionPrompts';
import { BookOpen, Sparkles, Plus, Trash2, Edit2, Check, RefreshCw, Calendar } from 'lucide-react';
import { Haptics } from '../services/haptics';
import { MindfulPerspectiveCard } from '../components/MindfulPerspectiveCard';

interface ReflectionViewProps {
  reflections: ReflectionEntry[];
  onSaveReflection: (prompt: string, content: string) => void;
  onUpdateReflection: (id: string, content: string) => void;
  onDeleteReflection: (id: string) => void;
  initialPrompt?: string | null;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({
  reflections,
  onSaveReflection,
  onUpdateReflection,
  onDeleteReflection,
  initialPrompt,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'write' | 'history'>('write');
  const [selectedPrompt, setSelectedPrompt] = useState<string>(
    initialPrompt || CURATED_REFLECTION_PROMPTS[0]
  );
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const currentPrompt = isCustomMode ? customPrompt : selectedPrompt;

  const handleShufflePrompt = () => {
    Haptics.selection();
    const otherPrompts = CURATED_REFLECTION_PROMPTS.filter((p) => p !== selectedPrompt);
    const randomPrompt = otherPrompts[Math.floor(Math.random() * otherPrompts.length)];
    setSelectedPrompt(randomPrompt);
    setIsCustomMode(false);
  };

  const handleSave = () => {
    if (!currentPrompt.trim() || !reflectionText.trim()) return;
    Haptics.success();
    onSaveReflection(currentPrompt.trim(), reflectionText.trim());
    setReflectionText('');
    setIsCustomMode(false);
    setActiveSubTab('history');
  };

  const handleStartEdit = (entry: ReflectionEntry) => {
    Haptics.selection();
    setEditingId(entry.id);
    setEditText(entry.content);
  };

  const handleSaveEdit = (id: string) => {
    Haptics.success();
    onUpdateReflection(id, editText);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    Haptics.vibrate([20, 50, 20]);
    onDeleteReflection(id);
    setDeleteConfirmId(null);
  };

  return (
    <div id="soulnote-reflection-view" className="space-y-6 pb-16 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
            Private Reflection
          </h1>
          <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85] mt-1">
            Human-written prompts for quiet, honest self-dialogue
          </p>
        </div>
      </div>

      {/* Sub-tab Pill Switcher */}
      <div className="flex p-1 rounded-2xl bg-[#F0EEE8] dark:bg-[#1A1A18] border border-[#E4E2D8] dark:border-[#282824] max-w-xs">
        <button
          type="button"
          onClick={() => {
            Haptics.selection();
            setActiveSubTab('write');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeSubTab === 'write'
              ? 'bg-white dark:bg-[#2A2A26] text-[#1E1E1C] dark:text-[#EDEDEB] shadow-xs'
              : 'text-[#6F6D67] hover:text-[#1E1E1C] dark:text-[#9A9890] dark:hover:text-[#EDEDEB]'
          }`}
        >
          Write Reflection
        </button>

        <button
          type="button"
          onClick={() => {
            Haptics.selection();
            setActiveSubTab('history');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-white dark:bg-[#2A2A26] text-[#1E1E1C] dark:text-[#EDEDEB] shadow-xs'
              : 'text-[#6F6D67] hover:text-[#1E1E1C] dark:text-[#9A9890] dark:hover:text-[#EDEDEB]'
          }`}
        >
          Saved ({reflections.length})
        </button>
      </div>

      {/* WRITE REFLECTION SUB-TAB */}
      {activeSubTab === 'write' && (
        <div className="space-y-6">
          {/* Prompt Selector Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7C7A75] dark:text-[#8E8C85] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8E8C85]" />
                <span>Prompt</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShufflePrompt}
                  className="text-xs text-[#7C7A75] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-[#F0EEE8] dark:hover:bg-[#22221F]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Another prompt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    Haptics.selection();
                    setIsCustomMode(!isCustomMode);
                  }}
                  className="text-xs text-[#7C7A75] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-[#F0EEE8] dark:hover:bg-[#22221F]"
                >
                  {isCustomMode ? 'Use curated prompt' : 'Custom question'}
                </button>
              </div>
            </div>

            {/* Prompt Display or Input */}
            {isCustomMode ? (
              <div>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter your own reflective question..."
                  className="w-full text-base font-serif p-3 rounded-2xl bg-[#F5F4F0] dark:bg-[#1C1C19] border border-[#E4E2D8] dark:border-[#2A2A26] text-[#1E1E1C] dark:text-[#EDEDEB] focus:outline-hidden focus:ring-1 focus:ring-[#1E1E1C] dark:focus:ring-[#EDEDEB]"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB] leading-snug italic">
                  “{selectedPrompt}”
                </h2>

                {/* Quick curated prompt chips */}
                <div className="pt-2 border-t border-[#F0EEE8] dark:border-[#22221F] flex flex-wrap gap-1.5">
                  {CURATED_REFLECTION_PROMPTS.slice(0, 4).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        Haptics.selection();
                        setSelectedPrompt(p);
                        setIsCustomMode(false);
                      }}
                      className={`text-[11px] py-1 px-2.5 rounded-full border transition-all text-left truncate max-w-[240px] cursor-pointer ${
                        selectedPrompt === p
                          ? 'bg-[#1E1E1C] text-white border-[#1E1E1C] dark:bg-[#EDEDEB] dark:text-[#121211]'
                          : 'bg-[#F9F8F5] dark:bg-[#1E1E1C] border-[#E8E6DF] dark:border-[#282824] text-[#6F6D67] dark:text-[#9A9890] hover:border-[#CCC8BE]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional AI Mindful Perspective (Data Minimization applied: only sends prompt topic) */}
          <MindfulPerspectiveCard promptText={currentPrompt} />

          {/* Reflection Writing Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] shadow-2xs space-y-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#7C7A75] dark:text-[#8E8C85]">
                Your Private Thoughts
              </label>
              <span className="text-[11px] text-[#7A7872] dark:text-[#8E8C85]">
                ⌘ + Enter to save
              </span>
            </div>

            <textarea
              id="reflection-editor"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  if (reflectionText.trim() && currentPrompt.trim()) {
                    e.preventDefault();
                    handleSave();
                  }
                }
              }}
              placeholder="Write freely. No AI reads this. No algorithms grade this. It belongs entirely to you."
              rows={6}
              className="w-full text-sm sm:text-base leading-relaxed p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1C1C19] border border-[#E4E2D8] dark:border-[#2A2A26] text-[#1E1E1C] dark:text-[#EDEDEB] placeholder:text-[#9D9B94] dark:placeholder:text-[#64635E] focus:outline-hidden focus:ring-1 focus:ring-[#1E1E1C] dark:focus:ring-[#EDEDEB] resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8E8C85] dark:text-[#7A7872]">
                {reflectionText.trim().split(/\s+/).filter(Boolean).length} words
              </span>

              <button
                type="button"
                id="save-reflection-btn"
                disabled={!reflectionText.trim() || !currentPrompt.trim()}
                onClick={handleSave}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-xs tracking-wide transition-all shadow-xs cursor-pointer min-h-[44px] ${
                  reflectionText.trim() && currentPrompt.trim()
                    ? 'bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-white text-[#FBFBFA] dark:text-[#121211] active:scale-98'
                    : 'bg-[#E4E2D8] dark:bg-[#252522] text-[#9E9C95] dark:text-[#686660] cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Save Reflection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVED REFLECTIONS HISTORY SUB-TAB */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {reflections.length === 0 ? (
            /* Empty State */
            <div className="p-12 rounded-3xl bg-[#F5F4F0] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#262622] text-center space-y-4 my-8">
              <div className="w-12 h-12 rounded-2xl bg-[#ECEAE3] dark:bg-[#242421] border border-[#E0DDD3] dark:border-[#2E2E2A] flex items-center justify-center mx-auto text-[#6F6D67] dark:text-[#9A9890]">
                <BookOpen className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                  “Reflection becomes more useful when you have something to look back on.”
                </h3>
                <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85] max-w-sm mx-auto">
                  Take a quiet moment to write your first reflection entry. Your answers remain strictly private.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    Haptics.selection();
                    setActiveSubTab('write');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-white text-[#FBFBFA] dark:text-[#121211] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>Write a reflection</span>
                </button>
              </div>
            </div>
          ) : (
            reflections.map((entry) => {
              const isEditing = editingId === entry.id;
              const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={entry.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] shadow-2xs space-y-3"
                >
                  {/* Top Prompt & Date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#7C7A75] dark:text-[#8E8C85]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                      </div>
                      <h3 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB] italic leading-snug">
                        “{entry.prompt}”
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(entry)}
                          className="p-1.5 rounded-lg text-[#7C7A75] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] hover:bg-[#F0EEE8] dark:hover:bg-[#22221F] transition-colors cursor-pointer"
                          aria-label="Edit reflection"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(entry.id)}
                        className="p-1.5 rounded-lg text-[#7C7A75] hover:text-rose-600 dark:text-[#8E8C85] dark:hover:text-rose-400 hover:bg-[#F0EEE8] dark:hover:bg-[#22221F] transition-colors cursor-pointer"
                        aria-label="Delete reflection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content or Edit Form */}
                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full text-sm p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#1C1C19] border border-[#E4E2D8] dark:border-[#2A2A26] text-[#1E1E1C] dark:text-[#EDEDEB] focus:outline-hidden focus:ring-1 focus:ring-[#1E1E1C] resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-xs text-[#7C7A75] hover:text-[#1E1E1C] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(entry.id)}
                          className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#1E1E1C] dark:bg-[#EDEDEB] text-white dark:text-[#121211] cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1C1C19] border border-[#EAE8E1] dark:border-[#262622] text-sm text-[#383733] dark:text-[#D5D3CC] leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </div>
                  )}

                  {/* Delete confirmation dialog */}
                  {deleteConfirmId === entry.id && (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                      <span className="text-xs text-rose-800 dark:text-rose-200">
                        Permanently delete this reflection?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 text-xs text-[#5F5D57] dark:text-[#A6A49D] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="px-3 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
