---
Task ID: 5
Agent: main
Task: Add complete i18n (internationalization) to fishai-web

Work Log:
- Created i18n infrastructure: src/lib/i18n/locales/zh-CN.ts, src/lib/i18n/locales/en-US.ts, src/lib/i18n/context.tsx, src/lib/i18n/index.ts
- I18nProvider wraps entire app in layout.tsx
- Created LanguageSwitcher component (src/components/language-switcher.tsx)
- Updated ALL 11 component files to use useI18n() hook:
  - src/app/page.tsx (home page + LanguageSwitcher)
  - src/app/chat/page.tsx (chat page + LanguageSwitcher in header)
  - src/app/docs/page.tsx (full docs i18n - largest change, 1314 lines)
  - src/components/sidebar.tsx
  - src/components/chat-input.tsx
  - src/components/chat-message.tsx
  - src/components/settings-dialog.tsx
  - src/components/auth-dialog.tsx
  - src/components/user-profile-dialog.tsx
  - src/components/cookie-consent.tsx
  - src/lib/markdown.tsx
- Fixed strict TypeScript issues: noUncheckedIndexedAccess in markdown.tsx, user-profile-dialog.tsx, page.tsx, docs/page.tsx
- Fixed tsconfig.json to exclude fishai-server, fishai-ai dirs from root project
- Fixed next.config.ts for noPropertyAccessFromIndexSignature

Stage Summary:
- ✅ 0 errors, 0 warnings (ESLint)
- ✅ 8 tests passing
- ✅ Build successful (next build)
- ✅ Full zh-CN and en-US translations for ~300+ strings
- ✅ Language switcher on home page and chat header
- ✅ Locale persisted to localStorage, auto-detects browser language
- ✅ Dynamic html lang attribute updates
