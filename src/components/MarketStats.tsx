"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge, Eyebrow, LiveDot, Skeleton } from "@/components/ui/primitives";
import { IS_TOKEN_LIVE } from "@/config/token";
import { cn } from "@/lib/cn";
import {
  changeTone,
  formatCompactUsd,
  formatInteger,
  formatPercent,
  formatPrice,
  formatTimeAgo,
  formatTokenAmount,
} from "@/lib/formatting";
import type { MarketResult } from "@/lib/market-data";

/**
 * Flashes the value briefly when it changes so live updates are noticeable
 * without any layout movement.
 */
function useValueFlash(value: string) {
  const [flash, setFlash] = useState(false);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 420);
    return () => window.clearTimeout(timer);
  }, [value]);

  return flash;
}

function StatCard({
  label,
  value,
  tone = "flat",
  sub,
  loading = false,
}: {
  label: string;
  value: string;
  tone?: "up" | "down" | "flat";
  sub?: string;
  loading?: boolean;
}) {
  const flash = useValueFlash(value);

  return (
    <div className="rounded-card border border-line bg-card p-4 transition-colors duration-200 hover:border-line-strong sm:p-5">
      <Eyebrow>{label}</Eyebrow>
      {loading ? (
        <div className="mt-2.5">
          <Skeleton className="h-6 w-20" />
        </div>
      ) : (
        <p
          className={cn(
            "tabular mt-2 text-[20px] font-semibold tracking-[-0.02em] transition-colors duration-300 sm:text-[22px]",
            tone === "up" && "text-positive",
            tone === "down" && "text-negative",
            flash && "text-brand-strong",
          )}
        >
          {value}
        </p>
      )}
      {sub && !loading ? (
        <p className="mt-1 text-[12px] text-fg-muted">{sub}</p>
      ) : null}
    </div>
  );
}

interface MarketStatsProps {
  result: MarketResult;
  loading: boolean;
  onRefresh?: () => void;
}

export function MarketStats({ result, loading, onRefresh }: MarketStatsProps) {
  const snapshot = result.snapshot;
  const live = result.status === "live" && snapshot != null;
  const pending = loading && !snapshot;
  const dash = "—";

  const buys = snapshot?.txns24h.buys;
  const sells = snapshot?.txns24h.sells;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-semibold">Market</h2>
          {live ? (
            <Badge tone="brand">
              <LiveDot />
              Live
            </Badge>
          ) : IS_TOKEN_LIVE ? (
            <Badge tone="warn">{result.status === "error" ? "Degraded" : "Indexing"}</Badge>
          ) : (
            <Badge tone="neutral">Pre-launch</Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {snapshot ? (
            <span className="hidden text-[11.5px] text-fg-muted sm:inline">
              Updated {formatTimeAgo(snapshot.updatedAt)}
            </span>
          ) : null}
          {IS_TOKEN_LIVE && onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh market data"
              className="press inline-flex size-8 items-center justify-center rounded-lg border border-line text-fg-secondary hover:border-line-strong hover:text-fg"
            >
              <RefreshCw size={13} className={cn(loading && "animate-spin")} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Market Cap"
          value={live ? formatCompactUsd(snapshot.marketCap) : dash}
          loading={pending}
          sub={live && snapshot.fdv ? `FDV ${formatCompactUsd(snapshot.fdv)}` : undefined}
        />
        <StatCard
          label="Price"
          value={live ? formatPrice(snapshot.priceUsd) : dash}
          loading={pending}
          sub={
            live && snapshot.priceNative
              ? `${formatTokenAmount(snapshot.priceNative)} SOL`
              : undefined
          }
        />
        <StatCard
          label="24h Volume"
          value={live ? formatCompactUsd(snapshot.volume24h) : dash}
          loading={pending}
        />
        <StatCard
          label="24h Change"
          value={live ? formatPercent(snapshot.priceChange.h24) : dash}
          tone={live ? changeTone(snapshot.priceChange.h24) : "flat"}
          loading={pending}
          sub={live ? `1h ${formatPercent(snapshot.priceChange.h1)}` : undefined}
        />
        <StatCard
          label="Liquidity"
          value={live ? formatCompactUsd(snapshot.liquidityUsd) : dash}
          loading={pending}
          sub={live && snapshot.pair?.dexId ? `via ${snapshot.pair.dexId}` : undefined}
        />
        <StatCard
          label="Txns"
          value={live ? formatInteger(snapshot.txns24h.total) : dash}
          loading={pending}
          sub={
            live && (buys != null || sells != null)
              ? `${formatInteger(buys ?? 0)} buys · ${formatInteger(sells ?? 0)} sells`
              : undefined
          }
        />
      </div>

      {!live && !pending ? (
        <p className="mt-4 text-[13px] leading-relaxed text-fg-secondary">
          {result.status === "unconfigured"
            ? "Market metrics populate automatically once the E2W mint address is configured. No placeholder figures are shown until then."
            : (result.message ?? "Market data is indexing. Check back shortly.")}
        </p>
      ) : null}
    </div>
  );
}
