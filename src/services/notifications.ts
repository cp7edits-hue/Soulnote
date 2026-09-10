import { StorageService } from './storage';

let reminderIntervalId: number | null = null;
let lastNotifiedDateKey: string | null = null;

export const NotificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (err) {
      console.error('Notification permission error', err);
      return Notification.permission;
    }
  },

  sendNotification(title: string, options?: NotificationOptions): boolean {
    if (!this.isSupported()) return false;
    if (Notification.permission !== 'granted') return false;

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch (err) {
      console.warn('Notification creation failed', err);
      return false;
    }
  },

  sendTestNotification(): boolean {
    return this.sendNotification('SoulNote', {
      body: 'Take a moment to check in with yourself.',
      tag: 'soulnote-test-reminder',
    });
  },

  // Starts real periodic interval that monitors user's selected reminder time
  startScheduler(): void {
    if (reminderIntervalId) {
      clearInterval(reminderIntervalId);
      reminderIntervalId = null;
    }

    // Check every 30 seconds
    reminderIntervalId = window.setInterval(() => {
      const settings = StorageService.getSettings();
      if (!settings.remindersEnabled || !settings.reminderTime) return;
      if (this.getPermission() !== 'granted') return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // If scheduled time matches and we haven't already sent a reminder today
      if (currentTimeStr === settings.reminderTime && lastNotifiedDateKey !== todayKey) {
        lastNotifiedDateKey = todayKey;
        this.sendNotification('SoulNote', {
          body: 'Take a moment to check in with yourself.',
          tag: 'soulnote-daily-reminder',
        });
      }
    }, 30000);
  },

  stopScheduler(): void {
    if (reminderIntervalId) {
      clearInterval(reminderIntervalId);
      reminderIntervalId = null;
    }
  },
};
