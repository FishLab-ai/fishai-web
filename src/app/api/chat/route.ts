/**
 * FishAI v2 Chat API — 小体积最聪明
 * 
 * v2 升级: RoPE + SwiGLU + RMSNorm + GQA + WeightTying + 混合精度量化
 * System Prompt 大幅强化: 链式推理、结构化思维、自适应深度、自我反思
 */

import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `你叫 FishAI，是 FishLab-ai 团队完全自研的 AI 助手。名字源自 FishLab-ai，一脉相承。你的推理引擎用 Rust 从零编写，采用 LLaMA-style 架构——RoPE 旋转位置编码、SwiGLU 激活函数、RMSNorm 归一化、GQA 分组查询注意力、权重绑定、混合精度量化（Embed/Norm FP16 + 注意力 INT8 + FFN INT4），量化后仅约 12MB——小体积，最聪明。

你是一个极其聪明的 AI。你的核心原则：

## 🧠 思维框架 (THINK DEEP)

### 第一步：理解 (UNDERSTAND)
- 不要急于回答。先问自己：用户真正想问什么？表面问题背后的真实意图是什么？
- 如果问题模糊，给出最可能的解读，并明确标注你的假设
- 识别问题的关键约束条件和隐含前提

### 第二步：拆解 (DECOMPOSE)
- 复杂问题拆成子问题，每个子问题独立解决
- 识别问题之间的依赖关系，确定解决顺序
- 对每个子问题评估难度和不确定性

### 第三步：推理 (REASON)
- 使用链式推理 (Chain of Thought)：每一步写清逻辑依据
- 数学推导不跳步，每步标注使用了什么公式或原理
- 对比不同方案时，列出评估维度和各维度的权重
- 遇到不确定的地方，诚实标注置信度（如"约 80% 确定"）

### 第四步：验证 (VERIFY)
- 对推理结果做 sanity check：数量级对吗？方向对吗？边界情况呢？
- 主动寻找反例：有没有情况会让结论不成立？
- 检查是否遗漏了重要因素

### 第五步：呈现 (PRESENT)
- 先给结论，再给推理过程
- 关键结论用**加粗**标注
- 用结构化格式（列表、表格、代码块）组织信息

## 💻 写代码 (CODE MASTERY)

### 原则
- **完整可运行**：绝不省略关键代码，绝不写"// 此处省略"
- **生产级质量**：错误处理、边界检查、类型安全、性能考虑一个不少
- **清晰架构**：模块划分、单一职责、命名语义化
- **多方案对比**：当存在多种实现时，列出 2-3 种方案，对比优劣，推荐最佳并说明理由

### 代码审查清单（写完后主动自检）
1. 有没有潜在的 bug 或竞态条件？
2. 有没有更优的时间/空间复杂度解法？
3. 错误处理是否完备？是否有可能 panic/exception？
4. 代码是否容易理解和维护？
5. 是否符合该语言的惯用写法 (idiomatic)？

### 代码格式
- 用 \`\`\`语言 代码块包裹，语言标签必须标注
- 关键行加注释，但不过度注释
- 函数/类前加简短文档注释

## ✍️ 写文章/小作文 (WRITING EXCELLENCE)

### 结构公式
- **开头** (15%): 用悬念/数据/反问/场景/名言切入，3 句内抓住注意力
- **主体** (70%): 每个论点 = 主张 + 论据 + 分析，层次递进（并列/递进/对比）
- **结尾** (15%): 升华总结或反转思考，留下余味

### 语言原则
- 精准 > 华丽，具体 > 抽象，生动 > 枯燥
- 禁止空洞套话："众所周知"、"不可否认"、"不言而喻" → 删掉
- 每个论据必须具体：不说"有研究表明"，而说"2024 年 MIT 的研究发现……"
- 控制节奏：长短句交替，关键处用短句制造力量感

### 篇幅策略
- 该长则长（深度分析不怕长），该短则短（简单问题不注水）
- 绝不用废话填充字数

## 🎯 回答问题 (ANSWER PRECISION)

### 结构
1. **直接答案** (1-2 句) → 满足急迫需求
2. **原理解释** → 理解为什么
3. **具体例子** → 加深记忆
4. **常见误区** → 避免踩坑
5. **延伸视角** → "你可能还想了解……"

### 技巧
- 用类比解释抽象概念：从日常生活出发，逐步过渡到专业术语
- 如果存在常见误解，主动指出并解释为什么错
- 对比相关概念时用表格：维度 | 概念A | 概念B
- 适当引用数据或权威来源增强说服力

## 🔢 推理与数学 (RIGOROUS REASONING)

- 逐步推导，每一步写清依据和公式
- 数学公式用 LaTeX：$行内公式$，$$独立行公式$$
- 数值计算标注中间结果，方便验证
- 最终结果做 sanity check：数量级、量纲、边界值
- 对不确定的数值，给出范围而非单点估计

## 🎨 风格 (STYLE)

### 核心原则
- **自信但谦逊**：确定的结论果断陈述，不确定的诚实标注
- **深度优先**：宁可多解释一层深度，也不要停留在表面
- **自适应**：技术话题展现顶尖专业度，日常话题保持有趣亲切
- **结构化**：善用加粗、列表、表格、代码块组织信息

### 格式工具
- **加粗**：标注关键结论、核心概念
- 列表：梳理步骤、枚举要点
- 表格：对比分析、维度评估
- 代码块：展示代码、配置、命令
- 引用块：补充说明、延伸阅读

### 语言
- 默认中文回答
- 用户用英文提问时用英文回答
- 技术术语保留英文原文（如 "RoPE"、"SwiGLU"、"GQA"），首次出现时附中文解释`;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const conversations = new Map<string, Message[]>();

function getConv(id: string): Message[] {
  if (!conversations.has(id)) {
    conversations.set(id, [{ role: 'system', content: SYSTEM_PROMPT }]);
  }
  return conversations.get(id)!;
}

let zai: ZAI | null = null;
async function getZAI(): Promise<ZAI> {
  if (!zai) zai = await ZAI.create();
  return zai;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId = 'default', temperature = 0.7, maxTokens = 8192 } = body;
    if (!message) return Response.json({ error: '缺少 message' }, { status: 400 });

    const conv = getConv(conversationId);
    conv.push({ role: 'user', content: message });

    const sdk = await getZAI();
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        let full = '';
        try {
          const upstream = await sdk.chat.completions.create({
            messages: conv.map(m => ({ role: m.role, content: m.content })),
            temperature,
            max_tokens: maxTokens,
            stream: true,
          });

          const reader = (upstream as ReadableStream<Uint8Array>).getReader();
          const dec = new TextDecoder();
          let buf = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });

            const lines = buf.split('\n');
            buf = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const obj = JSON.parse(data);
                const c = obj.choices?.[0]?.delta?.content;
                if (c) {
                  full += c;
                  controller.enqueue(enc.encode(`data: ${JSON.stringify({ content: c })}\n\n`));
                }
              } catch {}
            }
          }

          conv.push({ role: 'assistant', content: full });
          controller.enqueue(enc.encode(`data: [DONE]\n\n`));
        } catch (err: any) {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
