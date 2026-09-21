import { E2W_TOKEN, IS_TOKEN_LIVE } from "@/config/token";
import { demoChartProvider } from "./demo-series";
import { dexscreenerProvider } from "./dexscreener";
import { geckoTerminalChartProvider } from "./geckoterminal";
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

/**
 * Price history for the configured E2W mint.
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

  return chartProvider.getSeries(E2W_TOKEN.address, timeframe, pair);
}
