'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Rocket,
  Code2,
  Cpu,
  Server,
  Zap,
  HelpCircle,
  ChevronRight,
  Menu,
  X as _X,
  ArrowLeft,
  ScrollText,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { AuthDialog } from '@/components/auth-dialog';
import { useI18n, type Translations } from '@/lib/i18n';

// ── Helpers ──
function getClassByColor(color: string, base: string): string {
  if (color === 'emerald') {
    return `${base} bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30`;
  }
  if (color === 'amber') {
    return `${base} bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30`;
  }
  return `${base} bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30`;
}

function getTextClassByColor(color: string, base: string): string {
  if (color === 'emerald') {
    return `${base} text-emerald-600 dark:text-emerald-400`;
  }
  if (color === 'amber') {
    return `${base} text-amber-600 dark:text-amber-400`;
  }
  return `${base} text-red-600 dark:text-red-400`;
}

// ── Doc Section Type ──
interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: DocSection[];
}

// ── Sidebar Component ──
function Sidebar({
  activeId,
  onNavigate,
  className,
  docNav,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
  className?: string;
  docNav: DocSection[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    api: true,
    architecture: true,
    usage: true,
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNav = (items: DocSection[], depth = 0) =>
    items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isActive = activeId === item.id;
      const isExpanded = expanded[item.id];

      return (
        <div key={item.id}>
          <button
            onClick={() => {
              if (hasChildren) {
                toggleExpand(item.id);
              }
              onNavigate(item.id);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
              depth > 0 ? 'pl-8' : ''
            } ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {depth === 0 && <item.icon className="w-4 h-4 shrink-0 opacity-70" />}
            <span className="flex-1 text-sm truncate">{item.title}</span>
            {hasChildren && (
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 text-neutral-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            )}
          </button>
          {hasChildren && isExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {renderNav(item.children as DocSection[], depth + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <nav className={`space-y-1 ${className || ''}`}>
      {renderNav(docNav)}
    </nav>
  );
}

// ── Content Sections ──
/* eslint-disable max-lines-per-function */
function GettingStarted({ t }: { t: Translations }) {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.gettingStarted.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.gettingStarted.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.gettingStarted.whatIsTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.gettingStarted.whatIsContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.gettingStarted.techStackTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: t.docs.gettingStarted.techStackItems.engine, value: 'Rust (candle-llama)' },
            { label: t.docs.gettingStarted.techStackItems.framework, value: 'Next.js 16 + TypeScript' },
            { label: t.docs.gettingStarted.techStackItems.styling, value: 'Tailwind CSS 4 + shadcn/ui' },
            { label: t.docs.gettingStarted.techStackItems.stateManagement, value: 'Zustand 5' },
            { label: t.docs.gettingStarted.techStackItems.database, value: 'Prisma + SQLite' },
            { label: t.docs.gettingStarted.techStackItems.modelFormat, value: 'GGUF 4-bit 量化 (~12MB)' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/40"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-16 shrink-0">
                {item.label}
              </span>
              <span className="text-sm text-neutral-700 dark:text-neutral-300 font-mono">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.gettingStarted.threeStepsTitle}
        </h2>
        <div className="space-y-3">
          {[
            {
              step: 1,
              title: t.docs.gettingStarted.steps.step1Title,
              desc: t.docs.gettingStarted.steps.step1Desc,
            },
            {
              step: 2,
              title: t.docs.gettingStarted.steps.step2Title,
              desc: t.docs.gettingStarted.steps.step2Desc,
            },
            {
              step: 3,
              title: t.docs.gettingStarted.steps.step3Title,
              desc: t.docs.gettingStarted.steps.step3Desc,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800/30 border border-neutral-200/60 dark:border-neutral-700/40"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push('/chat')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
        >
          {t.docs.gettingStarted.startChatBtn}
        </button>
        <a
          href="#api"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('api')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold transition-colors"
        >
          {t.docs.gettingStarted.viewApiDocsBtn}
        </a>
      </div>
    </div>
  );
}

/* eslint-disable max-lines-per-function */
function ApiChat({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.apiChat.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.apiChat.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.apiChat.requestFormatTitle}
        </h2>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-emerald-400 font-mono leading-relaxed">{`POST /api/chat
Content-Type: application/json

{
  "message": "...",
  "conversationId": "...",
  "userId": "...",
  "deepThinking": false,
  "webSearch": false
}`}</pre>
        </div>
        <div className="space-y-2">
          {[
            { name: 'message', type: 'string', required: true, desc: t.docs.apiChat.paramNames.message },
            { name: 'conversationId', type: 'string', required: false, desc: t.docs.apiChat.paramNames.conversationId },
            { name: 'userId', type: 'string', required: false, desc: t.docs.apiChat.paramNames.userId },
            { name: 'deepThinking', type: 'boolean', required: false, desc: t.docs.apiChat.paramNames.deepThinking },
            { name: 'webSearch', type: 'boolean', required: false, desc: t.docs.apiChat.paramNames.webSearch },
          ].map((p) => (
            <div key={p.name} className="flex items-start gap-3 text-sm">
              <code className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-mono text-xs shrink-0">
                {p.name}
              </code>
              <span className="text-neutral-400 text-xs shrink-0 w-16">
                {p.type}
                {p.required && <span className="text-red-500 ml-0.5">*</span>}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">{p.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.apiChat.responseFormatTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.apiChat.responseIntro}
        </p>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-emerald-400 font-mono leading-relaxed">{`// webSearch=true only
data: {"type": "search", "content": "..."}

// deepThinking=true only
data: {"type": "thinking", "content": "..."}

// content chunks
data: {"type": "content", "content": "..."}

// done
data: {"type": "done", "conversationId": "conv_xxx"}`}</pre>
        </div>

        <div className="space-y-2">
          {[
            { type: 'search', desc: t.docs.apiChat.eventTypes.searchDesc },
            { type: 'thinking', desc: t.docs.apiChat.eventTypes.thinkingDesc },
            { type: 'content', desc: t.docs.apiChat.eventTypes.contentDesc },
            { type: 'done', desc: t.docs.apiChat.eventTypes.doneDesc },
          ].map((e) => (
            <div key={e.type} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40">
              <code className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {e.type}
              </code>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                {e.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.apiChat.errorHandlingTitle}
        </h2>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-red-400 font-mono leading-relaxed">{`// Request error returns JSON
{
  "error": "..."
}

// HTTP status codes
400 - Bad Request
500 - Internal Server Error`}</pre>
        </div>
      </section>
    </div>
  );
}

function ApiAuth({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.apiAuth.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.apiAuth.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.apiAuth.registerTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.apiAuth.registerDesc}
        </p>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-emerald-400 font-mono leading-relaxed">{`// Request
POST /api/auth/register
{ "email": "user@example.com", "password": "xxx", "name": "..." }

// Success response
{ "id": "usr_xxx", "email": "user@example.com", "name": "..." }

// Error response
{ "error": "..." }`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.apiAuth.loginTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.apiAuth.loginDesc}
        </p>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-emerald-400 font-mono leading-relaxed">{`// Request
POST /api/auth/login
{ "email": "user@example.com", "password": "xxx" }

// Success response
{ "id": "usr_xxx", "email": "user@example.com", "name": "..." }

// Error response
{ "error": "..." }`}</pre>
        </div>
      </section>
    </div>
  );
}

function ApiConversations({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.apiConversations.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.apiConversations.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.apiConversations.listTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.apiConversations.listDesc}
        </p>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-emerald-400 font-mono leading-relaxed">{`// Request
GET /api/conversations?userId=usr_xxx

// Response
[
  {
    "id": "conv_xxx",
    "title": "...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "_count": { "messages": 4 }
  }
]`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.apiConversations.messagesTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.apiConversations.messagesDesc}
        </p>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-emerald-400 font-mono leading-relaxed">{`// Request
GET /api/conversations/conv_xxx/messages

// Response
[
  {
    "id": "msg_xxx",
    "role": "user",
    "content": "...",
    "thinking": null,
    "searchResults": null,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "msg_yyy",
    "role": "assistant",
    "content": "...",
    "thinking": null,
    "searchResults": null,
    "createdAt": "2025-01-01T00:00:01.000Z"
  }
]`}</pre>
        </div>
      </section>
    </div>
  );
}

function ArchTransformer({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.archTransformer.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.archTransformer.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archTransformer.overallTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archTransformer.overallContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archTransformer.ropeTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archTransformer.ropeContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archTransformer.swigluTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archTransformer.swigluContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archTransformer.rmsnormTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archTransformer.rmsnormContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archTransformer.weightTyingTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archTransformer.weightTyingContent}
        </p>
      </section>
    </div>
  );
}

function ArchLongContext({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.archLongContext.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.archLongContext.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      {/* 16M stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t.docs.archLongContext.stats.contextLength, value: '16M', desc: '16,777,216 Tokens' },
          { label: t.docs.archLongContext.stats.modelSize, value: '~12MB', desc: '4-bit mixed precision' },
          { label: t.docs.archLongContext.stats.ratio, value: '1.4M', desc: 'Tokens per MB' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-emerald-50/30 dark:from-amber-950/10 dark:to-emerald-950/10 border border-amber-200/40 dark:border-amber-800/20 text-center">
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{s.value}</div>
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-1">{s.label}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archLongContext.fishRingTitle}
        </h2>
        <div className="p-3 rounded-lg bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-800/20 text-xs text-amber-700 dark:text-amber-400 mb-2">
          {t.docs.archLongContext.fishRingSource}
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archLongContext.fishRingContent}
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/30 border border-neutral-200/60 dark:border-neutral-700/40">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
              {t.docs.archLongContext.fishRingImprovement1Title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t.docs.archLongContext.fishRingImprovement1Content}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/30 border border-neutral-200/60 dark:border-neutral-700/40">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
              {t.docs.archLongContext.fishRingImprovement2Title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t.docs.archLongContext.fishRingImprovement2Content}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archLongContext.fishScrollTitle}
        </h2>
        <div className="p-3 rounded-lg bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-800/20 text-xs text-amber-700 dark:text-amber-400 mb-2">
          {t.docs.archLongContext.fishScrollSource}
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archLongContext.fishScrollContent.split('Fish-Scroll 的工作机制类似一个智能滚动窗口：')[0]}
        </p>
        <div className="space-y-2">
          {[
            { step: '1', title: t.docs.archLongContext.fishScrollSteps.step1Title, desc: t.docs.archLongContext.fishScrollSteps.step1Desc },
            { step: '2', title: t.docs.archLongContext.fishScrollSteps.step2Title, desc: t.docs.archLongContext.fishScrollSteps.step2Desc },
            { step: '3', title: t.docs.archLongContext.fishScrollSteps.step3Title, desc: t.docs.archLongContext.fishScrollSteps.step3Desc },
            { step: '4', title: t.docs.archLongContext.fishScrollSteps.step4Title, desc: t.docs.archLongContext.fishScrollSteps.step4Desc },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40">
              <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{item.title}</span>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archLongContext.ropeScalingTitle}
        </h2>
        <div className="p-3 rounded-lg bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-800/20 text-xs text-amber-700 dark:text-amber-400 mb-2">
          {t.docs.archLongContext.ropeScalingSource}
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archLongContext.ropeScalingContent.split('FishAI 采用 Dynamic RoPE Scaling')[0]}
        </p>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-emerald-400 font-mono leading-relaxed">{`// Traditional linear scaling (simple, loses precision)
theta_scaled = theta / scaling_factor

// NTK-aware interpolation (adjusts base frequency)
// High-frequency components (nearby positions) barely scaled
// Low-frequency components (far positions) heavily scaled
base_new = base * scaling_factor ^ (dim / (dim - 2))

// FishAI Dynamic RoPE Scaling (custom improvement)
// Adapts scaling factor based on actual sequence length
// Short sequences: scaling_factor ~= 1 (nearly lossless)
// Long sequences: scaling_factor gradually increases (prevents overflow)
scaling_factor = max(1.0, seq_len / training_len)
base_dynamic = base * scaling_factor ^ (dim / (dim - 2))

// Additional: progressive extrapolation
// Smooth transition near training length boundary
if seq_len > training_len * 0.8:
    base_dynamic = smooth_interpolate(base, base_new, progress)`}</pre>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archLongContext.ropeScalingResult}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archLongContext.synergyTitle}
        </h2>
        <div className="space-y-2">
          {[
            { title: t.docs.archLongContext.useCases.longDoc, desc: t.docs.archLongContext.useCases.longDocDesc, icon: '📄' },
            { title: t.docs.archLongContext.useCases.codeRepo, desc: t.docs.archLongContext.useCases.codeRepoDesc, icon: '💻' },
            { title: t.docs.archLongContext.useCases.multiTurn, desc: t.docs.archLongContext.useCases.multiTurnDesc, icon: '🔄' },
            { title: t.docs.archLongContext.useCases.knowledgeBase, desc: t.docs.archLongContext.useCases.knowledgeBaseDesc, icon: '📚' },
          ].map((s) => (
            <div key={s.title} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40 flex items-start gap-3">
              <span className="text-xl shrink-0">{s.icon}</span>
              <div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{s.title}</span>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ArchAttention({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.archAttention.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.archAttention.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archAttention.mhaToGqaTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archAttention.mhaToGqaContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archAttention.kvCacheTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archAttention.kvCacheContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archAttention.causalMaskTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archAttention.causalMaskContent}
        </p>
      </section>
    </div>
  );
}

function ArchQuantization({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.archQuantization.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.archQuantization.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archQuantization.mixedPrecisionTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archQuantization.mixedPrecisionContent}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { layer: t.docs.archQuantization.layerLabels.embedNorm, precision: 'FP16', color: 'emerald', desc: t.docs.archQuantization.precisionDescs.fp16 },
            { layer: t.docs.archQuantization.layerLabels.attentionQkv, precision: 'INT8', color: 'amber', desc: t.docs.archQuantization.precisionDescs.int8 },
            { layer: t.docs.archQuantization.layerLabels.ffnWeights, precision: 'INT4', color: 'red', desc: t.docs.archQuantization.precisionDescs.int4 },
          ].map((item) => (
            <div
              key={item.layer}
              className={getClassByColor(item.color, 'p-4 rounded-xl border')}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                {item.layer}
              </div>
              <div
                className={getTextClassByColor(item.color, 'text-lg font-bold mb-1')}
              >
                {item.precision}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archQuantization.ggufTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archQuantization.ggufContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.archQuantization.simdTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.archQuantization.simdContent}
        </p>
      </section>
    </div>
  );
}

function Deployment({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.deployment.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.deployment.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.deployment.overviewTitle}
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {[
            { step: t.docs.deployment.deploySteps.trainTitle, desc: t.docs.deployment.deploySteps.trainDesc, icon: '🧠' },
            { step: t.docs.deployment.deploySteps.quantTitle, desc: t.docs.deployment.deploySteps.quantDesc, icon: '📦' },
            { step: t.docs.deployment.deploySteps.deployStepTitle, desc: t.docs.deployment.deploySteps.deployStepDesc, icon: '🚀' },
          ].map((item, i) => (
            <div key={item.step} className="flex-1 p-4 rounded-xl bg-white dark:bg-neutral-800/30 border border-neutral-200/60 dark:border-neutral-700/40 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-bold text-neutral-800 dark:text-neutral-200 mb-1">{item.step}</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.desc}</p>
              {i < 2 && (
                <ChevronRight className="hidden sm:block w-5 h-5 text-neutral-300 dark:text-neutral-600 absolute right-[-14px] top-1/2 -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.deployment.oneClickTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.deployment.oneClickContent}
        </p>
        <div className="rounded-xl bg-neutral-950 dark:bg-neutral-900 p-4 overflow-x-auto">
          <pre className="text-sm text-emerald-400 font-mono leading-relaxed">{`# One-click deploy
bash deploy.sh

# Equivalent to:
bun install
npx prisma generate
npx prisma db push
bun run build
bun run start`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.deployment.devModeTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.deployment.devModeContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.deployment.envVarsTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.deployment.envVarsContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.deployment.weightsTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.deployment.weightsContent}
        </p>
      </section>
    </div>
  );
}

function UsageChat({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.usageChat.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageChat.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageChat.startConversationTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageChat.startConversationContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageChat.featuresTitle}
        </h2>
        <div className="space-y-2">
          {[
            { title: t.docs.usageChat.features.qa, desc: t.docs.usageChat.features.qaDesc },
            { title: t.docs.usageChat.features.code, desc: t.docs.usageChat.features.codeDesc },
            { title: t.docs.usageChat.features.writing, desc: t.docs.usageChat.features.writingDesc },
            { title: t.docs.usageChat.features.math, desc: t.docs.usageChat.features.mathDesc },
          ].map((f) => (
            <div key={f.title} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{f.title}</span>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageChat.stopGenerationTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageChat.stopGenerationContent}
        </p>
      </section>
    </div>
  );
}

function UsageThinking({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.usageThinking.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageThinking.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageThinking.howToUseTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageThinking.howToUseContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageThinking.techPrincipleTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageThinking.techPrincipleContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageThinking.useCases.mathLogic}
        </h2>
        <div className="space-y-2">
          {[
            { title: t.docs.usageThinking.useCases.mathLogic, desc: t.docs.usageThinking.useCases.mathLogicDesc },
            { title: t.docs.usageThinking.useCases.codeDebug, desc: t.docs.usageThinking.useCases.codeDebugDesc },
            { title: t.docs.usageThinking.useCases.decisionAnalysis, desc: t.docs.usageThinking.useCases.decisionAnalysisDesc },
            { title: t.docs.usageThinking.useCases.creativeWriting, desc: t.docs.usageThinking.useCases.creativeWritingDesc },
          ].map((s) => (
            <div key={s.title} className="p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/30 dark:border-emerald-800/20">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">{s.title}</span>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function UsageSearch({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.usageSearch.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageSearch.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageSearch.howToUseTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageSearch.howToUseContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageSearch.techPrincipleTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageSearch.techPrincipleContent}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          {t.docs.usageSearch.combineWithTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.docs.usageSearch.combineWithContent}
        </p>
      </section>
    </div>
  );
}

function FAQ({ t }: { t: Translations }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t.docs.faq.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {t.docs.faq.intro}
        </p>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      <div className="space-y-4">
        {t.docs.faq.questions.map((item: { q: string; a: string }, i: number) => (
          <section key={item.q} className="space-y-2">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {item.q}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {item.a}
            </p>
            {i < t.docs.faq.questions.length - 1 && <div className="h-px bg-neutral-100 dark:bg-neutral-800/50" />}
          </section>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/30">
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          {t.docs.faq.moreQuestions.split('GitHub')[0]}
          <a
            href="https://github.com/FishLab-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            GitHub
          </a>
          {t.docs.faq.moreQuestions.split('GitHub')[1] || ''}
        </p>
      </div>
    </div>
  );
}

// ── Section Map ──
function getSectionMap(t: Translations): Record<string, () => React.ReactNode> {
  return {
    'getting-started': () => <GettingStarted t={t} />,
    'api': () => <GettingStarted t={t} />,
    'api-chat': () => <ApiChat t={t} />,
    'api-auth': () => <ApiAuth t={t} />,
    'api-conversations': () => <ApiConversations t={t} />,
    'architecture': () => <ArchTransformer t={t} />,
    'arch-transformer': () => <ArchTransformer t={t} />,
    'arch-long-context': () => <ArchLongContext t={t} />,
    'arch-attention': () => <ArchAttention t={t} />,
    'arch-quantization': () => <ArchQuantization t={t} />,
    'deployment': () => <Deployment t={t} />,
    'usage': () => <UsageChat t={t} />,
    'usage-chat': () => <UsageChat t={t} />,
    'usage-thinking': () => <UsageThinking t={t} />,
    'usage-search': () => <UsageSearch t={t} />,
    'faq': () => <FAQ t={t} />,
  };
}

// ── Main DocsTab Component ──
/* eslint-disable max-lines-per-function */
export default function DocsPage() {
  const { user } = useAppStore();
  const { t } = useI18n();
  const router = useRouter();
  const [activeId, setActiveId] = useState('getting-started');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const docNav: DocSection[] = useMemo(() => [
    { id: 'getting-started', title: t.docs.nav.gettingStarted, icon: Rocket },
    {
      id: 'api', title: t.docs.nav.apiDocs, icon: Code2,
      children: [
        { id: 'api-chat', title: t.docs.nav.apiChat, icon: Code2 },
        { id: 'api-auth', title: t.docs.nav.apiAuth, icon: Code2 },
        { id: 'api-conversations', title: t.docs.nav.apiConversations, icon: Code2 },
      ],
    },
    {
      id: 'architecture', title: t.docs.nav.architecture, icon: Cpu,
      children: [
        { id: 'arch-transformer', title: t.docs.nav.archTransformer, icon: Cpu },
        { id: 'arch-long-context', title: t.docs.nav.archLongContext, icon: ScrollText },
        { id: 'arch-attention', title: t.docs.nav.archAttention, icon: Cpu },
        { id: 'arch-quantization', title: t.docs.nav.archQuantization, icon: Cpu },
      ],
    },
    { id: 'deployment', title: t.docs.nav.deployment, icon: Server },
    {
      id: 'usage', title: t.docs.nav.usage, icon: Zap,
      children: [
        { id: 'usage-chat', title: t.docs.nav.usageChat, icon: Zap },
        { id: 'usage-thinking', title: t.docs.nav.usageThinking, icon: Zap },
        { id: 'usage-search', title: t.docs.nav.usageSearch, icon: Zap },
      ],
    },
    { id: 'faq', title: t.docs.nav.faq, icon: HelpCircle },
  ], [t]);

  const sectionMap = useMemo(() => getSectionMap(t), [t]);

  const handleNavigate = useCallback((id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    const el = document.getElementById('docs-content');
    if (el) {el.scrollTop = 0;}
  }, []);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) {setSidebarOpen(false);}
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const activeTitle = docNav.flatMap((n) => [n, ...(n.children || [])]).find((n) => n.id === activeId)?.title || t.common.docs;

  const renderContent = () => {
    const renderFn = sectionMap[activeId] ?? getSectionMap(t)['getting-started'];
    if (!renderFn) {return null;}
    return renderFn();
  };

  return (
    <div className="h-screen flex bg-white dark:bg-neutral-950 relative">
      {/* Floating login button - top right */}
      <div className="fixed top-4 right-4 z-30">
        {user ? (
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">
            {(user.name || user.email)?.[0]?.toUpperCase()}
          </div>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="h-9 px-4 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/40 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300/60 dark:hover:border-emerald-600/40 shadow-sm transition-all duration-200 flex items-center gap-1.5 text-xs font-medium"
          >
            <User className="w-3.5 h-3.5" />
            {t.common.login}
          </button>
        )}
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile slide-in */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 shrink-0 border-r border-neutral-200/60 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-y-auto transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ top: 0 }}
      >
        <div className="p-4">
          {/* Sidebar header */}
          <div className="flex items-center gap-2.5 mb-5 px-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                {t.docs.title}
              </div>
              <div className="text-[10px] text-neutral-400">{t.docs.version}</div>
            </div>
          </div>

          {/* Back to intro */}
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-2 px-3 py-2 mb-3 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.docs.backToIntro}
          </button>

          {/* Navigation */}
          <Sidebar activeId={activeId} onNavigate={handleNavigate} docNav={docNav} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto" id="docs-content">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-neutral-200/60 dark:border-neutral-800/40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
            {activeTitle}
          </span>
        </div>

        {/* Content area */}
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
          {renderContent()}
        </div>

        {/* Bottom nav */}
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-8">
          <BottomNav activeId={activeId} onNavigate={handleNavigate} docNav={docNav} t={t} />
        </div>
      </main>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

// ── Bottom navigation (prev / next) ──
function BottomNav({ activeId, onNavigate, docNav, t }: { activeId: string; onNavigate: (id: string) => void; docNav: DocSection[]; t: Translations }) {
  const flat = docNav.flatMap((n) =>
    n.children && n.children.length > 0
      ? [{ id: n.id, title: n.title }, ...n.children.map((c) => ({ id: c.id, title: c.title }))]
      : [{ id: n.id, title: n.title }]
  );

  const idx = flat.findIndex((f) => f.id === activeId);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  if (!prev && !next) {return null;}

  return (
    <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-800">
      {prev ? (
        <button
          onClick={() => onNavigate(prev.id)}
          className="flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors text-left max-w-[45%]"
        >
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">{t.docs.prevSection}</span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
            {prev.title}
          </span>
        </button>
      ) : (
        <div />
      )}
      {next ? (
        <button
          onClick={() => onNavigate(next.id)}
          className="flex flex-col items-end gap-0.5 px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors text-right max-w-[45%]"
        >
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">{t.docs.nextSection}</span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
            {next.title}
          </span>
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}