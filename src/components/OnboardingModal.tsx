import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Sparkles, Clock, ArrowRight, Check } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface OnboardingModalProps {
  onComplete: () => void;
  onStartFirstCheckin: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  onStartFirstCheckin,
}) => {
  const [step, setStep] = useState<number>(1);

  const screens = [
    {
      step: 1,
      title: 'Understand how you feel.',
      subtitle:
        'A quiet, private space to check in with yourself. Every emotion is valid information—never good or bad.',
      icon: <BrandLogo size={44} />,
      detail: 'No diagnosis. No judgment. Just honest awareness.',
    },
    {
      step: 2,
      title: 'Record in seconds. Notice patterns over time.',
      subtitle:
        'Select your emotion and intensity in under 15 seconds. Add optional context or notes only if you want to.',
      icon: <Clock className="w-10 h-10 text-stone-700 dark:text-stone-300 stroke-[1.5]" />,
      detail: 'Clear, objective trends reveal how you travel through your days.',
    },
    {
      step: 3,
      title: 'Your emotional notes belong to you.',
      subtitle:
        '100% offline-first. Stored strictly on your device. No AI models, no advertising, no tracking, and no subscriptions.',
      icon: <ShieldCheck className="w-10 h-10 text-stone-700 dark:text-stone-300 stroke-[1.5]" />,
      detail: 'Export your data or clear it anytime. You hold complete ownership.',
    },
  ];

  const current = screens[step - 1];

  const handleNext = () => {
    Haptics.selection();
    if (step < 3) {
      setStep(step + 1);
    } else {
      Haptics.success();
      onComplete();
      onStartFirstCheckin();
    }
  };

  const handleSkip = () => {
    Haptics.selection();
    onComplete();
  };

  return (
    <div
      id="soulnote-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/40 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#FBFBFA] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#2A2A27] rounded-3xl p-7 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[440px]"
      >
        {/* Top bar with step indicators & skip */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-[#1E1E1C] dark:bg-[#EDEDEB]'
                    : 'w-1.5 bg-[#E8E6DF] dark:bg-[#2E2E2A]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-[#7C7A75] hover:text-[#1E1E1C] dark:text-[#8E8C85] dark:hover:text-[#EDEDEB] transition-colors py-1 px-2.5 rounded-full"
          >
            Skip
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center my-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#F0EEE8] dark:bg-[#22221F] border border-[#E8E6DF] dark:border-[#2C2C28] flex items-center justify-center text-[#1E1E1C] dark:text-[#EDEDEB] mb-6">
                {current.icon}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB] leading-snug">
                {current.title}
              </h2>

              <p className="text-sm leading-relaxed text-[#5F5D57] dark:text-[#A6A49D]">
                {current.subtitle}
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#EAE8E1] dark:bg-[#252522] text-[#3D3C38] dark:text-[#C5C3BC]">
                  <Sparkles className="w-3 h-3 text-[#7C7A75]" />
                  {current.detail}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom CTA Action */}
        <div className="pt-6 border-t border-[#E8E6DF] dark:border-[#262623] flex items-center justify-between gap-3">
          <span className="text-xs text-[#7C7A75] dark:text-[#8E8C85]">
            {step} of 3
          </span>

          <button
            type="button"
            id="onboarding-next-btn"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-[#FFFFFF] text-[#FBFBFA] dark:text-[#121211] font-medium text-sm transition-all shadow-xs cursor-pointer"
          >
            {step === 3 ? (
              <>
                <span>Start your first check-in</span>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
