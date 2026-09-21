export const SITE = {
  name: "Earn2Win",
  shortName: "E2W",
  tagline: "Social Creator Fees",
  description:
    "Connect token creator fees with the people creating attention across social platforms.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://earn2win.app",
  /** Public X account for the product. Update once the handle is live. */
  x: "https://x.com/earn2win",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/token", label: "Earn2Win Token" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/create", label: "Create" },
] as const;

export const LEGAL = {
  affiliation:
    "Earn2Win is an independent product and is not affiliated with X, TikTok, Instagram, Twitch, Reddit, pump.fun or Solana.",
  risk:
    "Digital assets involve significant risk. Nothing on this site constitutes financial advice.",
  handles:
    "Platform handles identify the intended recipient. Association does not imply endorsement or partnership.",
} as const;
