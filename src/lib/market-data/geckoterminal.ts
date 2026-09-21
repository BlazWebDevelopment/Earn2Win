import type {
  Candle,
  ChartProvider,
  PairInfo,
  SeriesResult,
  Timeframe,
} from "./types";

/**
 * OHLCV history for the configured pool.
 *
 * DexScreener does not expose candles publicly, so history comes from the
 * GeckoTerminal public API instead. This file is the only place that knows
 * about it — point `chartProvider` in `./index.ts` at a different module to
 * switch feeds (Birdeye, Codex, Moralis, a self-hosted indexer, …).
 *
 * Docs: https://api.geckoterminal.com/docs
 */
const BASE = "https://api.geckoterminal.com/api/v2";
const NETWORK = "solana";

/** Each selector maps to the finest resolution that covers its window. */
const WINDOWS: Record<
  Timeframe,
  { timeframe: "minute" | "hour" | "day"; aggregate: number; limit: number }
> = {
  "5M": { timeframe: "minute", aggregate: 1, limit: 6 },
  "1H": { timeframe: "minute", aggregate: 1, limit: 60 },
  "6H": { timeframe: "minute", aggregate: 5, limit: 72 },
  "24H": { timeframe: "minute", aggregate: 15, limit: 96 },
  "7D": { timeframe: "hour", aggregate: 4, limit: 42 },
};

interface OhlcvResponse {
  data?: {
    attributes?: {
      /** [unix seconds, open, high, low, close, volume] — newest first. */
      ohlcv_list?: (number | string)[][];
    };
  };
}

function unavailable(timeframe: Timeframe, message: string): SeriesResult {
  return {
    status: "unavailable",
    timeframe,
    candles: [],
    message,
    source: "geckoterminal",
  };
}

function parseCandles(rows: (number | string)[][]): Candle[] {
  const candles: Candle[] = [];

  for (const row of rows) {
    const [ts, o, h, l, c, v] = row.map((value) =>
      typeof value === "string" ? Number.parseFloat(value) : value,
    );

    if (![ts, o, h, l, c].every((n) => typeof n === "number" && Number.isFinite(n))) {
      continue;
    }

    candles.push({
      t: ts * 1000,
      o,
      h,
      l,
      c,
      v: Number.isFinite(v) ? v : null,
    });
  }

  // The API returns newest first; charts read left-to-right.
  return candles.sort((a, b) => a.t - b.t);
}

export const geckoTerminalChartProvider: ChartProvider = {
  name: "geckoterminal",

  async getSeries(
    address: string,
    timeframe: Timeframe,
    pair?: PairInfo | null,
  ): Promise<SeriesResult> {
    const pool = pair?.pairAddress;

    if (!address) {
      return unavailable(timeframe, "No token address configured.");
    }
    if (!pool) {
      return unavailable(
        timeframe,
        "Price history becomes available once a liquidity pool is indexed.",
      );
    }

    const window = WINDOWS[timeframe];
    const url =
      `${BASE}/networks/${NETWORK}/pools/${encodeURIComponent(pool)}` +
      `/ohlcv/${window.timeframe}` +
      `?aggregate=${window.aggregate}&limit=${window.limit}&currency=usd`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { accept: "application/json" },
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      return unavailable(timeframe, "Could not reach the price history provider.");
    }

    if (response.status === 429) {
      return unavailable(timeframe, "Price history is rate limited. Retrying shortly.");
    }
    if (response.status === 404) {
      return unavailable(timeframe, "This pool has no indexed price history yet.");
    }
    if (!response.ok) {
      return unavailable(timeframe, `Price history provider returned ${response.status}.`);
    }

    let payload: OhlcvResponse;
    try {
      payload = (await response.json()) as OhlcvResponse;
    } catch {
      return unavailable(timeframe, "Price history response was malformed.");
    }

    const rows = payload.data?.attributes?.ohlcv_list;
    if (!Array.isArray(rows) || rows.length === 0) {
      return unavailable(timeframe, "No price history for this window yet.");
    }

    const candles = parseCandles(rows);
    if (candles.length < 2) {
      return unavailable(timeframe, "Not enough trading history for this window yet.");
    }

    return {
      status: "ok",
      timeframe,
      candles,
      message: null,
      source: "geckoterminal",
    };
  },
};
