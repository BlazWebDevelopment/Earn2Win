import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/* ───────────────────────────── Card ───────────────────────────── */

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds the subtle hover border lift used on interactive cards. */
  interactive?: boolean;
  as?: "div" | "article" | "section" | "li";
}

export function Card({
  children,
  className,
  interactive = false,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-line bg-card",
        interactive &&
          "transition-colors duration-200 hover:border-line-strong hover:bg-card-hover",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ───────────────────────────── Badge ───────────────────────────── */

type BadgeTone = "neutral" | "brand" | "warn" | "demo";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "border-line bg-white/[0.04] text-fg-secondary",
  brand: "border-brand-edge bg-brand-dim text-brand",
  warn: "border-amber-400/25 bg-amber-400/10 text-amber-300/90",
  demo: "border-line-strong bg-white/[0.05] text-fg-muted",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[11px] font-medium tracking-wide uppercase",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Small green dot with a slow halo — used for "tracking live" affordances. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-1.5", className)}>
      <span className="absolute inset-0 rounded-full bg-brand" />
      <span className="animate-pulse-ring absolute inset-0 rounded-full bg-brand" />
    </span>
  );
}

/* ─────────────────────────── Skeleton ─────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("skeleton block rounded-md", className)} aria-hidden />;
}

/* ─────────────────────── Section scaffolding ─────────────────────── */

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Renders the fading hairline above the section. */
  divided?: boolean;
}

export function Section({ children, className, id, divided = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 py-16 md:py-24",
        divided &&
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-line-strong before:to-transparent",
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:justify-center",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-2xl",
          align === "center" && "mx-auto text-center",
        )}
      >
        {eyebrow ? (
          <p className="mb-3 text-[11px] font-medium tracking-[0.16em] text-brand uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[26px] leading-[1.15] font-semibold md:text-[34px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-fg-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Small uppercase label used above stat values and form groups. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
