import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';

interface SplashIntroProps {
  onFinish: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onFinish }) => {
  // Stage 0: 0.0 - 0.5s Empty calm background
  // Stage 1: 0.5 - 1.2s Small point appears & gently pulses (heartbeat)
  // Stage 2: 1.2 - 2.8s Flowing line forms abstract Soul+Note
  // Stage 3: 2.8 - 3.6s Gentle breathing pulse
  // Stage 4: 3.6 - 4.4s SoulNote wordmark and thesis fade in
  // Stage 5: 4.4 - 5.0s Smooth transition out
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 1200);
    const t3 = setTimeout(() => setStage(3), 2800);
    const t4 = setTimeout(() => setStage(4), 3600);
    const t5 = setTimeout(() => setStage(5), 4500);
    const tEnd = setTimeout(() => onFinish(), 5100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(tEnd);
    };
  }, [onFinish]);

  return (
    <motion.div
      id="soulnote-splash-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: stage === 5 ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBFBFA] dark:bg-[#121211] text-[#1E1E1C] dark:text-[#EDEDEB] select-none overflow-hidden"
    >
      {/* Skip button for user convenience */}
      <button
        type="button"
        onClick={onFinish}
        className="absolute top-6 right-6 text-xs font-medium text-[#7C7A75] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] transition-colors py-1.5 px-3 rounded-full border border-[#E8E6DF] dark:border-[#2C2C29] bg-white/50 dark:bg-stone-900/50 backdrop-blur-xs cursor-pointer"
        aria-label="Skip intro animation"
      >
        Skip intro
      </button>

      <div className="flex flex-col items-center justify-center max-w-sm px-6 text-center">
        {/* Animated Symbol Canvas */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Stage 1: Point appears & gentle pulse (heartbeat) */}
          <AnimatePresence>
            {stage === 1 && (
              <motion.div
                key="pulse-point"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 0.9, 1.1, 1],
                  opacity: [0, 1, 0.7, 0.95, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="w-3.5 h-3.5 rounded-full bg-[#1E1E1C] dark:bg-[#EDEDEB]"
              />
            )}
          </AnimatePresence>

          {/* Stage 2, 3, 4: Flowing stroke forms Soul+Note, then breathes */}
          {stage >= 2 && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{
                scale: stage >= 3 ? [1, 1.04, 1] : 1,
              }}
              transition={{
                duration: 1.6,
                ease: 'easeInOut',
                repeat: stage === 3 ? 1 : 0,
              }}
              className="text-[#1E1E1C] dark:text-[#EDEDEB]"
            >
              <BrandLogo size={110} animated={true} />
            </motion.div>
          )}
        </div>

        {/* Wordmark and gentle thesis */}
        <div className="h-20 flex flex-col items-center justify-center mt-2">
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1"
            >
              <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
                SoulNote
              </h1>
              <p className="text-xs font-normal tracking-wide text-[#7C7A75] dark:text-[#9A9890]">
                Make emotional self-awareness easier than ignoring how you feel.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
