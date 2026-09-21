/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THIRD-PARTY CHART EMBED
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  pump.fun renders its candles with TradingView **Advanced Charts** (the
 *  proprietary Charting Library). It is not on npm, not redistributable, and
 *  gated behind an application form and a private GitHub repo, so we cannot
 *  self-host it. Instead we embed a ready-made chart that is itself
 *  TradingView-powered.
 *
 *  Two providers are supported because they trade off against each other:
 *
 *    • dexscreener — free, no key, no script tag. One minute is its finest
 *      candle, so it cannot show the 1s/5s granularity that was asked for.
 *    • moralis     — does go down to 1s, but `widget.moralis.com` checks the
 *      embedding origin against an allowlist and refuses to render without a
 *      paid Pro/Business plan, which also has to be requested by email.
 *
 *  DexScreener is the default so the page works with no account and no cost.
 *  Set `NEXT_PUBLIC_CHART_EMBED=moralis` to switch once a Moralis plan is
 *  active and the deployment's domain has been whitelisted.
 */

export type ChartEmbedProvider = "dexscreener" | "moralis";

export const CHART_EMBED_PROVIDER: ChartEmbedProvider =
  process.env.NEXT_PUBLIC_CHART_EMBED?.trim().toLowerCase() === "moralis"
    ? "moralis"
    : "dexscreener";

interface EmbedCapabilities {
  label: string;
  /** Human-readable interval range, rendered in the UI so it is never implied. */
  intervals: string;
  /** Whether sub-minute candles are available at all. */
  subMinute: boolean;
  /** Whether the provider needs a paid plan or origin whitelisting. */
  gated: boolean;
}

export const EMBED_CAPABILITIES: Record<ChartEmbedProvider, EmbedCapabilities> = {
  dexscreener: {
    label: "DexScreener",
    intervals: "1m and above",
    subMinute: false,
    gated: false,
  },
  moralis: {
    label: "Moralis",
    intervals: "1s and above",
    subMinute: true,
    gated: true,
  },
};

/** Shared so both embeds inherit the app's surface, not their own default theme. */
const PALETTE = {
  background: "#101211",
  grid: "#191c1a",
  text: "#9b9b9b",
  up: "#5fcb88",
  down: "#e0615a",
} as const;

/**
 * DexScreener renders a pool, not a mint, so the pool address has to be
 * resolved from the live snapshot rather than hardcoded — a token can be traded
 * in several pools and the deepest one is the only meaningful chart.
 */
export function dexscreenerEmbedUrl(pairAddress: string): string {
  const params = new URLSearchParams({
    embed: "1",
    theme: "dark",
    info: "0",
    trades: "0",
    chartLeftToolbar: "0",
    chartTheme: "dark",
    chartType: "usd",
    interval: "5",
  });

  return `https://dexscreener.com/solana/${encodeURIComponent(pairAddress)}?${params}`;
}

export const MORALIS_SCRIPT_ID = "moralis-chart-widget";
export const MORALIS_SCRIPT_SRC = "https://moralis.com/static/embed/chart.js";

export interface MoralisWidgetOptions {
  autoSize: boolean;
  chainId: string;
  tokenAddress: string;
  defaultInterval: string;
  timeZone: string;
  theme: string;
  locale: string;
  backgroundColor: string;
  gridColor: string;
  textColor: string;
  candleUpColor: string;
  candleDownColor: string;
  hideLeftToolbar: boolean;
  hideTopToolbar: boolean;
  hideBottomToolbar: boolean;
}

/** Moralis charts a mint directly, so it needs no pool resolution. */
export function moralisWidgetOptions(tokenAddress: string): MoralisWidgetOptions {
  return {
    autoSize: true,
    chainId: "solana",
    tokenAddress,
    defaultInterval: "1s",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Etc/UTC",
    theme: "moralis",
    locale: "en",
    backgroundColor: PALETTE.background,
    gridColor: PALETTE.grid,
    textColor: PALETTE.text,
    candleUpColor: PALETTE.up,
    candleDownColor: PALETTE.down,
    hideLeftToolbar: true,
    hideTopToolbar: false,
    hideBottomToolbar: false,
  };
}

declare global {
  interface Window {
    createMyWidget?: (containerId: string, options: MoralisWidgetOptions) => void;
  }
}
