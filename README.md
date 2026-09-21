# Earn2Win

**Trade the token. Support the creator.**

Earn2Win is a social creator-fee routing product for tokens. A token can be
associated with a creator identity on X, TikTok, Instagram, Twitch or Reddit,
and the interface makes that association — and the fee path behind it — the
centre of the product.

This repository is the **frontend product**. It tracks real market data for one
real token (E2W) and simulates everything else. Read
[What is real and what is demo](#what-is-real-and-what-is-demo) before shipping
it anywhere public.

---

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

| Script              | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Dev server (Turbopack)                             |
| `npm run build`     | Production build                                   |
| `npm run start`     | Serve the production build                         |
| `npm run typecheck` | `tsc --noEmit`                                     |
| `npm run lint`      | ESLint                                             |
| `npm run assets`    | Regenerate every brand asset from `logo.png`       |

---

## Configure E2W

The live mint ships committed in [`src/config/token.ts`](src/config/token.ts),
which is **the only place the contract address appears**:

```ts
const E2W_MINT_ADDRESS = "ExjkD5rvPB8Bp18PLCvBJFBGuKjDA1FTCyzRMsNQgaGc";

export const E2W_TOKEN = {
  address: (process.env.NEXT_PUBLIC_E2W_TOKEN_ADDRESS || E2W_MINT_ADDRESS).trim(),
  name: "Earn2Win",
  symbol: "E2W",
  image: "/e2w-token.png",
  network: "solana",
  launchpad: "pump.fun",
  decimals: 6,
} as const;

export const IS_TOKEN_LIVE: boolean = E2W_TOKEN.address.length > 0;
```

To point a deployment at a different mint without editing code, set
`NEXT_PUBLIC_E2W_TOKEN_ADDRESS` in `.env.local`. No component hardcodes the
address.

### What flips when the address is set

`IS_TOKEN_LIVE` is derived from the address and gates every financial surface.
With the mint committed the app runs in the right-hand column; blanking both the
constant and the env var puts it back in pre-launch mode.

| Surface                 | Address empty                         | Address configured                      |
| ----------------------- | ------------------------------------- | --------------------------------------- |
| Homepage token card     | `COMING SOON`                         | Live market cap / 24h / volume          |
| `/token` stat cards     | Em dashes + explanation               | Live figures, polled every 30s          |
| `/token` chart          | Labelled **Demo data**                | Real OHLC, or an honest unavailable state |
| pump.fun / Solscan links| Disabled buttons                      | Real external links                     |
| Contract address block  | `XXXXXXXX…XXXX` + "Awaiting launch"   | Truncated address + copy button         |

### Other environment variables

| Variable                        | Required | Purpose                                              |
| ------------------------------- | -------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_E2W_TOKEN_ADDRESS` | No       | Overrides the committed E2W mint.                    |
| `NEXT_PUBLIC_SITE_URL`          | No       | Canonical origin for metadata, OG tags and sitemap. Defaults to `https://earn2win.app`. |

Both are safe to expose — they are public chain data and a public URL.

---

## Where market information comes from

Two public, keyless APIs. Both are called **from the server** via route handlers
so the browser never talks to them directly; that avoids CORS entirely and lets
one cached upstream response serve every visitor, which keeps us inside the
providers' rate limits.

| Data                                                        | Provider                                                     | Module                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| Price, market cap, FDV, liquidity, 24h volume, 24h change, buys/sells, txn count, pair info | [DexScreener](https://docs.dexscreener.com/api/reference) `/latest/dex/tokens/{address}` | `src/lib/market-data/dexscreener.ts`          |
| OHLC price history for the chart                            | [GeckoTerminal](https://api.geckoterminal.com/docs) `/networks/solana/pools/{pool}/ohlcv/{resolution}` | `src/lib/market-data/geckoterminal.ts`        |

- DexScreener has no public candles endpoint, which is why history comes from a
  second provider. The pool address used for history is resolved server-side
  from the DexScreener snapshot.
- Route handlers: `src/app/api/market/route.ts` and
  `src/app/api/market/series/route.ts`. The mint address is read from server
  config, never from the request; the only client-controlled input is the
  timeframe, validated against a fixed allowlist.
- Polling is interval-based (30s for stats, 60s for history) and pauses while
  the tab is hidden. Nothing refetches on render.
- Every failure mode — network error, 429, 404, malformed body, no pair yet, no
  liquidity, no price — resolves to a typed result the UI renders as a designed
  state. The page cannot crash on bad market data.

### Swapping providers

The UI only knows the interfaces in `src/lib/market-data/types.ts`. To change
feeds, write a module satisfying `MarketDataProvider` or `ChartProvider` and
rebind it in `src/lib/market-data/index.ts`:

```ts
export const marketProvider: MarketDataProvider = dexscreenerProvider;
export const chartProvider: ChartProvider = geckoTerminalChartProvider;
```

---

## What is real and what is demo

### Real

- Market data for the configured E2W mint.
- Recipient configuration across all five platforms.
- Everything about the interface: routing, validation, formatting, state.

### Demo only

| Thing                      | Where                                          | Notes                                                                 |
| -------------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| **Token creation**         | `src/components/CreateTokenForm.tsx`           | Validates, runs a ~1.7s staged animation, shows "Demo launch created / No on-chain transaction was submitted", resets. **No mint, no pump.fun submission, no transaction, no wallet.** |
| **Fee routing / payouts**  | `src/lib/fee-routing/demo-provider.ts`         | In-memory only. Records a recipient; moves no money.                   |
| **Recent Activity rows**   | `src/lib/fee-routing/demo-provider.ts`         | Fixed illustrative ledger, labelled "Demo activity". **No transaction signatures anywhere**, because no transactions occurred. |
| **Pre-launch chart data**  | `src/lib/market-data/demo-series.ts`           | Seeded synthetic candles, badged **Demo data**. Unreachable once a real address is configured. |

Three deliberate rules the code enforces:

1. Demo financial data is never mixed into real token data — `IS_TOKEN_LIVE`
   separates them at the source.
2. No fake transaction hash or proof of payment is ever rendered.
3. The create flow never states or implies that a real token was minted.

---

## Going live later

Each capability is isolated behind an interface, so enabling it means replacing
one module rather than editing components.

| To enable                        | Replace / add                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Real token creation**          | `src/components/CreateTokenForm.tsx` — swap the simulated `handleSubmit` timers for a call to a new `lib/token-creation/` provider that talks to pump.fun (or your launchpad) through a server route. Upload the token image somewhere real; it is currently an in-browser object URL only. |
| **Real wallet integration**      | Add a wallet adapter provider in `src/app/layout.tsx`, a connect control in `src/components/Header.tsx`, and make the opening-buy field in `CreateTokenForm.tsx` request a signature. There is no wallet dependency in the tree today. |
| **Real fee routing**             | Implement `FeeRoutingProvider` from `src/lib/fee-routing/types.ts` and rebind `feeRoutingProvider` in `src/lib/fee-routing/index.ts`. Set `live: true` — that flag removes the "Configuration only" and "Demo activity" labelling automatically. |
| **Real social-platform payouts** | Add per-platform provider modules under `src/lib/fee-routing/` (handle verification, payout destination issuance) behind the same `FeeRoutingProvider` interface. `RecipientRecord.verified` exists for this and is `false` everywhere today. |
| **Real activity feed**           | `src/components/ActivityTable.tsx` already reads from `feeRoutingProvider.listEvents()`. A real provider needs no component change. |
| **Different market data**        | See [Swapping providers](#swapping-providers).                                                                                  |

---

## Brand assets

Every asset is generated from the single source `logo.png` at the repo root:

```bash
npm run assets
```

`scripts/generate-assets.mjs` derives a transparent wordmark from the artwork,
then writes:

| File                      | Use                                              |
| ------------------------- | ------------------------------------------------ |
| `public/e2w-logo.png`     | Header / footer lockup (transparent, trimmed)    |
| `public/e2w-token.png`    | E2W token avatar (rounded plate)                 |
| `public/icon-192/512.png` | PWA and high-DPI icons                           |
| `public/og-image.png`     | 1200×630 Open Graph / Twitter card               |
| `src/app/favicon.ico`     | Multi-size `.ico` (16/32/48/64/128/256)          |
| `src/app/apple-icon.png`  | 180×180 Apple touch icon                         |

---

## Project structure

```
src/
  app/
    layout.tsx               Root layout, fonts, full SEO metadata
    template.tsx             Page transition
    page.tsx                 Homepage
    create/page.tsx          Create token (demo flow)
    token/page.tsx           E2W token page
    token/e2w/page.tsx       Alias → /token
    how-it-works/page.tsx    How it works
    not-found.tsx            404
    robots.ts, sitemap.ts    SEO
    favicon.ico, apple-icon.png
    api/market/route.ts             Market snapshot proxy
    api/market/series/route.ts      Price history proxy
    globals.css              Design tokens, utilities, keyframes

  components/
    Header.tsx  Footer.tsx  Logo.tsx
    Hero.tsx  FlowDiagram.tsx  Stats.tsx  HowItWorks.tsx
    SocialPlatformSelector.tsx  SocialRecipientCard.tsx  RecipientPicker.tsx
    PlatformIcon.tsx
    TokenCard.tsx  TokenHeader.tsx  TokenMarketPanel.tsx
    MarketChart.tsx  MarketStats.tsx  CopyAddress.tsx
    FeeRouting.tsx  ActivityTable.tsx
    CreateTokenForm.tsx  TokenImageUpload.tsx  LaunchSuccessToast.tsx
    ui/ Button.tsx  Field.tsx  primitives.tsx

  lib/
    market-data/  types.ts  index.ts  dexscreener.ts  geckoterminal.ts
                  demo-series.ts  use-market-data.ts
    fee-routing/  types.ts  index.ts  demo-provider.ts
    platforms.ts  formatting.ts  cn.ts

  config/
    token.ts     ← the contract address lives here
    site.ts

public/   e2w-logo.png  e2w-token.png  og-image.png  icon-192.png  icon-512.png
scripts/  generate-assets.mjs
logo.png  ← source artwork for every generated asset
```

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts ·
Lucide · Simple Icons · Framer Motion (page transitions only) · Geist.

No database, no auth, no wallet, no blockchain dependency.

---

## Deploy

Deploys to Vercel with no configuration. Import the repository and deploy — the
mint is committed, so live market data works out of the box. Optionally set
`NEXT_PUBLIC_SITE_URL` so metadata, OG tags and the sitemap use your domain. The
two API routes run as serverless functions; everything else is static.

---

## Legal

Earn2Win is an independent product and is not affiliated with X, TikTok,
Instagram, Twitch, Reddit, pump.fun or Solana. Platform handles identify the
intended recipient; association does not imply endorsement or partnership.
Digital assets involve significant risk. Nothing in this project constitutes
financial advice.
