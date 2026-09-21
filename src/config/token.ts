/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONE PLACE TO CONFIGURE THE E2W TOKEN
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Paste the E2W mint address into `.env.local`:
 *
 *      NEXT_PUBLIC_E2W_TOKEN_ADDRESS=YourVanityMintAddressHere
 *
 *  ...or, if you prefer it committed, replace the empty string fallback below.
 *  Nothing else in the codebase hardcodes the address.
 *
 *  While the address is empty the whole app switches into pre-launch mode:
 *  "Coming soon" states, clearly-labelled demo data, disabled explorer links.
 */

export const E2W_TOKEN = {
  address: (process.env.NEXT_PUBLIC_E2W_TOKEN_ADDRESS ?? "").trim(),
  name: "Earn2Win",
  symbol: "E2W",
  image: "/e2w-token.png",
  network: "solana",
  launchpad: "pump.fun",
  /** Standard for pump.fun mints — only used for display formatting. */
  decimals: 6,
} as const;

/**
 * The single source of truth for "is this token real yet?".
 * Every financial surface in the app branches on this.
 */
export const IS_TOKEN_LIVE: boolean = E2W_TOKEN.address.length > 0;

/** How often the client re-polls market data, in milliseconds. */
export const MARKET_POLL_INTERVAL = 30_000;

export function pumpFunUrl(address = E2W_TOKEN.address): string | null {
  return address ? `https://pump.fun/coin/${address}` : null;
}

export function solscanUrl(address = E2W_TOKEN.address): string | null {
  return address ? `https://solscan.io/token/${address}` : null;
}

export function dexscreenerUrl(address = E2W_TOKEN.address): string | null {
  return address ? `https://dexscreener.com/solana/${address}` : null;
}
