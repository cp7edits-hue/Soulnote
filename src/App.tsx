import React, { useState, useEffect } from 'react';
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
import { NotificationService } from './services/notifications';
import { SplashIntro } from './components/SplashIntro';
import { OnboardingModal } from './components/OnboardingModal';
import { PinLockModal } from './components/PinLockModal';
import { Navbar } from './components/Navbar';
import { CheckInModal } from './components/CheckInModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { HomeView } from './views/HomeView';
import { TimelineView } from './views/TimelineView';
import { TrendsView } from './views/TrendsView';
import { ReflectionView } from './views/ReflectionView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [entries, setEntries] = useState<EmotionEntry[]>(() => StorageService.getEntries());
  const [reflections, setReflections] = useState<ReflectionEntry[]>(() => StorageService.getReflections());
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
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

  // Theme Sync with HTML document element
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (settings.theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [settings.theme]);

  // Notifications scheduler
  useEffect(() => {
    if (settings.remindersEnabled) {
      NotificationService.startScheduler();
    } else {
      NotificationService.stopScheduler();
    }
    return () => NotificationService.stopScheduler();
  }, [settings.remindersEnabled, settings.reminderTime]);

  // Update Settings
  const handleUpdateSettings = (updates: Partial<UserSettings>) => {
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
    } else {
      StorageService.addEntry(data);
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
      {/* Navigation Header / Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCheckIn={() => {
          setEditingEntry(null);
          setIsCheckInOpen(true);
        }}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12">
        {currentTab === 'home' && (
          <HomeView
            entries={entries}
            onOpenCheckIn={() => {
              setEditingEntry(null);
              setIsCheckInOpen(true);
            }}
            onSelectEntry={(entry) => setViewingEntry(entry)}
            onNavigate={setCurrentTab}
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
            onUpdateSettings={handleUpdateSettings}
            onResetAllData={handleResetAllData}
            onResetPreferences={handleResetPreferences}
            onReplayIntro={() => setShowIntro(true)}
            onSeedSampleData={handleSeedSampleData}
            entriesCount={entries.length}
            reflectionsCount={reflections.length}
          />
        )}
      </main>

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
