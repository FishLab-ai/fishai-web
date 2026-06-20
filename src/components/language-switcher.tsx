'use client';

import { Globe } from 'lucide-react';
import { useI18n, type Locale } from '@/lib/i18n';

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'EN' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const handleToggle = () => {
    const next = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(next);
  };

  const current = LOCALE_OPTIONS.find((o) => o.value === locale);

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
      title={current?.label}
    >
      <Globe className="w-3 h-3" />
      <span>{current?.label}</span>
    </button>
  );
}
