import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FlowStep {
  label: string;
  hint?: string;
  icon?: ReactNode;
  /** The Earn2Win node is the one the whole diagram points at. */
  accent?: boolean;
}

/**
 * A single travelling highlight inside the connector. Subtle by design — it
 * reads as throughput, not as decoration.
 */
function Connector({ vertical = false }: { vertical?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative block overflow-hidden",
        vertical
          ? "mx-auto h-8 w-px bg-line-strong"
          : "h-px min-w-6 flex-1 bg-line-strong",
      )}
    >
      <span
        className={cn(
          "animate-flow absolute bg-brand",
          vertical
            ? "left-0 h-3 w-px [animation-name:e2w-flow-y]"
            : "top-0 h-px w-8",
        )}
      />
    </span>
  );
}

/**
 * TOKEN TRADES → CREATOR FEES → EARN2WIN → CREATOR
 *
 * Horizontal on wide screens, vertical on mobile, with a visible arrow between
 * nodes so the direction survives at any size.
 */
export function FlowDiagram({
  steps,
  orientation = "responsive",
  className,
}: {
  steps: FlowStep[];
  orientation?: "responsive" | "vertical";
  className?: string;
}) {
  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col items-stretch", className)}>
        {steps.map((step, index) => (
          <li key={step.label}>
            <FlowNode step={step} full />
            {index < steps.length - 1 ? (
              <div className="flex flex-col items-center py-1.5">
                <Connector vertical />
                <ArrowRight
                  size={14}
                  className="-mt-1 rotate-90 text-fg-muted"
                  aria-hidden
                />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      className={cn(
        "flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-0",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          key={step.label}
          className="flex flex-col items-stretch sm:flex-1 sm:flex-row sm:items-center"
        >
          <FlowNode step={step} />
          {index < steps.length - 1 ? (
            <>
              <div className="flex items-center justify-center gap-1 py-1 sm:hidden">
                <ArrowRight size={13} className="rotate-90 text-fg-muted" aria-hidden />
              </div>
              <div className="hidden flex-1 items-center gap-1 px-2 sm:flex">
                <Connector />
                <ArrowRight size={13} className="shrink-0 text-fg-muted" aria-hidden />
              </div>
            </>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function FlowNode({ step, full = false }: { step: FlowStep; full?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-colors duration-200",
        full ? "w-full" : "w-full sm:w-auto",
        step.accent
          ? "border-brand-edge bg-brand-dim"
          : "border-line bg-surface-2 hover:border-line-strong",
      )}
    >
      {step.icon ? (
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg",
            step.accent ? "bg-brand/15 text-brand" : "bg-white/[0.05] text-fg-secondary",
          )}
        >
          {step.icon}
        </span>
      ) : null}
      <span className="min-w-0">
        <span
          className={cn(
            "block text-[11px] font-semibold tracking-[0.1em] whitespace-nowrap uppercase",
            step.accent ? "text-brand" : "text-fg",
          )}
        >
          {step.label}
        </span>
        {step.hint ? (
          <span className="mt-0.5 block truncate text-[11px] text-fg-muted">
            {step.hint}
          </span>
        ) : null}
      </span>
    </div>
  );
}
