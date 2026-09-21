"use client";

import { SiSolana } from "@icons-pack/react-simple-icons";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card, LiveDot, Skeleton } from "@/components/ui/primitives";
import { E2W_TOKEN, IS_TOKEN_LIVE } from "@/config/token";
import { cn } from "@/lib/cn";
import {
  changeTone,
  formatCompactUsd,
  formatPercent,
} from "@/lib/formatting";
import { useMarketData } from "@/lib/market-data/use-market-data";

/**
 * Homepage feature card for the one real token in the ecosystem.
 *
 * Pre-launch it shows COMING SOON rather than invented financials; post-launch
 * it renders whatever the live provider returns, including its failure states.
 */
export function TokenCard() {
  const { result, loading } = useMarketData();
  const snapshot = result.snapshot;
  const hasNumbers = result.status === "live" && snapshot != null;

  return (
    <Card interactive className="overflow-hidden">
      <div className="flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Image
              src={E2W_TOKEN.image}
              alt=""
              width={512}
              height={512}
              sizes="56px"
              className="size-12 rounded-xl border border-line sm:size-14"
            />
            <div>
              <p className="text-[17px] leading-tight font-semibold">
                {E2W_TOKEN.name}
              </p>
              <p className="mt-1 font-mono text-[13px] text-fg-secondary">
                ${E2W_TOKEN.symbol}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {IS_TOKEN_LIVE ? (
              <Badge tone="brand">
                <LiveDot />
                Live
              </Badge>
            ) : (
              <Badge tone="neutral">Coming soon</Badge>
            )}
            <span className="inline-flex items-center gap-1.5 text-[11px] text-fg-muted">
              <SiSolana size={10} aria-hidden />
              Solana
            </span>
          </div>
        </div>

        {hasNumbers ? (
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5">
            <Metric label="Market Cap" value={formatCompactUsd(snapshot.marketCap)} />
            <Metric
              label="24h"
              value={formatPercent(snapshot.priceChange.h24)}
              tone={changeTone(snapshot.priceChange.h24)}
            />
            <Metric label="Volume" value={formatCompactUsd(snapshot.volume24h)} />
          </dl>
        ) : loading ? (
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5">
            {["Market Cap", "24h", "Volume"].map((label) => (
              <div key={label}>
                <dt className="text-[11px] tracking-[0.12em] text-fg-muted uppercase">
                  {label}
                </dt>
                <dd className="mt-2">
                  <Skeleton className="h-5 w-16" />
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="border-t border-line pt-5">
            <dl>
              <dt className="text-[11px] tracking-[0.12em] text-fg-muted uppercase">
                Status
              </dt>
              <dd className="mt-2 text-[22px] font-semibold tracking-[-0.02em]">
                {result.status === "unconfigured" ? "COMING SOON" : "MARKET INDEXING"}
              </dd>
            </dl>
            <p className="mt-2.5 max-w-sm text-[13px] leading-relaxed text-fg-secondary">
              {result.status === "unconfigured"
                ? "E2W launches on pump.fun. Market metrics appear here the moment the mint is live."
                : (result.message ?? "Market data is indexing. Check back shortly.")}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <ButtonLink href="/token" variant="secondary" size="md">
            View E2W
            <ArrowRight size={15} aria-hidden />
          </ButtonLink>
          <Link
            href="/how-it-works"
            className="text-[13px] text-fg-secondary transition-colors hover:text-fg"
          >
            How fees route
          </Link>
        </div>
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  tone = "flat",
}: {
  label: string;
  value: string;
  tone?: "up" | "down" | "flat";
}) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.12em] text-fg-muted uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "tabular mt-2 text-[17px] font-semibold tracking-[-0.01em]",
          tone === "up" && "text-positive",
          tone === "down" && "text-negative",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
