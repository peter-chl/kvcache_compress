import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

const AXES = [
  {
    title: "Token Eviction",
    desc: "Which cached tokens to keep, drop, or merge as the context grows.",
  },
  {
    title: "Quantization",
    desc: "Storing keys and values at lower bit-widths, and how the error is controlled.",
  },
  {
    title: "Head & Layer Sharing",
    desc: "Architectural changes that shrink the cache by design — fewer KV heads, latent projections, cross-layer reuse.",
  },
  {
    title: "Offloading & Retrieval",
    desc: "Keeping the full cache in slower memory and fetching only what each decode step needs.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            KV Cache
            <br />
            Compression
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted">
            A technical reference for methods that shrink the key-value cache in
            LLM inference. What each method compresses, what it costs, and what
            its paper actually reports — with every number traced to a source.
          </p>
        </div>
      </section>

      {/* What's covered */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted">
            What&apos;s covered
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AXES.map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="font-mono text-sm font-semibold text-accent">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methods — empty until the first verified entries land */}
      <section className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted">
            Methods
          </h2>
          <div className="rounded-lg border border-dashed border-border bg-surface/50 p-10 text-center">
            <p className="text-sm text-muted">
              Method pages are in progress.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
