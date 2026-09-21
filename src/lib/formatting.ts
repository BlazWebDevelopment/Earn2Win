const EMPTY = "—";

/** Rounds to 3 significant digits and strips trailing zeros: 34.8, 1.24, 1.3 */
function significant(value: number): string {
  const fixed = value >= 100 ? value.toFixed(0) : value.toPrecision(3);
  return String(Number(fixed));
}

/**
 * Compact money for stat cards: $1,240 · $34.8K · $1.24M · $1.3B
 * Values under 10,000 stay fully written out so early-stage numbers read exactly.
 */
export function formatCompactUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return EMPTY;

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs < 0.01) return `${sign}$0`;
  if (abs < 10_000) {
    return `${sign}$${abs.toLocaleString("en-US", {
      maximumFractionDigits: abs < 10 ? 2 : 0,
    })}`;
  }
  if (abs < 1_000_000) return `${sign}$${significant(abs / 1_000)}K`;
  if (abs < 1_000_000_000) return `${sign}$${significant(abs / 1_000_000)}M`;
  if (abs < 1_000_000_000_000) return `${sign}$${significant(abs / 1_000_000_000)}B`;
  return `${sign}$${significant(abs / 1_000_000_000_000)}T`;
}

/**
 * Token prices span many orders of magnitude, so the decimal count adapts:
 * $1.24 · $0.4821 · $0.000284
 */
export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return EMPTY;

  if (value >= 10_000) return formatCompactUsd(value);
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;

  // Keep four significant digits past the leading zeros.
  const leadingZeros = Math.max(0, -Math.floor(Math.log10(value)) - 1);
  const decimals = Math.min(12, leadingZeros + 4);
  return `$${value.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "")}`;
}

/**
 * A bare token amount with no currency symbol, e.g. a price quoted in SOL.
 * Avoids `toPrecision`'s exponent notation, which reads as a bug in a UI.
 */
export function formatTokenAmount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return EMPTY;

  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 1) return value.toFixed(3);
  if (value >= 0.001) return value.toFixed(6);

  const leadingZeros = Math.max(0, -Math.floor(Math.log10(value)) - 1);
  const decimals = Math.min(18, leadingZeros + 3);
  return value.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return EMPTY;
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatInteger(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return EMPTY;
  return Math.round(value).toLocaleString("en-US");
}

/** 7xKq…9fRt — enough of both ends to verify a pasted mint by eye. */
export function truncateAddress(address: string, lead = 6, tail = 4): string {
  if (!address) return "";
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function formatTimeAgo(timestamp: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 45) return "just now";
  if (seconds < 90) return "1m ago";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Tone helper so positive/negative colouring is decided in exactly one place. */
export function changeTone(value: number | null | undefined): "up" | "down" | "flat" {
  if (value == null || !Number.isFinite(value) || value === 0) return "flat";
  return value > 0 ? "up" : "down";
}
