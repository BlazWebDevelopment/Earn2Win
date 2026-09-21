"use client";

import { LineChart as LineChartIcon } from "lucide-react";
import dynamic from "next/dynamic";

import { Badge, LiveDot } from "@/components/ui/primitives";
import { E2W_TOKEN, IS_TOKEN_LIVE, dexscreenerUrl } from "@/config/token";
import {
  CHART_EMBED_PROVIDER,
  EMBED_CAPABILITIES,
} from "@/lib/chart-embed";
import { changeTone, formatPercent, formatPrice } from "@/lib/formatting";
import type { MarketResult } from "@/lib/market-data";
import { cn } from "@/lib/cn";

/**
 * The candles come from a third-party TradingView-powered embed rather than a
 * chart we draw ourselves — see `lib/chart-embed.ts` for why. Everything here
 * is the frame around it: branding, live price, and honest states for the cases
 * the embed cannot express (pre-launch, no pool indexed yet, embed blocked).
 */

/**
 * Both embeds are browser-only and weigh far more than the rest of the page, so
 * they are split out of the initial bundle and never server-rendered.
 */
const DexScreenerEmbed = dynamic(
  () => import("./market-chart/DexScreenerEmbed").then((m) => m.DexScreenerEmbed),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const MoralisEmbed = dynamic(
  () => import("./market-chart/MoralisEmbed").then((m) => m.MoralisEmbed),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const DemoCandleChart = dynamic(
  () => import("./market-chart/DemoCandleChart").then((m) => m.DemoCandleChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

interface MarketChartProps {
  result: MarketResult;
  loading: boolean;
}

export function MarketChart({ result, loading }: MarketChartProps) {
  const snapshot = result.snapshot;
  const capability = EMBED_CAPABILITIES[CHART_EMBED_PROVIDER];

  // DexScreener charts a pool, not a mint, so it can only render once the
  // provider has told us which pool is the deepest one.
  const pairAddress = snapshot?.pair?.pairAddress ?? null;
  const canEmbed =
    IS_TOKEN_LIVE &&
    (CHART_EMBED_PROVIDER === "moralis" || pairAddress != null);

  const change = snapshot?.priceChange.h24 ?? null;
  const tone = changeTone(change);

  return (
    <div className="rounded-card border border-line bg-card">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[17px] font-semibold">E2W Market</h2>
          {!IS_TOKEN_LIVE ? (
            <Badge tone="demo">Demo data</Badge>
          ) : result.status === "live" ? (
            <Badge tone="brand">
              <LiveDot />
              Live
            </Badge>
          ) : (
            <Badge tone="warn">
              {result.status === "error" ? "Degraded" : "Indexing"}
            </Badge>
          )}
        </div>

        {snapshot?.priceUsd != null ? (
          <div className="flex items-baseline gap-2.5">
            <span className="tabular text-[17px] font-semibold tracking-[-0.02em]">
              {formatPrice(snapshot.priceUsd)}
            </span>
            {change != null ? (
              <span
                className={cn(
                  "tabular text-[13px] font-medium",
                  tone === "up" && "text-positive",
                  tone === "down" && "text-negative",
                  tone === "flat" && "text-fg-secondary",
                )}
              >
                {formatPercent(change)} 24h
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/*
        A fixed height is what keeps the embed from collapsing: an iframe has no
        intrinsic size, and `h-full` inside an auto-height parent resolves to 0.
        `min-w-0` stops the frame from forcing the page wider than the viewport.
      */}
      <div className="h-[420px] min-w-0 sm:h-[520px]">
        {!IS_TOKEN_LIVE ? (
          <div className="h-full p-2 sm:p-4">
            <DemoCandleChart />
          </div>
        ) : canEmbed ? (
          CHART_EMBED_PROVIDER === "moralis" ? (
            <MoralisEmbed tokenAddress={E2W_TOKEN.address} />
          ) : (
            <DexScreenerEmbed pairAddress={pairAddress as string} />
          )
        ) : loading ? (
          <ChartSkeleton />
        ) : (
          <ChartPending message={result.message} />
        )}
      </div>

      <p className="border-t border-line px-5 py-3.5 text-xs leading-relaxed text-fg-muted sm:px-6">
        {!IS_TOKEN_LIVE ? (
          <>
            Illustrative pre-launch series. A live {capability.label} chart
            replaces this automatically once the E2W mint is configured and a
            pool is indexed.
          </>
        ) : (
          <>
            Candles are charted by {capability.label} (TradingView-powered),
            intervals {capability.intervals}.
            {capability.subMinute
              ? null
              : " Second-level candles are not offered by this provider."}
          </>
        )}
      </p>
    </div>
  );
}

function ChartSkeleton() {
  // Staggered bars read as "loading a chart" without pretending to be prices.
  const heights = [38, 52, 44, 66, 58, 74, 62, 81, 70, 88, 76, 94];

  return (
    <div className="flex h-full items-end gap-1.5 px-4 pb-8">
      {heights.map((height, index) => (
        <div
          key={index}
          aria-hidden
          className="skeleton flex-1 rounded-sm"
          style={{ height: `${height}%` }}
        />
      ))}
      <span className="sr-only">Loading market chart</span>
    </div>
  );
}

/** The mint is configured but no pool has been indexed yet, so there is nothing to embed. */
function ChartPending({ message }: { message: string | null }) {
  const href = dexscreenerUrl();

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-muted">
        <LineChartIcon size={18} aria-hidden />
      </span>
      <p className="mt-4 text-[14px] font-medium">Market data is indexing</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-fg-secondary">
        {message ??
          "The chart appears as soon as a liquidity pool for E2W is indexed."}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="press mt-4 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[13px] font-medium text-fg-secondary hover:border-line-strong hover:text-fg"
        >
          Check on DexScreener
        </a>
      ) : null}
    </div>
  );
}
