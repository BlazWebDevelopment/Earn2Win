"use client";

import { MarketChart } from "@/components/MarketChart";
import { MarketStats } from "@/components/MarketStats";
import { useMarketData } from "@/lib/market-data/use-market-data";

/**
 * Owns the single market-data poll for the token page and shares it with the
 * chart and the stat cards, so they never fight over the rate limit. The chart
 * needs it to resolve which pool to embed.
 */
export function TokenMarketPanel() {
  const { result, loading, refresh } = useMarketData();

  return (
    <div className="space-y-6">
      <MarketChart result={result} loading={loading} />
      <MarketStats result={result} loading={loading} onRefresh={refresh} />
    </div>
  );
}
