import type { Method } from "./types";

const REPO = "https://github.com/jy-yuan/KIVI/blob/876b4d2d08e3b1d5f70d0969c299d8c7c42ddfb6";

export const kivi: Method = {
  slug: "kivi",
  name: "KIVI",
  fullTitle: "KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache",
  venue: "ICML 2024",
  year: 2024,
  axis: "quantization",
  trainingFree: true,
  oneLiner:
    "Quantizes the KV cache to 2 bits with a scale and zero-point — keys per channel, values per token — while keeping the most recent tokens in full precision.",
  links: [
    { label: "arXiv 2402.02750", url: "https://arxiv.org/abs/2402.02750" },
    { label: "GitHub", url: "https://github.com/jy-yuan/KIVI" },
  ],
  observation: [
    "The key cache has a few fixed channels with very large magnitudes across all tokens. Grouping keys per channel confines the quantization error to each channel instead of letting outliers inflate the error of normal channels.",
    "The value cache shows no such outlier pattern. Because the attention output is a weighted mix of value rows, values are grouped per token so that each token’s quantization error stays its own. This combination — keys per channel, values per token — is the “asymmetric” in the title.",
  ],
  algorithm: [
    {
      title: "Prefill in full precision",
      body: "Attention over the prompt is computed with unquantized keys and values (flash-attention) before anything is quantized.",
    },
    {
      title: "Quantize prompt keys per channel",
      body: "With prompt length L, the last `L % residual_length` keys stay in fp16. The rest are transposed so tokens are the last axis and quantized in groups of `group_size` consecutive tokens within each channel: each group stores a `scale = (max − min) / (2^bits − 1)` and its minimum, and the rounded codes are bit-packed into int32.",
    },
    {
      title: "Quantize prompt values per token",
      body: "The last `residual_length` values stay in fp16. Older values are quantized along the head dimension, in groups of `group_size` channels within each token.",
    },
    {
      title: "Decode with mixed precision",
      body: "Each step appends the new key and value to the fp16 residuals. Scores are computed by a fused kernel on the packed keys plus an fp16 matmul on the residual keys; the output likewise combines the kernel on quantized values with a matmul on the fp16 values.",
    },
    {
      title: "Flush keys in blocks",
      body: "When the fp16 key residual reaches exactly `residual_length` tokens, the whole block is quantized per channel, appended to the packed keys, and the residual is cleared. The code requires `residual_length` to be a multiple of `group_size`.",
    },
    {
      title: "Flush values one token at a time",
      body: "When the fp16 value window reaches `residual_length + 1` tokens, the oldest one is quantized per token and appended, so the window stays a sliding window of `residual_length` tokens.",
    },
  ],
  cacheContents: [
    "Per layer: bit-packed key codes with an fp16 scale and minimum per (channel, group of `group_size` tokens); an fp16 key residual of 0 to `residual_length` tokens; bit-packed value codes with a scale and minimum per (token, group of `group_size` channels); and an fp16 value residual of up to `residual_length` tokens.",
    "The quantized part still grows linearly with sequence length, at roughly `bits`/16 of the fp16 size plus scale and zero-point overhead; the full-precision part is bounded by `residual_length`. (This size accounting is derived from the code.)",
  ],
  hyperparameters: [
    { name: "k_bits", meaning: "Key bit-width (README: 2 or 4).", value: "2" },
    { name: "v_bits", meaning: "Value bit-width.", value: "2" },
    {
      name: "group_size",
      meaning: "Elements per quantization group — tokens for keys, channels for values.",
      value: "32 in example.py",
    },
    {
      name: "residual_length",
      meaning: "Number of recent tokens kept in fp16.",
      value: "32 in example.py; 128 in the LongBench docs",
    },
  ],
  tradeoffs: [
    "Needs custom kernels — Triton quantize-and-pack plus a separately installed CUDA extension for the mixed-precision matmul — and replacement Llama/Mistral model classes; the attention class requires flash-attention.",
    "Keys can only be quantized in whole token groups, so recent tokens must stay in fp16. The key residual is flushed in blocks and therefore swings between 0 and `residual_length` tokens.",
    "For models whose KV is already reduced by grouped- or multi-query attention, the authors recommend 4-bit rather than 2-bit KIVI.",
    "The prompt is attended in full precision, so only later decode steps see quantized keys and values.",
  ],
  sources: [
    { label: "README (description, setup, citation)", url: `${REPO}/README.md` },
    { label: "models/llama_kivi.py — prefill and decode paths", url: `${REPO}/models/llama_kivi.py#L264-L460` },
    { label: "quant/new_pack.py — quantize and pack", url: `${REPO}/quant/new_pack.py#L217-L252` },
    { label: "example.py — default configuration", url: `${REPO}/example.py` },
    { label: "docs/long_bench.md — GQA recommendation", url: `${REPO}/docs/long_bench.md` },
    { label: "ICML 2024 proceedings", url: "https://proceedings.mlr.press/v235/liu24bz.html" },
  ],
  unconfirmed: [
    "The paper text was not readable from this environment. The observation about key outlier channels and per-token values comes from search excerpts of the paper and matches what the code does, but was not checked against the full text.",
  ],
};
