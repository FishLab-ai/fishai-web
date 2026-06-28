'use client';

import { Globe, Check } from 'lucide-react';
import { useI18n, type Locale } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LOCALE_OPTIONS: { key: Locale; label: string }[] = [
  { key: 'zh-CN', label: '简体中文' },
  { key: 'zh-TW', label: '繁體中文' },
  { key: 'en-US', label: 'English' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const currentLabel = LOCALE_OPTIONS.find((o) => o.key === locale)?.label ?? locale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
        >
          <Globe className="w-3 h-3" />
          <span>{currentLabel}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-36">
        {LOCALE_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.key}
            onClick={() => setLocale(opt.key)}
            className="cursor-pointer"
          >
            <span className="flex-1">{opt.label}</span>
            {locale === opt.key && <Check className="w-3.5 h-3.5 text-emerald-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}