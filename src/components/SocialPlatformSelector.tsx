"use client";

import { Check } from "lucide-react";

import { PlatformIcon } from "@/components/PlatformIcon";
import { cn } from "@/lib/cn";
import { PLATFORMS } from "@/lib/platforms";
import type { PlatformId } from "@/lib/platforms";

interface SocialPlatformSelectorProps {
  value: PlatformId;
  onChange: (platform: PlatformId) => void;
  /** Accessible name for the radio group. */
  label: string;
  /** Hides the visible legend when the surrounding UI already labels it. */
  hideLabel?: boolean;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Five platform cards behaving as a single radio group: arrow keys move the
 * selection, and the selected card is the only one carrying brand colour.
 *
 * On mobile the row scrolls horizontally rather than shrinking the targets.
 */
export function SocialPlatformSelector({
  value,
  onChange,
  label,
  hideLabel = false,
  className,
  size = "md",
}: SocialPlatformSelectorProps) {
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const next =
      (index + (forward ? 1 : -1) + PLATFORMS.length) % PLATFORMS.length;

    onChange(PLATFORMS[next].id);
    const group = event.currentTarget.parentElement;
    const target = group?.children[next]?.querySelector("button");
    if (target instanceof HTMLElement) target.focus();
  };

  return (
    /**
     * `min-w-0` matters here: the row below scrolls horizontally on mobile, and
     * without it the automatic minimum size of a flex/grid ancestor would be
     * the row's full content width, stretching the whole page instead.
     */
    <div className={cn("min-w-0", className)}>
      <div
        role="radiogroup"
        aria-label={label}
        className={cn(
          "scrollbar-none -mx-5 flex w-[calc(100%+2.5rem)] gap-2.5 overflow-x-auto px-5 pb-1",
          "sm:mx-0 sm:grid sm:w-full sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5",
        )}
      >
        {PLATFORMS.map((platform, index) => {
          const selected = platform.id === value;

          return (
            <div key={platform.id} className="shrink-0">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(platform.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  "press relative flex w-[104px] flex-col items-start gap-3 rounded-card border p-4 text-left sm:w-full",
                  size === "sm" && "gap-2.5 p-3.5",
                  selected
                    ? "border-brand bg-brand-dim"
                    : "border-line bg-surface-2 hover:border-line-strong hover:bg-card-hover",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-xl border transition-colors duration-200",
                    size === "sm" ? "size-8" : "size-10",
                    selected
                      ? "border-brand-edge bg-brand/15 text-brand"
                      : "border-line bg-white/[0.04] text-fg-secondary",
                  )}
                >
                  <PlatformIcon platform={platform.id} size={size === "sm" ? 14 : 17} />
                </span>

                <span
                  className={cn(
                    "text-[13.5px] font-medium transition-colors duration-200",
                    selected ? "text-fg" : "text-fg-secondary",
                  )}
                >
                  {platform.name}
                </span>

                <span
                  aria-hidden
                  className={cn(
                    "absolute top-3 right-3 flex size-4 items-center justify-center rounded-full bg-brand text-[#04140B]",
                    "transition-[opacity,transform] duration-200",
                    selected ? "scale-100 opacity-100" : "scale-75 opacity-0",
                  )}
                >
                  <Check size={11} strokeWidth={3.5} />
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {!hideLabel ? (
        <p className="mt-4 text-xs leading-relaxed text-fg-muted">
          Platform handles identify the intended recipient. Association does not imply
          endorsement or partnership.
        </p>
      ) : null}
    </div>
  );
}
