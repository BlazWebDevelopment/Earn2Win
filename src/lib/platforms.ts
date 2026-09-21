export type PlatformId = "x" | "tiktok" | "instagram" | "twitch" | "reddit";

export interface Platform {
  id: PlatformId;
  /** Display name of the social platform. */
  name: string;
  /** Label shown under a handle on a recipient card. */
  recipientLabel: string;
  /** How handles are conventionally written on that platform. */
  prefix: string;
  /** Example handle text for inputs. */
  placeholder: string;
  /** Builds a public profile URL from a bare handle. */
  profileUrl: (handle: string) => string;
}

export const PLATFORMS: readonly Platform[] = [
  {
    id: "x",
    name: "X",
    recipientLabel: "X recipient",
    prefix: "@",
    placeholder: "username",
    profileUrl: (handle) => `https://x.com/${handle}`,
  },
  {
    id: "tiktok",
    name: "TikTok",
    recipientLabel: "TikTok creator",
    prefix: "@",
    placeholder: "username",
    profileUrl: (handle) => `https://www.tiktok.com/@${handle}`,
  },
  {
    id: "instagram",
    name: "Instagram",
    recipientLabel: "Instagram creator",
    prefix: "@",
    placeholder: "username",
    profileUrl: (handle) => `https://instagram.com/${handle}`,
  },
  {
    id: "twitch",
    name: "Twitch",
    recipientLabel: "Twitch channel",
    prefix: "",
    placeholder: "channel",
    profileUrl: (handle) => `https://twitch.tv/${handle}`,
  },
  {
    id: "reddit",
    name: "Reddit",
    recipientLabel: "Reddit recipient",
    prefix: "u/",
    placeholder: "username",
    profileUrl: (handle) => `https://reddit.com/user/${handle}`,
  },
] as const;

const BY_ID = new Map<PlatformId, Platform>(PLATFORMS.map((p) => [p.id, p]));

export function getPlatform(id: PlatformId): Platform {
  const platform = BY_ID.get(id);
  if (!platform) throw new Error(`Unknown platform: ${id}`);
  return platform;
}

/** Strips anything a user might paste around a handle: @, u/, or a full URL. */
export function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/[^/]+\//i, "")
    .replace(/^(@|u\/|user\/)+/i, "")
    .replace(/\/+$/, "")
    .replace(/\s+/g, "");
}

/** Renders a handle the way its platform writes it: @name, name, or u/name. */
export function formatHandle(id: PlatformId, raw: string): string {
  const platform = getPlatform(id);
  const handle = normalizeHandle(raw);
  if (!handle) return `${platform.prefix}${platform.placeholder}`;
  return `${platform.prefix}${handle}`;
}

export function isValidHandle(raw: string): boolean {
  const handle = normalizeHandle(raw);
  return /^[A-Za-z0-9._-]{1,32}$/.test(handle);
}
