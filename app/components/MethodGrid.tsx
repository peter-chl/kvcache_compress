"use client";

import { useState } from "react";
import Link from "next/link";
import { AXIS_LABELS, type Axis, type Method } from "@/data/methods/types";

type Filter = Axis | "all";

const AXIS_ORDER: Axis[] = ["eviction", "quantization", "architecture", "retrieval"];

function MethodCard({ method }: { method: Method }) {
  return (
    <Link href={`/methods/${method.slug}/`}>
      <div className="group h-full rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/40">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-lg font-semibold text-foreground">{method.name}</h3>
            <p className="text-sm text-muted">{AXIS_LABELS[method.axis]}</p>
          </div>
          <span className="shrink-0 rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted">
            {method.venue ?? method.year}
          </span>
        </div>
        <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-xs text-accent">
            {method.trainingFree ? "training-free" : "requires training"}
          </span>
        </div>
        <p className="mb-3 line-clamp-3 text-sm text-muted">{method.oneLiner}</p>
        <p className="text-xs text-accent/70 transition-colors group-hover:text-accent">
          Read the algorithm →
        </p>
      </div>
    </Link>
  );
}

export default function MethodGrid({ methods }: { methods: Method[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = filter === "all" ? methods : methods.filter((m) => m.axis === filter);
  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${methods.length})` },
    ...AXIS_ORDER.map((axis) => ({
      key: axis,
      label: `${AXIS_LABELS[axis]} (${methods.filter((m) => m.axis === axis).length})`,
    })),
  ];

  return (
    <section className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">Methods</h2>
          {/* flex-wrap so the tabs never force horizontal scroll on phones */}
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === tab.key ? "bg-accent text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MethodCard key={m.slug} method={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
