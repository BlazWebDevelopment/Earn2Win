"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

interface TokenImageUploadProps {
  /** Object URL of the selected image, or null. Owned by the parent. */
  value: string | null;
  onChange: (previewUrl: string | null, file: File | null) => void;
  error?: string;
}

/**
 * Local image picker for the token avatar. The file never leaves the browser —
 * it is only turned into an object URL for the preview and the summary card.
 */
export function TokenImageUpload({ value, onChange, error }: TokenImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear the file input whenever the parent resets the value.
  useEffect(() => {
    if (value === null && inputRef.current) inputRef.current.value = "";
  }, [value]);

  const accept = (file: File | undefined) => {
    setLocalError(null);
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setLocalError("Use a PNG, JPG, WebP or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("Image must be under 4 MB.");
      return;
    }

    onChange(URL.createObjectURL(file), file);
  };

  const message = localError ?? error ?? null;

  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-fg">Token image</p>

      {value ? (
        <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-2 p-3.5">
          {/* Object URL of a user file — next/image cannot optimise blob: URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Selected token image preview"
            className="size-16 rounded-xl border border-line object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium">Image selected</p>
            <p className="mt-0.5 text-[12px] text-fg-muted">
              Stays in your browser — nothing is uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null, null)}
            aria-label="Remove token image"
            className="press inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-fg-muted hover:border-line-strong hover:text-fg"
          >
            <X size={15} aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            accept(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "press flex w-full items-center gap-4 rounded-xl border border-dashed p-4 text-left",
            dragging
              ? "border-brand bg-brand-dim"
              : message
                ? "border-negative/50 bg-surface-2"
                : "border-line-strong bg-surface-2 hover:border-brand-edge hover:bg-card-hover",
          )}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.04] text-fg-secondary">
            <ImagePlus size={18} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-medium">
              Upload token image
            </span>
            <span className="mt-0.5 block text-[12px] text-fg-muted">
              PNG, JPG, WebP or GIF · up to 4 MB · square works best
            </span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        aria-label="Token image file"
        onChange={(event) => accept(event.target.files?.[0])}
      />

      {message ? (
        <p role="alert" className="mt-2 text-[12.5px] text-negative">
          {message}
        </p>
      ) : null}
    </div>
  );
}
