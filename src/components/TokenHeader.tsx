import { SiSolana } from "@icons-pack/react-simple-icons";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { CopyAddress } from "@/components/CopyAddress";
import { ButtonLink, DisabledButton } from "@/components/ui/Button";
import { Badge, Eyebrow, LiveDot } from "@/components/ui/primitives";
import {
  E2W_TOKEN,
  IS_TOKEN_LIVE,
  pumpFunUrl,
  solscanUrl,
} from "@/config/token";

/**
 * Identity block for the E2W token page.
 *
 * Explorer links only become real links once a mint address is configured —
 * before that they render as disabled buttons beside an "Awaiting launch" state
 * rather than pointing at a non-existent token.
 */
export function TokenHeader() {
  const pumpFun = pumpFunUrl();
  const solscan = solscanUrl();

  return (
    <div className="rounded-card border border-line bg-card p-5 sm:p-7">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4 sm:gap-5">
          <Image
            src={E2W_TOKEN.image}
            alt="E2W token"
            width={512}
            height={512}
            priority
            sizes="80px"
            className="size-16 rounded-2xl border border-line sm:size-20"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-[26px] leading-none font-semibold tracking-[-0.025em] sm:text-[32px]">
                {E2W_TOKEN.name}
              </h1>
              <span className="font-mono text-[15px] text-fg-secondary">
                ${E2W_TOKEN.symbol}
              </span>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">pump.fun</Badge>
              <Badge tone="neutral">
                <SiSolana size={10} aria-hidden />
                Solana
              </Badge>
              {IS_TOKEN_LIVE ? (
                <Badge tone="brand">
                  <LiveDot />
                  Tracking live
                </Badge>
              ) : (
                // "Awaiting launch" already labels the address below; this one
                // describes the token's overall state.
                <Badge tone="warn">Pre-launch</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="lg:text-right">
          <Eyebrow>Contract address</Eyebrow>
          <div className="mt-2.5">
            <CopyAddress address={E2W_TOKEN.address} />
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row lg:justify-end">
            {pumpFun ? (
              <ButtonLink href={pumpFun} variant="secondary" size="md">
                View on pump.fun
                <ExternalLink size={14} aria-hidden />
              </ButtonLink>
            ) : (
              <DisabledButton reason="Available once the E2W mint address is configured">
                View on pump.fun
                <ExternalLink size={14} aria-hidden />
              </DisabledButton>
            )}

            {solscan ? (
              <ButtonLink href={solscan} variant="secondary" size="md">
                View on Solscan
                <ExternalLink size={14} aria-hidden />
              </ButtonLink>
            ) : (
              <DisabledButton reason="Available once the E2W mint address is configured">
                View on Solscan
                <ExternalLink size={14} aria-hidden />
              </DisabledButton>
            )}
          </div>
        </div>
      </div>

      {!IS_TOKEN_LIVE ? (
        <p className="mt-7 border-t border-line pt-5 text-[13px] leading-relaxed text-fg-secondary">
          E2W has not launched yet. Once the mint address is configured, this page
          switches to live market data and the explorer links above activate
          automatically — no code changes needed.
        </p>
      ) : null}
    </div>
  );
}
