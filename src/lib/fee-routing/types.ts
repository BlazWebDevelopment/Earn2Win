import type { PlatformId } from "@/lib/platforms";

/**
 * Fee routing contracts.
 *
 * Payout integrations are NOT implemented in this release. These types describe
 * the boundary a real provider would implement so the UI does not have to change
 * when one is plugged in.
 */

export interface FeeRecipient {
  platform: PlatformId;
  /** Bare handle, no @ or u/ prefix. */
  handle: string;
}

export type RecipientState =
  /** Saved locally in this demo build; nothing is claimed or verified. */
  | "configured"
  /** A real provider has issued a payout destination. */
  | "active"
  /** A real provider rejected or could not verify the handle. */
  | "rejected";

export interface RecipientRecord {
  id: string;
  recipient: FeeRecipient;
  state: RecipientState;
  createdAt: number;
  /**
   * Whether this record came from a real payout provider.
   * `false` everywhere in the current build.
   */
  verified: boolean;
}

export type RoutingEventType = "Creator fee" | "Routing" | "Payout";

export type RoutingEventStatus = "Pending" | "Routed" | "Completed";

export interface RoutingEvent {
  id: string;
  type: RoutingEventType;
  /** USD value of the event. */
  amountUsd: number;
  recipient: FeeRecipient;
  status: RoutingEventStatus;
  timestamp: number;
  /**
   * True for locally generated illustrative rows. The UI must label these and
   * must never present them as settled on-chain payments.
   */
  demo: boolean;
}

export interface FeeRoutingProvider {
  readonly name: string;
  /** True only when the provider can actually move money. */
  readonly live: boolean;

  createRecipient(recipient: FeeRecipient): Promise<RecipientRecord>;
  getRecipient(id: string): Promise<RecipientRecord | null>;
  listEvents(limit?: number): Promise<RoutingEvent[]>;
}
