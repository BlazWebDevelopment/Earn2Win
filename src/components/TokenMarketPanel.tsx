"use client";

import { MarketChart } from "@/components/MarketChart";
import { MarketStats } from "@/components/MarketStats";
import { useMarketData } from "@/lib/market-data/use-market-data";

/**
 * Owns the single market-data poll for the token page and shares it with the
 * stat cards, so the chart and the stats never fight over the rate limit.
 */
export function TokenMarketPanel() {
  const { result, loading, refresh } = useMarketData();

  return (
    <div className="space-y-6">
      <MarketChart />
      <MarketStats result={result} loading={loading} onRefresh={refresh} />
    </div>
  );
}
