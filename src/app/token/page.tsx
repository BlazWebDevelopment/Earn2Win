import type { Metadata } from "next";

import { ActivityTable } from "@/components/ActivityTable";
import { FeeRouting } from "@/components/FeeRouting";
import { TokenHeader } from "@/components/TokenHeader";
import { TokenMarketPanel } from "@/components/TokenMarketPanel";
import { LEGAL } from "@/config/site";

export const metadata: Metadata = {
  title: "Earn2Win Token ($E2W)",
  description:
    "Live market data, fee routing and activity for E2W — the Earn2Win ecosystem token on Solana.",
  alternates: { canonical: "/token" },
};

export default function TokenPage() {
  return (
    <div className="relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-backdrop absolute inset-x-0 top-0 h-72" />
      </div>

      <div className="container-page space-y-6 pt-10 pb-20 md:pt-12 md:pb-28">
        <TokenHeader />
        <TokenMarketPanel />
        <FeeRouting />
        <ActivityTable />

        <p className="max-w-3xl pt-4 text-xs leading-relaxed text-fg-muted">
          {LEGAL.affiliation} {LEGAL.risk}
        </p>
      </div>
    </div>
  );
}
