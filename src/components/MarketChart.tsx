"use client";

import { LineChart as LineChartIcon, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import { Badge, LiveDot } from "@/components/ui/primitives";
import { IS_TOKEN_LIVE } from "@/config/token";
import { cn } from "@/lib/cn";
import { changeTone, formatPercent, formatPrice } from "@/lib/formatting";
import { TIMEFRAMES } from "@/lib/market-data";
import type { Timeframe } from "@/lib/market-data";
import { useMarketSeries } from "@/lib/market-data/use-market-data";

interface Point {
  t: number;
  price: number;
}

function formatAxisTime(timestamp: number, timeframe: Timeframe): string {
  const date = new Date(timestamp);
  if (timeframe === "7D") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Recharts injects the tooltip props onto the element passed to `content`, so
 * they are all optional from this component's point of view.
 */
function ChartTooltip({
  active,
  payload,
  timeframe,
}: Partial<TooltipContentProps<number, string>> & { timeframe: Timeframe }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as Point;

  return (
    <div className="rounded-xl border border-line-strong bg-surface-2/95 px-3 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-[11px] tracking-[0.08em] text-fg-muted uppercase">
        {new Date(point.t).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </p>
      <p className="tabular mt-1 text-[15px] font-semibold">
        {formatPrice(point.price)}
      </p>
      <p className="mt-0.5 text-[11px] text-fg-muted">
        {timeframe} window
      </p>
    </div>
  );
}

export function MarketChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("24H");
  const { result, loading } = useMarketSeries(timeframe);

  const points = useMemo<Point[]>(
    () => (result?.candles ?? []).map((candle) => ({ t: candle.t, price: candle.c })),
    [result],
  );

  const change = useMemo(() => {
    if (points.length < 2) return null;
    const first = points[0].price;
    const last = points[points.length - 1].price;
    if (!first) return null;
    return ((last - first) / first) * 100;
  }, [points]);

  const tone = changeTone(change);
  const stroke = tone === "down" ? "var(--color-negative)" : "var(--color-brand)";
  const isDemo = result?.status === "demo";
  const hasData = points.length >= 2;

  // Pad the domain so the line never touches the plot edges.
  const domain = useMemo<[number, number]>(() => {
    if (!hasData) return [0, 1];
    const values = points.map((point) => point.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min || max || 1) * 0.12;
    return [Math.max(0, min - pad), max + pad];
  }, [points, hasData]);

  return (
    <div className="rounded-card border border-line bg-card">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-semibold">E2W Market</h2>
          {isDemo ? (
            <Badge tone="demo">Demo data</Badge>
          ) : IS_TOKEN_LIVE && result?.status === "ok" ? (
            <Badge tone="brand">
              <LiveDot />
              Live
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          {hasData && change != null ? (
            <span
              className={cn(
                "tabular text-[13px] font-medium",
                tone === "up" && "text-positive",
                tone === "down" && "text-negative",
                tone === "flat" && "text-fg-secondary",
              )}
            >
              {formatPercent(change)}
            </span>
          ) : null}

          <div
            role="tablist"
            aria-label="Chart timeframe"
            className="flex items-center gap-0.5 rounded-xl border border-line bg-surface-2 p-1"
          >
            {TIMEFRAMES.map((frame) => (
              <button
                key={frame}
                type="button"
                role="tab"
                aria-selected={frame === timeframe}
                onClick={() => setTimeframe(frame)}
                className={cn(
                  "press h-8 min-w-11 rounded-lg px-2.5 text-[12px] font-medium",
                  frame === timeframe
                    ? "bg-white/[0.09] text-fg"
                    : "text-fg-secondary hover:text-fg",
                )}
              >
                {frame}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[260px] p-2 sm:h-[340px] sm:p-4">
        {loading && !hasData ? (
          <ChartSkeleton />
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 12, right: 16, bottom: 4, left: 8 }}>
              <defs>
                <linearGradient id="e2w-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.055)"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value: number) => formatAxisTime(value, timeframe)}
                tick={{ fill: "#666666", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={44}
                tickMargin={10}
              />
              <YAxis
                dataKey="price"
                domain={domain}
                tickFormatter={(value: number) => formatPrice(value)}
                tick={{ fill: "#666666", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
                orientation="right"
                tickCount={5}
              />
              <Tooltip
                content={<ChartTooltip timeframe={timeframe} />}
                cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }}
                // Keeps the tooltip inside the viewport on narrow screens.
                allowEscapeViewBox={{ x: false, y: false }}
                offset={12}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={stroke}
                strokeWidth={1.75}
                fill="url(#e2w-area)"
                dot={false}
                activeDot={{
                  r: 3.5,
                  fill: stroke,
                  stroke: "var(--color-bg)",
                  strokeWidth: 2,
                }}
                animationDuration={240}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty message={result?.message ?? null} />
        )}
      </div>

      {isDemo ? (
        <p className="border-t border-line px-5 py-3.5 text-xs text-fg-muted sm:px-6">
          Illustrative pre-launch series. Real price history replaces this
          automatically once the E2W mint is configured and indexed.
        </p>
      ) : null}
    </div>
  );
}

function ChartSkeleton() {
  // Staggered bars read as "loading a chart" without pretending to be prices.
  const heights = [38, 52, 44, 66, 58, 74, 62, 81, 70, 88, 76, 94];

  return (
    <div className="flex h-full items-end gap-1.5 px-2 pb-8">
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

function ChartEmpty({ message }: { message: string | null }) {
  const indexing = !message || /index|history|pool|window/i.test(message);

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-muted">
        {indexing ? (
          <LineChartIcon size={18} aria-hidden />
        ) : (
          <TriangleAlert size={18} aria-hidden />
        )}
      </span>
      <p className="mt-4 text-[14px] font-medium">
        {indexing ? "Market data is indexing" : "Price history unavailable"}
      </p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-fg-secondary">
        {message ?? "Check back shortly."}
      </p>
    </div>
  );
}
