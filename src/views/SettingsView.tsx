import React, { useState, useEffect } from 'react';
import { UserSettings, EmotionEntry, ReflectionEntry } from '../types';
import { StorageService } from '../services/storage';
import { NotificationService } from '../services/notifications';
import { Haptics } from '../services/haptics';
import { ThemeService } from '../services/theme';
import { downloadTxtExport, downloadPdfExport, downloadJsonExport } from '../services/export';
import {
  Bell,
  Sun,
  Moon,
  Monitor,
  Vibrate,
  Lock,
  Download,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Info,
  Film,
  Check,
  AlertTriangle,
  Fingerprint,
  FileText,
  FileDown,
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  entries: EmotionEntry[];
  reflections: ReflectionEntry[];
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onResetAllData: () => void;
  onResetPreferences: () => void;
  onReplayIntro: () => void;
  onSeedSampleData: () => void;
  onOpenPrivacy?: () => void;
  entriesCount: number;
  reflectionsCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  entries,
  reflections,
  onUpdateSettings,
  onResetAllData,
  onResetPreferences,
  onReplayIntro,
  onSeedSampleData,
  onOpenPrivacy,
  entriesCount,
  reflectionsCount,
}) => {
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(NotificationService.getPermission());
  const [hasBiometrics, setHasBiometrics] = useState<boolean>(false);
  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [deleteConfirmationWord, setDeleteConfirmationWord] = useState<string>('');
  const [exportNotice, setExportNotice] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((avail) => setHasBiometrics(avail))
        .catch(() => setHasBiometrics(false));
    }
  }, []);

  // Notifications Toggle
  const handleToggleNotifications = async () => {
    Haptics.selection();
    if (!settings.remindersEnabled) {
      const perm = await NotificationService.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        onUpdateSettings({ remindersEnabled: true });
        NotificationService.startScheduler();
      } else {
        alert('Please allow notification permissions in your browser to enable reminders.');
      }
    } else {
      onUpdateSettings({ remindersEnabled: false });
      NotificationService.stopScheduler();
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ reminderTime: e.target.value });
  };

  const handleTestNotification = () => {
    Haptics.selection();
    const sent = NotificationService.sendTestNotification();
    if (!sent) {
      alert('Could not trigger notification. Ensure browser permissions are granted.');
    }
  };

  // Theme change
  const handleSelectTheme = (theme: 'system' | 'light' | 'dark') => {
    Haptics.selection();
    ThemeService.applyTheme(theme);
    onUpdateSettings({ theme });
  };

  // Haptics toggle
  const handleToggleHaptics = () => {
    Haptics.selection();
    onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled });
  };

  // App Lock PIN Setup
  const handleToggleAppLock = () => {
    Haptics.selection();
    if (!settings.appLockEnabled) {
      setShowPinSetup(true);
      setNewPin('');
      setPinError('');
    } else {
      onUpdateSettings({ appLockEnabled: false, appLockPin: '' });
    }
  };

  const handleConfirmPin = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('Please enter a valid 4-digit numerical PIN.');
      return;
    }
    Haptics.success();
    onUpdateSettings({ appLockEnabled: true, appLockPin: newPin });
    setShowPinSetup(false);
  };

  // Export TXT
  const handleExportTxt = () => {
    Haptics.selection();
    downloadTxtExport(entries, reflections);
    setExportNotice('TXT journal exported successfully.');
    setTimeout(() => setExportNotice(''), 4000);
  };

  // Export PDF
  const handleExportPdf = () => {
    Haptics.selection();
    try {
      downloadPdfExport(entries, reflections);
      setExportNotice('PDF journal exported successfully.');
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.error('Error generating PDF export:', err);
      alert('Unable to generate PDF journal. Please try again.');
    }
  };

  // Export JSON (Raw from localStorage)
  const handleExportJson = () => {
    Haptics.selection();
    try {
      downloadJsonExport(entries, reflections);
      setExportNotice('Raw journal entries downloaded as a JSON file.');
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.error('Error exporting JSON:', err);
      alert('Unable to export JSON entries.');
    }
  };

  // Delete All Data
  const handleConfirmDeleteAll = () => {
    if (deleteConfirmationWord.toUpperCase() !== 'DELETE') return;
    Haptics.vibrate([40, 70, 40]);
    onResetAllData();
    setShowDeleteAllModal(false);
    setDeleteConfirmationWord('');
  };

  return (
    <div id="soulnote-settings-view" className="space-y-6 pb-20 max-w-xl mx-auto">
      {/* Header */}
      <div className="pt-2">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
          Settings
        </h1>
        <p className="text-xs text-[#7C7A75] dark:text-[#8E8C85] mt-1">
          Preferences, privacy controls, and data ownership
        </p>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 1. NOTIFICATIONS & REMINDERS */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85]" />
          <h2 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Daily Gentle Reminder
          </h2>
        </div>
        <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
          One quiet local notification per day to invite self-awareness. No streaks, no guilt, and scheduled strictly on your device.
        </p>

        <div className="space-y-3 pt-1">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#2D2C2A] dark:text-[#DFDDD7]">
              Enable Daily Reminder
            </span>
            <button
              type="button"
              id="reminder-toggle-btn"
              onClick={handleToggleNotifications}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.remindersEnabled
                  ? 'bg-[#1E1E1C] dark:bg-[#EDEDEB]'
                  : 'bg-[#E4E2D8] dark:bg-[#2C2C28]'
              }`}
            >
              <div
                className={`bg-white dark:bg-[#121211] w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  settings.remindersEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Time Selector */}
          {settings.remindersEnabled && (
            <div className="flex items-center justify-between pt-2 border-t border-[#F0EEE8] dark:border-[#22221F]">
              <span className="text-xs text-[#52504A] dark:text-[#A6A49D]">
                Reminder Time
              </span>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={handleTimeChange}
                className="text-xs font-medium py-1 px-2.5 rounded-lg bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E0DDD3] dark:border-[#2C2C28] text-[#1E1E1C] dark:text-[#EDEDEB] cursor-pointer"
              />
            </div>
          )}

          {/* Test Notification Button */}
          {settings.remindersEnabled && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleTestNotification}
                className="text-xs text-[#52504A] hover:text-[#1E1E1C] dark:text-[#A6A49D] dark:hover:text-[#EDEDEB] underline cursor-pointer"
              >
                Send test notification now
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. THEME SELECTION */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-4">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85]" />
          <h2 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Appearance
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'system' as const, label: 'System', icon: Monitor },
            { id: 'light' as const, label: 'Light', icon: Sun },
            { id: 'dark' as const, label: 'Dark', icon: Moon },
          ].map((th) => {
            const Icon = th.icon;
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                id={`theme-btn-${th.id}`}
                onClick={() => handleSelectTheme(th.id)}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E1E1C] border-[#1E1E1C] text-white dark:bg-[#EDEDEB] dark:border-[#EDEDEB] dark:text-[#121211] shadow-xs'
                    : 'bg-[#F9F8F5] dark:bg-[#1E1E1C] border-[#E8E6DF] dark:border-[#282824] text-[#55534E] dark:text-[#A8A69F] hover:border-[#CCC8BE]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{th.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
          {settings.theme === 'system'
            ? 'Automatically matches your device or OS appearance. SoulNote adjusts when your system switches.'
            : settings.theme === 'light'
            ? 'SoulNote is set to light appearance with soft warm paper tones.'
            : 'SoulNote is set to dark appearance with deep, eye-resting contrast.'}
        </p>
      </section>

      {/* 3. HAPTICS & TACTILE FEEDBACK */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85]" />
            <h2 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
              Haptic Feedback
            </h2>
          </div>

          <button
            type="button"
            id="haptics-toggle-btn"
            onClick={handleToggleHaptics}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              settings.hapticsEnabled
                ? 'bg-[#1E1E1C] dark:bg-[#EDEDEB]'
                : 'bg-[#E4E2D8] dark:bg-[#2C2C28]'
            }`}
          >
            <div
              className={`bg-white dark:bg-[#121211] w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-[#6F6D67] dark:text-[#9A9890]">
          Provides gentle tactile confirmation on supported devices when selecting emotions or saving entries.
        </p>
      </section>

      {/* 4. APP LOCK / PRIVACY PIN */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85]" />
            <h2 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
              App Lock (PIN)
            </h2>
          </div>

          <button
            type="button"
            id="app-lock-toggle-btn"
            onClick={handleToggleAppLock}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              settings.appLockEnabled
                ? 'bg-[#1E1E1C] dark:bg-[#EDEDEB]'
                : 'bg-[#E4E2D8] dark:bg-[#2C2C28]'
            }`}
          >
            <div
              className={`bg-white dark:bg-[#121211] w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                settings.appLockEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
          Require a 4-digit PIN to open your journal. Keeps your entries safe if someone borrows your device.
        </p>

        {/* Biometrics toggle if supported */}
        {settings.appLockEnabled && hasBiometrics && (
          <div className="pt-2 border-t border-[#F0EEE8] dark:border-[#22221F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85]" />
              <span className="text-xs text-[#44423D] dark:text-[#C5C3BC]">
                Allow Biometric Unlock
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                Haptics.selection();
                onUpdateSettings({
                  useBiometricsIfAvailable: !settings.useBiometricsIfAvailable,
                });
              }}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                settings.useBiometricsIfAvailable
                  ? 'bg-[#1E1E1C] dark:bg-[#EDEDEB]'
                  : 'bg-[#E4E2D8] dark:bg-[#2C2C28]'
              }`}
            >
              <div
                className={`bg-white dark:bg-[#121211] w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  settings.useBiometricsIfAvailable ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* PIN Setup Modal / Card */}
        {showPinSetup && (
          <div className="p-4 rounded-2xl bg-[#F5F4F0] dark:bg-[#20201D] border border-[#E8E6DF] dark:border-[#2C2C28] space-y-3">
            <span className="text-xs font-semibold text-[#1E1E1C] dark:text-[#EDEDEB]">
              Set 4-Digit Passcode
            </span>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="text-center tracking-widest text-lg font-mono w-32 mx-auto block p-2 rounded-xl bg-white dark:bg-[#161614] border border-[#DDD] dark:border-[#333]"
            />
            {pinError && <p className="text-xs text-rose-600 text-center">{pinError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPinSetup(false)}
                className="px-3 py-1.5 text-xs text-[#6F6D67] hover:text-[#1E1E1C] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPin}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#1E1E1C] dark:bg-[#EDEDEB] text-white dark:text-[#121211] cursor-pointer"
              >
                Save PIN
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. DATA & PRIVACY: EXPORT DATA */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-[#7C7A75] dark:text-[#8E8C85]" />
          <h2 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Export Data
          </h2>
        </div>

        <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
          Download your complete journal entries and reflections directly from localStorage. No cloud servers or backends involved.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            id="export-json-btn"
            onClick={handleExportJson}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border border-[#E0DDD3] dark:border-[#2E2E2A] bg-[#FAF9F5] dark:bg-[#1E1E1B] text-xs font-medium text-[#2D2C2A] dark:text-[#DFDDD7] hover:border-[#1E1E1C] dark:hover:border-[#EDEDEB] hover:bg-white dark:hover:bg-[#252522] transition-all cursor-pointer shadow-2xs"
            title="Download all journal entries from localStorage as a single JSON file"
          >
            <Download className="w-3.5 h-3.5 text-[#7C7A75] dark:text-[#8E8C85]" />
            <span>Export (JSON)</span>
          </button>

          <button
            type="button"
            id="export-txt-btn"
            onClick={handleExportTxt}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border border-[#E0DDD3] dark:border-[#2E2E2A] bg-[#FAF9F5] dark:bg-[#1E1E1B] text-xs font-medium text-[#2D2C2A] dark:text-[#DFDDD7] hover:border-[#1E1E1C] dark:hover:border-[#EDEDEB] hover:bg-white dark:hover:bg-[#252522] transition-all cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#7C7A75] dark:text-[#8E8C85]" />
            <span>Export as TXT</span>
          </button>

          <button
            type="button"
            id="export-pdf-btn"
            onClick={handleExportPdf}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border border-[#E0DDD3] dark:border-[#2E2E2A] bg-[#FAF9F5] dark:bg-[#1E1E1B] text-xs font-medium text-[#2D2C2A] dark:text-[#DFDDD7] hover:border-[#1E1E1C] dark:hover:border-[#EDEDEB] hover:bg-white dark:hover:bg-[#252522] transition-all cursor-pointer shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5 text-[#7C7A75] dark:text-[#8E8C85]" />
            <span>Export as PDF</span>
          </button>
        </div>
      </section>

      {/* 6. APP ACTIONS (REPLAY INTRO, RESET PREFERENCES, SAMPLE DATA) */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-3">
        <h2 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
          App Experience
        </h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5 border-b border-[#F0EEE8] dark:border-[#22221F]">
            <div>
              <span className="text-xs font-medium text-[#2D2C2A] dark:text-[#DFDDD7] block">
                Replay Intro Animation
              </span>
              <span className="text-[11px] text-[#7C7A75] dark:text-[#8E8C85]">
                Watch the calm SoulNote visual motion sequence again
              </span>
            </div>
            <button
              type="button"
              onClick={onReplayIntro}
              className="text-xs font-medium text-[#1E1E1C] dark:text-[#EDEDEB] hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#F5F4F0] dark:hover:bg-[#20201D]"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Play Intro</span>
            </button>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#F0EEE8] dark:border-[#22221F]">
            <div>
              <span className="text-xs font-medium text-[#2D2C2A] dark:text-[#DFDDD7] block">
                Reset Preferences
              </span>
              <span className="text-[11px] text-[#7C7A75] dark:text-[#8E8C85]">
                Reset theme & reminder settings without deleting your journal entries
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                Haptics.selection();
                onResetPreferences();
                alert('Preferences reset to default values.');
              }}
              className="text-xs font-medium text-[#52504A] dark:text-[#A6A49D] hover:text-[#1E1E1C] dark:hover:text-white flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#F5F4F0] dark:hover:bg-[#20201D]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {entriesCount === 0 && (
            <div className="flex items-center justify-between py-1.5">
              <div>
                <span className="text-xs font-medium text-[#2D2C2A] dark:text-[#DFDDD7] block">
                  Load Sample Data
                </span>
                <span className="text-[11px] text-[#7C7A75] dark:text-[#8E8C85]">
                  Seed a few example check-ins to preview trends immediately
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  Haptics.success();
                  onSeedSampleData();
                }}
                className="text-xs font-medium text-[#1E1E1C] dark:text-[#EDEDEB] underline cursor-pointer"
              >
                Load Sample
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 7. DANGER ZONE: DELETE ALL DATA */}
      <section className="p-5 sm:p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h2 className="font-serif text-lg font-medium text-rose-950 dark:text-rose-200">
              Clear All Journal Data
            </h2>
          </div>

          <button
            type="button"
            id="delete-all-btn"
            onClick={() => setShowDeleteAllModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Clear Data
          </button>
        </div>

        <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
          Permanently delete all emotional check-ins, reflection answers, and reset the app. This operation cannot be undone.
        </p>

        {/* Delete Confirmation Modal */}
        {showDeleteAllModal && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#181816] border border-rose-300 dark:border-rose-800 space-y-3 mt-3">
            <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">Are you completely sure?</p>
                <p className="text-rose-600 dark:text-rose-400">
                  This will erase {entriesCount} check-in entries and {reflectionsCount} reflections forever.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#52504A] dark:text-[#A6A49D]">
              Type <strong className="font-mono text-rose-600">DELETE</strong> to confirm:
            </p>

            <input
              type="text"
              value={deleteConfirmationWord}
              onChange={(e) => setDeleteConfirmationWord(e.target.value)}
              placeholder="DELETE"
              className="text-xs uppercase tracking-wider p-2 w-full rounded-xl bg-[#FAF9F5] dark:bg-[#20201D] border border-rose-300 dark:border-rose-800 text-[#1E1E1C] dark:text-[#EDEDEB]"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAllModal(false);
                  setDeleteConfirmationWord('');
                }}
                className="px-3 py-1.5 text-xs text-[#6F6D67] hover:text-[#1E1E1C] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationWord.toUpperCase() !== 'DELETE'}
                onClick={handleConfirmDeleteAll}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  deleteConfirmationWord.toUpperCase() === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-rose-200 text-rose-400 dark:bg-rose-950 dark:text-rose-800 cursor-not-allowed'
                }`}
              >
                Permanently Erase Everything
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 8. PRIVACY & SAFETY STATEMENT */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[#FAF9F5] dark:bg-[#161614] border border-[#EAE8E1] dark:border-[#22221F] space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="font-serif text-lg font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Privacy & Trust Architecture
          </h2>
        </div>

        <ul className="text-xs text-[#52504A] dark:text-[#A6A49D] space-y-1.5 list-disc pl-4 leading-relaxed">
          <li><strong>Zero Cloud Transmissions:</strong> All journal entries and reflections are stored locally on your device in your browser's private sandbox.</li>
          <li><strong>No AI or LLM Analytics:</strong> No models read, summarize, or analyze your emotional text. Trends are calculated purely with deterministic math.</li>
          <li><strong>Completely Free Forever:</strong> No subscriptions, premium plans, paywalls, or gated features.</li>
          <li><strong>Non-Judgmental:</strong> Emotions are valid signals, never categorized as good or bad.</li>
        </ul>

        {onOpenPrivacy && (
          <div className="pt-2">
            <button
              type="button"
              id="settings-read-privacy-policy-btn"
              onClick={() => {
                Haptics.selection();
                onOpenPrivacy();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E1E1C] dark:text-[#EDEDEB] hover:underline cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Read Full Privacy Policy (/privacy) →</span>
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-[#EAE8E1] dark:border-[#22221F] text-[11px] text-[#7C7A75] dark:text-[#8E8C85] leading-relaxed">
          <strong>Medical Disclaimer:</strong> SoulNote is an emotional self-reflection tool. It does not diagnose, treat, or evaluate medical or psychiatric conditions, and is not a substitute for professional mental health therapy.
        </div>
      </section>

      {/* 9. ABOUT */}
      <div className="text-center pt-2 text-xs text-[#8E8C85] dark:text-[#64635E] space-y-1">
        <p className="font-serif font-medium text-sm text-[#52504A] dark:text-[#A6A49D]">
          SoulNote • Version 1.0.0
        </p>
        <p className="text-[11px]">
          “Make emotional self-awareness easier than ignoring how you feel.”
        </p>
      </div>
    </div>
  );
};
