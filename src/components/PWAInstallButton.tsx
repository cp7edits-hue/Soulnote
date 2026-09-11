import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, CheckCircle2 } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'minimal';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'outline',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone PWA
  if (isInstalled) {
    return null;
  }

  // Chromium / Desktop / Android flow
  if (isInstallable) {
    const baseStyle =
      variant === 'primary'
        ? 'bg-[#1E1E1C] dark:bg-[#EDEDEB] text-[#FBFBFA] dark:text-[#121211] hover:opacity-90'
        : variant === 'minimal'
        ? 'text-xs text-[#6F6D67] hover:text-[#1E1E1C] dark:text-[#9A9890] dark:hover:text-[#EDEDEB]'
        : 'border border-[#DDD9CE] dark:border-[#33332D] bg-white dark:bg-[#1A1A18] text-[#2C2C28] dark:text-[#EDEDEB] hover:border-[#1E1E1C] dark:hover:border-[#EDEDEB]';

    return (
      <button
        type="button"
        id="pwa-install-btn"
        onClick={async () => {
          Haptics.selection();
          await install();
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all active:scale-[0.98] ${baseStyle} ${className}`}
        title="Install SoulNote as an app on your home screen or desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          id="pwa-install-ios-btn"
          onClick={() => {
            Haptics.selection();
            setShowIOSGuide(true);
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#DDD9CE] dark:border-[#33332D] bg-white dark:bg-[#1A1A18] text-[#2C2C28] dark:text-[#EDEDEB] hover:border-[#1E1E1C] dark:hover:border-[#EDEDEB] cursor-pointer transition-all active:scale-[0.98] ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
                  Install SoulNote on iOS
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-full text-[#8E8C85] hover:text-[#1E1E1C] dark:hover:text-[#EDEDEB] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#52504A] dark:text-[#A8A69E] leading-relaxed">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F5F4F0] dark:bg-[#20201D]">
                  <Share2 className="w-4 h-4 mt-0.5 text-[#1E1E1C] dark:text-[#EDEDEB] shrink-0" />
                  <div>
                    <span className="font-semibold text-[#1E1E1C] dark:text-[#EDEDEB] block">
                      Step 1: Tap Share
                    </span>
                    In Mobile Safari's bottom toolbar, tap the Share icon.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F5F4F0] dark:bg-[#20201D]">
                  <Download className="w-4 h-4 mt-0.5 text-[#1E1E1C] dark:text-[#EDEDEB] shrink-0" />
                  <div>
                    <span className="font-semibold text-[#1E1E1C] dark:text-[#EDEDEB] block">
                      Step 2: Add to Home Screen
                    </span>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F5F4F0] dark:bg-[#20201D]">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#1E1E1C] dark:text-[#EDEDEB] block">
                      Step 3: Launch Offline
                    </span>
                    Open SoulNote from your home screen anytime with zero distractions.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#1E1E1C] dark:bg-[#EDEDEB] text-[#FBFBFA] dark:text-[#121211] font-medium text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
