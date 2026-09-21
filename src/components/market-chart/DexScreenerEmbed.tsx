"use client";

import { useEffect, useRef, useState } from "react";

import { dexscreenerEmbedUrl, dexscreenerPairUrl } from "@/lib/chart-embed";
import type { EmbedOptions } from "@/lib/chart-embed";
import { EmbedFallback } from "./EmbedFallback";

/** How long to wait before assuming the frame is blocked rather than just slow. */
const LOAD_TIMEOUT_MS = 14_000;

type LoadState = "loading" | "ready" | "failed";

interface DexScreenerEmbedProps extends EmbedOptions {
  pairAddress: string;
}

export function DexScreenerEmbed({
  pairAddress,
  interval,
  chartType,
}: DexScreenerEmbedProps) {
  const [state, setState] = useState<LoadState>("loading");
  // Tracked in a ref so the timeout can check it without `state` becoming an
  // effect dependency, which would restart the timer on every transition.
  const settled = useRef(false);

  const src = dexscreenerEmbedUrl(pairAddress, { interval, chartType });

  useEffect(() => {
    settled.current = false;

    const timer = window.setTimeout(() => {
      if (!settled.current) setState("failed");
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [src]);

  if (state === "failed") {
    return (
      <EmbedFallback href={dexscreenerPairUrl(pairAddress)} label="DexScreener" />
    );
  }

  return (
    <div className="relative h-full w-full">
      {state === "loading" ? (
        <div
          aria-hidden
          className="skeleton absolute inset-0 rounded-none"
        />
      ) : null}

      <iframe
        // The embed reads its pool, interval and chart type from the URL and has
        // no imperative API, so changing any of them has to remount the frame.
        key={src}
        src={src}
        title="E2W price chart"
        loading="lazy"
        onLoad={() => {
          settled.current = true;
          setState("ready");
        }}
        onError={() => {
          settled.current = true;
          setState("failed");
        }}
        className="relative h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
