import { NextResponse } from "next/server";

import { getE2WMarket } from "@/lib/market-data";

/**
 * Safe server-side proxy for E2W market data.
 *
 * The mint address is read from server config, never from the request, so this
 * route cannot be pointed at an arbitrary host. It also lets the upstream
 * response be cached once and shared by every visitor, which keeps us well
 * inside DexScreener's rate limit.
 */
export async function GET() {
  const result = await getE2WMarket();

  return NextResponse.json(result, {
    headers: {
      "cache-control": "public, s-maxage=20, stale-while-revalidate=40",
    },
  });
}
