import type { Candle, ChartProvider, SeriesResult, Timeframe } from "./types";

/**
 * Deterministic synthetic candles for the PRE-LAUNCH state only.
 *
 * `lib/market-data/index.ts` never reaches this module once a real mint address
 * is configured, and every surface that renders it shows a "Demo data" badge.
 * It exists so the chart has something honest-but-visual to show before launch.
 */

const SPAN_MS: Record<Timeframe, number> = {
  "5M": 5 * 60_000,
  "1H": 60 * 60_000,
  "6H": 6 * 60 * 60_000,
  "24H": 24 * 60 * 60_000,
  "7D": 7 * 24 * 60 * 60_000,
};

const POINTS: Record<Timeframe, number> = {
  "5M": 30,
  "1H": 60,
  "6H": 72,
  "24H": 96,
  "7D": 84,
};

/** Mulberry32 — small, seeded, stable across server and client renders. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_PRICE = 0.00026;

/** Total drift applied across the window so the illustration reads as growth. */
const TREND = 0.16;

export function buildDemoCandles(timeframe: Timeframe, seed = 20260101): Candle[] {
  const count = POINTS[timeframe];
  const span = SPAN_MS[timeframe];
  const step = span / count;

  // Bucket "now" to the candle step so the series is stable between renders
  // and does not trip React hydration warnings.
  const end = Math.floor(Date.now() / step) * step;
  const random = seededRandom(seed + count);

  const candles: Candle[] = [];
  let price = BASE_PRICE;
  let drift = 0;

  for (let i = count - 1; i >= 0; i -= 1) {
    const shock = (random() - 0.5) * 0.02;
    drift = drift * 0.82 + shock * 0.35;

    const open = price;
    const close = Math.max(BASE_PRICE * 0.5, open * (1 + drift + shock));
    const wick = Math.abs(shock) * 0.9 + 0.002;

    candles.push({
      t: end - i * step,
      o: open,
      h: Math.max(open, close) * (1 + wick),
      l: Math.min(open, close) * (1 - wick),
      c: close,
      v: 900 + random() * 5400,
    });

    price = close;
  }

  // The walk supplies the texture, but its end point is arbitrary — a seed that
  // happens to drift down would render the demo chart red. Tilt the whole
  // series so it lands on a known, modestly positive return instead.
  const actual = candles[candles.length - 1].c / candles[0].o;
  const target = 1 + TREND;

  return candles.map((candle, index) => {
    const tilt = Math.pow(target / actual, index / (candles.length - 1));
    return {
      ...candle,
      o: candle.o * tilt,
      h: candle.h * tilt,
      l: candle.l * tilt,
      c: candle.c * tilt,
    };
  });
}

export const demoChartProvider: ChartProvider = {
  name: "demo",

  async getSeries(_address: string, timeframe: Timeframe): Promise<SeriesResult> {
    return {
      status: "demo",
      timeframe,
      candles: buildDemoCandles(timeframe),
      message: "Illustrative pre-launch data. Not a real market.",
      source: "demo",
    };
  },
};
