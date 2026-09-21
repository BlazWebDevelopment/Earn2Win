import type { Metadata } from "next";

import { CreateTokenForm } from "@/components/CreateTokenForm";
import { Badge } from "@/components/ui/primitives";
import { LEGAL } from "@/config/site";

export const metadata: Metadata = {
  title: "Create",
  description:
    "Launch a social-first token and choose who its creator fees support. Demo flow — no transaction is submitted.",
  alternates: { canonical: "/create" },
};

export default function CreatePage() {
  return (
    <div className="relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-backdrop absolute inset-x-0 top-0 h-80" />
      </div>

      <div className="container-page pt-12 pb-20 md:pt-16 md:pb-28">
        <header className="max-w-2xl">
          <Badge tone="warn">Demo environment</Badge>
          <h1 className="mt-5 text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] md:text-[44px]">
            Create with Earn2Win
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-fg-secondary md:text-[17px]">
            Launch a social-first token and choose who its creator fees support.
          </p>
        </header>

        <div className="mt-12 md:mt-14">
          <CreateTokenForm />
        </div>

        <p className="mt-14 max-w-3xl text-xs leading-relaxed text-fg-muted">
          {LEGAL.handles} {LEGAL.affiliation}
        </p>
      </div>
    </div>
  );
}
