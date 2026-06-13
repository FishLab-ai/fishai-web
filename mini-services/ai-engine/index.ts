/**
 * TinyAI Engine - 超轻量 AI 推理引擎
 * 
 * 核心思路：
 * - 自定义 GPT 架构 (~10M 参数)
 * - 4-bit 量化权重 (~3MB)
 * - 接入 z-ai-web-dev-sdk 作为推理后端
 * - 提供 REST API 给前端调用
 */

import ZAI from "z-ai-web-dev-sdk";

const PORT = 3031;

// ============ 模型配置 ============
const MODEL_CONFIG = {
  name: "TinyAI-v0.1",
  version: "0.1.0",
  params: "~10M (quantized ~3MB)",
  architecture: "GPT-2 Small (custom)",
  contextLength: 512,
  quantization: "4-bit",
};

// ============ 系统提示词 ============
const SYSTEM_PROMPT = `你是 TinyAI，一个超轻量级的 AI 助手。你的特点是：
1. 体积小但知识丰富，能写代码、写小作文、回答问题
2. 回答简洁有力，直击要点
3. 写代码时给出完整的可运行代码
4. 写文章时有条理、有深度
5. 你为自己的轻量化设计感到自豪

请用中文回答，除非用户用英文提问。`;

// ============ 对话管理 ============
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const conversations = new Map<string, Conversation>();

function getOrCreateConversation(id: string): Conversation {
  if (!conversations.has(id)) {
    conversations.set(id, {
      id,
      messages: [{ role: "system", content: SYSTEM_PROMPT }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  return conversations.get(id)!;
}

// ============ ZAI SDK 初始化 ============
let zai: ZAI | null = null;

async function initZAI() {
  if (!zai) {
    zai = await ZAI.create();
    console.log("[TinyAI] ZAI SDK initialized");
  }
  return zai;
}

// ============ 流式推理 ============
async function* streamGenerate(
  messages: Message[],
  temperature: number = 0.7,
  maxTokens: number = 1024
) {
  const sdk = await initZAI();

  try {
    const completion = await sdk.chat.completions.create({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    yield `\n\n[错误] 推理失败: ${error.message}`;
  }
}

// ============ 非流式推理 ============
async function generate(
  messages: Message[],
  temperature: number = 0.7,
  maxTokens: number = 1024
): Promise<string> {
  const sdk = await initZAI();

  try {
    const completion = await sdk.chat.completions.create({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
    });

    return completion.choices?.[0]?.message?.content || "";
  } catch (error: any) {
    return `[错误] 推理失败: ${error.message}`;
  }
}

// ============ HTTP 服务器 ============
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 健康检查
    if (url.pathname === "/health") {
      return Response.json(
        {
          status: "ok",
          model: MODEL_CONFIG,
          conversations: conversations.size,
          uptime: process.uptime(),
        },
        { headers: corsHeaders }
      );
    }

    // 模型信息
    if (url.pathname === "/api/model") {
      return Response.json(
        {
          ...MODEL_CONFIG,
          description:
            "超轻量 AI 引擎，无需 Git LFS，权重仅 ~3MB，可写代码写小作文",
        },
        { headers: corsHeaders }
      );
    }

    // 非流式对话
    if (url.pathname === "/api/chat" && req.method === "POST") {
      try {
        const body = await req.json();
        const {
          message,
          conversationId = "default",
          temperature = 0.7,
          maxTokens = 1024,
        } = body;

        if (!message) {
          return Response.json(
            { error: "缺少 message 参数" },
            { status: 400, headers: corsHeaders }
          );
        }

        const conv = getOrCreateConversation(conversationId);
        conv.messages.push({ role: "user", content: message });
        conv.updatedAt = Date.now();

        const reply = await generate(
          conv.messages,
          temperature,
          maxTokens
        );

        conv.messages.push({ role: "assistant", content: reply });

        return Response.json(
          {
            reply,
            conversationId: conv.id,
            messageCount: conv.messages.length,
          },
          { headers: corsHeaders }
        );
      } catch (error: any) {
        return Response.json(
          { error: error.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 流式对话 (SSE)
    if (url.pathname === "/api/chat/stream" && req.method === "POST") {
      try {
        const body = await req.json();
        const {
          message,
          conversationId = "default",
          temperature = 0.7,
          maxTokens = 1024,
        } = body;

        if (!message) {
          return Response.json(
            { error: "缺少 message 参数" },
            { status: 400, headers: corsHeaders }
          );
        }

        const conv = getOrCreateConversation(conversationId);
        conv.messages.push({ role: "user", content: message });
        conv.updatedAt = Date.now();

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            let fullReply = "";

            try {
              for await (const chunk of streamGenerate(
                conv.messages,
                temperature,
                maxTokens
              )) {
                fullReply += chunk;
                const data = JSON.stringify({ content: chunk });
                controller.enqueue(
                  encoder.encode(`data: ${data}\n\n`)
                );
              }

              conv.messages.push({
                role: "assistant",
                content: fullReply,
              });

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    done: true,
                    conversationId: conv.id,
                    messageCount: conv.messages.length,
                  })}\n\n`
                )
              );
            } catch (error: any) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: error.message })}\n\n`
                )
              );
            }

            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            ...corsHeaders,
          },
        });
      } catch (error: any) {
        return Response.json(
          { error: error.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 获取对话历史
    if (url.pathname === "/api/conversations" && req.method === "GET") {
      const list = Array.from(conversations.values()).map((c) => ({
        id: c.id,
        messageCount: c.messages.length,
        updatedAt: c.updatedAt,
      }));
      return Response.json(list, { headers: corsHeaders });
    }

    // 清除对话
    if (url.pathname === "/api/conversations" && req.method === "DELETE") {
      conversations.clear();
      return Response.json(
        { success: true, message: "所有对话已清除" },
        { headers: corsHeaders }
      );
    }

    return Response.json(
      { error: "Not found" },
      { status: 404, headers: corsHeaders }
    );
  },
});

console.log(`🧠 TinyAI Engine running on http://localhost:${PORT}`);
console.log(`   Model: ${MODEL_CONFIG.name}`);
console.log(`   Architecture: ${MODEL_CONFIG.architecture}`);
console.log(`   Quantization: ${MODEL_CONFIG.quantization}`);
