/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THIRD-PARTY CHART EMBED
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  pump.fun renders its candles with TradingView **Advanced Charts** (the
 *  proprietary Charting Library). It is not published to npm, not
 *  redistributable, and gated behind an application form and a private GitHub
 *  repo, so we cannot self-host it. Instead we embed a ready-made chart that is
 *  itself Advanced Charts under the hood.
 *
 *  DexScreener's embed was chosen over the Moralis widget: it needs no account,
 *  no API key and no script tag, and — verified against their own bundle — it
 *  exposes sub-minute resolutions, which is what was asked for. The Moralis
 *  widget refuses to render without a paid Pro/Business plan and a manually
 *  whitelisted domain.
 *
 *  Everything below mirrors the parameter schema DexScreener actually parses.
 */

/**
 * Candle intervals the embed accepts, as its own resolution codes. Seconds take
 * an `S` suffix, bare numbers are minutes. Note the jump from 1s to 15s — there
 * is no 5s resolution on offer.
 */
export const EMBED_INTERVALS = {
  "1S": "1s",
  "15S": "15s",
  "30S": "30s",
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "60": "1h",
  "240": "4h",
  "1D": "1D",
} as const;

export type EmbedInterval = keyof typeof EMBED_INTERVALS;

/** The embed plots either raw price or market cap, the way pump.fun does. */
export type EmbedChartType = "marketCap" | "price";

export const DEFAULT_INTERVAL: EmbedInterval = "1S";
export const DEFAULT_CHART_TYPE: EmbedChartType = "marketCap";

export interface EmbedOptions {
  interval: EmbedInterval;
  chartType: EmbedChartType;
}

/**
 * DexScreener charts a *pool*, not a mint, so the pool address has to come from
 * the live snapshot rather than a constant — a token can trade in several pools
 * and only the deepest one has a meaningful price.
 */
export function dexscreenerEmbedUrl(
  pairAddress: string,
  { interval, chartType }: EmbedOptions,
): string {
  const params = new URLSearchParams({
    embed: "1",
    theme: "dark",
    chartTheme: "dark",
    chartType,
    interval,
    // Strip the panels we already render ourselves, keeping only the chart and
    // its interval toolbar. These default to enabled unless explicitly zeroed.
    info: "0",
    trades: "0",
    nav: "0",
    chartLeftToolbar: "0",
    chartTimeframesToolbar: "1",
    // Without this the embed shows its info tab first on narrow viewports.
    chartDefaultOnMobile: "1",
  });

  return `https://dexscreener.com/solana/${encodeURIComponent(pairAddress)}?${params}`;
}

export function dexscreenerPairUrl(pairAddress: string): string {
  return `https://dexscreener.com/solana/${encodeURIComponent(pairAddress)}`;
}
