import { ArrowUpRight } from "lucide-react";

import { PlatformIcon } from "@/components/PlatformIcon";
import { cn } from "@/lib/cn";
import { formatHandle, getPlatform, normalizeHandle } from "@/lib/platforms";
import type { PlatformId } from "@/lib/platforms";

interface SocialRecipientCardProps {
  platform: PlatformId;
  /** Raw user input; prefixes and URLs are normalised for display. */
  handle: string;
  /** Overrides the platform's default caption, e.g. "Fees recipient". */
  label?: string;
  size?: "sm" | "md";
  /** Shows the trailing arrow affordance. */
  showArrow?: boolean;
  className?: string;
}

/**
 * The canonical way a fee recipient is shown anywhere in the product: platform
 * glyph, the handle written the way that platform writes it, and a caption.
 */
export function SocialRecipientCard({
  platform,
  handle,
  label,
  size = "md",
  showArrow = true,
  className,
}: SocialRecipientCardProps) {
  const meta = getPlatform(platform);
  const normalized = normalizeHandle(handle);
  const display = formatHandle(platform, handle);
  const isPlaceholder = normalized.length === 0;

  return (
    <div
      className={cn(
        "group flex items-center gap-3.5 rounded-card border border-line bg-surface-2",
        "transition-colors duration-200 hover:border-line-strong",
        size === "sm" ? "p-3.5" : "p-4 sm:p-5",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.04] text-fg",
          size === "sm" ? "size-9" : "size-11",
        )}
      >
        <PlatformIcon platform={platform} size={size === "sm" ? 15 : 18} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate font-medium",
            size === "sm" ? "text-[14px]" : "text-[15px]",
            isPlaceholder ? "text-fg-muted" : "text-fg",
          )}
        >
          {display}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-fg-secondary">
          {label ?? meta.recipientLabel}
        </span>
      </span>

      {showArrow ? (
        <ArrowUpRight
          size={16}
          aria-hidden
          className="shrink-0 text-fg-muted transition-colors duration-200 group-hover:text-brand"
        />
      ) : null}
    </div>
  );
}
