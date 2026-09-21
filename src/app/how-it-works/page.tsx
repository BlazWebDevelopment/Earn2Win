import { SiSolana } from "@icons-pack/react-simple-icons";
import { ArrowRight, Coins, Radio, Receipt, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FlowDiagram } from "@/components/FlowDiagram";
import { HowItWorks } from "@/components/HowItWorks";
import { PlatformIcon } from "@/components/PlatformIcon";
import { SocialRecipientCard } from "@/components/SocialRecipientCard";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card, Section, SectionHeading } from "@/components/ui/primitives";
import { LEGAL } from "@/config/site";
import { PLATFORMS } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How Earn2Win connects token trading fees with creator identities on X, TikTok, Instagram, Twitch and Reddit.",
  alternates: { canonical: "/how-it-works" },
};

const LAYERS = [
  {
    icon: <Radio size={16} aria-hidden />,
    title: "Earn2Win",
    body: "The product: social creator fee infrastructure. It defines how a token is associated with a creator identity and where eligible fees are directed.",
  },
  {
    icon: <Coins size={16} aria-hidden />,
    title: "E2W token",
    body: "The single ecosystem token, launching on pump.fun. It is the only token this application tracks live market data for.",
  },
  {
    icon: <Users size={16} aria-hidden />,
    title: "Social recipients",
    body: "X, TikTok, Instagram, Twitch and Reddit handles that identify who a token's creator fees are intended for.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <div className="relative isolate">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="grid-backdrop absolute inset-x-0 top-0 h-80" />
        </div>

        <div className="container-page pt-12 pb-4 md:pt-16">
          <header className="max-w-2xl">
            <Badge tone="brand">
              <Radio size={11} aria-hidden />
              Fee infrastructure
            </Badge>
            <h1 className="mt-5 text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] md:text-[44px]">
              How Earn2Win works
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-fg-secondary md:text-[17px]">
              Trading activity produces creator fees. Earn2Win is the layer that ties
              those fees to a social identity instead of an anonymous address.
            </p>
          </header>

          <div className="mt-10">
            <FlowDiagram
              steps={[
                { label: "Token trades", hint: "Community volume", icon: <Coins size={14} /> },
                { label: "Creator fees", hint: "Fee share accrues", icon: <Receipt size={14} /> },
                { label: "Earn2Win", hint: "Routing layer", icon: <Radio size={14} />, accent: true },
                { label: "Creator", hint: "Social recipient", icon: <Users size={14} /> },
              ]}
            />
          </div>
        </div>
      </div>

      <Section>
        <HowItWorks />
      </Section>

      <Section divided>
        <SectionHeading
          eyebrow="Product hierarchy"
          title="Company, token, recipients"
          description="Earn2Win is the product. E2W is its ecosystem token. The social platforms are destinations — not partners."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {LAYERS.map((layer, index) => (
            <Card key={layer.title} interactive className="p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl border border-line bg-white/[0.04] text-brand">
                  {layer.icon}
                </span>
                <span className="font-mono text-[12px] text-fg-muted">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-[17px] font-semibold">{layer.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-fg-secondary">
                {layer.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section divided>
        <SectionHeading
          eyebrow="Recipients"
          title="Five supported destinations"
          description="Each platform writes handles differently, and Earn2Win renders them the way the platform does."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((platform) => (
            <SocialRecipientCard
              key={platform.id}
              platform={platform.id}
              handle={platform.placeholder === "channel" ? "creator" : "creator"}
              showArrow={false}
            />
          ))}

          <Card className="flex flex-col justify-center gap-3 p-5">
            <div className="flex items-center gap-2">
              {PLATFORMS.map((platform) => (
                <span
                  key={platform.id}
                  className="flex size-7 items-center justify-center rounded-lg border border-line bg-white/[0.04] text-fg-secondary"
                >
                  <PlatformIcon platform={platform.id} size={12} />
                </span>
              ))}
            </div>
            <p className="text-[12.5px] leading-relaxed text-fg-muted">
              {LEGAL.handles}
            </p>
          </Card>
        </div>
      </Section>

      <Section divided>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Current status"
              title="What is live in this release"
              description="Being precise about this matters more than looking finished."
            />

            <ul className="mt-8 space-y-3.5">
              {[
                {
                  live: true,
                  text: "Live market data for the configured E2W mint, from public market APIs.",
                },
                {
                  live: true,
                  text: "Recipient configuration across all five supported platforms.",
                },
                {
                  live: false,
                  text: "Token creation — the create flow is a demo and broadcasts nothing.",
                },
                {
                  live: false,
                  text: "Fee payouts — no wallet, no signing, no funds move anywhere.",
                },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={
                      item.live
                        ? "mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                        : "mt-1.5 size-2 shrink-0 rounded-full border border-line-strong"
                    }
                  />
                  <span className="text-[14.5px] leading-relaxed text-fg-secondary">
                    {item.text}
                    <span className="sr-only">
                      {item.live ? " (live)" : " (not live)"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-6 sm:p-7">
            <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-white/[0.04] text-brand">
              <ShieldCheck size={18} aria-hidden />
            </span>
            <h3 className="mt-5 text-[17px] font-semibold">No false confirmations</h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-fg-secondary">
              This build never shows a transaction signature, a settled payment or a
              minted contract, because none of those exist yet. Demo surfaces are
              labelled, and real market figures only appear when a real mint is
              configured.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">
                <SiSolana size={10} aria-hidden />
                Solana
              </Badge>
              <Badge tone="neutral">pump.fun</Badge>
              <Badge tone="warn">Demo flows labelled</Badge>
            </div>
          </Card>
        </div>
      </Section>

      <Section divided>
        <div className="flex flex-col items-start justify-between gap-6 rounded-card border border-line bg-surface-2 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-[20px] font-semibold md:text-[24px]">
              Ready to try the create flow?
            </h2>
            <p className="mt-2 text-[14.5px] text-fg-secondary">
              It takes about a minute, and nothing leaves your browser.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/create" size="md">
              Create Token
              <ArrowRight size={15} aria-hidden />
            </ButtonLink>
            <Link
              href="/token"
              className="press inline-flex h-11 items-center justify-center rounded-xl border border-line px-5 text-sm text-fg-secondary hover:border-line-strong hover:text-fg"
            >
              Explore E2W
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
