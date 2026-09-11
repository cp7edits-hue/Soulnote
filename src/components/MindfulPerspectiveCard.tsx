import React, { useState } from 'react';
import { Sparkles, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface MindfulPerspectiveCardProps {
  promptText: string;
}

export const MindfulPerspectiveCard: React.FC<MindfulPerspectiveCardProps> = ({
  promptText,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [perspective, setPerspective] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // The minimal text that is sent (strictly the prompt title/theme, max 120 chars)
  const minimalTextToSend = (promptText || 'Mindful Reflection').trim().slice(0, 120);

  const fetchPerspective = async () => {
    Haptics.selection();
    setIsLoading(true);
    setError(null);

    try {
      // DATA MINIMIZATION:
      // Send ONLY the minimal prompt/topic to the server, NEVER the full journal entry or notes.
      const res = await fetch('/api/gemini/perspective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: minimalTextToSend,
          featureName: 'Mindful Perspective',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      setPerspective(data.perspective || data.fallback || 'Breathe gently and treat yourself with kindness.');
      Haptics.success();
    } catch (err) {
      console.error('Error getting mindful perspective:', err);
      setError('Unable to fetch response right now.');
      setPerspective(
        `Mindful reflection for "${minimalTextToSend}": Take a gentle breath. Give yourself grace in this moment, knowing every feeling is valid and temporary.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ai-mindful-perspective-card"
      className="rounded-3xl border border-[#E4E2D8] dark:border-[#282824] bg-[#FAF9F5] dark:bg-[#1A1A18] p-5 space-y-3 transition-all"
    >
      {/* Header / Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#EDEAE3] dark:bg-[#252522] flex items-center justify-center text-[#1E1E1C] dark:text-[#EDEDEB]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
              Mindful Perspective
            </h3>
            <span className="text-[11px] text-[#7C7A75] dark:text-[#8E8C85] block">
              Optional reflection perspective
            </span>
          </div>
        </div>

        <button
          type="button"
          id="toggle-perspective-btn"
          onClick={() => {
            Haptics.selection();
            if (!isOpen && !perspective) {
              fetchPerspective();
            }
            setIsOpen(!isOpen);
          }}
          className="text-xs px-3 py-1.5 rounded-xl border border-[#DCD9CE] dark:border-[#2E2E2A] hover:border-[#1E1E1C] dark:hover:border-[#EDEDEB] text-[#2D2C2A] dark:text-[#DFDDD7] bg-white dark:bg-[#22221F] font-medium transition-colors cursor-pointer"
        >
          {isOpen ? 'Hide' : perspective ? 'View Perspective' : 'Get Perspective'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-2 border-t border-[#EAE8E1] dark:border-[#22221F]">
          {/* Output text */}
          {isLoading ? (
            <div className="py-4 flex items-center justify-center gap-2 text-xs text-[#7C7A75] dark:text-[#8E8C85]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating gentle perspective...</span>
            </div>
          ) : perspective ? (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#20201D] border border-[#E8E6DF] dark:border-[#2A2A26] space-y-2">
              <p className="font-serif text-sm italic text-[#2D2C2A] dark:text-[#DFDDD7] leading-relaxed">
                “{perspective}”
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#8E8C85] dark:text-[#7A7872] pt-1">
                <span>Minimal prompt used: “{minimalTextToSend}”</span>
                <button
                  type="button"
                  onClick={fetchPerspective}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Privacy Note: Required exact client-side note and data minimization note */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F0EEE8] dark:bg-[#1E1E1C] text-[11px] text-[#6F6D67] dark:text-[#9A9890] leading-snug">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-medium text-[#2E2D2A] dark:text-[#DDD9D0]">
                This text is sent to Google's Gemini API to generate a response.
              </p>
              <p className="text-[10.5px] text-[#7C7A75] dark:text-[#8E8C85]">
                Only the prompt topic title is transmitted. Your personal written journal entries and reflections are never sent.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
