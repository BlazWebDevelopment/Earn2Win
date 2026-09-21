import { E2W_TOKEN, IS_TOKEN_LIVE } from "@/config/token";
import { demoChartProvider } from "./demo-series";
import { dexscreenerProvider } from "./dexscreener";
import { geckoTerminalChartProvider } from "./geckoterminal";
import { TIMEFRAMES } from "./types";
import type {
  ChartProvider,
  MarketDataProvider,
  MarketResult,
  PairInfo,
  SeriesResult,
  Timeframe,
} from "./types";

export * from "./types";
export { buildDemoCandles } from "./demo-series";

/** Swap these two bindings to change data sources for the whole app. */
export const marketProvider: MarketDataProvider = dexscreenerProvider;
export const chartProvider: ChartProvider = geckoTerminalChartProvider;

/**
 * Snapshot for the configured E2W mint.
 * Returns `unconfigured` — never fabricated numbers — before launch.
 */
export async function getE2WMarket(): Promise<MarketResult> {
  if (!IS_TOKEN_LIVE) {
    return {
      status: "unconfigured",
      snapshot: null,
      message: "E2W has not launched yet.",
    };
  }

  return marketProvider.getSnapshot(E2W_TOKEN.address);
}

/** A chart needs at least two points to draw a line. */
const MIN_CANDLES = 2;

/**
 * Price history for the configured E2W mint.
 *
 * A pool minted minutes ago has no hourly or daily aggregates yet, so a request
 * for a wide window comes back empty even though the token is trading. Rather
 * than render an empty chart, step down to the widest narrower window that does
 * have data and tell the caller which one we substituted. As the pool ages the
 * requested window starts resolving on its own.
 *
 * Demo candles are only ever produced while no mint address exists. Once a real
 * address is configured we return the real series or an honest unavailable state.
 */
export async function getE2WSeries(
  timeframe: Timeframe,
  pair?: PairInfo | null,
): Promise<SeriesResult> {
  if (!IS_TOKEN_LIVE) {
    return demoChartProvider.getSeries("", timeframe);
  }

  const requested = await chartProvider.getSeries(E2W_TOKEN.address, timeframe, pair);
  if (requested.candles.length >= MIN_CANDLES) return requested;

  const narrower = TIMEFRAMES.slice(0, TIMEFRAMES.indexOf(timeframe)).reverse();

  for (const fallback of narrower) {
    const series = await chartProvider.getSeries(E2W_TOKEN.address, fallback, pair);
    if (series.candles.length >= MIN_CANDLES) {
      return { ...series, requestedTimeframe: timeframe };
    }
  }

  return requested;
}
