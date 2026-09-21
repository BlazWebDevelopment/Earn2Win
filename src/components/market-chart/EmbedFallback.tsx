import { ArrowUpRight, TriangleAlert } from "lucide-react";

/**
 * Shown when the third-party chart cannot load — a blocked script, an offline
 * provider, or a tracker blocker. It names the cause and still gives a way to
 * see the chart, rather than leaving an empty box.
 */
export function EmbedFallback({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-muted">
        <TriangleAlert size={18} aria-hidden />
      </span>
      <p className="mt-4 text-[14px] font-medium">Chart could not load</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-fg-secondary">
        The {label} chart is embedded from a third party. A browser extension or
        network block may be preventing it from loading.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="press mt-4 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[13px] font-medium text-fg-secondary hover:border-line-strong hover:text-fg"
      >
        Open on {label}
        <ArrowUpRight size={13} aria-hidden />
      </a>
    </div>
  );
}
