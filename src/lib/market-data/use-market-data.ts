"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IS_TOKEN_LIVE, MARKET_POLL_INTERVAL } from "@/config/token";
import type { MarketResult, SeriesResult, Timeframe } from "./types";

const UNCONFIGURED: MarketResult = {
  status: "unconfigured",
  snapshot: null,
  message: "E2W has not launched yet.",
};

interface MarketState {
  result: MarketResult;
  loading: boolean;
}

/**
 * Polls the server proxy for E2W market data on a fixed interval rather than on
 * every render, and pauses while the tab is hidden so a backgrounded page does
 * not burn rate limit.
 *
 * Never throws: every failure path resolves to a `MarketResult` the UI can render.
 */
/** Talks to the proxy and normalises every failure into a `MarketResult`. */
async function fetchMarket(): Promise<MarketResult> {
  try {
    const response = await fetch("/api/market", { cache: "no-store" });
    if (!response.ok) throw new Error(String(response.status));
    return (await response.json()) as MarketResult;
  } catch {
    return {
      status: "error",
      snapshot: null,
      message: "Live market data is temporarily unavailable.",
    };
  }
}

export function useMarketData(): MarketState & { refresh: () => void } {
  // Pre-launch there is nothing to fetch, so the unconfigured result is the
  // initial state rather than something an effect has to correct.
  const [state, setState] = useState<MarketState>(() => ({
    result: UNCONFIGURED,
    loading: IS_TOKEN_LIVE,
  }));

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (!IS_TOKEN_LIVE) {
      return () => {
        mounted.current = false;
      };
    }

    const load = async () => {
      const result = await fetchMarket();
      if (mounted.current) setState({ result, loading: false });
    };

    void load();

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, MARKET_POLL_INTERVAL);

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted.current = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const refresh = useCallback(() => {
    if (!IS_TOKEN_LIVE) return;
    setState((previous) => ({ ...previous, loading: true }));
    void fetchMarket().then((result) => {
      if (mounted.current) setState({ result, loading: false });
    });
  }, []);

  return { ...state, refresh };
}

interface SeriesState {
  result: SeriesResult | null;
  loading: boolean;
  /** Timeframe the stored result belongs to. */
  frame: Timeframe | null;
}

/**
 * Price history for one timeframe.
 *
 * The stored result carries the timeframe it was fetched for, so switching
 * timeframes derives the loading state during render instead of needing an
 * effect to reset it.
 */
export function useMarketSeries(timeframe: Timeframe): {
  result: SeriesResult | null;
  loading: boolean;
} {
  const [state, setState] = useState<SeriesState>({
    result: null,
    loading: true,
    frame: null,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch(
          `/api/market/series?timeframe=${encodeURIComponent(timeframe)}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error(String(response.status));

        const result = (await response.json()) as SeriesResult;
        if (active) setState({ result, loading: false, frame: timeframe });
      } catch {
        if (active) {
          setState({
            result: {
              status: "unavailable",
              timeframe,
              candles: [],
              message: "Price history is temporarily unavailable.",
              source: "unknown",
            },
            loading: false,
            frame: timeframe,
          });
        }
      }
    };

    void load();

    // Only the live token needs refreshing; demo candles are static.
    const timer = IS_TOKEN_LIVE
      ? window.setInterval(() => {
          if (document.visibilityState === "visible") void load();
        }, MARKET_POLL_INTERVAL * 2)
      : undefined;

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [timeframe]);

  const stale = state.frame !== timeframe;

  return {
    result: stale ? null : state.result,
    loading: stale || state.loading,
  };
}
