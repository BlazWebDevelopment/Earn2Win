"use client";

import { useEffect, useRef, useState } from "react";

import {
  MORALIS_SCRIPT_ID,
  MORALIS_SCRIPT_SRC,
  moralisWidgetOptions,
} from "@/lib/chart-embed";
import { EmbedFallback } from "./EmbedFallback";

const CONTAINER_ID = "e2w-moralis-chart";

/** How long to wait before assuming the widget is blocked rather than slow. */
const LOAD_TIMEOUT_MS = 14_000;

type LoadState = "loading" | "ready" | "failed";

/**
 * Moralis' script does nothing but inject an iframe pointing at
 * `widget.moralis.com`, passing the current page URL so the origin can be
 * checked against their allowlist. Without an active Pro/Business plan and a
 * whitelisted domain that iframe renders their "subscription required" notice
 * instead of a chart, which we cannot detect from here — it is cross-origin. So
 * a failure here surfaces as the generic fallback and the capability note in the
 * chart footer explains the requirement.
 */
export function MoralisEmbed({ tokenAddress }: { tokenAddress: string }) {
  const [state, setState] = useState<LoadState>("loading");
  const settled = useRef(false);

  useEffect(() => {
    settled.current = false;

    const timer = window.setTimeout(() => {
      if (!settled.current) setState("failed");
    }, LOAD_TIMEOUT_MS);

    const mount = () => {
      settled.current = true;

      if (typeof window.createMyWidget !== "function") {
        setState("failed");
        return;
      }

      window.createMyWidget(CONTAINER_ID, moralisWidgetOptions(tokenAddress));
      setState("ready");
    };

    const existing = document.getElementById(MORALIS_SCRIPT_ID);
    if (existing) {
      mount();
      return () => window.clearTimeout(timer);
    }

    const script = document.createElement("script");
    script.id = MORALIS_SCRIPT_ID;
    script.src = MORALIS_SCRIPT_SRC;
    script.async = true;
    script.onload = mount;
    script.onerror = () => {
      settled.current = true;
      setState("failed");
    };
    document.body.appendChild(script);

    return () => window.clearTimeout(timer);
  }, [tokenAddress]);

  if (state === "failed") {
    return (
      <EmbedFallback
        href={`https://dexscreener.com/solana/${tokenAddress}`}
        label="Moralis"
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
      <div id={CONTAINER_ID} className="h-full w-full" />
    </div>
  );
}
