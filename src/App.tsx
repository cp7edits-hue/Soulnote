import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  EmotionEntry,
  ReflectionEntry,
  UserSettings,
  NavigationTab,
  PrimaryEmotion,
  IntensityLevel,
  ContextTag,
} from './types';
import { StorageService } from './services/storage';
import { ThemeService } from './services/theme';
import { SplashIntro } from './components/SplashIntro';
import { OnboardingModal } from './components/OnboardingModal';
import { PinLockModal } from './components/PinLockModal';
import { Navbar } from './components/Navbar';
import { CheckInModal } from './components/CheckInModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { StorageNoticeBanner } from './components/StorageNoticeBanner';
import { Toast } from './components/Toast';
import { HomeView } from './views/HomeView';
import { TimelineView } from './views/TimelineView';
import { TrendsView } from './views/TrendsView';
import { ReflectionView } from './views/ReflectionView';
import { SettingsView } from './views/SettingsView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { Footer } from './components/Footer';
import { downloadJsonExport } from './services/export';

export default function App() {
  const [entries, setEntries] = useState<EmotionEntry[]>(() => StorageService.getEntries());
  const [reflections, setReflections] = useState<ReflectionEntry[]>(() => StorageService.getReflections());
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  
  // URL routing support for /privacy
  const [currentTab, setCurrentTab] = useState<NavigationTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/privacy' || hash === '#/privacy' || hash === '#privacy') {
        return 'privacy';
      }
    }
    return 'home';
  });
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<EmotionEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<EmotionEntry | null>(null);

  // Intro & Onboarding state
  const [showIntro, setShowIntro] = useState<boolean>(() => !settings.hasSeenIntro);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !settings.hasSeenOnboarding);

  // App Lock PIN state
  const [isLocked, setIsLocked] = useState<boolean>(() => settings.appLockEnabled && Boolean(settings.appLockPin));

  // Forwarding prompt from Home to Reflection
  const [activeReflectionPrompt, setActiveReflectionPrompt] = useState<string | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => ThemeService.isDark());

  // One-time dismissible storage notice banner for privacy & backup
  const [showStorageNotice, setShowStorageNotice] = useState<boolean>(() => {
    return !StorageService.hasSeenStorageNotice() && StorageService.getEntries().length > 0;
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    handleUpdateSettings({ theme: nextTheme });
    setIsDarkMode(!isDarkMode);
  };

  const handleDismissStorageNotice = () => {
    StorageService.setSeenStorageNotice();
    setShowStorageNotice(false);
  };

  // Sync browser back/forward buttons with /privacy route
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/privacy' || hash === '#/privacy' || hash === '#privacy') {
        setCurrentTab('privacy');
      } else {
        setCurrentTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (tab: NavigationTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      if (tab === 'privacy') {
        if (window.location.pathname !== '/privacy') {
          window.history.pushState({}, '', '/privacy');
        }
      } else {
        if (window.location.pathname === '/privacy') {
          window.history.pushState({}, '', '/');
        }
      }
    }
  };

  // Theme Sync with HTML document element
  useEffect(() => {
    ThemeService.applyTheme(settings.theme);
  }, [settings.theme]);

  // Update Settings
  const handleUpdateSettings = (updates: Partial<UserSettings>) => {
    if (updates.theme) {
      ThemeService.applyTheme(updates.theme);
    }
    const updated = StorageService.updateSettings(updates);
    setSettings(updated);
  };

  // Intro Finished
  const handleFinishIntro = () => {
    setShowIntro(false);
    handleUpdateSettings({ hasSeenIntro: true });
  };

  // Onboarding Finished
  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
    handleUpdateSettings({ hasSeenOnboarding: true });
  };

  // Check-In Save (Create or Update)
  const handleSaveCheckIn = (data: {
    emotion: PrimaryEmotion;
    intensity: IntensityLevel;
    tags: ContextTag[];
    note?: string;
  }) => {
    if (editingEntry) {
      StorageService.updateEntry(editingEntry.id, data);
      setEditingEntry(null);
      setToastMessage('Entry saved.');
    } else {
      StorageService.addEntry(data);
      setToastMessage('Entry saved.');
      if (!StorageService.hasSeenStorageNotice()) {
        setShowStorageNotice(true);
      }
    }
    setEntries(StorageService.getEntries());
  };

  // Entry Delete
  const handleDeleteEntry = (id: string) => {
    StorageService.deleteEntry(id);
    setEntries(StorageService.getEntries());
    if (viewingEntry?.id === id) {
      setViewingEntry(null);
    }
  };

  // Reflection handlers
  const handleSaveReflection = (prompt: string, content: string) => {
    StorageService.addReflection(prompt, content);
    setReflections(StorageService.getReflections());
  };

  const handleUpdateReflection = (id: string, content: string) => {
    StorageService.updateReflection(id, content);
    setReflections(StorageService.getReflections());
  };

  const handleDeleteReflection = (id: string) => {
    StorageService.deleteReflection(id);
    setReflections(StorageService.getReflections());
  };

  // Clear all data
  const handleResetAllData = () => {
    StorageService.deleteAllData();
    setEntries([]);
    setReflections([]);
    setSettings(StorageService.getSettings());
  };

  // Reset preferences
  const handleResetPreferences = () => {
    const reset = StorageService.resetSettings();
    setSettings(reset);
  };

  // Seed sample data
  const handleSeedSampleData = () => {
    StorageService.seedSampleData();
    setEntries(StorageService.getEntries());
    setReflections(StorageService.getReflections());
  };

  // If locked, render PIN Screen
  if (isLocked) {
    return (
      <PinLockModal
        correctPin={settings.appLockPin}
        useBiometrics={settings.useBiometricsIfAvailable}
        onUnlocked={() => setIsLocked(false)}
      />
    );
  }

  // If initial intro animation should be shown
  if (showIntro) {
    return <SplashIntro onFinish={handleFinishIntro} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] dark:bg-[#121211] text-[#1E1E1C] dark:text-[#EDEDEB] transition-colors duration-200">
      {/* Navigation Header / Bar with Dark Mode Toggle */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenCheckIn={() => {
          setEditingEntry(null);
          setIsCheckInOpen(true);
        }}
        isDark={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12">
        {/* One-time Storage Notice Banner for Local Privacy & Backup Reminder */}
        <AnimatePresence>
          {showStorageNotice && (
            <StorageNoticeBanner
              onDismiss={handleDismissStorageNotice}
              onExportJson={() => downloadJsonExport(entries, reflections)}
            />
          )}
        </AnimatePresence>

        {/* Animated Page Transitions between Views */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {currentTab === 'home' && (
              <HomeView
                entries={entries}
                onOpenCheckIn={() => {
                  setEditingEntry(null);
                  setIsCheckInOpen(true);
                }}
                onSelectEntry={(entry) => setViewingEntry(entry)}
                onNavigate={handleNavigate}
                onSelectReflectionPrompt={(prompt) => {
                  setActiveReflectionPrompt(prompt);
                }}
              />
            )}

            {currentTab === 'timeline' && (
              <TimelineView
                entries={entries}
                onOpenCheckIn={() => {
                  setEditingEntry(null);
                  setIsCheckInOpen(true);
                }}
                onSelectEntry={(entry) => setViewingEntry(entry)}
              />
            )}

            {currentTab === 'trends' && (
              <TrendsView
                entries={entries}
                onOpenCheckIn={() => {
                  setEditingEntry(null);
                  setIsCheckInOpen(true);
                }}
              />
            )}

            {currentTab === 'reflection' && (
              <ReflectionView
                reflections={reflections}
                initialPrompt={activeReflectionPrompt}
                onSaveReflection={handleSaveReflection}
                onUpdateReflection={handleUpdateReflection}
                onDeleteReflection={handleDeleteReflection}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                settings={settings}
                entries={entries}
                reflections={reflections}
                onUpdateSettings={handleUpdateSettings}
                onResetAllData={handleResetAllData}
                onResetPreferences={handleResetPreferences}
                onReplayIntro={() => setShowIntro(true)}
                onSeedSampleData={handleSeedSampleData}
                onOpenPrivacy={() => handleNavigate('privacy')}
                entriesCount={entries.length}
                reflectionsCount={reflections.length}
              />
            )}

            {currentTab === 'privacy' && (
              <PrivacyPolicyView
                onBack={() => handleNavigate('home')}
                onExportJson={() => downloadJsonExport(entries, reflections)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Site Footer with Privacy Policy & Export Entries links */}
      <Footer
        onOpenPrivacy={() => handleNavigate('privacy')}
        onExportJson={() => downloadJsonExport(entries, reflections)}
      />

      {/* Lightweight Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Quick Check-in Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => {
          setIsCheckInOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveCheckIn}
        initialData={editingEntry}
      />

      {/* Entry Detail & Edit/Delete Modal */}
      <EntryDetailModal
        entry={viewingEntry}
        onClose={() => setViewingEntry(null)}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setIsCheckInOpen(true);
        }}
        onDelete={handleDeleteEntry}
      />

      {/* Onboarding Modal for First Time Users (if intro finished and hasn't seen onboarding) */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleFinishOnboarding}
          onStartFirstCheckin={() => {
            setEditingEntry(null);
            setIsCheckInOpen(true);
          }}
        />
      )}
    </div>
  );
}
