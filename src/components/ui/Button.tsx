import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-[#04140B] font-semibold hover:bg-brand-strong shadow-[0_1px_0_rgba(255,255,255,0.22)_inset]",
  secondary:
    "bg-white/[0.045] text-fg border border-line hover:border-line-strong hover:bg-white/[0.07]",
  outline:
    "bg-transparent text-brand border border-brand-edge hover:bg-brand-dim hover:border-brand",
  ghost: "bg-transparent text-fg-secondary hover:text-fg hover:bg-white/[0.05]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-[10px]",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-6 text-[15px] gap-2 rounded-xl",
};

const BASE =
  "press inline-flex items-center justify-center whitespace-nowrap select-none " +
  "disabled:opacity-45 disabled:pointer-events-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string }) {
  const external = /^https?:\/\//.test(href);
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
        {...(props as ComponentPropsWithoutRef<"a">)}
      />
    );
  }

  return <Link href={href} className={classes} {...props} />;
}

/**
 * A link-shaped button that is currently unavailable (e.g. explorer links
 * before the token launches). Rendered as a real disabled button so it is
 * announced correctly instead of being a dead anchor.
 */
export function DisabledButton({
  variant = "secondary",
  size = "md",
  className,
  reason,
  children,
}: CommonProps & { reason: string }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled
      title={reason}
      className={cn(BASE, VARIANTS[variant], SIZES[size], "opacity-45", className)}
    >
      {children}
    </button>
  );
}
