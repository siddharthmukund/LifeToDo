export const LOCALE_METADATA = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr', script: 'Latn', timezone: 'America/New_York', currency: 'USD' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', script: 'Deva', timezone: 'Asia/Kolkata', currency: 'INR' },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr', script: 'Latn', timezone: 'Europe/Madrid', currency: 'EUR' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl', script: 'Arab', timezone: 'Asia/Riyadh', currency: 'SAR' },
  'pt-BR': { name: 'Portuguese', nativeName: 'Português', dir: 'ltr', script: 'Latn', timezone: 'America/Sao_Paulo', currency: 'BRL' },
  de: { name: 'German', nativeName: 'Deutsch', dir: 'ltr', script: 'Latn', timezone: 'Europe/Berlin', currency: 'EUR' },
  ja: { name: 'Japanese', nativeName: '日本語', dir: 'ltr', script: 'Jpan', timezone: 'Asia/Tokyo', currency: 'JPY' },
  'zh-CN': { name: 'Chinese', nativeName: '中文', dir: 'ltr', script: 'Hans', timezone: 'Asia/Shanghai', currency: 'CNY' },
} as const;

export const i18nConfig = {
  defaultLocale: 'en' as const,
  locales: ['en', 'hi', 'es', 'ar', 'pt-BR', 'de', 'ja', 'zh-CN'] as const,

  localeMetadata: LOCALE_METADATA,

  calendar: {
    en: { weekStart: 0, weekend: [0, 6] },
    hi: { weekStart: 0, weekend: [0] },
    es: { weekStart: 1, weekend: [5, 6] },
    ar: { weekStart: 6, weekend: [4, 5] },
    'pt-BR': { weekStart: 0, weekend: [0, 6] },
    de: { weekStart: 1, weekend: [5, 6] },
    ja: { weekStart: 1, weekend: [5, 6] },
    'zh-CN': { weekStart: 1, weekend: [5, 6] },
  },

  fallback: {
    'pt-BR': ['pt', 'en'],
    'zh-CN': ['zh', 'en'],
    default: ['en'],
  },

  namespaces: [
    'common', 'navigation', 'inbox', 'clarify', 'engage', 'review', 'projects',
    'settings', 'auth', 'profile', 'gamification', 'ai', 'push',
    'a11y', 'errors', 'onboarding', 'billing',
  ] as const,
} as const;

export type Locale = (typeof i18nConfig.locales)[number];
export type Namespace = typeof i18nConfig.namespaces[number];
export type Direction = 'ltr' | 'rtl';
export type LocaleMetadataConfig = typeof LOCALE_METADATA;
