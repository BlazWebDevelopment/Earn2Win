import { ArrowUpRight, Coins, Radio, Receipt, Users } from "lucide-react";

import { FlowDiagram } from "@/components/FlowDiagram";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Backdrop: hairline grid plus one restrained brand wash. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-backdrop absolute inset-0" />
        <div className="absolute top-[-18rem] left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand/[0.07] blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />
      </div>

      <div className="container-page pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="max-w-3xl">
          <Badge tone="brand">
            <Radio size={11} aria-hidden />
            Social creator fees
          </Badge>

          <h1 className="mt-6 text-[36px] leading-[1.06] font-semibold tracking-[-0.03em] sm:text-[52px] lg:text-[64px]">
            Earn when your
            <br />
            community trades.
          </h1>

          <p className="mt-5 max-w-xl text-[17px] leading-[1.6] text-fg-secondary md:text-lg">
            Creator fees, routed to the people behind the attention. Earn2Win connects
            token trading fees with creators across X, TikTok, Instagram, Twitch and
            Reddit.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/create" size="lg" className="w-full sm:w-auto">
              Create Token
              <ArrowUpRight size={17} aria-hidden />
            </ButtonLink>
            <ButtonLink
              href="/token"
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Explore E2W
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <p className="mb-4 text-[11px] font-medium tracking-[0.16em] text-fg-muted uppercase">
            How the fee path works
          </p>
          <FlowDiagram
            steps={[
              {
                label: "Token trades",
                hint: "Community volume",
                icon: <Coins size={14} aria-hidden />,
              },
              {
                label: "Creator fees",
                hint: "Fee share accrues",
                icon: <Receipt size={14} aria-hidden />,
              },
              {
                label: "Earn2Win",
                hint: "Routing layer",
                icon: <Radio size={14} aria-hidden />,
                accent: true,
              },
              {
                label: "Creator",
                hint: "Social recipient",
                icon: <Users size={14} aria-hidden />,
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
