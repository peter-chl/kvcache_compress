import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold tracking-tight text-accent">
            {">"}_
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            kvcache_compress
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="https://peter-chl.github.io/model_arch/"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            model_arch
          </a>
          <a
            href="https://github.com/peter-chl/kvcache_compress"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
