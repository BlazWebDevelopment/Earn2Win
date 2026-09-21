/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONE PLACE TO CONFIGURE THE E2W TOKEN
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  The live mint is `E2W_MINT_ADDRESS` below. To point the app at a different
 *  mint without touching code, set this in `.env.local` instead:
 *
 *      NEXT_PUBLIC_E2W_TOKEN_ADDRESS=SomeOtherMintAddress
 *
 *  Nothing else in the codebase references the address.
 *
 *  If both are empty the app falls back to pre-launch mode: "Coming soon"
 *  states, clearly-labelled demo data, disabled explorer links.
 */

/** The official E2W mint. `NEXT_PUBLIC_E2W_TOKEN_ADDRESS` overrides it. */
const E2W_MINT_ADDRESS = "ExjkD5rvPB8Bp18PLCvBJFBGuKjDA1FTCyzRMsNQgaGc";

export const E2W_TOKEN = {
  address: (process.env.NEXT_PUBLIC_E2W_TOKEN_ADDRESS || E2W_MINT_ADDRESS).trim(),
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
