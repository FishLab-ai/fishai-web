'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Code2,
  FileText,
  Trash2,
  Cpu,
  Zap,
  Github,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const EXAMPLE_PROMPTS = [
  { icon: Code2, label: '写一段 Rust 代码', prompt: '用 Rust 写一个快速排序算法，并解释原理' },
  { icon: FileText, label: '写一篇小作文', prompt: '写一篇关于"人工智能与未来"的短文，300字左右' },
  { icon: Sparkles, label: '解释量子计算', prompt: '用简单易懂的语言解释什么是量子计算' },
  { icon: Code2, label: '设计数据结构', prompt: '用 Rust 实现一个 LRU Cache，支持 get 和 put 操作' },
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          conversationId,
          temperature: 0.7,
          maxTokens: 2048,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `抱歉，出了点问题: ${error.message}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // 简单的 Markdown 渲染 (代码块)
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const lang = lines[0] || '';
        const code = lines.slice(1).join('\n');
        return (
          <div key={i} className="my-3 rounded-lg overflow-hidden">
            {lang && (
              <div className="bg-emerald-900/40 text-emerald-300 px-4 py-1.5 text-xs font-mono flex items-center gap-2">
                <Code2 className="w-3 h-3" />
                {lang}
              </div>
            )}
            <pre className="bg-zinc-900/80 text-zinc-200 p-4 overflow-x-auto text-sm leading-relaxed">
              <code>{code || lines.join('\n')}</code>
            </pre>
          </div>
        );
      }
      // 处理行内代码
      const inlineParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {inlineParts.map((p, j) => {
            if (p.startsWith('`') && p.endsWith('`')) {
              return (
                <code key={j} className="bg-emerald-900/30 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono">
                  {p.slice(1, -1)}
                </code>
              );
            }
            // 处理加粗
            const boldParts = p.split(/(\*\*[^*]+\*\*)/g);
            return boldParts.map((bp, k) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return <strong key={`${j}-${k}`} className="font-semibold text-white">{bp.slice(2, -2)}</strong>;
              }
              return <span key={`${j}-${k}`}>{bp}</span>;
            });
          })}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">TinyAI</h1>
              <p className="text-[10px] text-zinc-500">Rust Engine &middot; 4-bit Quantized &middot; Self-developed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] border-emerald-800 text-emerald-400 bg-emerald-950/30">
              <Zap className="w-2.5 h-2.5 mr-1" />
              ~52M params
            </Badge>
            <Badge variant="outline" className="text-[10px] border-teal-800 text-teal-400 bg-teal-950/30">
              ~25MB quantized
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
              onClick={clearChat}
              title="清除对话"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <a
              href="https://github.com/FishLab-ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-300">
                <Github className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* 聊天区域 */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-8.5rem)]" ref={scrollRef}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              /* 欢迎界面 */
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <Cpu className="w-10 h-10 text-zinc-950" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    TinyAI
                  </h2>
                  <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
                    超轻量自研 AI，完全用 Rust 构建，4-bit 量化权重仅需 ~25MB。<br/>
                    能写代码、写小作文、回答问题 —— 小而能干。
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {EXAMPLE_PROMPTS.map((item, i) => (
                    <Card
                      key={i}
                      className="bg-zinc-900/50 border-zinc-800/50 hover:border-emerald-800/50 hover:bg-zinc-900/80 cursor-pointer transition-all duration-200 group"
                      onClick={() => sendMessage(item.prompt)}
                    >
                      <div className="p-4 flex items-start gap-3">
                        <item.icon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.prompt}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[10px] text-zinc-600">
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Rust Engine</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 4-bit INT4</span>
                  <span className="flex items-center gap-1"><Github className="w-3 h-3" /> FishLab-ai</span>
                </div>
              </div>
            ) : (
              /* 消息列表 */
              <div className="space-y-6 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-zinc-950" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-600/20 border border-emerald-800/30 text-zinc-100'
                          : 'bg-zinc-900/50 border border-zinc-800/30 text-zinc-300'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {renderContent(msg.content)}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 text-zinc-300" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-zinc-950" />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800/30 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-xs text-zinc-500 ml-2">思考中...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* 输入区域 */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="给 TinyAI 发消息... (Enter 发送, Shift+Enter 换行)"
                className="min-h-[44px] max-h-[200px] bg-zinc-900/50 border-zinc-800/50 focus:border-emerald-800/50 focus-visible:ring-emerald-800/20 resize-none text-sm text-zinc-200 placeholder:text-zinc-600 rounded-xl"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shrink-0 shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:shadow-none"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            TinyAI v0.1 &middot; FishLab-ai &middot; Rust + 4-bit Quantization &middot; No Git LFS Required
          </p>
        </div>
      </footer>
    </div>
  );
}
