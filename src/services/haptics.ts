import { StorageService } from './storage';

export const Haptics = {
  vibrate(duration: number | number[] = 12): void {
    const settings = StorageService.getSettings();
    if (!settings.hapticsEnabled) return;

    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Ignore if blocked or unsupported
      }
    }
  },

  selection(): void {
    this.vibrate(10);
  },

  success(): void {
    this.vibrate([12, 30, 15]);
  },

  subtle(): void {
    this.vibrate(8);
  },
};
