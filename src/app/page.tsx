'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Send, Github, ArrowRight, X, Code2, Pencil, Sparkles, Fish,
  Sun, Moon,
} from 'lucide-react';

// ────── Types ──────
interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;       // 已显示的内容 (打字机已吐出的)
  buffered: string;      // 缓冲区 (SSE 收到但还没打出来的)
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
            <div key={i} className="my-2.5 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700/60">
              {lang && (
                <div className="bg-neutral-50 dark:bg-neutral-800/80 px-3 py-1 text-[11px] font-mono text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-700/60">
                  <Code2 className="w-3 h-3" />{lang}
                </div>
              )}
              <pre className="bg-white dark:bg-neutral-900/60 p-3 overflow-x-auto text-[13px] leading-relaxed font-mono text-neutral-700 dark:text-neutral-300">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        const segs = block.split(/(`[^`\n]+`)/g);
        return (
          <span key={i}>
            {segs.map((s, j) => {
              if (s.startsWith('`') && s.endsWith('`'))
                return <code key={j} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1 py-0.5 rounded text-[13px] font-mono">{s.slice(1, -1)}</code>;
              const bs = s.split(/(\*\*[^*]+\*\*)/g);
              return bs.map((b, k) =>
                b.startsWith('**') && b.endsWith('**')
                  ? <strong key={`${j}-${k}`} className="font-semibold">{b.slice(2, -2)}</strong>
                  : <span key={`${j}-${k}`}>{b}</span>
              );
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

  useEffect(() => {
    const saved = localStorage.getItem('fishai-theme');
    if (saved === 'dark') setDark(true);
    else setDark(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('fishai-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('fishai-theme', 'light');
    }
  }, [dark]);

  return [dark, setDark] as const;
}

// ────── 介绍页 ──────
function Landing({ onStart, dark, setDark }: { onStart: () => void; dark: boolean; setDark: (d: boolean) => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 transition-colors duration-300">
      {/* 顶栏 */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-neutral-100 dark:border-neutral-800/60">
        <div className="flex items-center gap-2.5">
          <Fish className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-[15px] tracking-tight text-neutral-900 dark:text-neutral-100">FishAI</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <a href="https://github.com/FishLab-ai" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 gap-1.5 text-xs h-8 px-2.5">
              <Github className="w-4 h-4" /> GitHub
            </Button>
          </a>
        </div>
      </header>

      {/* 中心 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-5">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <Fish className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">FishAI</h1>

          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
            FishLab-ai 自研 AI 助手，小体积最聪明。<br />
            RoPE + SwiGLU + RMSNorm + GQA + 混合精度量化。<br />
            能写代码、写文章、深度推理、回答问题。
          </p>

          <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-300 dark:text-neutral-600">
            <span>Rust</span><span>·</span>
            <span>LLaMA-style v2</span><span>·</span>
            <span>No Git LFS</span>
          </div>

          <Button
            onClick={onStart}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 h-11 text-sm font-medium gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            开始聊天 <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>

      <footer className="h-12 flex items-center justify-center text-[11px] text-neutral-300 dark:text-neutral-700">
        FishLab-ai
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 打字机状态
  const typewriterRef = useRef<number | null>(null);       // rAF id
  const lastTickRef = useRef(0);                            // 上次吐字时间
  const CHAR_INTERVAL = 50;                                 // 每字间隔 ms (约 20 字/秒)
  const streamingIdRef = useRef<string>('');                // 当前流式消息 id

  // 缓入光标 — CSS animation 实现
  // 直接在 globals.css 中用 @keyframes

  // 滚动到底
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 打字机 tick: 把缓冲区字符逐个搬到 content
  const typewriterTick = useCallback((timestamp: number) => {
    if (timestamp - lastTickRef.current >= CHAR_INTERVAL) {
      lastTickRef.current = timestamp;

      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === streamingIdRef.current);
        if (idx === -1) return prev;
        const msg = prev[idx];
        if (msg.buffered.length === 0) return prev;

        // 每次吐 1 个字符 (CJK 算 1 个)
        const nextChar = msg.buffered[0];
        const rest = msg.buffered.slice(1);
        const updated = [...prev];
        updated[idx] = { ...msg, content: msg.content + nextChar, buffered: rest };
        return updated;
      });
    }
    // 只要还有缓冲就继续
    typewriterRef.current = requestAnimationFrame(typewriterTick);
  }, []);

  // 启动 / 停止打字机
  const startTypewriter = useCallback((id: string) => {
    streamingIdRef.current = id;
    lastTickRef.current = 0;
    if (typewriterRef.current) cancelAnimationFrame(typewriterRef.current);
    typewriterRef.current = requestAnimationFrame(typewriterTick);
  }, [typewriterTick]);

  const stopTypewriter = useCallback(() => {
    if (typewriterRef.current) {
      cancelAnimationFrame(typewriterRef.current);
      typewriterRef.current = null;
    }
    // 把剩余缓冲区全部吐出
    setMessages(prev => prev.map(m =>
      m.buffered.length > 0 ? { ...m, content: m.content + m.buffered, buffered: '' } : m
    ));
    streamingIdRef.current = '';
  }, []);

  // 监听消息变化 → 滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // textarea 自适应
  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'; }
  }, [input]);

  // 清理
  useEffect(() => {
    return () => {
      if (typewriterRef.current) cancelAnimationFrame(typewriterRef.current);
    };
  }, []);

  // 流式发送
  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;

    const userMsg: ChatMsg = { id: `u_${Date.now()}`, role: 'user', content, buffered: '' };
    const aid = `a_${Date.now()}`;
    setMessages(prev => [...prev, userMsg, { id: aid, role: 'assistant', content: '', buffered: '' }]);
    setInput('');
    setStreaming(true);
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
              // 追加到缓冲区，打字机会逐字消费
              setMessages(prev => {
                const idx = prev.findIndex(m => m.id === aid);
                if (idx === -1) return prev;
                const msg = prev[idx];
                const updated = [...prev];
                updated[idx] = { ...msg, buffered: msg.buffered + obj.content };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === aid ? { ...m, content: '出了点问题，请重试。', buffered: '' } : m
      ));
    } finally {
      stopTypewriter();
      setStreaming(false);
    }
  }, [streaming, startTypewriter, stopTypewriter]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const suggestions = [
    { icon: Code2, label: '写代码', prompt: '用 Rust 实现一个 LRU Cache，支持 get 和 put 操作，并解释你的设计选择' },
    { icon: Pencil, label: '写小作文', prompt: '写一篇关于"小模型大智慧：轻量AI的技术哲学"的深度短文，300字' },
    { icon: Sparkles, label: '深度推理', prompt: '为什么 RoPE 比 Learned Position Embedding 更好？从数学原理和实验两方面分析' },
  ];

  // 判断某条消息是否正在打字机输出中
  const isTyping = (msg: ChatMsg) =>
    streaming && msg.id === streamingIdRef.current && (msg.buffered.length > 0 || msg.content === '');

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-neutral-950 transition-colors duration-300">
      {/* 顶栏 */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" onClick={onBack}>
            <X className="w-4 h-4" />
          </Button>
          <Fish className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300">FishAI</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <a href="https://github.com/FishLab-ai" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
              <Github className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </header>

      {/* 消息 */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Fish className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-neutral-400 dark:text-neutral-500">有什么可以帮你的？</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s.prompt)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-sm"
                  >
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map(msg => {
                const typing = isTyping(msg);
                return (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeSlideIn_0.25s_ease-out]`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/15'
                          : 'bg-neutral-50 dark:bg-neutral-900/80 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          {msg.content ? <Md text={msg.content} /> : null}
                          {typing && (
                            <span className="inline-block w-[2px] h-[15px] bg-blue-500 ml-0.5 align-middle animate-[cursorPulse_1s_ease-in-out_infinite] rounded-full" />
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
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* 输入 */}
      <footer className="border-t border-neutral-100 dark:border-neutral-800/60 p-3 shrink-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="输入消息…"
            className="min-h-[42px] max-h-[160px] resize-none text-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 rounded-xl transition-all duration-200"
            rows={1}
            disabled={streaming}
          />
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="h-[42px] w-[42px] rounded-xl bg-blue-500 hover:bg-blue-600 text-white shrink-0 disabled:opacity-30 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
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
