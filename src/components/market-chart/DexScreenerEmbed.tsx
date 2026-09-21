"use client";

import { useEffect, useRef, useState } from "react";

import { dexscreenerEmbedUrl } from "@/lib/chart-embed";
import { EmbedFallback } from "./EmbedFallback";

/** How long to wait before assuming the frame is blocked rather than slow. */
const LOAD_TIMEOUT_MS = 14_000;

type LoadState = "loading" | "ready" | "failed";

export function DexScreenerEmbed({ pairAddress }: { pairAddress: string }) {
  const [state, setState] = useState<LoadState>("loading");
  // Read inside the timeout instead of adding `state` to the effect deps, which
  // would restart the timer on every transition.
  const settled = useRef(false);

  useEffect(() => {
    settled.current = false;

    const timer = window.setTimeout(() => {
      if (!settled.current) setState("failed");
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [pairAddress]);

  if (state === "failed") {
    return (
      <EmbedFallback
        href={`https://dexscreener.com/solana/${pairAddress}`}
        label="DexScreener"
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      {state === "loading" ? (
        <div className="absolute inset-0 animate-pulse bg-white/[0.02]">
          <span className="sr-only">Loading price chart</span>
        </div>
      ) : null}

      <iframe
        // Remounting on pool change is intentional: the embed reads the pool
        // from its URL and has no imperative API to re-point it.
        key={pairAddress}
        src={dexscreenerEmbedUrl(pairAddress)}
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
        className="h-full w-full border-0"
        // The embed is a third-party document; give it no more than it needs.
        sandbox="allow-scripts allow-same-origin allow-popups"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
