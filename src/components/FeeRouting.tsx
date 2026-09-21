import { Coins, Info, Radio, Receipt, Users } from "lucide-react";

import { FlowDiagram } from "@/components/FlowDiagram";
import { PlatformIcon } from "@/components/PlatformIcon";
import { Badge } from "@/components/ui/primitives";
import { LEGAL } from "@/config/site";
import { IS_ROUTING_LIVE } from "@/lib/fee-routing";
import { PLATFORMS } from "@/lib/platforms";

/**
 * Explains the fee path on the token page and lists every supported
 * destination. Because payout integrations are not implemented, the section
 * states plainly that routing is configuration only.
 */
export function FeeRouting() {
  return (
    <div className="rounded-card border border-line bg-card">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-[17px] font-semibold">Fee Routing</h2>
          <p className="mt-1 text-[13.5px] text-fg-secondary">
            Choose the social identity you want creator fees associated with.
          </p>
        </div>
        {!IS_ROUTING_LIVE ? <Badge tone="warn">Configuration only</Badge> : null}
      </div>

      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
        <FlowDiagram
          orientation="vertical"
          steps={[
            { label: "Trades", hint: "Market activity", icon: <Coins size={14} /> },
            { label: "Creator fees", hint: "Fee share accrues", icon: <Receipt size={14} /> },
            { label: "Earn2Win", hint: "Routing layer", icon: <Radio size={14} />, accent: true },
            { label: "Social recipient", hint: "Configured handle", icon: <Users size={14} /> },
          ]}
        />

        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">
            Supported destinations
          </p>

          <ul className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {PLATFORMS.map((platform) => (
              <li
                key={platform.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3 transition-colors duration-200 hover:border-line-strong"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.04]">
                  <PlatformIcon platform={platform.id} size={14} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium">
                    {platform.name}
                  </span>
                  <span className="block font-mono text-[11.5px] text-fg-muted">
                    {platform.prefix}
                    {platform.placeholder}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-3 rounded-xl border border-line bg-surface-2 p-4">
            <Info size={15} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
            <div className="space-y-2 text-[12.5px] leading-relaxed text-fg-secondary">
              <p>
                Payout integrations are not live in this release. Selecting a platform
                and handle records a <span className="text-fg">configured</span>{" "}
                recipient only — no funds move, and no payment is settled or proven
                anywhere in this interface.
              </p>
              <p className="text-fg-muted">{LEGAL.handles}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
