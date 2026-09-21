import type { MarketDataProvider, MarketResult, MarketSnapshot } from "./types";

/**
 * DexScreener public token endpoint.
 * Docs: https://docs.dexscreener.com/api/reference
 *
 * Free, keyless, and rate limited (~300 req/min per IP), which is why this runs
 * from the server route in `app/api/market/route.ts` rather than the browser.
 */
const ENDPOINT = "https://api.dexscreener.com/latest/dex/tokens";

/** Shape of the subset of the DexScreener response we actually read. */
interface DexScreenerPair {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { symbol?: string };
  priceNative?: string;
  priceUsd?: string;
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  volume?: Partial<Record<"m5" | "h1" | "h6" | "h24", number>>;
  priceChange?: Partial<Record<"m5" | "h1" | "h6" | "h24", number>>;
  txns?: Partial<Record<"m5" | "h1" | "h6" | "h24", { buys?: number; sells?: number }>>;
}

function num(value: unknown): number | null {
  if (value == null) return null;
  const parsed = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** The deepest pool is the one whose price actually means something. */
function pickPrimaryPair(pairs: DexScreenerPair[]): DexScreenerPair | null {
  const solana = pairs.filter((p) => !p.chainId || p.chainId === "solana");
  const pool = solana.length > 0 ? solana : pairs;

  return (
    pool
      .slice()
      .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0] ?? null
  );
}

function toSnapshot(pair: DexScreenerPair): MarketSnapshot {
  const buys = num(pair.txns?.h24?.buys);
  const sells = num(pair.txns?.h24?.sells);

  return {
    priceUsd: num(pair.priceUsd),
    priceNative: num(pair.priceNative),
    marketCap: num(pair.marketCap),
    fdv: num(pair.fdv),
    liquidityUsd: num(pair.liquidity?.usd),
    volume24h: num(pair.volume?.h24),
    priceChange: {
      m5: num(pair.priceChange?.m5),
      h1: num(pair.priceChange?.h1),
      h6: num(pair.priceChange?.h6),
      h24: num(pair.priceChange?.h24),
    },
    txns24h: {
      buys,
      sells,
      total: buys != null || sells != null ? (buys ?? 0) + (sells ?? 0) : null,
    },
    pair: {
      dexId: pair.dexId ?? null,
      pairAddress: pair.pairAddress ?? null,
      url: pair.url ?? null,
      baseSymbol: pair.baseToken?.symbol ?? null,
      quoteSymbol: pair.quoteToken?.symbol ?? null,
      createdAt: num(pair.pairCreatedAt),
    },
    updatedAt: Date.now(),
    source: "dexscreener",
  };
}

export const dexscreenerProvider: MarketDataProvider = {
  name: "dexscreener",

  async getSnapshot(address: string): Promise<MarketResult> {
    if (!address) {
      return {
        status: "unconfigured",
        snapshot: null,
        message: "No token address configured.",
      };
    }

    let response: Response;
    try {
      response = await fetch(`${ENDPOINT}/${encodeURIComponent(address)}`, {
        headers: { accept: "application/json" },
        // Shared server-side cache keeps us well inside the rate limit even
        // with many concurrent visitors polling.
        next: { revalidate: 20 },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      return {
        status: "error",
        snapshot: null,
        message: "Could not reach the market data provider.",
      };
    }

    if (response.status === 429) {
      return {
        status: "error",
        snapshot: null,
        message: "Market data provider is rate limiting. Retrying shortly.",
      };
    }

    if (!response.ok) {
      return {
        status: "error",
        snapshot: null,
        message: `Market data provider returned ${response.status}.`,
      };
    }

    let payload: { pairs?: DexScreenerPair[] | null };
    try {
      payload = (await response.json()) as { pairs?: DexScreenerPair[] | null };
    } catch {
      return {
        status: "error",
        snapshot: null,
        message: "Market data response was malformed.",
      };
    }

    const pairs = Array.isArray(payload.pairs) ? payload.pairs : [];
    if (pairs.length === 0) {
      return {
        status: "indexing",
        snapshot: null,
        message: "Market data is indexing. Check back shortly.",
      };
    }

    const primary = pickPrimaryPair(pairs);
    if (!primary) {
      return {
        status: "indexing",
        snapshot: null,
        message: "Market data is indexing. Check back shortly.",
      };
    }

    const snapshot = toSnapshot(primary);

    // A pair can exist with liquidity pulled or a price not yet computed.
    if (snapshot.priceUsd == null) {
      return {
        status: "indexing",
        snapshot,
        message: "A pair exists but has no tradable price yet.",
      };
    }

    return { status: "live", snapshot, message: null };
  },
};
