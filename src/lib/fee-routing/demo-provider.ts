import { normalizeHandle } from "@/lib/platforms";
import type {
  FeeRecipient,
  FeeRoutingProvider,
  RecipientRecord,
  RoutingEvent,
} from "./types";

/**
 * Local, in-memory stand-in for a real fee routing provider.
 *
 * It moves no money, signs nothing, and calls no network. Every record it
 * returns is flagged so the UI can label it as demo. Replace this module with a
 * real provider that satisfies `FeeRoutingProvider` to go live.
 */

const records = new Map<string, RecipientRecord>();

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/**
 * A fixed illustrative ledger. Amounts are deliberately small and rounded, and
 * no transaction signatures exist anywhere in this data — because none happened.
 */
const DEMO_EVENTS: readonly Omit<RoutingEvent, "timestamp">[] = [
  {
    id: "demo-1",
    type: "Creator fee",
    amountUsd: 184.2,
    recipient: { platform: "x", handle: "marketmaker" },
    status: "Routed",
    demo: true,
  },
  {
    id: "demo-2",
    type: "Routing",
    amountUsd: 96.5,
    recipient: { platform: "tiktok", handle: "chartclips" },
    status: "Pending",
    demo: true,
  },
  {
    id: "demo-3",
    type: "Creator fee",
    amountUsd: 412.8,
    recipient: { platform: "twitch", handle: "nightdesk" },
    status: "Completed",
    demo: true,
  },
  {
    id: "demo-4",
    type: "Payout",
    amountUsd: 58.400000000000006,
    recipient: { platform: "reddit", handle: "onchainreader" },
    status: "Routed",
    demo: true,
  },
  {
    id: "demo-5",
    type: "Creator fee",
    amountUsd: 233.1,
    recipient: { platform: "instagram", handle: "studio.frames" },
    status: "Completed",
    demo: true,
  },
  {
    id: "demo-6",
    type: "Routing",
    amountUsd: 71.9,
    recipient: { platform: "x", handle: "liquidityowl" },
    status: "Pending",
    demo: true,
  },
];

/** Offsets from "now" so the table always reads as recent activity. */
const OFFSETS = [4 * MINUTE, 21 * MINUTE, 52 * MINUTE, 3 * HOUR, 7 * HOUR, 19 * HOUR];

export const demoFeeRoutingProvider: FeeRoutingProvider = {
  name: "demo-local",
  live: false,

  async createRecipient(recipient: FeeRecipient): Promise<RecipientRecord> {
    const handle = normalizeHandle(recipient.handle);
    const record: RecipientRecord = {
      id: `${recipient.platform}:${handle}`,
      recipient: { platform: recipient.platform, handle },
      state: "configured",
      createdAt: Date.now(),
      verified: false,
    };

    records.set(record.id, record);
    return record;
  },

  async getRecipient(id: string): Promise<RecipientRecord | null> {
    return records.get(id) ?? null;
  },

  async listEvents(limit = DEMO_EVENTS.length): Promise<RoutingEvent[]> {
    const now = Date.now();
    return DEMO_EVENTS.slice(0, limit).map((event, index) => ({
      ...event,
      timestamp: now - (OFFSETS[index] ?? (index + 1) * HOUR),
    }));
  },
};
