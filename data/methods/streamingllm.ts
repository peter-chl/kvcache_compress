import type { Method } from "./types";

const REPO = "https://github.com/mit-han-lab/streaming-llm/blob/2e5042606d69933d88fbf909bd77907456b9b4dd";

export const streamingllm: Method = {
  slug: "streamingllm",
  name: "StreamingLLM",
  fullTitle: "Efficient Streaming Language Models with Attention Sinks",
  venue: "ICLR 2024",
  year: 2023,
  axis: "eviction",
  trainingFree: true,
  oneLiner:
    "Keeps the KV of the first few “attention sink” tokens plus a rolling window of recent tokens, and assigns positions by place in the cache rather than in the original text.",
  links: [
    { label: "arXiv 2309.17453", url: "https://arxiv.org/abs/2309.17453" },
    { label: "GitHub", url: "https://github.com/mit-han-lab/streaming-llm" },
  ],
  observation: [
    "Window attention, which caches only the most recent tokens, breaks down as soon as the text grows past the cache size: once the very first tokens are evicted, perplexity explodes. The authors find that LLMs assign large attention scores to the initial tokens even when those tokens carry no special meaning, and call them attention sinks.",
    "Their explanation is that softmax forces attention weights to sum to one, and the initial tokens are visible to every later token under causal masking, so they become a default place to put “unused” attention. Replacing the first four tokens with newlines also restores perplexity, which indicates the effect comes from position, not content. A handful of sink tokens (four, in the authors’ slides) is generally enough.",
  ],
  algorithm: [
    {
      title: "Patch attention and create the cache policy",
      body: "`enable_streaming_llm(model, start_size, recent_size)` patches the attention forward for Llama, GPT-NeoX and Falcon and returns a `StartRecentKVCache` that knows which tensor axis is the sequence axis for that architecture.",
    },
    {
      title: "Cache keys before rotary embedding",
      body: "In the patched Llama attention, RoPE is applied only to the query. The new key is concatenated with the cached keys without position encoding, and that un-rotated tensor is what gets stored as the cache.",
    },
    {
      title: "Re-rotate keys by their position in the cache",
      body: "At every forward pass, all cached keys are rotated with `key_position_ids = arange(kv_seq_len)` — their index inside the cache, not their index in the original stream. This keeps relative distances within the model’s trained range no matter how long the stream gets.",
    },
    {
      title: "Evict the middle once the cache is full",
      body: "After each step, `StartRecentKVCache.__call__` checks the cache length. While it is at most `start_size + recent_size` nothing happens; beyond that it keeps positions `[0, start_size)` and the last `recent_size` positions and drops everything in between. No token is scored — selection depends only on position.",
    },
    {
      title: "Chat variant: make room per turn",
      body: "The streaming chat demo evicts once per user turn instead of per token: before each prompt, `evict_for_space` keeps the sinks and enough recent tokens to leave room for the prompt plus `max_gen_len` new tokens, then generation proceeds without further eviction.",
    },
  ],
  cacheContents: [
    "In every layer, the cache holds keys and values for the first `start_size` tokens (the sinks) plus the most recent tokens, capped at `start_size + recent_size` entries. In the Llama implementation keys are stored without RoPE and rotated on the fly. Cache size is constant in the total stream length.",
  ],
  hyperparameters: [
    {
      name: "start_size",
      meaning: "Number of initial sink tokens that are never evicted.",
      value: "4 (class default and chat demo)",
    },
    {
      name: "recent_size",
      meaning: "Length of the rolling window of most recent tokens.",
      value: "512 (class default); 2000 in the chat demo",
    },
  ],
  tradeoffs: [
    "It does not extend the context window. Evicted middle tokens are gone for good, so the model only “sees” the sinks and the latest tokens — the README’s example is that summarising a book would only cover its ending.",
    "The cache size is still bounded by the pre-training context length (the README cites 4096 for Llama-2); the README notes it can be combined with context-extension methods.",
    "Because selection is purely positional, important tokens in the middle of the context are discarded regardless of how much attention they receive.",
    "RoPE models need the modified attention so that keys are re-rotated by cache position, which recomputes the rotary embedding over the whole cache at each step. The official patches target Llama, GPT-NeoX and Falcon on `transformers==4.33.0`.",
  ],
  sources: [
    { label: "README (abstract, FAQ, supported setup)", url: `${REPO}/README.md` },
    { label: "streaming_llm/kv_cache.py — StartRecentKVCache", url: `${REPO}/streaming_llm/kv_cache.py` },
    { label: "streaming_llm/pos_shift/modify_llama.py — position shift", url: `${REPO}/streaming_llm/pos_shift/modify_llama.py#L85-L103` },
    { label: "streaming_llm/enable_streaming_llm.py", url: `${REPO}/streaming_llm/enable_streaming_llm.py` },
    { label: "examples/run_streaming_llama.py — chat demo", url: `${REPO}/examples/run_streaming_llama.py` },
    { label: "Authors’ slides (assets/StreamingLLM.pdf)", url: `${REPO}/assets/StreamingLLM.pdf` },
    { label: "ICLR 2024 proceedings", url: "https://proceedings.iclr.cc/paper_files/paper/2024/file/5e5fd18f863cbe6d8ae392a93fd271c9-Paper-Conference.pdf" },
  ],
  unconfirmed: [
    "The full paper text was not readable from this environment; the summary is based on the official code, README and the authors’ slides. The paper also proposes pre-training with a dedicated sink token, which is not covered here.",
  ],
};
