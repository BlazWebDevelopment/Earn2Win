"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/cn";

interface LaunchSuccessToastProps {
  open: boolean;
  onClose: () => void;
  tokenName: string;
  ticker: string;
  recipient: string;
  /** Auto-dismiss delay in ms. */
  duration?: number;
}

/**
 * Success notification for the simulated create flow.
 *
 * The wording is deliberately unambiguous: a demo launch was created and no
 * on-chain transaction was submitted. It must never imply a real mint.
 */
export function LaunchSuccessToast({
  open,
  onClose,
  tokenName,
  ticker,
  recipient,
  duration = 6000,
}: LaunchSuccessToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [open, duration, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "animate-rise fixed inset-x-4 bottom-4 z-[60] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[390px]",
      )}
    >
      <div className="overflow-hidden rounded-card border border-brand-edge bg-card shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]">
        <div className="flex gap-3.5 p-4 sm:p-5">
          <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-dim text-brand">
            <Check size={17} strokeWidth={3} aria-hidden />
            <span
              aria-hidden
              className="animate-pulse-ring absolute inset-0 rounded-xl bg-brand/40"
            />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-semibold">Demo launch created</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-fg-secondary">
              No on-chain transaction was submitted.
            </p>

            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[12.5px]">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-fg-muted">Token</dt>
                <dd className="min-w-0 truncate font-medium">
                  {tokenName}{" "}
                  <span className="font-mono text-fg-secondary">{ticker}</span>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-fg-muted">Recipient</dt>
                <dd className="min-w-0 truncate font-mono text-fg-secondary">
                  {recipient}
                </dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="press -mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-muted hover:bg-white/[0.06] hover:text-fg"
          >
            <X size={15} aria-hidden />
          </button>
        </div>

        {/* Countdown rule mirrors the auto-dismiss timer. */}
        <div className="h-0.5 w-full bg-white/[0.06]">
          <div
            className="h-full bg-brand"
            style={{
              animation: `e2w-countdown ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
