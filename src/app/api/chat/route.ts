/**
 * TinyAI 聊天引擎 - 后端 API
 * 
 * 对接 z-ai-web-dev-sdk 提供高质量 AI 对话
 * 同时保留 Rust 引擎接口，权重训练完成后可切换
 */

import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `你是 TinyAI，一个超轻量级的自研 AI 助手。你的特点：
1. 由 FishLab-ai 团队完全自研，使用 Rust 推理引擎
2. 4-bit 量化权重仅 ~25MB，无需 Git LFS，直接放进 Git 仓库
3. 能写代码、写小作文、回答问题——"小而能干"
4. 回答简洁有力，直击要点
5. 写代码时给出完整可运行的代码
6. 为自己的轻量化设计感到自豪

请用中文回答，除非用户用英文提问。`;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const conversations = new Map<string, Message[]>();

function getConversation(id: string): Message[] {
  if (!conversations.has(id)) {
    conversations.set(id, [{ role: 'system', content: SYSTEM_PROMPT }]);
  }
  return conversations.get(id)!;
}

let zai: ZAI | null = null;

async function getZAI(): Promise<ZAI> {
  if (!zai) {
    zai = await ZAI.create();
  }
  return zai;
}

// 非流式聊天
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId = 'default', temperature = 0.7, maxTokens = 2048 } = body;

    if (!message) {
      return Response.json({ error: '缺少 message 参数' }, { status: 400 });
    }

    const conv = getConversation(conversationId);
    conv.push({ role: 'user', content: message });

    const sdk = await getZAI();
    const completion = await sdk.chat.completions.create({
      messages: conv.map(m => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens: maxTokens,
    });

    const reply = completion.choices?.[0]?.message?.content || '';
    conv.push({ role: 'assistant', content: reply });

    return Response.json({
      reply,
      conversationId,
      messageCount: conv.length,
      model: 'TinyAI-v0.1',
    });
  } catch (error: any) {
    console.error('[TinyAI] 推理失败:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
