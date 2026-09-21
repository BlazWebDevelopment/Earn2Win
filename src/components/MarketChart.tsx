"use client";

import { LineChart as LineChartIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Badge, LiveDot } from "@/components/ui/primitives";
import { IS_TOKEN_LIVE, dexscreenerUrl } from "@/config/token";
import {
  DEFAULT_CHART_TYPE,
  DEFAULT_INTERVAL,
  EMBED_INTERVALS,
} from "@/lib/chart-embed";
import type { EmbedChartType, EmbedInterval } from "@/lib/chart-embed";
import { cn } from "@/lib/cn";
import { changeTone, formatCompactUsd, formatPercent, formatPrice } from "@/lib/formatting";
import type { MarketResult } from "@/lib/market-data";

/**
 * The candles themselves come from DexScreener's TradingView-powered embed
 * rather than a chart we draw — see `lib/chart-embed.ts` for why. Everything
 * here is the frame around it: branding, live price, interval controls, and
 * honest states for what the embed cannot express (pre-launch, no pool indexed
 * yet, embed blocked).
 */

/**
 * The embed is browser-only and the demo chart depends on wall-clock time, so
 * neither is server-rendered — that also keeps both out of the initial bundle.
 */
const DexScreenerEmbed = dynamic(
  () => import("./market-chart/DexScreenerEmbed").then((m) => m.DexScreenerEmbed),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const DemoCandleChart = dynamic(
  () => import("./market-chart/DemoCandleChart").then((m) => m.DemoCandleChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const INTERVAL_CODES = Object.keys(EMBED_INTERVALS) as EmbedInterval[];

interface MarketChartProps {
  result: MarketResult;
  loading: boolean;
}

export function MarketChart({ result, loading }: MarketChartProps) {
  const [activeInterval, setActiveInterval] = useState<EmbedInterval>(DEFAULT_INTERVAL);
  const [chartType, setChartType] = useState<EmbedChartType>(DEFAULT_CHART_TYPE);

  const snapshot = result.snapshot;
  const pairAddress = snapshot?.pair?.pairAddress ?? null;
  const canEmbed = IS_TOKEN_LIVE && pairAddress != null;

  const change = snapshot?.priceChange.h24 ?? null;
  const tone = changeTone(change);

  const headline =
    chartType === "marketCap"
      ? formatCompactUsd(snapshot?.marketCap)
      : formatPrice(snapshot?.priceUsd);

  return (
    <div className="rounded-card border border-line bg-card">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
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
                {headline}
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

        {canEmbed ? (
          <div className="flex flex-wrap items-center gap-2">
            {/*
              `scrollbar-none` plus `min-w-0` lets the interval row scroll inside
              the card at 390px instead of widening the page.
            */}
            <div
              role="tablist"
              aria-label="Chart interval"
              className="scrollbar-none flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto rounded-xl border border-line bg-surface-2 p-1"
            >
              {INTERVAL_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={code === activeInterval}
                  onClick={() => setActiveInterval(code)}
                  className={cn(
                    "press h-8 shrink-0 rounded-lg px-2.5 text-[12px] font-medium",
                    code === activeInterval
                      ? "bg-white/[0.09] text-fg"
                      : "text-fg-secondary hover:text-fg",
                  )}
                >
                  {EMBED_INTERVALS[code]}
                </button>
              ))}
            </div>

            <div
              role="tablist"
              aria-label="Chart metric"
              className="flex shrink-0 items-center gap-0.5 rounded-xl border border-line bg-surface-2 p-1"
            >
              {(["marketCap", "price"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={type === chartType}
                  onClick={() => setChartType(type)}
                  className={cn(
                    "press h-8 rounded-lg px-2.5 text-[12px] font-medium",
                    type === chartType
                      ? "bg-white/[0.09] text-fg"
                      : "text-fg-secondary hover:text-fg",
                  )}
                >
                  {type === "marketCap" ? "MCap" : "Price"}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/*
        The height has to be explicit: an iframe has no intrinsic size, so
        `h-full` inside an auto-height parent would collapse to zero. `min-w-0`
        stops the frame from forcing the page wider than the viewport.
      */}
      <div className="h-[420px] min-w-0 sm:h-[540px]">
        {!IS_TOKEN_LIVE ? (
          <div className="h-full p-2 sm:p-4">
            <DemoCandleChart />
          </div>
        ) : canEmbed ? (
          <DexScreenerEmbed
            pairAddress={pairAddress}
            interval={activeInterval}
            chartType={chartType}
          />
        ) : loading ? (
          <ChartSkeleton />
        ) : (
          <ChartPending message={result.message} />
        )}
      </div>

      <p className="border-t border-line px-5 py-3.5 text-xs leading-relaxed text-fg-muted sm:px-6">
        {!IS_TOKEN_LIVE
          ? "Illustrative pre-launch series. A live DexScreener chart replaces this automatically once the E2W mint is configured and a pool is indexed."
          : "Candles charted by DexScreener, powered by TradingView. Intervals run from 1s to 1D — there is no 5s resolution on offer."}
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

/** The mint is configured but no pool is indexed yet, so there is nothing to embed. */
function ChartPending({ message }: { message: string | null }) {
  const href = dexscreenerUrl();

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-muted">
        <LineChartIcon size={18} aria-hidden />
      </span>
      <p className="mt-4 text-[14px] font-medium">Market data is indexing</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-fg-secondary">
        {message ?? "The chart appears as soon as a liquidity pool for E2W is indexed."}
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
