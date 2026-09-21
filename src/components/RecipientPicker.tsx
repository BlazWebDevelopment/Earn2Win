"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SocialPlatformSelector } from "@/components/SocialPlatformSelector";
import { SocialRecipientCard } from "@/components/SocialRecipientCard";
import { Eyebrow } from "@/components/ui/primitives";
import { getPlatform, normalizeHandle } from "@/lib/platforms";
import type { PlatformId } from "@/lib/platforms";

/**
 * Homepage "Choose where the fees go" block: pick a platform, type a handle,
 * watch the recipient preview update live. Purely illustrative — it configures
 * nothing until the visitor continues into /create.
 */
export function RecipientPicker() {
  const [platform, setPlatform] = useState<PlatformId>("x");
  const [handle, setHandle] = useState("");

  const meta = getPlatform(platform);
  const normalized = normalizeHandle(handle);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
      <div className="min-w-0">
        <SocialPlatformSelector
          value={platform}
          onChange={setPlatform}
          label="Fee recipient platform"
        />
      </div>

      <div className="min-w-0 rounded-card border border-line bg-card p-5 sm:p-6">
        <div className="mb-5">
          <label
            htmlFor="home-handle"
            className="mb-2 block text-[13px] font-medium text-fg"
          >
            Creator username
          </label>
          <div className="flex h-12 items-center rounded-xl border border-line bg-surface-2 px-3.5 transition-colors duration-200 focus-within:border-brand-edge">
            <span
              aria-hidden
              className="mr-0.5 shrink-0 font-mono text-[15px] text-fg-muted"
            >
              {meta.prefix || ""}
            </span>
            <input
              id="home-handle"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder={meta.placeholder}
              aria-describedby="home-handle-hint"
              className="h-full w-full min-w-0 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-muted"
            />
          </div>
          <p id="home-handle-hint" className="mt-2 text-xs text-fg-muted">
            Written as{" "}
            <span className="font-mono text-fg-secondary">
              {meta.prefix}
              {meta.placeholder}
            </span>{" "}
            on {meta.name}.
          </p>
        </div>

        <Eyebrow>Recipient preview</Eyebrow>
        <div className="mt-2.5">
          <SocialRecipientCard
            platform={platform}
            handle={handle}
            label={platform === "x" ? "Fees recipient" : meta.recipientLabel}
            showArrow={false}
          />
        </div>

        <Link
          href="/create"
          className="press mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand hover:text-brand-strong"
        >
          {normalized ? `Launch a token for ${meta.prefix}${normalized}` : "Continue in Create"}
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
