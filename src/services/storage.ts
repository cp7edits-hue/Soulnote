import { EmotionEntry, ReflectionEntry, UserSettings, ContextTag } from '../types';

const STORAGE_KEYS = {
  ENTRIES: 'soulnote_entries_v1',
  REFLECTIONS: 'soulnote_reflections_v1',
  SETTINGS: 'soulnote_settings_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  hapticsEnabled: true,
  remindersEnabled: false,
  reminderTime: '20:00',
  hasSeenOnboarding: false,
  hasSeenIntro: false,
  appLockEnabled: false,
  appLockPin: '',
  useBiometricsIfAvailable: false,
};

export const StorageService = {
  // --- Emotion Entries ---
  getEntries(): EmotionEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to parse entries from localStorage', err);
      return [];
    }
  },

  saveEntries(entries: EmotionEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    } catch (err) {
      console.error('Failed to save entries to localStorage', err);
    }
  },

  addEntry(entry: Omit<EmotionEntry, 'id' | 'createdAt' | 'updatedAt' | 'dateKey'> & { createdAt?: number; dateKey?: string }): EmotionEntry {
    const entries = this.getEntries();
    const now = entry.createdAt || Date.now();
    const dateObj = new Date(now);
    const dateKey = entry.dateKey || `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    const newEntry: EmotionEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      dateKey,
      emotion: entry.emotion,
      intensity: entry.intensity,
      tags: entry.tags || [],
      note: entry.note?.trim() || undefined,
    };

    // Prepend (newest first)
    const updated = [newEntry, ...entries];
    this.saveEntries(updated);
    return newEntry;
  },

  updateEntry(id: string, updates: Partial<Omit<EmotionEntry, 'id' | 'createdAt'>>): EmotionEntry | null {
    const entries = this.getEntries();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const existing = entries[index];
    const updated: EmotionEntry = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    entries[index] = updated;
    this.saveEntries(entries);
    return updated;
  },

  deleteEntry(id: string): boolean {
    const entries = this.getEntries();
    const filtered = entries.filter((e) => e.id !== id);
    if (filtered.length === entries.length) return false;
    this.saveEntries(filtered);
    return true;
  },

  // --- Reflections ---
  getReflections(): ReflectionEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to parse reflections from localStorage', err);
      return [];
    }
  },

  saveReflections(reflections: ReflectionEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
    } catch (err) {
      console.error('Failed to save reflections to localStorage', err);
    }
  },

  addReflection(prompt: string, content: string): ReflectionEntry {
    const reflections = this.getReflections();
    const now = Date.now();
    const dateObj = new Date(now);
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    const newReflection: ReflectionEntry = {
      id: `refl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      dateKey,
      prompt,
      content: content.trim(),
    };

    const updated = [newReflection, ...reflections];
    this.saveReflections(updated);
    return newReflection;
  },

  updateReflection(id: string, content: string): ReflectionEntry | null {
    const reflections = this.getReflections();
    const idx = reflections.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    reflections[idx] = {
      ...reflections[idx],
      content: content.trim(),
      updatedAt: Date.now(),
    };
    this.saveReflections(reflections);
    return reflections[idx];
  },

  deleteReflection(id: string): boolean {
    const reflections = this.getReflections();
    const filtered = reflections.filter((r) => r.id !== id);
    if (filtered.length === reflections.length) return false;
    this.saveReflections(filtered);
    return true;
  },

  // --- User Settings ---
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (err) {
      console.error('Failed to parse settings from localStorage', err);
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings to localStorage', err);
    }
  },

  updateSettings(updates: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.saveSettings(updated);
    return updated;
  },

  // --- Reset & Deletion ---
  resetSettings(): UserSettings {
    this.saveSettings({ ...DEFAULT_SETTINGS });
    return { ...DEFAULT_SETTINGS };
  },

  deleteAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
    // Leave basic display preference or reset to fresh state:
    this.saveSettings({
      ...DEFAULT_SETTINGS,
      hasSeenIntro: true,
      hasSeenOnboarding: true,
    });
  },

  // --- Data Export & Import ---
  exportAllDataJson(): string {
    const entries = this.getEntries();
    const reflections = this.getReflections();
    const settings = this.getSettings();
    const exportObject = {
      app: 'SoulNote',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      entries,
      reflections,
      settings: {
        theme: settings.theme,
        reminderTime: settings.reminderTime,
        remindersEnabled: settings.remindersEnabled,
      },
    };
    return JSON.stringify(exportObject, null, 2);
  },

  exportEntriesCsv(): string {
    const entries = this.getEntries();
    const headers = ['ID', 'Date', 'Time', 'Emotion', 'Intensity', 'Context Tags', 'Note'];
    const rows = entries.map((entry) => {
      const d = new Date(entry.createdAt);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const tagsStr = `"${entry.tags.join('; ')}"`;
      const noteClean = `"${(entry.note || '').replace(/"/g, '""')}"`;
      return [entry.id, dateStr, timeStr, entry.emotion, entry.intensity, tagsStr, noteClean].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  },

  // Seed realistic sample data for quick preview if requested
  seedSampleData(): void {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sampleEntries: EmotionEntry[] = [
      {
        id: `sample_1`,
        createdAt: now - 2 * 3600 * 1000,
        updatedAt: now - 2 * 3600 * 1000,
        dateKey: new Date(now).toISOString().split('T')[0],
        emotion: 'Calm',
        intensity: 3,
        tags: ['Personal', 'Health'],
        note: 'Quiet morning walk in the crisp air before opening the laptop.',
      },
      {
        id: `sample_2`,
        createdAt: now - oneDay - 4 * 3600 * 1000,
        updatedAt: now - oneDay - 4 * 3600 * 1000,
        dateKey: new Date(now - oneDay).toISOString().split('T')[0],
        emotion: 'Stressed',
        intensity: 4,
        tags: ['School / Work'],
        note: 'Multiple overlapping deadlines and unexpected team requests.',
      },
      {
        id: `sample_3`,
        createdAt: now - oneDay - 8 * 3600 * 1000,
        updatedAt: now - oneDay - 8 * 3600 * 1000,
        dateKey: new Date(now - oneDay).toISOString().split('T')[0],
        emotion: 'Grateful',
        intensity: 4,
        tags: ['Relationships', 'Family'],
        note: 'Dinner with Mom. Felt unhurried and supported.',
      },
      {
        id: `sample_4`,
        createdAt: now - 2 * oneDay,
        updatedAt: now - 2 * oneDay,
        dateKey: new Date(now - 2 * oneDay).toISOString().split('T')[0],
        emotion: 'Happy',
        intensity: 4,
        tags: ['Social'],
        note: 'Met with old university friend for coffee after months.',
      },
      {
        id: `sample_5`,
        createdAt: now - 3 * oneDay,
        updatedAt: now - 3 * oneDay,
        dateKey: new Date(now - 3 * oneDay).toISOString().split('T')[0],
        emotion: 'Tired',
        intensity: 3,
        tags: ['Health'],
        note: 'Slept poorly. Taking it gentle today without guilt.',
      },
      {
        id: `sample_6`,
        createdAt: now - 4 * oneDay,
        updatedAt: now - 4 * oneDay,
        dateKey: new Date(now - 4 * oneDay).toISOString().split('T')[0],
        emotion: 'Calm',
        intensity: 4,
        tags: ['Personal'],
        note: 'Reading quietly in the afternoon sunlight.',
      },
      {
        id: `sample_7`,
        createdAt: now - 6 * oneDay,
        updatedAt: now - 6 * oneDay,
        dateKey: new Date(now - 6 * oneDay).toISOString().split('T')[0],
        emotion: 'Anxious',
        intensity: 3,
        tags: ['School / Work', 'Money'],
        note: 'Financial planning meeting coming up.',
      },
    ];

    const sampleReflections: ReflectionEntry[] = [
      {
        id: `sample_refl_1`,
        createdAt: now - oneDay,
        updatedAt: now - oneDay,
        dateKey: new Date(now - oneDay).toISOString().split('T')[0],
        prompt: 'What seemed different on the days you felt calmer?',
        content: 'I noticed calm days always began without checking social media in bed, and usually had at least 20 minutes outdoors before starting work.',
      },
    ];

    this.saveEntries(sampleEntries);
    this.saveReflections(sampleReflections);
  },
};
