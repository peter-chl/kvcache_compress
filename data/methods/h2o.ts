import type { Method } from "./types";

const REPO = "https://github.com/FMInference/H2O/blob/ac75c2a8a9e76832b2a4139b9363373b56336bfb";

export const h2o: Method = {
  slug: "h2o",
  name: "H2O",
  fullTitle: "H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models",
  venue: "NeurIPS 2023",
  year: 2023,
  axis: "eviction",
  trainingFree: true,
  oneLiner:
    "Keeps a fixed KV budget per head: the most recent tokens plus the “heavy hitters” that have accumulated the most attention so far. Everything else is evicted.",
  links: [
    { label: "arXiv 2306.14048", url: "https://arxiv.org/abs/2306.14048" },
    { label: "GitHub", url: "https://github.com/FMInference/H2O" },
  ],
  observation: [
    "A small fraction of tokens contributes most of the attention mass. The authors call these tokens Heavy Hitters (H₂), report that they emerge naturally and correlate strongly with frequently co-occurring tokens in the text, and that removing them significantly degrades quality.",
    "Based on this, the paper frames KV cache eviction as a dynamic submodular problem and gives a theoretical guarantee for a greedy policy that keeps a balance of recent tokens and heavy hitters.",
  ],
  algorithm: [
    {
      title: "Attend over cache plus new tokens",
      body: "In every forward pass — prefill and each decode step — the new keys and values are concatenated with the cached ones and ordinary softmax attention is computed over all of them.",
    },
    {
      title: "Accumulate attention scores",
      body: "`_update_hh_score` sums the attention weights over the batch and query dimensions to get one score per key, per head, and adds it to the running `hh_score`. A key’s score is the total attention it has received from every query since it entered the cache.",
    },
    {
      title: "Check the budget",
      body: "If the cache length is at most `hh_size + recent_size`, nothing is evicted.",
    },
    {
      title: "Choose what to keep, per head",
      body: "The last `recent_size` positions are always kept. Among the older positions, `torch.topk` selects the `hh_size` positions with the highest accumulated score, independently for each head.",
    },
    {
      title: "Prune keys, values and scores",
      body: "A boolean mask gathers the kept keys and values and prunes `hh_score` to match, leaving exactly `hh_size + recent_size` entries. This runs right after the attention softmax, so it already applies at prefill when the prompt exceeds the budget, and then at every decode step: one token in, one token out.",
    },
  ],
  cacheContents: [
    "Per layer and head: keys and values for `hh_size` heavy-hitter tokens and the `recent_size` most recent tokens, plus one float score per entry. Between steps the size is constant at `hh_size + recent_size`, independent of sequence length; different heads can keep different tokens.",
    "In the default real-drop implementation keys are cached after RoPE, at their original positions. A separate streaming variant caches keys without RoPE and re-rotates them by their slot in the cache, as in StreamingLLM.",
  ],
  hyperparameters: [
    {
      name: "hh_size",
      meaning: "Number of heavy-hitter tokens kept per head.",
      value: "1024 in the summarization script",
    },
    {
      name: "recent_size",
      meaning: "Size of the always-kept window of recent tokens.",
      value: "1024 in the summarization script",
    },
  ],
  tradeoffs: [
    "Scores are built from the explicit attention probabilities at every step, so the method needs the attention matrix materialised — fused kernels that never produce it, such as FlashAttention, cannot be used as-is.",
    "Eviction is permanent: a token dropped early cannot come back if a later query needs it.",
    "The official real-drop code is LLaMA-only and assumes batch size 1. Its score and mask are sized by attention heads while the cache holds KV heads, so as written it lines up only for multi-head (not grouped-query) attention.",
    "The repo also contains a simulation path that masks attention logits instead of dropping KV (useful for accuracy studies, not memory savings) and a FlexGen-based path for throughput benchmarks.",
  ],
  sources: [
    { label: "README (overview, code paths)", url: `${REPO}/README.md` },
    { label: "h2o_hf/utils_real_drop/modify_llama.py — H2OKVCache_LayerWise", url: `${REPO}/h2o_hf/utils_real_drop/modify_llama.py#L240-L330` },
    { label: "h2o_hf/run_summarization.py — budgets", url: `${REPO}/h2o_hf/run_summarization.py` },
    { label: "h2o_hf/utils_hh/modify_llama.py — simulation path", url: `${REPO}/h2o_hf/utils_hh/modify_llama.py` },
    { label: "NeurIPS 2023 proceedings", url: "https://proceedings.neurips.cc/paper_files/paper/2023/hash/6ceefa7b15572587b78ecfcebb2827f8-Abstract.html" },
  ],
  unconfirmed: [
    "The paper text was not readable from this environment. The observation is taken from the official README’s summary of the paper; the greedy algorithm’s formal statement and assumptions were not checked against the paper.",
  ],
};
