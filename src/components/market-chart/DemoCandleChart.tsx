"use client";

import { useMemo } from "react";

import { buildDemoCandles } from "@/lib/market-data";

/**
 * Pre-launch only: a static candlestick illustration drawn from the seeded
 * series in `lib/market-data/demo-series.ts`.
 *
 * The live product embeds a third-party chart, but that embed needs a real pool
 * to render. Before launch there is none, so this stands in — hand-drawn as SVG
 * rather than pulling in a charting dependency for a state the app leaves
 * permanently once the mint is configured. Every surface that shows it also
 * shows a "Demo data" badge.
 */

const VIEW_W = 1000;
const VIEW_H = 320;
const PAD_Y = 16;

export function DemoCandleChart() {
  const candles = useMemo(() => buildDemoCandles("24H"), []);

  const geometry = useMemo(() => {
    const high = Math.max(...candles.map((c) => c.h));
    const low = Math.min(...candles.map((c) => c.l));
    const span = high - low || high || 1;

    const slot = VIEW_W / candles.length;
    const body = Math.max(1.5, slot * 0.58);

    const y = (value: number) =>
      PAD_Y + ((high - value) / span) * (VIEW_H - PAD_Y * 2);

    return candles.map((candle, index) => {
      const cx = slot * (index + 0.5);
      const up = candle.c >= candle.o;
      const top = y(Math.max(candle.o, candle.c));
      const bottom = y(Math.min(candle.o, candle.c));

      return {
        key: candle.t,
        cx,
        up,
        wickTop: y(candle.h),
        wickBottom: y(candle.l),
        bodyTop: top,
        // A doji would otherwise collapse to an invisible zero-height rect.
        bodyHeight: Math.max(1, bottom - top),
        bodyX: cx - body / 2,
        bodyWidth: body,
      };
    });
  }, [candles]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      role="img"
      aria-label="Illustrative pre-launch candlestick chart"
    >
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={0}
          x2={VIEW_W}
          y1={VIEW_H * fraction}
          y2={VIEW_H * fraction}
          stroke="rgba(255,255,255,0.055)"
          strokeWidth={1}
        />
      ))}

      {geometry.map((candle) => {
        const color = candle.up ? "var(--color-brand)" : "var(--color-negative)";

        return (
          <g key={candle.key} fill={color} stroke={color}>
            <line
              x1={candle.cx}
              x2={candle.cx}
              y1={candle.wickTop}
              y2={candle.wickBottom}
              strokeWidth={1.25}
            />
            <rect
              x={candle.bodyX}
              y={candle.bodyTop}
              width={candle.bodyWidth}
              height={candle.bodyHeight}
              stroke="none"
            />
          </g>
        );
      })}
    </svg>
  );
}
