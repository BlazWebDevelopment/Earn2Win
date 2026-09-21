import { Info } from "lucide-react";

import { cn } from "@/lib/cn";

const STEPS = [
  {
    number: "01",
    title: "Create",
    body: "Create a social-first token concept.",
  },
  {
    number: "02",
    title: "Choose",
    body: "Select X, TikTok, Instagram, Twitch or Reddit and enter the recipient handle.",
  },
  {
    number: "03",
    title: "Trade",
    body: "The token community trades on the supported market.",
  },
  {
    number: "04",
    title: "Earn",
    body: "Eligible creator fees can be routed through Earn2Win integrations.",
  },
] as const;

export function HowItWorks({ className }: { className?: string }) {
  return (
    <div className={className}>
      <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li
            key={step.number}
            className={cn(
              "group relative bg-card p-6 transition-colors duration-200 hover:bg-card-hover sm:p-7",
            )}
          >
            <span
              aria-hidden
              className="font-mono text-[13px] tracking-[0.1em] text-fg-muted transition-colors duration-200 group-hover:text-brand"
            >
              {step.number}
            </span>
            <h3 className="mt-4 text-[19px] font-semibold tracking-[-0.015em]">
              {step.title}
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-fg-secondary">
              {step.body}
            </p>
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brand/60",
                "transition-transform duration-200 group-hover:scale-x-100",
              )}
            />
            {index === STEPS.length - 1 ? null : null}
          </li>
        ))}
      </ol>

      <div className="mt-5 flex gap-3 rounded-xl border border-line bg-surface-2 p-4">
        <Info size={15} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
        <p className="text-[12.5px] leading-relaxed text-fg-secondary">
          Payout routing is not live in this version. Step 04 describes the intended
          integration — today Earn2Win records the recipient you configure and does not
          transfer funds.
        </p>
      </div>
    </div>
  );
}
