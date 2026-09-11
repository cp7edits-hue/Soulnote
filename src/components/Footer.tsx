import React from 'react';
import { ShieldCheck, Download, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { PWAInstallButton } from './PWAInstallButton';
import { Haptics } from '../services/haptics';

interface FooterProps {
  onOpenPrivacy: () => void;
  onExportJson: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onExportJson,
}) => {
  return (
    <footer
      id="soulnote-site-footer"
      className="w-full border-t border-[#E8E6DF] dark:border-[#22221E] py-8 px-4 sm:px-6 mt-12 text-xs text-[#7C7A75] dark:text-[#8E8C85] bg-[#FAF9F6] dark:bg-[#151513]"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Brand philosophy */}
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
              <span className="font-serif text-sm">SoulNote</span>
              <span className="text-[11px] text-[#A8A69F]">•</span>
              <span className="text-xs font-normal text-[#5F5D57] dark:text-[#A6A49D]">
                Personal Emotional Journal
              </span>
            </div>
            <p className="text-[11px] text-[#7A7872] dark:text-[#9A9891]">
              100% offline & local to your device. No cloud servers, no analytics, no AI mining.
            </p>
          </div>

          {/* Right: Quick Links & Actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <button
              type="button"
              id="footer-privacy-link"
              onClick={() => {
                Haptics.selection();
                onOpenPrivacy();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#44423D] dark:text-[#B6B4AC] hover:text-[#1E1E1C] dark:hover:text-[#EDEDEB] hover:underline cursor-pointer transition-colors min-h-[44px] px-2 py-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              id="footer-export-json-btn"
              onClick={() => {
                Haptics.success();
                onExportJson();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#44423D] dark:text-[#B6B4AC] hover:text-[#1E1E1C] dark:hover:text-[#EDEDEB] hover:underline cursor-pointer transition-colors min-h-[44px] px-2 py-2"
              title="Download all journal entries from localStorage as a JSON file"
            >
              <Download className="w-4 h-4" />
              <span>Export Entries (JSON)</span>
            </button>

            <PWAInstallButton variant="outline" className="text-[11px] py-1 px-2.5" />
          </div>
        </div>

        {/* Creator credit with slow gentle pulsing lucide Heart icon */}
        <div className="pt-4 border-t border-[#EAE8E1]/80 dark:border-[#22221E] flex items-center justify-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5F5D57] dark:text-[#A6A49D]">
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-flex items-center justify-center text-red-500"
              aria-hidden="true"
            >
              <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 stroke-red-500" />
            </motion.span>
            <span className="sr-only">love</span>
            <span>by Chaitanya</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
