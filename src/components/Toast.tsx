import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  return (
    <AnimatePresence>
      {message && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 max-w-md w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="status"
            aria-live="polite"
            className="pointer-events-auto inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1E1E1C] dark:bg-[#EDEDEB] text-[#FBFBFA] dark:text-[#121211] text-xs font-medium shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md"
            onClick={onClose}
          >
            {type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />
            )}
            <span className="tracking-wide">{message}</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
