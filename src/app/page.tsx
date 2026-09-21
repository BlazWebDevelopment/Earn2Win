import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { RecipientPicker } from "@/components/RecipientPicker";
import { Stats } from "@/components/Stats";
import { TokenCard } from "@/components/TokenCard";
import { Section, SectionHeading } from "@/components/ui/primitives";

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section id="choose">
        <SectionHeading
          eyebrow="Recipient"
          title="Choose where the fees go"
          description="Pick the platform that represents the creator, then enter the handle. The recipient preview updates as you type."
        />
        <div className="mt-10">
          <RecipientPicker />
        </div>
      </Section>

      <Section divided>
        <Stats />
      </Section>

      <Section id="token" divided>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-center lg:gap-16">
          <div>
            <p className="mb-3 text-[11px] font-medium tracking-[0.16em] text-brand uppercase">
              Ecosystem
            </p>
            <h2 className="text-[26px] leading-[1.15] font-semibold md:text-[34px]">
              Earn2Win Token
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-fg-secondary">
              E2W is the single ecosystem token for Earn2Win. It is the only token this
              application tracks live market data for — every other token in the product
              is something you create.
            </p>
            <Link
              href="/token"
              className="press mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-brand hover:text-brand-strong"
            >
              Open the E2W market page
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>

          <TokenCard />
        </div>
      </Section>

      <Section id="how-it-works" divided>
        <SectionHeading
          eyebrow="How it works"
          title="Four steps from idea to routed fees"
          description="Earn2Win sits between market activity and the social identity you want the fees associated with."
          action={
            <Link
              href="/create"
              className="press inline-flex items-center gap-1.5 text-[14px] font-medium text-brand hover:text-brand-strong"
            >
              Start creating
              <ArrowRight size={15} aria-hidden />
            </Link>
          }
        />
        <HowItWorks className="mt-10" />
      </Section>

      {/* Closing CTA */}
      <Section divided>
        <div className="relative isolate overflow-hidden rounded-card border border-line bg-surface-2 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          >
            <div className="absolute top-[-10rem] left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-brand/[0.08] blur-[100px]" />
          </div>
          <h2 className="mx-auto max-w-xl text-[26px] leading-[1.15] font-semibold md:text-[34px]">
            Launch a token that credits the creator behind it.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-fg-secondary">
            Configure the token, pick the platform, and enter the handle. The create
            flow in this release is a demo and submits nothing on-chain.
          </p>
          <Link
            href="/create"
            className="press mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-[#04140B] hover:bg-brand-strong"
          >
            Create Token
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </Section>
    </>
  );
}
