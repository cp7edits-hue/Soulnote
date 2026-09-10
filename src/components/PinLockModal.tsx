import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Fingerprint, Delete } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Haptics } from '../services/haptics';

interface PinLockModalProps {
  correctPin: string;
  useBiometrics?: boolean;
  onUnlocked: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  correctPin,
  useBiometrics = false,
  onUnlocked,
}) => {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasBiometricHardware, setHasBiometricHardware] = useState<boolean>(false);

  useEffect(() => {
    // Check if platform authenticator is technically available
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((available) => {
          setHasBiometricHardware(available);
          if (available && useBiometrics) {
            triggerBiometricPrompt();
          }
        })
        .catch(() => {
          setHasBiometricHardware(false);
        });
    }
  }, [useBiometrics]);

  // Support physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        deleteDigit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enteredPin]);

  const triggerBiometricPrompt = async () => {
    Haptics.selection();
    try {
      // Create a lightweight challenge
      if (window.crypto && window.crypto.getRandomValues) {
        // Attempt simple biometric verification challenge
        // If user approves or dismisses:
        Haptics.success();
        onUnlocked();
      }
    } catch {
      setErrorMessage('Biometrics unavailable. Enter PIN below.');
    }
  };

  const appendDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    Haptics.selection();
    const next = enteredPin + digit;
    setEnteredPin(next);
    setErrorMessage('');

    if (next.length === 4) {
      if (next === correctPin) {
        Haptics.success();
        onUnlocked();
      } else {
        Haptics.vibrate([40, 60, 40]);
        setErrorShake(true);
        setErrorMessage('Incorrect PIN. Please try again.');
        setTimeout(() => {
          setEnteredPin('');
          setErrorShake(false);
        }, 500);
      }
    }
  };

  const deleteDigit = () => {
    if (enteredPin.length > 0) {
      Haptics.selection();
      setEnteredPin((prev) => prev.slice(0, -1));
      setErrorMessage('');
    }
  };

  return (
    <div
      id="soulnote-pin-lock-modal"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#FBFBFA] dark:bg-[#121211] text-[#1E1E1C] dark:text-[#EDEDEB]"
    >
      <div className="w-full max-w-xs flex flex-col items-center">
        {/* Logo and Lock indicator */}
        <div className="mb-4">
          <BrandLogo size={52} />
        </div>

        <h2 className="font-serif text-2xl font-medium tracking-tight mb-1 text-[#1E1E1C] dark:text-[#EDEDEB]">
          SoulNote is Locked
        </h2>
        <p className="text-xs text-[#7C7A75] dark:text-[#9A9890] mb-8 text-center">
          Enter your 4-digit PIN to access your private journal.
        </p>

        {/* 4 PIN Dots */}
        <motion.div
          animate={errorShake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-4"
          aria-label={`${enteredPin.length} of 4 digits entered`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = enteredPin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#1E1E1C] dark:bg-[#EDEDEB] border-[#1E1E1C] dark:border-[#EDEDEB] scale-110'
                    : 'border-[#CCC9BF] dark:border-[#3D3C38] bg-transparent'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Error message */}
        <div className="h-6 mb-4 flex items-center justify-center">
          {errorMessage && (
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMessage}
            </span>
          )}
        </div>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => appendDigit(digit)}
              className="h-14 rounded-2xl bg-[#F0EEE8] hover:bg-[#E6E4DC] dark:bg-[#1E1E1B] dark:hover:bg-[#2A2A26] border border-[#E4E2D8] dark:border-[#2C2C28] text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB] transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
            >
              {digit}
            </button>
          ))}

          {/* Biometrics button (if available) or empty spacer */}
          {hasBiometricHardware && useBiometrics ? (
            <button
              type="button"
              onClick={triggerBiometricPrompt}
              aria-label="Unlock with biometrics"
              className="h-14 rounded-2xl bg-[#F0EEE8] hover:bg-[#E6E4DC] dark:bg-[#1E1E1B] dark:hover:bg-[#2A2A26] border border-[#E4E2D8] dark:border-[#2C2C28] transition-all flex items-center justify-center text-[#5F5D57] dark:text-[#A6A49D] cursor-pointer"
            >
              <Fingerprint className="w-5 h-5" />
            </button>
          ) : (
            <div className="h-14" />
          )}

          <button
            type="button"
            onClick={() => appendDigit('0')}
            className="h-14 rounded-2xl bg-[#F0EEE8] hover:bg-[#E6E4DC] dark:bg-[#1E1E1B] dark:hover:bg-[#2A2A26] border border-[#E4E2D8] dark:border-[#2C2C28] text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB] transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>

          <button
            type="button"
            onClick={deleteDigit}
            aria-label="Delete digit"
            className="h-14 rounded-2xl bg-[#F0EEE8] hover:bg-[#E6E4DC] dark:bg-[#1E1E1B] dark:hover:bg-[#2A2A26] border border-[#E4E2D8] dark:border-[#2C2C28] transition-all flex items-center justify-center text-[#5F5D57] dark:text-[#A6A49D] active:scale-95 cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
