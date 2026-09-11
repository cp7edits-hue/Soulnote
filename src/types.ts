export type PrimaryEmotion =
  | 'Happy'
  | 'Calm'
  | 'Excited'
  | 'Grateful'
  | 'Sad'
  | 'Angry'
  | 'Anxious'
  | 'Lonely'
  | 'Stressed'
  | 'Tired'
  | 'Confused'
  | 'Neutral';

export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

export type ContextTag =
  | 'School / Work'
  | 'Relationships'
  | 'Family'
  | 'Social'
  | 'Health'
  | 'Money'
  | 'Personal'
  | 'Other';

export interface EmotionEntry {
  id: string;
  createdAt: number; // timestamp in ms
  updatedAt: number; // timestamp in ms
  dateKey: string; // YYYY-MM-DD
  emotion: PrimaryEmotion;
  intensity: IntensityLevel;
  tags: ContextTag[];
  note?: string;
}

export interface ReflectionEntry {
  id: string;
  createdAt: number;
  updatedAt: number;
  dateKey: string;
  prompt: string;
  content: string;
}

export interface UserSettings {
  theme: 'system' | 'light' | 'dark';
  hapticsEnabled: boolean;
  remindersEnabled: boolean;
  reminderTime: string; // "HH:MM" 24h format e.g. "20:00"
  hasSeenOnboarding: boolean;
  hasSeenIntro: boolean;
  appLockEnabled: boolean;
  appLockPin: string; // 4-digit PIN if enabled
  useBiometricsIfAvailable: boolean;
  hasSeenStorageNotice?: boolean;
}

export type NavigationTab = 'home' | 'timeline' | 'trends' | 'reflection' | 'settings' | 'privacy';
