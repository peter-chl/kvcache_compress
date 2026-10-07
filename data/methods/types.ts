export type Axis = "eviction" | "quantization" | "architecture" | "retrieval";

export const AXIS_LABELS: Record<Axis, string> = {
  eviction: "Token Eviction",
  quantization: "Quantization",
  architecture: "Head & Layer Sharing",
  retrieval: "Offloading & Retrieval",
};

export interface Link {
  label: string;
  url: string;
}

export interface AlgorithmStep {
  title: string;
  body: string;
}

export interface Hyperparameter {
  name: string;
  meaning: string;
  /** Value in the official code or config, or undefined when not confirmed. */
  value?: string;
}

/**
 * One KV cache compression method. Prose fields may use `backticks` for inline code.
 * Only include facts confirmed from a listed source; put anything else in `unconfirmed`.
 */
export interface Method {
  slug: string;
  name: string;
  fullTitle: string;
  /** Venue and year, only when confirmed. */
  venue?: string;
  /** Year of first public release (arXiv v1). */
  year: number;
  axis: Axis;
  trainingFree: boolean;
  oneLiner: string;
  links: Link[];
  observation: string[];
  algorithm: AlgorithmStep[];
  cacheContents: string[];
  hyperparameters: Hyperparameter[];
  tradeoffs: string[];
  /** Where the description above comes from. */
  sources: Link[];
  /** Details we could not confirm from a primary source. */
  unconfirmed?: string[];
}
