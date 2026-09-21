import {
  SiInstagram,
  SiReddit,
  SiTiktok,
  SiTwitch,
  SiX,
} from "@icons-pack/react-simple-icons";

import type { PlatformId } from "@/lib/platforms";

const ICONS = {
  x: SiX,
  tiktok: SiTiktok,
  instagram: SiInstagram,
  twitch: SiTwitch,
  reddit: SiReddit,
} as const satisfies Record<PlatformId, unknown>;

interface PlatformIconProps {
  platform: PlatformId;
  size?: number;
  className?: string;
}

/**
 * Brand glyphs for the supported social platforms, rendered monochrome so they
 * read as recipient identifiers rather than as partner logos.
 */
export function PlatformIcon({ platform, size = 18, className }: PlatformIconProps) {
  const Icon = ICONS[platform];
  return <Icon size={size} className={className} aria-hidden focusable={false} />;
}
