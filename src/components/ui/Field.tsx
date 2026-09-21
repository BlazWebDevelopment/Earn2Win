import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FieldProps {
  id: string;
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Shown on the right of the label, e.g. a character counter. */
  meta?: ReactNode;
  className?: string;
}

export function Field({
  id,
  label,
  children,
  hint,
  error,
  optional = false,
  meta,
  className,
}: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {label}
          {optional ? (
            <span className="ml-1.5 text-[12px] font-normal text-fg-muted">
              Optional
            </span>
          ) : null}
        </label>
        {meta ? <span className="text-[11.5px] text-fg-muted">{meta}</span> : null}
      </div>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-[12.5px] text-negative"
        >
          <AlertCircle size={13} aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[12px] leading-relaxed text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const INPUT_BASE =
  "w-full min-w-0 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-muted";

const SHELL_BASE =
  "flex items-center rounded-xl border bg-surface-2 px-3.5 transition-colors duration-200";

/** Wraps an input so prefixes/suffixes share the focus ring with the field. */
export function InputShell({
  children,
  invalid = false,
  className,
}: {
  children: ReactNode;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        SHELL_BASE,
        "h-12",
        invalid
          ? "border-negative/60 focus-within:border-negative"
          : "border-line focus-within:border-brand-edge",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Bare input — the invalid styling lives on the surrounding `InputShell`. */
export function TextInput({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input">) {
  return <input className={cn(INPUT_BASE, "h-full", className)} {...props} />;
}

export function TextArea({
  invalid = false,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        SHELL_BASE,
        INPUT_BASE,
        "min-h-[104px] resize-y py-3 leading-relaxed",
        invalid
          ? "border-negative/60 focus:border-negative"
          : "border-line focus:border-brand-edge",
        className,
      )}
      {...props}
    />
  );
}
