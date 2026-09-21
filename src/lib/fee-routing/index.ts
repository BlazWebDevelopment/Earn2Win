import { demoFeeRoutingProvider } from "./demo-provider";
import type { FeeRoutingProvider } from "./types";

export * from "./types";

/**
 * The active fee routing provider.
 *
 * Point this at a real implementation to enable payouts; `provider.live` gates
 * every piece of UI that would otherwise imply a completed payment.
 */
export const feeRoutingProvider: FeeRoutingProvider = demoFeeRoutingProvider;

export const IS_ROUTING_LIVE = feeRoutingProvider.live;
