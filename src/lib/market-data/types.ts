/**
 * Provider-agnostic market data contracts.
 *
 * Anything in the UI talks to these types only, so swapping DexScreener for
 * another feed means writing one new module that satisfies `MarketDataProvider`
 * and registering it in `./index.ts`.
 */

export interface PriceChange {
  m5: number | null;
  h1: number | null;
  h6: number | null;
  h24: number | null;
}

export interface TransactionCounts {
  buys: number | null;
  sells: number | null;
  total: number | null;
}

export interface PairInfo {
  dexId: string | null;
  pairAddress: string | null;
  url: string | null;
  baseSymbol: string | null;
  quoteSymbol: string | null;
  /** Epoch ms the pool was created, when the provider reports it. */
  createdAt: number | null;
}

export interface MarketSnapshot {
  priceUsd: number | null;
  priceNative: number | null;
  marketCap: number | null;
  fdv: number | null;
  liquidityUsd: number | null;
  volume24h: number | null;
  priceChange: PriceChange;
  txns24h: TransactionCounts;
  pair: PairInfo | null;
  /** Epoch ms the snapshot was produced. */
  updatedAt: number;
  source: string;
}

export type MarketStatus =
  /** A mint is configured and the provider returned a pair. */
  | "live"
  /** A mint is configured but no pair exists yet (just launched / no liquidity). */
  | "indexing"
  /** No mint address configured — the token has not launched. */
  | "unconfigured"
  /** Network failure, bad response, or rate limit. */
  | "error";

export interface MarketResult {
  status: MarketStatus;
  snapshot: MarketSnapshot | null;
  /** Human-readable explanation, safe to render directly. */
  message: string | null;
}

export interface MarketDataProvider {
  readonly name: string;
  getSnapshot(address: string): Promise<MarketResult>;
}

/* ─────────────────────────── Chart / OHLC ─────────────────────────── */

export type Timeframe = "5M" | "1H" | "6H" | "24H" | "7D";

export const TIMEFRAMES: readonly Timeframe[] = ["5M", "1H", "6H", "24H", "7D"];

export interface Candle {
  /** Epoch ms of the candle open. */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number | null;
}

export type SeriesStatus =
  /** Real history from a provider. */
  | "ok"
  /** Synthetic, pre-launch only, always surfaced as "Demo data" in the UI. */
  | "demo"
  /** Real token, but no history could be retrieved. */
  | "unavailable";

export interface SeriesResult {
  status: SeriesStatus;
  /** The window these candles actually cover. */
  timeframe: Timeframe;
  /**
   * The window the caller asked for. Differs from `timeframe` when the pool is
   * too young to have data at the requested granularity and a narrower window
   * was substituted.
   */
  requestedTimeframe?: Timeframe;
  candles: Candle[];
  message: string | null;
  source: string;
}

export interface ChartProvider {
  readonly name: string;
  getSeries(
    address: string,
    timeframe: Timeframe,
    pair?: PairInfo | null,
  ): Promise<SeriesResult>;
}
