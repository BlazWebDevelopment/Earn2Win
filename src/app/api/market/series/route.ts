import { NextResponse } from "next/server";

import { IS_TOKEN_LIVE } from "@/config/token";
import { TIMEFRAMES, getE2WMarket, getE2WSeries } from "@/lib/market-data";
import type { Timeframe } from "@/lib/market-data";

function parseTimeframe(value: string | null): Timeframe {
  const upper = (value ?? "").toUpperCase();
  return (TIMEFRAMES as readonly string[]).includes(upper)
    ? (upper as Timeframe)
    : "24H";
}

/**
 * Price history proxy. The only client-controlled input is the timeframe, which
 * is validated against a fixed allowlist; the pool address is resolved
 * server-side from the configured mint.
 */
export async function GET(request: Request) {
  const timeframe = parseTimeframe(
    new URL(request.url).searchParams.get("timeframe"),
  );

  const pair = IS_TOKEN_LIVE ? (await getE2WMarket()).snapshot?.pair ?? null : null;
  const series = await getE2WSeries(timeframe, pair);

  return NextResponse.json(series, {
    headers: {
      "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
