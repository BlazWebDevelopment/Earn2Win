"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { truncateAddress } from "@/lib/formatting";

interface CopyAddressProps {
  address: string;
  /** Shown instead of the address when nothing is configured yet. */
  emptyLabel?: string;
  className?: string;
}

/**
 * Contract address with a copy button that swaps to a checkmark for two seconds.
 * Falls back to a hidden textarea + execCommand where the async clipboard API is
 * unavailable (older Safari, non-secure contexts).
 */
export function CopyAddress({
  address,
  emptyLabel = "Awaiting launch",
  className,
}: CopyAddressProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    if (!address) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        const field = document.createElement("textarea");
        field.value = address;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        document.body.removeChild(field);
      }

      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked by the browser — leave the button in its idle state.
    }
  };

  if (!address) {
    return (
      <div
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-line px-3.5",
          className,
        )}
      >
        <span className="font-mono text-[13px] text-fg-muted">
          XXXXXXXX…XXXX
        </span>
        <span className="text-[11px] tracking-wide text-fg-muted uppercase">
          {emptyLabel}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-xl border border-line bg-surface-2 pr-1 pl-3.5",
        className,
      )}
    >
      <span
        className="font-mono text-[13px] text-fg-secondary sm:hidden"
        title={address}
      >
        {truncateAddress(address, 5, 4)}
      </span>
      <span
        className="hidden font-mono text-[13px] text-fg-secondary sm:inline"
        title={address}
      >
        {truncateAddress(address, 10, 6)}
      </span>

      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Address copied" : "Copy contract address"}
        className={cn(
          "press ml-1 inline-flex size-8 items-center justify-center rounded-lg",
          copied
            ? "bg-brand-dim text-brand"
            : "text-fg-muted hover:bg-white/[0.06] hover:text-fg",
        )}
      >
        {copied ? (
          <Check size={14} strokeWidth={2.75} aria-hidden />
        ) : (
          <Copy size={14} aria-hidden />
        )}
      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Contract address copied to clipboard" : ""}
      </span>
    </div>
  );
}
