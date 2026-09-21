"use client";

import { useEffect, useState } from "react";

import { PlatformIcon } from "@/components/PlatformIcon";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { feeRoutingProvider, IS_ROUTING_LIVE } from "@/lib/fee-routing";
import type { RoutingEvent, RoutingEventStatus } from "@/lib/fee-routing";
import { formatCompactUsd, formatTimeAgo } from "@/lib/formatting";
import { formatHandle, getPlatform } from "@/lib/platforms";

const STATUS_STYLES: Record<RoutingEventStatus, string> = {
  Pending: "border-line-strong bg-white/[0.05] text-fg-secondary",
  Routed: "border-brand-edge bg-brand-dim text-brand",
  Completed: "border-line bg-white/[0.04] text-fg",
};

function StatusPill({ status }: { status: RoutingEventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium",
        STATUS_STYLES[status],
      )}
    >
      {status === "Pending" ? (
        <span aria-hidden className="size-1.5 rounded-full bg-fg-muted" />
      ) : (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            status === "Routed" ? "bg-brand" : "bg-fg-secondary",
          )}
        />
      )}
      {status}
    </span>
  );
}

/**
 * Recent routing activity.
 *
 * In this release the rows come from the local demo provider and are labelled
 * as such. No transaction signatures are shown, because none exist — swap
 * `feeRoutingProvider` for a real implementation and this component renders
 * real events unchanged.
 */
export function ActivityTable() {
  const [events, setEvents] = useState<RoutingEvent[] | null>(null);

  useEffect(() => {
    let active = true;
    void feeRoutingProvider.listEvents().then((result) => {
      if (active) setEvents(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-card border border-line bg-card">
      <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-[17px] font-semibold">Recent Activity</h2>
          <p className="mt-1 text-[13.5px] text-fg-secondary">
            Fee routing events for the Earn2Win ecosystem.
          </p>
        </div>
        {!IS_ROUTING_LIVE ? <Badge tone="demo">Demo activity</Badge> : null}
      </div>

      {/* Desktop: real table semantics. */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Recent fee routing events. Illustrative demo data in this release.
          </caption>
          <thead>
            <tr className="border-b border-line">
              {["Type", "Amount", "Platform", "Recipient", "Status", "Time"].map(
                (heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-6 py-3 text-[11px] font-medium tracking-[0.12em] text-fg-muted uppercase"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {events == null
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-line last:border-0">
                    {Array.from({ length: 6 }).map((__, cell) => (
                      <td key={cell} className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              : events.map((event) => {
                  const platform = getPlatform(event.recipient.platform);
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-line transition-colors duration-200 last:border-0 hover:bg-white/[0.018]"
                    >
                      <td className="px-6 py-4 text-[13.5px] whitespace-nowrap">
                        {event.type}
                      </td>
                      <td className="tabular px-6 py-4 text-[13.5px] font-medium whitespace-nowrap">
                        {formatCompactUsd(event.amountUsd)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-[13.5px] whitespace-nowrap text-fg-secondary">
                          <PlatformIcon platform={event.recipient.platform} size={13} />
                          {platform.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[13px] whitespace-nowrap text-fg-secondary">
                        {formatHandle(event.recipient.platform, event.recipient.handle)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={event.status} />
                      </td>
                      <td className="px-6 py-4 text-[13px] whitespace-nowrap text-fg-muted">
                        {formatTimeAgo(event.timestamp)}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Mobile: a stack of rows instead of a squeezed table. */}
      <ul className="divide-y divide-line md:hidden">
        {events == null
          ? Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className="space-y-2.5 p-5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
              </li>
            ))
          : events.map((event) => (
              <li key={event.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium">{event.type}</p>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[12.5px] text-fg-secondary">
                      <PlatformIcon platform={event.recipient.platform} size={12} />
                      {formatHandle(event.recipient.platform, event.recipient.handle)}
                    </p>
                  </div>
                  <p className="tabular shrink-0 text-[15px] font-semibold">
                    {formatCompactUsd(event.amountUsd)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusPill status={event.status} />
                  <span className="text-[12px] text-fg-muted">
                    {formatTimeAgo(event.timestamp)}
                  </span>
                </div>
              </li>
            ))}
      </ul>

      {!IS_ROUTING_LIVE ? (
        <p className="border-t border-line px-5 py-3.5 text-xs leading-relaxed text-fg-muted sm:px-6">
          Illustrative rows for layout purposes. These are not settled payments and no
          transaction signatures are shown, because no transactions were made.
        </p>
      ) : null}
    </div>
  );
}
