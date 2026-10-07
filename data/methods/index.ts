import type { Method } from "./types";
import { streamingllm } from "./streamingllm";
import { h2o } from "./h2o";
import { snapkv } from "./snapkv";
import { kivi } from "./kivi";
import { mla } from "./mla";
import { quest } from "./quest";

export type { Method } from "./types";

/** Display order: grouped by axis, then by first release. */
export const methods: Method[] = [h2o, streamingllm, snapkv, kivi, mla, quest];

export function getMethodBySlug(slug: string): Method | undefined {
  return methods.find((m) => m.slug === slug);
}
