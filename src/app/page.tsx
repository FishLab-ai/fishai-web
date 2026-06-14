'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  Send, Github, ArrowRight, X, Code2, Pencil, Sparkles, Fish,
  Sun, Moon, ArrowDown, ChevronDown, Zap, Cpu, Binary,
} from 'lucide-react';

// ────── Types ──────
interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;       // 已显示的内容
  buffered?: string;     // 等待逐字输出的缓冲区
}

// ────── Markdown 渲染 ──────
function Md({ text }: { text: string }) {
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const lines = block.slice(3, -3).split('\n');
          const lang = /^[a-z]/i.test(lines[0]) ? lines[0] : '';
          const code = lines.slice(lang ? 1 : 0).join('\n');
          return (
            <div key={i} className="my-2.5 rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-700/50 bg-neutral-50/50 dark:bg-neutral-800/30">
              {lang && (
                <div className="px-3.5 py-1.5 text-[11px] font-mono text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 border-b border-neutral-200/60 dark:border-neutral-700/40 bg-neutral-100/50 dark:bg-neutral-800/50">
                  <Code2 className="w-3 h-3" />{lang}
                </div>
              )}
              <pre className="p-3.5 overflow-x-auto text-[13px] leading-relaxed font-mono text-neutral-700 dark:text-neutral-300">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const segs = block.split(/(`[^`\n]+`)/g);
        return (
          <span key={i}>
            {segs.map((s, j) => {
              if (s.startsWith('`') && s.endsWith('`')) {
                const inner = s.slice(1, -1);
                return <code key={j} className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md text-[13px] font-mono">{inner}</code>;
              }
              const bs = s.split(/(\*\*[^*]+\*\*)/g);
              return bs.map((b, k) => {
                if (b.startsWith('**') && b.endsWith('**'))
                  return <strong key={`${j}-${k}`} className="font-semibold text-neutral-900 dark:text-neutral-50">{b.slice(2, -2)}</strong>;
                return <span key={`${j}-${k}`}>{b}</span>;
              });
            })}
          </span>
        );
      })}
    </>
  );
}

// ────── 主题 Hook ──────
function useTheme() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fishai-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    setDark(isDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('fishai-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('fishai-theme', 'light');
    }
  }, [dark, mounted]);

  return [dark, setDark] as const;
}

// ────── 主题切换按钮 ──────
function ThemeToggle({ dark, setDark, size = 'sm' }: { dark: boolean; setDark: (d: boolean) => void; size?: 'sm' | 'md' }) {
  const sz = size === 'md';
  return (
    <button
      onClick={() => setDark(!dark)}
      className={`
        relative rounded-full flex items-center transition-all duration-300
        ${sz ? 'w-16 h-8 p-0.5' : 'w-14 h-7 p-0.5'}
        ${dark
          ? 'bg-neutral-700 hover:bg-neutral-600'
          : 'bg-blue-100 hover:bg-blue-200'
        }
      `}
      aria-label={dark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <span className={`
        flex items-center justify-center rounded-full bg-white shadow-sm
        transition-all duration-300 ease-in-out
        ${sz ? 'w-7 h-7' : 'w-6 h-6'}
        ${dark ? 'translate-x-8' : 'translate-x-0'}
      `}>
        {dark
          ? <Moon className="w-3.5 h-3.5 text-blue-400" />
          : <Sun className="w-3.5 h-3.5 text-amber-500" />
        }
      </span>
      <Sun className={`absolute left-1.5 w-3 h-3 text-amber-400 transition-opacity duration-300 ${dark ? 'opacity-40' : 'opacity-0'}`} />
      <Moon className={`absolute right-1.5 w-3 h-3 text-blue-300 transition-opacity duration-300 ${dark ? 'opacity-0' : 'opacity-40'}`} />
    </button>
  );
}

// ────── 介绍页 ──────
function Landing({ onStart, dark, setDark }: { onStart: () => void; dark: boolean; setDark: (d: boolean) => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/30 dark:from-neutral-950 dark:to-neutral-900/50 transition-colors duration-500">
      <header className="h-14 flex items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Fish className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-neutral-900 dark:text-neutral-100">FishAI</span>
          <span className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 px-1.5 py-0.5 rounded-full">v2</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle dark={dark} setDark={setDark} />
          <a
            href="https://github.com/FishLab-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-md text-center space-y-7">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/25 mx-auto">
              <Fish className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">FishAI</h1>
            <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">FishLab-ai 自研 AI 助手，小体积最聪明</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Cpu, label: 'Rust Engine' },
              { icon: Binary, label: '4-bit 量化' },
              { icon: Zap, label: '~12MB' },
            ].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/50 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 shadow-sm">
                <t.icon className="w-3 h-3" />
                {t.label}
              </span>
            ))}
          </div>

          <div className="bg-white/60 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/40 p-4 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2.5">架构特性</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              {['RoPE 旋转位置编码', 'SwiGLU 激活函数', 'RMSNorm 归一化', 'GQA 分组查询注意力', '权重绑定 WeightTying', '混合精度量化'].map((f, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl px-7 h-12 text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg"
          >
            开始聊天
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </main>

      <footer className="h-12 flex items-center justify-center text-[11px] text-neutral-300 dark:text-neutral-700 gap-1.5">
        <span>FishLab-ai</span><span>·</span><span>Built with Rust</span>
      </footer>
    </div>
  );
}

// ────── 聊天页 ──────
function Chat({ onBack, dark, setDark }: { onBack: () => void; dark: boolean; setDark: (d: boolean) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const convId = useRef(`c_${Date.now()}`);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── 打字机缓冲 ──
  // 用 ref 存缓冲区，避免闭包陷阱
  const bufferRef = useRef('');           // 等待逐字输出的字符队列
  const displayedRef = useRef('');        // 已经显示的完整文本
  const streamingIdRef = useRef<string | null>(null);  // 当前流式消息的 id
  const rafRef = useRef<number | null>(null);          // RAF id

  // ── 滚动控制 ──
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = distanceFromBottom < 100;
    isNearBottomRef.current = near;
    setShowScrollBtn(!near);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }
  }, []);

  // 流式消息时：只在用户在底部才跟随
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // textarea 自适应
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // ── 打字机核心：RAF 循环从缓冲区逐字释放 ──
  const startTypewriter = useCallback((aid: string) => {
    streamingIdRef.current = aid;
    bufferRef.current = '';
    displayedRef.current = '';

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      const buf = bufferRef.current;

      if (buf.length > 0) {
        // ── 自适应速度 ──
        // 基础速度: ~50 字符/秒 (约 1 字符/帧@60fps)
        // 缓冲积压时自动加速：积压越多越快，保证不会严重堆积
        const BASE_CPS = 50;                        // 基础每秒字符数
        const bufferPressure = buf.length;           // 积压量
        const speedMultiplier = bufferPressure > 8
          ? 1 + (bufferPressure - 8) * 0.3          // 积压>8字就加速
          : 1;
        const charsThisFrame = Math.max(1, Math.round(BASE_CPS * speedMultiplier * dt / 1000));

        const toShow = buf.slice(0, charsThisFrame);
        bufferRef.current = buf.slice(charsThisFrame);
        displayedRef.current += toShow;

        const current = displayedRef.current;
        const id = streamingIdRef.current;
        if (id) {
          setMessages(prev => {
            const idx = prev.findIndex(m => m.id === id);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = { ...prev[idx], content: current, buffered: bufferRef.current };
            return updated;
          });
        }
      }

      // 继续循环（streaming 期间持续运行）
      if (streamingIdRef.current === aid) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopTypewriter = useCallback(() => {
    // 流结束时，把缓冲区剩余全部刷出
    if (bufferRef.current.length > 0) {
      displayedRef.current += bufferRef.current;
      bufferRef.current = '';
      const current = displayedRef.current;
      const id = streamingIdRef.current;
      if (id) {
        setMessages(prev => {
          const idx = prev.findIndex(m => m.id === id);
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = { ...prev[idx], content: current, buffered: '' };
          return updated;
        });
      }
    }
    streamingIdRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ── 流式发送 ──
  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;

    const userMsg: ChatMsg = { id: `u_${Date.now()}`, role: 'user', content };
    const aid = `a_${Date.now()}`;
    setMessages(prev => [...prev, userMsg, { id: aid, role: 'assistant', content: '', buffered: '' }]);
    setInput('');
    setStreaming(true);
    isNearBottomRef.current = true;
    setTimeout(() => scrollToBottom(), 50);

    // 启动打字机
    startTypewriter(aid);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, conversationId: convId.current }),
      });
      if (!res.ok) throw new Error('请求失败');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无响应流');

      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });

        const lines = buf.split('\n');
        buf = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const obj = JSON.parse(data);
            if (obj.content) {
              // SSE token 到达 → 推入缓冲区，打字机 RAF 循环会逐字取出
              bufferRef.current += obj.content;
            }
          } catch {}
        }
      }
    } catch {
      // 出错时也要把已缓冲的内容显示出来
      if (bufferRef.current.length === 0 && displayedRef.current.length === 0) {
        setMessages(prev => prev.map(m =>
          m.id === aid ? { ...m, content: '出了点问题，请重试。', buffered: '' } : m
        ));
      }
    } finally {
      stopTypewriter();
      setStreaming(false);
    }
  }, [streaming, scrollToBottom, startTypewriter, stopTypewriter]);

  // 组件卸载时清理 RAF
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const suggestions = [
    { icon: Code2, label: '写代码', desc: 'Rust / Python / TS', prompt: '用 Rust 实现一个 LRU Cache，支持 get 和 put 操作，并解释你的设计选择' },
    { icon: Pencil, label: '写小作文', desc: '深度短文', prompt: '写一篇关于"小模型大智慧：轻量AI的技术哲学"的深度短文，300字' },
    { icon: Sparkles, label: '深度推理', desc: '数学 & 逻辑', prompt: '为什么 RoPE 比 Learned Position Embedding 更好？从数学原理和实验两方面分析' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/20 dark:from-neutral-950 dark:to-neutral-900/30 transition-colors duration-500">
      {/* 顶栏 */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-neutral-200/60 dark:border-neutral-800/40 shrink-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
              <Fish className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">FishAI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle dark={dark} setDark={setDark} />
          <a
            href="https://github.com/FishLab-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* 消息区域 */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Fish className="w-7 h-7 text-white" />
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">有什么可以帮你的？</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">试试下面的快捷指令</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s.prompt)}
                    className="flex-1 flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800/60 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all duration-200 hover:shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                      <s.icon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{s.label}</div>
                      <div className="text-[11px] text-neutral-400 dark:text-neutral-500">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => {
                const isStreaming = streaming && msg.role === 'assistant' && msg.id === streamingIdRef.current;

                return (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeSlideIn_0.25s_ease-out]`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-2.5 mt-0.5 shrink-0 shadow-sm shadow-blue-500/20">
                        <Fish className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 shadow-md shadow-blue-500/15'
                          : 'bg-white dark:bg-neutral-900/70 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800/50 px-4 py-3 shadow-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          {msg.content ? (
                            <div className="prose-fishai">
                              <Md text={msg.content} />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 py-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[dotBounce_1.4s_ease-in-out_infinite]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[dotBounce_1.4s_ease-in-out_0.2s_infinite]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[dotBounce_1.4s_ease-in-out_0.4s_infinite]" />
                            </div>
                          )}
                          {isStreaming && msg.content && (
                            <span className="inline-block w-[2px] h-[15px] bg-blue-500 ml-0.5 align-middle rounded-full animate-[cursorBreathe_1.2s_ease-in-out_infinite]" />
                          )}
                        </>
                      ) : (
                        <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={chatEndRef} className="h-1" />
        </div>
      </main>

      {/* 回到底部按钮 */}
      <div className={`relative transition-all duration-300 ${showScrollBtn ? 'h-10' : 'h-0'}`}>
        {showScrollBtn && (
          <button
            onClick={() => {
              isNearBottomRef.current = true;
              scrollToBottom();
              setShowScrollBtn(false);
            }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 h-9 px-3.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 z-10"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            回到底部
          </button>
        )}
      </div>

      {/* 输入区 */}
      <footer className="border-t border-neutral-200/60 dark:border-neutral-800/40 p-3 sm:p-4 shrink-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex gap-2.5 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="输入消息…"
              className="min-h-[44px] max-h-[160px] resize-none text-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 rounded-xl transition-all duration-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              rows={1}
              disabled={streaming}
            />
          </div>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="h-[44px] w-[44px] rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shrink-0 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="max-w-2xl mx-auto mt-1.5 text-center">
          <span className="text-[10px] text-neutral-300 dark:text-neutral-700">FishAI · 基于 Rust 推理引擎 · 混合精度量化</span>
        </div>
      </footer>
    </div>
  );
}

// ────── 主页 ──────
export default function Home() {
  const [page, setPage] = useState<'landing' | 'chat'>('landing');
  const [dark, setDark] = useTheme();

  if (page === 'chat') return <Chat onBack={() => setPage('landing')} dark={dark} setDark={setDark} />;
  return <Landing onStart={() => setPage('chat')} dark={dark} setDark={setDark} />;
}
