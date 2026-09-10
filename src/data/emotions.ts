import { PrimaryEmotion, ContextTag, IntensityLevel } from '../types';

export interface EmotionMeta {
  name: PrimaryEmotion;
  tagline: string;
  // Subtle soft tint for badges/markers (calm, low-saturation tones)
  bgLight: string;
  textLight: string;
  borderLight: string;
  bgDark: string;
  textDark: string;
  borderDark: string;
  // Accessibility icon identifier or symbol
  symbol: string;
}

export const EMOTIONS_LIST: EmotionMeta[] = [
  {
    name: 'Calm',
    tagline: 'Settled, steady, centered',
    bgLight: 'bg-emerald-50/80',
    textLight: 'text-emerald-800',
    borderLight: 'border-emerald-200/80',
    bgDark: 'dark:bg-emerald-950/40',
    textDark: 'dark:text-emerald-200',
    borderDark: 'dark:border-emerald-800/50',
    symbol: '○',
  },
  {
    name: 'Happy',
    tagline: 'Warm, pleased, content',
    bgLight: 'bg-amber-50/80',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-200/80',
    bgDark: 'dark:bg-amber-950/40',
    textDark: 'dark:text-amber-200',
    borderDark: 'dark:border-amber-800/50',
    symbol: '△',
  },
  {
    name: 'Excited',
    tagline: 'Energized, enthusiastic',
    bgLight: 'bg-orange-50/80',
    textLight: 'text-orange-800',
    borderLight: 'border-orange-200/80',
    bgDark: 'dark:bg-orange-950/40',
    textDark: 'dark:text-orange-200',
    borderDark: 'dark:border-orange-800/50',
    symbol: '▲',
  },
  {
    name: 'Grateful',
    tagline: 'Appreciative, touched',
    bgLight: 'bg-teal-50/80',
    textLight: 'text-teal-800',
    borderLight: 'border-teal-200/80',
    bgDark: 'dark:bg-teal-950/40',
    textDark: 'dark:text-teal-200',
    borderDark: 'dark:border-teal-800/50',
    symbol: '◇',
  },
  {
    name: 'Neutral',
    tagline: 'Even, in-between, quiet',
    bgLight: 'bg-stone-100/80',
    textLight: 'text-stone-800',
    borderLight: 'border-stone-200/80',
    bgDark: 'dark:bg-stone-900/50',
    textDark: 'dark:text-stone-300',
    borderDark: 'dark:border-stone-800/50',
    symbol: '—',
  },
  {
    name: 'Tired',
    tagline: 'Drained, needing rest',
    bgLight: 'bg-slate-100/80',
    textLight: 'text-slate-800',
    borderLight: 'border-slate-200/80',
    bgDark: 'dark:bg-slate-900/50',
    textDark: 'dark:text-slate-300',
    borderDark: 'dark:border-slate-800/50',
    symbol: '▿',
  },
  {
    name: 'Confused',
    tagline: 'Unsure, pondering',
    bgLight: 'bg-indigo-50/80',
    textLight: 'text-indigo-800',
    borderLight: 'border-indigo-200/80',
    bgDark: 'dark:bg-indigo-950/40',
    textDark: 'dark:text-indigo-200',
    borderDark: 'dark:border-indigo-800/50',
    symbol: '?',
  },
  {
    name: 'Sad',
    tagline: 'Heavy, grieving, tender',
    bgLight: 'bg-sky-50/80',
    textLight: 'text-sky-800',
    borderLight: 'border-sky-200/80',
    bgDark: 'dark:bg-sky-950/40',
    textDark: 'dark:text-sky-200',
    borderDark: 'dark:border-sky-800/50',
    symbol: '▽',
  },
  {
    name: 'Stressed',
    tagline: 'Pressured, overwhelmed',
    bgLight: 'bg-rose-50/80',
    textLight: 'text-rose-800',
    borderLight: 'border-rose-200/80',
    bgDark: 'dark:bg-rose-950/40',
    textDark: 'dark:text-rose-200',
    borderDark: 'dark:border-rose-800/50',
    symbol: '∿',
  },
  {
    name: 'Anxious',
    tagline: 'Uneasy, anticipatory',
    bgLight: 'bg-violet-50/80',
    textLight: 'text-violet-800',
    borderLight: 'border-violet-200/80',
    bgDark: 'dark:bg-violet-950/40',
    textDark: 'dark:text-violet-200',
    borderDark: 'dark:border-violet-800/50',
    symbol: '〰',
  },
  {
    name: 'Lonely',
    tagline: 'Disconnected, longing',
    bgLight: 'bg-blue-50/80',
    textLight: 'text-blue-800',
    borderLight: 'border-blue-200/80',
    bgDark: 'dark:bg-blue-950/40',
    textDark: 'dark:text-blue-200',
    borderDark: 'dark:border-blue-800/50',
    symbol: '·',
  },
  {
    name: 'Angry',
    tagline: 'Frustrated, irritated',
    bgLight: 'bg-red-50/80',
    textLight: 'text-red-800',
    borderLight: 'border-red-200/80',
    bgDark: 'dark:bg-red-950/40',
    textDark: 'dark:text-red-200',
    borderDark: 'dark:border-red-800/50',
    symbol: '✕',
  },
];

export const INTENSITY_LABELS: Record<IntensityLevel, { label: string; desc: string }> = {
  1: { label: '1 — Very Low', desc: 'Faint whisper, barely noticeable' },
  2: { label: '2 — Low', desc: 'Gentle presence in the background' },
  3: { label: '3 — Moderate', desc: 'Clear, noticeable feeling' },
  4: { label: '4 — High', desc: 'Strong, commanding your attention' },
  5: { label: '5 — Very High', desc: 'All-consuming, intense' },
};

export const CONTEXT_TAGS: ContextTag[] = [
  'School / Work',
  'Relationships',
  'Family',
  'Social',
  'Health',
  'Money',
  'Personal',
  'Other',
];

export function getEmotionMeta(emotionName: PrimaryEmotion): EmotionMeta {
  const found = EMOTIONS_LIST.find((e) => e.name === emotionName);
  if (found) return found;
  return EMOTIONS_LIST[0];
}
