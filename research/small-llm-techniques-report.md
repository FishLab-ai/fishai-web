# State-of-the-Art Techniques for Building Sub-100M Parameter Language Models

**Research Date**: March 2026  
**Focus**: Maximizing intelligence per parameter in models under 100M parameters  
**Sources**: LLaMA/PaLM/Phi architecture papers, Chinchilla scaling laws, Super Tiny Language Models (arXiv:2405.14159), SLM survey (arXiv:2505.19529), Sebastian Raschka's analyses, EleutherAI RoPE deep-dive, and community benchmarks.

---

## 1. RoPE (Rotary Position Embedding)

### The Core Idea
RoPE encodes **absolute** position through vector rotation, but the **dot product of rotated vectors naturally depends on relative position**. This unifies absolute and relative position encoding.

### Exact Mathematics

For a token at position `m` with embedding vector `x ∈ ℝ^d`, RoPE applies a **block-diagonal rotation matrix** to pairs of dimensions:

```
For each dimension pair (2i, 2i+1) where i = 0, 1, ..., d/2-1:

theta_i = 1 / (10000^(2i/d))

     ┌ cos(m * theta_i)  -sin(m * theta_i) ┐
R =  │                                       │    (2x2 rotation for each pair)
     └ sin(m * theta_i)   cos(m * theta_i) ┘

Full rotation: R_Theta,m = diag(R(theta_0), R(theta_1), ..., R(theta_{d/2-1}))
```

Applied to queries and keys:
```
q_m = R_Theta,m * W_q * x_m
k_n = R_Theta,n * W_k * x_n
```

The attention score:
```
q_m^T * k_n = x_m^T * W_q^T * R_Theta,(m-n) * W_k * x_n
```

**This depends only on the relative position (m-n)**, which is the key mathematical property.

### Efficient Implementation (No Full Matrix Multiply)

```python
def precompute_freqs_cis(dim: int, max_seq_len: int, theta: float = 10000.0):
    freqs = 1.0 / (theta ** (torch.arange(0, dim, 2).float() / dim))
    t = torch.arange(max_seq_len)
    freqs = torch.outer(t, freqs)  # (max_seq_len, dim/2)
    freqs_cis = torch.polar(torch.ones_like(freqs), freqs)  # complex exponentials
    return freqs_cis

def apply_rotary_emb(xq, xk, freqs_cis):
    # xq, xk: (batch, seq_len, n_heads, head_dim)
    xq_ = torch.view_as_complex(xq.float().reshape(*xq.shape[:-1], -1, 2))
    xk_ = torch.view_as_complex(xk.float().reshape(*xk.shape[:-1], -1, 2))
    freqs_cis = reshape_for_broadcast(freqs_cis, xq_)
    xq_out = torch.view_as_real(xq_ * freqs_cis).flatten(start_dim=-2)
    xk_out = torch.view_as_real(xk_ * freqs_cis).flatten(start_dim=-2)
    return xq_out.type_as(xq), xk_out.type_as(xk)
```

### Why RoPE > Learned Position Embeddings for Small Models

| Property | Learned PE | RoPE |
|----------|-----------|------|
| Parameters | d_model x max_seq_len | **0** (computed on the fly) |
| Extrapolation | Cannot generalize beyond max_seq_len | Can extrapolate with RoPE scaling |
| Relative position | Only implicit | **Explicitly encoded** in attention scores |
| Memory | Stores embedding table | No storage needed |

**For a 100M model with d_model=768 and max_seq_len=2048**: Learned PE costs ~1.57M parameters (1.57% of budget). RoPE costs **zero**. At sub-100M scale, every parameter counts.

### Theta Value
- Original paper: theta = 10000  
- LLaMA 1/2/3: theta = 10000  
- For longer context: theta = 500000 (code-llama style)  
- **Recommendation for sub-100M**: Use theta = 10000 with target context 2048-4096.

---

## 2. SwiGLU Activation

### The Formula

Standard FFN (GELU/ReLU):
```
FFN(x) = W_2 * GELU(W_1 * x + b_1) + b_2
```

**SwiGLU FFN:**
```
FFN_SwiGLU(x) = W_2 * (Swish(W_1 * x) * (V * x))
```

Where:
- `Swish(x) = x * sigmoid(beta*x)` with beta=1 (equivalent to `SiLU` in PyTorch: `F.silu()`)  
- `*` (Hadamard) is element-wise product  
- `W_1 in R^{d_ff x d_model}`, `V in R^{d_ff x d_model}`, `W_2 in R^{d_model x d_ff}`  
- **No bias terms** (consistent with the no-bias design philosophy)  
- This is a **3-matrix** FFN instead of the standard 2-matrix FFN

### PyTorch Implementation

```python
class SwiGLUFFN(nn.Module):
    def __init__(self, d_model: int, d_ff: int):
        super().__init__()
        self.w1 = nn.Linear(d_model, d_ff, bias=False)  # gate projection
        self.w2 = nn.Linear(d_ff, d_model, bias=False)   # down projection
        self.w3 = nn.Linear(d_model, d_ff, bias=False)   # up projection

    def forward(self, x):
        return self.w2(F.silu(self.w1(x)) * self.w3(x))
```

### The d_ff / d_model Ratio

Because SwiGLU uses 3 weight matrices instead of 2, the parameter count of the FFN increases. To maintain **the same total parameter budget** as a standard 2-matrix FFN with `d_ff = 4 x d_model`:

```
Standard FFN params: 2 x d_model x (4 x d_model) = 8 x d_model^2
SwiGLU FFN params:  3 x d_model x d_ff_swiglu

Setting equal: 3 x d_model x d_ff_swiglu = 8 x d_model^2
d_ff_swiglu = 8/3 x d_model = 2.667 x d_model
```

**LLaMA paper recommends `d_ff = (8/3) x d_model`**, then rounded to the nearest multiple of 64 for hardware efficiency.

| Model | d_model | d_ff | d_ff / d_model |
|-------|---------|------|----------------|
| LLaMA-7B | 4096 | 11008 | 2.688 |
| LLaMA-13B | 5120 | 13824 | 2.700 |
| LLaMA-70B | 8192 | 28672 | 3.500 |

**Recommendation for sub-100M**: Use `d_ff = round_to_64(8/3 x d_model)`. For d_model=576: d_ff=1536. For d_model=768: d_ff=2048.

### Why SwiGLU > GELU

- **Gating mechanism**: The element-wise product creates a multiplicative interaction that acts as a learned, input-dependent gate — more expressive than a simple nonlinearity.
- **PaLM paper** showed SwiGLU outperforms GELU, ReGLU, and GEGLU across model scales.
- **No degradation at small scale**: The gating benefit applies even at sub-100M parameter counts.

---

## 3. RMSNorm

### Formula

**LayerNorm:**
```
LayerNorm(x) = (x - mu) / sqrt(sigma^2 + eps) * gamma + beta
where mu = mean(x), sigma^2 = var(x)
```

**RMSNorm:**
```
RMSNorm(x) = x / sqrt(mean(x^2) + eps) * gamma
```

Key differences:
1. **No mean subtraction** — removes the centering operation
2. **No learnable bias (beta)** — only a learnable scale (gamma)
3. Simpler computation: only needs the root mean square, not the full variance

### PyTorch Implementation

```python
class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.gamma = nn.Parameter(torch.ones(dim))

    def _norm(self, x):
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)

    def forward(self, x):
        output = self._norm(x.float()).type_as(x)
        return output * self.gamma
```

### Why RMSNorm > LayerNorm for Small Models

| Property | LayerNorm | RMSNorm |
|----------|-----------|---------|
| Parameters per norm | d_model (gamma) + d_model (beta) | d_model (gamma only) |
| Computation | mean + variance + center + scale | RMS + scale |
| Training stability | Good | **Comparable** (per arXiv:2409.12951) |
| Empirical performance | Baseline | **Equal or slightly better** |

**Parameter savings**: For d_model=768, each LayerNorm saves 768 parameters (the beta vector). With N_Layers=12 and 3 norms per layer + 1 final = 37 norms, saves ~28K parameters. Small but free.

**The deeper reason**: In the LLaMA-style pre-norm architecture, the normalization sits **before** each sublayer. The residual connection provides a "skip path" for the mean, so explicitly centering (subtracting the mean) in the norm is redundant — the model can learn any needed centering through the weight matrices. RMSNorm preserves the stabilizing **rescaling** effect while removing the unnecessary centering.

### Epsilon Value
- LLaMA uses `eps = 1e-6` (not 1e-5 as in BERT-style models)
- **Recommendation**: Use `1e-6` for bfloat16/float16 training

---

## 4. GQA (Grouped Query Attention)

### How It Works

Standard Multi-Head Attention (MHA): Each of `n_heads` query heads has its own key and value head.

Multi-Query Attention (MQA): All query heads share a **single** key and value head. (Extreme compression.)

**GQA interpolates between MHA and MQA** by grouping query heads into `n_groups` groups, each sharing one KV head:

```
n_kv_heads = n_heads / group_size
```

Where `group_size = n_heads / n_kv_heads` determines how many query heads share each KV head.

### Implementation

```python
class GroupedQueryAttention(nn.Module):
    def __init__(self, d_model: int, n_heads: int, n_kv_heads: int):
        super().__init__()
        self.n_heads = n_heads
        self.n_kv_heads = n_kv_heads
        self.head_dim = d_model // n_heads
        self.n_groups = n_heads // n_kv_heads  # queries per KV head

        self.wq = nn.Linear(d_model, n_heads * self.head_dim, bias=False)
        self.wk = nn.Linear(d_model, n_kv_heads * self.head_dim, bias=False)
        self.wv = nn.Linear(d_model, n_kv_heads * self.head_dim, bias=False)
        self.wo = nn.Linear(n_heads * self.head_dim, d_model, bias=False)

    def forward(self, x, freqs_cis, mask=None):
        bsz, seqlen, _ = x.shape
        q = self.wq(x).view(bsz, seqlen, self.n_heads, self.head_dim)
        k = self.wk(x).view(bsz, seqlen, self.n_kv_heads, self.head_dim)
        v = self.wv(x).view(bsz, seqlen, self.n_kv_heads, self.head_dim)

        # Apply RoPE to q and k
        q, k = apply_rotary_emb(q, k, freqs_cis)

        # Expand KV heads to match query heads
        k = k.repeat_interleave(self.n_groups, dim=2)
        v = v.repeat_interleave(self.n_groups, dim=2)

        # Standard scaled dot-product attention
        # ... (flash attention or manual implementation)
```

### Recommended KV Heads for 8 Query Heads

| Config | n_heads | n_kv_heads | group_size | Quality | KV Cache Saving |
|--------|---------|------------|------------|---------|-----------------|
| MHA | 8 | 8 | 1 | Best | 0% |
| **GQA-4** | 8 | **4** | 2 | **Near-MHA** | **50%** |
| GQA-2 | 8 | 2 | 4 | Slight degradation | 75% |
| MQA | 8 | 1 | 8 | Noticeable loss | 87.5% |

**Recommendation for sub-100M**: Use **4 KV heads for 8 query heads** (GQA with group_size=2). This is the same ratio used by LLaMA-2 70B and LLaMA-3 8B. It provides ~50% KV cache reduction with negligible quality loss.

**For even smaller models** (e.g., 4 query heads with d_model=512): Use **2 KV heads**.

### Parameter Savings Calculation

For d_model=768, n_heads=8, head_dim=96:
- MHA WK: 768 x 768 = 589,824 params; WV: same -> **1,179,648 total**
- GQA-4 WK: 768 x 384 = 294,912; WV: same -> **589,824 total** (50% saving per layer)

With 12 layers, that's **~7.1M saved** — 7% of a 100M budget, which is significant.

---

## 5. Weight Tying

### What It Is
Share the token embedding matrix `W_e in R^{V x d_model}` with the LM head (output projection) `W_out in R^{d_model x V}`:

```
W_out = W_e^T    (or equivalently, nn.Linear with W_out = W_e)
```

### The Super Tiny Language Models Finding (arXiv:2405.14159)

> "The embedding and LM head layers can account for 45.20% to 62.25% of total parameter count depending on whether weight tying is used."

For a model with V=50,000 vocab and d_model=768:
- Embedding: 50,000 x 768 = **38.4M parameters**
- LM head (untied): another **38.4M parameters**
- **Total with tying**: 38.4M; **without tying**: 76.8M

For a 100M model, weight tying can **save up to 38% of total parameters**.

### When to Use Weight Tying for Sub-100M Models

| Scenario | Recommendation |
|----------|---------------|
| Very small vocab (<=32K) | **Yes, tie** — the savings are smaller but still meaningful |
| Standard vocab (~50K) | **Yes, tie** — saves up to 38% of total params |
| Large vocab (100K+) | **Strongly tie** — without tying, most params go to embeddings |
| Need maximum quality | **Trade-off**: untied gives slightly more expressiveness, but at massive param cost |

**Recommendation**: **Always tie for sub-100M models.** Use the saved parameters to increase model depth or width.

---

## 6. No Bias in Linear Layers

### Why This Works

The LLaMA architecture removes bias from ALL linear layers:
- Q, K, V projections: no bias
- Output projection (Wo): no bias
- FFN up/gate/down projections: no bias

**Theoretical justification** (from PaLM paper and Sebastian Raschka's analysis):
1. **RMSNorm already rescales**: After RMSNorm, the activations are centered (mean ~ 0) and normalized. A bias in the subsequent linear layer would shift the distribution away from the normalized state — somewhat counterproductive.
2. **Residual connections provide offset**: The `x + sublayer(Norm(x))` path lets the model learn any needed bias through the residual.
3. **Training stability**: PaLM reported "increased training stability" without biases in large models.

### Parameter Savings

For a linear layer `y = Wx + b`:
- Without bias: `d_out` parameters saved per layer

Per transformer block:
| Layer | Dimensions | Params Saved |
|-------|-----------|-------------|
| Wq | d_model -> n_heads x head_dim | d_model |
| Wk | d_model -> n_kv_heads x head_dim | n_kv_heads x head_dim |
| Wv | d_model -> n_kv_heads x head_dim | n_kv_heads x head_dim |
| Wo | n_heads x head_dim -> d_model | d_model |
| W1 (gate) | d_model -> d_ff | d_ff |
| W3 (up) | d_model -> d_ff | d_ff |
| W2 (down) | d_ff -> d_model | d_model |

For d_model=768, d_ff=2048, n_kv=4, head_dim=96: **~6,400 params/layer x 12 layers = ~77K saved**. Not huge, but it's free and simplifies the model.

**Recommendation**: Remove all biases. The simplification in implementation (no bias management in mixed-precision, weight decay exclusion lists, etc.) is worth more than the parameter savings.

---

## 7. Modern Small Model Training Recipes

### Chinchilla Scaling for Small Models

The Chinchilla paper (Hoffmann et al., 2022) established that compute-optimal training uses approximately **20 tokens per parameter**:

```
N_tokens_optimal = 20 x N_parameters
```

For a 100M model: **~2B tokens** for compute-optimal training.

**However**, for sub-100M models, the community consensus is to **overtrain** significantly:
- **TinyLlama (1.1B)**: Trained on 1T tokens (~1000:1 ratio)
- **Phi models**: Trained on "textbook-quality" data with high repeat tolerance
- **Recommendation for 100M**: Train on **10-50B tokens** (100:1 to 500:1 ratio)

Overtraining small models works because:
1. More data != more overfitting if data is diverse
2. Small models benefit enormously from data quality and repetition
3. The compute cost of overtraining a 100M model is negligible

### Learning Rate Schedule

```python
# Cosine annealing with warmup (the standard for modern LLMs)
def get_lr(step, max_lr, min_lr, warmup_steps, total_steps):
    if step < warmup_steps:
        return max_lr * (step / warmup_steps)
    if step > total_steps:
        return min_lr
    decay_ratio = (step - warmup_steps) / (total_steps - warmup_steps)
    coeff = 0.5 * (1.0 + math.cos(math.pi * decay_ratio))
    return min_lr + coeff * (max_lr - min_lr)
```

**Recommended hyperparameters for sub-100M models:**

| Hyperparameter | Recommended Value | Notes |
|---------------|-------------------|-------|
| Max LR | 3e-4 to 1e-3 | Higher than large models; 6e-4 is a good default |
| Min LR | max_lr x 0.1 | Don't decay to zero |
| Warmup steps | 1-5% of total steps | ~2000 steps for 50B tokens |
| Schedule | Cosine decay | Standard; linear decay also works |
| Weight decay | 0.1 | Apply to all weights, not biases/norms |
| Grad clip | 1.0 | Global gradient norm clipping |
| AdamW beta1, beta2 | 0.9, 0.95 | Standard for LLMs (not 0.999) |
| Epsilon | 1e-8 | Standard |

### Batch Size

| Model Size | Global Batch Size | Seq Length | Tokens/Batch |
|-----------|-------------------|------------|-------------|
| ~50M | 256-512 | 2048 | 0.5M-1M |
| ~100M | 512-1024 | 2048 | 1M-2M |

### Data Mix Strategy

Following the Phi model philosophy of "textbook quality" data:

| Source | Proportion | Rationale |
|--------|-----------|-----------|
| Web text (filtered) | 50-60% | Diverse knowledge |
| Code | 15-20% | Structured reasoning, logical patterns |
| Books/papers | 10-15% | High-quality long-form |
| Wikipedia | 5-10% | Factual accuracy |
| Synthetic/instruction | 5-10% | Task diversity |

**Critical for small models**: Quality > Quantity. Filter aggressively:
- Perplexity filtering (remove pages with high perplexity under a reference model)
- Deduplication (exact and fuzzy)
- Remove low-quality/malicious content
- Prefer shorter, information-dense documents

### Precision

- **Train in bfloat16** (or mixed bf16/fp32)
- Use bf16 for forward/backward, fp32 for optimizer states
- bfloat16 avoids the underflow/overflow issues of float16

---

## 8. Mixed-Precision Quantization

### Which Layers to Keep at Higher Precision

After training, when quantizing for deployment:

| Layer | Recommended Precision | Rationale |
|-------|----------------------|-----------|
| **Token Embedding** | FP16/BF16 (keep high) | Lookup table; quantization destroys semantic structure |
| **LM Head** | FP16/BF16 (keep high) | Direct impact on logit distribution; tied with embedding if weight tying |
| **First & Last Transformer Layers** | FP16 or INT8 | Input/output layers are most sensitive |
| **Middle Transformer Layers** | INT4 or INT8 | Most robust to quantization |
| **Q/K/V Projections** | INT8 preferred | Attention scores are sensitive to Q/K precision |
| **FFN Weights** | INT4 acceptable | FFN activations (SwiGLU gating) provide natural noise tolerance |
| **RMSNorm gamma** | FP16 (keep high) | Small parameters, large impact on magnitude |
| **RoPE frequencies** | FP32 (computed) | Not stored, but computation must be precise |

### Key Insight from SliM-LLM (ICML 2025)

> Salience-driven mixed precision: assign higher precision to weights that have the most impact on attention and FFN outputs. The first and last layers are most salient; middle layers can tolerate 4-bit.

### Practical Quantization Config for 100M Model

```python
# Using bitsandbytes-style mixed quantization
quantization_config = {
    "embedding": "fp16",           # Don't quantize
    "lm_head": "fp16",             # Don't quantize (often tied with embedding)
    "layer_0": "int8",             # First layer: higher precision
    "layer_1_to_N-2": "int4",      # Middle layers: aggressive quantization
    "layer_N-1": "int8",           # Last layer: higher precision
    "rmsnorm_gamma": "fp16",       # Always keep norms in higher precision
}
```

**Expected result**: ~3-4x size reduction with <1% perplexity degradation.

---

## 9. Additional Techniques for Maximizing Intelligence Per Parameter

### 9a. Pre-Norm Architecture (Not Post-Norm)

Place RMSNorm **before** each sublayer, not after:

```
x = x + Attention(RMSNorm(x))
x = x + FFN(RMSNorm(x))
```

**Why**: Pre-norm ensures the residual path is unimpeded — gradients flow directly through the skip connection. Post-norm can cause gradient vanishing in deeper stacks. For small models (10-24 layers), pre-norm provides better training stability.

**Reference**: The "Post-LayerNorm Is Back" paper shows post-norm CAN work with careful initialization, but requires more tuning. Pre-norm is the safer default.

### 9b. Flash Attention

Use Flash Attention 2 during training for:
- **2-4x speedup** on attention computation
- **O(N) memory** instead of O(N^2) for the attention matrix
- Numerically identical results (exact attention, not approximate)

```python
from flash_attn import flash_attn_func
# Replace manual attention with:
attn_output = flash_attn_func(q, k, v, causal=True)
```

This doesn't change the model architecture or parameters — it's purely a training/inference efficiency gain.

### 9c. Vocabulary Size Optimization

For sub-100M models, the vocabulary size is a critical choice:

| Vocab Size | Embedding Params (d=768) | % of 100M Budget |
|-----------|-------------------------|-------------------|
| 32,000 | 24.6M | 24.6% |
| 50,000 | 38.4M | 38.4% |
| 100,000 | 76.8M | 76.8% |

**Recommendation**: Use a **32K-50K BPE vocabulary**. With weight tying, this uses 24-38% of the budget for embeddings — still the single largest component. A well-trained 32K tokenizer (like GPT-2's or LLaMA's) is sufficient.

### 9d. Knowledge Distillation

Train the small model to mimic a larger teacher model's output distribution:

```python
# Standard KD loss
loss = alpha * KL(student_logits/T, teacher_logits/T) + (1-alpha) * CE(student_logits, targets)
```

Where:
- `T` is the temperature (typically 2-5 for softening distributions)
- `alpha` balances KD loss vs standard cross-entropy (0.5-0.7 is common)

**When to use**: If you have access to a good teacher model (e.g., LLaMA-1B or similar), distillation can add 2-5% absolute improvement on benchmarks.

### 9e. Gradient Checkpointing

For training efficiency (not quality), use gradient checkpointing to trade compute for memory:

```python
model.gradient_checkpointing_enable()
```

This re-computes intermediate activations during backward pass instead of storing them, reducing memory from O(NxL) to O(Nxsqrt(L)). Essential for training on consumer GPUs.

### 9f. Overtraining + Data Repeat

For small models, overtraining is beneficial. Use data repetition strategies:
- **Epoch-based**: Pass through data 5-20 times with different shuffling
- **Curriculum**: Start with simpler/shorter sequences, gradually increase
- **Mix in code**: Code data provides structured reasoning patterns that generalize

### 9g. RoPE Scaling for Extended Context

If you need context beyond training length, use RoPE interpolation:

```python
# Linear scaling (simplest)
freqs_cis_scaled = precompute_freqs_cis(dim, max_seq_len * scale_factor)
# At inference, use scale_factor to extend context
```

For sub-100M models, train at 2048 context and scale to 4096 at inference using linear RoPE scaling with scale_factor=2. Quality degrades minimally.

---

## Recommended Architecture for a 100M Parameter Model

Putting it all together:

```python
config = {
    # Core dimensions
    "d_model": 768,           # Hidden dimension
    "n_layers": 12,           # Transformer layers
    "n_heads": 12,            # Query heads
    "n_kv_heads": 4,          # KV heads (GQA with group_size=3)
    "head_dim": 64,           # d_model // n_heads = 768/12 = 64
    "d_ff": 2048,             # FFN inner dim (~ 8/3 x d_model, rounded to 64)
    "vocab_size": 32000,      # BPE vocabulary
    "max_seq_len": 2048,      # Training context length

    # Modern techniques
    "norm": "RMSNorm",        # Pre-normalization with RMSNorm
    "norm_eps": 1e-6,
    "activation": "SwiGLU",   # Gated FFN with SiLU
    "pos_emb": "RoPE",        # Rotary position embeddings
    "rope_theta": 10000.0,
    "bias": False,            # No bias in any linear layer
    "weight_tying": True,     # Share embedding and LM head

    # Training
    "lr_max": 6e-4,
    "lr_min": 6e-5,
    "warmup_steps": 2000,
    "weight_decay": 0.1,
    "adam_beta1": 0.9,
    "adam_beta2": 0.95,
    "grad_clip": 1.0,
    "batch_size": 512,
    "seq_len": 2048,
    "total_tokens": "20-50B",  # Overtrain significantly
    "precision": "bf16",       # Mixed precision training
}
```

### Approximate Parameter Count Breakdown

| Component | Calculation | Parameters |
|-----------|------------|------------|
| Token Embedding | 32000 x 768 | 24.6M |
| LM Head (tied) | 0 | 0M |
| Per Layer: Wq | 768 x 768 | 0.59M |
| Per Layer: Wk | 768 x 256 | 0.20M |
| Per Layer: Wv | 768 x 256 | 0.20M |
| Per Layer: Wo | 768 x 768 | 0.59M |
| Per Layer: W1 (gate) | 768 x 2048 | 1.57M |
| Per Layer: W3 (up) | 768 x 2048 | 1.57M |
| Per Layer: W2 (down) | 2048 x 768 | 1.57M |
| Per Layer: RMSNorm x 2 | 768 + 768 | 0.0015M |
| **Per Layer Total** | | **6.29M** |
| **All 12 Layers** | | **75.5M** |
| Final RMSNorm | 768 | 0.0008M |
| **TOTAL** | | **~100.1M** |

---

## Summary: Priority-Ordered Technique List

| Priority | Technique | Impact | Effort |
|----------|-----------|--------|--------|
| CRITICAL 1 | **Weight tying** | Saves 24-38% of total params | Trivial — one line |
| CRITICAL 2 | **RoPE** | Saves 1-2% params + better extrapolation | Easy — standard implementation |
| CRITICAL 3 | **SwiGLU** | ~2% quality gain over GELU | Easy — standard implementation |
| CRITICAL 4 | **GQA (4 KV heads)** | Saves ~7% params + faster inference | Moderate |
| HIGH 5 | **RMSNorm** | Slightly faster, slightly fewer params | Easy |
| HIGH 6 | **No bias** | Simplifies model, small param savings | Easy |
| HIGH 7 | **Overtraining (100-500x)** | Major quality gain for small models | Just more compute |
| HIGH 8 | **Data quality > quantity** | Critical for small model intelligence | Data curation effort |
| MEDIUM 9 | **Knowledge distillation** | 2-5% quality gain | Need teacher model |
| MEDIUM 10 | **Mixed-precision quant** | 3-4x deployment size reduction | Post-training step |
| MEDIUM 11 | **Flash attention** | Training speedup, same quality | Install flash-attn |

---

## Key References

1. **RoPE**: Su et al., "RoFormer: Enhanced Transformer with Rotary Position Embedding" (2021)
2. **SwiGLU**: Shazeer, "GLU Variants Improve Transformer" (2020); PaLM (Chowdhery et al., 2022)
3. **RMSNorm**: Zhang & Sennrich, "Root Mean Square Layer Normalization" (2019)
4. **GQA**: Ainslie et al., "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints" (2023)
5. **Chinchilla**: Hoffmann et al., "Training Compute-Optimal Large Language Models" (2022)
6. **Super Tiny LMs**: Guertler et al., arXiv:2405.14159 (2024)
7. **SLM Survey**: Sakib et al., arXiv:2505.19529 (2025)
8. **LLaMA**: Touvron et al., "LLaMA: Open and Efficient Foundation Language Models" (2023)
9. **SliM-LLM**: ICML 2025 — salience-driven mixed-precision quantization
10. **RMSNorm vs LayerNorm**: arXiv:2409.12951 — supports RMSNorm as equally effective
