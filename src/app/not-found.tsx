import { ArrowLeft } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-backdrop absolute inset-x-0 top-0 h-80" />
      </div>

      <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="mt-4 text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] md:text-[44px]">
          This page isn&apos;t routed.
        </h1>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-fg-secondary">
          The link may be out of date. Everything in Earn2Win is reachable from the
          homepage.
        </p>
        <ButtonLink href="/" size="lg" variant="secondary" className="mt-8">
          <ArrowLeft size={16} aria-hidden />
          Back to Earn2Win
        </ButtonLink>
      </div>
    </div>
  );
}
