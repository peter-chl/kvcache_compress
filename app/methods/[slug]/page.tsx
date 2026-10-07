import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { methods, getMethodBySlug } from "@/data/methods";
import { AXIS_LABELS } from "@/data/methods/types";
import Prose from "@/app/components/Prose";
import SiteFooter from "@/app/components/SiteFooter";

export function generateStaticParams() {
  return methods.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const method = getMethodBySlug(slug);
  if (!method) return { title: "Not Found" };
  return { title: method.name, description: method.oneLiner };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">{children}</h2>
  );
}

export default async function MethodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const method = getMethodBySlug(slug);
  if (!method) notFound();

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            ← Back
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground">{method.name}</h1>
            <p className="text-xs text-muted">
              {AXIS_LABELS[method.axis]} · {method.venue ?? method.year} ·{" "}
              {method.trainingFree ? "training-free" : "requires training"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <p className="mb-1 text-sm italic text-muted">{method.fullTitle}</p>
        <p className="mb-4 max-w-3xl text-base leading-relaxed text-foreground">
          <Prose text={method.oneLiner} />
        </p>

        <div className="mb-10 flex flex-wrap gap-2">
          {method.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              {link.label}
              <span className="text-muted/40">&#8599;</span>
            </a>
          ))}
        </div>

        <div className="max-w-3xl space-y-12">
          <section>
            <SectionLabel>Observation</SectionLabel>
            <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
              {method.observation.map((p, i) => (
                <p key={i}>
                  <Prose text={p} />
                </p>
              ))}
            </div>
          </section>

          <section>
            <SectionLabel>Algorithm</SectionLabel>
            <ol className="space-y-3">
              {method.algorithm.map((step, i) => (
                <li key={i} className="flex gap-4 rounded-lg border border-border bg-surface p-4">
                  <span className="font-mono text-sm font-bold text-accent">{i + 1}</span>
                  <div className="min-w-0">
                    <h3 className="mb-1 text-sm font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">
                      <Prose text={step.body} />
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionLabel>What&apos;s in the cache</SectionLabel>
            <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
              {method.cacheContents.map((p, i) => (
                <p key={i}>
                  <Prose text={p} />
                </p>
              ))}
            </div>
          </section>

          {method.hyperparameters.length > 0 && (
            <section>
              <SectionLabel>Hyperparameters</SectionLabel>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs text-muted">
                    <tr>
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Meaning</th>
                      <th className="px-4 py-2 font-medium">Official value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {method.hyperparameters.map((h) => (
                      <tr key={h.name} className="border-t border-border align-top">
                        <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-accent">{h.name}</td>
                        <td className="px-4 py-2 text-muted">
                          <Prose text={h.meaning} />
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-foreground">
                          {h.value ? <Prose text={h.value} /> : <span className="text-muted">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <SectionLabel>Trade-offs</SectionLabel>
            <ul className="space-y-2 text-sm leading-relaxed text-muted">
              {method.tradeoffs.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent">–</span>
                  <span>
                    <Prose text={t} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {method.unconfirmed && method.unconfirmed.length > 0 && (
            <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
                Not yet confirmed
              </h2>
              <ul className="space-y-1 text-sm text-muted">
                {method.unconfirmed.map((u, i) => (
                  <li key={i}>
                    <Prose text={u} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <SectionLabel>Sources</SectionLabel>
            <ul className="space-y-1 text-sm">
              {method.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-muted transition-colors hover:text-accent"
                  >
                    {s.label} <span className="text-muted/40">&#8599;</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
