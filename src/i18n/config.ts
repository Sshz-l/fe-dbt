export const locales = ['en', 'zh', 'tw', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  tw: '繁体中文',
  ko: '한국어',
};

// 从messages目录导入语言包
export { messages } from '.';

