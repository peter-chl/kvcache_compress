import type { Method } from "./types";

const V2 = "https://github.com/deepseek-ai/DeepSeek-V2/blob/ec98ee3cbffc32104cd55dba8af884b3d772602a";
const V3 = "https://github.com/deepseek-ai/DeepSeek-V3/blob/9b4e9788e4a3a731f7567338ed15d3ec549ce03b";

export const mla: Method = {
  slug: "mla",
  name: "Multi-head Latent Attention",
  fullTitle: "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model",
  year: 2024,
  axis: "architecture",
  trainingFree: false,
  oneLiner:
    "Replaces multi-head attention with a design that caches one low-rank latent vector per token plus a small shared RoPE key, instead of full per-head keys and values.",
  links: [
    { label: "arXiv 2405.04434", url: "https://arxiv.org/abs/2405.04434" },
    { label: "DeepSeek-V2", url: "https://github.com/deepseek-ai/DeepSeek-V2" },
    { label: "Reference code", url: `${V3}/inference/model.py` },
  ],
  observation: [
    "With standard multi-head attention, each token caches `2 · n_h · d_h` elements per layer, and this cache limits batch size and sequence length during generation. Multi-query and grouped-query attention shrink it, but the paper’s ablations find them weaker than full multi-head attention.",
    "MLA aims for a cache comparable to GQA with quality at least matching MHA, by compressing keys and values jointly into a shared latent and reconstructing per-head keys and values from it.",
  ],
  algorithm: [
    {
      title: "Jointly down-project keys and values",
      body: "Each token’s hidden state is projected to a latent `c_t = W_DKV · h_t` of dimension `d_c`, much smaller than `n_h · d_h`. In the reference code `wkv_a` produces this latent (followed by an RMSNorm, `kv_norm`) together with the RoPE key input.",
    },
    {
      title: "Up-project to per-head keys and values",
      body: "Per-head content keys and values are reconstructed from the latent with `W_UK` and `W_UV` (`wkv_b` in the code).",
    },
    {
      title: "Compress queries too (training memory only)",
      body: "Queries go through their own low-rank bottleneck (`wq_a` → `q_norm` → `wq_b`). The paper notes this reduces activation memory in training but not the KV cache.",
    },
    {
      title: "Decouple rotary position encoding",
      body: "Applying RoPE to the reconstructed keys would put a position-dependent rotation between `W_UK` and the query and block the absorption trick below. Instead, MLA adds separate per-head RoPE queries and a single RoPE key shared by all heads, concatenates them with the content parts, and scales scores by `1/√(d_h + d_h^R)`.",
    },
    {
      title: "Absorb the up-projections at inference",
      body: "Because `W_UK` can be folded into the query projection and `W_UV` into the output projection, per-head keys and values never need to be materialised. The reference code’s default `attn_impl = \"absorb\"` maps queries into the latent space, scores them against the cached latents plus the cached RoPE keys, and applies the value up-projection after attention. A `naive` path that caches full per-head keys and values is kept for reference.",
    },
  ],
  cacheContents: [
    "Per token per layer, MLA caches the latent `c_t` (`d_c` elements) and the shared RoPE key (`d_h^R` elements): `(d_c + d_h^R) · l` across `l` layers, versus `2 · n_h · d_h · l` for multi-head attention.",
    "DeepSeek-V2 uses `d_c = 512` and `d_h^R = 64` with 128 heads of dimension 128, so it caches 576 elements per token per layer where multi-head attention with the same heads would cache 32,768. The paper describes this as equal to GQA with only 2.25 groups.",
  ],
  hyperparameters: [
    { name: "kv_lora_rank", meaning: "KV latent dimension `d_c`.", value: "512" },
    { name: "qk_rope_head_dim", meaning: "Per-head dimension of the decoupled RoPE query/key, `d_h^R`.", value: "64" },
    { name: "q_lora_rank", meaning: "Query compression dimension.", value: "1536" },
    { name: "qk_nope_head_dim", meaning: "Per-head dimension of the non-RoPE query/key, `d_h`.", value: "128" },
    { name: "v_head_dim", meaning: "Per-head value dimension.", value: "128" },
    { name: "n_heads", meaning: "Attention heads, `n_h`.", value: "128" },
  ],
  tradeoffs: [
    "It is an architectural change with new learned projections, so the model must be pretrained (or retrained) with it; it cannot be dropped into an existing multi-head attention checkpoint.",
    "With absorption, attention runs in the 512-dimensional latent space for every head instead of reading per-head keys and values — the cache is smaller, but the per-head score computation is wider.",
    "Position encoding needs the decoupled RoPE key; without it, keys for all cached tokens would have to be recomputed during inference.",
    "The headline inference gains reported for DeepSeek-V2 compare whole systems (against DeepSeek 67B) and also include FP8 weights and KV cache quantization, so they do not isolate MLA.",
  ],
  sources: [
    { label: "DeepSeek-V2 technical report (PDF in repo), Sec. 2.1 and 3.1.2", url: `${V2}/deepseek-v2-tech-report.pdf` },
    { label: "DeepSeek-V2 README", url: `${V2}/README.md` },
    { label: "DeepSeek-V3 inference/model.py — MLA class (naive and absorb)", url: `${V3}/inference/model.py#L396-L497` },
    { label: "DeepSeek-V3 inference/configs/config_236B.json — V2 dimensions", url: `${V3}/inference/configs/config_236B.json` },
  ],
  unconfirmed: [
    "No peer-reviewed venue was found; the paper is cited as an arXiv preprint.",
    "The absorb-mode code cited is DeepSeek-V3’s reference implementation, whose 236B config matches DeepSeek-V2’s dimensions; DeepSeek-V2’s own released inference code was not checked.",
  ],
};
