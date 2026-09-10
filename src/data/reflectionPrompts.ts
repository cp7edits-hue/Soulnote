export interface ReflectionPromptCategory {
  id: string;
  name: string;
  prompts: string[];
}

export const CURATED_REFLECTION_PROMPTS: string[] = [
  'What emotion appeared most often this week?',
  'What moment stands out from this week?',
  'What seemed different on the days you felt calmer?',
  'What was difficult this week, and how did you carry it?',
  'What are you grateful for right now, however small?',
  'What do you want to remember about this period?',
  'Where did you feel most like yourself lately?',
  'What was something unexpected that shifted how you felt today?',
  'What is a quiet victory you haven’t celebrated yet?',
  'What boundary protected your peace of mind recently?',
  'What thought have you been holding on to that might be ready to soften?',
  'What does your body need right now that your mind might be postponing?',
];

export const PROMPT_CATEGORIES: ReflectionPromptCategory[] = [
  {
    id: 'weekly',
    name: 'Weekly Review',
    prompts: [
      'What emotion appeared most often this week?',
      'What moment stands out from this week?',
      'What seemed different on the days you felt calmer?',
      'What was difficult this week, and how did you carry it?',
    ],
  },
  {
    id: 'gratitude',
    name: 'Gratitude & Ease',
    prompts: [
      'What are you grateful for right now, however small?',
      'What gave you an unexpected pocket of relief today?',
      'What is a simple comfort you enjoyed today?',
    ],
  },
  {
    id: 'perspective',
    name: 'Deeper Perspective',
    prompts: [
      'What do you want to remember about this period of your life?',
      'What boundary protected your peace of mind recently?',
      'Where did you feel most like yourself lately?',
      'What thought have you been holding on to that might be ready to soften?',
    ],
  },
];
