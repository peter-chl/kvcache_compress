import type { Method } from "./types";

const REPO = "https://github.com/FasterDecoding/SnapKV/blob/e216ddc84c5bd210378cbdbbba12ba02102aa640";

export const snapkv: Method = {
  slug: "snapkv",
  name: "SnapKV",
  fullTitle: "SnapKV: LLM Knows What You are Looking for Before Generation",
  venue: "NeurIPS 2024",
  year: 2024,
  axis: "eviction",
  trainingFree: true,
  oneLiner:
    "Compresses the prompt’s KV once, at prefill: each head keeps the positions that the last few prompt tokens attend to most, smoothed by pooling, plus those last tokens themselves.",
  links: [
    { label: "arXiv 2404.14469", url: "https://arxiv.org/abs/2404.14469" },
    { label: "GitHub", url: "https://github.com/FasterDecoding/SnapKV" },
  ],
  observation: [
    "The paper reports that each attention head consistently focuses on specific prompt positions throughout generation, and that this pattern can already be read off an “observation window” at the end of the prompt, before any token is generated. The pattern also depends on the instruction being asked, which argues for compression that looks at the actual query rather than a fixed rule.",
    "Keeping only the single highest-scoring positions fragments information — the paper’s example is a model that keeps a phone number’s country code and invents the rest. So SnapKV also keeps the neighbours of high-scoring positions.",
  ],
  algorithm: [
    {
      title: "Trigger only at prefill",
      body: "`update_kv` runs when the key and query lengths are equal, i.e. during prompt processing. If the prompt is shorter than `max_capacity_prompt`, its KV is stored uncompressed.",
    },
    {
      title: "Vote with the observation window",
      body: "Compute attention from the last `window_size` queries to all prompt keys (with a causal mask inside the window), apply softmax, and sum the weights over those window queries. This gives one importance score per prefix position, per head.",
    },
    {
      title: "Cluster by pooling",
      body: "Smooth the scores with a 1-D `avg_pool1d` or `max_pool1d` (stride 1, `kernel_size` wide, same padding), so that neighbours of a high-scoring position score highly too.",
    },
    {
      title: "Select per head",
      body: "For each head independently, take the `topk(max_capacity_prompt - window_size)` prefix positions and gather their keys and values. Different heads can keep different positions.",
    },
    {
      title: "Store selected prefix + window",
      body: "Concatenate the selected prefix KV with the full KV of the observation window and write that to the cache. The prefill attention itself still uses the full, uncompressed keys and values — only the cache is compressed.",
    },
    {
      title: "Decode normally",
      body: "During generation, new tokens’ KV are appended as usual and nothing further is evicted. A separate `kv_seq_len` counter keeps track of the true sequence position for RoPE.",
    },
  ],
  cacheContents: [
    "Per layer and head: `max_capacity_prompt - window_size` selected prefix positions (which can differ between heads), the last `window_size` prompt positions, and every generated token. The prompt portion is therefore capped at `max_capacity_prompt` regardless of prompt length, but the cache still grows linearly during decoding.",
    "In the official Llama patch, `repeat_kv` is applied before compression, so for grouped-query-attention models the compressed cache is stored at the expanded query-head count rather than per KV head.",
  ],
  hyperparameters: [
    {
      name: "window_size",
      meaning: "Length of the observation window at the end of the prompt; always kept.",
      value: "32",
    },
    {
      name: "max_capacity_prompt",
      meaning: "Total prompt KV budget per head (selected prefix + window).",
      value: "2048",
    },
    {
      name: "kernel_size",
      meaning: "Width of the pooling kernel used for clustering.",
      value: "5 (LongBench configs use 7)",
    },
    {
      name: "pooling",
      meaning: "`avgpool` or `maxpool`.",
      value: "avgpool (LongBench configs use maxpool)",
    },
  ],
  tradeoffs: [
    "Compression happens once, at prefill. The paper notes it does not reduce prompt-processing cost and cannot extend a model’s native context length; the KV of generated tokens is never compressed.",
    "Selection is driven by the end of the prompt, usually the question. If a later turn needs tokens that were evicted, they cannot be recovered.",
    "Prefill computes an extra window-by-prompt attention matrix outside the fused attention kernel, and the full prompt KV must still fit in memory during prefill.",
    "The official implementation monkey-patches Llama, Mistral and Mixtral and is tested with `transformers==4.37`.",
  ],
  sources: [
    { label: "README (supported models, citation)", url: `${REPO}/README.md` },
    { label: "snapkv/monkeypatch/snapkv_utils.py — SnapKVCluster", url: `${REPO}/snapkv/monkeypatch/snapkv_utils.py#L23-L87` },
    { label: "snapkv/monkeypatch/llama_hijack_4_37.py — cache update", url: `${REPO}/snapkv/monkeypatch/llama_hijack_4_37.py#L55-L90` },
    { label: "Paper source in repo (notebooks/snapkv.txt)", url: `${REPO}/notebooks/snapkv.txt` },
    { label: "LongBench experiment configs", url: `${REPO}/experiments/LongBench/config` },
    { label: "NeurIPS 2024 proceedings", url: "https://proceedings.neurips.cc/paper_files/paper/2024/hash/28ab418242603e0f7323e54185d19bde-Abstract.html" },
  ],
  unconfirmed: [
    "The paper text used is the LaTeX source shipped in the repo, which may predate the NeurIPS camera-ready version.",
  ],
};
