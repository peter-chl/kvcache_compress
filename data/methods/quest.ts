import type { Method } from "./types";

const REPO = "https://github.com/mit-han-lab/Quest/blob/01c1623bf9395009520874e989e29f683203b357";

export const quest: Method = {
  slug: "quest",
  name: "Quest",
  fullTitle: "Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference",
  venue: "ICML 2024",
  year: 2024,
  axis: "retrieval",
  trainingFree: true,
  oneLiner:
    "Keeps the full KV cache in pages with per-page min/max keys; at each decode step it bounds q·k for every page and attends only to the top-scoring pages.",
  links: [
    { label: "arXiv 2406.10774", url: "https://arxiv.org/abs/2406.10774" },
    { label: "GitHub", url: "https://github.com/mit-han-lab/Quest" },
  ],
  observation: [
    "Attention in long contexts is sparse: apart from the first two layers, the paper finds that fewer than 10% of tokens are enough to keep perplexity on PG19 within 0.01 of full attention. But which tokens matter depends strongly on the current query — in “A is B. C is D. A is”, the token “B” gets little attention from earlier queries and a lot from the final “is”. Eviction policies that drop tokens based on past attention therefore lose tokens that later become critical.",
    "Decoding is memory-bound because every step reads the whole KV cache. Quest keeps every token but reads only the parts that the current query is likely to need.",
  ],
  algorithm: [
    {
      title: "Page the cache and keep page metadata",
      body: "Keys and values are stored in fixed-size pages (`page_size` tokens). For each page and head, a metadata cache holds the element-wise maximum and minimum of the page’s keys, updated whenever tokens are appended — in prefill and in decode.",
    },
    {
      title: "Prefill densely",
      body: "Prompt processing uses ordinary dense causal attention over the paged cache; it only fills the KV pages and their metadata.",
    },
    {
      title: "Estimate page criticality",
      body: "At each decode step, per layer and head, every page (except the last) gets the score `Σᵢ max(qᵢ·maxᵢ, qᵢ·minᵢ)` — an upper bound on q·k for any key in that page.",
    },
    {
      title: "Select the top pages",
      body: "A batched top-k picks `page_budget − 1` pages per head, and the current last page is always added. When the sequence has no more pages than the budget, estimation is skipped and attention is dense.",
    },
    {
      title: "Attend sparsely",
      body: "Paged decode attention then loads only the selected pages’ keys and values.",
    },
    {
      title: "Keep the first layers dense",
      body: "The first two layers get an unlimited page budget and always use full attention.",
    },
  ],
  cacheContents: [
    "The complete KV cache for every token stays on the GPU — in the official implementation it is preallocated for `max_seq_len` — plus min and max key vectors per page, per head, per layer. Memory therefore grows with sequence length at about (1 + 1/`page_size`) times a dense cache.",
    "Quest does not shrink the memory footprint; the paper states that it retains all of the KV cache. What it reduces is the amount of KV read per decode step: the page metadata plus the selected pages.",
  ],
  hyperparameters: [
    { name: "page_size", meaning: "Tokens per page.", value: "16" },
    {
      name: "token_budget",
      meaning: "Tokens attended per decode step; `page_budget = token_budget // page_size`.",
      value: "512 (quest_init default)",
    },
    { name: "skip layers", meaning: "Number of leading layers kept dense.", value: "2" },
  ],
  tradeoffs: [
    "No capacity savings: the whole cache plus metadata stays resident, so the benefit is per-step bandwidth and latency, not longer contexts or larger batches in the same memory.",
    "Prefill is not accelerated; sparsity applies only to decoding, and the first two layers stay dense.",
    "The end-to-end implementation assumes batch size 1.",
    "The repo’s accuracy-evaluation code simulates Quest by computing full attention and masking it with the page selection — faithful for accuracy, but not the fast kernel path.",
  ],
  sources: [
    { label: "Paper PDF in repo (assets/quest_paper.pdf)", url: `${REPO}/assets/quest_paper.pdf` },
    { label: "README", url: `${REPO}/README.md` },
    { label: "kernels/include/decode/decode_attn.cuh — page score estimate", url: `${REPO}/kernels/include/decode/decode_attn.cuh#L138-L164` },
    { label: "quest/utils/controller.py — page budget and metadata", url: `${REPO}/quest/utils/controller.py` },
    { label: "quest/models/llama.py — layer skipping, defaults", url: `${REPO}/quest/models/llama.py#L420-L552` },
    { label: "evaluation/quest_attention.py — accuracy simulation", url: `${REPO}/evaluation/quest_attention.py` },
  ],
};
